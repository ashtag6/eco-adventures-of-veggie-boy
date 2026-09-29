import { W, H, N } from "./grid.js";
import { T, roadLike } from "./tiles.js";

/**
 * Build tools. Each level lists the tools it offers (level.tools), in the order shown in the panel.
 * kind: "paint"    converts one cell of `from` into `to`; can be dragged
 *       "crossing" spans the full width of a road (eco-bridges are two cells deep)
 *       "boardwalk" sea cell next to a road or boardwalk
 *       "dim"      wildlife-friendly lighting over a 5x5 area
 */
export const TOOLS = {
  inspect: { label: "Inspect", cost: 0, kind: "inspect" },
  plant: { label: "Plant sapling", cost: 1, kind: "paint", from: T.GRASS, to: T.SAPLING, icon: T.SAPLING, need: "Saplings go on grass." },
  mangrove: { label: "Plant mangrove", cost: 1, kind: "paint", from: T.MUD, to: T.MSAPLING, icon: T.MSAPLING, need: "Mangroves go on mudflats." },
  natcanal: { label: "Naturalise canal", cost: 2, kind: "paint", from: T.CANAL, to: T.NATCANAL, icon: T.NATCANAL, need: "Pick a concrete canal." },
  boardwalk: { label: "Planted boardwalk", cost: 2, kind: "boardwalk", to: T.BOARDWALK, icon: T.BOARDWALK },
  rope: { label: "Rope bridge", cost: 3, kind: "crossing", to: T.ROPE, icon: T.ROPE },
  under: { label: "Underpass", cost: 5, kind: "crossing", to: T.UNDER, icon: T.UNDER },
  eco: { label: "Eco-bridge", cost: 12, kind: "crossing", to: T.ECO, icon: T.ECO, deep: 2 },
  dim: { label: "Wildlife lighting", cost: 2, kind: "dim", icon: null },
};

function crossingCells(state, x, y, deep) {
  const L = state.land;
  if (L[y * W + x] !== T.ROAD) return { ok: false, msg: "Crossings go on a road." };
  const v = state.roads.find((r) => r.axis === "v" && r.lines.includes(x));
  const h = state.roads.find((r) => r.axis === "h" && r.lines.includes(y));
  if (v && h) return { ok: false, msg: "Too close to the junction." };
  if (!v && !h) return { ok: false, msg: "Crossings go on a road." };
  const road = v || h;
  const other = state.roads.filter((r) => r.axis !== road.axis).flatMap((r) => r.lines);
  const cells = [];
  for (let k = 0; k < deep; k++) {
    const along = road.axis === "v" ? y + k : x + k;
    if (along >= (road.axis === "v" ? H : W)) return { ok: false, msg: "No room here." };
    if (other.includes(along)) return { ok: false, msg: "Too close to the junction." };
    for (const line of road.lines) {
      const j = road.axis === "v" ? along * W + line : line * W + along;
      if (L[j] !== T.ROAD) return { ok: false, msg: "There's already a crossing here." };
      cells.push(j);
    }
  }
  return { ok: true, cells };
}

/** Can `toolId` be used at (x, y)? Returns { ok, cells } or { ok: false, msg }. */
export function checkTool(state, toolId, x, y, lit = null) {
  const tool = TOOLS[toolId];
  const i = y * W + x, L = state.land;
  if (!tool || tool.kind === "inspect") return { ok: false, msg: "" };
  if (tool.cost > state.budget) return { ok: false, msg: "Not enough budget." };
  switch (tool.kind) {
    case "paint":
      return L[i] === tool.from ? { ok: true, cells: [i] } : { ok: false, msg: tool.need };
    case "crossing":
      return crossingCells(state, x, y, tool.deep || 1);
    case "boardwalk": {
      if (L[i] !== T.SEA) return { ok: false, msg: "Boardwalks go on the sea, next to a road or boardwalk." };
      const nb = [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W].filter((j) => j >= 0 && j < N);
      return nb.some((j) => roadLike(L[j]) || L[j] === T.BOARDWALK)
        ? { ok: true, cells: [i] }
        : { ok: false, msg: "Start boardwalks next to a road or another boardwalk." };
    }
    case "dim": {
      if (!lit) return { ok: false, msg: "There's no night lighting here." };
      const cells = [];
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const j = yy * W + xx;
          if (lit[j] && !state.dark[j]) cells.push(j);
        }
      return cells.length ? { ok: true, cells } : { ok: false, msg: "No bright lights here." };
    }
  }
  return { ok: false, msg: "" };
}

/** Apply a tool to the cells returned by checkTool and charge the cost. */
export function applyTool(state, toolId, cells) {
  const tool = TOOLS[toolId];
  state.budget -= tool.cost;
  for (const i of cells) {
    if (tool.kind === "dim") { state.dark[i] = 1; continue; }
    state.land[i] = tool.to;
    if (tool.to === T.SAPLING || tool.to === T.MSAPLING) { state.grow[i] = 1; state.age[i] = 0; }
  }
}
