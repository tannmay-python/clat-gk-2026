# Changelog

Newest first. Kept so that if a session dies mid-run, the next one knows exactly where it stopped.

## Where things stand

| Section | Topics | Passages | State |
|---|---|---|---|
| 2026-01 | 21 | 0 | partial month, no passage bank |
| 2026-02 | 42 | 8 | complete |
| 2026-03 | 38 | 8 | complete |
| 2026-04 | 41 | 8 | complete |
| 2026-05 | 5 | 1 | badly incomplete, needs research |
| 2026-06 | 38 | 8 | complete but thin stories |
| 2026-07 | 30 | 6 | covers 1–25 July only |
| polity | 17 | 2 | hand-written, good |
| legal-cases | 11 | 1 | hand-written, good |
| history | 6 | 1 | hand-written, needs more topics |
| orgs | 5 | 1 | hand-written, needs more topics |
| economy | 2 | 0 | needs expansion |
| science-environment | 1 | 0 | needs expansion |
| awards | 2 | 1 | needs expansion |
| geography | 25 | 8 | survived purge, stories thin at ~163 words |

## Next up, in order

1. Economy: taxation and GST, inflation and indices, external sector, planning history, banking structure
2. Science: nuclear and defence programme, health and disease, everyday physics and chemistry the paper asks about
3. Awards: sports honours and trophies, literature and cinema
4. History: ancient and medieval, art and culture, post-independence India
5. Geography: thicken existing stories
6. Months 2026-01, 2026-05, 2026-07: need web research to complete

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
