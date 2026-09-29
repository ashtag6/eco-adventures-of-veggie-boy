import { W, H } from "./grid.js";
import { T, roadLike } from "./tiles.js";

/**
 * Card effects are plain data so levels stay declarative. Supported ops:
 *  { op: "develop", tile: "DEV" | "DEPOT" | "BUILD" | "SEAWALL", rects: [[x, y, w, h], ...] }
 *      Builds over everything except existing road and crossing tiles.
 *  { op: "tile", tile: "ECO" | "UNDER" | "CANAL" | ..., rects }   place tiles directly (anything goes)
 *  { op: "widen", road: 0 }    add one lane to road `road` (east for vertical roads, south for horizontal);
 *                              existing crossings stretch across the new lane
 *  { op: "light", rects }      floodlights: marks cells as lit at night (Manday)
 *  { op: "budget", amount: n } +/- budget ($k)
 *  { op: "goodwill", amount: n }
 * Returns true if the land or lighting changed (so the caller re-solves).
 */
export function applyEffects(state, effects = []) {
  let changed = false;
  const each = (rects, fn) => {
    for (const [x0, y0, w, h] of rects)
      for (let y = y0; y < y0 + h; y++)
        for (let x = x0; x < x0 + w; x++) if (x >= 0 && y >= 0 && x < W && y < H) fn(y * W + x);
  };
  for (const e of effects) {
    switch (e.op) {
      case "develop":
      case "tile": {
        const t = T[e.tile];
        each(e.rects, (i) => {
          if (e.op === "develop" && roadLike(state.land[i])) return;
          state.land[i] = t;
          state.grow[i] = 0;
          state.age[i] = 0;
        });
        changed = true;
        break;
      }
      case "widen": {
        const road = state.roads[e.road || 0];
        const lines = road.lines;
        const n = Math.max(...lines) + 1;
        if (road.axis === "v") {
          for (let y = 0; y < H; y++) {
            const i = y * W + n, prev = state.land[i - 1];
            if (!roadLike(prev)) continue;
            state.land[i] = prev === T.ROAD ? T.ROAD : prev;
            state.grow[i] = 0;
          }
        } else {
          for (let x = 0; x < W; x++) {
            const i = n * W + x, prev = state.land[i - W];
            if (!roadLike(prev)) continue;
            state.land[i] = prev;
            state.grow[i] = 0;
          }
        }
        lines.push(n);
        changed = true;
        break;
      }
      case "light":
        each(e.rects, (i) => { state.extraLit[i] = 1; });
        changed = true;
        break;
      case "budget":
        state.budget += e.amount;
        break;
      case "goodwill":
        state.goodwill = Math.max(0, state.goodwill + e.amount);
        break;
      default:
        console.warn("Unknown effect op", e.op);
    }
  }
  return changed;
}
