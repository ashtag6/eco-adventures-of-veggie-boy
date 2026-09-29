# The Eco-Adventures of Veggie Boy

A 16-bit browser game about wildlife connectivity, set in Singacity (a parody of Singapore). Veggie Boy reconnects fragmented habitats across five chapters while Baron Tarmac keeps pouring concrete. Under the hood every species' landscape is solved as an electrical circuit (circuit theory, McRae et al. 2008), but players never see that language.

Owner: Ash Welch (ecologist). Design doc: `docs/GAME_DESIGN.md`. Read it before adding content.

## Commands

- `npm run dev`: local dev server with hot reload. Add `#unlockall` to the URL to unlock every chapter
- `npm test`: model tests (node:test, no browser). Includes a check that every chapter's sample plan wins and doing nothing loses
- `npm run balance`: per-chapter report (do nothing / sample plan / sample builds with every card accepted). Run after any change to species, maps, cards, weather, budgets or targets
- `node scripts/autoplan.mjs <levelId> [budget] [choicesJSON]`: greedy planner that searches for a cheap winning plan. Use it to find a new `solution` when balance changes
- `npm run build`: static site in `dist/` (relative paths; GitHub Pages deploys this automatically on push to main)
- `npm run build:single`: one self-contained `dist-single/index.html` for quick sharing

## Architecture

- `src/engine/` is pure logic with no DOM. It must stay importable from Node, because the tests, balance script and autoplanner depend on this:
  - `grid.js`: grid size (48 x 28), seeded RNG, hash
  - `tiles.js`: land-cover codes `T`, names, swatches, helpers (`roadLike`, `isBuilt`, `isWater`)
  - `species.js`: species, traits and resistance surfaces (built from `{ TILE: value }` objects with a fallback)
  - `solver.js`: circuit solve (Jacobi-preconditioned CG), pairwise solves, connection score (square root of the reference/now resistance ratio, weakest pair)
  - `weather.js`: thunderstorm, haze and monsoon. Resistance changes come from species traits; storm damage is applied at year end
  - `rules.js`: roadkill, seed-rain succession, and night lighting (`computeLit`, `lightMul`)
  - `tools.js`: build tools and placement rules (paint, crossing, boardwalk, dim). Crossings span any road, vertical or horizontal
  - `effects.js`: declarative card effects (`develop`, `tile`, `widen`, `light`, `budget`, `goodwill`)
  - `sim.js`: state creation, solving all species, and `simulatePlan` (a year-by-year headless run used by tests and balancing)
- `src/levels/`: one file per chapter, registered in `levels/index.js`. Levels are data: map builder (use `mapkit.js`), home habitats (`cores`), roads, species, disperser, tools, cards, weather, intro, targets and a sample `solution`
- `src/render/`: canvas drawing only
  - `tiles.js`: 8 x 8 tiles
  - `sprites.js`: portraits, map walkers, full-body Veggie Boy, title animals
  - `fx.js`: trails, night, weather, poofs
  - `title.js`: title and story scenes
- `src/ui/`: HUD and panel (`hud.js`), dialogue box (`dialogue.js`), title/story/chapter select and saved progress (`screens.js`)
- `src/game.js`: controller for one chapter (state, story flow, building, year end, results)
- `src/audio.js`: procedural Web Audio sound effects (no audio files yet)
- `src/main.js`: boot, screens, input, animation loop, walkers

## Rules for changes

- Player-facing language never mentions circuits, current, resistance, voltage or effective resistance. Use these words instead: wildlife trails, quiet or busy trail, bottleneck, connection, how hard to cross, home habitat. The only exception is the "For ecologists" note under the game
- Resistances are illustrative and tuned for play. Keep them in `species.js` and nowhere else. Add a comment when you change a value for balance
- Weather changes resistance only through traits in `effectiveRes`, so the side panel can flag changed values
- New card effects go in `effects.js` as data ops, not as functions inside level files
- Keep the engine deterministic: use `rng(seed)` from `grid.js`, never `Math.random()` in engine code (render and walker code may use it)
- Every chapter must keep a `solution` that passes `npm test` (it wins within budget using at most `goodwill` negotiations), and doing nothing must lose
- Negotiated card options must never be worse for wildlife than accepting. Check that they don't land on crossing sites or corridors
- Targets can differ by chapter and by species (`target`, `targets`). The score depends on map shape, so set targets from `npm run balance`, not by feel
- Performance: a full re-solve of every species and habitat pair must stay under about 150 ms on a laptop. If a bigger map is needed, move solves into a Web Worker first

## Names and tone

- British English
- World: Singacity. Use parody names only, never the real ones:
  - Places: Central Kachang Reserve, Bukit Kachang Expressway, Wudlands, Ponggo, Cony Island, Pasir Riz, Pulau Ubinn, Tampinez Eco Green, Sungei Apu Apu, Pan-Isle Expressway, Manday, Upper Seletarr Reservoir, Sentosaur Island, Mount Fibre, Labradoodle Park, Telok Blanga Road, Marina Bae Stands
  - Organisations and other names: the Building Agency (never HDB), MRP (not MRT), Concrete Co., Concrete Co. Plantations, Sumaterra (the haze source)
- Haze is blamed on Concrete Co. Plantations burning peat, never on a country or its people
- Species must fit the place they appear (Ash checks this): no pangolins or colugos in urban gardens or on offshore islands
- Veggie Boy: a botanist who was stung by a rare glowing nettle and now sees a future of declining wildlife. He is upbeat and practical, a bit cheeky, speaks in short sentences, and explains ecology plainly
- Baron Tarmac: a pantomime villain who loves concrete and says "Mwahaha". Never cruel about animals on screen. Roadkill is shown as a small pixel poof, with no gore
- Veggie Boy is Chinese (Han), with shoulder-length wavy black hair and a costume made of foliage. Draw him warmly and never with caricatured features

## Art

- Internal resolution is 384 x 224 with 8 x 8 px tiles, scaled with nearest-neighbour, in a 16-bit (SNES era) palette
- Trails are one yellow family, see-through so terrain stays visible, separated by opacity and weight (faint wash, stronger gold tint, outlined bottleneck). Night lighting is cool white (LED) and wildlife lighting amber, so neither clashes with trails. Don't add yellow tiles
- Sprites are pixel maps in `render/sprites.js` (one character per pixel). Commissioned art will replace the Veggie Boy and Baron Tarmac maps with sprite sheets later
- Respect `prefers-reduced-motion`: no pulsing, no lightning flashes, no particle drift

## Roadmap (in order)

1. Music: a title theme, one loop per chapter and a Baron Tarmac theme (see the design doc)
2. Population meters and local extinction as a fail state
3. Move the solver into a Web Worker, and add bigger maps with a scrolling camera
4. Sprite sheets from a pixel artist for Veggie Boy and Baron Tarmac
5. A glossary or field guide screen with a card for each species
