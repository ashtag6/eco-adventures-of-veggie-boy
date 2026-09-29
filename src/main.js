import "./style.css";
import { W, H, N, TILE } from "./engine/grid.js";
import { T, TYPE_NAMES } from "./engine/tiles.js";
import { SPECIES } from "./engine/species.js";
import { renderTiles, rect } from "./render/tiles.js";
import { drawVeggie, drawWalker } from "./render/sprites.js";
import { drawTrails, drawNight, drawWeather, drawPoofs, trailBand } from "./render/fx.js";
import { drawScene } from "./render/title.js";
import { createDialogue } from "./ui/dialogue.js";
import { buildPanel, updateHUD, difficulty } from "./ui/hud.js";
import { show, STORY, renderChapters, saveResult, storySeen, markStorySeen } from "./ui/screens.js";
import { LEVELS } from "./levels/index.js";
import { Game } from "./game.js";
import { play, setSound, soundOn, savedSoundPref, unlockAudio } from "./audio.js";

const $ = (id) => document.getElementById(id);
const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- canvases ---------- */
const cv = $("map");
const ctx = cv.getContext("2d");
ctx.imageSmoothingEnabled = false;
const tileCv = document.createElement("canvas");
tileCv.width = W * TILE;
tileCv.height = H * TILE;
const tctx = tileCv.getContext("2d");
const scene = $("scene");
const sctx = scene.getContext("2d");
sctx.imageSmoothingEnabled = false;

let hover = null;
let sceneMode = "title";
const veg = { x: 20, y: 14, tx: 20, ty: 14 };

const dialogue = createDialogue({ box: $("dialogue"), portrait: $("portrait"), who: $("who"), line: $("line"), choices: $("choices") }, reduced);
const story = createDialogue({ box: $("storyBox"), portrait: $("storyPortrait"), who: $("storyWho"), line: $("storyLine"), choices: $("storyChoices") }, reduced);

/* ---------- game ---------- */
let game = null;
const ui = {
  say: (...a) => dialogue.say(...a),
  hud: () => game && updateHUD(game),
  landChanged: () => game && game.state && renderTiles(tctx, game.state.land, game.state.variant, game.state.roads),
  readout: (t) => { $("readout").textContent = t; },
  moveVeggie: (x, y) => { veg.tx = x; veg.ty = y; },
  sfx: (name) => play(name),
  complete: (L, stars) => saveResult(L.id, stars),
  nextLevel: (L) => LEVELS[LEVELS.indexOf(L) + 1] || null,
  play: (L) => startChapter(L),
  exit: () => openSelect(),
};

function startChapter(level) {
  show("gameScreen");
  game = new Game(level, ui);
  game.start();
  buildPanel(game);
  updateHUD(game);
  const c = level.cores[0];
  for (let i = 0; i < N; i++) if (!c.test(i % W, (i / W) | 0)) { veg.x = veg.tx = i % W; veg.y = veg.ty = (i / W) | 0; break; }
  $("leave").textContent = "Chapters";
  $("leave").dataset.armed = "";
}

function openSelect() {
  game = null;
  show("selectScreen");
  renderChapters(LEVELS, startChapter);
}

/* ---------- title and story ---------- */
function openTitle() {
  game = null;
  sceneMode = "title";
  show("titleScreen");
  $("storyBox").hidden = true;
  $("titleText").hidden = false;
  $("pressStart").hidden = false;
}

function storyPanel(k) {
  const p = STORY[k];
  sceneMode = p.scene;
  $("titleText").hidden = true;
  $("pressStart").hidden = true;
  $("storyBox").hidden = false;
  const last = k === STORY.length - 1;
  story.say(p.who, p.text, [
    { label: last ? "Choose a chapter ▶" : "Next ▶", cls: last ? "primary" : "", fn: () => (last ? (markStorySeen(), openSelect()) : storyPanel(k + 1)) },
    ...(last ? [] : [{ label: "Skip story", cls: "ghost", fn: () => { markStorySeen(); openSelect(); } }]),
  ]);
}

$("pressStart").onclick = () => {
  unlockAudio();
  play("build");
  if (storySeen()) openSelect();
  else storyPanel(0);
};
$("replayStory").onclick = () => { show("titleScreen"); storyPanel(0); };
$("toTitle").onclick = openTitle;
$("leave").onclick = () => {
  const b = $("leave");
  if (game && game.state && game.state.phase !== "over" && !b.dataset.armed) {
    b.dataset.armed = "1";
    b.textContent = "Leave chapter?";
    setTimeout(() => { if (b.dataset.armed) { b.dataset.armed = ""; b.textContent = "Chapters"; } }, 3000);
    return;
  }
  openSelect();
};
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if (!$("titleScreen").hidden && !$("pressStart").hidden && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); $("pressStart").click(); return; }
  if (!game || $("gameScreen").hidden) return;
  const b = document.querySelector(`#tools button[data-key="${e.key}"]`);
  if (b) game.setTool(b.dataset.tool);
});

/* ---------- sound ---------- */
function syncSound() {
  for (const b of document.querySelectorAll(".soundBtn")) {
    b.textContent = soundOn() ? "Sound: on" : "Sound: off";
    b.setAttribute("aria-pressed", soundOn());
  }
}
for (const b of document.querySelectorAll(".soundBtn")) b.onclick = () => { setSound(!soundOn()); syncSound(); play("plant"); };
if (savedSoundPref()) document.addEventListener("pointerdown", () => { if (!soundOn()) { setSound(true); syncSound(); } }, { once: true });
syncSound();

/* ---------- map input ---------- */
function cellAt(e) {
  const r = cv.getBoundingClientRect();
  const x = Math.floor(((e.clientX - r.left) / r.width) * W);
  const y = Math.floor(((e.clientY - r.top) / r.height) * H);
  return x < 0 || y < 0 || x >= W || y >= H ? null : { x, y };
}
function describe(c) {
  if (!game || !game.res) return;
  const S = game.state, i = c.y * W + c.x, t = S.land[i], r = game.res[S.sp];
  const share = r.cur[i] / r.I;
  const core = game.level.cores.find((k) => k.test(c.x, c.y));
  const name = SPECIES[S.sp].short.toLowerCase();
  const lit = game.lit && game.lit[i] && SPECIES[S.sp].traits.light;
  const d = difficulty(game.resFor(S.sp)[t] * (lit ? SPECIES[S.sp].traits.light : 1)).word.toLowerCase();
  const band = trailBand(r.cur[i] / r.typical);
  const chk = game.toolCheck(c.x, c.y);
  $("readout").innerHTML =
    `<strong>${TYPE_NAMES[t]}</strong>${core ? ` (${core.name}, home habitat)` : ""}${lit ? " · lit at night" : ""} · ${d} for ${name}s · ` +
    (core ? "animals start and end here" : `${band ? band.label.toLowerCase() : "rarely used"} (${share < 0.001 ? "<0.1" : (share * 100).toFixed(1)}% of ${name} movement)`) +
    (S.tool !== "inspect" && !chk.ok && chk.msg ? ` · ${chk.msg}` : "");
}
let painting = false;
cv.addEventListener("pointerdown", (e) => {
  const c = cellAt(e);
  if (!c || !game) return;
  painting = true;
  try { cv.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  game.place(c.x, c.y);
  hover = c;
  describe(c);
});
cv.addEventListener("pointermove", (e) => {
  const c = cellAt(e);
  hover = c;
  if (!c || !game) return;
  describe(c);
  if (game.state.phase === "plan") { veg.tx = c.x; veg.ty = c.y; }
  const kind = game.state.tool;
  if (painting && ["plant", "mangrove", "natcanal", "boardwalk"].includes(kind)) game.place(c.x, c.y);
});
cv.addEventListener("pointerup", () => { painting = false; });
cv.addEventListener("pointerleave", () => { hover = null; });
$("showCurrent").onchange = (e) => { if (game) game.state.showCur = e.target.checked; };
$("endYear").onclick = () => game && game.endYear();

/* ---------- animated animals: random walkers following the current ---------- */
let lastPoof = 0;
function spawn() {
  const k = (Math.random() * game.pairs.length) | 0;
  const [a] = game.pairs[k];
  const cells = game.cores[a];
  const i = cells[(Math.random() * cells.length) | 0];
  game.walkers.push({ i, x: i % W, y: (i / W) | 0, px: i % W, py: (i / W) | 0, n: 0, k });
}
function step(w) {
  const S = game.state, p = game.res[S.sp].pairs[w.k];
  const i = w.i, x = i % W, V = p.V, cand = [];
  let tot = 0;
  const add = (j, g) => { const wgt = g * (Math.max(V[i] - V[j], 0) + 0.0015); cand.push([j, wgt]); tot += wgt; };
  if (x < W - 1) add(i + 1, p.gE[i]);
  if (x > 0) add(i - 1, p.gE[i - 1]);
  if (i + W < N) add(i + W, p.gS[i]);
  if (i - W >= 0) add(i - W, p.gS[i - W]);
  let u = Math.random() * tot, j = cand[0][0];
  for (const [cj, cw] of cand) { u -= cw; if (u <= 0) { j = cj; break; } }
  w.px = w.x; w.py = w.y; w.i = j; w.x = j % W; w.y = (j / W) | 0; w.n++;
  if (S.land[j] === T.ROAD && Math.random() < SPECIES[S.sp].kill) {
    game.poofs.push({ x: w.x, y: w.y, t: 0 });
    if (performance.now() - lastPoof > 900) { play("poof"); lastPoof = performance.now(); }
    w.dead = true;
  }
  if (p.fix[j] === 2 || w.n > 500) w.dead = true;
}

/* ---------- main loop ---------- */
let last = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  const time = now / 1000;
  if (!$("titleScreen").hidden) drawScene(sctx, time, sceneMode, reduced);
  if (game && game.state && game.res && !$("gameScreen").hidden) drawMap(dt, time);
  requestAnimationFrame(frame);
}

function drawMap(dt, time) {
  const S = game.state, r = game.res[S.sp];
  ctx.drawImage(tileCv, 0, 0);
  if (game.level.night && game.lit) drawNight(ctx, game.lit, S.dark);
  if (S.showCur) drawTrails(ctx, r.cur, r.typical, game.fixAny, time, reduced, !!game.level.night);

  acc += dt;
  const spd = SPECIES[S.sp].traits.fly ? 0.06 : 0.1;
  while (acc > spd) {
    acc -= spd;
    game.walkers.forEach(step);
    game.walkers = game.walkers.filter((w) => !w.dead);
    if (game.walkers.length < 34 && Math.random() < 0.5) spawn();
  }
  const f = Math.min(1, acc / spd);
  for (const w of game.walkers) drawWalker(ctx, S.sp, (w.px + (w.x - w.px) * f) * TILE, (w.py + (w.y - w.py) * f) * TILE);
  game.poofs = drawPoofs(ctx, game.poofs, dt);

  if (hover && S.phase === "plan" && S.tool !== "inspect") {
    const chk = game.toolCheck(hover.x, hover.y);
    ctx.strokeStyle = chk.ok ? "#ffffff" : "#ff6b5d";
    ctx.lineWidth = 1;
    for (const i of chk.ok ? chk.cells : [hover.y * W + hover.x]) ctx.strokeRect((i % W) * TILE + 0.5, ((i / W) | 0) * TILE + 0.5, 7, 7);
  } else if (hover) {
    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(hover.x * TILE + 0.5, hover.y * TILE + 0.5, 7, 7);
  }

  veg.x += (veg.tx - veg.x) * Math.min(1, dt * 6);
  veg.y += (veg.ty - veg.y) * Math.min(1, dt * 6);
  const bob = reduced ? 0 : Math.round(Math.abs(Math.sin(time * 5)) * 1.5);
  const vx = Math.min(W * TILE - 8, Math.round(veg.x * TILE + 10));
  const vy = Math.max(0, Math.round(veg.y * TILE - 6 - bob));
  ctx.globalAlpha = 0.35;
  rect(ctx, vx + 1, vy + 11 + bob, 5, 1, "#000");
  ctx.globalAlpha = 1;
  drawVeggie(ctx, vx, vy);

  if (drawWeather(ctx, game.weatherKey(), time, dt, reduced)) play("thunder");
}

/* ---------- boot ---------- */
openTitle();
requestAnimationFrame(frame);
