const AudioContextClass =
  typeof window !== 'undefined'
    ? (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
    : null;

type OscillatorShape = 'sine' | 'square' | 'sawtooth' | 'triangle';

type SoundKey = 'flap' | 'score' | 'hit' | 'die' | 'swoosh';

interface ToneSegment {
  frequency: number;
  duration: number;
  gain?: number;
  type?: OscillatorShape;
  slideTo?: number;
}

const SOUND_MAP: Record<SoundKey, ToneSegment[]> = {
  flap: [
    { frequency: 520, duration: 0.04, type: 'square', gain: 0.15, slideTo: 680 },
    { frequency: 360, duration: 0.06, type: 'triangle', gain: 0.12, slideTo: 420 },
  ],
  score: [
    { frequency: 880, duration: 0.08, type: 'sine', gain: 0.2 },
    { frequency: 1320, duration: 0.06, type: 'sine', gain: 0.14 },
  ],
  hit: [
    { frequency: 220, duration: 0.12, type: 'sawtooth', gain: 0.18 },
    { frequency: 160, duration: 0.12, type: 'triangle', gain: 0.14 },
  ],
  die: [
    { frequency: 440, duration: 0.1, type: 'sine', gain: 0.1, slideTo: 220 },
    { frequency: 180, duration: 0.25, type: 'triangle', gain: 0.12, slideTo: 60 },
  ],
  swoosh: [
    { frequency: 1040, duration: 0.08, type: 'triangle', gain: 0.08, slideTo: 320 },
    { frequency: 280, duration: 0.14, type: 'sawtooth', gain: 0.06, slideTo: 120 },
  ],
};

let audioContext: AudioContext | null = null;
let pendingResume: Promise<void> | null = null;

function ensureContext(): AudioContext | null {
  if (!AudioContextClass) {
    return null;
  }
  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === 'closed') {
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === 'suspended') {
    if (!pendingResume) {
      pendingResume = audioContext
        .resume()
        .catch(() => {
          /* ignore */
        })
        .finally(() => {
          pendingResume = null;
        });
    }
  }
  return audioContext;
}

function scheduleTone(ctx: AudioContext, startTime: number, segment: ToneSegment): number {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = segment.type ?? 'sine';
  oscillator.frequency.setValueAtTime(segment.frequency, startTime);
  if (segment.slideTo && segment.slideTo !== segment.frequency) {
    oscillator.frequency.exponentialRampToValueAtTime(segment.slideTo, startTime + segment.duration);
  }

  const maxGain = segment.gain ?? 0.12;
  gain.gain.setValueAtTime(maxGain, startTime);
  gain.gain.linearRampToValueAtTime(0.0001, startTime + segment.duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  try {
    oscillator.start(startTime);
    oscillator.stop(startTime + segment.duration + 0.01);
  } catch (error) {
    console.warn('Audio oscillator failed to start', error);
  }

  return startTime + segment.duration;
}

export function playSound(key: SoundKey): void {
  const ctx = ensureContext();
  if (!ctx) {
    return;
  }

  if (ctx.state !== 'running') {
    return;
  }

  const start = ctx.currentTime;
  let cursor = start;
  const segments = SOUND_MAP[key];
  try {
    for (const segment of segments) {
      cursor = scheduleTone(ctx, cursor, segment);
    }
  } catch (error) {
    console.warn('Failed to play sound', error);
  }
}

export async function preloadAudio(): Promise<void> {
  const ctx = ensureContext();
  if (!ctx) {
    return;
  }

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (error) {
      console.warn('Unable to resume audio context during preload', error);
      return;
    }
  }

  if (ctx.state !== 'running') {
    return;
  }

  // Prime a silent buffer so the first sound plays without delay.
  try {
    const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  } catch (error) {
    console.warn('Failed to prime audio context', error);
  }
}
