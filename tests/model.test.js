import { test } from "node:test";
import assert from "node:assert/strict";
import { W, H, N } from "../src/engine/grid.js";
import { T } from "../src/engine/tiles.js";
import { SPECIES } from "../src/engine/species.js";
import { solve, makeFix, referenceResistance, linkPercent, bareFraction } from "../src/engine/solver.js";
import { effectiveRes } from "../src/engine/weather.js";
import wudlands from "../src/levels/wudlands.js";

const fix = makeFix(wudlands);

test("uniform landscape: halving resistance halves effective resistance", () => {
  const land = new Uint8Array(N).fill(T.FOREST);
  const a = solve(land, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], fix).R;
  const b = solve(land, [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], fix).R;
  assert.ok(Math.abs(b / a - 0.5) < 1e-6, `ratio ${b / a}`);
});

test("current is conserved: flow out of source equals flow into ground", () => {
  const { land } = wudlands.buildMap();
  const r = solve(land, SPECIES.pangolin.res, fix);
  let into = 0;
  for (let i = 0; i < N; i++) {
    if (r.fix[i] !== 2) continue;
    const x = i % W;
    const nb = [];
    if (x < W - 1) nb.push([i + 1, r.gE[i]]);
    if (x > 0) nb.push([i - 1, r.gE[i - 1]]);
    if (i + W < N) nb.push([i + W, r.gS[i]]);
    if (i - W >= 0) nb.push([i - W, r.gS[i - W]]);
    for (const [j, g] of nb) if (r.fix[j] !== 2) into += g * (r.V[j] - r.V[i]);
  }
  assert.ok(Math.abs(into - r.I) / r.I < 1e-4, `out ${r.I} in ${into}`);
});

test("Wudlands baseline is well below target and an eco-bridge helps both species", () => {
  const { land } = wudlands.buildMap();
  const ref = referenceResistance(land, fix, SPECIES);
  const base = (sp, L) => linkPercent(ref[sp], solve(L, SPECIES[sp].res, fix).R);
  assert.ok(base("pangolin", land) < 30);
  assert.ok(base("colugo", land) < 20);
  const L = new Uint8Array(land);
  for (const y of [9, 10]) for (const x of wudlands.roadCols) L[y * W + x] = T.ECO;
  assert.ok(base("pangolin", L) > base("pangolin", land) + 15);
  assert.ok(base("colugo", L) > base("colugo", land) + 15);
  const r = solve(L, SPECIES.pangolin.res, fix);
  assert.ok(bareFraction(L, r.cur, wudlands.roadCols) < 0.5);
});

test("monsoon floods underpasses for pangolins only", () => {
  const p = effectiveRes("pangolin", SPECIES.pangolin.res, "monsoon");
  const c = effectiveRes("colugo", SPECIES.colugo.res, "monsoon");
  assert.equal(p[T.UNDER], SPECIES.pangolin.res[T.UNDER] * 25);
  assert.equal(c[T.UNDER], SPECIES.colugo.res[T.UNDER]);
});

test("map has expected size", () => {
  const { land } = wudlands.buildMap();
  assert.equal(land.length, W * H);
});
