const fs = require("fs");
const path = require("path");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("content-type", "text/plain");
    return res.end("Method not allowed");
  }

  try {
    const htmlPath = path.join(process.cwd(), "public", "index.html");
    const html = fs.readFileSync(htmlPath, "utf-8");
    res.statusCode = 200;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end(html);
  } catch (err) {
    console.error("Error serving index.html:", err);
    res.statusCode = 404;
    res.setHeader("content-type", "text/plain");
    res.end("Not found");
  }
};
