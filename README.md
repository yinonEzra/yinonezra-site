# yinonezra.com — static portfolio

Plain HTML/CSS/JS. No build step, no dependencies.

## Edit content
- **Projects:** `js/projects.js` — one object per project (title, YouTube ID, images, description, tools). Order in the array = order on the page. The first item, or any item with `featured: true`, spans the full width.
- **About / contact:** `about.html`
- **Colors & type:** top of `css/style.css` (CSS variables)

## Run locally
```bash
python3 -m http.server 8080
```
Then open http://localhost:8080

## Deploy (any static host)
Upload the folder as-is to Netlify, Vercel, Cloudflare Pages, or GitHub Pages, then point the `yinonezra.com` DNS at it.

## Notes
- Project images live in `assets/` and are referenced from `js/projects.js`. Drop new screenshots there (JPEG, ~2000px wide is plenty) and add the path to the project's `media` list.
- Hosted on GitHub Pages from the `main` branch. Every push deploys automatically in about a minute.
- The Work page is a full-bleed "video wall": every tile is a muted, looping YouTube embed that autoplays on load (driven via the YouTube IFrame API so short clips loop without YouTube's controls flashing). Thumbnails cover each tile until playback has started. Clicking a tile opens the project page, where the video plays with normal controls on click.
- Nine simultaneous embeds are heavier than static images. If mobile data use becomes a concern, the simplest fix is to lower the number of projects on the home page or move some to a second row that loads on scroll.
