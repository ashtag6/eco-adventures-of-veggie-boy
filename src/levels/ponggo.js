import { T } from "../engine/tiles.js";
import { mapKit } from "./mapkit.js";

// Chapter 2. Waterways: otters use the river and canals, frogs are walled out by concrete.
// New tools: naturalise canal. Monsoon most years.
export default {
  id: "ponggo",
  chapter: 2,
  name: "Ponggo",
  title: "The Ponggo waterway",
  place: "A new town is growing along the Ponggo river between Ponggo Wetland and Cony Island.",
  startYear: 2032,
  lastYear: 2036,
  target: 80,
  budget: 16,
  income: 8,
  goodwill: 2,
  species: ["otter", "frog"],
  disperser: "bulbul",
  tools: ["plant", "natcanal", "under", "eco"],
  roads: [{ axis: "v", lines: [23, 24], name: "Ponggo Central" }],
  killScale: { otter: 8, frog: 10 },
  starKills: 18,
  seed: 20320101,
  cores: [
    { name: "Ponggo Wetland", test: (x) => x <= 2 },
    { name: "Cony Island", test: (x) => x >= 45 },
  ],
  labels: [
    { text: "Ponggo Wetland", style: "left:1.5%;top:4%" },
    { text: "Cony Island", style: "right:1.5%;top:4%" },
    { text: "Ponggo Central", style: "left:44%;top:88%" },
    { text: "Ponggo canal", style: "left:36%;top:41%" },
  ],
  tableTiles: [T.FOREST, T.SCRUB, T.GRASS, T.SAPLING, T.WATER, T.CANAL, T.NATCANAL, T.ROAD, T.BUILD, T.UNDER, T.ECO],

  buildMap() {
    const k = mapKit(this.seed, T.GRASS);
    k.mix(0, 0, 7, 28, [[T.FOREST, 4], [T.SCRUB, 3.5], [T.WATER, 2.5]]);
    k.mix(41, 0, 7, 28, [[T.FOREST, 5.5], [T.SCRUB, 3.5], [T.WATER, 1]]);
    // Riverbanks: leafy in the natural sections, open lawn in town.
    k.mix(7, 12, 9, 1, [[T.SCRUB, 3], [T.FOREST, 1], [T.GRASS, 1]]);
    k.mix(7, 16, 9, 1, [[T.SCRUB, 3], [T.FOREST, 1], [T.GRASS, 1]]);
    k.mix(32, 12, 9, 1, [[T.SCRUB, 3], [T.FOREST, 1], [T.GRASS, 1]]);
    k.mix(32, 16, 9, 1, [[T.SCRUB, 3], [T.FOREST, 1], [T.GRASS, 1]]);
    k.rect(3, 13, 13, 3, T.WATER);
    k.rect(16, 13, 16, 3, T.CANAL);
    k.rect(32, 13, 12, 3, T.WATER);
    // Park trees
    k.disc(10, 5, 2.2, T.SCRUB, T.FOREST);
    k.disc(36, 6, 2.2, T.SCRUB, T.FOREST);
    k.disc(11, 22, 2.2, T.SCRUB, T.FOREST);
    k.disc(37, 22, 2, T.SCRUB, T.FOREST);
    // Building Agency estate either side of the canal
    k.blocks([[16, 3], [19, 3], [26, 3], [29, 3], [16, 7], [19, 7], [26, 7], [29, 7]]);
    k.blocks([[16, 18], [19, 18], [26, 18], [29, 18], [16, 22], [19, 22], [26, 22], [29, 22]]);
    k.rect(23, 0, 2, 28, T.ROAD);
    return k.done();
  },

  intro: [
    "Welcome to Ponggo, six years later. The river runs from Ponggo Wetland to Cony Island, but in the new town it's been squeezed into a concrete canal, and Ponggo Central cuts right across it.",
    "Otters follow the water. They'll happily swim a canal, but where the road crosses the river they climb out onto the tarmac. An underpass with a dry ledge lets them pass under the road safely.",
    "Tree frogs are different. Steep concrete walls trap them, so the canal is useless to them. Naturalise a stretch of canal with soft, planted banks, or plant a leafy route beside it, and give them a way under the road.",
    "It's monsoon season most years here. Floods make concrete canals fast and dangerous for otters, but frogs love the wet grass. Goal: both meters at 80% by the end of 2036. Money is tighter now, so plan carefully!",
  ],

  weather: { 2033: "monsoon", 2034: "monsoon", 2035: "thunderstorm", 2036: "monsoon" },

  cards: {
    2033: {
      text: "Flood control, Veggie Boy! I'm lining the rest of the Ponggo river with lovely smooth concrete. Straight, fast and very, very grey.",
      options: [
        { label: "Accept concrete canal", effects: [{ op: "tile", tile: "CANAL", rects: [[32, 13, 9, 3]] }], reply: "The eastern river is a concrete channel now. The otters can still swim it, but the frogs have lost their riverbank." },
        {
          label: "Negotiate: natural banks",
          goodwill: 1,
          effects: [{ op: "tile", tile: "NATCANAL", rects: [[32, 13, 9, 3]] }],
          reply: "Baron Tarmac agreed to a naturalised design: gentle planted banks that still carry floodwater. Frogs and otters both win.",
        },
        {
          label: "Accept, if he builds an otter ledge",
          effects: [{ op: "tile", tile: "CANAL", rects: [[32, 13, 9, 3]] }, { op: "tile", tile: "UNDER", rects: [[23, 14, 2, 1]] }],
          reply: "Concrete Co. lined the river but added an otter ledge under Ponggo Central. Good for otters, bad for frogs.",
        },
      ],
    },
    2034: {
      text: "Waterfront living! My Ponggo Riverside condos will sit right on the wetland edge. Premium views of the nature you're so fond of.",
      options: [
        { label: "Accept condos", effects: [{ op: "develop", tile: "DEV", rects: [[7, 17, 7, 4]] }], reply: "The condos went up on the wetland edge. The western approach to the river is narrower now." },
        {
          label: "Negotiate: build by the estate",
          goodwill: 1,
          effects: [{ op: "develop", tile: "DEV", rects: [[34, 23, 5, 3]] }],
          reply: "The condos went next to the existing estate instead. The wetland edge is safe.",
        },
      ],
    },
    2035: {
      text: "Ponggo Central is jammed! One more lane, and the buses can finally fly.",
      options: [
        { label: "Accept widening", effects: [{ op: "widen", road: 0 }], reply: "Ponggo Central is three lanes now. Underpasses stretched to fit, but the road is harder to cross." },
        {
          label: "Demand mitigation fund (+$8k)",
          goodwill: 1,
          effects: [{ op: "widen", road: 0 }, { op: "budget", amount: 8 }],
          reply: "The road got wider, but Concrete Co. paid $8k into the mitigation fund.",
        },
      ],
    },
  },

  // A sample plan that wins (checked by tests): card choices by year, then builds placed in year one.
  solution: {
    choices: {"2033":1,"2034":1},
    builds: [
      ["under",23,14],
      ["under",23,13],
      ["under",23,12],
      ["under",23,16],
      ["natcanal",19,13],
      ["natcanal",20,13],
      ["natcanal",21,13],
      ["natcanal",22,13],
      ["natcanal",25,13],
      ["natcanal",26,13],
    ],
  },
};
