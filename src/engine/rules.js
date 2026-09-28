import { W, N } from "./grid.js";
import { T } from "./tiles.js";
import { bareFraction } from "./solver.js";
import { WEATHER } from "./weather.js";

/** Roadkill per scored species = share of flow crossing on bare tarmac x level scale. */
export function roadkill(state, results, killScale) {
  const out = {};
  for (const [sp, scale] of Object.entries(killScale)) {
    const f = bareFraction(state.land, results[sp].cur, state.roadCols);
    out[sp] = Math.round(f * scale);
  }
  return out;
}

/**
 * Seed rain and succession, driven by bulbul current.
 * Sapling -> scrub: 1 year on a busy bulbul route, otherwise 3 years (2 in a monsoon year).
 * Planted scrub -> forest: 2 years on a busy route, otherwise 4.
 * Grass next to cover on a very busy route regenerates to scrub on its own.
 */
export function regenerate(state, bulbul, weatherKey) {
  const w = WEATHER[weatherKey] || WEATHER.clear;
  const thresh = (0.045 * bulbul.I) / w.seedFactor;
  const { land, grow, age } = state;
  let matured = 0, forested = 0, wild = 0;
  const snapshot = new Uint8Array(land);
  for (let i = 0; i < N; i++) {
    const c = bulbul.cur[i];
    if (snapshot[i] === T.SAPLING) {
      age[i]++;
      if (c >= thresh || age[i] >= 3 - w.growthBonus) { land[i] = T.SCRUB; age[i] = 0; matured++; }
    } else if (grow[i] && snapshot[i] === T.SCRUB) {
      age[i]++;
      if ((c >= thresh && age[i] >= 2) || age[i] >= 4) { land[i] = T.FOREST; grow[i] = 0; forested++; }
    } else if (snapshot[i] === T.GRASS && c >= 2 * thresh) {
      const x = i % W;
      let nb = 0;
      for (const j of [i - 1, i + 1, i - W, i + W]) {
        if (j < 0 || j >= N) continue;
        if ((j === i - 1 && x === 0) || (j === i + 1 && x === W - 1)) continue;
        const t = snapshot[j];
        if (t === T.FOREST || t === T.SCRUB || t === T.SAPLING) nb++;
      }
      if (nb >= 2) { land[i] = T.SCRUB; grow[i] = 1; age[i] = 0; wild++; }
    }
  }
  return { matured, forested, wild };
}
