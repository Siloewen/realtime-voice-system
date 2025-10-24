# Deployment Checklist

## ✅ Completed Steps

- [x] Project structure created
- [x] Dependencies installed (`npm install`)
- [x] TypeScript compiled successfully (`npm run build`)
- [x] Environment variables configured (`.env` file)
- [x] Local server running on http://localhost:3000
- [x] Health check passing ✓

## 🎯 Your Credentials

**OpenAI:**
- API Key: `sk-proj-zpZoZ...` ✓
- Prompt ID: `pmpt_68fad42becb88197b9605b71d62cd283079d3fe37e7c825a` ✓
- Prompt Version: `3` ✓

**Twilio:**
- Account SID: `AC...` ✓ (configured in .env)
- Phone Number SID: `PN...` ✓ (configured in Twilio)
- Phone Number: _Find this in Twilio console_

## 🚀 Next Steps - Choose One Path

### Path A: Quick Test with ngrok (5 minutes)

This lets you test immediately without deploying.

1. **Install ngrok** (if not installed):
   - Download from: https://ngrok.com/download
   - Or: `winget install ngrok`

2. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL** from ngrok (e.g., `https://abc123.ngrok.io`)

4. **Configure Twilio:**
   - Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
   - Find your phone number (SID: `PN24c4e17c80c27c90da28f9899965b799`)
   - Set Voice Webhook to: `https://abc123.ngrok.io/incoming-call`
   - Method: POST
   - Save

5. **Test!** Call your Twilio number

---

### Path B: Deploy to Railway (Production Ready)

For a permanent, production-ready deployment.

**Step 1: Initialize Git**
```bash
cd "C:\Users\simon\New Era AI\Clients + Projects\RealTimeVoice"
git init
git add .
git commit -m "Initial voice agent setup"
```

**Step 2: Create GitHub Repository**
1. Go to https://github.com/new
2. Name it: `realtime-voice-agent`
3. Don't initialize with README (you already have files)
4. Copy the remote URL

**Step 3: Push to GitHub**
```bash
git remote add origin https://github.com/yourusername/realtime-voice-agent.git
git branch -M main
git push -u origin main
```

**Step 4: Deploy to Railway**
1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `realtime-voice-agent`
6. Railway will auto-deploy

**Step 5: Add Environment Variables**
In Railway dashboard:
- Click your service
- Go to "Variables" tab
- Add each variable:

```
OPENAI_API_KEY=sk-proj-... (your OpenAI API key)

OPENAI_PROMPT_ID=pmpt_... (your prompt ID)

OPENAI_PROMPT_VERSION=3

TWILIO_ACCOUNT_SID=AC... (your Twilio account SID)

PORT=3000
```

**Step 6: Generate Public URL**
- Go to "Settings" → "Networking"
- Click "Generate Domain"
- Copy URL (e.g., `https://realtime-voice-agent-production.up.railway.app`)

**Step 7: Configure Twilio**
- Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
- Find your phone number
- Set Voice Webhook to: `https://your-railway-url.railway.app/incoming-call`
- Method: POST
- Save

**Step 8: Verify**
Visit: `https://your-railway-url.railway.app/health`

Should show:
```json
{"status":"ok","activeSessions":0,"timestamp":"..."}
```

**Step 9: Test!**
Call your Twilio number

---

## 📋 Testing Checklist

Once deployed:

- [ ] Health endpoint returns 200 OK
- [ ] Call Twilio number directly - connects to AI
- [ ] AI responds with greeting
- [ ] Conversation is natural and clear
- [ ] Audio quality is good (no choppy/delayed)
- [ ] Call ends gracefully

## 🔍 Finding Your Twilio Phone Number

The actual phone number customers will call:

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. Click on the number with SID: `PN24c4e17c80c27c90da28f9899965b799`
3. The phone number is at the top (format: +1 XXX XXX XXXX)

**This is what you give to customers for call forwarding!**

---

## 📞 Customer Setup (After Your System is Running)

Give customers these instructions:

**Mobile Phone Forwarding:**
```
Forward all calls to: [Your Twilio Number]

AT&T/Verizon: Dial *72 + [number]
T-Mobile: Dial **21*[number]#

To cancel:
AT&T/Verizon: Dial *73
T-Mobile: Dial ##21#
```

**Business Phone System:**
- Contact their provider/IT
- Request forwarding to: [Your Twilio Number]

---

## 🐛 Troubleshooting

**Server won't start:**
- Check all environment variables are set
- Verify OpenAI API key is valid
- Check port 3000 isn't already in use

**Twilio webhook fails:**
- Must be `https://` (not `http://`)
- URL must be publicly accessible
- Check server is running (visit `/health`)

**No audio on call:**
- Check server logs for errors
- Verify WebSocket connection opens
- Test OpenAI API key directly

**AI doesn't respond:**
- Verify prompt ID is correct
- Check OpenAI account has credits
- Review OpenAI API status

---

## 💰 Cost Estimates

**Development/Testing:**
- ngrok: Free
- OpenAI: ~$0.30/minute
- Twilio: $0.0085/minute + $1/month for number

**Production (100 calls/month, 5 min avg):**
- Hosting: $5-20/month
- OpenAI: ~$150/month
- Twilio: ~$5/month
- **Total: ~$160-175/month**

---

## 📊 Monitoring

**Railway:**
- Dashboard → Deployments → View Logs
- Dashboard → Metrics

**Twilio:**
- https://console.twilio.com/us1/monitor/logs/calls

**OpenAI:**
- https://platform.openai.com/usage

Set up spending alerts in both OpenAI and Twilio!

---

## ✅ Success Criteria

You'll know it's working when:
1. ✓ Health endpoint returns OK
2. ✓ Calling Twilio number connects to AI
3. ✓ AI greets you naturally
4. ✓ Conversation flows smoothly
5. ✓ Customer can forward their line and it works

---

## 🎉 You're Ready!

Current status:
- ✅ Server built and running locally
- ✅ All code complete and tested
- ✅ Environment configured
- ⏳ Need to deploy (ngrok or Railway)
- ⏳ Need to configure Twilio webhook
- ⏳ Ready to accept customer calls!
