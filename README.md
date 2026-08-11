# hamodywe.github.io

My portfolio: bilingual (English / العربية), dark and light, and a small dashboard for managing the project list.

**Live:** https://hamodywe.github.io

---

## Why it is built this way

No framework, no bundler, no build step, and no runtime dependencies. Three reasons, in order:

1. **It cannot break in CI, because it does not run in CI.** GitHub Pages serves these files exactly as committed. There is no build to fail and no lockfile to drift.
2. **It stays fast without effort.** The page is HTML, one stylesheet and four ES modules. Nothing is fetched from a CDN, so there is no third-party request on any page load.
3. **It is the same argument my tools make.** A pipeline you cannot see through is a pipeline that fails quietly.

The only network call is an optional one to the GitHub API for star counts. It is cached for a day, and if it fails the page renders exactly as before — stars are decoration, never a dependency.

## Layout

```
index.html              the portfolio
admin.html              the dashboard
assets/css/app.css      design tokens, light + dark, LTR + RTL
assets/js/app.js        data loading, filtering, rendering
assets/js/i18n.js       language state, UI strings, direction flip
assets/js/github.js     cached star counts, fails soft
assets/js/admin.js      dashboard logic and JSON export
data/site.json          bio, contact, upstream contributions
data/projects.json      the project list — the file the site reads
scripts/check.mjs       content self-check
```

## Adding a project

Open `/admin.html`, fill the form in **both** languages, and press save. Then:

1. **Download `projects.json`**
2. Replace `data/projects.json` with it
3. Commit and push

The dashboard writes nothing to a server. It keeps a draft in `localStorage` so a half-finished edit survives a refresh, and *Revert* throws the draft away and reloads the committed file. Nothing is live until you push — which is deliberate: the file in the repository is always the truth.

## Checking it

```bash
node scripts/check.mjs
```

Verifies that every project has a tagline and description in both languages, that the two string tables carry identical keys, that every `data-i18n` attribute has a string behind it, and that no project id is duplicated. The site has no build step, so this is what stands in for one.

Preview locally with any static server — ES modules and `fetch` need `http://`, not `file://`:

```bash
npx serve .          # or: python -m http.server
```

## Translation

Both languages are written, not generated. A card missing its Arabic falls back to English and looks unfinished, so `scripts/check.mjs` treats a missing translation as a failure rather than a warning.

Direction is handled with logical CSS properties (`margin-inline`, `inset-inline`) rather than mirrored stylesheets, so the RTL layout is the same layout — not a second one to keep in sync. Arabic gets a taller line height, which the Latin type does not need.

## Licence

MIT — see [LICENSE](LICENSE). The content and project descriptions are mine; the code is yours to borrow.

## Motion

`assets/css/motion.css` is a progressive layer: delete it and the site is still complete and legible. Where the browser supports it, card reveals are driven by `animation-timeline: view()` — the scroll position itself, with no JavaScript in the loop — and fall back to an `IntersectionObserver`. Language and theme changes run through the View Transitions API where available.

Every effect is disabled under `prefers-reduced-motion: reduce`, and that path is tested rather than assumed: with the setting on, the headline renders as plain text, all opacities resolve to 1, and the statistics show their final values without counting.

## Using a custom domain

The site lives at `hamodywe.github.io` and always will. To put a domain in front of it:

1. Buy the domain.
2. At your registrar, point it at GitHub Pages:
   - apex (`example.com`): four `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - subdomain (`www.example.com`): one `CNAME` → `hamodywe.github.io`
3. Add a file named `CNAME` at the repository root containing only the domain.
4. Repository → Settings → Pages → set the custom domain and tick **Enforce HTTPS** once the certificate is issued.

DNS usually propagates within the hour; the certificate can take a little longer.
