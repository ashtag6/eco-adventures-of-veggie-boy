// Balance check: prints connection % and roadkill share for scripted scenarios.
// Run with `npm run balance` after changing resistances, budgets or maps.
import { W } from "../src/engine/grid.js";
import { T } from "../src/engine/tiles.js";
import { SPECIES, SCORED } from "../src/engine/species.js";
import { solve, makeFix, referenceResistance, linkPercent, bareFraction } from "../src/engine/solver.js";
import { effectiveRes } from "../src/engine/weather.js";
import { applyEffects } from "../src/engine/effects.js";
import { LEVELS } from "../src/levels/index.js";

for (const level of LEVELS) {
  const fix = makeFix(level);
  const base = level.buildMap();
  const ref = referenceResistance(base.land, fix, SPECIES);
  const mk = () => ({ land: new Uint8Array(base.land), grow: new Uint8Array(base.land.length), age: new Uint8Array(base.land.length), roadCols: level.roadCols.slice(), budget: 0, goodwill: 0 });
  const report = (label, s, weather = "clear") => {
    const cols = SCORED.map((sp) => {
      const r = solve(s.land, effectiveRes(sp, SPECIES[sp].res, weather), fix);
      return `${sp} ${String(linkPercent(ref[sp], r.R)).padStart(3)}% (bare ${(100 * bareFraction(s.land, r.cur, s.roadCols)).toFixed(0)}%)`;
    });
    console.log(`  ${label.padEnd(44)} ${cols.join("   ")}`);
  };
  const cross = (s, tile, rows) => { for (const y of rows) for (const x of s.roadCols) s.land[y * W + x] = T[tile]; };

  console.log(`\n${level.title} (target ${level.target}%)`);
  let s = mk(); report("Baseline", s);
  s = mk(); cross(s, "ECO", [9, 10]); report("One eco-bridge", s);
  s = mk(); cross(s, "UNDER", [9]); cross(s, "ROPE", [12]); report("Underpass + rope bridge", s);
  s = mk(); cross(s, "UNDER", [9]); report("Underpass, monsoon year", s, "monsoon");
  s = mk(); cross(s, "ECO", [9, 10]);
  for (const [y, card] of Object.entries(level.cards)) applyEffects(s, card.options[0].effects);
  report("Eco-bridge, all cards accepted", s);
  s = mk(); cross(s, "ECO", [9, 10]);
  for (const [y, card] of Object.entries(level.cards)) applyEffects(s, card.options[card.options.length - 1].effects);
  report("Eco-bridge, all cards negotiated", s);
}
