import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { SessionManager } from './services/session-manager.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_PROMPT_ID = process.env.OPENAI_PROMPT_ID;
const OPENAI_PROMPT_VERSION = process.env.OPENAI_PROMPT_VERSION || '3';
const PORT = parseInt(process.env.PORT || '3000');

if (!OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY is required in .env file');
  process.exit(1);
}

if (!OPENAI_PROMPT_ID) {
  console.error('ERROR: OPENAI_PROMPT_ID is required in .env file');
  process.exit(1);
}

// Initialize Express app
const app = express();
const server = createServer(app);

// Initialize Session Manager
const sessionManager = new SessionManager(
  OPENAI_API_KEY,
  OPENAI_PROMPT_ID,
  OPENAI_PROMPT_VERSION
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeSessions: sessionManager.getActiveSessionCount(),
    timestamp: new Date().toISOString(),
  });
});

// TwiML endpoint for incoming calls
app.post('/incoming-call', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const wsUrl = `${protocol === 'https' ? 'wss' : 'ws'}://${host}/media-stream`;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="${wsUrl}" />
    </Connect>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// Root endpoint with instructions
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>RealTime Voice Agent</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
            pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
            .status { color: green; font-weight: bold; }
        </style>
    </head>
    <body>
        <h1>🎙️ RealTime Voice Agent</h1>
        <p class="status">✓ Server is running</p>

        <h2>Endpoints</h2>
        <ul>
            <li><strong>POST /incoming-call</strong> - Twilio webhook for incoming calls</li>
            <li><strong>WebSocket /media-stream</strong> - Media stream endpoint</li>
            <li><strong>GET /health</strong> - Health check</li>
        </ul>

        <h2>Active Sessions</h2>
        <p id="sessions">Loading...</p>

        <h2>Setup Instructions</h2>
        <ol>
            <li>Deploy this server to a public URL (Railway, Render, Fly.io, etc.)</li>
            <li>In your Twilio console, configure a phone number</li>
            <li>Set the voice webhook to: <code>https://your-domain.com/incoming-call</code></li>
            <li>Have customers forward their business line to your Twilio number</li>
        </ol>

        <script>
            fetch('/health')
                .then(r => r.json())
                .then(data => {
                    document.getElementById('sessions').textContent =
                        'Active sessions: ' + data.activeSessions;
                });
        </script>
    </body>
    </html>
  `);
});

// WebSocket server for Twilio Media Streams
const wss = new WebSocketServer({
  server,
  path: '/media-stream'
});

wss.on('connection', (ws) => {
  sessionManager.handleTwilioConnection(ws);
});

// Start server
server.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🎙️  RealTime Voice Agent Server');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Server running on port ${PORT}`);
  console.log(`  WebSocket endpoint: ws://localhost:${PORT}/media-stream`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Ready to accept calls! 📞');
  console.log('═══════════════════════════════════════════════════════\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
