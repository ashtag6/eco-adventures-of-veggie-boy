# The Eco-Adventures of Veggie Boy: game design

## Premise and story

Singacity is growing fast. Roads, estates and resorts keep carving its forests, mangroves and rivers into islands, and animals that can't move between the islands slowly disappear.

**Origin story** (the title screen, shown on first play and replayable from chapter select):

1. Singacity, 2026: a city in a garden, growing faster every year.
2. A young botanist surveying the Central Kachang Reserve finds a glowing violet nettle that nobody has seen for a hundred years.
3. The nettle stings him. After three days of fever he can see the future.
4. The vision: forests carved into islands, with pangolins, colugos, otters and hornbills stranded and fading away.
5. He swears it won't happen, stitches a suit of leaves and vines, and becomes Veggie Boy.
6. Baron Tarmac of Concrete Co.: "Every forest is a car park waiting to happen!"
7. Veggie Boy: "Every animal needs a way through."

## Characters

- **Veggie Boy.** A botanist turned hero, of Chinese (Han) heritage, with shoulder-length wavy black hair, a leaf mask and crest, a costume of layered foliage and a big leaf cape.
- **Baron Tarmac.** The head of Concrete Co. He wears a top hat, a curled moustache and a grey suit. A pantomime villain.
- **Concrete Co. Plantations.** Baron Tarmac's sister company, which burns peat on Sumaterra and causes the haze.

## Core loop, one turn per year

1. **Proposal.** A Baron Tarmac card. The player can accept it, negotiate (which costs goodwill), or sometimes take a third trade-off option.
2. **Forecast.** Veggie Boy warns about the weather, if any.
3. **Planning.** The player spends budget on the chapter's tools.
4. **Review.** The results of the year:
   - Roadkill
   - Weather damage
   - Seed rain from the chapter's seed carrier, which grows saplings into scrub and then forest
   - The updated connection meters
5. **Chapter end.** One star for reaching every target, one for beating every target by 10 points, and one for low roadkill. Winning unlocks the next chapter.

## What the player sees, and what's underneath

| Player sees | Model |
|---|---|
| Wildlife trails in yellow: faint (quiet), gold (busy), solid outlined (bottleneck) | Current density compared with the species' typical level (the 90th percentile): 0.6x, 1.2x and 3x |
| Connection meter | √(R reference ÷ R now) for the weakest pair of home habitats. The reference is the same landscape with no roads |
| How hard to cross (1 to 5 bars) | Resistance: 2 or less, 6, 40, 400, and above 400 |
| Home habitat | Focal core. Chapters with three cores are solved pairwise |
| Lit at night (Manday) | The resistance multiplier for nocturnal species on lit cells: pangolin 2x, colugo 3x, leopard cat 4x |
| Moving animals | Random walkers following the current |

The square root spreads the scale so that single good actions move the meter visibly. Landscape rankings are the same as with the raw ratio.

## Chapters

| # | Chapter | Years | Species (seed carrier) | New mechanic | Baron Tarmac's schemes | Weather | Goal | Budget |
|---|---|---|---|---|---|---|---|---|
| 1 | Wudlands | 2026–31 | Pangolin, colugo (bulbul) | Crossings, planting, seed rain | Estate on stepping stones, expressway widening, MRP depot | Storms 2029, haze 2031 | 70% | $20k + $10k/yr |
| 2 | Ponggo | 2032–36 | Otter, tree frog (bulbul) | Concrete versus naturalised canals | Canalise the river (3 options), riverside condos, road widening | Monsoon four years out of five | 80% | $16k + $8k/yr |
| 3 | Pasir Riz | 2037–41 | Otter, water monitor (hornbill) | Two roads, Sungei Apu Apu as a corridor, mangrove planting | Coastal promenade (3 options), expressway widening, resort | Haze and storms | 60% | $18k + $9k/yr |
| 4 | Manday | 2042–46 | Pangolin, colugo, leopard cat (bulbul) | Night lighting and wildlife lighting | Night Safari expansion (3 options), floodlit sports hall, road widening | Three haze years, then storms | 55% | $20k + $9k/yr |
| 5 | Sentosaur Island | 2047–50 | Plantain squirrel, water monitor (bulbul) | Three home habitats scored on the weakest pair, planted boardwalk across the sea | Mega resort (3 options), causeway widening, cable car hub | Storms, haze, monsoon | 40% squirrel, 60% monitor | $24k + $10k/yr |

**Species by place.** Species are chosen to fit each area, and Ash signs these off:
- Pangolins and colugos stay in the central forest chapters.
- Otters and frogs appear on the waterways.
- Otters and water monitors appear on the north-east coast, with hornbills returning from Pulau Ubinn.
- Squirrels and monitors appear on the southern island.

**Difficulty curve.**
- The sample winning plans use about 40% of the budget in chapter 1, 67% in chapter 2 and 85 to 95% in chapters 3 to 5.
- Later chapters add more species, more roads, more habitat pairs and harsher weather.
- Goodwill (2 per chapter) limits negotiation to two of the three cards.

## Tools

| Tool | Cost | Effect |
|---|---|---|
| Plant sapling | $1k | Grass becomes sapling, then grows to scrub and forest, faster on busy seed-carrier trails |
| Plant mangrove | $1k | Mudflat becomes mangrove sapling, then mangrove after one or two years |
| Naturalise canal | $2k | Concrete canal becomes a planted-bank canal |
| Planted boardwalk | $2k | A sea cell next to a road or boardwalk becomes a leafy walkway |
| Rope bridge | $3k | Across the full road width. Snaps in storms (50%) |
| Underpass | $5k | Across the full road width. Floods for pangolins and leopard cats in the monsoon |
| Eco-bridge | $12k | Two cells deep across the full road width. Works for every species |
| Wildlife lighting | $2k | Removes lighting from a 5 x 5 area (Manday) |

## Weather

| Event | In-game effect |
|---|---|
| Thunderstorm | About 45% of exposed saplings, mangrove saplings and young scrub are lost. Each rope bridge has a 50% chance of snapping. Rain and lightning on screen |
| Haze (PSI shown) | Flying species find non-forest land 1.8x harder, and seed rain halves. Brown wash and ash on screen |
| Monsoon | Underpasses are 25x harder for flood-sensitive species, concrete canals 2.5x harder for swimmers, and grass easier for frogs. Saplings grow a year faster |

## Audio

**Sound effects (done).** The sounds are synthesised in code with the Web Audio API:
- Dialogue blips
- Planting and building
- Error buzz
- Baron sting
- Thunder
- Roadkill poof
- Year-end, win and lose jingles

Sound is off by default. Press start unlocks audio, and the player turns sound on with the Sound button.

**Music (to do).** Commission a composer or license a chiptune pack (check the licence allows commercial use), or write patterns for a small tracker such as ZzFXM. Tracks needed:
- Title theme
- One loop per chapter
- Baron Tarmac theme
- Tense haze variant
- Victory fanfare

## Publishing

- GitHub Pages deploys automatically on every push to `main` (see `.github/workflows/deploy.yml`).
- For itch.io, zip the contents of `dist/` and upload it as an HTML5 project.
- Before promoting the game widely:
  - Check the employment contract's IP clause, and use no project or client data.
  - Do a trademark check on the title.
  - Keep all landmark names as parodies.
