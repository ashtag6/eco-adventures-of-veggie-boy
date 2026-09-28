import { T, roadLike } from "./tiles.js";
import { W, H, N } from "./grid.js";

/**
 * Weather events. A level schedules them by year (level.weather). Each event can:
 *  - modify resistance surfaces for the year (resMod), which changes the live current map,
 *  - change seed rain / sapling growth at year end (seedFactor, growthBonus),
 *  - cause physical damage at year end (damage: "storm").
 * Lore: haze drifts in from peat fires on Sumaterra, set by Concrete Co. Plantations
 * (Baron Tarmac's sister company). Keep the blame on the corporate villain, not the neighbour.
 */
export const WEATHER = {
  clear: {
    hud: "Clear",
    seedFactor: 1,
    growthBonus: 0,
  },
  thunderstorm: {
    hud: "Storms",
    seedFactor: 1,
    growthBonus: 0,
    damage: "storm",
    forecast:
      "Weather warning! Thunderstorm season is here. Lightning and squalls will hit exposed saplings and can snap rope bridges. Plant in blocks, not thin lines, and keep spare budget for repairs.",
  },
  haze: {
    hud: "Haze",
    seedFactor: 0.5,
    growthBonus: 0,
    resMod(sp, res) {
      // Birds stay under cover in thick haze: open ground becomes much harder to cross.
      if (sp !== "bulbul") return res;
      return res.map((r, t) => (t === T.FOREST ? r : r * 1.8));
    },
    forecast:
      "Cough! Concrete Co. Plantations is burning peat on Sumaterra again and the haze has drifted across the strait. Bulbuls are staying under cover, so seed rain will halve this year and fewer saplings will mature.",
  },
  monsoon: {
    hud: "Monsoon",
    seedFactor: 1,
    growthBonus: 1,
    resMod(sp, res) {
      // Culverts flood: underpasses become near useless for ground-dwellers.
      if (sp !== "pangolin") return res;
      const r = res.slice();
      r[T.UNDER] = res[T.UNDER] * 25;
      return r;
    },
    forecast:
      "The monsoon has arrived! Heavy rain will flood the underpasses, so pangolins will struggle to use them this year. Eco-bridges stay dry. On the bright side, saplings love the rain.",
  },
};

export function effectiveRes(sp, base, weatherKey) {
  const w = WEATHER[weatherKey] || WEATHER.clear;
  return w.resMod ? w.resMod(sp, base) : base;
}

// Exposed = two or more neighbours that are open, built or road (or off-map).
function exposed(land, i) {
  const x = i % W, y = (i / W) | 0;
  let n = 0;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const xx = x + dx, yy = y + dy;
    if (xx < 0 || yy < 0 || xx >= W || yy >= H) { n++; continue; }
    const t = land[yy * W + xx];
    if (t === T.GRASS || roadLike(t) || t === T.BUILD || t === T.DEV || t === T.DEPOT) n++;
  }
  return n >= 2;
}

/** Year-end storm damage. Mutates state; returns counts for the review dialogue. */
export function stormDamage(state, rand) {
  const { land, grow, age } = state;
  let saplings = 0, ropes = 0;
  for (let i = 0; i < N; i++) {
    const young = land[i] === T.SAPLING || (grow[i] && land[i] === T.SCRUB && age[i] < 1);
    if (young && exposed(land, i) && rand() < 0.45) {
      land[i] = T.GRASS;
      grow[i] = 0;
      age[i] = 0;
      saplings++;
    }
  }
  const x0 = state.roadCols[0];
  for (let y = 0; y < H; y++) {
    if (land[y * W + x0] === T.ROPE && rand() < 0.5) {
      for (const x of state.roadCols) land[y * W + x] = T.ROAD;
      ropes++;
    }
  }
  return { saplings, ropes };
}
