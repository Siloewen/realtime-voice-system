/**
 * Audio conversion utilities for Twilio Media Streams and OpenAI Realtime API
 *
 * Twilio sends: μ-law encoded, 8kHz, base64
 * OpenAI expects: PCM16, 24kHz, base64
 */

/**
 * μ-law decoding table for converting to linear PCM
 */
const MULAW_DECODE_TABLE = new Int16Array(256);
for (let i = 0; i < 256; i++) {
  const sign = (i & 0x80) ? -1 : 1;
  const exponent = (i >> 4) & 0x07;
  const mantissa = i & 0x0F;
  const sample = sign * ((((mantissa << 3) + 132) << exponent) - 132);
  MULAW_DECODE_TABLE[i] = sample;
}

/**
 * Convert μ-law encoded audio to linear PCM16
 */
export function mulawToPcm16(mulawData: Buffer): Int16Array {
  const pcm = new Int16Array(mulawData.length);
  for (let i = 0; i < mulawData.length; i++) {
    pcm[i] = MULAW_DECODE_TABLE[mulawData[i]];
  }
  return pcm;
}

/**
 * Convert PCM16 to μ-law encoding
 */
export function pcm16ToMulaw(pcm16Data: Int16Array): Buffer {
  const mulaw = Buffer.alloc(pcm16Data.length);

  for (let i = 0; i < pcm16Data.length; i++) {
    let sample = pcm16Data[i];
    const sign = sample < 0 ? 0x80 : 0x00;

    if (sample < 0) sample = -sample;
    sample = sample + 132;

    let exponent = 7;
    for (let exp = 0; exp < 8; exp++) {
      if (sample <= (0x1F << (exp + 3))) {
        exponent = exp;
        break;
      }
    }

    const mantissa = (sample >> (exponent + 3)) & 0x0F;
    mulaw[i] = ~(sign | (exponent << 4) | mantissa);
  }

  return mulaw;
}

/**
 * Cubic interpolation for better upsampling 8kHz to 24kHz
 */
export function upsample8kTo24k(pcm8k: Int16Array): Int16Array {
  const ratio = 3; // 24kHz / 8kHz = 3
  const pcm24k = new Int16Array(pcm8k.length * ratio);

  for (let i = 0; i < pcm8k.length; i++) {
    const i0 = Math.max(0, i - 1);
    const i1 = i;
    const i2 = Math.min(pcm8k.length - 1, i + 1);
    const i3 = Math.min(pcm8k.length - 1, i + 2);

    const y0 = pcm8k[i0];
    const y1 = pcm8k[i1];
    const y2 = pcm8k[i2];
    const y3 = pcm8k[i3];

    // Original sample
    pcm24k[i * ratio] = y1;

    // Interpolated samples using cubic interpolation
    for (let j = 1; j < ratio; j++) {
      const t = j / ratio;
      const t2 = t * t;
      const t3 = t2 * t;

      const a0 = y3 - y2 - y0 + y1;
      const a1 = y0 - y1 - a0;
      const a2 = y2 - y0;
      const a3 = y1;

      const value = a0 * t3 + a1 * t2 + a2 * t + a3;
      pcm24k[i * ratio + j] = Math.round(Math.max(-32768, Math.min(32767, value)));
    }
  }

  return pcm24k;
}

/**
 * Averaging for better downsampling 24kHz to 8kHz
 */
export function downsample24kTo8k(pcm24k: Int16Array): Int16Array {
  const ratio = 3; // 24kHz / 8kHz = 3
  const pcm8k = new Int16Array(Math.floor(pcm24k.length / ratio));

  for (let i = 0; i < pcm8k.length; i++) {
    // Average the 3 samples for better quality
    const idx = i * ratio;
    const sum = pcm24k[idx] + 
                (idx + 1 < pcm24k.length ? pcm24k[idx + 1] : pcm24k[idx]) + 
                (idx + 2 < pcm24k.length ? pcm24k[idx + 2] : pcm24k[idx]);
    pcm8k[i] = Math.round(sum / 3);
  }

  return pcm8k;
}

/**
 * Convert Twilio μ-law base64 to OpenAI PCM16 24kHz base64
 */
export function twilioToOpenAI(base64Mulaw: string): string {
  const mulawBuffer = Buffer.from(base64Mulaw, 'base64');
  const pcm8k = mulawToPcm16(mulawBuffer);
  const pcm24k = upsample8kTo24k(pcm8k);

  // Convert Int16Array to Buffer
  const buffer = Buffer.from(pcm24k.buffer);
  return buffer.toString('base64');
}

/**
 * Convert OpenAI PCM16 24kHz base64 to Twilio μ-law base64
 */
export function openaiToTwilio(base64Pcm: string): string {
  const pcmBuffer = Buffer.from(base64Pcm, 'base64');
  const pcm24k = new Int16Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.length / 2);
  const pcm8k = downsample24kTo8k(pcm24k);
  const mulawBuffer = pcm16ToMulaw(pcm8k);

  return mulawBuffer.toString('base64');
}
