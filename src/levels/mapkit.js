import { W, H, N, rng } from "../engine/grid.js";
import { T } from "../engine/tiles.js";

/** Small toolkit for writing level maps. All coordinates are in cells (48 x 28). */
export function mapKit(seed, base = T.GRASS) {
  const land = new Uint8Array(N).fill(base);
  const variant = new Uint8Array(N);
  const r = rng(seed);
  for (let i = 0; i < N; i++) variant[i] = (r() * 4) | 0;
  const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const k = {
    land, variant, r,
    set(x, y, t) { if (inb(x, y)) land[y * W + x] = t; },
    get(x, y) { return inb(x, y) ? land[y * W + x] : -1; },
    rect(x0, y0, w, h, t) { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) k.set(x, y, t); },
    /** Fill a rect with a random mix: [[tile, weight], ...]. */
    mix(x0, y0, w, h, table) {
      const tot = table.reduce((s, [, p]) => s + p, 0);
      for (let y = y0; y < y0 + h; y++)
        for (let x = x0; x < x0 + w; x++) {
          let u = r() * tot;
          for (const [t, p] of table) { u -= p; if (u <= 0) { k.set(x, y, t); break; } }
        }
    },
    disc(cx, cy, rad, t, core = null) {
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const d = Math.hypot(x - cx, y - cy);
          if (d <= rad) k.set(x, y, core !== null && d < rad * 0.55 ? core : t);
        }
    },
    /** Building Agency blocks: w x h each, roof colour picked by variant. */
    blocks(list, w = 3, h = 3, t = T.BUILD) {
      list.forEach(([bx, by], n) => {
        for (let y = by; y < by + h; y++)
          for (let x = bx; x < bx + w; x++) { k.set(x, y, t); if (inb(x, y)) variant[y * W + x] = n % 4; }
      });
    },
    done() { return { land, variant }; },
  };
  return k;
}
