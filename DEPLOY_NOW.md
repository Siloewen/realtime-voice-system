# Deploy to Railway NOW - Simple Steps

Since local tunneling is having issues, let's deploy directly to Railway for a permanent solution!

## Step 1: Initialize Git (if not already done)

```bash
cd "C:\Users\simon\New Era AI\Clients + Projects\RealTimeVoice"
git init
git add .
git commit -m "Initial voice agent setup"
```

## Step 2: Push to GitHub

### Option A: Create Repo via GitHub CLI (Fastest)

If you have GitHub CLI installed:
```bash
gh repo create realtime-voice-agent --public --source=. --remote=origin --push
```

### Option B: Create Repo Manually

1. Go to: https://github.com/new
2. Repository name: `realtime-voice-agent`
3. **Don't** initialize with README (you already have files)
4. Click "Create repository"
5. Copy the commands shown, or run:

```bash
git remote add origin https://github.com/YOUR-USERNAME/realtime-voice-agent.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Railway

1. **Go to Railway**: https://railway.app

2. **Sign in** with GitHub

3. **New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `realtime-voice-agent`
   - Click "Deploy Now"

4. **Wait for deployment** (takes ~2 minutes)

## Step 4: Add Environment Variables

In Railway dashboard:

1. Click on your service (the box that says "realtime-voice-agent")

2. Go to **"Variables"** tab

3. Click **"New Variable"** and add each one:

```
OPENAI_API_KEY
sk-proj-... (paste your OpenAI API key here)
```

```
OPENAI_PROMPT_ID
pmpt_... (paste your prompt ID here)
```

```
OPENAI_PROMPT_VERSION
3
```

```
TWILIO_ACCOUNT_SID
AC... (paste your Twilio account SID here)
```

```
PORT
3000
```

4. Click **"Deploy"** to apply the changes

## Step 5: Get Your Public URL

1. Go to **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. Copy the URL (e.g., `https://realtime-voice-agent-production.up.railway.app`)

## Step 6: Verify Deployment

Visit: `https://your-railway-url.railway.app/health`

Should return:
```json
{"status":"ok","activeSessions":0,"timestamp":"..."}
```

✅ If you see this, your server is LIVE!

## Step 7: Configure Twilio

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/active

2. Click on: **(236) 704-7111**

3. Scroll to **"Voice Configuration"**

4. Under **"A call comes in"**:
   - Change URL to: `https://your-railway-url.railway.app/incoming-call`
   - Keep HTTP Method: **POST**

5. Click **"Save configuration"**

## Step 8: TEST IT!

🎉 **Call (236) 704-7111 and talk to your AI agent!**

---

## Alternative: Use Render Instead

If you prefer Render over Railway:

1. Go to: https://render.com
2. New → Web Service
3. Connect your GitHub repo
4. Settings:
   - Build: `npm install && npm run build`
   - Start: `npm start`
5. Add same environment variables
6. Deploy
7. Copy your Render URL
8. Update Twilio webhook

---

## Troubleshooting

**Build fails:**
- Check environment variables are set correctly
- Review deployment logs

**Health check fails:**
- Wait 1-2 minutes for deployment
- Check logs for errors

**Twilio webhook error:**
- Verify URL is exactly: `https://your-url/incoming-call`
- Make sure it's HTTPS not HTTP
- Check Twilio debugger

---

## What You'll Have

After these steps:

✅ Production server running 24/7
✅ Permanent URL that never changes
✅ Your Twilio number connected
✅ Ready for customers to forward calls
✅ Automatic scaling as needed

**This is the better solution - no need for ngrok!**
