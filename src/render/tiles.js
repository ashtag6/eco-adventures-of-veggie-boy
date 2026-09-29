import { W, H, TILE, hash } from "../engine/grid.js";
import { T, roadLike, isWater } from "../engine/tiles.js";

const ROOFS = ["#c0563f", "#3f6fc0", "#d99a2b", "#6a4fb0"];

export const rect = (c, x, y, w, h, col) => {
  c.fillStyle = col;
  c.fillRect(x, y, w, h);
};

// Road surface. `ax` is "v" or "h": lane edges and dashes run along the road.
function roadBase(c, px, py, x, y, look, ax) {
  rect(c, px, py, 8, 8, "#55555f");
  if (ax === "h") {
    if (!roadLike(look(0, -1))) rect(c, px, py, 8, 1, "#8a8a94");
    if (!roadLike(look(0, 1))) rect(c, px, py + 7, 8, 1, "#8a8a94");
    else if (x % 2 === 0) rect(c, px + 2, py + 7, 4, 1, "#d8d6e8");
  } else {
    if (!roadLike(look(-1, 0))) rect(c, px, py, 1, 8, "#8a8a94");
    if (!roadLike(look(1, 0))) rect(c, px + 7, py, 1, 8, "#8a8a94");
    else if (y % 2 === 0) rect(c, px + 7, py + 2, 1, 4, "#d8d6e8");
  }
}

function water(c, px, py, x, y, base, hi, lo) {
  rect(c, px, py, 8, 8, base);
  const h1 = hash(x, y, 5), h2 = hash(x, y, 6);
  rect(c, px + ((h1 * 5) | 0), py + 2 + ((h2 * 2) | 0), 3, 1, hi);
  rect(c, px + ((h2 * 5) | 0), py + 5, 2, 1, lo);
}

/** Draw one 8x8 tile. `look(dx, dy)` returns the neighbouring tile code (-1 off-map); `ax` is road axis. */
export function drawTile(c, px, py, t, x, y, look, v = 0, ax = "v") {
  const h1 = hash(x, y, 1), h2 = hash(x, y, 2), h3 = hash(x, y, 3);
  switch (t) {
    case T.FOREST:
      rect(c, px, py, 8, 8, "#1f5a2e");
      rect(c, px + ((h1 * 3) | 0), py + 1, 5, 3, "#2e7a3c");
      rect(c, px + ((h2 * 4) | 0), py + 4, 4, 3, "#2a6f37");
      rect(c, px + 1 + ((h3 * 5) | 0), py + 1 + ((h1 * 2) | 0), 1, 1, "#5fb86a");
      break;
    case T.SCRUB:
      rect(c, px, py, 8, 8, "#3f8a3c");
      rect(c, px + ((h1 * 6) | 0), py + ((h2 * 6) | 0), 2, 2, "#2e7a3c");
      rect(c, px + ((h3 * 6) | 0), py + ((h1 * 6) | 0), 2, 2, "#2e7a3c");
      rect(c, px + ((h2 * 7) | 0), py + ((h3 * 7) | 0), 1, 1, "#7fcf62");
      break;
    case T.GRASS:
      rect(c, px, py, 8, 8, "#86c25a");
      rect(c, px + 1 + ((h1 * 5) | 0), py + 1 + ((h2 * 4) | 0), 1, 2, "#6aa84a");
      rect(c, px + 1 + ((h3 * 5) | 0), py + 3 + ((h1 * 3) | 0), 1, 2, "#6aa84a");
      break;
    case T.SAPLING:
      rect(c, px, py, 8, 8, "#86c25a");
      rect(c, px + 3, py + 3, 1, 4, "#3d7a2a");
      rect(c, px + 2, py + 3, 3, 1, "#2e7a3c");
      rect(c, px + 1, py + 2, 2, 1, "#2e7a3c");
      rect(c, px + 4, py + 2, 2, 1, "#2e7a3c");
      rect(c, px + 3, py + 1, 1, 1, "#a3d977");
      rect(c, px + 2, py + 7, 4, 1, "#6b4f2a");
      break;
    case T.ROAD:
      roadBase(c, px, py, x, y, look, ax);
      break;
    case T.ECO:
      rect(c, px, py, 8, 8, "#3d8b3d");
      rect(c, px + ((h1 * 4) | 0), py + 2, 4, 3, "#2e7a3c");
      rect(c, px + 1 + ((h2 * 5) | 0), py + 2, 1, 1, "#6cbf5a");
      if (ax === "h") {
        if (look(-1, 0) !== T.ECO) rect(c, px, py, 1, 8, "#7a5a3a");
        if (look(1, 0) !== T.ECO) rect(c, px + 7, py, 1, 8, "#7a5a3a");
      } else {
        if (look(0, -1) !== T.ECO) rect(c, px, py, 8, 1, "#7a5a3a");
        if (look(0, 1) !== T.ECO) rect(c, px, py + 7, 8, 1, "#7a5a3a");
      }
      break;
    case T.UNDER:
      roadBase(c, px, py, x, y, look, ax);
      if (ax === "h") { rect(c, px + 2, py, 4, 8, "#2a2a33"); rect(c, px + 2, py, 1, 8, "#6b4f2a"); }
      else { rect(c, px, py + 2, 8, 4, "#2a2a33"); rect(c, px, py + 2, 8, 1, "#6b4f2a"); }
      break;
    case T.ROPE:
      roadBase(c, px, py, x, y, look, ax);
      if (ax === "h") {
        rect(c, px + 3, py, 1, 8, "#c08a4a");
        rect(c, px + 4, py + 1, 1, 1, "#6b3f1d");
        rect(c, px + 4, py + 5, 1, 1, "#6b3f1d");
        if (!roadLike(look(0, -1))) rect(c, px + 1, py, 6, 1, "#6b3f1d");
        if (!roadLike(look(0, 1))) rect(c, px + 1, py + 7, 6, 1, "#6b3f1d");
      } else {
        rect(c, px, py + 3, 8, 1, "#c08a4a");
        rect(c, px + 1, py + 4, 1, 1, "#6b3f1d");
        rect(c, px + 5, py + 4, 1, 1, "#6b3f1d");
        if (!roadLike(look(-1, 0))) rect(c, px, py + 1, 1, 6, "#6b3f1d");
        if (!roadLike(look(1, 0))) rect(c, px + 7, py + 1, 1, 6, "#6b3f1d");
      }
      break;
    case T.BUILD:
    case T.DEV: {
      const bl = (t2) => t2 === T.BUILD || t2 === T.DEV;
      rect(c, px, py, 8, 8, "#e9dfc8");
      for (const [wx, wy] of [[1, 2], [5, 2], [1, 5], [5, 5]]) rect(c, px + wx, py + wy, 2, 1, "#6d8fb3");
      if (!bl(look(0, -1))) rect(c, px, py, 8, 2, t === T.DEV ? "#b8452f" : ROOFS[v % 4]);
      if (!bl(look(0, 1))) rect(c, px, py + 7, 8, 1, "#b9ac90");
      if (!bl(look(1, 0))) rect(c, px + 7, py, 1, 8, "#c9bc9f");
      if (t === T.DEV && !bl(look(0, -1))) rect(c, px + 3, py, 2, 1, "#ffd34d");
      break;
    }
    case T.DEPOT:
      rect(c, px, py, 8, 8, "#7d8699");
      rect(c, px, py + (y % 2 ? 1 : 5), 8, 1, "#5d6577");
      if (look(0, -1) !== T.DEPOT) rect(c, px, py, 8, 2, "#3f4656");
      break;
    case T.WATER:
      water(c, px, py, x, y, "#3b7fb8", "#6aa6dc", "#2f6a9e");
      break;
    case T.SEA:
      water(c, px, py, x, y, "#1f4f8a", "#3f73b5", "#173e70");
      break;
    case T.CANAL: {
      water(c, px, py, x, y, "#4a86b0", "#79aed4", "#3b6f96");
      const edge = (d) => { const u = look(d[0], d[1]); return !(isWater(u) || roadLike(u) || u === -1); };
      if (edge([0, -1])) rect(c, px, py, 8, 2, "#9aa3ad");
      if (edge([0, 1])) rect(c, px, py + 6, 8, 2, "#9aa3ad");
      if (edge([-1, 0])) rect(c, px, py, 2, 8, "#9aa3ad");
      if (edge([1, 0])) rect(c, px + 6, py, 2, 8, "#9aa3ad");
      break;
    }
    case T.NATCANAL: {
      water(c, px, py, x, y, "#3f86a6", "#6fb2cf", "#336d88");
      const bank = (d) => { const u = look(d[0], d[1]); return !(isWater(u) || roadLike(u) || u === -1); };
      if (bank([0, -1])) { rect(c, px, py, 8, 2, "#4f9a5a"); rect(c, px + ((h1 * 6) | 0), py + 2, 1, 2, "#7fcf62"); }
      if (bank([0, 1])) { rect(c, px, py + 6, 8, 2, "#4f9a5a"); rect(c, px + ((h2 * 6) | 0), py + 4, 1, 2, "#7fcf62"); }
      if (bank([-1, 0])) rect(c, px, py, 2, 8, "#4f9a5a");
      if (bank([1, 0])) rect(c, px + 6, py, 2, 8, "#4f9a5a");
      break;
    }
    case T.MUD:
      rect(c, px, py, 8, 8, "#8a7552");
      rect(c, px + ((h1 * 6) | 0), py + ((h2 * 6) | 0), 2, 1, "#6f5d40");
      rect(c, px + ((h3 * 6) | 0), py + 1 + ((h1 * 5) | 0), 2, 1, "#a08a66");
      break;
    case T.MANGROVE:
      rect(c, px, py, 8, 8, "#6f5d40");
      rect(c, px, py, 8, 5, "#2f6b4a");
      rect(c, px + ((h1 * 4) | 0), py + 1, 4, 2, "#3f8a5a");
      rect(c, px + 1, py + 5, 1, 3, "#4a3a28");
      rect(c, px + 4, py + 5, 1, 3, "#4a3a28");
      rect(c, px + 6, py + 5, 1, 2, "#4a3a28");
      rect(c, px + 2, py + 6, 2, 1, "#4a3a28");
      break;
    case T.MSAPLING:
      rect(c, px, py, 8, 8, "#8a7552");
      rect(c, px + 3, py + 3, 1, 4, "#4a3a28");
      rect(c, px + 2, py + 2, 3, 1, "#3f8a5a");
      rect(c, px + 3, py + 1, 1, 1, "#6fc08a");
      rect(c, px + 2, py + 6, 1, 1, "#4a3a28");
      rect(c, px + 4, py + 6, 1, 1, "#4a3a28");
      break;
    case T.BOARDWALK:
      water(c, px, py, x, y, "#1f4f8a", "#3f73b5", "#173e70");
      rect(c, px + 1, py, 6, 8, "#a9854f");
      for (let k = 0; k < 8; k += 2) rect(c, px + 1, py + k, 6, 1, "#8a6a3a");
      rect(c, px + 1, py + 1, 2, 2, "#3f8a3c");
      rect(c, px + 5, py + 4, 2, 2, "#3f8a3c");
      break;
    case T.SEAWALL:
      rect(c, px, py, 8, 8, "#b9b3a6");
      rect(c, px, py + (y % 2 ? 2 : 5), 8, 1, "#9f998c");
      rect(c, px + (x % 3) * 2, py + 1, 1, 1, "#d8d2c4");
      if (look(0, -1) === T.SEA || look(0, -1) === T.MUD) rect(c, px, py, 8, 1, "#7d776a");
      break;
  }
}

/** Road axis per cell from the level's road list (for drawing crossings and lanes). */
export function roadAxes(roads) {
  const ax = new Array(W * H).fill("v");
  for (const r of roads)
    for (const line of r.lines)
      for (let k = 0; k < (r.axis === "v" ? H : W); k++) ax[r.axis === "v" ? k * W + line : line * W + k] = r.axis;
  return ax;
}

/** Redraw the full tile layer into an offscreen canvas context. */
export function renderTiles(c, land, variant, roads = []) {
  const ax = roadAxes(roads);
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? -1 : land[y * W + x]);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      drawTile(c, x * TILE, y * TILE, land[y * W + x], x, y, (dx, dy) => at(x + dx, y + dy), variant[y * W + x], ax[y * W + x]);
}
