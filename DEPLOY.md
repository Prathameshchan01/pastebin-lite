# Quick Deployment Checklist

## Before Deploying

✅ All code is committed and pushed to GitHub

## Vercel Setup

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Find your Pastebin-Lite repo
   - Click "Import"

3. **Set Environment Variables** (IMPORTANT - NO QUOTES!)
   
   In Vercel → Your Project → Settings → Environment Variables, add:
   
   - **Name:** `UPSTASH_REDIS_REST_URL`  
     **Value:** `https://special-perch-15055.upstash.io`  
     (NO quotes around the value)
   
   - **Name:** `UPSTASH_REDIS_REST_TOKEN`  
     **Value:** `ATrPAAIncDE4ZTY5N2VjY2U2NjI0OGY2YjMzMjY2Y2E0MTk1MjNiNXAxMTUwNTU`  
     (NO quotes around the value)
   
   - **Name:** `TEST_MODE`  
     **Value:** `1`  
     (NO quotes)

4. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes for build

## After Deploy - Test These URLs

- **Root UI:** `https://your-project.vercel.app/`  
  Should show the create-paste form

- **Health Check:** `https://your-project.vercel.app/api/healthz`  
  Should return: `{"ok": true}`

- **Create Paste:** Use the UI or POST to `/api/pastes`

- **View Paste:** `https://your-project.vercel.app/p/<paste-id>`

## If Health Check Returns `{"ok": false}`

1. Check environment variables have NO quotes
2. Verify Upstash credentials are correct
3. Redeploy after fixing env vars

## If Root Shows "Not Found"

1. Check that `api/index.js` exists
2. Check `vercel.json` has the root rewrite
3. Redeploy
