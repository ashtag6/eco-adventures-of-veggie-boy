// Map grid dimensions. One cell = one 8x8 px tile = one node in the circuit.
export const W = 48;
export const H = 28;
export const N = W * H;
export const TILE = 8;

export const idx = (x, y) => y * W + x;

// Seeded RNG (mulberry32) so maps and weather damage are reproducible.
export function rng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stateless per-cell hash in [0,1) for tile decoration.
export function hash(x, y, k = 0) {
  let h = (x * 374761393 + y * 668265263 + k * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
