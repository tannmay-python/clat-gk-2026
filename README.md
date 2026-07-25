# CLAT GK 2026

A general knowledge portal built for one person preparing for CLAT. Month-by-month current affairs ranked by exam probability, each topic opened out into the story and the web of things it connects to, plus a quiz engine that builds papers in the exam's own format.

Private study material. Facts are drawn from news reporting and published current-affairs compilations.

## What is in it

- **Months.** Each month is 36–42 topics in ranked order, with a five-segment exam-weight meter. Deep topics get 550–850 words, medium ones 250–400, brief ones a paragraph.
- **Connection maps.** Every topic carries a radial map of what it links to: the historical precedent, the institution and its founding year, the people, the constitutional hook. Ring distance is degrees of separation, tier is how likely an examiner is to reach for it. Click any node for the fact attached.
- **Static GK.** Polity, history, economy, organisations, awards, sports, science — the permanent half of the syllabus.
- **Quiz engine.** Pick a question count, current or static or both, specific months, specific subjects, difficulty. It samples a fresh set from the passage bank every time, in CLAT format: a passage, then five questions with four options. Scored with the real marking scheme, with an explanation on every question.

## Running it

No build step, no dependencies. It is static files.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`. Fetch needs a server; opening `index.html` from the filesystem will not work.

## Adding or editing content

Content lives in `data/months/<YYYY-MM>.json` and `data/static/<slug>.json`. The shape is documented in [docs/SCHEMA.md](docs/SCHEMA.md). Prose follows [docs/VOICE.md](docs/VOICE.md).

After any edit, regenerate the manifest:

```bash
node scripts/build-index.mjs
```

That script doubles as the validator. It reports missing maps, malformed questions, out-of-range answer indices and duplicate ids.

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which rebuilds the manifest and publishes to GitHub Pages. Set Pages source to "GitHub Actions" in repository settings once.

## Layout

```
index.html              shell
assets/css/app.css      the whole design system
assets/js/app.js        router and views
assets/js/map.js        radial connection map
assets/js/quiz.js       quiz engine
assets/js/data.js       manifest and lazy section loading
data/                   content
scripts/build-index.mjs manifest builder and validator
docs/                   schema, voice, design notes
```
