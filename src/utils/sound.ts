// Clean Web Audio API synthesized soft Tibetan singing bell / chime
export function playChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    // Harmonic frequencies for a gentle zen bell
    const freqs = [528, 1056, 1584]; // 528Hz "love/healing" frequency harmonic
    
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const initialGain = 0.15 / (idx + 1);
      gain.gain.setValueAtTime(initialGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 + idx * 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.5);
    });
  } catch {
    // Audio may be blocked until user interacts, fail silently
  }
}

// Gentle physical paper leaf turn sound synthesized via Web Audio API
export function playPageTurnSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const bufferSize = Math.floor(ctx.sampleRate * 0.18); // ~180ms of delicate paper rustle
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // Bandpass filter to simulate smooth parchment/cotton paper friction
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.16);
    filter.Q.value = 1.4;

    const gainNode = ctx.createGain();
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.04, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.19);
  } catch {
    // Fail silently
  }
}

