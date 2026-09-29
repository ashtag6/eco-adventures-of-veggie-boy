import { W, H, N } from "./grid.js";
import { T, roadLike, isBuilt } from "./tiles.js";
import { SPECIES } from "./species.js";
import { bareFraction } from "./solver.js";
import { WEATHER } from "./weather.js";

/** Roadkill per scored species = share of movement crossing on bare tarmac x level scale. */
export function roadkill(state, results, killScale) {
  const out = {};
  for (const [sp, scale] of Object.entries(killScale)) {
    out[sp] = Math.round(bareFraction(state.land, results[sp].cur) * scale);
  }
  return out;
}

/**
 * Seed rain and succession, driven by the level's seed disperser (bulbul or hornbill).
 * Sapling -> scrub: 1 year on a busy disperser route, otherwise 3 years (2 in a monsoon year).
 * Planted scrub -> forest: 2 years on a busy route, otherwise 4.
 * Mangrove sapling -> mangrove: 1 year in a monsoon year, otherwise 2 (propagules spread by water).
 * Grass next to cover on a very busy route regenerates to scrub on its own.
 */
export function regenerate(state, disperser, weatherKey) {
  const w = WEATHER[weatherKey] || WEATHER.clear;
  const thresh = (0.045 * disperser.I) / w.seedFactor;
  const { land, grow, age } = state;
  let matured = 0, forested = 0, wild = 0, mangroves = 0;
  const snap = new Uint8Array(land);
  for (let i = 0; i < N; i++) {
    const c = disperser.cur[i];
    const t = snap[i];
    if (t === T.SAPLING) {
      age[i]++;
      if (c >= thresh || age[i] >= 3 - w.growthBonus) { land[i] = T.SCRUB; age[i] = 0; matured++; }
    } else if (t === T.MSAPLING) {
      age[i]++;
      if (age[i] >= 2 - w.growthBonus) { land[i] = T.MANGROVE; grow[i] = 0; age[i] = 0; mangroves++; }
    } else if (grow[i] && t === T.SCRUB) {
      age[i]++;
      if ((c >= thresh && age[i] >= 2) || age[i] >= 4) { land[i] = T.FOREST; grow[i] = 0; forested++; }
    } else if (t === T.GRASS && c >= 2 * thresh) {
      const x = i % W;
      let nb = 0;
      for (const j of [i - 1, i + 1, i - W, i + W]) {
        if (j < 0 || j >= N) continue;
        if ((j === i - 1 && x === 0) || (j === i + 1 && x === W - 1)) continue;
        const u = snap[j];
        if (u === T.FOREST || u === T.SCRUB || u === T.SAPLING) nb++;
      }
      if (nb >= 2) { land[i] = T.SCRUB; grow[i] = 1; age[i] = 0; wild++; }
    }
  }
  return { matured, forested, wild, mangroves };
}

/**
 * Night lighting (Manday). Cells within one tile of a road, building or development are lit,
 * plus any floodlit areas added by cards (extra), minus cells fitted with wildlife-friendly lighting (dark).
 */
export function computeLit(land, extra, dark) {
  const lit = new Uint8Array(N);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const t = land[y * W + x];
      if (!(t === T.ROAD || t === T.UNDER || t === T.ROPE || isBuilt(t))) continue;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < W && yy < H) lit[yy * W + xx] = 1;
        }
    }
  for (let i = 0; i < N; i++) {
    if (extra && extra[i]) lit[i] = 1;
    if (dark && dark[i]) lit[i] = 0;
  }
  return lit;
}

/** Per-cell resistance multiplier for a nocturnal species, or null if lighting doesn't affect it. */
export function lightMul(sp, lit) {
  const f = SPECIES[sp].traits.light;
  if (!f || !lit) return null;
  const m = new Float64Array(N);
  for (let i = 0; i < N; i++) m[i] = lit[i] ? f : 1;
  return m;
}

export { roadLike };
