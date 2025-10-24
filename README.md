# RealTime Voice Agent

A production-ready voice agent system that bridges Twilio phone calls with OpenAI's Realtime API for high-quality conversational AI.

## 🎯 How It Works

```
Customer's Business Line → (Call Forward) → Twilio Number → Your Server → OpenAI Realtime API
```

1. Customer forwards their business line to your Twilio phone number
2. Twilio sends audio via WebSocket (Media Streams) to your server
3. Your server bridges the audio to OpenAI's Realtime API
4. OpenAI responds with conversational AI
5. Audio flows back through your server to the caller

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key with Realtime API access
- Twilio account (free trial works)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
OPENAI_API_KEY=sk-proj-...
OPENAI_PROMPT_ID=pmpt_68fad42becb88197b9605b71d62cd283079d3fe37e7c825a
OPENAI_PROMPT_VERSION=3
PORT=3000
```

### 3. Run Locally (Development)

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 4. Expose to Public Internet (Required for Twilio)

For local testing, use ngrok:

```bash
ngrok http 3000
```

Copy the `https://` URL (e.g., `https://abc123.ngrok.io`)

## 📱 Twilio Setup

### 1. Get a Twilio Phone Number

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to Phone Numbers → Buy a Number
3. Choose a number that supports Voice

### 2. Configure Webhook

1. Click on your phone number
2. Scroll to "Voice Configuration"
3. Set **A CALL COMES IN** to:
   - **Webhook**: `https://your-domain.com/incoming-call`
   - **HTTP Method**: POST
4. Save

### 3. Test the Connection

Call your Twilio number - you should be connected to your AI agent!

## 🏢 Production Deployment

### Option 1: Railway (Recommended - Easiest)

1. Sign up at [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Connect your repo
4. Add environment variables:
   - `OPENAI_API_KEY`
   - `OPENAI_PROMPT_ID`
   - `OPENAI_PROMPT_VERSION`
5. Railway will auto-deploy and give you a public URL

### Option 2: Render

1. Sign up at [Render.com](https://render.com)
2. New → Web Service
3. Connect your repo
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - Add environment variables
5. Deploy

### Option 3: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Set secrets
fly secrets set OPENAI_API_KEY=your_key
fly secrets set OPENAI_PROMPT_ID=your_prompt_id

# Deploy
fly deploy
```

## 🔧 Configuration

### OpenAI Prompt Configuration

Your prompt is identified by:
- `OPENAI_PROMPT_ID`: The prompt template ID from OpenAI
- `OPENAI_PROMPT_VERSION`: Version number of the prompt

To create/manage prompts:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to Prompts
3. Create or select your prompt
4. Copy the ID and version

### Audio Settings

The system handles all audio conversion automatically:
- **Twilio**: μ-law, 8kHz, mono
- **OpenAI**: PCM16, 24kHz, mono

No configuration needed!

### Voice Activity Detection (VAD)

Configured in `src/services/session-manager.ts:72-77`:

```typescript
turn_detection: {
  type: 'server_vad',
  threshold: 0.5,              // Lower = more sensitive
  prefix_padding_ms: 300,       // Audio before speech starts
  silence_duration_ms: 500,     // Silence before turn ends
}
```

## 📞 Customer Setup

Once deployed, your customers can use your service by:

1. **Option A: Direct Forward**
   - Call their phone provider
   - Set up call forwarding to your Twilio number
   - Example: AT&T, Verizon, etc.

2. **Option B: Business Phone System**
   - If they use a PBX (like RingCentral, Vonage)
   - Set up a forwarding rule in their dashboard
   - Forward to your Twilio number

3. **Option C: Conditional Forwarding**
   - Forward only when busy/no answer
   - Forward during specific hours
   - Forward specific callers

## 🔍 Testing & Debugging

### Check Server Status

```bash
curl https://your-domain.com/health
```

Response:
```json
{
  "status": "ok",
  "activeSessions": 0,
  "timestamp": "2025-10-23T12:00:00.000Z"
}
```

### Monitor Logs

Development:
```bash
npm run dev
```

Production (Railway/Render):
- View logs in their dashboard

### Common Issues

**"Cannot connect to OpenAI"**
- Check your `OPENAI_API_KEY` is valid
- Verify you have Realtime API access

**"Twilio webhook fails"**
- Ensure your server is publicly accessible (https)
- Check Twilio webhook URL is correct
- Verify POST method is used

**"No audio / choppy audio"**
- Check network latency
- Verify WebSocket connections are stable
- Review server logs for errors

## 💰 Cost Estimation

### OpenAI Realtime API
- ~$0.06 per minute of audio input
- ~$0.24 per minute of audio output
- Typical call: ~$0.30-0.50 per minute

### Twilio
- Phone number: ~$1/month
- Incoming calls: ~$0.0085/minute
- **No Twilio phone service fees since customers forward to you**

### Hosting
- Railway: Free tier available, ~$5-20/month for production
- Render: Free tier available, ~$7/month for production

**Example**: 100 calls/month × 5 min avg = **$150-250/month**

## 🛠️ Development

### Project Structure

```
src/
├── server.ts                 # Main Express server
├── types.ts                  # TypeScript type definitions
├── services/
│   ├── openai-service.ts    # OpenAI API client
│   └── session-manager.ts   # Call session management
└── utils/
    └── audio.ts             # Audio conversion utilities
```

### Adding Features

**Custom Greeting:**

Edit `src/services/openai-service.ts:27-32` to include custom instructions in the session creation.

**Call Recording:**

Add recording logic in `src/services/session-manager.ts` by capturing audio chunks.

**Analytics:**

Track call metrics in `SessionManager` and expose via new API endpoints.

## 📚 API Reference

### POST /incoming-call

Twilio webhook endpoint that returns TwiML to connect Media Stream.

### WebSocket /media-stream

WebSocket endpoint for Twilio Media Streams.

**Events received from Twilio:**
- `connected` - Stream connected
- `start` - Call started
- `media` - Audio chunk (μ-law, base64)
- `stop` - Call ended

**Events sent to Twilio:**
- `media` - Audio chunk (μ-law, base64)

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "activeSessions": 0,
  "timestamp": "2025-10-23T12:00:00.000Z"
}
```

## 🔐 Security Best Practices

1. **Never commit `.env`** - Already in `.gitignore`
2. **Use HTTPS in production** - Required for Twilio webhooks
3. **Validate Twilio requests** - Uncomment validation in production
4. **Rate limiting** - Add rate limiting for production
5. **Monitor costs** - Set up OpenAI/Twilio spending alerts

## 📄 License

MIT

## 🤝 Support

For issues or questions:
1. Check the logs first
2. Review Twilio debugger console
3. Check OpenAI API status
4. Open an issue in this repo
