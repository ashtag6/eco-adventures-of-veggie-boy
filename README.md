# The Eco-Adventures of Veggie Boy

A 16-bit browser game about keeping wildlife connected in a fast-growing city. Veggie Boy, a botanist turned hero after a sting from a rare glowing nettle, has seen a future where Singacity's animals fade away. Across five chapters, from Wudlands in 2026 to Sentosaur Island in 2050, he builds crossings, plants forest and outwits Baron Tarmac of Concrete Co.

**Play:** https://ashtag6.github.io/eco-adventures-of-veggie-boy/

## Run it locally

```bash
npm install
npm run dev      # play locally at the URL Vite prints (add #unlockall to open every chapter)
npm test         # model tests, including "every chapter can be won, and doing nothing loses"
npm run balance  # connection scores for each chapter
npm run build    # static build in dist/
```

## Publish

- **GitHub Pages:** every push to `main` builds and deploys automatically.
- **itch.io:** run `npm run build`, zip the contents of `dist/`, create an HTML5 project, upload the zip and tick "This file will be played in the browser".

See `docs/GAME_DESIGN.md` for the design, and `CLAUDE.md` for conventions when working with Claude Code.
