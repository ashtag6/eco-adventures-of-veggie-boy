import { W, H, TILE, hash } from "../engine/grid.js";
import { T, roadLike, isBuilt } from "../engine/tiles.js";

const ROOFS = ["#c0563f", "#3f6fc0", "#d99a2b", "#6a4fb0"];

export const rect = (c, x, y, w, h, col) => {
  c.fillStyle = col;
  c.fillRect(x, y, w, h);
};

function roadBase(c, px, py, y, look) {
  rect(c, px, py, 8, 8, "#55555f");
  if (!roadLike(look(-1, 0))) rect(c, px, py, 1, 8, "#8a8a94");
  if (!roadLike(look(1, 0))) rect(c, px + 7, py, 1, 8, "#8a8a94");
  else if (y % 2 === 0) rect(c, px + 7, py + 2, 1, 4, "#d8d6e8");
}

/** Draw one 8x8 tile. `look(dx, dy)` returns the neighbouring tile code (or -1 off-map). */
export function drawTile(c, px, py, t, x, y, look, v = 0) {
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
      roadBase(c, px, py, y, look);
      break;
    case T.ECO:
      rect(c, px, py, 8, 8, "#3d8b3d");
      rect(c, px + ((h1 * 4) | 0), py + 2, 4, 3, "#2e7a3c");
      rect(c, px + 1 + ((h2 * 5) | 0), py + 2, 1, 1, "#6cbf5a");
      if (look(0, -1) !== T.ECO) rect(c, px, py, 8, 1, "#7a5a3a");
      if (look(0, 1) !== T.ECO) rect(c, px, py + 7, 8, 1, "#7a5a3a");
      break;
    case T.UNDER:
      roadBase(c, px, py, y, look);
      rect(c, px, py + 2, 8, 4, "#2a2a33");
      rect(c, px, py + 2, 8, 1, "#6b4f2a");
      break;
    case T.ROPE:
      roadBase(c, px, py, y, look);
      rect(c, px, py + 3, 8, 1, "#c08a4a");
      rect(c, px + 1, py + 4, 1, 1, "#6b3f1d");
      rect(c, px + 5, py + 4, 1, 1, "#6b3f1d");
      if (!roadLike(look(-1, 0))) rect(c, px, py + 1, 1, 6, "#6b3f1d");
      if (!roadLike(look(1, 0))) rect(c, px + 7, py + 1, 1, 6, "#6b3f1d");
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
  }
}

/** Redraw the full tile layer into an offscreen canvas context. */
export function renderTiles(c, land, variant) {
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? -1 : land[y * W + x]);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      drawTile(c, x * TILE, y * TILE, land[y * W + x], x, y, (dx, dy) => at(x + dx, y + dy), variant[y * W + x]);
}

export { isBuilt };
