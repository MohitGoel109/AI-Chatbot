/**
 * Tiny synthesized sound effects using the Web Audio API — no external
 * audio files needed (keeps the repo light and avoids licensing issues).
 * Each function fires a short, cheap oscillator sweep.
 */
let ctx;
function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone({ freqStart, freqEnd, duration, type = "sawtooth", gain = 0.05 }) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(freqEnd, 1),
    audio.currentTime + duration
  );
  g.gain.setValueAtTime(gain, audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  osc.connect(g).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration);
}

// Quick low-to-high "ignition" whoosh — used when the chat window opens.
export function playIgnition() {
  tone({ freqStart: 90, freqEnd: 340, duration: 0.35, type: "sawtooth", gain: 0.05 });
  setTimeout(
    () => tone({ freqStart: 220, freqEnd: 60, duration: 0.25, type: "triangle", gain: 0.03 }),
    120
  );
}

// Short metallic tick — used on send / chain rattle.
export function playChainTick() {
  tone({ freqStart: 500, freqEnd: 200, duration: 0.08, type: "square", gain: 0.025 });
}

// Soft descending tone — used when closing the chat window.
export function playClose() {
  tone({ freqStart: 300, freqEnd: 80, duration: 0.2, type: "sine", gain: 0.03 });
}
