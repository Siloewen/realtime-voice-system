# Quick Start Guide

## 🎯 Your System is Ready!

✅ **Server Status**: Running on http://localhost:3000
✅ **Health Check**: http://localhost:3000/health is responding
✅ **Build**: Compiled successfully
✅ **Credentials**: Configured in `.env`

---

## 🚀 Two Options to Get Live

### Option 1: Test NOW with ngrok (5 min)

Use this for immediate testing - perfect for verifying everything works!

```bash
# 1. Install ngrok (if needed)
winget install ngrok
# or download from: https://ngrok.com/download

# 2. Start ngrok (keep the dev server running in other terminal)
ngrok http 3000

# 3. Copy the https:// URL (e.g., https://abc123.ngrok.io)

# 4. Go to Twilio console:
https://console.twilio.com/us1/develop/phone-numbers/manage/incoming

# 5. Find your number (SID: PN24c4e17c80c27c90da28f9899965b799)

# 6. Set webhook to:
https://your-ngrok-url.ngrok.io/incoming-call
Method: POST

# 7. CALL YOUR TWILIO NUMBER!
```

---

### Option 2: Deploy to Railway (Production)

Use this for permanent, always-on deployment.

```bash
# 1. Create GitHub repo and push code
cd "C:\Users\simon\New Era AI\Clients + Projects\RealTimeVoice"
git init
git add .
git commit -m "Initial setup"
# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/realtime-voice-agent.git
git push -u origin main

# 2. Go to Railway
https://railway.app

# 3. Sign in with GitHub → New Project → Deploy from GitHub

# 4. Select your repo → Auto-deploys

# 5. Add environment variables in Railway dashboard:
OPENAI_API_KEY=sk-proj-... (your key)
OPENAI_PROMPT_ID=pmpt_... (your prompt ID)
OPENAI_PROMPT_VERSION=3
TWILIO_ACCOUNT_SID=AC... (your Twilio SID)
PORT=3000

# 6. Generate domain in Railway Settings → Networking

# 7. Set Twilio webhook to your Railway URL
https://your-app.railway.app/incoming-call

# 8. CALL YOUR TWILIO NUMBER!
```

---

## 📱 Your Twilio Info

Find these in your Twilio console:
- **Account SID**: (find in Twilio dashboard)
- **Phone Number**: (find in Phone Numbers section)

**Find your actual phone number:**
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. Click on your phone number
3. Use this number for customer call forwarding

---

## 🧪 Testing

Once webhook is configured:

1. **Call your Twilio number**
2. You should hear the AI agent
3. Have a conversation!
4. Check logs to see it working

**View logs:**
- **Local**: Watch terminal where `npm run dev` is running
- **Railway**: Dashboard → Your service → Logs

---

## 👥 Customer Setup

Once working, customers forward their line to your Twilio number:

**Mobile forwarding:**
- AT&T/Verizon: `*72` + [your Twilio number]
- T-Mobile: `**21*` + [your Twilio number] + `#`

**Business lines:**
- Contact their provider to set up forwarding

---

## 🆘 Need Help?

**Server not starting?**
```bash
# Check if something is using port 3000
netstat -ano | findstr :3000

# Try a different port
# Edit .env: PORT=3001
npm run dev
```

**Webhook failing?**
- URL must be `https://` not `http://`
- Check server is running (visit `/health`)
- Review Twilio debugger for errors

**No audio?**
- Check server logs for WebSocket errors
- Verify OpenAI API key is valid
- Test by calling Twilio number directly

---

## 📚 More Info

- **Full Setup**: See `SETUP_GUIDE.md`
- **Deployment Details**: See `DEPLOYMENT_CHECKLIST.md`
- **Twilio Config**: See `TWILIO_SETUP.md`
- **Technical Docs**: See `README.md`

---

## ✅ Success Checklist

- [ ] Dev server running (`npm run dev`)
- [ ] ngrok running OR Railway deployed
- [ ] Twilio webhook configured
- [ ] Called Twilio number - AI answers!
- [ ] Conversation works smoothly
- [ ] Ready for customer forwarding

**You're almost there! Just need to expose the server and configure the webhook!**
