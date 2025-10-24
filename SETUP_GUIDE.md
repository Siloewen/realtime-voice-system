# Setup Guide - Step by Step

This guide will walk you through setting up your real-time voice agent from scratch.

## What You'll Need

- [ ] OpenAI API key with Realtime API access
- [ ] Twilio account (free trial works!)
- [ ] A hosting platform account (Railway recommended)
- [ ] 15 minutes of setup time

---

## Step 1: Get Your OpenAI Credentials

### 1.1 Get API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it "RealTime Voice Agent"
4. Copy the key (starts with `sk-proj-...`)
5. **Save it somewhere safe - you can't see it again!**

### 1.2 Verify Your Prompt ID

You mentioned: `pmpt_68fad42becb88197b9605b71d62cd283079d3fe37e7c825a`

To verify this is correct:
1. Go to https://platform.openai.com/prompts
2. Find your prompt
3. Confirm the ID matches
4. Note the version number (default is 3)

---

## Step 2: Deploy to Railway (Easiest Option)

### 2.1 Sign Up for Railway

1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. Verify your email

### 2.2 Deploy Your Project

1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. If first time: Connect your GitHub account
4. Select this repository
5. Railway will auto-detect it's a Node.js project

### 2.3 Add Environment Variables

In Railway dashboard:

1. Click on your service
2. Go to "Variables" tab
3. Add these variables:

```
OPENAI_API_KEY = sk-proj-... (your key from Step 1.1)
OPENAI_PROMPT_ID = pmpt_68fad42becb88197b9605b71d62cd283079d3fe37e7c825a
OPENAI_PROMPT_VERSION = 3
PORT = 3000
```

4. Click "Deploy" to apply changes

### 2.4 Get Your Public URL

1. Go to "Settings" tab
2. Scroll to "Networking"
3. Click "Generate Domain"
4. Copy your URL (e.g., `https://your-app.railway.app`)
5. **Save this URL - you'll need it for Twilio!**

### 2.5 Verify Deployment

Visit: `https://your-app.railway.app/health`

Should see:
```json
{
  "status": "ok",
  "activeSessions": 0,
  "timestamp": "..."
}
```

✅ **Server is live!**

---

## Step 3: Set Up Twilio

### 3.1 Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up (free trial gets you started)
3. Verify your phone number

### 3.2 Get a Phone Number

1. In Twilio Console, go to **Phone Numbers** → **Buy a Number**
2. Choose your country
3. Select "Voice" capability
4. Click "Buy" (free trial gives you credits)
5. **Save this number - customers will forward to this!**

### 3.3 Configure Webhook

1. Click on your new phone number
2. Scroll to "Voice Configuration"
3. Under "A CALL COMES IN":
   - Select **Webhook**
   - Enter: `https://your-app.railway.app/incoming-call`
   - HTTP Method: **POST**
4. Click "Save"

### 3.4 Test It!

Call your Twilio number from your phone - you should hear your AI agent!

---

## Step 4: Set Up Call Forwarding for Customers

Now customers can forward their business line to your Twilio number.

### Option A: Mobile Carriers (Most Common)

**AT&T:**
- Dial `*72` + your Twilio number
- To cancel: Dial `*73`

**Verizon:**
- Dial `*72` + your Twilio number
- To cancel: Dial `*73`

**T-Mobile:**
- Dial `**21*` + your Twilio number + `#`
- To cancel: Dial `##21#`

### Option B: Business Phone Systems

**RingCentral:**
1. Admin Portal → Call Handling
2. Set up forwarding rule
3. Forward to your Twilio number

**Vonage:**
1. Online dashboard → Call Routing
2. Add forwarding rule
3. Forward to your Twilio number

**Google Voice:**
1. Settings → Calls
2. Call Forwarding → Add number
3. Enter your Twilio number

### Option C: Landlines

Call your phone provider and request:
- **Conditional forwarding**: Forward when busy/no answer
- **Unconditional forwarding**: Forward all calls
- Provide your Twilio number

---

## Step 5: Testing Everything

### 5.1 Complete Test Flow

1. **Set up forwarding** from a test phone to your Twilio number
2. **Call the test phone** from another device
3. **Verify** you're connected to the AI agent
4. **Have a conversation** - test the quality
5. **Check logs** in Railway dashboard

### 5.2 Monitor Performance

**Railway Dashboard:**
- Check "Deployments" for errors
- View "Metrics" for usage
- Monitor "Logs" for debugging

**Twilio Dashboard:**
- Go to Monitor → Logs → Calls
- Check call quality metrics
- Review any errors

---

## Step 6: Production Checklist

Before launching to customers:

- [ ] Test calls from multiple phones
- [ ] Verify audio quality is good
- [ ] Confirm AI responses are appropriate
- [ ] Set up Twilio spending alerts
- [ ] Set up OpenAI spending alerts
- [ ] Document customer setup instructions
- [ ] Test call forwarding from customer's carrier
- [ ] Have backup support plan

---

## Troubleshooting

### "Call connects but no audio"

1. Check Railway logs for WebSocket errors
2. Verify OpenAI API key is valid
3. Check network/firewall isn't blocking WebSockets

### "Webhook fails"

1. Verify URL is correct in Twilio
2. Must be `https://` (not `http://`)
3. Check Railway deployment is running
4. Test health endpoint: `/health`

### "AI doesn't respond"

1. Check OpenAI prompt ID is correct
2. Verify you have Realtime API access
3. Check OpenAI account has credits
4. Review Railway logs for errors

### "Call forwarding doesn't work"

1. Verify Twilio number is correct
2. Test by calling Twilio number directly
3. Check carrier forwarding is enabled
4. Try different forwarding method

---

## Next Steps

### Customize Your Agent

Edit the prompt in OpenAI Platform to change:
- Greeting message
- Personality and tone
- Knowledge base
- Response style

### Add Features

Consider adding:
- Call recording
- Analytics dashboard
- Multiple languages
- Custom routing
- CRM integration

### Scale Up

For high volume:
- Upgrade Railway plan
- Add load balancing
- Implement caching
- Monitor performance

---

## Cost Breakdown

**Monthly Costs (estimated for 100 calls, 5 min avg):**

- Railway hosting: $5-20
- Twilio phone number: $1
- Twilio incoming minutes: $4.25 (500 min × $0.0085)
- OpenAI Realtime API: $150-200 (500 min × $0.30-0.40)

**Total: ~$160-225/month**

**Per call cost: ~$1.60-2.25**

---

## Support Resources

- **Twilio Support**: https://support.twilio.com
- **OpenAI Support**: https://help.openai.com
- **Railway Docs**: https://docs.railway.app

---

## What You've Built

🎉 You now have a production-ready voice agent that:

✅ Accepts calls forwarded from any business line
✅ Uses OpenAI's Realtime API for natural conversations
✅ Handles audio conversion automatically
✅ Scales with your needs
✅ Costs less than traditional phone systems

**Customers can now forward their business line to your Twilio number and have an AI agent answer their calls!**
