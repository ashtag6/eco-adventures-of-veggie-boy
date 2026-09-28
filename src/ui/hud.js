import { SPECIES } from "../engine/species.js";
import { TYPE_NAMES, TYPE_SWATCH, T } from "../engine/tiles.js";
import { WEATHER } from "../engine/weather.js";
import { drawTile, rect } from "../render/tiles.js";

// Player-facing translation of resistance values. Raw numbers stay in species.js.
export function difficulty(r) {
  if (r <= 2) return { word: "Easy", pips: 1 };
  if (r <= 6) return { word: "Fair", pips: 2 };
  if (r <= 40) return { word: "Tough", pips: 3 };
  if (r <= 400) return { word: "Very hard", pips: 4 };
  return { word: "Barrier", pips: 5 };
}

export const TOOLS = [
  { id: "inspect", label: "Inspect", cost: 0, icon: null, key: "1" },
  { id: "plant", label: "Plant sapling", cost: 1, icon: T.SAPLING, key: "2" },
  { id: "rope", label: "Rope bridge", cost: 3, icon: T.ROPE, key: "3" },
  { id: "under", label: "Underpass", cost: 5, icon: T.UNDER, key: "4" },
  { id: "eco", label: "Eco-bridge", cost: 12, icon: T.ECO, key: "5" },
];

const $ = (id) => document.getElementById(id);

export function buildPanel(game) {
  const sp = $("species");
  sp.innerHTML = "";
  for (const k of Object.keys(SPECIES)) {
    const b = document.createElement("button");
    b.dataset.sp = k;
    b.innerHTML = `<span class="dot" style="background:${SPECIES[k].colour}"></span>${SPECIES[k].name}`;
    b.onclick = () => game.setSpecies(k);
    sp.appendChild(b);
  }
  const tl = $("tools");
  tl.innerHTML = "";
  for (const t of TOOLS) {
    const b = document.createElement("button");
    b.dataset.tool = t.id;
    const ic = document.createElement("canvas");
    ic.width = 8;
    ic.height = 8;
    ic.className = "ico";
    const ix = ic.getContext("2d");
    if (t.icon === null) {
      rect(ix, 0, 0, 8, 8, "#22246a");
      rect(ix, 1, 1, 4, 4, "#e8e6ff");
      rect(ix, 2, 2, 2, 2, "#22246a");
      rect(ix, 5, 5, 2, 2, "#e8e6ff");
    } else drawTile(ix, 0, 0, t.icon, 0, 0, (dx) => (dx ? -1 : t.icon), 0);
    b.appendChild(ic);
    const s = document.createElement("span");
    s.textContent = t.label;
    b.appendChild(s);
    const c = document.createElement("span");
    c.className = "cost";
    c.textContent = t.cost ? `$${t.cost}k` : "";
    b.appendChild(c);
    b.title = `Shortcut: ${t.key}`;
    b.onclick = () => game.setTool(t.id);
    tl.appendChild(b);
  }
  $("showCurrent").onchange = (e) => { game.state.showCur = e.target.checked; };
  $("endYear").onclick = () => game.endYear();

  const screen = $("screen");
  screen.querySelectorAll(".tag").forEach((n) => n.remove());
  for (const l of game.level.labels) {
    const s = document.createElement("span");
    s.className = "tag";
    s.style.cssText = l.style;
    s.textContent = l.text;
    screen.appendChild(s);
  }
  $("chapter").textContent = `Chapter ${game.level.chapter}: ${game.level.title.replace(/^The /, "the ")}, Singacity`;
}

export function updateHUD(game) {
  const { state, links, level } = game;
  $("year").textContent = state.year;
  $("budget").textContent = `$${state.budget}k`;
  $("goodwill").textContent = state.goodwill > 0 ? "♥".repeat(state.goodwill) : "none";
  const wk = game.weatherKey();
  const wEl = $("weather");
  wEl.textContent = wk === "haze" ? `Haze PSI ${state.psi}` : WEATHER[wk].hud;
  wEl.dataset.w = wk;
  for (const k of ["pangolin", "colugo"]) {
    const m = $("m-" + k), v = links[k] || 0;
    const i = m.querySelector("i");
    i.style.width = v + "%";
    i.className = v >= level.target ? "ok" : "";
    m.querySelector(".pct").textContent = v + "%";
    m.querySelector("b").style.left = level.target + "%";
  }
  $("kills").textContent = state.kills.pangolin + state.kills.colugo;
  document.querySelectorAll("#species button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.sp === state.sp));
  document.querySelectorAll("#tools button").forEach((b) => {
    const t = TOOLS.find((q) => q.id === b.dataset.tool);
    b.setAttribute("aria-pressed", b.dataset.tool === state.tool);
    b.disabled = state.phase !== "plan" || t.cost > state.budget;
  });
  $("endYear").disabled = state.phase !== "plan";
  $("showCurrent").checked = state.showCur;
  const sp = SPECIES[state.sp];
  const res = game.resFor(state.sp);
  $("resTitle").textContent = `How hard to cross: ${sp.short}`;
  $("restable").innerHTML = [0, 1, 2, 8, 3, 4, 5, 6, 7]
    .map((t) => {
      const changed = res[t] !== sp.res[t];
      const d = difficulty(res[t]);
      const pips = [1, 2, 3, 4, 5].map((p) => `<i class="${p <= d.pips ? "on" : ""}"></i>`).join("");
      return `<tr${changed ? ' class="mod" title="Changed by this year\'s weather"' : ""} data-r="${+res[t].toFixed(1)}"><td><span class="sw" style="background:${TYPE_SWATCH[t]}"></span>${TYPE_NAMES[t]}</td><td class="word" title="${d.word}"><span class="sr">${d.word}</span><span class="ease" aria-hidden="true">${pips}</span>${changed ? "*" : ""}</td></tr>`;
    })
    .join("") + `<tr><td colspan="2" class="hint">More bars = harder to cross${Object.keys(res).some((t) => res[t] !== sp.res[t]) ? ". * changed by this year's weather" : ""}</td></tr>`;
}
