// Land-cover codes. The index is used directly into each species' resistance array.
export const T = {
  FOREST: 0,
  SCRUB: 1,
  GRASS: 2,
  ROAD: 3,
  BUILD: 4,
  ECO: 5,
  UNDER: 6,
  ROPE: 7,
  SAPLING: 8,
  DEV: 9,
  DEPOT: 10,
  WATER: 11,
  CANAL: 12,
  NATCANAL: 13,
  MANGROVE: 14,
  MUD: 15,
  SEA: 16,
  MSAPLING: 17,
  BOARDWALK: 18,
  SEAWALL: 19,
};
export const TILE_COUNT = 20;

export const TYPE_NAMES = [
  "Forest",
  "Scrub",
  "Grass",
  "Road",
  "Building Agency block",
  "Eco-bridge",
  "Underpass",
  "Rope bridge",
  "Sapling",
  "New development",
  "Depot",
  "River",
  "Concrete canal",
  "Naturalised canal",
  "Mangrove",
  "Mudflat",
  "Sea",
  "Mangrove sapling",
  "Planted boardwalk",
  "Seawall promenade",
];

export const TYPE_SWATCH = [
  "#1f5a2e", "#3f8a3c", "#86c25a", "#55555f", "#e9dfc8",
  "#3d8b3d", "#2a2a33", "#c08a4a", "#a3d977", "#e9dfc8", "#7d8699",
  "#3b7fb8", "#9aa3ad", "#4f9a8a", "#2f6b4a", "#8a7552", "#1f4f8a", "#6f9a5a", "#a9854f", "#b9b3a6",
];

export const roadLike = (t) => t === T.ROAD || t === T.ECO || t === T.UNDER || t === T.ROPE;
export const isBuilt = (t) => t === T.BUILD || t === T.DEV || t === T.DEPOT || t === T.SEAWALL;
export const isCrossing = (t) => t === T.ECO || t === T.UNDER || t === T.ROPE;
export const isWater = (t) => t === T.WATER || t === T.CANAL || t === T.NATCANAL || t === T.SEA;
export const isCover = (t) => t === T.FOREST || t === T.SCRUB || t === T.SAPLING || t === T.MANGROVE || t === T.MSAPLING;
