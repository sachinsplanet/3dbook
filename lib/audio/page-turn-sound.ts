// Procedural Web Audio API page-turn sound generator
// Complies with Section 5.3:
// - Muted/off by default until user enables it
// - Plays after a turn, never stacks loudly on rapid turns
// - Zero external .mp3 dependencies (zero 404s)

let audioCtx: AudioContext | null = null;
let lastSoundTimestamp = 0;

export function playPageTurnSound(enabled: boolean): void {
  if (!enabled || typeof window === 'undefined') return;

  const nowMs = performance.now();
  // Prevent loud overlapping stacks during rapid turns (min 180ms cooldown)
  if (nowMs - lastSoundTimestamp < 180) return;
  lastSoundTimestamp = nowMs;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as {webkitAudioContext: typeof AudioContext})
        .webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const duration = 0.22;
    const sampleRate = audioCtx.sampleRate;
    const frameCount = Math.floor(sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    // Shape a realistic soft cotton-paper swoosh + gentle page settle
    for (let i = 0; i < frameCount; i++) {
      const t = i / frameCount;
      // Smooth bell envelope with quick attack and soft tail
      const envelope =
        Math.sin(Math.PI * Math.pow(t, 0.75)) * (1 - 0.35 * t);
      const white = Math.random() * 2 - 1;
      data[i] = white * envelope * 0.18;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    // Bandpass filter sweeping slightly to mimic paper curvature release
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(
      2400,
      audioCtx.currentTime + duration * 0.65
    );
    filter.frequency.exponentialRampToValueAtTime(
      850,
      audioCtx.currentTime + duration
    );
    filter.Q.value = 1.4;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.28, audioCtx.currentTime + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + duration
    );

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseSource.start();
    noiseSource.stop(audioCtx.currentTime + duration);
  } catch {
    // Ignore audio context errors if blocked by browser policy
  }
}
