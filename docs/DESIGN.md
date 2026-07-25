# Design notes

## Who this is for

One person: a 17-year-old at a desk at 11pm, six months out from CLAT, with a browser tab open next to a physical notebook. The tool has to survive two hours of continuous reading and then switch into drill mode without feeling like a different product.

That scene forces the decisions. Light by default because most of the time here is spent reading long prose. A real dark theme because of the 11pm. Density over whitespace because the reader wants to see thirty ranked topics at once, not scroll through thirty cards.

## Register

Product, not brand. The interface should disappear into the task. Earned familiarity beats novelty: standard top bar, standard filters, standard question cards. The one place personality is allowed to show is the knowledge map, because that is the actual idea.

## Color

Restrained. Pure white surface, chroma-0 neutrals, one warm brand hue doing all the emotional work.

- `--brand` `oklch(0.52 0.148 42)` — a deep sienna. Reads closer to a law-library seal or a bottle of iron-gall ink than to a SaaS orange.
- Surfaces are chroma 0 throughout. No cream, no sand, no warm-tinted near-white. The warmth lives in the brand color and in the serif.
- Brand color is used for: primary actions, current selection, tier-1 map nodes, the importance meter, correct answers. Never for decoration.

Dark theme is a real second theme with its own ramp, not an inversion.

## Type

Two families on a contrast axis.

- UI, labels, data, buttons: the system sans stack. No webfont, no network request, no layout shift.
- Story prose: a serif stack (Iowan Old Style / Palatino / Georgia). Long-form reading is a third of the time spent here and serif earns its place.
- Numbers that need to line up (ranks, scores, timers): tabular figures.

Fixed rem scale, ratio around 1.2. No fluid clamp headings — this is product UI viewed at a consistent size.

## Importance encoding

The brief asked for a way to see how much something matters. Three encodings, used consistently everywhere:

1. **Rank** — the ordinal within a month. Shown as a tabular number.
2. **Importance 1–5** — a five-segment meter. Filled segments in brand color.
3. **Map tier** — ring 1 nodes are brand-filled and full-size, ring 2 are outlined and smaller, ring 3 are neutral gray and smaller still. Opacity drops as you move outward. The visual weight falls off with relevance, which is the whole point of the map.

## Motion

150–220ms, `cubic-bezier(0.22, 1, 0.36, 1)`. Map nodes fade in staggered by ring, which is the one piece of choreography that earns its keep because it teaches the tier hierarchy on first sight. Everything else is state feedback. Full `prefers-reduced-motion` alternative on all of it.

## Stack

No framework, no build step, no dependencies. Static HTML, ES modules, one stylesheet. Data is JSON fetched per month on demand. This deploys to GitHub Pages as-is, loads instantly, and will still work in five years.
