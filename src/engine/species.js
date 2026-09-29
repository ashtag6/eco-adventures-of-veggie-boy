import { T, TILE_COUNT } from "./tiles.js";

// Build a resistance array from a { TILE_NAME: value } object, with a fallback for unlisted tiles.
function surface(values, fallback = 5000) {
  const a = new Array(TILE_COUNT).fill(fallback);
  for (const [k, v] of Object.entries(values)) a[T[k]] = v;
  return a;
}

/**
 * Species. Resistance values are illustrative and tuned for play, not a published parameterisation.
 * traits:
 *   fly            haze keeps it under cover (open ground harder)
 *   swim           monsoon floods make concrete canals harder
 *   floodSensitive monsoon floods underpasses for it
 *   wet            monsoon makes grass easier (damp)
 *   light          night-lighting multiplier on lit cells (Manday)
 * kill = chance per step that an animated walker is hit on bare road (visual only).
 */
export const SPECIES = {
  pangolin: {
    name: "Sunda pangolin", short: "Pangolin", colour: "#c0873f", kill: 0.12,
    traits: { floodSensitive: true, light: 2 },
    blurb: "Walks the forest floor at night. Can't climb over roads; needs underpasses or eco-bridges.",
    res: surface({ FOREST: 1, SCRUB: 2, GRASS: 6, ROAD: 200, ECO: 1.5, UNDER: 2, ROPE: 200, SAPLING: 3,
      WATER: 60, CANAL: 400, NATCANAL: 30, MANGROVE: 4, MUD: 20, MSAPLING: 20, BOARDWALK: 8, SEAWALL: 400 }),
  },
  colugo: {
    name: "Sunda colugo", short: "Colugo", colour: "#cfc8b4", kill: 0.08,
    traits: { light: 3 },
    blurb: "Glides from tree to tree at night. Open ground and roads stop it; rope bridges and tree lines help.",
    res: surface({ FOREST: 1, SCRUB: 6, GRASS: 40, ROAD: 2500, ECO: 3, UNDER: 2500, ROPE: 2, SAPLING: 12,
      WATER: 400, CANAL: 2500, NATCANAL: 60, MANGROVE: 3, MUD: 400, MSAPLING: 40, BOARDWALK: 60 }),
  },
  leopardcat: {
    name: "Leopard cat", short: "Leopard cat", colour: "#d9a441", kill: 0.1,
    traits: { floodSensitive: true, light: 4 },
    blurb: "A small wild cat that hunts at night. Bright lights scare it off even where there is cover.",
    res: surface({ FOREST: 1, SCRUB: 1.5, GRASS: 4, ROAD: 150, ECO: 1.5, UNDER: 2, ROPE: 150, SAPLING: 2.5,
      WATER: 40, CANAL: 300, NATCANAL: 20, MANGROVE: 3, MUD: 15, MSAPLING: 15, BOARDWALK: 6, SEAWALL: 300 }),
  },
  otter: {
    name: "Smooth-coated otter", short: "Otter", colour: "#8a5a3a", kill: 0.1,
    traits: { swim: true },
    blurb: "Travels along rivers and canals. Roads over water are its deadliest crossing; ledges under bridges save lives.",
    res: surface({ FOREST: 4, SCRUB: 3, GRASS: 5, ROAD: 150, ECO: 3, UNDER: 1.5, ROPE: 150, SAPLING: 4,
      WATER: 1, CANAL: 2, NATCANAL: 1, MANGROVE: 1, MUD: 4, SEA: 3, MSAPLING: 2, BOARDWALK: 4, SEAWALL: 60 }),
  },
  frog: {
    name: "Four-lined tree frog", short: "Tree frog", colour: "#b8c94a", kill: 0.15,
    traits: { wet: true },
    blurb: "Needs damp, leafy cover. Steep concrete canals are a wall to it; soft, planted banks are a highway.",
    res: surface({ FOREST: 1, SCRUB: 1.5, GRASS: 8, ROAD: 300, ECO: 2, UNDER: 4, ROPE: 300, SAPLING: 3,
      WATER: 3, CANAL: 500, NATCANAL: 1.5, MANGROVE: 3, MUD: 6, MSAPLING: 4, BOARDWALK: 20, SEAWALL: 500 }),
  },
  monitor: {
    name: "Malayan water monitor", short: "Water monitor", colour: "#6f7a4a", kill: 0.1,
    traits: { swim: true },
    blurb: "A big lizard that swims well and loves mangroves and mudflats. Busy roads are its main danger.",
    res: surface({ FOREST: 1.5, SCRUB: 1.5, GRASS: 3, ROAD: 150, ECO: 1.5, UNDER: 1.5, ROPE: 150, SAPLING: 2,
      WATER: 1, CANAL: 3, NATCANAL: 1, MANGROVE: 1, MUD: 4, SEA: 4, MSAPLING: 2, BOARDWALK: 2, SEAWALL: 300 }),
  },
  hornbill: {
    name: "Oriental pied hornbill", short: "Hornbill", colour: "#e8c53a", kill: 0,
    traits: { fly: true },
    blurb: "Flies between tall trees and spreads big seeds. Needs stepping-stone trees across open ground and sea.",
    res: surface({ FOREST: 1, SCRUB: 4, GRASS: 12, ROAD: 20, BUILD: 40, ECO: 2, UNDER: 20, ROPE: 12, SAPLING: 6,
      DEV: 40, DEPOT: 40, WATER: 8, CANAL: 15, NATCANAL: 8, MANGROVE: 1.5, MUD: 12, SEA: 25, MSAPLING: 6, BOARDWALK: 10, SEAWALL: 20 }),
  },
  squirrel: {
    name: "Plantain squirrel", short: "Squirrel", colour: "#a0522d", kill: 0.08,
    traits: {},
    blurb: "Scampers through the canopy by day. Can't swim; needs a leafy route across roads and water.",
    res: surface({ FOREST: 1, SCRUB: 3, GRASS: 15, ROAD: 600, ECO: 2, UNDER: 600, ROPE: 1.5, SAPLING: 6,
      NATCANAL: 40, MANGROVE: 2, MUD: 200, MSAPLING: 20, BOARDWALK: 3 }),
  },
  bulbul: {
    name: "Olive-winged bulbul", short: "Bulbul", colour: "#e8d25a", kill: 0,
    traits: { fly: true },
    blurb: "A common songbird that spreads small seeds. Its trails decide where planted saplings grow fastest.",
    res: surface({ FOREST: 1, SCRUB: 1.5, GRASS: 4, ROAD: 15, BUILD: 60, ECO: 1, UNDER: 15, ROPE: 8, SAPLING: 2,
      DEV: 60, DEPOT: 60, WATER: 8, CANAL: 10, NATCANAL: 4, MANGROVE: 1.5, MUD: 8, SEA: 25, MSAPLING: 3, BOARDWALK: 4, SEAWALL: 20 }),
  },
};

export const SPECIES_KEYS = Object.keys(SPECIES);
