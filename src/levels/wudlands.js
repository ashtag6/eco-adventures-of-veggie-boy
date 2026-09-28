import { W, H, rng } from "../engine/grid.js";
import { T } from "../engine/tiles.js";

// Chapter 1. Tutorial difficulty: generous budget, one storm year and one haze year.
export default {
  id: "wudlands",
  chapter: 1,
  title: "The Wudlands crossing",
  name: "Wudlands",
  startYear: 2026,
  lastYear: 2031,
  target: 50, // link % both scored species must reach by the end of lastYear
  budget: 20, // $k at start
  income: 10, // $k added after each year review
  goodwill: 2,
  roadCols: [22, 23, 24],
  killScale: { pangolin: 9, colugo: 6 }, // roadkill per year at 100% bare-tarmac crossing
  starKills: 20, // third star if total roadkill <= this
  seed: 20260928,

  // Focal cores for the circuit: A = source (1 V), B = ground (0 V).
  isA: (x, y) => x <= 2,
  isB: (x, y) => x >= 45 && y <= 17,

  labels: [
    { text: "Central Kachang Reserve", style: "left:1.5%;top:4%" },
    { text: "Bukit Kachang Expressway", style: "left:40%;top:88%" },
    { text: "Wudlands Wood", style: "right:1.5%;top:4%" },
    { text: "Building Agency estate", style: "right:12%;top:62%" },
  ],

  buildMap() {
    const N = W * H;
    const land = new Uint8Array(N), variant = new Uint8Array(N), r = rng(this.seed);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x, h = r();
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
        land[i] = t;
        variant[i] = (r() * 4) | 0;
      }
    // Stepping stones east of the expressway
    for (const [cx, cy, rad] of [[29, 6, 1.6], [34, 10, 1.6], [37, 4, 1.4], [30, 14, 1.3]])
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const d = Math.hypot(x - cx, y - cy);
          if (d <= rad) land[y * W + x] = d < 0.8 ? T.FOREST : T.SCRUB;
        }
    // Existing Building Agency estate
    let bid = 0;
    for (const bx of [27, 31, 35])
      for (const by of [19, 23]) {
        bid++;
        for (let y = by; y < by + 3; y++)
          for (let x = bx; x < bx + 3; x++) {
            land[y * W + x] = T.BUILD;
            variant[y * W + x] = bid % 4;
          }
      }
    return { land, variant };
  },

  intro: [
    "Veggie Boy here! The Bukit Kachang Expressway has split the forest in two. Animals in the Central Kachang Reserve are cut off from Wudlands Wood, and cut-off populations slowly dwindle away.",
    "See the glowing trails? They show where animals are trying to travel. The brighter the glow, the busier the trail. Where trails bunch up at the road, you've found a bottleneck, and that's where animals get hit by traffic. Switch species on the right to see each one's trails.",
    "Pangolins walk, so they need an underpass or an eco-bridge. Colugos glide tree to tree, so they need a rope bridge or eco-bridge AND tree cover leading up to it.",
    "Plant saplings on grass. Bulbuls drop seeds as they travel, so planting on busy bulbul routes grows forest faster. Goal: get both connection meters to 50% by the end of 2031. Watch the weather, and watch out for Baron Tarmac...",
  ],

  // Weather schedule by year (see engine/weather.js).
  weather: { 2029: "thunderstorm", 2031: "haze" },

  // Development cards by year. Options may cost goodwill; `reply` is Veggie Boy's reaction.
  cards: {
    2027: {
      text: "Mwahaha! The Building Agency needs 800 new flats. My Wudlands North estate goes right on those scrubby stepping stones east of the expressway.",
      options: [
        {
          label: "Accept plan",
          effects: [{ op: "develop", tile: "DEV", rects: [[27, 4, 3, 3], [31, 4, 3, 3], [27, 9, 3, 3], [31, 9, 3, 3]] }],
          reply: "The new estate is up. Those stepping stones are gone, so check how the routes have shifted.",
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
        {
          label: "Accept widening",
          effects: [{ op: "widen" }],
          reply: "The expressway is wider now. Crossings stretched with it, but the extra lane pushes resistance up.",
        },
        {
          label: "Demand mitigation fund (+$10k)",
          goodwill: 1,
          effects: [{ op: "widen" }, { op: "budget", amount: 10 }],
          reply: "The widening went ahead, but Concrete Co. paid $10k into the mitigation fund. Spend it well!",
        },
      ],
    },
    2030: {
      text: "Singacity needs trains, and trains need a depot. The MRP depot goes on the edge of Wudlands Wood. Trees don't vote, Veggie Boy!",
      options: [
        {
          label: "Accept depot",
          effects: [{ op: "develop", tile: "DEPOT", rects: [[36, 8, 6, 8]] }],
          reply: "The depot has bitten into the forest edge. The eastern approach just got harder.",
        },
        {
          label: "Negotiate: move to grassland",
          goodwill: 1,
          effects: [{ op: "develop", tile: "DEPOT", rects: [[40, 20, 6, 6]] }],
          reply: "Baron Tarmac grumbled, but the depot went onto open grassland to the south. The wood stays whole.",
        },
      ],
    },
  },
};
