/**
 * Procedural chiptune sound effects with the Web Audio API. No audio files needed.
 * Browsers only allow sound after a user gesture, so the context is created on first enable.
 * Music is not implemented yet: see docs/GAME_DESIGN.md (Audio) for the plan.
 */
let ctx = null;
let master = null;
let enabled = false;

function init() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.18;
  master.connect(ctx.destination);
}

export function setSound(on) {
  enabled = on;
  if (on) {
    init();
    ctx?.resume?.();
  }
  try { localStorage.setItem("vb-sound", on ? "1" : "0"); } catch (_) { /* storage may be blocked */ }
}
export const soundOn = () => enabled;
export function savedSoundPref() {
  try { return localStorage.getItem("vb-sound") === "1"; } catch (_) { return false; }
}

// One square/triangle note with a quick envelope.
function tone(freq, start, dur, { type = "square", vol = 1, slide = 0 } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(master);
  o.start(start);
  o.stop(start + dur + 0.02);
}

function noise(start, dur, { vol = 1, cutoff = 800 } = {}) {
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = cutoff;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(master);
  src.start(start);
}

const SFX = {
  blip: (t) => tone(880, t, 0.03, { vol: 0.25 }),
  baronBlip: (t) => tone(220, t, 0.05, { vol: 0.3, type: "sawtooth" }),
  plant: (t) => { tone(660, t, 0.06, { vol: 0.5 }); tone(990, t + 0.05, 0.08, { vol: 0.4 }); },
  build: (t) => [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.06, 0.12, { vol: 0.5 })),
  error: (t) => tone(160, t, 0.14, { vol: 0.5, slide: -60 }),
  baron: (t) => [196, 185, 175, 131].forEach((f, i) => tone(f, t + i * 0.14, 0.2, { vol: 0.6, type: "sawtooth" })),
  yearEnd: (t) => { tone(784, t, 0.1, { type: "triangle" }); tone(1047, t + 0.1, 0.18, { type: "triangle" }); },
  thunder: (t) => noise(t, 1.4, { vol: 1.2, cutoff: 400 }),
  poof: (t) => noise(t, 0.12, { vol: 0.4, cutoff: 2000 }),
  win: (t) => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, t + i * 0.12, 0.16, { vol: 0.6 })),
  lose: (t) => [392, 349, 311, 262].forEach((f, i) => tone(f, t + i * 0.18, 0.24, { vol: 0.5, type: "triangle" })),
};

export function play(name) {
  if (!enabled || !ctx || !SFX[name]) return;
  try { SFX[name](ctx.currentTime + 0.01); } catch (_) { /* ignore */ }
}
