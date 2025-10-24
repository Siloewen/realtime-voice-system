export interface TwilioMediaMessage {
  event: 'connected' | 'start' | 'media' | 'stop';
  sequenceNumber?: string;
  streamSid?: string;
  start?: {
    streamSid: string;
    accountSid: string;
    callSid: string;
    tracks: string[];
    mediaFormat: {
      encoding: string;
      sampleRate: number;
      channels: number;
    };
  };
  media?: {
    track: string;
    chunk: string;
    timestamp: string;
    payload: string;
  };
  stop?: {
    accountSid: string;
    callSid: string;
  };
}

export interface OpenAIRealtimeEvent {
  type: string;
  [key: string]: any;
}

export interface SessionConfig {
  callSid?: string;
  streamSid?: string;
  twilioWs?: any;
  openaiWs?: any;
  startTime?: number;
}
