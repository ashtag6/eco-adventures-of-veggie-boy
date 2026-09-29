import { W, H, N } from "./grid.js";
import { T, roadLike } from "./tiles.js";

/** All unordered pairs of home habitats: [[0,1]] for two, [[0,1],[0,2],[1,2]] for three. */
export function corePairs(level) {
  const out = [];
  for (let a = 0; a < level.cores.length; a++) for (let b = a + 1; b < level.cores.length; b++) out.push([a, b]);
  return out;
}

/** Cell lists for each home habitat. */
export function coreCells(level) {
  return level.cores.map((c) => {
    const cells = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (c.test(x, y)) cells.push(y * W + x);
    return cells;
  });
}

/** Fixed-node mask for one pair: 1 = source (V = 1), 2 = ground (V = 0). Other habitats are ordinary cells. */
export function makeFix(level, a = 0, b = 1) {
  const fix = new Int8Array(N);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (level.cores[a].test(x, y)) fix[i] = 1;
      else if (level.cores[b].test(x, y)) fix[i] = 2;
    }
  return fix;
}

/**
 * Circuit-theory solve on a 4-neighbour grid (Circuitscape-style average-resistance edges).
 * Source held at 1 V, ground at 0 V, Laplacian solved by Jacobi-preconditioned conjugate gradient.
 * `mul` (optional) multiplies each cell's resistance, used for night lighting.
 * Returns voltages, per-cell current, total current I and effective resistance R = 1/I.
 */
export function solve(land, res, fix, V0 = null, mul = null) {
  const r = new Float64Array(N);
  const gE = new Float64Array(N);
  const gS = new Float64Array(N);
  for (let i = 0; i < N; i++) r[i] = res[land[i]] * (mul ? mul[i] : 1);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (x < W - 1) gE[i] = 2 / (r[i] + r[i + 1]);
      if (y < H - 1) gS[i] = 2 / (r[i] + r[i + W]);
    }

  const V = new Float64Array(N);
  const D = new Float64Array(N);
  const b = new Float64Array(N);
  for (let i = 0; i < N; i++) V[i] = fix[i] === 1 ? 1 : fix[i] === 2 ? 0 : V0 ? V0[i] : 0.5;

  for (let i = 0; i < N; i++) {
    if (fix[i]) continue;
    const x = i % W;
    let d = 0, bb = 0, g;
    if (x < W - 1) { g = gE[i]; d += g; if (fix[i + 1] === 1) bb += g; }
    if (x > 0) { g = gE[i - 1]; d += g; if (fix[i - 1] === 1) bb += g; }
    if (i + W < N) { g = gS[i]; d += g; if (fix[i + W] === 1) bb += g; }
    if (i - W >= 0) { g = gS[i - W]; d += g; if (fix[i - W] === 1) bb += g; }
    D[i] = d;
    b[i] = bb;
  }

  const Ax = (p, out) => {
    for (let i = 0; i < N; i++) {
      if (fix[i]) { out[i] = 0; continue; }
      const x = i % W;
      let s = D[i] * p[i];
      if (x < W - 1 && !fix[i + 1]) s -= gE[i] * p[i + 1];
      if (x > 0 && !fix[i - 1]) s -= gE[i - 1] * p[i - 1];
      if (i + W < N && !fix[i + W]) s -= gS[i] * p[i + W];
      if (i - W >= 0 && !fix[i - W]) s -= gS[i - W] * p[i - W];
      out[i] = s;
    }
  };

  const R = new Float64Array(N), Z = new Float64Array(N), P = new Float64Array(N), Q = new Float64Array(N);
  let bn = 0, rz = 0;
  Ax(V, Q);
  for (let i = 0; i < N; i++)
    if (!fix[i]) {
      R[i] = b[i] - Q[i];
      Z[i] = R[i] / D[i];
      P[i] = Z[i];
      bn += b[i] * b[i];
      rz += R[i] * Z[i];
    }
  if (bn === 0) bn = 1e-30;
  for (let it = 0; it < 6000; it++) {
    Ax(P, Q);
    let pq = 0;
    for (let i = 0; i < N; i++) pq += P[i] * Q[i];
    if (pq === 0) break;
    const a = rz / pq;
    let rr = 0;
    for (let i = 0; i < N; i++)
      if (!fix[i]) { V[i] += a * P[i]; R[i] -= a * Q[i]; rr += R[i] * R[i]; }
    if (rr < 1e-18 * bn) break;
    let rz2 = 0;
    for (let i = 0; i < N; i++) if (!fix[i]) { Z[i] = R[i] / D[i]; rz2 += R[i] * Z[i]; }
    const beta = rz2 / rz;
    rz = rz2;
    for (let i = 0; i < N; i++) if (!fix[i]) P[i] = Z[i] + beta * P[i];
  }

  const cur = new Float64Array(N);
  let I = 0;
  for (let i = 0; i < N; i++) {
    const x = i % W;
    let s = 0;
    if (x < W - 1) s += gE[i] * Math.abs(V[i] - V[i + 1]);
    if (x > 0) s += gE[i - 1] * Math.abs(V[i] - V[i - 1]);
    if (i + W < N) s += gS[i] * Math.abs(V[i] - V[i + W]);
    if (i - W >= 0) s += gS[i - W] * Math.abs(V[i] - V[i - W]);
    cur[i] = s / 2;
    if (fix[i] === 1) {
      if (x < W - 1 && fix[i + 1] !== 1) I += gE[i] * (V[i] - V[i + 1]);
      if (x > 0 && fix[i - 1] !== 1) I += gE[i - 1] * (V[i] - V[i - 1]);
      if (i + W < N && fix[i + W] !== 1) I += gS[i] * (V[i] - V[i + W]);
      if (i - W >= 0 && fix[i - W] !== 1) I += gS[i - W] * (V[i] - V[i - W]);
    }
  }
  return { V, cur, I, R: 1 / I, gE, gS, fix };
}

/**
 * Solve every habitat pair for one species (Circuitscape pairwise mode).
 * `cur` is cumulative current over all pairs; `I` is the summed pair current, so cur / I is a cell's
 * share of all movement. `prev` warm-starts from the last solve.
 */
export function solvePairs(land, res, fixes, prev = null, mul = null) {
  const pairs = fixes.map((fix, k) => solve(land, res, fix, prev ? prev.pairs[k].V : null, mul));
  const cur = new Float64Array(N);
  let I = 0;
  for (const p of pairs) {
    for (let i = 0; i < N; i++) cur[i] += p.cur[i];
    I += p.I;
  }
  return { pairs, cur, I };
}

/** Share of current on road cells that crosses bare tarmac rather than a crossing structure. */
export function bareFraction(land, cur) {
  let tot = 0, bare = 0;
  for (let i = 0; i < N; i++) {
    const t = land[i];
    if (!roadLike(t)) continue;
    tot += cur[i];
    if (t === T.ROAD) bare += cur[i];
  }
  return tot ? bare / tot : 0;
}

/** Default "before development" landscape: every road cell restored to forest. */
export function defaultReference(land) {
  const L = new Uint8Array(land);
  for (let i = 0; i < N; i++) if (roadLike(L[i])) L[i] = T.FOREST;
  return L;
}

/**
 * Connection % = sqrt(R_reference / R_now), capped at 100. The square root spreads the scale so each
 * good action moves the meter visibly; the ranking of landscapes is the same as the raw ratio.
 */
export const linkPercent = (Rref, Rnow) => Math.min(100, Math.round(100 * Math.sqrt(Rref / Rnow)));

/** Connection for a species = its weakest habitat pair. */
export function connection(refPairs, solved) {
  let min = 100;
  solved.pairs.forEach((p, k) => { min = Math.min(min, linkPercent(refPairs[k], p.R)); });
  return min;
}
