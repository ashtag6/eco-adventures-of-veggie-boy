import { W, N, TILE } from "../engine/grid.js";
import { rect } from "./tiles.js";

const CW = W * TILE; // 384
const CH = 224;

/**
 * Trail bands, relative to a species' typical movement level: the 90th percentile of current across
 * the map (outside home habitats). Cells well below typical aren't drawn; bottlenecks carry at least
 * three times the typical flow. The hover readout uses the same bands, so map and words agree.
 */
export const TRAIL_BANDS = [
  { min: 3, key: "bottleneck", label: "Bottleneck", colour: "#fff27a", alpha: 0.55 },
  { min: 1.2, key: "busy", label: "Busy trail", colour: "#ffb300", alpha: 0.4 },
  { min: 0.6, key: "quiet", label: "Quiet trail", colour: "#ffe04d", alpha: 0.2 },
];
export const trailBand = (rel) => TRAIL_BANDS.find((b) => rel >= b.min) || null;

/** Typical movement level for a species (90th percentile of non-habitat current). */
export function typicalFlow(cur, fixAny) {
  const v = [];
  for (let i = 0; i < cur.length; i++) if (!fixAny[i] && cur[i] > 0) v.push(cur[i]);
  v.sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length * 0.9)] : 1;
}

/**
 * Wildlife trails in one yellow family, see-through so the terrain stays visible, separated by
 * steps in opacity and weight: quiet = faint pale wash, busy = stronger gold tint, bottleneck =
 * yellow tint inside a dark outline that pulses.
 */
export function drawTrails(c, cur, typical, fixAny, time, reduced, night = false) {
  c.globalAlpha = night ? 0.06 : 0.12;
  rect(c, 0, 0, CW, CH, "#07081c");
  const pulse = reduced ? 1 : 0.8 + 0.2 * Math.sin(time * 4);
  for (let i = 0; i < N; i++) {
    if (fixAny[i]) continue;
    const b = trailBand(cur[i] / typical);
    if (!b) continue;
    const x = (i % W) * TILE, y = ((i / W) | 0) * TILE;
    if (b.key !== "bottleneck") { c.globalAlpha = b.alpha; rect(c, x, y, 8, 8, b.colour); continue; }
    // Bottleneck: see-through yellow fill inside a solid dark outline, so the terrain still shows.
    c.globalAlpha = b.alpha * pulse;
    rect(c, x + 1, y + 1, 6, 6, b.colour);
    c.globalAlpha = 0.9;
    c.strokeStyle = "#5a3a00";
    c.lineWidth = 1;
    c.strokeRect(x + 0.5, y + 0.5, 7, 7);
  }
  c.globalAlpha = 1;
}

/** Night (Manday): darken the map, then cool white LED glow on lit cells and amber dots for wildlife lighting. */
export function drawNight(c, lit, dark) {
  c.globalAlpha = 0.38;
  rect(c, 0, 0, CW, CH, "#0a0d2e");
  for (let i = 0; i < N; i++) {
    const x = (i % W) * TILE, y = ((i / W) | 0) * TILE;
    if (lit[i]) {
      c.globalAlpha = 0.3;
      rect(c, x, y, 8, 8, "#a9c8ff");
      if ((i % W) % 3 === 0 && ((i / W) | 0) % 3 === 0) { c.globalAlpha = 0.95; rect(c, x + 3, y + 3, 2, 2, "#eef4ff"); }
    } else if (dark[i]) {
      c.globalAlpha = 0.9;
      if ((i % W) % 3 === 0 && ((i / W) | 0) % 3 === 0) rect(c, x + 3, y + 3, 2, 2, "#ff9f3a");
    }
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

/** Weather overlay. Thunderstorm: rain + lightning. Haze: sepia wash + drifting ash. Monsoon: heavy rain. Returns true on a lightning strike. */
export function drawWeather(c, key, time, dt, reduced) {
  if (!key || key === "clear") return false;
  let struck = false;
  ensureParticles();
  if (key === "haze") {
    c.globalAlpha = 0.3;
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
  c.globalAlpha = heavy ? 0.26 : 0.2;
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
