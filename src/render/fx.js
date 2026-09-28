import { W, N, TILE } from "../engine/grid.js";
import { rect } from "./tiles.js";

const CW = W * TILE; // 384
const CH = 224;

/** Current-density overlay. Brightness ~ sqrt(normalised current); bands pulse along the voltage gradient. */
export function drawCurrent(c, r, time, reduced) {
  for (let i = 0; i < N; i++) {
    if (r.fix[i]) continue;
    const v = r.cur[i] / r.max;
    if (v < 0.1) continue;
    const l = Math.sqrt(v);
    const pulse = reduced ? 1 : 0.7 + 0.3 * Math.sin(time * 3.2 - r.V[i] * 28);
    c.globalAlpha = Math.min(0.85, (0.62 * l - 0.1) * pulse);
    c.fillStyle = l < 0.4 ? "#ff8a1f" : l < 0.72 ? "#ffd34d" : "#fff6cf";
    c.fillRect((i % W) * TILE, ((i / W) | 0) * TILE, TILE, TILE);
  }
  c.globalAlpha = 1;
}

// Persistent particles for weather, created lazily.
let drops = null, motes = null, flash = 0, nextStrike = 3;

function ensureParticles() {
  if (drops) return;
  drops = Array.from({ length: 140 }, () => ({ x: Math.random() * CW, y: Math.random() * CH, s: 140 + Math.random() * 80 }));
  motes = Array.from({ length: 60 }, () => ({ x: Math.random() * CW, y: Math.random() * CH, s: 4 + Math.random() * 8, z: Math.random() < 0.3 ? 2 : 1 }));
}

/** Weather overlay. Thunderstorm: rain + lightning. Haze: sepia wash + drifting ash. Monsoon: heavy rain. */
export function drawWeather(c, key, time, dt, reduced) {
  if (!key || key === "clear") return false;
  let struck = false;
  ensureParticles();
  if (key === "haze") {
    c.globalAlpha = 0.34;
    rect(c, 0, 0, CW, CH, "#b08a55");
    c.globalAlpha = 0.5;
    for (const m of motes) {
      if (!reduced) {
        m.x -= m.s * dt;
        m.y += Math.sin(time + m.x * 0.05) * 0.1;
        if (m.x < -2) { m.x = CW + 2; m.y = Math.random() * CH; }
      }
      rect(c, Math.round(m.x), Math.round(m.y), m.z, m.z, "#e8d6b0");
    }
    c.globalAlpha = 1;
    return false;
  }
  const heavy = key === "monsoon";
  c.globalAlpha = heavy ? 0.3 : 0.22;
  rect(c, 0, 0, CW, CH, heavy ? "#1a2a55" : "#1c1c40");
  c.globalAlpha = heavy ? 0.7 : 0.5;
  const n = heavy ? drops.length : 80;
  for (let k = 0; k < n; k++) {
    const d = drops[k];
    if (!reduced) {
      d.y += d.s * dt;
      d.x -= d.s * 0.25 * dt;
      if (d.y > CH) { d.y = -4; d.x = Math.random() * (CW + 40); }
    }
    rect(c, Math.round(d.x), Math.round(d.y), 1, 3, "#9fc3ff");
  }
  c.globalAlpha = 1;
  if (key === "thunderstorm" && !reduced) {
    nextStrike -= dt;
    if (nextStrike <= 0) { flash = 1; struck = true; nextStrike = 4 + Math.random() * 5; }
    if (flash > 0) {
      c.globalAlpha = flash * 0.55;
      rect(c, 0, 0, CW, CH, "#ffffff");
      c.globalAlpha = 1;
      flash = Math.max(0, flash - dt * 3);
    }
  }
  return struck;
}

/** Roadkill "poof": a small expanding ring of pixels. */
export function drawPoofs(c, poofs, dt) {
  for (const p of poofs) {
    p.t += dt;
    const s = Math.round(p.t * 14), x = p.x * TILE + 4, y = p.y * TILE + 4;
    c.fillStyle = p.t < 0.3 ? "#ffffff" : "#ff6b5d";
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1.4], [0, 1.4], [-1.4, 0], [1.4, 0]])
      c.fillRect(Math.round(x + dx * s), Math.round(y + dy * s), 1, 1);
  }
  return poofs.filter((p) => p.t < 0.6);
}
