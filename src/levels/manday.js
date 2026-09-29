import { T } from "../engine/tiles.js";
import { mapKit } from "./mapkit.js";

// Chapter 4. Night: three nocturnal species, streetlights and floodlights raise resistance.
// New tool: wildlife lighting. Long haze season, then storms.
export default {
  id: "manday",
  chapter: 4,
  name: "Manday",
  title: "Manday after dark",
  place: "Manday Lake Road splits Manday Forest from the Central Kachang Reserve, and the lights never go out.",
  startYear: 2042,
  lastYear: 2046,
  target: 55,
  budget: 20,
  income: 9,
  goodwill: 2,
  species: ["pangolin", "colugo", "leopardcat"],
  disperser: "bulbul",
  tools: ["plant", "rope", "under", "eco", "dim"],
  roads: [{ axis: "h", lines: [13, 14], name: "Manday Lake Road" }],
  night: true,
  killScale: { pangolin: 8, colugo: 5, leopardcat: 8 },
  starKills: 20,
  seed: 20420101,
  cores: [
    { name: "Manday Forest", test: (x, y) => y <= 1 },
    { name: "Central Kachang Reserve", test: (x, y) => y >= 26 },
  ],
  labels: [
    { text: "Manday Forest", style: "left:1.5%;top:1%" },
    { text: "Manday Wildlife Park", style: "left:62%;top:8%" },
    { text: "Manday Lake Road", style: "left:1.5%;top:45%" },
    { text: "Night Safari", style: "left:17%;top:62%" },
    { text: "Central Kachang Reserve", style: "left:1.5%;top:93%" },
  ],
  tableTiles: [T.FOREST, T.SCRUB, T.GRASS, T.SAPLING, T.ROAD, T.BUILD, T.ECO, T.UNDER, T.ROPE],

  buildMap() {
    const k = mapKit(this.seed, T.FOREST);
    k.mix(0, 0, 48, 11, [[T.FOREST, 7], [T.SCRUB, 2]]);
    k.mix(0, 17, 48, 11, [[T.FOREST, 7], [T.SCRUB, 2]]);
    // Verges: wide mown grass except a narrow natural stretch in the west
    k.rect(10, 11, 38, 2, T.GRASS);
    k.rect(10, 15, 38, 2, T.GRASS);
    k.mix(0, 12, 10, 1, [[T.SCRUB, 3], [T.GRASS, 1]]);
    k.mix(0, 15, 10, 1, [[T.SCRUB, 3], [T.GRASS, 1]]);
    // Manday Wildlife Park and its car park
    k.rect(29, 3, 14, 8, T.GRASS);
    k.blocks([[30, 3], [34, 3], [38, 3]]);
    // Night Safari
    k.rect(7, 17, 11, 6, T.GRASS);
    k.blocks([[8, 18], [12, 18]]);
    // Upper Seletarr Reservoir
    k.rect(37, 19, 11, 6, T.WATER);
    k.rect(0, 13, 48, 2, T.ROAD);
    return k.done();
  },

  intro: [
    "Manday, after dark. Pangolins, colugos and leopard cats all come out at night, and Manday Lake Road is lit up like a stadium.",
    "Bright lights make nocturnal animals feel exposed. Glowing yellow cells on the map are lit, and every lit cell is much harder for these animals to cross. Leopard cats hate lights most of all.",
    "Your new tool is wildlife lighting: dimmer, shielded, amber lamps that keep the road safe for drivers but dark enough for animals. Put it where your crossings are.",
    "Three species, one road, and haze for the first three years. Goal: all three meters at 55% by the end of 2046. This is where it gets tough!",
  ],

  weather: { 2042: "haze", 2043: "haze", 2044: "haze", 2045: "thunderstorm", 2046: "thunderstorm" },

  cards: {
    2043: {
      text: "Mwahaha! The Night Safari is expanding. More enclosures, more car parks, and floodlights so bright you'll need sunglasses at midnight.",
      options: [
        {
          label: "Accept expansion",
          effects: [{ op: "develop", tile: "DEV", rects: [[18, 17, 6, 5]] }, { op: "light", rects: [[16, 15, 10, 9]] }],
          reply: "The expansion is open, and its floodlights spill right up to the road. Check the lit cells.",
        },
        {
          label: "Negotiate: lights out after 10pm",
          goodwill: 1,
          effects: [{ op: "develop", tile: "DEV", rects: [[18, 17, 6, 5]] }],
          reply: "The expansion went ahead, but the floodlights switch off at night. The forest stays dark.",
        },
        {
          label: "Accept, if he funds an eco-bridge",
          effects: [{ op: "develop", tile: "DEV", rects: [[18, 17, 6, 5]] }, { op: "light", rects: [[16, 15, 10, 9]] }, { op: "tile", tile: "ECO", rects: [[4, 13, 2, 2]] }],
          reply: "Floodlights are on, but Concrete Co. paid for an eco-bridge in the west. Swings and roundabouts.",
        },
      ],
    },
    2044: {
      text: "Sport is good for you! My floodlit Manday Sports Hall goes on the forest edge, right beside the road.",
      options: [
        {
          label: "Accept sports hall",
          effects: [{ op: "develop", tile: "DEV", rects: [[18, 7, 6, 4]] }, { op: "light", rects: [[15, 4, 12, 9]] }],
          reply: "The sports hall is up, floodlights and all. The northern forest edge is lit every night.",
        },
        {
          label: "Negotiate: use the car park",
          goodwill: 1,
          effects: [{ op: "develop", tile: "DEV", rects: [[30, 8, 6, 3]] }, { op: "light", rects: [[28, 6, 10, 6]] }],
          reply: "The hall went onto the Wildlife Park car park instead. The lights are still bright, but far from your crossings.",
        },
      ],
    },
    2045: {
      text: "Tourists! Buses! Manday Lake Road needs another lane, and I have just the concrete for it.",
      options: [
        { label: "Accept widening", effects: [{ op: "widen", road: 0 }], reply: "The road is wider and brighter. Your crossings stretched to fit." },
        {
          label: "Demand mitigation fund (+$9k)",
          goodwill: 1,
          effects: [{ op: "widen", road: 0 }, { op: "budget", amount: 9 }],
          reply: "The widening went ahead, but Concrete Co. paid $9k into the mitigation fund.",
        },
      ],
    },
  },

  // A sample plan that wins (checked by tests): card choices by year, then builds placed in year one.
  solution: {
    choices: {"2043":1,"2044":1},
    builds: [
      ["rope",3,13],
      ["eco",0,13],
      ["dim",3,13],
      ["under",4,13],
      ["under",5,13],
      ["plant",1,12],
      ["dim",23,13],
      ["under",24,13],
      ["under",2,13],
      ["eco",46,13],
      ["dim",44,13],
    ],
  },
};
