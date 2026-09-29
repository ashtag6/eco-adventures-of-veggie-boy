import { SPECIES } from "../engine/species.js";
import { targetFor } from "../engine/sim.js";
import { rect } from "../render/tiles.js";
import { drawWalker } from "../render/sprites.js";

const $ = (id) => document.getElementById(id);

/* ---------- saved progress (per browser; the game works without it) ---------- */
const KEY = "vb-progress";
export function loadProgress() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { return {}; }
}
export function saveResult(levelId, stars) {
  const p = loadProgress();
  p[levelId] = { stars: Math.max(stars, (p[levelId] && p[levelId].stars) || 0) };
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (_) { /* storage may be blocked */ }
}
export function storySeen() {
  try { return localStorage.getItem("vb-story") === "1"; } catch (_) { return false; }
}
export function markStorySeen() {
  try { localStorage.setItem("vb-story", "1"); } catch (_) { /* ignore */ }
}
const unlockAll = () => location.hash === "#unlockall";

/* ---------- screens ---------- */
export function show(name) {
  for (const id of ["titleScreen", "selectScreen", "gameScreen"]) $(id).hidden = id !== name;
  document.body.dataset.screen = name;
  window.scrollTo(0, 0);
}

/** The origin story. Each panel sets the scene drawn behind the dialogue box. */
export const STORY = [
  { scene: "city", who: "narrator", text: "Singacity, 2026. A city in a garden, growing faster every year. Its forests, mangroves and rivers are being squeezed between new roads and towers." },
  { scene: "plant", who: "narrator", text: "Deep in the Central Kachang Reserve, a young botanist was surveying rare plants when he found something nobody had seen for a hundred years: a glowing violet nettle." },
  { scene: "plant", who: "narrator", text: "He reached out to take a sample, and the nettle stung him. The poison burned for three days. When the fever finally broke, he could see the future." },
  { scene: "vision", who: "narrator", text: "He saw forests carved into islands by roads and towers. Pangolins, colugos, otters and hornbills were stranded on each one, fewer every year, until they were gone." },
  { scene: "hero", who: "narrator", text: "He swore that future would never come. He stitched himself a suit of leaves and vines, and Singacity got a new kind of hero: VEGGIE BOY!" },
  { scene: "baron", who: "baron", text: "Mwahaha! A hero made of salad? Every forest in Singacity is a car park waiting to happen, and Concrete Co. is going to pave the lot!" },
  { scene: "hero", who: "veggie", text: "Not on my watch! Every animal needs a way through. I'll reconnect the habitats, outwit Baron Tarmac, and change the future, one crossing at a time." },
];

export function renderChapters(levels, onPlay) {
  const prog = loadProgress();
  const box = $("chapters");
  box.innerHTML = "";
  levels.forEach((L, n) => {
    const unlocked = n === 0 || unlockAll() || !!prog[levels[n - 1].id];
    const stars = (prog[L.id] && prog[L.id].stars) || 0;
    const card = document.createElement("article");
    card.className = "chap win" + (unlocked ? "" : " locked");
    const species = L.species.map((sp) => `<span class="chip" data-sp="${sp}"><canvas width="8" height="8" class="ico"></canvas>${SPECIES[sp].short}</span>`).join("");
    const goals = [...new Set(L.species.map((sp) => targetFor(L, sp)))].map((t) => `${t}%`).join(" / ");
    card.innerHTML = `
      <div class="chap-head"><span class="chap-no">Chapter ${L.chapter}</span><span class="stars" aria-label="${stars} of 3 stars">${prog[L.id] ? "★".repeat(stars) + "☆".repeat(3 - stars) : ""}</span></div>
      <h3>${L.name}</h3>
      <p class="place">${L.place}</p>
      <div class="chips">${species}</div>
      <dl class="facts"><div><dt>Years</dt><dd>${L.startYear}–${L.lastYear}</dd></div><div><dt>Goal</dt><dd>${goals}${L.cores.length > 2 ? " weakest link" : ""}</dd></div><div><dt>Budget</dt><dd>$${L.budget}k + $${L.income}k/yr</dd></div></dl>
      <button class="${unlocked ? "primary" : ""}" ${unlocked ? "" : "disabled"}>${unlocked ? (prog[L.id] ? "Play again" : "Play") : `Complete chapter ${n} to unlock`}</button>`;
    card.querySelectorAll(".chip").forEach((chip) => {
      const c = chip.querySelector("canvas").getContext("2d");
      rect(c, 0, 0, 8, 8, "#22246a");
      drawWalker(c, chip.dataset.sp, 0, 0);
    });
    card.querySelector("button").onclick = () => unlocked && onPlay(L);
    box.appendChild(card);
  });
}
