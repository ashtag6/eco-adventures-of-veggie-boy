# The Eco-Adventures of Veggie Boy

A 16-bit browser game about wildlife connectivity, set in Singacity (a parody of Singapore). Veggie Boy reconnects fragmented forests while Baron Tarmac keeps pouring concrete. Under the hood every species' landscape is solved as an electrical circuit (circuit theory, McRae et al. 2008), but players never see that language.

Owner: Ash Welch (ecologist). Design doc: `docs/GAME_DESIGN.md`. Read it before adding content.

## Commands

- `npm run dev`: local dev server with hot reload
- `npm test`: model tests (node:test, no browser needed)
- `npm run balance`: prints connection % for scripted scenarios per level. Run after any change to resistances, maps, cards or weather, and paste the table into the PR description
- `npm run build`: static site in `dist/` (relative paths, ready for itch.io zip upload, GitHub Pages or Netlify)
- `npm run build:single`: one self-contained `dist-single/index.html` for quick sharing

## Architecture

- `src/engine/`: pure logic, no DOM. Must stay importable from Node (tests and balance script depend on this)
  - `grid.js`: grid size (48 x 28), seeded RNG, hash
  - `tiles.js`: land-cover codes `T`, names, swatches
  - `species.js`: resistance surfaces per species, indexed by tile code
  - `solver.js`: circuit solve (Jacobi-preconditioned CG), bare-road fraction, reference resistance, link %
  - `weather.js`: thunderstorm, haze, monsoon (resistance modifiers, year-end damage, forecasts)
  - `rules.js`: roadkill and seed-rain succession
  - `effects.js`: declarative card effects (`develop`, `widen`, `budget`, `goodwill`, `tile`)
- `src/levels/`: one file per chapter, registered in `levels/index.js`. Levels are data: map builder, cores, cards, weather schedule, intro text, targets
- `src/render/`: canvas drawing only (tiles, sprites, current overlay, weather FX)
- `src/ui/`: HUD, side panel, dialogue box
- `src/game.js`: controller for one level (state, story flow, building, year end)
- `src/audio.js`: procedural Web Audio sound effects; no audio files yet
- `src/main.js`: boot, input, animation loop, walkers

## Rules for changes

- Player-facing language never mentions circuits, current, resistance, voltage or effective resistance. Use: wildlife trails, busy trail, bottleneck, connection, how hard to cross, home habitat. The only exception is the "For ecologists" note under the game
- Resistances are illustrative and tuned for play. Keep them in `species.js` and nowhere else. Add a comment when a value is changed for balance
- Weather changes resistance through `resMod` only, so the table in the side panel can flag modified values
- New card effects go in `effects.js` as data ops, not as functions inside level files
- Keep the engine deterministic: use `rng(seed)` from `grid.js`, never `Math.random()` in engine code (render and walker code may use it)
- Keep the solver fast. A full re-solve of three species must stay under about 100 ms on a laptop. If a bigger map is needed, move solves into a Web Worker first

## Names and tone

- British English
- World: Singacity. Parody names only, never the real ones: Central Kachang Reserve, Bukit Kachang Expressway, Wudlands, Ponggo, Manday, Sentosaur Island, the Building Agency (never HDB), MRP (not MRT), Concrete Co., Concrete Co. Plantations, Sumaterra (haze source)
- Haze is blamed on Concrete Co. Plantations burning peat, never on a country or its people
- Veggie Boy: upbeat, practical, a bit cheeky. Short sentences. Explains ecology plainly
- Baron Tarmac: pantomime villain, loves concrete, says "Mwahaha". Never cruel about animals on screen; roadkill is shown as a small pixel poof, no gore
- Veggie Boy is Chinese (Han), with shoulder-length wavy black hair and a costume made of foliage. Draw him warmly and never with caricatured features

## Art

- Internal resolution 384 x 224, 8 x 8 px tiles, scaled with nearest-neighbour. 16-bit palette (SNES era)
- Sprites are pixel maps in `render/sprites.js` (one character per pixel). Commissioned art will replace the Veggie Boy and Baron Tarmac maps with sprite sheets later
- Respect `prefers-reduced-motion`: no pulsing, no lightning flashes, no particle drift

## Roadmap (in order)

1. Title screen with "Press start" (also unlocks audio), chapter select, save progress in localStorage
2. Music: one chiptune loop per chapter plus a Baron Tarmac theme (see design doc)
3. Chapter 2 Ponggo (monsoon, canals, otters), then Manday (haze, night lighting), then Sentosaur Island (all weather, multiple home habitats scored on the weakest pair)
4. Population meters and local extinction as a fail state
5. Move solver into a Web Worker; larger maps with a scrolling camera
6. Pixel-artist sprite sheets for Veggie Boy and Baron Tarmac
