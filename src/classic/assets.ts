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

function ensureContext(): AudioContext | null {
  if (!AudioContextClass) {
    return null;
  }
  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume().catch(() => {
      /* ignore */
    });
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

  oscillator.start(startTime);
  oscillator.stop(startTime + segment.duration + 0.01);

  return startTime + segment.duration;
}

export function playSound(key: SoundKey): void {
  const ctx = ensureContext();
  if (!ctx) {
    return;
  }

  const start = ctx.currentTime;
  let cursor = start;
  const segments = SOUND_MAP[key];
  for (const segment of segments) {
    cursor = scheduleTone(ctx, cursor, segment);
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
    } catch (_error) {
      // Some browsers block autoplay until user interaction. We'll resume on demand in that case.
    }
  }

  // Prime a silent buffer so the first sound plays without delay.
  const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
}
