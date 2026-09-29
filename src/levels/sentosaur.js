import { T } from "../engine/tiles.js";
import { mapKit } from "./mapkit.js";

// Chapter 5. Finale: three home habitats scored on the weakest pair, sea crossing, all weather.
// New tool: planted boardwalk along the causeway.
export default {
  id: "sentosaur",
  chapter: 5,
  name: "Sentosaur Island",
  title: "Sentosaur Island",
  place: "Mount Fibre, Labradoodle Park and Sentosaur Island: three habitats, one causeway, and Baron Tarmac's biggest scheme.",
  startYear: 2047,
  lastYear: 2050,
  target: 40,
  targets: { squirrel: 40, monitor: 60 },
  budget: 24,
  income: 10,
  goodwill: 2,
  species: ["squirrel", "monitor"],
  disperser: "bulbul",
  tools: ["plant", "boardwalk", "rope", "under", "eco"],
  roads: [
    { axis: "h", lines: [9, 10], name: "Telok Blanga Road" },
    { axis: "v", lines: [23, 24], name: "Sentosaur Gateway" },
  ],
  killScale: { squirrel: 6, monitor: 8 },
  starKills: 14,
  seed: 20470101,
  cores: [
    { name: "Mount Fibre", test: (x, y) => x <= 2 && y <= 7 },
    { name: "Labradoodle Park", test: (x, y) => x >= 45 && y <= 7 },
    { name: "Sentosaur Woods", test: (x, y) => y >= 26 && x >= 4 && x <= 43 },
  ],
  labels: [
    { text: "Mount Fibre", style: "left:1.5%;top:1%" },
    { text: "Labradoodle Park", style: "right:1.5%;top:1%" },
    { text: "Sentosaur Gateway", style: "left:52%;top:46%" },
    { text: "Sentosaur Woods", style: "left:40%;top:93%" },
  ],
  tableTiles: [T.FOREST, T.SCRUB, T.GRASS, T.SAPLING, T.SEA, T.BOARDWALK, T.ROAD, T.BUILD, T.ROPE, T.UNDER, T.ECO],

  buildMap() {
    const k = mapKit(this.seed, T.GRASS);
    // Mainland
    k.mix(0, 0, 12, 9, [[T.FOREST, 6], [T.SCRUB, 3]]);
    k.mix(36, 0, 12, 9, [[T.FOREST, 6], [T.SCRUB, 3]]);
    k.mix(12, 0, 24, 9, [[T.GRASS, 7], [T.SCRUB, 1]]);
    k.blocks([[13, 1], [17, 1], [27, 1], [31, 1], [13, 5], [17, 5], [27, 5], [31, 5]]);
    // Sea channel and Sentosaur Island
    k.rect(0, 11, 48, 17, T.SEA);
    k.mix(3, 16, 42, 1, [[T.GRASS, 3], [T.MUD, 1]]);
    k.mix(3, 17, 42, 11, [[T.FOREST, 6], [T.SCRUB, 3]]);
    k.blocks([[12, 17], [16, 17]]);
    k.rect(0, 9, 48, 2, T.ROAD);
    k.rect(23, 11, 2, 6, T.ROAD);
    return k.done();
  },

  intro: [
    "The final chapter: Sentosaur Island. Three habitats this time: Mount Fibre and Labradoodle Park on the mainland, and Sentosaur Woods across the water.",
    "Every habitat has to connect to every other one. Your connection meters show the weakest link, so one forgotten pair will sink you.",
    "Plantain squirrels can't swim. The only way across is the Sentosaur Gateway causeway, and it's bare tarmac. Build a planted boardwalk beside it, one tile at a time.",
    "Water monitors, the original Sentosaurs, swim the channel easily but must cross Telok Blanga Road to reach the mainland habitats. Goal: squirrels at 40% and monitors at 60%, on the weakest link, by 2050. Good luck!",
  ],

  weather: { 2047: "thunderstorm", 2048: "haze", 2049: "monsoon", 2050: "thunderstorm" },

  cards: {
    2048: {
      text: "My masterpiece: the Sentosaur Mega Resort! Water parks, hotels, a giant concrete dinosaur. The forest? It'll make a lovely backdrop, what's left of it.",
      options: [
        { label: "Accept mega resort", effects: [{ op: "develop", tile: "DEV", rects: [[26, 17, 11, 6]] }], reply: "The resort has carved a hole in Sentosaur Woods. Routes to the island's core are narrower now." },
        {
          label: "Negotiate: smaller, by the old resort",
          goodwill: 1,
          effects: [{ op: "develop", tile: "DEV", rects: [[8, 17, 4, 3], [4, 17, 3, 3]] }],
          reply: "Baron Tarmac settled for a smaller resort next to the existing one. The heart of the woods is safe.",
        },
        {
          label: "Accept, if he builds a boardwalk",
          effects: [{ op: "develop", tile: "DEV", rects: [[26, 17, 11, 6]] }, { op: "tile", tile: "BOARDWALK", rects: [[25, 11, 1, 5]] }],
          reply: "The mega resort is built, but Concrete Co. put in a full planted boardwalk along the causeway. That's a big help for squirrels.",
        },
      ],
    },
    2049: {
      text: "The Sentosaur Gateway is far too narrow for my tour buses. One more lane!",
      options: [
        { label: "Accept widening", effects: [{ op: "widen", road: 1 }], reply: "The causeway is wider now, and anything on its east side has been paved over." },
        {
          label: "Demand mitigation fund (+$10k)",
          goodwill: 1,
          effects: [{ op: "widen", road: 1 }, { op: "budget", amount: 10 }],
          reply: "The causeway got wider, but Concrete Co. paid $10k into the mitigation fund.",
        },
      ],
    },
    2050: {
      text: "One last thing: a cable car hub on top of Mount Fibre. Best view in Singacity, if you don't mind the forest being in the way.",
      options: [
        { label: "Accept cable car hub", effects: [{ op: "develop", tile: "DEV", rects: [[6, 2, 5, 5]] }], reply: "The cable car hub sits in the middle of Mount Fibre's forest." },
        {
          label: "Negotiate: put it by the harbour",
          goodwill: 1,
          effects: [{ op: "develop", tile: "DEV", rects: [[21, 0, 3, 3]] }],
          reply: "The hub went down by the harbour instead. Mount Fibre stays green.",
        },
      ],
    },
  },

  // A sample plan that wins (checked by tests): card choices by year, then builds placed in year one.
  solution: {
    choices: {"2048":1,"2050":1},
    builds: [
      ["boardwalk",22,11],
      ["boardwalk",22,12],
      ["boardwalk",22,13],
      ["boardwalk",22,14],
      ["boardwalk",22,15],
      ["rope",22,9],
      ["under",8,9],
      ["under",40,9],
      ["plant",12,8],
      ["plant",13,8],
      ["plant",15,8],
      ["plant",16,8],
      ["plant",17,8],
      ["plant",18,8],
      ["plant",19,8],
      ["plant",20,8],
      ["plant",21,8],
      ["plant",22,8],
      ["plant",23,8],
      ["plant",24,8],
      ["plant",25,8],
      ["plant",26,8],
      ["plant",27,8],
      ["plant",28,8],
      ["plant",29,8],
      ["plant",30,8],
      ["plant",31,8],
      ["plant",32,8],
      ["plant",33,8],
      ["plant",34,8],
      ["plant",35,8],
    ],
  },
};
