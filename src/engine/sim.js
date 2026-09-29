import { N, rng } from "./grid.js";
import { SPECIES } from "./species.js";
import { solve, solvePairs, makeFix, corePairs, defaultReference, connection } from "./solver.js";
import { effectiveRes, WEATHER, stormDamage } from "./weather.js";
import { computeLit, lightMul, regenerate } from "./rules.js";
import { applyEffects } from "./effects.js";
import { TOOLS, checkTool, applyTool } from "./tools.js";

/** Scored species plus the seed disperser (if different). */
export const viewSpecies = (level) => [...new Set([...level.species, level.disperser])];

export function fixesFor(level) {
  return corePairs(level).map(([a, b]) => makeFix(level, a, b));
}

export function newState(level) {
  const m = level.buildMap();
  return {
    land: m.land,
    variant: m.variant,
    grow: new Uint8Array(N),
    age: new Uint8Array(N),
    extraLit: new Uint8Array(N),
    dark: new Uint8Array(N),
    year: level.startYear,
    budget: level.budget,
    goodwill: level.goodwill,
    kills: Object.fromEntries(level.species.map((s) => [s, 0])),
    roads: level.roads.map((r) => ({ ...r, lines: r.lines.slice() })),
  };
}

/** Pre-development resistance per species per habitat pair (clear weather, no lighting). */
export function referenceFor(level, fixes) {
  const L = (level.reference || defaultReference)(level.buildMap().land);
  const out = {};
  for (const sp of viewSpecies(level)) out[sp] = fixes.map((f) => solve(L, SPECIES[sp].res, f).R);
  return out;
}

/** Solve every species for the current state and weather. */
export function computeAll(level, state, fixes, ref, weatherKey, prev = null) {
  const lit = level.night ? computeLit(state.land, state.extraLit, state.dark) : null;
  const results = {}, links = {};
  for (const sp of viewSpecies(level)) {
    results[sp] = solvePairs(state.land, effectiveRes(sp, weatherKey), fixes, prev ? prev[sp] : null, lightMul(sp, lit));
    links[sp] = connection(ref[sp], results[sp]);
  }
  return { results, links, lit };
}

/** Target connection % for a species in a level. */
export const targetFor = (level, sp) => (level.targets && level.targets[sp]) || level.target;

/**
 * Headless run of a plan, year by year like the real game: all builds go in during the first
 * planning phase (charged against the whole-chapter budget), each year's card choice is applied in
 * its year, then storms and seed-rain growth run at each year end with the level's seed.
 */
export function simulatePlan(level, plan = { choices: {}, builds: [] }) {
  const fixes = fixesFor(level);
  const ref = referenceFor(level, fixes);
  const state = newState(level);
  const years = level.lastYear - level.startYear + 1;
  let available = level.budget + level.income * (years - 1);
  let goodwillSpent = 0;
  state.budget = 1e9;
  let cost = 0;
  const errors = [];
  let prev = null, out = null;
  for (let yr = level.startYear; yr <= level.lastYear; yr++) {
    const card = level.cards[yr];
    if (card) {
      const opt = card.options[(plan.choices || {})[yr] || 0];
      goodwillSpent += opt.goodwill || 0;
      for (const e of opt.effects) if (e.op === "budget") available += e.amount;
      applyEffects(state, opt.effects.filter((e) => e.op !== "budget"));
    }
    if (yr === level.startYear) {
      for (const [tool, x, y] of plan.builds) {
        const lit = level.night ? computeLit(state.land, state.extraLit, state.dark) : null;
        const chk = checkTool(state, tool, x, y, lit);
        if (!chk.ok) { errors.push(`${tool} at ${x},${y}: ${chk.msg}`); continue; }
        applyTool(state, tool, chk.cells);
        cost += TOOLS[tool].cost;
      }
    }
    const wk = level.weather[yr] || "clear";
    out = computeAll(level, state, fixes, ref, wk, prev);
    prev = out.results;
    if (yr === level.lastYear) break;
    if (WEATHER[wk].damage === "storm") stormDamage(state, rng(level.seed + yr * 7));
    regenerate(state, out.results[level.disperser], wk);
  }
  const links = out.links;
  const won = level.species.every((sp) => links[sp] >= targetFor(level, sp));
  return { links, cost, available, goodwillSpent, errors, won, affordable: cost <= available && goodwillSpent <= level.goodwill, state };
}
