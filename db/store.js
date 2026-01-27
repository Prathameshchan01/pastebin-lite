const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const crypto = require("crypto");

const dbPath = path.join(__dirname, "pastes.db");
const db = new sqlite3.Database(dbPath);

// Create table once
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS pastes (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      created_at INTEGER,
      expires_at INTEGER,
      max_views INTEGER,
      views_used INTEGER
    )
  `);
});

function getNow(req) {
  if (process.env.TEST_MODE === "1") {
    const t = req?.headers?.["x-test-now-ms"];
    if (t) return Number(t);
  }
  return Date.now();
}

function generateId() {
  return crypto.randomBytes(6).toString("hex");
}

function createPaste({ content, ttl_seconds, max_views }, req) {
  return new Promise((resolve, reject) => {
    const id = generateId();
    // For deterministic TTL testing, respect x-test-now-ms when TEST_MODE=1.
    const now = getNow(req);
    const expires_at = ttl_seconds ? now + ttl_seconds * 1000 : null;

    db.run(
      `INSERT INTO pastes VALUES (?, ?, ?, ?, ?, ?)`,
      [id, content, now, expires_at, max_views ?? null, 0],
      err => {
        if (err) return reject(err);
        resolve({
          id,
          content,
          created_at: now,
          expires_at,
          max_views: max_views ?? null,
          views_used: 0
        });
      }
    );
  });
}

function getPaste(id, req) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM pastes WHERE id = ?`, [id], (err, paste) => {
      if (err || !paste) return resolve(null);

      const now = getNow(req);

      if (paste.expires_at && now > paste.expires_at) {
        db.run(`DELETE FROM pastes WHERE id = ?`, [id]);
        return resolve(null);
      }

      // Atomically consume a view (prevents over-serving under concurrency).
      db.run(
        `UPDATE pastes
         SET views_used = views_used + 1
         WHERE id = ?
           AND (max_views IS NULL OR views_used < max_views)`,
        [id],
        function (err) {
          if (err) return reject(err);

          if (this.changes === 0) {
            db.run(`DELETE FROM pastes WHERE id = ?`, [id]);
            return resolve(null);
          }

          paste.views_used += 1;
          resolve(paste);
        }
      );
    });
  });
}

function pingDb() {
  return new Promise(resolve => {
    db.get(`SELECT 1 AS ok`, [], err => resolve(!err));
  });
}

module.exports = { createPaste, getPaste, pingDb };
