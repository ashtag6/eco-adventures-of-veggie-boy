import "./style.css";
import { W, H, N, TILE } from "./engine/grid.js";
import { T } from "./engine/tiles.js";
import { SPECIES } from "./engine/species.js";
import { TYPE_NAMES } from "./engine/tiles.js";
import { renderTiles, rect } from "./render/tiles.js";
import { drawVeggie, drawWalker } from "./render/sprites.js";
import { drawCurrent, drawWeather, drawPoofs } from "./render/fx.js";
import { createDialogue } from "./ui/dialogue.js";
import { buildPanel, updateHUD, TOOLS } from "./ui/hud.js";
import { LEVELS } from "./levels/index.js";
import { Game } from "./game.js";
import { play, setSound, soundOn, savedSoundPref } from "./audio.js";
import { difficulty } from "./ui/hud.js";

const $ = (id) => document.getElementById(id);
const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

const cv = $("map");
const ctx = cv.getContext("2d");
ctx.imageSmoothingEnabled = false;
const tileCv = document.createElement("canvas");
tileCv.width = W * TILE;
tileCv.height = H * TILE;
const tctx = tileCv.getContext("2d");

let hover = null;
const veg = { x: 20, y: 14, tx: 20, ty: 14 };

const dialogue = createDialogue(
  { box: $("dialogue"), portrait: $("portrait"), who: $("who"), line: $("line"), choices: $("choices") },
  reduced,
);

const game = new Game(LEVELS[0], {
  say: (...a) => dialogue.say(...a),
  hud: () => updateHUD(game),
  landChanged: () => renderTiles(tctx, game.state.land, game.state.variant),
  readout: (t) => { $("readout").textContent = t; },
  moveVeggie: (x, y) => { veg.tx = x; veg.ty = y; },
  sfx: (name) => play(name),
});

/* ---------- input ---------- */
function cellAt(e) {
  const r = cv.getBoundingClientRect();
  const x = Math.floor(((e.clientX - r.left) / r.width) * W);
  const y = Math.floor(((e.clientY - r.top) / r.height) * H);
  return x < 0 || y < 0 || x >= W || y >= H ? null : { x, y };
}
function describe(c) {
  const S = game.state, i = c.y * W + c.x, t = S.land[i], r = game.res[S.sp];
  if (!r) return;
  const pct = (100 * r.cur[i]) / r.I;
  const lvl = game.level;
  const note = lvl.isA(c.x, c.y) || lvl.isB(c.x, c.y) ? " (home habitat)" : "";
  const chk = game.toolCheck(c.x, c.y);
  const name = SPECIES[S.sp].short.toLowerCase();
  const d = difficulty(game.resFor(S.sp)[t]).word.toLowerCase();
  const busy = pct >= 8 ? "a major bottleneck" : pct >= 3 ? "a busy trail" : pct >= 0.5 ? "a quiet trail" : "rarely used";
  $("readout").innerHTML =
    `<strong>${TYPE_NAMES[t]}</strong>${note} · ${d} for ${name}s · ${busy} (${pct < 0.1 ? "<0.1" : pct.toFixed(1)}% of ${name} movement)` +
    (S.tool !== "inspect" && !chk.ok && chk.msg ? ` · ${chk.msg}` : "");
}
let painting = false;
cv.addEventListener("pointerdown", (e) => {
  const c = cellAt(e);
  if (!c) return;
  painting = true;
  try { cv.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  game.place(c.x, c.y);
  hover = c;
  describe(c);
});
cv.addEventListener("pointermove", (e) => {
  const c = cellAt(e);
  hover = c;
  if (!c) return;
  describe(c);
  if (game.state.phase === "plan") { veg.tx = c.x; veg.ty = c.y; }
  if (painting && game.state.tool === "plant") game.place(c.x, c.y);
});
cv.addEventListener("pointerup", () => { painting = false; });
cv.addEventListener("pointerleave", () => { hover = null; });
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  const t = TOOLS.find((q) => q.key === e.key);
  if (t) game.setTool(t.id);
});

let lastPoof = 0;
/* ---------- animated animals (random walkers following current) ---------- */
function spawn() {
  const y = (Math.random() * H) | 0, x = 3;
  game.walkers.push({ i: y * W + x, x, y, px: x, py: y, n: 0 });
}
function step(w) {
  const S = game.state, r = game.res[S.sp];
  const i = w.i, x = i % W, V = r.V, cand = [];
  let tot = 0;
  const add = (j, g) => { const wgt = g * (Math.max(V[i] - V[j], 0) + 0.0015); cand.push([j, wgt]); tot += wgt; };
  if (x < W - 1) add(i + 1, r.gE[i]);
  if (x > 0) add(i - 1, r.gE[i - 1]);
  if (i + W < N) add(i + W, r.gS[i]);
  if (i - W >= 0) add(i - W, r.gS[i - W]);
  let u = Math.random() * tot, j = cand[0][0];
  for (const [cj, cw] of cand) { u -= cw; if (u <= 0) { j = cj; break; } }
  w.px = w.x; w.py = w.y; w.i = j; w.x = j % W; w.y = (j / W) | 0; w.n++;
  if (S.land[j] === T.ROAD && Math.random() < SPECIES[S.sp].kill) {
    game.poofs.push({ x: w.x, y: w.y, t: 0 });
    if (performance.now() - lastPoof > 900) { play("poof"); lastPoof = performance.now(); }
    w.dead = true;
  }
  if (game.level.isB(w.x, w.y) || w.n > 500) w.dead = true;
}

/* ---------- main loop ---------- */
let last = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  const time = now / 1000;
  const S = game.state, r = game.res[S.sp];
  ctx.drawImage(tileCv, 0, 0);
  if (r && S.showCur) drawCurrent(ctx, r, time, reduced);

  acc += dt;
  const spd = S.sp === "bulbul" ? 0.06 : 0.1;
  if (r) {
    while (acc > spd) {
      acc -= spd;
      game.walkers.forEach(step);
      game.walkers = game.walkers.filter((w) => !w.dead);
      if (game.walkers.length < 34 && Math.random() < 0.5) spawn();
    }
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
  requestAnimationFrame(frame);
}

/* ---------- boot (with hot-reload state for Claude artifacts; harmless elsewhere) ---------- */
function syncSoundButton() {
  const b = $("sound");
  b.textContent = soundOn() ? "Sound: on" : "Sound: off";
  b.setAttribute("aria-pressed", soundOn());
}
$("sound").onclick = () => { setSound(!soundOn()); syncSoundButton(); play("plant"); };

function start(data) {
  buildPanel(game);
  // Sound needs a user gesture: if the player turned it on last time, enable on first click anywhere.
  if (savedSoundPref()) document.addEventListener("pointerdown", () => { if (!soundOn()) { setSound(true); syncSoundButton(); } }, { once: true });
  syncSoundButton();
  game.start(data && data.S ? data.S : null);
  try { window.claude?.hot?.snapshot?.(() => ({ S: game.snapshot() })); } catch (_) { /* ignore */ }
  requestAnimationFrame(frame);
}
if (window.claude?.hot?.ready) window.claude.hot.ready(start);
else start(window.claude?.hot?.data ?? {});
