import { W, H, N, rng } from "./engine/grid.js";
import { SPECIES } from "./engine/species.js";
import { coreCells, corePairs } from "./engine/solver.js";
import { WEATHER, effectiveRes, stormDamage } from "./engine/weather.js";
import { roadkill, regenerate } from "./engine/rules.js";
import { applyEffects } from "./engine/effects.js";
import { TOOLS, checkTool, applyTool } from "./engine/tools.js";
import { newState, fixesFor, referenceFor, computeAll, viewSpecies, targetFor } from "./engine/sim.js";
import { typicalFlow } from "./render/fx.js";

const plural = (n, one, many = one + "s") => `${n} ${n === 1 ? one : many}`;
const list = (a) => (a.length <= 1 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);

/**
 * Game controller for one chapter. Owns state, runs the model and drives the story.
 * ui = { say(speaker, text, buttons), hud(), landChanged(), readout(text), moveVeggie(x, y), sfx(name),
 *        complete(level, stars), exit() }
 */
export class Game {
  constructor(level, ui) {
    this.level = level;
    this.ui = ui;
    this.fixes = fixesFor(level);
    this.pairs = corePairs(level);
    this.cores = coreCells(level);
    this.fixAny = new Uint8Array(N);
    this.cores.forEach((cells) => cells.forEach((i) => { this.fixAny[i] = 1; }));
    this.res = null;
    this.links = {};
    this.lit = null;
    this.walkers = [];
    this.poofs = [];
    this.computeTimer = null;
  }

  start() {
    this.ref = referenceFor(this.level, this.fixes);
    this.state = { ...newState(this.level), phase: "intro", sp: this.level.species[0], tool: this.level.tools[0], showCur: true, psi: 0 };
    this.compute();
    this.intro(0);
  }

  get view() {
    return viewSpecies(this.level);
  }

  target(sp) {
    return targetFor(this.level, sp);
  }

  weatherKey() {
    return this.level.weather[this.state.year] || "clear";
  }

  resFor(sp) {
    return effectiveRes(sp, this.weatherKey());
  }

  compute() {
    const out = computeAll(this.level, this.state, this.fixes, this.ref, this.weatherKey(), this.res);
    this.res = out.results;
    this.links = out.links;
    this.lit = out.lit;
    for (const sp of Object.keys(this.res)) this.res[sp].typical = typicalFlow(this.res[sp].cur, this.fixAny);
    this.ui.landChanged();
    this.ui.hud();
  }

  scheduleCompute() {
    if (this.computeTimer) return;
    this.computeTimer = setTimeout(() => {
      this.computeTimer = null;
      this.compute();
    }, 60);
  }

  setSpecies(k) {
    this.state.sp = k;
    this.walkers = [];
    this.ui.hud();
  }

  setTool(id) {
    if (this.state.phase !== "plan" || !this.level.tools.includes(id)) return;
    this.state.tool = id;
    this.ui.hud();
  }

  /* ---------- building ---------- */
  toolCheck(x, y) {
    const S = this.state;
    if (S.tool === "inspect") return { ok: false, msg: "" };
    if (S.phase !== "plan") return { ok: false, msg: "Finish the conversation first." };
    return checkTool(S, S.tool, x, y, this.lit);
  }

  place(x, y) {
    const c = this.toolCheck(x, y);
    if (!c.ok) {
      if (c.msg) { this.ui.readout(c.msg); this.ui.sfx("error"); }
      return false;
    }
    const tool = TOOLS[this.state.tool];
    applyTool(this.state, this.state.tool, c.cells);
    this.ui.sfx(tool.kind === "paint" || tool.kind === "boardwalk" ? "plant" : "build");
    this.ui.moveVeggie(x, y);
    this.ui.landChanged();
    this.ui.hud();
    this.scheduleCompute();
    return true;
  }

  /* ---------- story flow ---------- */
  intro(k = 0) {
    const L = this.level;
    this.state.phase = "intro";
    this.ui.hud();
    const last = k >= L.intro.length - 1;
    this.ui.say("veggie", L.intro[k], [
      { label: last ? "Let's grow!" : "Next ▶", fn: () => (last ? this.startYear() : this.intro(k + 1)) },
      ...(k === 0 ? [] : [{ label: "Skip", cls: "ghost", fn: () => this.startYear() }]),
    ]);
  }

  startYear() {
    const S = this.state;
    if (this.weatherKey() === "haze") S.psi = 150 + Math.floor(rng(this.level.seed + S.year)() * 100);
    this.compute();
    const card = this.level.cards[S.year];
    if (!card) return this.weatherStep();
    S.phase = "card";
    this.ui.hud();
    this.ui.sfx("baron");
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
    const wk = this.weatherKey();
    const w = WEATHER[wk];
    if (!w.forecast) return this.plan();
    this.state.phase = "weather";
    this.ui.hud();
    const text = wk === "haze" ? `${w.forecast} PSI is ${this.state.psi}: unhealthy.` : w.forecast;
    this.ui.say("veggie", text, [{ label: "Start planning ▶", fn: () => this.plan() }]);
  }

  plan() {
    const S = this.state;
    S.phase = "plan";
    this.ui.hud();
    const behind = this.level.species.filter((sp) => this.links[sp] < this.target(sp));
    let tip;
    if (!behind.length) tip = "Every species is above target. Keep it that way, and watch for Baron Tarmac's next move!";
    else {
      const sp = behind.sort((a, b) => this.links[a] / this.target(a) - this.links[b] / this.target(b))[0];
      tip = `${SPECIES[sp].short}s are furthest behind (${this.links[sp]}% of ${this.target(sp)}%). ${SPECIES[sp].blurb}`;
    }
    const lastYear = S.year === this.level.lastYear ? " This is the final year!" : "";
    this.ui.say("veggie", `${S.year} planning. You have $${S.budget}k.${lastYear} ${tip} Press End year when you're done.`, []);
  }

  endYear() {
    const S = this.state, L = this.level;
    if (S.phase !== "plan") return;
    S.phase = "review";
    const wk = this.weatherKey();
    const k = roadkill(S, this.res, L.killScale);
    for (const sp of Object.keys(k)) S.kills[sp] = (S.kills[sp] || 0) + k[sp];

    let weatherLine = "";
    if (WEATHER[wk].damage === "storm") {
      const d = stormDamage(S, rng(L.seed + S.year * 7));
      weatherLine = d.saplings || d.ropes
        ? `The storms uprooted ${plural(d.saplings, "young plant")}${d.ropes ? ` and snapped ${plural(d.ropes, "rope bridge")}` : ""}. `
        : "Your planting rode out the storms. ";
    }
    if (wk === "haze") weatherLine = "The haze kept the birds grounded, so seed rain was halved. ";
    if (wk === "monsoon") weatherLine = "Monsoon floods filled the underpasses and raced down the concrete canals, but saplings grew fast. ";

    const g = regenerate(S, this.res[L.disperser], wk);
    const yr = S.year;
    this.ui.sfx("yearEnd");
    this.compute();

    const growth = [
      g.matured ? `${plural(g.matured, "sapling")} grew into scrub` : "",
      g.forested ? `${plural(g.forested, "scrub patch", "scrub patches")} became forest` : "",
      g.mangroves ? `${plural(g.mangroves, "mangrove")} took root` : "",
      g.wild ? `${plural(g.wild, "grass patch", "grass patches")} regenerated naturally` : "",
    ].filter(Boolean);
    const kills = Object.entries(k).map(([sp, n]) => plural(n, SPECIES[sp].short.toLowerCase()));
    let msg = `${yr} review. Roadkill: ${list(kills)}. ${weatherLine}`;
    if (growth.length) msg += `Seed rain: ${list(growth)}. `;
    msg += `Connection: ${list(L.species.map((sp) => `${SPECIES[sp].short.toLowerCase()} ${this.links[sp]}%`))}.`;

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
    const onTarget = L.species.filter((sp) => this.links[sp] >= this.target(sp));
    const won = onTarget.length === L.species.length;
    const kills = Object.values(S.kills).reduce((a, b) => a + b, 0);
    const stars = won ? 1 + (L.species.every((sp) => this.links[sp] >= this.target(sp) + 10) ? 1 : 0) + (kills <= L.starKills ? 1 : 0) : 0;
    this.ui.sfx(won ? "win" : "lose");
    const scores = list(L.species.map((sp) => `${SPECIES[sp].short.toLowerCase()} ${this.links[sp]}%`));
    if (won) {
      this.ui.complete(L, stars);
      const next = this.ui.nextLevel(L);
      const rating = `Rating: ${"★".repeat(stars)}${"☆".repeat(3 - stars)}`;
      if (next)
        this.ui.say("veggie",
          `Chapter complete! ${L.name} is reconnected: ${scores}, with ${kills} roadkills in total. ${rating} (one star for reaching every target, one for beating every target by 10 points, one for ${L.starKills} roadkills or fewer).`,
          [
            { label: `Next: ${next.name} ▶`, cls: "primary", fn: () => this.ui.play(next) },
            { label: "Chapter select", fn: () => this.ui.exit() },
            { label: "Play again", fn: () => this.restart() },
          ]);
      else
        this.ui.say("veggie",
          `You did it! Singacity is connected from Wudlands to Sentosaur Island: ${scores}, ${kills} roadkills. ${rating}. Baron Tarmac has gone to sulk in a car park. The future I saw doesn't have to happen.`,
          [{ label: "Chapter select", cls: "primary", fn: () => this.ui.exit() }, { label: "Play again", fn: () => this.restart() }]);
    } else {
      const missed = L.species.filter((sp) => !onTarget.includes(sp)).map((sp) => SPECIES[sp].short.toLowerCase() + "s");
      this.ui.say("baron",
        `Mwahaha! The ${list(missed)} are still cut off. Final scores: ${scores}. Better luck next time, Veggie Boy!`,
        [{ label: "Try again", cls: "primary", fn: () => this.restart() }, { label: "Chapter select", fn: () => this.ui.exit() }]);
    }
  }

  restart() {
    this.res = null;
    this.walkers = [];
    this.start();
  }
}

export { W, H };
