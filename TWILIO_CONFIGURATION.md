# Twilio Configuration - What to Change

## 📱 Your Phone Number

Check your Twilio console for your actual phone number - this is what customers will forward to!

## 🔧 Current Configuration

You currently have:
- **Voice webhook**: `https://api.vapi.ai/twilio/inbound_call` (VAPI)
- **Status webhook**: `https://api.vapi.ai/twilio/status` (VAPI)

## ✏️ What You Need to Change

### Step 1: Choose Your Deployment Method

Before changing Twilio, you need a public URL for your server:

**Option A: ngrok (for testing - 2 minutes)**
```bash
# In a new terminal (keep npm run dev running):
ngrok http 3000

# Copy the https:// URL (e.g., https://abc123.ngrok.io)
```

**Option B: Railway (for production - 15 minutes)**
- Deploy to Railway (see DEPLOYMENT_CHECKLIST.md)
- Get your Railway URL (e.g., https://your-app.railway.app)

### Step 2: Update Twilio Configuration

Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/active
Click on your Twilio phone number

#### Voice Configuration Section:

**Change "A call comes in" to:**
```
Webhook: https://YOUR-URL-HERE/incoming-call
HTTP Method: POST
```

Replace `YOUR-URL-HERE` with either:
- ngrok URL: `https://abc123.ngrok.io`
- Railway URL: `https://your-app.railway.app`

**Change "Call status changes" (optional but recommended):**
```
Leave blank or use: https://YOUR-URL-HERE/call-status
HTTP Method: POST
```

Click **"Save configuration"** at the bottom!

---

## 📋 Exact Steps in Twilio Console

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/active

2. Click on phone number: **(236) 704-7111**

3. Scroll to **"Voice Configuration"** section

4. Under **"A call comes in"**:
   - Keep: `Webhook` (already selected)
   - Change URL from:
     ```
     https://api.vapi.ai/twilio/inbound_call
     ```
     To:
     ```
     https://YOUR-DEPLOYED-URL/incoming-call
     ```
   - Keep: `HTTP POST` (already selected)

5. Under **"Primary handler fails"** (optional):
   - Clear the URL or leave as is

6. Under **"Call status changes"** (optional):
   - Can clear this or leave as is

7. Scroll down and click **"Save configuration"**

---

## 🧪 Testing Before You Change

1. **Make sure your server is running:**
   ```bash
   # Terminal 1: Your server
   npm run dev

   # Terminal 2: ngrok (if using ngrok)
   ngrok http 3000
   ```

2. **Verify health endpoint works:**
   - ngrok: Visit `https://your-ngrok-url.ngrok.io/health`
   - Railway: Visit `https://your-railway-url.railway.app/health`

   Should return:
   ```json
   {"status":"ok","activeSessions":0,"timestamp":"..."}
   ```

3. **Now safe to update Twilio!**

---

## ⚠️ Important Notes

### If using ngrok:
- URL changes every time you restart ngrok
- Need to update Twilio webhook each time
- **Only for testing!**

### If using Railway/Render:
- URL stays the same forever
- Set it once and forget it
- **Recommended for production**

---

## 🎯 Quick Test Flow

### Using ngrok (Fastest - Test Right Now):

```bash
# Terminal 1 (already running):
npm run dev
# ✓ Server running on port 3000

# Terminal 2 (new terminal):
ngrok http 3000
# ✓ Copy the https:// URL

# Browser:
# 1. Go to Twilio console
# 2. Update webhook to: https://abc123.ngrok.io/incoming-call
# 3. Save

# Phone:
# Call (236) 704-7111
# ✓ Should connect to your AI agent!
```

---

## 📞 What Happens After You Change It

**Before (current):**
```
Call → (236) 704-7111 → VAPI handles it
```

**After (your system):**
```
Call → (236) 704-7111 → Your Server → OpenAI Realtime API
```

---

## 🔄 Switching Back to VAPI (if needed)

If you ever need to switch back:

1. Go to Twilio console
2. Change webhook back to:
   ```
   https://api.vapi.ai/twilio/inbound_call
   ```
3. Save

---

## ✅ Verification Checklist

After updating Twilio:

- [ ] Server is running (npm run dev or Railway)
- [ ] Health endpoint returns OK
- [ ] Twilio webhook updated to your URL
- [ ] Twilio configuration saved
- [ ] Called (236) 704-7111
- [ ] AI agent answers!
- [ ] Can have a conversation
- [ ] Audio quality is good

---

## 🆘 Troubleshooting

**"Twilio shows webhook error":**
- Check URL is correct (https://)
- Verify server is running
- Visit `/health` to confirm server is up
- Check Twilio debugger for details

**"Call connects but no audio":**
- Check server logs for errors
- Verify WebSocket connection opens
- Check OpenAI API key is valid

**"AI doesn't respond":**
- Check OpenAI prompt ID is correct
- Verify OpenAI account has credits
- Review server logs for OpenAI errors

---

## 🎉 Next Steps After Testing

Once working with your number:

1. **For production**: Deploy to Railway (permanent URL)
2. **Document the phone number**: (236) 704-7111
3. **Give to customers**: They forward their lines to this
4. **Set up monitoring**: Watch Railway/Twilio logs
5. **Set spending alerts**: OpenAI and Twilio

---

## 💡 Customer Instructions

Once your system is working, customers do this:

**"Forward your business line to: [Your Twilio Number]"**

**Mobile phones:**
- AT&T/Verizon: Dial `*72` then [your number]
- T-Mobile: Dial `**21*[your number]#`

**Landlines/Business lines:**
- Call their provider
- Request forwarding to: [Your Twilio Number]

**When customer calls their original number:**
```
Customer dials: 555-1234 (their business line)
→ Forwards to: [Your Twilio Number]
→ Your server handles it with OpenAI
→ Customer talks to AI agent
```

Perfect! 🎯
