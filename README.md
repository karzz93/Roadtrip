# Roadtrip Companion

A personal road-trip copilot for southern France, northern Spain and Portugal.
Plain files — no build step, no npm, no account. Any static HTTPS host works.

## Files (all eight must sit in the same folder)

| File | Purpose |
|---|---|
| `index.html` | The whole app: UI, data model, planner, map, storage |
| `sw.js` | Service worker — caches the shell, map tiles, last weather |
| `manifest.json` | Name, icons, standalone display, shortcuts |
| `icon-192.png` | App icon |
| `icon-512.png` | App icon, large |
| `icon-maskable-512.png` | Android adaptive icon |
| `.nojekyll` | Stops GitHub Pages processing the files |
| `README.md` | This |

`sw.js` and `manifest.json` must be served from the same origin as
`index.html`. That is why a single HTML file cannot be a full PWA.

---

## Hosting on GitHub Pages (recommended — unmetered deploys)

Doable entirely from a phone.

1. **github.com** → sign in → **+** (top right) → **New repository**.
2. Name it `roadtrip`. Public. **Create repository**.
3. On the empty repo page tap **uploading an existing file**.
4. Select all eight files at once from your phone's Downloads. Keep the names
   exactly as they are. `.nojekyll` may be hidden — if your file picker will not
   show it, skip it; the app still works without it.
5. **Commit changes**.
6. **Settings** → **Pages** → Source: *Deploy from a branch*, Branch: `main`,
   folder `/ (root)` → **Save**.
7. Wait about a minute, then open `https://YOURNAME.github.io/roadtrip/`.
8. In Chrome: **⋮ → Add to Home screen**. In Samsung Internet:
   **⋮ → Add page to → Install as web app**.

**Updating later:** open the repo, tap the file, pencil icon, paste the new
content, commit. Or **Add file → Upload files** and drop in a replacement —
GitHub overwrites the old one. No deploy quota, no credit meter.

The subpath (`/roadtrip/`) is fine: every path in the app is relative, so the
service worker and manifest resolve correctly.

## Hosting on Netlify Drop (fastest, but metered)

1. Zip the files (or use the zip from the chat).
2. **app.netlify.com/drop**, drop the zip in, get a URL, install from Chrome.

Worth knowing: on accounts created since September 2025 the free plan is a pool
of 300 credits a month, and each deploy costs 15 of them — roughly 20 deploys.
If the pool runs out, sites are *paused* until the next cycle, not throttled.
Fine for hosting; awkward while iterating. Hence GitHub Pages above.

## What needs a real host (vs the claude.ai preview)

| | Preview | Hosted |
|---|---|---|
| Service worker / offline | no | yes |
| Install to home screen | partial | full PWA |
| OpenStreetMap tiles | abstract basemap | real tiles, cached as you pan |
| Open-Meteo weather | seasonal estimate | live forecast |
| Nominatim place search | offline matching only | full geocoding |

Pasted coordinates, saved places, day plans, the live day tracker, parking and
the diary work in both.

## Your data

Everything lives in the browser's local storage on your phone — saved places,
your own places, visits, plans, parking, diary, preferences, cached lookups.
No account, nothing leaves the device.

**Settings → Export everything as JSON** before clearing browser data or
changing phone. Storage is per browser: the installed app shares storage with
the browser you installed it from, but not with a different browser.

## Optional services

`Config` near the top of the script in `index.html` is the single place where
external services are declared. No keys are committed there — they are read at
runtime from Settings → Data sources and kept in local storage. Every service
degrades to demo mode without one, so the app is never broken by a missing key.

GitHub Pages is static only. If you later want the AI assistant or photo
recognition, that needs a small serverless function on another host
(Cloudflare Workers has a generous free tier) — the app already expects an
endpoint URL rather than a key, so nothing secret ships in the HTML.
