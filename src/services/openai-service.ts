import WebSocket from 'ws';
import { OpenAIRealtimeEvent } from '../types.js';

export class OpenAIService {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private promptId: string;
  private promptVersion: string;

  constructor(apiKey: string, promptId: string, promptVersion: string = '3') {
    this.apiKey = apiKey;
    this.promptId = promptId;
    this.promptVersion = promptVersion;
  }

  async connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        // First, create a session to get the session token
        this.createSession()
          .then((sessionData) => {
            const { client_secret } = sessionData;

            // Connect to WebSocket with the ephemeral token
            const url = `wss://api.openai.com/v1/realtime?model=gpt-realtime`;

            this.ws = new WebSocket(url, {
              headers: {
                'Authorization': `Bearer ${client_secret.value}`,
                'OpenAI-Beta': 'realtime=v1',
              },
            });

            this.ws.on('open', () => {
              console.log('✓ Connected to OpenAI Realtime API');
              resolve(this.ws!);
            });

            this.ws.on('error', (error) => {
              console.error('OpenAI WebSocket error:', error);
              reject(error);
            });

            this.ws.on('close', () => {
              console.log('OpenAI WebSocket closed');
            });
          })
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async createSession(): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'OpenAI-Beta': 'realtime=v1',
      },
      body: JSON.stringify({
        model: 'gpt-realtime',
        voice: 'sage',
        prompt: {
          id: this.promptId,
          version: this.promptVersion,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create session: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  sendEvent(event: OpenAIRealtimeEvent): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      console.error('Cannot send event: WebSocket not open');
    }
  }

  sendAudio(audioBase64: string): void {
    this.sendEvent({
      type: 'input_audio_buffer.append',
      audio: audioBase64,
    });
  }

  commitAudio(): void {
    this.sendEvent({
      type: 'input_audio_buffer.commit',
    });
  }

  createResponse(): void {
    this.sendEvent({
      type: 'response.create',
    });
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  getWebSocket(): WebSocket | null {
    return this.ws;
  }
}
