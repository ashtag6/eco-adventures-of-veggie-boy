import { W, H } from "./grid.js";
import { T, roadLike } from "./tiles.js";

/**
 * Card effects are plain data so levels stay declarative. Supported ops:
 *  { op: "develop", tile: "DEV" | "DEPOT" | "BUILD", rects: [[x, y, w, h], ...] }
 *  { op: "widen" }                       add one road lane to the east; crossings stretch
 *  { op: "budget", amount: n }           +/- budget ($k)
 *  { op: "goodwill", amount: n }         +/- goodwill
 *  { op: "tile", tile: "ECO", rects }    place tiles directly (e.g. a developer-funded crossing)
 * Returns true if the land changed (so the caller re-solves).
 */
export function applyEffects(state, effects = []) {
  let landChanged = false;
  for (const e of effects) {
    switch (e.op) {
      case "develop":
      case "tile": {
        const t = T[e.tile];
        for (const [x0, y0, w, h] of e.rects)
          for (let y = y0; y < y0 + h; y++)
            for (let x = x0; x < x0 + w; x++) {
              if (x < 0 || y < 0 || x >= W || y >= H) continue;
              const i = y * W + x;
              if (e.op === "develop" && roadLike(state.land[i])) continue;
              state.land[i] = t;
              state.grow[i] = 0;
              state.age[i] = 0;
            }
        landChanged = true;
        break;
      }
      case "widen": {
        const nx = state.roadCols[state.roadCols.length - 1] + 1;
        for (let y = 0; y < H; y++) {
          const i = y * W + nx;
          const prev = state.land[i - 1];
          state.land[i] = roadLike(prev) ? prev : T.ROAD;
          state.grow[i] = 0;
        }
        state.roadCols.push(nx);
        landChanged = true;
        break;
      }
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
  return landChanged;
}
