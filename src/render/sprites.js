import { rect } from "./tiles.js";

// Pixel maps: one char per pixel, looked up in a palette. "." is transparent.
const PAL_VB = { k: "#151515", K: "#3a3a4a", s: "#f2c9a0", S: "#d9a47c", g: "#4caf50", G: "#1b5e20", l: "#a3d977", w: "#ffffff", m: "#b5523b", M: "#2f8f3a", b: "#6b3f1d" };
const PAL_BT = { h: "#2b2b35", H: "#c0563f", s: "#e6b48c", S: "#c99470", y: "#3a2a20", c: "#5a5a66", C: "#3a3a44", w: "#f4f4f4", r: "#c0392b", e: "#1a1a1a", m: "#8a3a2a", g: "#ffd34d" };

// Veggie Boy portrait, 24x24: shoulder-length wavy black hair, leaf mask, leaf-crest, foliage suit.
const VEGGIE_PORTRAIT = [
  "...........lG...........", "..........lgG...........", ".......kkkkgkkkk........", ".....kkKkkkkkkkkkk......",
  "....kkKkkkkkkkkkkkk.....", "...kkKkkkkkkkkkkkkkk....", "...kkkkssssssssskkkk....", "..kkkksssssssssssskkk...",
  "..kkkMMMMMMMMMMMMMMkk...", "..kkkMwwMMMMMMMwwMMkk...", "..kkkMMMMMMMMMMMMMMkk...", "..kkkssssssssssssssskk..",
  "..kkkssssssssssssssskk..", "..kkksssssmmmmsssssskk..", ".kkkkSssssssssssssSkkkk.", ".kkkkkSssssssssssSkkkkk.",
  "kkkkk.gGssssssssGg.kkkkk", "kkkk.gggGllllllGggg.kkkk", ".kk.ggggglllllllggggg.kk", "...gggGggllGGllggggGggg.",
  "..ggggGgglGGGGlgggGggggg", ".gGgggGggglllllggggGgggG", ".gGgggGgggglllgggggGgggG", "gGGgggGggggggggggggGgggG",
];
// Baron Tarmac portrait, 24x24: top hat, curled moustache, grey suit, red tie.
const BARON_PORTRAIT = [
  "........hhhhhhhh........", "........hhhhhhhh........", "........hhhhhhhh........", "........HHHHHHHH........",
  "........hhhhhhhh........", "......hhhhhhhhhhhh......", "........ssssssss........", ".......ssssssssss.......",
  ".......sseessssees......", ".......ssssssssss.......", ".......sssssSssss.......", ".......ssssSSsssss......",
  "......yyyyyssssyyyyy....", "....yy..yyyyyyyy..yy....", ".......sssmmmmsss.......", "........ssssssss........",
  "......cccwwwrwwwccc.....", "....cccccCwwrrwCccccc...", "...ccccccCwwrrwCgcccc...", "..cccccccCwwrrwCcccccc..",
  "..cccccccCwwrrwCcccccc..", ".ccccccccCwwrrwCccccccc.", ".ccccccccCwwwwwCccccccc.", "cccccccccCCCCCCCcccccccc",
];
// Veggie Boy map sprite, 7x11.
export const VEGGIE_SPRITE = [
  "...l...", ".kkgkk.", "kMwMwMk", "ksssssk", "k.sms.k", ".ggggg.", "gglllgg", "s.ggg.s", ".GgGgG.", ".gg.gg.", ".bb.bb.",
];

export function blit(c, rows, pal, ox, oy, width = 24) {
  for (let y = 0; y < rows.length; y++) {
    const row = (rows[y] + ".".repeat(width)).slice(0, width);
    for (let x = 0; x < width; x++) {
      const col = pal[row[x]];
      if (col) rect(c, ox + x, oy + y, 1, 1, col);
    }
  }
}

export function drawPortrait(canvas, who) {
  const p = canvas.getContext("2d");
  p.clearRect(0, 0, 24, 24);
  rect(p, 0, 0, 24, 24, who === "baron" ? "#3a1f24" : "#22246a");
  blit(p, who === "baron" ? BARON_PORTRAIT : VEGGIE_PORTRAIT, who === "baron" ? PAL_BT : PAL_VB, 0, 0);
}

export function drawVeggie(c, x, y) {
  blit(c, VEGGIE_SPRITE, PAL_VB, x, y, 7);
}

export function drawWalker(c, sp, x, y) {
  if (sp === "pangolin") {
    rect(c, x + 2, y + 3, 4, 2, "#c0873f");
    rect(c, x + 3, y + 3, 1, 1, "#8a5a28");
    rect(c, x + 5, y + 3, 1, 1, "#8a5a28");
    rect(c, x + 6, y + 4, 1, 1, "#e6b48c");
    rect(c, x + 1, y + 4, 1, 1, "#8a5a28");
  } else if (sp === "colugo") {
    rect(c, x + 1, y + 3, 6, 2, "#9e978a");
    rect(c, x + 3, y + 2, 2, 4, "#cfc8b4");
    rect(c, x + 4, y + 2, 1, 1, "#1a1a1a");
  } else {
    rect(c, x + 3, y + 3, 2, 2, "#8a8f3a");
    rect(c, x + 5, y + 3, 1, 1, "#e8d25a");
    rect(c, x + 2, y + 3, 1, 1, "#5c6128");
  }
}
