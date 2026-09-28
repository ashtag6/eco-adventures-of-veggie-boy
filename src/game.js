import { W, H, N, rng } from "./engine/grid.js";
import { T } from "./engine/tiles.js";
import { SPECIES, SPECIES_KEYS, SCORED } from "./engine/species.js";
import { solve, makeFix, referenceResistance, linkPercent } from "./engine/solver.js";
import { WEATHER, effectiveRes, stormDamage } from "./engine/weather.js";
import { roadkill, regenerate } from "./engine/rules.js";
import { applyEffects } from "./engine/effects.js";
import { TOOLS } from "./ui/hud.js";

const plural = (n, one, many = one + "s") => `${n} ${n === 1 ? one : many}`;

/**
 * Game controller for one level. Owns state, runs the circuit model and drives the story.
 * `ui` = { say(speaker, text, buttons), hud(), landChanged(), readout(text), moveVeggie(x, y), sfx(name) }
 */
export class Game {
  constructor(level, ui) {
    this.level = level;
    this.ui = ui;
    this.res = {};
    this.links = {};
    this.walkers = [];
    this.poofs = [];
    this.fix = makeFix(level);
    this.computeTimer = null;
  }

  newState() {
    const L = this.level;
    const m = L.buildMap();
    return {
      land: m.land,
      variant: m.variant,
      grow: new Uint8Array(N),
      age: new Uint8Array(N),
      year: L.startYear,
      budget: L.budget,
      goodwill: L.goodwill,
      kills: { pangolin: 0, colugo: 0 },
      roadCols: L.roadCols.slice(),
      phase: "intro",
      sp: "pangolin",
      tool: "plant",
      showCur: true,
      psi: 0,
    };
  }

  start(saved) {
    this.ref = referenceResistance(this.level.buildMap().land, this.fix, SPECIES);
    if (saved) {
      const s = this.newState();
      for (const k of ["land", "variant", "grow", "age"]) s[k] = Uint8Array.from(saved[k]);
      for (const k of ["year", "budget", "goodwill", "kills", "roadCols", "sp", "tool", "showCur", "psi"]) s[k] = saved[k];
      this.state = s;
      this.compute();
      if (saved.phase === "over") this.finish();
      else this.plan();
    } else {
      this.state = this.newState();
      this.compute();
      this.intro(0);
    }
  }

  snapshot() {
    const s = this.state;
    return {
      land: Array.from(s.land), variant: Array.from(s.variant), grow: Array.from(s.grow), age: Array.from(s.age),
      year: s.year, budget: s.budget, goodwill: s.goodwill, kills: s.kills, roadCols: s.roadCols,
      phase: s.phase, sp: s.sp, tool: s.tool, showCur: s.showCur, psi: s.psi,
    };
  }

  weatherKey() {
    return this.level.weather[this.state.year] || "clear";
  }

  resFor(sp) {
    return effectiveRes(sp, SPECIES[sp].res, this.weatherKey());
  }

  compute() {
    for (const k of SPECIES_KEYS) {
      const prev = this.res[k] ? this.res[k].V : null;
      this.res[k] = solve(this.state.land, this.resFor(k), this.fix, prev);
    }
    for (const k of SPECIES_KEYS) this.links[k] = linkPercent(this.ref[k], this.res[k].R);
    this.ui.landChanged();
    this.ui.hud();
  }

  scheduleCompute() {
    if (this.computeTimer) return;
    this.computeTimer = setTimeout(() => {
      this.computeTimer = null;
      this.compute();
    }, 70);
  }

  setSpecies(k) {
    this.state.sp = k;
    this.walkers = [];
    this.ui.hud();
  }

  setTool(id) {
    if (this.state.phase !== "plan") return;
    this.state.tool = id;
    this.ui.hud();
  }

  /* ---------- building ---------- */
  toolCheck(x, y) {
    const S = this.state, L = S.land, i = y * W + x;
    const t = TOOLS.find((q) => q.id === S.tool);
    if (S.tool === "inspect") return { ok: false, msg: "" };
    if (S.phase !== "plan") return { ok: false, msg: "Finish the conversation first." };
    if (t.cost > S.budget) return { ok: false, msg: "Not enough budget." };
    if (S.tool === "plant") return L[i] === T.GRASS ? { ok: true, cells: [i] } : { ok: false, msg: "Saplings go on grass." };
    if (!S.roadCols.includes(x)) return { ok: false, msg: "Crossings go on the expressway." };
    const rows = S.tool === "eco" ? [y, y + 1] : [y];
    if (y + rows.length > H) return { ok: false, msg: "No room here." };
    const cells = [];
    for (const r of rows)
      for (const cx of S.roadCols) {
        const j = r * W + cx;
        if (L[j] !== T.ROAD) return { ok: false, msg: "There's already a crossing here." };
        cells.push(j);
      }
    return { ok: true, cells };
  }

  place(x, y) {
    const c = this.toolCheck(x, y);
    if (!c.ok) {
      if (c.msg) { this.ui.readout(c.msg); this.ui.sfx?.("error"); }
      return;
    }
    const S = this.state;
    const t = TOOLS.find((q) => q.id === S.tool);
    S.budget -= t.cost;
    const nt = { plant: T.SAPLING, rope: T.ROPE, under: T.UNDER, eco: T.ECO }[S.tool];
    for (const i of c.cells) {
      S.land[i] = nt;
      if (nt === T.SAPLING) { S.grow[i] = 1; S.age[i] = 0; }
    }
    this.ui.sfx?.(S.tool === "plant" ? "plant" : "build");
    this.ui.moveVeggie(x, y);
    this.ui.landChanged();
    this.ui.hud();
    this.scheduleCompute();
  }

  /* ---------- story flow ---------- */
  intro(k = 0) {
    const L = this.level;
    this.state.phase = "intro";
    this.ui.hud();
    const last = k >= L.intro.length - 1;
    this.ui.say("veggie", L.intro[k], [{ label: last ? "Let's grow!" : "Next ▶", fn: () => (last ? this.startYear() : this.intro(k + 1)) }]);
  }

  startYear() {
    const S = this.state;
    const wk = this.weatherKey();
    if (wk === "haze") S.psi = 150 + Math.floor(rng(this.level.seed + S.year)() * 100);
    this.compute();
    const card = this.level.cards[S.year];
    if (!card) return this.weatherStep();
    S.phase = "card";
    this.ui.hud();
    this.ui.sfx?.("baron");
    this.ui.say(
      "baron",
      card.text,
      card.options.map((o) => ({
        label: o.goodwill ? `${o.label} (-${o.goodwill} ♥)` : o.label,
        disabled: (o.goodwill || 0) > S.goodwill,
        fn: () => {
          if (o.goodwill) S.goodwill -= o.goodwill;
          const changed = applyEffects(S, o.effects);
          this.walkers = [];
          if (changed) this.compute();
          else this.ui.hud();
          this.ui.say("veggie", o.reply, [{ label: "Continue ▶", fn: () => this.weatherStep() }]);
        },
      })),
    );
  }

  weatherStep() {
    const w = WEATHER[this.weatherKey()];
    if (!w.forecast) return this.plan();
    this.state.phase = "weather";
    this.ui.hud();
    const text = this.weatherKey() === "haze" ? `${w.forecast} PSI is ${this.state.psi}: unhealthy.` : w.forecast;
    this.ui.say("veggie", text, [{ label: "Start planning ▶", fn: () => this.plan() }]);
  }

  plan() {
    const S = this.state, L = this.level;
    S.phase = "plan";
    this.ui.hud();
    const tip =
      this.links.pangolin < L.target
        ? "Pangolins are still stuck. Look for the bottleneck, where their trails bunch up at the expressway, and put an underpass or eco-bridge there."
        : this.links.colugo < L.target
          ? "Colugos can't glide over open grass. Give them a rope bridge or eco-bridge, then plant a line of saplings leading up to it."
          : "Both links are above target. Keep them there!";
    this.ui.say("veggie", `${S.year} planning. You have $${S.budget}k. ${tip} Press End year when you're done.`, []);
  }

  endYear() {
    const S = this.state, L = this.level;
    if (S.phase !== "plan") return;
    S.phase = "review";
    const wk = this.weatherKey();
    const k = roadkill(S, this.res, L.killScale);
    for (const sp of SCORED) S.kills[sp] += k[sp];

    let weatherLine = "";
    if (WEATHER[wk].damage === "storm") {
      const d = stormDamage(S, rng(L.seed + S.year * 7));
      weatherLine =
        d.saplings || d.ropes
          ? `The storms uprooted ${plural(d.saplings, "sapling")}${d.ropes ? ` and snapped ${plural(d.ropes, "rope bridge")}` : ""}. `
          : "Your planting rode out the storms. ";
    }
    if (wk === "haze") weatherLine = "The haze kept bulbuls grounded, so seed rain was halved. ";
    if (wk === "monsoon") weatherLine = "Monsoon rain flooded the underpasses, but saplings grew fast. ";

    const g = regenerate(S, this.res.bulbul, wk);
    const yr = S.year;
    this.ui.sfx?.("yearEnd");
    this.compute();

    const growth = [
      g.matured ? `${plural(g.matured, "sapling")} grew into scrub` : "",
      g.forested ? `${plural(g.forested, "scrub patch", "scrub patches")} became forest` : "",
      g.wild ? `${plural(g.wild, "grass cell")} regenerated naturally` : "",
    ].filter(Boolean);
    let msg = `${yr} review. Roadkill on the expressway: ${plural(k.pangolin, "pangolin")}, ${plural(k.colugo, "colugo")}. ${weatherLine}`;
    if (growth.length) msg += `Seed rain: ${growth.join(", ")}. `;
    msg += `Connection: pangolin ${this.links.pangolin}%, colugo ${this.links.colugo}%.`;

    if (yr >= L.lastYear) {
      this.ui.hud();
      return this.ui.say("veggie", msg, [{ label: "See results ▶", fn: () => this.finish() }]);
    }
    S.budget += L.income;
    S.year++;
    this.compute();
    this.ui.say("veggie", `${msg} Budget +$${L.income}k.`, [{ label: `On to ${S.year} ▶`, fn: () => this.startYear() }]);
  }

  finish() {
    const S = this.state, L = this.level;
    S.phase = "over";
    this.ui.hud();
    const p = this.links.pangolin >= L.target, c = this.links.colugo >= L.target;
    const kills = S.kills.pangolin + S.kills.colugo;
    const stars = (p ? 1 : 0) + (c ? 1 : 0) + (kills <= L.starKills ? 1 : 0);
    this.ui.sfx?.(p && c ? "win" : "lose");
    const head = p && c ? `Chapter complete! ${L.name} is reconnected.` : `Not quite. ${!p && !c ? "Both species are" : !p ? "Pangolins are" : "Colugos are"} still cut off.`;
    this.ui.say(
      p && c ? "veggie" : "baron",
      `${head} Pangolin ${this.links.pangolin}%, colugo ${this.links.colugo}%, ${kills} roadkills in total. Rating: ${"★".repeat(stars)}${"☆".repeat(3 - stars)} (one star per species on target, one for ${L.starKills} roadkills or fewer).`,
      [{ label: "Play again", cls: "primary", fn: () => this.restart() }],
    );
  }

  restart() {
    this.res = {};
    this.walkers = [];
    this.state = this.newState();
    this.compute();
    this.intro(0);
  }
}
