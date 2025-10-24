import WebSocket from 'ws';
import { OpenAIService } from './openai-service.js';
import { twilioToOpenAI, openaiToTwilio } from '../utils/audio.js';
import { TwilioMediaMessage, SessionConfig } from '../types.js';

export class SessionManager {
  private sessions: Map<string, SessionConfig> = new Map();
  private openaiService: OpenAIService;
  private audioBuffers: Map<string, string[]> = new Map(); // Buffer audio until session is ready

  constructor(openaiApiKey: string, promptId: string, promptVersion: string) {
    this.openaiService = new OpenAIService(openaiApiKey, promptId, promptVersion);
  }

  async handleTwilioConnection(twilioWs: WebSocket): Promise<void> {
    console.log('New Twilio Media Stream connection');

    let streamSid: string | undefined;
    let callSid: string | undefined;

    twilioWs.on('message', async (message: string) => {
      try {
        const data: TwilioMediaMessage = JSON.parse(message);

        switch (data.event) {
          case 'connected':
            console.log('Twilio Media Stream connected');
            break;

          case 'start':
            streamSid = data.start!.streamSid;
            callSid = data.start!.callSid;
            console.log(`Call started - StreamSid: ${streamSid}, CallSid: ${callSid}`);

            await this.initializeSession(streamSid, callSid, twilioWs);
            break;

          case 'media':
            if (streamSid && data.media) {
              await this.handleIncomingAudio(streamSid, data.media.payload);
            } else {
              console.log('⚠️ Received media event but missing streamSid or payload');
            }
            break;

          case 'stop':
            console.log('Call ended');
            if (streamSid) {
              this.endSession(streamSid);
            }
            break;
        }
      } catch (error) {
        console.error('Error processing Twilio message:', error);
      }
    });

    twilioWs.on('close', () => {
      console.log('Twilio WebSocket closed');
      if (streamSid) {
        this.endSession(streamSid);
      }
    });

    twilioWs.on('error', (error) => {
      console.error('Twilio WebSocket error:', error);
    });
  }

  private async initializeSession(
    streamSid: string,
    callSid: string,
    twilioWs: WebSocket
  ): Promise<void> {
    try {
      // Connect to OpenAI
      const openaiWs = await this.openaiService.connect();

      // Store session
      this.sessions.set(streamSid, {
        streamSid,
        callSid,
        twilioWs,
        openaiWs,
        startTime: Date.now(),
      });

      // Handle OpenAI messages
      openaiWs.on('message', (message: Buffer) => {
        this.handleOpenAIMessage(streamSid, message);
      });

      openaiWs.on('error', (error) => {
        console.error('OpenAI WebSocket error:', error);
        this.endSession(streamSid);
      });

      openaiWs.on('close', () => {
        console.log('OpenAI WebSocket closed');
        this.endSession(streamSid);
      });

      // Configure session with audio settings
      this.openaiService.sendEvent({
        type: 'session.update',
        session: {
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1',
          },
        },
      });

      // Trigger the AI to speak first (greeting)
      this.openaiService.sendEvent({
        type: 'response.create',
      });

      console.log(`✓ Session initialized for stream ${streamSid}`);

      // Flush any buffered audio that arrived before the session was ready
      const bufferedAudio = this.audioBuffers.get(streamSid);
      if (bufferedAudio && bufferedAudio.length > 0) {
        console.log(`📦 Flushing ${bufferedAudio.length} buffered audio packets`);
        for (const mulawBase64 of bufferedAudio) {
          try {
            const pcmBase64 = twilioToOpenAI(mulawBase64);
            this.openaiService.sendAudio(pcmBase64);
          } catch (error) {
            console.error('Error processing buffered audio:', error);
          }
        }
        this.audioBuffers.delete(streamSid);
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      twilioWs.close();
    }
  }

  private async handleIncomingAudio(streamSid: string, mulawBase64: string): Promise<void> {
    const session = this.sessions.get(streamSid);
    if (!session) {
      // Session not ready yet, buffer the audio
      if (!this.audioBuffers.has(streamSid)) {
        this.audioBuffers.set(streamSid, []);
      }
      this.audioBuffers.get(streamSid)!.push(mulawBase64);
      return;
    }

    try {
      // Convert Twilio μ-law to OpenAI PCM16
      const pcmBase64 = twilioToOpenAI(mulawBase64);

      // Send to OpenAI
      this.openaiService.sendAudio(pcmBase64);
    } catch (error) {
      console.error('❌ Error processing incoming audio:', error);
    }
  }

  private handleOpenAIMessage(streamSid: string, message: Buffer): void {
    const session = this.sessions.get(streamSid);
    if (!session) return;

    try {
      const event = JSON.parse(message.toString());

      switch (event.type) {
        case 'response.audio.delta':
          // OpenAI is sending audio back
          if (event.delta) {
            this.sendAudioToTwilio(streamSid, event.delta);
          }
          break;

        case 'response.audio.done':
          console.log('Response audio complete');
          break;

        case 'conversation.item.input_audio_transcription.completed':
          console.log('User said:', event.transcript);
          break;

        case 'response.done':
          console.log('Response complete');
          break;

        case 'error':
          console.error('OpenAI error:', event.error);
          break;

        default:
          // Log other events for debugging
          if (event.type !== 'response.audio_transcript.delta') {
            console.log('OpenAI event:', event.type);
          }
      }
    } catch (error) {
      console.error('Error handling OpenAI message:', error);
    }
  }

  private sendAudioToTwilio(streamSid: string, pcmBase64: string): void {
    const session = this.sessions.get(streamSid);
    if (!session || !session.twilioWs) return;

    try {
      // Convert OpenAI PCM16 to Twilio μ-law
      const mulawBase64 = openaiToTwilio(pcmBase64);

      // Send to Twilio
      const mediaMessage = {
        event: 'media',
        streamSid: streamSid,
        media: {
          payload: mulawBase64,
        },
      };

      if (session.twilioWs.readyState === WebSocket.OPEN) {
        session.twilioWs.send(JSON.stringify(mediaMessage));
      }
    } catch (error) {
      console.error('Error sending audio to Twilio:', error);
    }
  }

  private endSession(streamSid: string): void {
    const session = this.sessions.get(streamSid);
    if (!session) return;

    console.log(`Ending session ${streamSid}`);

    // Close OpenAI connection
    if (session.openaiWs && session.openaiWs.readyState === WebSocket.OPEN) {
      session.openaiWs.close();
    }

    // Close Twilio connection
    if (session.twilioWs && session.twilioWs.readyState === WebSocket.OPEN) {
      session.twilioWs.close();
    }

    // Clean up buffered audio
    this.audioBuffers.delete(streamSid);

    // Remove from sessions
    this.sessions.delete(streamSid);

    const duration = session.startTime ? (Date.now() - session.startTime) / 1000 : 0;
    console.log(`Session ended. Duration: ${duration.toFixed(1)}s`);
  }

  getActiveSessionCount(): number {
    return this.sessions.size;
  }
}
