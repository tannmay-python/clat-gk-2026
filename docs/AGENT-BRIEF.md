# Content build brief

You are building one section of a CLAT General Knowledge portal. Read `docs/VOICE.md` and `docs/SCHEMA.md` in full first and obey both.

## Research

Do real web research — at least 20 searches with WebSearch and WebFetch. Good sources: The Hindu, Indian Express, PIB, Drishti IAS monthly compilations, GKToday, Vision IAS, Jagran Josh CLAT current affairs, Reuters, AP, BBC, Britannica, official ministry and organisation sites. Lifting facts from published compendiums is fine; this is a private study tool.

Accuracy above coverage. If you cannot verify a date, a name, or a number, leave it out. Never invent one.

## For a month section (`data/months/<YYYY-MM>.json`)

- 36 to 42 topics, ranked 1 to N by how likely CLAT is to test them.
- Mix: roughly 55% India (polity, Supreme Court judgments, schemes, budget and economy, appointments, bills and acts), 35% world (geopolitics, wars, summits, UN, elections abroad, neighbourhood), 10% sports, awards, science, books, obituaries, environment. Legal and constitutional news is weighted up — this is a law entrance.
- Depth: ranks 1–12 `deep`, ranks 13–26 `medium`, ranks 27+ `brief`.
- 8 passages.

## For a static section (`data/static/<slug>.json`)

- 30 to 40 topics, ranked by exam frequency. Rank 1 is the thing that appears in almost every paper.
- Depth: ranks 1–12 `deep`, 13–26 `medium`, 27+ `brief`.
- 12 passages. Static passages read like an explainer or an encyclopedia extract rather than news copy, and the questions lean harder on recall and application.
- Set `"order"` on the section object so the app can sort static sections sensibly.

## The storytelling requirement — this is the point of the project

Do not write news summaries. Every topic connects the thing to the wider web of knowledge an aspirant needs.

If the topic is an AI declaration, it carries OpenAI's founding year, its CEO, its rivals, the earlier AI summits and where they were held, the EU AI Act, India's own AI mission. If the topic is Venezuela, it carries the Monroe Doctrine of 1823, Simón Bolívar and the Bolivarian Republic name, OPEC membership, the history of US sanctions, the Organization of American States and its headquarters.

Connect outward to things an exam could ask. Do not wander into material no exam would touch.

The `map` field is where this lives. Radial tree, 18–30 nodes for deep topics. Tier 1 nodes are the corollaries an examiner reaches for first; tier 2 second-order; tier 3 background. Every node's `note` must contain a fact that could be turned into a question — "Sam Altman" is useless, "Sam Altman, OpenAI CEO, was fired and reinstated over five days in November 2023" is a question. A good map mixes a person, an organisation with its founding year or headquarters, a historical precedent, a constitutional or legal hook, and a number.

Use `topicRef` to point at other topics in the same file when they genuinely connect.

## Passages

CLAT reading-comprehension format: 250–400 words of prose, then 5 questions, 4 options each, `answer` as a 0-indexed integer. Roughly one main-idea question, two inference questions, one fact check, and one that needs static knowledge the passage only gestures at. Explanations teach — say why the tempting wrong option is wrong.

## Before you finish

Validate:

```
node scripts/build-index.mjs
```

from the project root. Fix everything it reports about your file. Re-run until your file is clean.

Report back only: topic count, passage count, and anything you were unsure about.
