import { SPECIES } from "../engine/species.js";
import { TYPE_NAMES, TYPE_SWATCH } from "../engine/tiles.js";
import { WEATHER } from "../engine/weather.js";
import { TOOLS } from "../engine/tools.js";
import { TRAIL_BANDS } from "../render/fx.js";
import { drawTile, rect } from "../render/tiles.js";
import { drawWalker } from "../render/sprites.js";

// Player-facing translation of resistance values. Raw numbers stay in species.js.
export function difficulty(r) {
  if (r <= 2) return { word: "Easy", pips: 1 };
  if (r <= 6) return { word: "Fair", pips: 2 };
  if (r <= 40) return { word: "Tough", pips: 3 };
  if (r <= 400) return { word: "Very hard", pips: 4 };
  return { word: "Barrier", pips: 5 };
}

const $ = (id) => document.getElementById(id);

function icon(draw) {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 8;
  c.className = "ico";
  draw(c.getContext("2d"));
  return c;
}

export function buildPanel(game) {
  const L = game.level;
  $("chapter").textContent = `Chapter ${L.chapter}: ${L.title}`;

  const meters = $("meters");
  meters.innerHTML = "";
  for (const sp of L.species) {
    const m = document.createElement("div");
    m.className = "meter";
    m.id = "m-" + sp;
    m.innerHTML = `<span class="lbl">${SPECIES[sp].short} connection</span><div class="meterrow"><div class="bar"><i></i><b title="Target ${game.target(sp)}%"></b></div><span class="pct">0%</span></div>`;
    m.querySelector("b").style.left = game.target(sp) + "%";
    meters.appendChild(m);
  }

  const spEl = $("species");
  spEl.innerHTML = "";
  for (const k of game.view) {
    const b = document.createElement("button");
    b.dataset.sp = k;
    b.appendChild(icon((c) => { rect(c, 0, 0, 8, 8, "#22246a"); drawWalker(c, k, 0, 0); }));
    const s = document.createElement("span");
    s.textContent = SPECIES[k].name + (L.species.includes(k) ? "" : " (seed carrier)");
    b.appendChild(s);
    b.onclick = () => game.setSpecies(k);
    spEl.appendChild(b);
  }

  const tl = $("tools");
  tl.innerHTML = "";
  ["inspect", ...L.tools].forEach((id, n) => {
    const t = TOOLS[id];
    const b = document.createElement("button");
    b.dataset.tool = id;
    b.dataset.key = String(n + 1);
    b.appendChild(icon((c) => {
      if (t.kind === "inspect") {
        rect(c, 0, 0, 8, 8, "#22246a"); rect(c, 1, 1, 4, 4, "#e8e6ff"); rect(c, 2, 2, 2, 2, "#22246a"); rect(c, 5, 5, 2, 2, "#e8e6ff");
      } else if (t.kind === "dim") {
        rect(c, 0, 0, 8, 8, "#0a0d2e"); rect(c, 3, 2, 2, 5, "#5a5a66"); rect(c, 2, 1, 4, 1, "#ff9f3a"); rect(c, 3, 2, 2, 1, "#ffcf7a");
      } else drawTile(c, 0, 0, t.icon, 0, 0, () => -1, 0, "v");
    }));
    const s = document.createElement("span");
    s.textContent = t.label;
    b.appendChild(s);
    const cost = document.createElement("span");
    cost.className = "cost";
    cost.textContent = t.cost ? `$${t.cost}k` : "";
    b.appendChild(cost);
    b.title = `Shortcut: ${n + 1}`;
    b.onclick = () => game.setTool(id);
    tl.appendChild(b);
  });

  $("legend").innerHTML =
    `<span class="lg-title">Trails</span>` +
    TRAIL_BANDS.slice().reverse().map((b) => `<span class="lg"><i class="sw ${b.key}" style="background:${b.colour};opacity:${b.key === "quiet" ? 0.45 : b.key === "busy" ? 0.75 : 1}"></i>${b.label}</span>`).join("") +
    (L.night ? `<span class="lg"><i class="sw" style="background:#a9c8ff"></i>Lit at night</span><span class="lg"><i class="sw" style="background:#ff9f3a"></i>Wildlife lighting</span>` : "");

  const screen = $("screen");
  screen.querySelectorAll(".tag").forEach((n) => n.remove());
  for (const l of L.labels) {
    const s = document.createElement("span");
    s.className = "tag";
    s.style.cssText = l.style;
    s.textContent = l.text;
    screen.appendChild(s);
  }
}

export function updateHUD(game) {
  const { state, links, level } = game;
  if (!state) return;
  $("year").textContent = state.year;
  $("budget").textContent = `$${state.budget}k`;
  $("goodwill").textContent = state.goodwill > 0 ? "♥".repeat(state.goodwill) : "none";
  const wk = game.weatherKey();
  const wEl = $("weather");
  wEl.textContent = wk === "haze" ? `Haze ${state.psi}` : WEATHER[wk].hud;
  wEl.dataset.w = wk;
  for (const sp of level.species) {
    const m = $("m-" + sp);
    if (!m) continue;
    const v = links[sp] || 0;
    const i = m.querySelector("i");
    i.style.width = v + "%";
    i.className = v >= game.target(sp) ? "ok" : "";
    m.querySelector(".pct").textContent = v + "%";
  }
  $("kills").textContent = Object.values(state.kills).reduce((a, b) => a + b, 0);
  document.querySelectorAll("#species button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.sp === state.sp));
  document.querySelectorAll("#tools button").forEach((b) => {
    const t = TOOLS[b.dataset.tool];
    b.setAttribute("aria-pressed", b.dataset.tool === state.tool);
    b.disabled = state.phase !== "plan" || t.cost > state.budget;
  });
  $("endYear").disabled = state.phase !== "plan";
  $("showCurrent").checked = state.showCur;

  const sp = SPECIES[state.sp];
  const res = game.resFor(state.sp);
  $("resTitle").textContent = `How hard to cross: ${sp.short}`;
  const changed = level.tableTiles.some((t) => res[t] !== sp.res[t]);
  $("restable").innerHTML = level.tableTiles
    .map((t) => {
      const d = difficulty(res[t]);
      const mod = res[t] !== sp.res[t];
      const pips = [1, 2, 3, 4, 5].map((p) => `<i class="${p <= d.pips ? "on" : ""}"></i>`).join("");
      return `<tr${mod ? ' class="mod" title="Changed by this year\'s weather"' : ""}><td><span class="sw" style="background:${TYPE_SWATCH[t]}"></span>${TYPE_NAMES[t]}</td><td class="word" title="${d.word}"><span class="sr">${d.word}</span><span class="ease" aria-hidden="true">${pips}</span>${mod ? "*" : ""}</td></tr>`;
    })
    .join("") +
    `<tr><td colspan="2" class="hint">More bars = harder to cross${changed ? ". * changed by this year's weather" : ""}${level.night && sp.traits.light ? `. Lit cells are ${sp.traits.light}x harder at night` : ""}</td></tr>`;
}
