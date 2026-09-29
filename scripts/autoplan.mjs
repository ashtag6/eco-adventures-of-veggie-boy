// Greedy auto-planner for balancing. Finds a cheap plan that raises the weakest species' connection,
// using each card's chosen option. Usage:
//   node scripts/autoplan.mjs <levelId> [budget] [choicesJSON]
// Prints the plan (paste into the level's `solution`) and the year-by-year simulated result.
import { LEVELS } from "../src/levels/index.js";
import { W, H } from "../src/engine/grid.js";
import { T } from "../src/engine/tiles.js";
import { TOOLS, checkTool, applyTool } from "../src/engine/tools.js";
import { applyEffects } from "../src/engine/effects.js";
import { computeLit } from "../src/engine/rules.js";
import { fixesFor, referenceFor, newState, computeAll, simulatePlan, targetFor } from "../src/engine/sim.js";

const [, , id, budgetArg, choicesArg] = process.argv;
const level = LEVELS.find((l) => l.id === id);
if (!level) { console.error("Unknown level", id); process.exit(1); }
const choices = choicesArg ? JSON.parse(choicesArg) : Object.fromEntries(Object.keys(level.cards).map((y) => [y, 1]));
const years = level.lastYear - level.startYear + 1;
let budget = budgetArg ? +budgetArg : level.budget + level.income * (years - 1);
for (const [y, c] of Object.entries(level.cards)) for (const e of c.options[choices[y] || 0].effects) if (e.op === "budget") budget += e.amount;

const fixes = fixesFor(level);
const ref = referenceFor(level, fixes);
const wk = level.weather[level.lastYear] || "clear";

// Evaluate on the post-card landscape (worst case for builds placed in year one).
function baseState() {
  const s = newState(level);
  for (const y of Object.keys(level.cards).sort()) applyEffects(s, level.cards[y].options[choices[y] || 0].effects.filter((e) => e.op !== "budget"));
  s.budget = 1e9;
  return s;
}
const score = (links) => {
  const rel = level.species.map((sp) => links[sp] / targetFor(level, sp));
  return Math.min(...rel) * 1000 + rel.reduce((a, b) => a + b, 0);
};

let plan = [];
let state = baseState();
let cur = computeAll(level, state, fixes, ref, wk);
let spent = 0;

function candidates(s, res) {
  const out = [];
  const lit = level.night ? computeLit(s.land, s.extraLit, s.dark) : null;
  for (const tool of level.tools) {
    const t = TOOLS[tool];
    if (t.kind === "crossing" || t.kind === "dim") {
      for (const road of s.roads) {
        const n = road.axis === "v" ? H : W;
        for (let p = 0; p < n; p++) {
          const [x, y] = road.axis === "v" ? [road.lines[0], p] : [p, road.lines[0]];
          const chk = checkTool(s, tool, x, y, lit);
          if (chk.ok) out.push({ acts: [[tool, x, y]], cost: t.cost });
        }
      }
    } else {
      // Strips of 3 cells through the busiest applicable cells
      const busy = [];
      for (let i = 0; i < W * H; i++) {
        const x = i % W, y = (i / W) | 0;
        if (!checkTool(s, tool, x, y, lit).ok) continue;
        const c = level.species.reduce((a, sp) => a + res[sp].cur[i] / res[sp].I, 0);
        busy.push([c, x, y]);
      }
      busy.sort((a, b) => b[0] - a[0]);
      for (const [, x, y] of busy.slice(0, 40))
        for (const [dx, dy] of [[1, 0], [0, 1]]) {
          const acts = [];
          for (let k = 0; k < 3; k++) {
            const xx = x + dx * k, yy = y + dy * k;
            if (xx < W && yy < H && checkTool(s, tool, xx, yy, lit).ok) acts.push([tool, xx, yy]);
          }
          if (acts.length) out.push({ acts, cost: t.cost * acts.length });
        }
    }
  }
  return out;
}

for (let step = 0; step < 40; step++) {
  const base = score(cur.links);
  let best = null;
  for (const c of candidates(state, cur.results)) {
    if (spent + c.cost > budget) continue;
    const s2 = { ...state, land: new Uint8Array(state.land), grow: new Uint8Array(state.grow), age: new Uint8Array(state.age), dark: new Uint8Array(state.dark), roads: state.roads };
    const lit = level.night ? computeLit(s2.land, s2.extraLit, s2.dark) : null;
    for (const [tool, x, y] of c.acts) { const chk = checkTool(s2, tool, x, y, lit); if (chk.ok) applyTool(s2, tool, chk.cells); }
    const r = computeAll(level, s2, fixes, ref, wk, cur.results);
    const gain = (score(r.links) - base) / c.cost;
    if (!best || gain > best.gain) best = { gain, c, s2, r };
  }
  if (!best || best.gain <= 0.05) break;
  plan.push(...best.c.acts);
  spent += best.c.cost;
  state = best.s2;
  cur = best.r;
  process.stderr.write(`step ${step}: ${JSON.stringify(best.c.acts)} $${spent} -> ${JSON.stringify(cur.links)}\n`);
}

const sim = simulatePlan(level, { choices, builds: plan });
console.log(JSON.stringify({ choices, builds: plan }));
console.log("simulated:", JSON.stringify(sim.links), "won", sim.won, "cost", sim.cost, "of", sim.available, sim.errors.length ? sim.errors : "");
