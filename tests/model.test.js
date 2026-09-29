import { test } from "node:test";
import assert from "node:assert/strict";
import { W, H, N } from "../src/engine/grid.js";
import { T, TILE_COUNT } from "../src/engine/tiles.js";
import { SPECIES } from "../src/engine/species.js";
import { solve, makeFix, corePairs } from "../src/engine/solver.js";
import { effectiveRes } from "../src/engine/weather.js";
import { computeLit } from "../src/engine/rules.js";
import { checkTool, applyTool } from "../src/engine/tools.js";
import { newState, simulatePlan, targetFor } from "../src/engine/sim.js";
import { LEVELS } from "../src/levels/index.js";

const wudlands = LEVELS[0];

test("every species has a resistance for every tile", () => {
  for (const [k, sp] of Object.entries(SPECIES)) {
    assert.equal(sp.res.length, TILE_COUNT, k);
    assert.ok(sp.res.every((r) => r > 0 && Number.isFinite(r)), k);
  }
});

test("uniform landscape: halving resistance halves effective resistance", () => {
  const fix = makeFix(wudlands);
  const land = new Uint8Array(N).fill(T.FOREST);
  const a = solve(land, new Array(TILE_COUNT).fill(1), fix).R;
  const b = solve(land, new Array(TILE_COUNT).fill(0.5), fix).R;
  assert.ok(Math.abs(b / a - 0.5) < 1e-6, `ratio ${b / a}`);
});

test("current is conserved: flow out of source equals flow into ground", () => {
  const fix = makeFix(wudlands);
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

test("weather changes resistance by species trait", () => {
  assert.equal(effectiveRes("pangolin", "monsoon")[T.UNDER], SPECIES.pangolin.res[T.UNDER] * 25);
  assert.equal(effectiveRes("colugo", "monsoon")[T.UNDER], SPECIES.colugo.res[T.UNDER]);
  assert.ok(effectiveRes("frog", "monsoon")[T.GRASS] < SPECIES.frog.res[T.GRASS]);
  assert.ok(effectiveRes("bulbul", "haze")[T.GRASS] > SPECIES.bulbul.res[T.GRASS]);
  assert.equal(effectiveRes("bulbul", "haze")[T.FOREST], SPECIES.bulbul.res[T.FOREST]);
});

test("crossings span the whole road, on vertical and horizontal roads", () => {
  const s = newState(wudlands);
  const eco = checkTool(s, "eco", 23, 9);
  assert.ok(eco.ok);
  assert.equal(eco.cells.length, 2 * 3);
  const manday = LEVELS.find((l) => l.id === "manday");
  const m = newState(manday);
  const u = checkTool(m, "under", 20, 13);
  assert.ok(u.ok);
  assert.deepEqual(u.cells.map((i) => [i % W, (i / W) | 0]), [[20, 13], [20, 14]]);
  applyTool(m, "under", u.cells);
  assert.equal(checkTool(m, "under", 20, 14).ok, false);
});

test("wildlife lighting removes lit cells in Manday", () => {
  const manday = LEVELS.find((l) => l.id === "manday");
  const s = newState(manday);
  const lit = computeLit(s.land, s.extraLit, s.dark);
  const before = lit.reduce((a, b) => a + b, 0);
  const chk = checkTool(s, "dim", 20, 13, lit);
  assert.ok(chk.ok);
  applyTool(s, "dim", chk.cells);
  const after = computeLit(s.land, s.extraLit, s.dark).reduce((a, b) => a + b, 0);
  assert.equal(before - after, chk.cells.length);
});

test("every level has sensible data", () => {
  for (const L of LEVELS) {
    const { land } = L.buildMap();
    assert.equal(land.length, W * H, L.id);
    assert.ok(L.cores.length >= 2, L.id);
    for (const c of L.cores) assert.ok(land.some((_, i) => c.test(i % W, (i / W) | 0)), `${L.id}: empty core ${c.name}`);
    assert.ok(corePairs(L).length >= 1);
    for (const sp of [...L.species, L.disperser]) assert.ok(SPECIES[sp], `${L.id}: unknown species ${sp}`);
    for (const [y, c] of Object.entries(L.cards)) {
      assert.ok(+y >= L.startYear && +y <= L.lastYear, `${L.id}: card year ${y} outside chapter`);
      assert.ok(c.options.length >= 2 && c.options.length <= 3);
    }
  }
});

for (const L of LEVELS) {
  test(`${L.name}: the sample plan wins within budget and goodwill`, () => {
    const r = simulatePlan(L, L.solution);
    assert.deepEqual(r.errors, []);
    assert.ok(r.affordable, `cost ${r.cost} of ${r.available}, goodwill ${r.goodwillSpent}`);
    for (const sp of L.species) assert.ok(r.links[sp] >= targetFor(L, sp), `${sp} ${r.links[sp]} < ${targetFor(L, sp)}`);
  });
  test(`${L.name}: doing nothing loses`, () => {
    const r = simulatePlan(L, { choices: {}, builds: [] });
    assert.equal(r.won, false, JSON.stringify(r.links));
  });
}
