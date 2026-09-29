import { W, H } from "../engine/grid.js";
import { T } from "../engine/tiles.js";
import { mapKit } from "./mapkit.js";

// Chapter 1. Tutorial: generous budget, one road, two species, one storm year and one haze year.
export default {
  id: "wudlands",
  chapter: 1,
  name: "Wudlands",
  title: "The Wudlands crossing",
  place: "An expressway has split the forest between the Central Kachang Reserve and Wudlands Wood.",
  startYear: 2026,
  lastYear: 2031,
  target: 70,
  budget: 20,
  income: 10,
  goodwill: 2,
  species: ["pangolin", "colugo"],
  disperser: "bulbul",
  tools: ["plant", "rope", "under", "eco"],
  roads: [{ axis: "v", lines: [22, 23, 24], name: "Bukit Kachang Expressway" }],
  killScale: { pangolin: 9, colugo: 6 },
  starKills: 20,
  seed: 20260928,
  cores: [
    { name: "Central Kachang Reserve", test: (x) => x <= 2 },
    { name: "Wudlands Wood", test: (x, y) => x >= 45 && y <= 17 },
  ],
  labels: [
    { text: "Central Kachang Reserve", style: "left:1.5%;top:4%" },
    { text: "Bukit Kachang Expressway", style: "left:40%;top:88%" },
    { text: "Wudlands Wood", style: "right:1.5%;top:4%" },
    { text: "Building Agency estate", style: "right:12%;top:62%" },
  ],
  tableTiles: [T.FOREST, T.SCRUB, T.GRASS, T.SAPLING, T.ROAD, T.BUILD, T.ECO, T.UNDER, T.ROPE],

  buildMap() {
    const k = mapKit(this.seed);
    const { r } = k;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const h = r();
        let t = T.GRASS;
        if (x <= 10) t = T.FOREST;
        else if (x <= 13) t = h < 0.6 ? T.FOREST : T.SCRUB;
        else if (x <= 20) t = h < 0.22 ? T.FOREST : h < 0.58 ? T.SCRUB : T.GRASS;
        else if (x === 21) t = T.GRASS;
        else if (x <= 24) t = T.ROAD;
        else if (x >= 40) {
          if (y <= 17) t = x <= 41 ? (h < 0.6 ? T.SCRUB : T.FOREST) : T.FOREST;
          else t = h < 0.5 ? T.SCRUB : T.GRASS;
        }
        k.set(x, y, t);
      }
    for (const [cx, cy, rad] of [[29, 6, 1.6], [34, 10, 1.6], [37, 4, 1.4], [30, 14, 1.3]]) k.disc(cx, cy, rad, T.SCRUB, T.FOREST);
    k.blocks([[27, 19], [27, 23], [31, 19], [31, 23], [35, 19], [35, 23]]);
    return k.done();
  },

  intro: [
    "Veggie Boy here! The Bukit Kachang Expressway has split the forest in two. Animals in the Central Kachang Reserve are cut off from Wudlands Wood, and cut-off populations slowly dwindle away.",
    "See the glowing trails? They show where animals are trying to travel. Purple is a quiet trail, pink is a busy one, and white is a bottleneck. Where trails bunch up at the road, that's where animals get hit by traffic. Switch species on the right to see each one's trails.",
    "Pangolins walk, so they need an underpass or an eco-bridge. Colugos glide tree to tree, so they need a rope bridge or eco-bridge AND tree cover leading up to it.",
    "Plant saplings on grass. Bulbuls drop seeds as they travel, so planting on busy bulbul trails grows forest faster. Goal: both connection meters at 70% by the end of 2031. Watch the weather, and watch out for Baron Tarmac...",
  ],

  weather: { 2029: "thunderstorm", 2031: "haze" },

  cards: {
    2027: {
      text: "Mwahaha! The Building Agency needs 800 new flats. My Wudlands North estate goes right on those scrubby stepping stones east of the expressway.",
      options: [
        {
          label: "Accept plan",
          effects: [{ op: "develop", tile: "DEV", rects: [[27, 4, 3, 3], [31, 4, 3, 3], [27, 9, 3, 3], [31, 9, 3, 3]] }],
          reply: "The new estate is up. Those stepping stones are gone, so check how the trails have shifted.",
        },
        {
          label: "Negotiate: shift south",
          goodwill: 1,
          effects: [{ op: "develop", tile: "DEV", rects: [[27, 14, 3, 3], [31, 14, 3, 3]] }],
          reply: "Nice! Baron Tarmac squeezed the estate in beside the existing blocks. The stepping stones survive.",
        },
      ],
    },
    2028: {
      text: "Traffic! Traffic everywhere! I'm widening the Bukit Kachang Expressway by a whole lane. Your little crossings will just have to stretch.",
      options: [
        { label: "Accept widening", effects: [{ op: "widen", road: 0 }], reply: "The expressway is wider now. Crossings stretched with it, but the extra lane makes it harder to cross." },
        {
          label: "Demand mitigation fund (+$10k)",
          goodwill: 1,
          effects: [{ op: "widen", road: 0 }, { op: "budget", amount: 10 }],
          reply: "The widening went ahead, but Concrete Co. paid $10k into the mitigation fund. Spend it well!",
        },
      ],
    },
    2030: {
      text: "Singacity needs trains, and trains need a depot. The MRP depot goes on the edge of Wudlands Wood. Trees don't vote, Veggie Boy!",
      options: [
        { label: "Accept depot", effects: [{ op: "develop", tile: "DEPOT", rects: [[36, 8, 6, 8]] }], reply: "The depot has bitten into the forest edge. The eastern approach just got harder." },
        {
          label: "Negotiate: move to grassland",
          goodwill: 1,
          effects: [{ op: "develop", tile: "DEPOT", rects: [[40, 20, 6, 6]] }],
          reply: "Baron Tarmac grumbled, but the depot went onto open grassland to the south. The wood stays whole.",
        },
      ],
    },
  },

  // A sample plan that wins (checked by tests): card choices by year, then builds placed in year one.
  solution: {
    choices: {"2027":1,"2030":1},
    builds: [
      ["eco",22,9],
      ["eco",22,4],
      ["rope",22,12],
      ["plant",25,12],
      ["plant",26,12],
      ["plant",21,12],
    ],
  },
};
