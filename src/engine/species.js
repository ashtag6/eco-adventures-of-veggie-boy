// Species resistance surfaces, indexed by tile code (see tiles.js):
// [forest, scrub, grass, road, building, eco-bridge, underpass, rope bridge, sapling, new estate, depot]
// Values are illustrative and tuned for play, not drawn from a published parameterisation.
// `kill` is the chance a walker dies on each step onto bare expressway (visual only).
export const SPECIES = {
  pangolin: {
    name: "Sunda pangolin",
    short: "Pangolin",
    res: [1, 2, 6, 200, 5000, 1.5, 2, 200, 3, 5000, 5000],
    kill: 0.12,
    colour: "#c0873f",
    scored: true,
  },
  colugo: {
    name: "Sunda colugo",
    short: "Colugo",
    res: [1, 6, 40, 2500, 5000, 3, 2500, 2, 12, 5000, 5000],
    kill: 0.08,
    colour: "#cfc8b4",
    scored: true,
  },
  bulbul: {
    name: "Olive-winged bulbul",
    short: "Bulbul",
    res: [1, 1.5, 4, 15, 60, 1, 15, 8, 2, 60, 60],
    kill: 0,
    colour: "#e8d25a",
    scored: false, // drives seed rain, not scored
  },
};

export const SPECIES_KEYS = Object.keys(SPECIES);
export const SCORED = SPECIES_KEYS.filter((k) => SPECIES[k].scored);
