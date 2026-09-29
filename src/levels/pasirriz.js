import { T } from "../engine/tiles.js";
import { mapKit } from "./mapkit.js";

// Chapter 3. Coast: otters and water monitors travel from Pulau Ubinn to Tampinez Eco Green,
// along Sungei Apu Apu and across two roads. Returning hornbills are the seed carriers.
// New tool: plant mangrove on mudflats and shoals.
export default {
  id: "pasirriz",
  chapter: 3,
  name: "Pasir Riz",
  title: "The Pasir Riz coast",
  place: "Otters and water monitors want to reach Tampinez Eco Green from Pulau Ubinn, across two busy roads.",
  startYear: 2037,
  lastYear: 2041,
  target: 60,
  budget: 18,
  income: 9,
  goodwill: 2,
  species: ["otter", "monitor"],
  disperser: "hornbill",
  tools: ["plant", "mangrove", "under", "eco"],
  roads: [
    { axis: "h", lines: [12, 13], name: "Pasir Riz Drive" },
    { axis: "h", lines: [20, 21], name: "Pan-Isle Expressway" },
  ],
  killScale: { otter: 8, monitor: 9 },
  starKills: 12,
  seed: 20370101,
  cores: [
    { name: "Pulau Ubinn", test: (x, y) => y <= 1 && x >= 12 && x <= 35 },
    { name: "Tampinez Eco Green", test: (x, y) => y >= 26 && x >= 14 && x <= 33 },
  ],
  labels: [
    { text: "Pulau Ubinn", style: "left:40%;top:1%" },
    { text: "Pasir Riz Drive", style: "left:1.5%;top:43%" },
    { text: "Pan-Isle Expressway", style: "left:1.5%;top:72%" },
    { text: "Tampinez Eco Green", style: "left:40%;top:93%" },
    { text: "Sungei Apu Apu", style: "left:61%;top:58%" },
  ],
  tableTiles: [T.FOREST, T.MANGROVE, T.MSAPLING, T.MUD, T.WATER, T.SEA, T.GRASS, T.SAPLING, T.ROAD, T.SEAWALL, T.UNDER, T.ECO],

  buildMap() {
    const k = mapKit(this.seed, T.GRASS);
    k.rect(0, 0, 48, 12, T.SEA);
    k.mix(4, 0, 40, 3, [[T.FOREST, 6], [T.MANGROVE, 2], [T.SCRUB, 1]]);
    k.rect(0, 2, 4, 1, T.SEA);
    k.rect(44, 2, 4, 1, T.SEA);
    // Tidal shoals in the strait: bare mud now, mangrove islets once (and again, if you plant them)
    k.rect(11, 4, 5, 3, T.MUD);
    k.rect(21, 5, 6, 3, T.MUD);
    k.rect(32, 4, 5, 3, T.MUD);
    k.disc(13, 5, 0.8, T.MANGROVE);
    // Coast: mangroves in the west, open mudflats in the middle, sandy beach in the east
    k.rect(0, 9, 48, 3, T.GRASS);
    k.mix(1, 9, 17, 3, [[T.MANGROVE, 6], [T.MUD, 1]]);
    k.rect(18, 9, 13, 2, T.MUD);
    // Pasir Riz Park and estate
    k.disc(8, 16, 2.4, T.SCRUB, T.FOREST);
    k.disc(19, 17, 1.8, T.SCRUB, T.FOREST);
    k.disc(41, 16, 2, T.SCRUB, T.FOREST);
    k.blocks([[32, 15], [36, 15]]);
    k.mix(0, 22, 48, 3, [[T.GRASS, 5], [T.SCRUB, 2]]);
    k.blocks([[6, 22], [10, 22], [34, 22]]);
    k.mix(0, 25, 48, 3, [[T.FOREST, 6], [T.SCRUB, 3]]);
    // Sungei Apu Apu: a small river from the coast through the park, with a mangrove fringe
    k.mix(26, 11, 1, 15, [[T.MANGROVE, 2], [T.GRASS, 1]]);
    k.rect(27, 10, 2, 16, T.WATER);
    k.rect(0, 12, 48, 2, T.ROAD);
    k.rect(0, 20, 48, 2, T.ROAD);
    return k.done();
  },

  intro: [
    "Pasir Riz! Smooth-coated otters and water monitors swim across from Pulau Ubinn, and they're trying to reach Tampinez Eco Green inland.",
    "Both of them follow the water. Sungei Apu Apu runs from the mangroves right through the park, but Pasir Riz Drive and the Pan-Isle Expressway both cross it. That's where the roadkill happens.",
    "Underpasses with dry ledges where the river meets each road are a good start. Plant mangroves on the mudflats and shoals to give them shelter along the way.",
    "Oriental pied hornbills are back from Pulau Ubinn too, and they're your seed carriers here: saplings on their busy trails grow fastest. Goal: both meters at 60% by the end of 2041, with two roads to fix.",
  ],

  weather: { 2038: "haze", 2039: "thunderstorm", 2040: "haze", 2041: "thunderstorm" },

  cards: {
    2038: {
      text: "Picture it: the Pasir Riz Coastal Promenade! A seawall, a jogging track and not a single muddy mangrove in sight.",
      options: [
        { label: "Accept promenade", effects: [{ op: "develop", tile: "SEAWALL", rects: [[1, 9, 17, 3]] }], reply: "The western mangroves are under concrete now. The monitors have lost their favourite shoreline." },
        {
          label: "Negotiate: build on the beach",
          goodwill: 1,
          effects: [{ op: "develop", tile: "SEAWALL", rects: [[33, 10, 14, 2]] }],
          reply: "The promenade went along the sandy beach in the east instead. The mangroves stay.",
        },
        {
          label: "Accept, if he replants mangroves",
          effects: [{ op: "develop", tile: "SEAWALL", rects: [[1, 9, 17, 3]] }, { op: "tile", tile: "MSAPLING", rects: [[18, 9, 13, 2]] }],
          reply: "The western mangroves are gone, but Concrete Co. planted new ones on the central mudflats. They'll take a couple of years to grow.",
        },
      ],
    },
    2039: {
      text: "The Pan-Isle Expressway needs another lane. Time is money, and money is concrete!",
      options: [
        { label: "Accept widening", effects: [{ op: "widen", road: 1 }], reply: "The expressway is wider. Your crossings stretched across the new lane." },
        {
          label: "Demand mitigation fund (+$9k)",
          goodwill: 1,
          effects: [{ op: "widen", road: 1 }, { op: "budget", amount: 9 }],
          reply: "The widening went ahead, but Concrete Co. paid $9k into the mitigation fund.",
        },
      ],
    },
    2040: {
      text: "Every coast needs a resort. The Pasir Riz Palms goes right in that shady corner of the park.",
      options: [
        { label: "Accept resort", effects: [{ op: "develop", tile: "DEV", rects: [[5, 14, 7, 5]] }], reply: "The resort has swallowed the biggest grove in the park." },
        {
          label: "Negotiate: use the car park",
          goodwill: 1,
          effects: [{ op: "develop", tile: "DEV", rects: [[38, 22, 5, 3]] }],
          reply: "The resort went on the old car park by the estate. The grove survives.",
        },
      ],
    },
  },

  // A sample plan that wins (checked by tests): card choices by year, then builds placed in year one.
  solution: {
    choices: {"2038":1,"2040":1},
    builds: [
      ["under",27,20],
      ["under",27,12],
      ["under",28,20],
      ["under",16,12],
      ["under",15,20],
      ["under",7,12],
      ["plant",15,19],
      ["under",26,12],
      ["under",18,20],
      ["under",17,12],
      ["under",13,20],
    ],
  },
};
