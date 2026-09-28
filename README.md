# The Eco-Adventures of Veggie Boy

A 16-bit browser game about keeping wildlife connected in a fast-growing city. Help Veggie Boy build crossings and plant forest to reconnect Singacity's habitats, while Baron Tarmac of Concrete Co. keeps pouring concrete and the weather does its worst.

## Run it

```bash
npm install
npm run dev      # play locally at the URL Vite prints
npm test         # model tests
npm run balance  # connection % for scripted scenarios
npm run build    # static build in dist/
```

## Publish

- **itch.io:** run `npm run build`, zip the contents of `dist/`, create a new HTML5 project on itch.io, upload the zip and tick "This file will be played in the browser". Set the viewport to 1100 x 900 or enable fullscreen.
- **GitHub Pages / Netlify:** deploy the `dist/` folder. Paths are relative, so it works from any subfolder.

See `docs/GAME_DESIGN.md` for the design, and `CLAUDE.md` for conventions when working with Claude Code.
