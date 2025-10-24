# Twilio Phone Number Setup

Your Twilio Phone Number: **PN...** (from your Twilio console)
Your Twilio Account SID: **AC...** (from your Twilio console)

## Quick Setup Steps

### 1. Find Your Phone Number

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. Look for phone number with SID: `PN24c4e17c80c27c90da28f9899965b799`
3. Click on it to configure

### 2. Configure Voice Webhook

Once you have your server deployed (see options below), configure:

1. Scroll to **Voice Configuration** section
2. Under "A CALL COMES IN":
   - **Webhook URL**: `https://your-deployed-url.com/incoming-call`
   - **HTTP Method**: `POST`
3. Click **Save**

---

## Deployment Options

### Option A: Test Locally with ngrok (Quick Test)

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **In another terminal, start ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

4. **Set Twilio webhook to:**
   ```
   https://abc123.ngrok.io/incoming-call
   ```

5. **Call your Twilio number to test!**

Note: ngrok URLs change every restart - use for testing only.

---

### Option B: Deploy to Railway (Recommended for Production)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial voice agent setup"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Railway:**
   - Go to https://railway.app
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects and deploys

3. **Add Environment Variables in Railway:**
   - Click on your service
   - Go to "Variables" tab
   - Add:
     ```
     OPENAI_API_KEY=sk-proj-... (your key)
     OPENAI_PROMPT_ID=pmpt_... (your prompt ID)
     OPENAI_PROMPT_VERSION=3
     TWILIO_ACCOUNT_SID=AC... (your Twilio SID)
     PORT=3000
     ```

4. **Generate Public Domain:**
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Copy URL (e.g., `https://your-app.railway.app`)

5. **Set Twilio webhook to:**
   ```
   https://your-app.railway.app/incoming-call
   ```

6. **Verify deployment:**
   ```
   https://your-app.railway.app/health
   ```

---

### Option C: Deploy to Render

1. **Push code to GitHub** (same as Railway step 1)

2. **Deploy to Render:**
   - Go to https://render.com
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Settings:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

3. **Add Environment Variables:**
   Same as Railway (step 3 above)

4. **Copy your Render URL** (e.g., `https://your-app.onrender.com`)

5. **Set Twilio webhook to:**
   ```
   https://your-app.onrender.com/incoming-call
   ```

---

## Testing Your Setup

### 1. Check Health Endpoint

Visit: `https://your-url.com/health`

Should return:
```json
{
  "status": "ok",
  "activeSessions": 0,
  "timestamp": "2025-10-23T..."
}
```

### 2. Make a Test Call

Call your Twilio number directly - you should be connected to the AI agent!

### 3. Check Logs

**Local (npm run dev):**
- Watch terminal output

**Railway:**
- Dashboard → Your service → "Deployments" tab → View logs

**Render:**
- Dashboard → Your service → "Logs" tab

---

## What Your Twilio Number Is

You need to find the actual phone number associated with `PN24c4e17c80c27c90da28f9899965b799`.

To find it:
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. Look through your active numbers
3. Click on the one with SID matching `PN24c4e17c80c27c90da28f9899965b799`
4. The phone number will be at the top (e.g., +1 555 123 4567)

**This is the number customers will forward their calls to!**

---

## Customer Instructions

Once set up, give customers these instructions:

### For Mobile Phones:

**Forward all calls:**
- AT&T/Verizon: Dial `*72` + [Your Twilio Number]
- T-Mobile: Dial `**21*` + [Your Twilio Number] + `#`

**Cancel forwarding:**
- AT&T/Verizon: Dial `*73`
- T-Mobile: Dial `##21#`

### For Business Lines:

Have customer contact their phone provider and request call forwarding to your Twilio number.

---

## Troubleshooting

### "Webhook fails"
- Verify URL is correct (must be https://)
- Check server is running (visit /health)
- Review Twilio debugger: https://console.twilio.com/us1/monitor/debugger

### "No audio"
- Check server logs for WebSocket errors
- Verify OpenAI API key is working
- Test by calling Twilio number directly first

### "AI doesn't respond"
- Verify prompt ID is correct
- Check OpenAI account has credits
- Review server logs for OpenAI connection errors

---

## Next Steps

1. ✅ Environment configured (`.env` file created)
2. ✅ Dependencies installed
3. ✅ Build successful
4. ⏳ Deploy to hosting platform (Railway/Render/ngrok)
5. ⏳ Configure Twilio webhook
6. ⏳ Test by calling Twilio number
7. ⏳ Set up customer call forwarding

---

## Quick Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check if it's working
curl https://your-url.com/health
```
