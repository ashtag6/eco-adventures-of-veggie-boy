import { rect } from "./tiles.js";

// Pixel maps: one character per pixel, looked up in a palette. "." is transparent.

export const PAL_VB = {
  k: "#151515", K: "#3a3a4a", s: "#f2c9a0", S: "#d9a47c", g: "#4caf50", G: "#1b5e20", l: "#a3d977",
  w: "#ffffff", e: "#1a1a1a", m: "#b5523b", M: "#2f8f3a", b: "#6b3f1d", y: "#9c7a2a",
};
// Before the sting: the same young botanist in field khakis, no mask, no leaf crest.
export const PAL_BOTANIST = {
  ...PAL_VB, l: "#d8c9a0", G: "#8a7550", g: "#c2a878", M: "#f2c9a0", w: "#1a1a1a", y: "#5a4a3a",
};
const PAL_BT = { h: "#2b2b35", H: "#c0563f", s: "#e6b48c", S: "#c99470", y: "#3a2a20", c: "#5a5a66", C: "#3a3a44", w: "#f4f4f4", r: "#c0392b", e: "#1a1a1a", m: "#8a3a2a", g: "#ffd34d" };

// Veggie Boy portrait, 24x24: shoulder-length wavy black hair, leaf mask, leaf crest, foliage suit.
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
// Veggie Boy full body, 16x25, for the title screen and story.
export const VEGGIE_BODY = [
  ".......lG.......",
  "......lgGl......",
  "....kkkkgkkk....",
  "...kkKkkkkkkk...",
  "..kkKkkkkkkkkk..",
  "..kkksssssssskk.",
  "..kkMMMMMMMMkk..",
  "..kkMwwMMwwMkk..",
  "..kkssssssssKk..",
  "..kkssssmmssKk..",
  ".kkkSssssssSkkk.",
  ".kkk.SSSSSS.kkk.",
  "kkkggGssssGggkkk",
  "kkgggGllllGgggkk",
  ".gggGgllllgGggg.",
  "ggggGglGGlgGgggg",
  "sgggGgllllgGggGs",
  ".gyyyyyyyyyyyyg.",
  ".ggGgggggggggGg.",
  "..gGgg....ggGg..",
  "..gggg....gggg..",
  "..GggG....GggG..",
  "..gggg....gggg..",
  "..bbbb....bbbb..",
  ".bbbbb....bbbbb.",
];
// Veggie Boy map sprite, 7x11.
export const VEGGIE_SPRITE = [
  "...l...", ".kkgkk.", "kMwMwMk", "ksssssk", "k.sms.k", ".ggggg.", "gglllgg", "s.ggg.s", ".GgGgG.", ".gg.gg.", ".bb.bb.",
];

export function blit(c, rows, pal, ox, oy, scale = 1, flip = false) {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const col = pal[row[x]];
      if (!col) continue;
      const xx = flip ? row.length - 1 - x : x;
      rect(c, ox + xx * scale, oy + y * scale, scale, scale, col);
    }
  }
}

export function drawPortrait(canvas, who) {
  const p = canvas.getContext("2d");
  p.clearRect(0, 0, 24, 24);
  rect(p, 0, 0, 24, 24, who === "baron" ? "#3a1f24" : "#22246a");
  blit(p, who === "baron" ? BARON_PORTRAIT : VEGGIE_PORTRAIT, who === "baron" ? PAL_BT : PAL_VB, 0, 0);
}

export function drawBaronPortrait(c, x, y, scale) {
  blit(c, BARON_PORTRAIT, PAL_BT, x, y, scale);
}

export function drawVeggie(c, x, y) {
  blit(c, VEGGIE_SPRITE, PAL_VB, x, y);
}

/** Veggie Boy's leaf cape, drawn behind the body. */
function cape(c, x, y, s) {
  for (let r = 0; r < 12; r++) {
    const spread = Math.min(4, (r / 2) | 0);
    rect(c, x + (-spread) * s, y + (12 + r) * s, (16 + spread * 2) * s, s, r % 3 === 0 ? "#1b5e20" : "#2e7d32");
    rect(c, x + (8 - 0.5) * s, y + (12 + r) * s, s, s, "#1b5e20");
  }
  for (let k = 0; k < 4; k++) rect(c, x + (-4 + k * 7) * s, y + 24 * s, 3 * s, s, "#2e7d32");
}

export function drawVeggieBody(c, x, y, s = 2, botanist = false) {
  if (!botanist) cape(c, x, y, s);
  blit(c, botanist ? VEGGIE_BODY.map((r, i) => (i < 2 ? r.replace(/[lgG]/g, ".") : r)) : VEGGIE_BODY, botanist ? PAL_BOTANIST : PAL_VB, x, y, s);
}

/* ---------- map walkers (8x8 cell) ---------- */
export function drawWalker(c, sp, x, y) {
  switch (sp) {
    case "pangolin":
      rect(c, x + 2, y + 3, 4, 2, "#c0873f"); rect(c, x + 3, y + 3, 1, 1, "#8a5a28"); rect(c, x + 5, y + 3, 1, 1, "#8a5a28");
      rect(c, x + 6, y + 4, 1, 1, "#e6b48c"); rect(c, x + 1, y + 4, 1, 1, "#8a5a28");
      break;
    case "colugo":
      rect(c, x + 1, y + 3, 6, 2, "#9e978a"); rect(c, x + 3, y + 2, 2, 4, "#cfc8b4"); rect(c, x + 4, y + 2, 1, 1, "#1a1a1a");
      break;
    case "leopardcat":
      rect(c, x + 1, y + 4, 4, 2, "#d9a441"); rect(c, x + 2, y + 4, 1, 1, "#3a2a1a"); rect(c, x + 4, y + 5, 1, 1, "#3a2a1a");
      rect(c, x + 5, y + 3, 2, 2, "#d9a441"); rect(c, x + 5, y + 2, 1, 1, "#d9a441"); rect(c, x + 6, y + 2, 1, 1, "#d9a441");
      rect(c, x + 0, y + 4, 1, 1, "#8a6a2a");
      break;
    case "otter":
      rect(c, x + 1, y + 4, 5, 2, "#6b4a2e"); rect(c, x + 6, y + 3, 2, 2, "#8a6a4a"); rect(c, x + 0, y + 5, 1, 1, "#6b4a2e");
      rect(c, x + 7, y + 3, 1, 1, "#1a1a1a");
      break;
    case "frog":
      rect(c, x + 2, y + 4, 4, 2, "#b8c94a"); rect(c, x + 2, y + 3, 1, 1, "#d8e86a"); rect(c, x + 5, y + 3, 1, 1, "#d8e86a");
      rect(c, x + 1, y + 6, 1, 1, "#8a9a2a"); rect(c, x + 6, y + 6, 1, 1, "#8a9a2a"); rect(c, x + 3, y + 4, 2, 1, "#6a7a2a");
      break;
    case "monitor":
      rect(c, x + 1, y + 4, 5, 1, "#6f7a4a"); rect(c, x + 6, y + 4, 2, 1, "#5a6438"); rect(c, x + 0, y + 5, 1, 1, "#5a6438");
      rect(c, x + 2, y + 5, 1, 1, "#4a5230"); rect(c, x + 4, y + 3, 1, 1, "#4a5230"); rect(c, x + 3, y + 4, 1, 1, "#d9c96a");
      break;
    case "hornbill":
      rect(c, x + 2, y + 3, 3, 2, "#1a1a1a"); rect(c, x + 2, y + 5, 2, 1, "#f4f4f4"); rect(c, x + 5, y + 2, 2, 1, "#e8c53a");
      rect(c, x + 5, y + 3, 2, 1, "#f2e3a0"); rect(c, x + 1, y + 4, 1, 1, "#f4f4f4");
      break;
    case "squirrel":
      rect(c, x + 2, y + 4, 3, 2, "#a0522d"); rect(c, x + 0, y + 2, 2, 3, "#8a4a2a"); rect(c, x + 5, y + 3, 2, 2, "#a0522d");
      rect(c, x + 3, y + 5, 2, 1, "#d9772a"); rect(c, x + 6, y + 3, 1, 1, "#1a1a1a");
      break;
    default: // bulbul
      rect(c, x + 3, y + 3, 2, 2, "#8a8f3a"); rect(c, x + 5, y + 3, 1, 1, "#e8d25a"); rect(c, x + 2, y + 3, 1, 1, "#5c6128");
  }
}

/* ---------- title-screen animals (drawn at 1x on the 384x224 scene) ---------- */
const A = {
  pangolin: {
    pal: { p: "#b07a3a", P: "#7a5226", s: "#e6b48c", k: "#1a1a1a" },
    rows: ["....pPpP......", "..pPpPpPpP....", ".pPpPpPpPpPp..", "pPpPpPpPpPpPss", "PpPpPpPpPpPsks", ".P..P...P..P.."],
  },
  colugo: {
    pal: { c: "#9e978a", C: "#cfc8b4", d: "#6f6a60", k: "#1a1a1a" },
    rows: ["c..............c", "cc....CC.....ccc", "ccccccCkCccccccc", ".dcccCCCCcccccd.", "..dcccCCcccccd..", "....ddcccdd.....", "......d..d......"],
  },
  hornbill: {
    pal: { k: "#1a1a1a", w: "#f4f4f4", y: "#e8c53a", Y: "#f2e3a0", e: "#8a2a2a" },
    rows: ["......yyy.", ".....kkyyy", "....kkekYYY", "...kkkkYY..", "..kkkkkk...", ".kkwwkkk...", "kkwwwkk....", "k..kk......", "...k.k....."],
  },
  otter: {
    pal: { o: "#6b4a2e", O: "#8a6a4a", k: "#1a1a1a", w: "#9fc3ff" },
    rows: ["......OO.", ".....OkOO", "ww.ooooOw", ".wwwwwwww"],
  },
  leopardcat: {
    pal: { t: "#d9a441", T: "#b8862a", k: "#2a1a0a", w: "#f2e3c0" },
    rows: [".........t.t", "k........ttt", ".k......tkttw", "..tktttktttt.", "..ttkttttkt..", "..t.t....t.t.", "..k.k....k.k."],
  },
  monitor: {
    pal: { m: "#6f7a4a", M: "#5a6438", y: "#d9c96a", k: "#1a1a1a" },
    rows: ["...........M.M.....", "mm...mmymmmmmmmmkm.", ".mMMmmmmmymmmmmmmmm", "..........M...M...."],
  },
  squirrel: {
    pal: { r: "#a0522d", R: "#8a4a2a", o: "#d9772a", k: "#1a1a1a" },
    rows: ["RR.......", "RRR...rr.", ".RR..rkr.", ".RR.rrrr.", "..RrrroR.", "...rroo..", "...r..r.."],
  },
  frog: {
    pal: { f: "#b8c94a", F: "#8a9a2a", y: "#d8e86a", k: "#1a1a1a" },
    rows: [".yk.ky.", "fffffff", "FfffffF", "F.F.F.F"],
  },
  nettle: {
    pal: { s: "#3d7a2a", p: "#6a3fa0", P: "#8a4fc8", g: "#e070ff", w: "#ffffff" },
    rows: [
      ".....g.....", "....gPg....", "...wPPPw...", "....PsP....", ".g..psp..g.", "gPw.PsP.wPg", ".PPppsppPP.",
      "..pPPsPPp..", "....PsP....", ".gw.psp.wg.", "gPPppsppPPg", ".pPPPsPPPp.", "...ppsp....", ".....s.....",
      "....psp....", "..PPpsp....", ".....s.....", ".....s.....",
    ],
  },
};

export function drawTitleAnimal(c, key, x, y, scale = 1, flip = false) {
  const a = A[key];
  blit(c, a.rows, a.pal, x, y, scale, flip);
}
