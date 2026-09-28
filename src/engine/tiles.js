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
};

export const TYPE_NAMES = [
  "Forest",
  "Scrub",
  "Grass",
  "Expressway",
  "Building Agency block",
  "Eco-bridge",
  "Underpass",
  "Rope bridge",
  "Sapling",
  "New estate",
  "MRP depot",
];

export const TYPE_SWATCH = [
  "#1f5a2e", "#3f8a3c", "#86c25a", "#55555f", "#e9dfc8",
  "#3d8b3d", "#2a2a33", "#c08a4a", "#a3d977", "#e9dfc8", "#7d8699",
];

export const roadLike = (t) => t === T.ROAD || t === T.ECO || t === T.UNDER || t === T.ROPE;
export const isBuilt = (t) => t === T.BUILD || t === T.DEV || t === T.DEPOT;
export const isCrossing = (t) => t === T.ECO || t === T.UNDER || t === T.ROPE;
