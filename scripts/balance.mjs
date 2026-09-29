// Balance report: for each chapter, connection scores for doing nothing, for the sample plan, and for
// the sample plan with every card accepted. Run with `npm run balance` after changing resistances,
// maps, cards, weather or targets. Use scripts/autoplan.mjs to search for new sample plans.
import { LEVELS } from "../src/levels/index.js";
import { simulatePlan, targetFor } from "../src/engine/sim.js";

const fmt = (L, r) => L.species.map((sp) => `${sp} ${String(r.links[sp]).padStart(3)}%/${targetFor(L, sp)}`).join("  ");

for (const L of LEVELS) {
  console.log(`\nChapter ${L.chapter}: ${L.name}  (${L.startYear}-${L.lastYear}, budget $${L.budget}k + $${L.income}k/yr)`);
  const lazy = simulatePlan(L, { choices: {}, builds: [] });
  const plan = simulatePlan(L, L.solution);
  const planAccept = simulatePlan(L, { choices: {}, builds: L.solution.builds });
  console.log(`  Do nothing                 ${fmt(L, lazy)}  ${lazy.won ? "WINS (too easy!)" : "loses"}`);
  console.log(`  Sample plan                ${fmt(L, plan)}  ${plan.won ? "wins" : "LOSES"}  $${plan.cost}/${plan.available}k, goodwill ${plan.goodwillSpent}/${L.goodwill}`);
  console.log(`  Sample builds, accept all  ${fmt(L, planAccept)}  ${planAccept.won ? "wins" : "loses"}`);
}
