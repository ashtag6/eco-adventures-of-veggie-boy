import { hash } from "../engine/grid.js";
import { rect } from "./tiles.js";
import { drawVeggieBody, drawTitleAnimal, drawBaronPortrait } from "./sprites.js";

// Title and story scenes, drawn at 384 x 224 and scaled up with nearest-neighbour.
const CW = 384, CH = 224;

const SKY = {
  dusk: ["#1b1440", "#2e1f5c", "#52307a", "#7a3b7e", "#b04f7a", "#e0785a", "#f6b15a"],
  vision: ["#1a1414", "#2a1a1a", "#3a2020", "#4a2424", "#5e2a26", "#74322a", "#8a3e2e"],
  night: ["#070a1f", "#0b1030", "#101640", "#16204f", "#1c2a5e", "#23356b", "#2b3f7a"],
};

function sky(c, pal) {
  const bands = [0, 26, 46, 62, 76, 90, 102, 128];
  for (let k = 0; k < pal.length; k++) {
    rect(c, 0, bands[k], CW, bands[k + 1] - bands[k], pal[k]);
    if (k < pal.length - 1) for (let x = 0; x < CW; x += 2) rect(c, x + ((bands[k + 1] / 2) % 2), bands[k + 1] - 1, 1, 1, pal[k + 1]);
  }
}

function stars(c, t) {
  for (let k = 0; k < 40; k++) {
    const x = (hash(k, 1, 9) * CW) | 0, y = (hash(k, 2, 9) * 70) | 0;
    if (hash(k, 3, 9) < 0.5 + 0.5 * Math.sin(t * 2 + k)) rect(c, x, y, 1, 1, "#e8e6ff");
  }
}

function sun(c, x, y, r, col, stripe) {
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.round(Math.sqrt(r * r - dy * dy));
    if (dy > 4 && dy % 4 === 0) continue;
    rect(c, x - w, y + dy, w * 2, 1, dy > 4 && dy % 4 === 1 ? stripe : col);
  }
}

function tower(c, x, top, w, base, col, lit, seed) {
  rect(c, x, top, w, base - top, col);
  for (let yy = top + 3; yy < base - 2; yy += 4)
    for (let xx = x + 2; xx < x + w - 2; xx += 3) if (hash(xx, yy, seed) < lit) rect(c, xx, yy, 1, 2, "#ffd966");
}

function skyline(c, mode) {
  const base = 128;
  const col = mode === "vision" ? "#2a1616" : "#2a1d4f";
  const lit = mode === "vision" ? 0.08 : 0.35;
  // Building Agency blocks and towers
  const list = [[100, 102, 40], [150, 80, 15], [170, 90, 10], [185, 74, 11], [205, 94, 15], [225, 84, 10], [300, 88, 14], [320, 78, 12], [340, 95, 20], [362, 100, 22]];
  for (const [x, top, w] of list) tower(c, x, top, w, base, col, lit, x);
  // Marina Bae Stands: three towers with a surfboard on top
  for (const x of [250, 262, 274]) tower(c, x, 70, 7, base, mode === "vision" ? "#331c1c" : "#3a2a66", lit, x);
  rect(c, 244, 66, 48, 4, mode === "vision" ? "#3a2020" : "#4a3a80");
  rect(c, 242, 67, 2, 2, mode === "vision" ? "#3a2020" : "#4a3a80");
  rect(c, 292, 67, 3, 2, mode === "vision" ? "#3a2020" : "#4a3a80");
  // Concrete Co. crane
  const cr = mode === "vision" ? "#8a4a2a" : "#e0a030";
  rect(c, 330, 58, 2, 70, cr);
  rect(c, 300, 58, 62, 2, cr);
  rect(c, 356, 60, 1, 18, "#9a9aa8");
  rect(c, 354, 78, 5, 3, "#9a9aa8");
  if (mode === "vision") {
    // The future: towers and cranes everywhere
    for (let x = 0; x < 150; x += 16) tower(c, x, 60 + ((hash(x, 1, 3) * 40) | 0), 12, 200, "#3a2626", 0.05, x);
    for (const x of [60, 140, 210]) { rect(c, x, 40, 2, 90, cr); rect(c, x - 30, 40, 50, 2, cr); }
  }
}

function bay(c, t, mode, reduced) {
  rect(c, 0, 128, CW, 24, mode === "vision" ? "#2a1a1a" : "#2b3f7a");
  for (let y = 130; y < 152; y += 3)
    for (let x = 0; x < CW; x += 12) {
      const o = reduced ? 0 : ((t * 6 + y) % 12) | 0;
      rect(c, (x + o) % CW, y, 5, 1, mode === "vision" ? "#3a2424" : "#3f5a9a");
    }
  if (mode !== "vision") for (let y = 130; y < 152; y += 2) rect(c, 292 + ((y * 7) % 9), y, 14 - ((y - 130) >> 1), 1, "#f6c27a");
}

function tree(c, x, trunkTop, cx, cy, r, mode) {
  const leaf = mode === "vision" ? ["#3a3030", "#2a2222"] : ["#1f5a2e", "#2e7a3c"];
  rect(c, x - 4, trunkTop, 8, 200 - trunkTop, mode === "vision" ? "#2a2020" : "#4a3a28");
  rect(c, x - 2, trunkTop, 2, 200 - trunkTop, mode === "vision" ? "#3a2c2c" : "#5e4a34");
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.round(Math.sqrt(r * r - dy * dy) * (1 + 0.08 * Math.sin(dy)));
    rect(c, cx - w, cy + dy, w * 2, 1, leaf[0]);
  }
  for (let k = 0; k < r * 3; k++) {
    const a = hash(k, cx, 4) * Math.PI * 2, d = hash(k, cy, 5) * r * 0.85;
    rect(c, Math.round(cx + Math.cos(a) * d), Math.round(cy + Math.sin(a) * d), 3, 2, leaf[1]);
  }
}

function ground(c, mode) {
  const g = mode === "vision" ? ["#3a3434", "#2a2626", "#4a4040"] : ["#3f8a3c", "#2e7a3c", "#86c25a"];
  // Riverbank between the bay and the meadow
  rect(c, 0, 150, CW, 26, mode === "vision" ? "#302a2a" : "#2e6a34");
  for (let x = 0; x < CW; x += 4) rect(c, x, 150, 3, 1, mode === "vision" ? "#3a3232" : "#5fa05a");
  rect(c, 0, 176, CW, 48, g[0]);
  for (let x = 0; x < CW; x += 3) rect(c, x, 175 + ((hash(x, 1, 7) * 3) | 0), 2, 2, g[2]);
  rect(c, 0, 206, CW, 18, g[1]);
  // Mudflat and mangroves on the right, by the water
  if (mode !== "vision") {
    rect(c, 268, 152, 116, 24, "#8a7552");
    for (let x = 270; x < 384; x += 7) rect(c, x, 158 + ((hash(x, 2, 7) * 10) | 0), 3, 1, "#a08a66");
    for (const mx of [350, 366, 378]) {
      for (let k = 0; k < 4; k++) rect(c, mx - 4 + k * 3, 150, 1, 8, "#4a3a28");
      rect(c, mx - 8, 138, 18, 12, "#2f6b4a");
      rect(c, mx - 5, 136, 12, 4, "#3f8a5a");
    }
  } else {
    rect(c, 268, 152, 116, 24, "#3a2c2c");
  }
}

/**
 * Draw a scene. modes:
 *  "title"  dusk skyline, forest, Veggie Boy on a rock, animals in their habitats
 *  "city"   story opener: the same scene without Veggie Boy
 *  "plant"  night forest, the botanist and the glowing nettle
 *  "vision" the future: grey city, fading animals
 *  "hero"   title scene with a burst behind Veggie Boy
 *  "baron"  dusk with Baron Tarmac looming
 */
export function drawScene(c, t, mode = "title", reduced = false) {
  c.imageSmoothingEnabled = false;
  c.globalAlpha = 1;
  rect(c, 0, 0, CW, CH, "#0c0d26");
  if (mode === "plant") return plantScene(c, t, reduced);
  const vision = mode === "vision";
  sky(c, SKY[vision ? "vision" : "dusk"]);
  if (!vision) stars(c, t);
  sun(c, 300, 106, 22, vision ? "#8a3e2e" : "#ffd27a", vision ? "#5e2a26" : "#f6b15a");
  skyline(c, vision ? "vision" : "dusk");
  bay(c, t, vision ? "vision" : "dusk", reduced);
  ground(c, vision ? "vision" : "dusk");
  tree(c, 30, 96, 32, 70, 34, vision ? "vision" : "dusk");
  tree(c, 108, 118, 108, 108, 22, vision ? "vision" : "dusk");

  const bob = reduced ? 0 : Math.round(Math.sin(t * 2) * 1.5);
  const ghost = vision ? 0.22 : 1;
  c.globalAlpha = ghost;
  drawTitleAnimal(c, "hornbill", 38, 30);
  drawTitleAnimal(c, "squirrel", 20, 132);
  drawTitleAnimal(c, "colugo", 64 + (reduced ? 0 : Math.round(Math.sin(t * 0.8) * 4)), 96 + bob);
  drawTitleAnimal(c, "pangolin", 58, 192);
  drawTitleAnimal(c, "otter", 214 + (reduced ? 0 : Math.round((t * 4) % 30)), 140);
  drawTitleAnimal(c, "frog", 250, 170);
  drawTitleAnimal(c, "monitor", 300, 160);
  drawTitleAnimal(c, "leopardcat", 318, 196, 1, true);
  c.globalAlpha = 1;

  if (mode === "title" || mode === "hero") {
    if (mode === "hero") {
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2 + (reduced ? 0 : t * 0.4);
        for (let d = 30; d < 70; d += 3) rect(c, Math.round(176 + Math.cos(a) * d), Math.round(150 + Math.sin(a) * d), 2, 2, k % 2 ? "#ffd34d" : "#a3d977");
      }
    }
    rect(c, 160, 178, 36, 8, "#6b6b7a");
    rect(c, 164, 174, 28, 4, "#8a8a98");
    drawVeggieBody(c, 162, 126 + (reduced ? 0 : Math.round(Math.sin(t * 3))), 2);
  }
  if (mode === "baron") {
    c.globalAlpha = 0.35;
    rect(c, 0, 0, CW, CH, "#2a0a0a");
    c.globalAlpha = 1;
    rect(c, 126, 22, 132, 132, "#3a1f24");
    drawBaronPortrait(c, 132, 28, 5);
  }
  if (vision) {
    c.globalAlpha = 0.18;
    rect(c, 0, 0, CW, CH, "#ff3b2f");
    c.globalAlpha = 1;
  }
}

function plantScene(c, t, reduced) {
  sky(c, SKY.night);
  stars(c, t);
  // Deep forest: trunk columns and canopy
  for (let x = 0; x < CW; x += 38) {
    rect(c, x + 8, 20, 10, 190, "#2a2018");
    rect(c, x + 10, 20, 3, 190, "#3a2c20");
  }
  for (let k = 0; k < 220; k++) {
    const x = (hash(k, 3, 11) * CW) | 0, y = (hash(k, 4, 11) * 60) | 0;
    rect(c, x, y, 8, 5, k % 2 ? "#12301c" : "#1a4226");
  }
  rect(c, 0, 176, CW, 48, "#1a3a20");
  for (let x = 0; x < CW; x += 4) rect(c, x, 174 + ((hash(x, 1, 12) * 4) | 0), 2, 3, "#2e5a30");
  // The glowing nettle
  const glow = reduced ? 0.4 : 0.3 + 0.2 * Math.sin(t * 3);
  c.globalAlpha = glow;
  for (let r = 40; r > 0; r -= 6) { c.globalAlpha = glow * (1 - r / 44); rect(c, 250 - r, 120 - r, r * 2, r * 2, "#b050ff"); }
  c.globalAlpha = 1;
  drawTitleAnimal(c, "nettle", 228, 100, 4);
  for (let k = 0; k < 10; k++) {
    const a = k * 0.63 + (reduced ? 0 : t);
    rect(c, Math.round(250 + Math.cos(a) * 44), Math.round(130 + Math.sin(a * 1.3) * 34), 2, 2, "#f0b0ff");
  }
  // The botanist, reaching towards it
  drawVeggieBody(c, 120, 124, 2, true);
}
