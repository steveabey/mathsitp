# ITP Studio

Interactive maths teaching programs for the classroom board.

**Live address: https://mathsitp.pages.dev/**

- `public/` is the live website. Cloudflare Pages deploys it every time this repository changes
  (build command: none, output directory: `public`).
- `source/` holds the source files used to build `public/index.html`.

## Updating the site
Replace the files in `public/` with the new ones and commit to `main`. Cloudflare Pages picks
up the change and deploys it within a minute or two (Workers & Pages → mathsitp (Pages) → Deployments).

## Spare addresses
These deploy from the same files and are kept as back-ups only:
- Cloudflare Worker: https://mathsitp.lionelwaldenps.workers.dev/ (uses `wrangler.jsonc`)
- GitHub Pages: https://steveabey.github.io/mathsitp/ (uses `.github/workflows/pages.yml`, only if Pages is switched on in the repo settings)
