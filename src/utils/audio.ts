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
 * Simple linear interpolation for upsampling 8kHz to 24kHz
 */
export function upsample8kTo24k(pcm8k: Int16Array): Int16Array {
  const ratio = 3; // 24kHz / 8kHz = 3
  const pcm24k = new Int16Array(pcm8k.length * ratio);

  for (let i = 0; i < pcm8k.length - 1; i++) {
    const sample1 = pcm8k[i];
    const sample2 = pcm8k[i + 1];

    pcm24k[i * ratio] = sample1;
    pcm24k[i * ratio + 1] = Math.round(sample1 * 0.67 + sample2 * 0.33);
    pcm24k[i * ratio + 2] = Math.round(sample1 * 0.33 + sample2 * 0.67);
  }

  // Handle last sample
  const lastIdx = pcm8k.length - 1;
  pcm24k[lastIdx * ratio] = pcm8k[lastIdx];
  pcm24k[lastIdx * ratio + 1] = pcm8k[lastIdx];
  pcm24k[lastIdx * ratio + 2] = pcm8k[lastIdx];

  return pcm24k;
}

/**
 * Simple decimation for downsampling 24kHz to 8kHz
 */
export function downsample24kTo8k(pcm24k: Int16Array): Int16Array {
  const ratio = 3; // 24kHz / 8kHz = 3
  const pcm8k = new Int16Array(Math.floor(pcm24k.length / ratio));

  for (let i = 0; i < pcm8k.length; i++) {
    pcm8k[i] = pcm24k[i * ratio];
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
