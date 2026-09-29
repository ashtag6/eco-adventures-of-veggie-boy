import { T, roadLike, isBuilt } from "./tiles.js";
import { W, H, N } from "./grid.js";
import { SPECIES } from "./species.js";

/**
 * Weather events. A level schedules them by year (level.weather). Each event can:
 *  - change resistance for the year according to species traits (resFor),
 *  - change seed rain and sapling growth at year end (seedFactor, growthBonus),
 *  - cause physical damage at year end (damage: "storm").
 * Lore: haze drifts in from peat fires on Sumaterra, set by Concrete Co. Plantations
 * (Baron Tarmac's sister company). Keep the blame on the corporate villain, not the neighbour.
 */
export const WEATHER = {
  clear: { hud: "Clear", seedFactor: 1, growthBonus: 0 },
  thunderstorm: {
    hud: "Storms", seedFactor: 1, growthBonus: 0, damage: "storm",
    forecast:
      "Weather warning! Thunderstorm season is here. Lightning and squalls will hit exposed saplings and can snap rope bridges. Plant in blocks, not thin lines, and keep some budget for repairs.",
  },
  haze: {
    hud: "Haze", seedFactor: 0.5, growthBonus: 0,
    forecast:
      "Cough! Concrete Co. Plantations is burning peat on Sumaterra again and the haze has drifted across the strait. Birds are staying under cover, so they won't cross open ground and seed rain will halve this year.",
  },
  monsoon: {
    hud: "Monsoon", seedFactor: 1, growthBonus: 1,
    forecast:
      "The monsoon has arrived! Floodwater fills the underpasses, so pangolins and leopard cats avoid them this year, and concrete canals run fast and dangerous. Frogs love the wet grass, and saplings grow quickly in the rain.",
  },
};

/** Species resistance for a given weather year. */
export function effectiveRes(sp, weatherKey) {
  const base = SPECIES[sp].res;
  const tr = SPECIES[sp].traits;
  const r = base.slice();
  if (weatherKey === "haze" && tr.fly) {
    for (let t = 0; t < r.length; t++) if (t !== T.FOREST && t !== T.MANGROVE) r[t] = base[t] * 1.8;
  }
  if (weatherKey === "monsoon") {
    if (tr.floodSensitive) r[T.UNDER] = base[T.UNDER] * 25;
    if (tr.wet) r[T.GRASS] = base[T.GRASS] * 0.6;
    if (tr.swim) r[T.CANAL] = base[T.CANAL] * 2.5;
  }
  return r;
}

// Exposed = two or more neighbours that are open, built, road or water (or off-map).
function exposed(land, i) {
  const x = i % W, y = (i / W) | 0;
  let n = 0;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const xx = x + dx, yy = y + dy;
    if (xx < 0 || yy < 0 || xx >= W || yy >= H) { n++; continue; }
    const t = land[yy * W + xx];
    if (t === T.GRASS || t === T.MUD || t === T.SEA || roadLike(t) || isBuilt(t)) n++;
  }
  return n >= 2;
}

/** Year-end storm damage. Mutates state; returns counts for the review dialogue. */
export function stormDamage(state, rand) {
  const { land, grow, age } = state;
  let saplings = 0, ropes = 0;
  for (let i = 0; i < N; i++) {
    const t = land[i];
    const young = t === T.SAPLING || t === T.MSAPLING || (grow[i] && t === T.SCRUB && age[i] < 1);
    if (young && exposed(land, i) && rand() < 0.45) {
      land[i] = t === T.MSAPLING ? T.MUD : T.GRASS;
      grow[i] = 0;
      age[i] = 0;
      saplings++;
    }
  }
  // Rope bridges: each connected bridge snaps as a unit, 50% chance.
  const seen = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (land[i] !== T.ROPE || seen[i]) continue;
    const comp = [], stack = [i];
    seen[i] = 1;
    while (stack.length) {
      const j = stack.pop();
      comp.push(j);
      const x = j % W;
      for (const k of [x > 0 ? j - 1 : -1, x < W - 1 ? j + 1 : -1, j - W, j + W]) {
        if (k < 0 || k >= N || seen[k] || land[k] !== T.ROPE) continue;
        seen[k] = 1;
        stack.push(k);
      }
    }
    if (rand() < 0.5) {
      for (const j of comp) land[j] = T.ROAD;
      ropes++;
    }
  }
  return { saplings, ropes };
}
