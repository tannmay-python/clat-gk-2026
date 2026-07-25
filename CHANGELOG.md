# Changelog

Newest first. Kept so that if a session dies mid-run, the next one knows exactly where it stopped.

## Where things stand

303 topics, 2,627 map nodes, 64 passages, 320 questions.

| Section | Topics | Passages | State |
|---|---|---|---|
| 2026-01 | 21 | 5 | complete |
| 2026-02 | 42 | 8 | complete |
| 2026-03 | 38 | 8 | complete |
| 2026-04 | 41 | 8 | complete |
| 2026-05 | 22 | 3 | complete |
| 2026-06 | 38 | 8 | complete |
| 2026-07 | 30 | 6 | covers 1–25 July, which is the month so far |
| polity | 19 | 4 | done |
| legal-cases | 11 | 2 | done |
| history | 10 | 2 | done |
| orgs | 5 | 2 | done |
| economy | 7 | 2 | done |
| science-environment | 5 | 2 | done |
| awards | 4 | 1 | done |
| geography | 10 | 3 | rewritten from scratch |

## Next up, in order

1. August to December 2025, which was explicitly held back
2. More passages: legal-cases, orgs and awards have the thinnest banks
3. July 2026 needs the last week added once the month closes

---

## 2026-07-26

### Geography rewritten from scratch
The 18 remaining geography topics and 8 of its 9 passages were template output: every story opened with the same sentence, every map node read "The main idea behind X", and all eight passages were literally the same text. Purged and replaced with nine written topics — river systems and the Indus Waters Treaty, the Ghats with the Gadgil and Kasturirangan reports, soils and cropping seasons, ranges and passes, plate tectonics and the seismic zones, the monsoon drivers, Ramsar and biosphere reserves, and the islands — plus two real passages.

### May 2026 researched and built
Went from 5 topics to 22, with 3 passages. The Supreme Court going from 34 judges to 38, emergency medical care read into Article 21, the Assam UCC Bill, the RBI's ₹2.86 lakh crore transfer, India's IORA chairship, the EU carbon border mechanism, the Vietnam upgrade, the UAE trade milestone, the essential religious practices reference, Q4 growth against the PLFS number, the GST Council cuts, the lion count, DRDO's tests, IPL 2026, the 79th Cannes, the migration report, deep-sea mining and the forest goals report. A Cannes entry that actually described the 2024 festival was removed.

### January passage bank
Five passages where there had been none: the Monroe Doctrine, Article 21 and menstrual health, the repo corridor and transmission, BRICS after expansion, and sanction for prosecution.

### Static gaps closed
Medieval India and art and culture in history, planning from the Planning Commission to NITI Aayog in economy, and the digital state — Aadhaar, UPI, the DPDP Act and AI — in science, with a passage on Puttaswamy II. Seven more CLAT-format passages across polity, history, legal-cases, orgs and economy.

---

## 2026-07-25

### Static corpus rewritten by hand
Deleted 75 fabricated static topics, 64 stub topics padded into May 2026 and 20 in legal-cases. Every one had been generated from a template — all thirty polity topics opened with the same sentence and carried invented article numbers.

Replacements written from scratch:
- **polity** 17 topics: Preamble and basic structure, Part III, Articles 14, 21 and 32, emergency provisions, Parliament and money bills, the collegium and NJAC, Parts IV and IVA, constitutional versus statutory bodies, the Seventh Schedule, the Presidency, Article 368, the Constituent Assembly and borrowed features, anti-defection, local government, citizenship
- **legal-cases** 6 new on top of 5 survivors: the Kesavananda chain, Maneka Gandhi, Indra Sawhney, Navtej Johar, the three 2024 criminal codes, doctrines and maxims
- **history** 6 topics: the three mass movements, 1857, the Congress 1885–1939, Cripps to the Independence Act, Company rule and revenue systems, social reform
- **orgs** 3 new: UN specialised agencies, regional groupings, environmental treaties
- **economy** 2: RBI and the MPC, the Union Budget
- **science-environment** 1: ISRO
- **awards** 2, new section: Indian honours, international prizes

### Ultra map rebuilt
Replaced the click-to-expand hub version. Whole corpus on one canvas, clustered by subject. Links are drawn from tags and title proper nouns weighted by inverse document frequency, plus explicit `topicRef` cross-references now carried in the manifest. Static-to-current crossings drawn in brand colour and filterable on their own.

Categories were spelled six ways across writers; `build-index.mjs` now folds them into 18 canonical names, which fixed clustering, section filters and the quiz topic picker together.

### Identity and interaction
- Palette moved from sienna to deep rose on a cool near-white, with an orange lily field tiled behind at 7%
- Wordmark is now CLAT GK *for manya*, the last two words in a script face
- Map nodes are clickable: pointer capture had been swallowing the click target, so taps are detected by press-move-release with a 4px threshold, and every node carries an invisible 16px hit circle
- Plain wheel scrolling handed back to the page; only ctrl-scroll or pinch zooms
- Read tracking: a checkbox on every row and a pill on every topic page, stored in localStorage, with progress bars on the overview, each month card and each section head
- Personal map: add, edit, delete and branch your own nodes, rendered by the same engine as the topic maps, with JSON export and import

## 2026-07-25, earlier

### Seven months of current affairs, January to July 2026
213 topics, 1,438 map nodes, 190 questions. Salvaged from research runs that were cut short by usage limits: two months had written their file, April existed as eight fragment files plus a passage file, and four more were recovered by truncating half-run build scripts at the break point and re-executing them.

### Portal shell
Static site, no build step, no dependencies. Router, month and topic views, radial connection map with pan, zoom, branch highlighting and fullscreen, quiz engine in CLAT format with the real marking scheme, search, and a written primer on how the paper tests general knowledge. Deployed to GitHub Pages through Actions.
