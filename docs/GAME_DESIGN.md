# The Eco-Adventures of Veggie Boy: game design

## Premise

Singacity is growing fast. Roads, estates and depots keep carving its forests into islands, and animals that can't move between islands slowly disappear. Veggie Boy, a superhero in a suit of leaves, has to keep wildlife connected while Baron Tarmac of Concrete Co. keeps proposing more concrete. Each chapter covers several years. Every year brings a Baron Tarmac proposal, the weather, and a budget to spend on crossings and planting.

## Characters

- **Veggie Boy.** A cartoon hero of Chinese (Han) heritage with shoulder-length wavy black hair, a leaf mask and crest, and a costume of layered foliage with a large leaf cape. He's upbeat and practical, and explains ecology in plain words.
- **Baron Tarmac.** The head of Concrete Co. He wears a top hat, a curled moustache and a grey suit, and he's a pantomime villain who is funny rather than frightening.
- **Concrete Co. Plantations.** Baron Tarmac's sister company. It burns peat on Sumaterra, which is where the haze comes from.

## Core loop, one turn per year

1. **Proposal.** A Baron Tarmac card, such as a new estate, road widening or depot. The player accepts, or negotiates by spending goodwill.
2. **Forecast.** Veggie Boy warns about this year's weather, if any.
3. **Planning.** The player spends budget on:
   - Saplings (painted onto grass)
   - Rope bridges (help colugos)
   - Underpasses (help pangolins)
   - Eco-bridges (help both)
4. **Review.** The year's results are shown:
   - Roadkill on the expressway
   - Weather damage
   - Seed rain: bulbul trails turn saplings into scrub and then forest
   - Updated connection meters
5. **Chapter end.** One star for each species at or above target, plus one star for low roadkill.

## What the player sees, and what's underneath

| Player sees | Model |
|---|---|
| Glowing wildlife trails | Current density |
| Bottleneck or busy trail | High current density |
| Connection meter | Reference effective resistance ÷ current effective resistance |
| How hard to cross (Easy to Barrier) | Resistance value |
| Home habitat | Focal core (source or ground node) |
| Moving animals | Random walkers following the current |

Difficulty bands for resistance values:

| Label | Resistance |
|---|---|
| Easy | 2 or less |
| Fair | Up to 6 |
| Tough | Up to 40 |
| Very hard | Up to 400 |
| Barrier | Above 400 |

## Weather

| Event | In-game effect | Teaches |
|---|---|---|
| Thunderstorm | At year end, about 45% of exposed saplings and young scrub are lost, and each rope bridge has a 50% chance of snapping. Rain and lightning on screen | Plant in blocks, not thin lines. Rope bridges are cheap but fragile |
| Haze (PSI shown) | Bulbuls avoid open ground (difficulty up), and seed rain halves, so saplings mature more slowly. Brown wash and drifting ash on screen | Regional drivers of local change. Seed dispersers matter |
| Monsoon | Underpasses flood, so they're nearly useless for pangolins that year. Saplings grow a year faster. Heavy rain on screen | Eco-bridges are resilient where underpasses aren't. Seasonal timing |

## Campaign and difficulty curve

| Chapter | Setting | New mechanic | Baron Tarmac's schemes | Weather | Target |
|---|---|---|---|---|---|
| 1. Wudlands (built) | Expressway through forest | Crossings, planting, seed rain | Estate, widening, depot | One storm year, one haze year | 50% |
| 2. Ponggo | Wetlands and canals | Otters and frogs; naturalised canal tool | Canalising a river, waterfront estate | Monsoon every year, some storms | 55% |
| 3. Manday | Forest edge by a nature park | Night lighting raises difficulty for nocturnal species; shielded lighting tool | Night-safari expansion, floodlit sports hall | Long haze season, then storms | 60% |
| 4. Sentosaur Island | Island and mainland | Stepping stones across water; three or more home habitats, scored on the weakest pair | Resort mega-project, causeway | Everything, sometimes two events in one year | 65% |

**Difficulty levers for later chapters:**
- Lower budget and income.
- Goodwill carries over between chapters and isn't replenished.
- Non-negotiable cards, cards with three options, and two cards in one year.
- Population meters that fall each year a connection is below target (local extinction means game over).
- Species with conflicting needs.

## Audio

**Sound effects (done).** `src/audio.js` synthesises chiptune effects with the Web Audio API, so there are no files to license:
- Dialogue blips, with a lower voice for Baron Tarmac
- Planting and building sounds, and an error buzz
- A Baron Tarmac sting when a card appears
- Thunder during storms
- A soft poof for roadkill
- Year-end, win and lose jingles

Sound is off by default and toggled by the player, because browsers block audio until the player interacts.

**Music (to do).** Pick one of these routes:
1. **Commission or buy.** A chiptune composer, or a licensed pack from itch.io or OpenGameArt (check the licence allows commercial use). Export loops as OGG plus MP3 into `public/audio/`. Play them through a small wrapper or Howler.js, with a separate music volume and crossfades between tracks.
2. **Generate in code.** Write short patterns and play them with a tiny tracker such as ZzFXM, or with the existing oscillator helpers. This keeps everything as code, with no asset licensing.

**Tracks needed:** a title theme, one loop per chapter, a Baron Tarmac theme for card scenes, a tense haze variant, and a victory fanfare. Start music from the title screen's "Press start", which also satisfies the browser's autoplay rule.

## Publishing plan

1. Push to a private GitHub repo, and playtest with friends and colleagues.
2. Put `npm run build` output on itch.io as an HTML5 game (zip the `dist/` folder), plus GitHub Pages or Netlify with a custom domain.
3. Before going public:
   - Check the employment contract's IP clause, and keep all work on personal time and equipment, with no project or client data.
   - Do a trademark check on the title.
   - Keep all landmark names as parodies.
