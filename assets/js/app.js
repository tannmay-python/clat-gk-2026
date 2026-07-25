import { getManifest, getSection, getTopic } from './data.js';
import { esc, md, meter, fmtDate, highlight, store, tick, isDone, toggleDone, doneCount } from './ui.js';
import { renderMap, wireMap } from './map.js';
import { viewQuizSetup } from './quiz.js';
import { viewHow } from './how.js';
import { viewMyMap } from './mymap.js';
import { viewUltraMap } from './ultramap.js';

const view = document.getElementById('view');

/* ── theme ────────────────────────────────────────────────────────── */
document.getElementById('theme').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  store.set('theme', next);
});

/* ── router ───────────────────────────────────────────────────────── */
const routes = [
  [/^\/?$/, viewHome],
  [/^\/months\/?$/, () => viewSectionIndex('current')],
  [/^\/static\/?$/, () => viewSectionIndex('static')],
  [/^\/ultramap\/?$/, () => viewUltraMap(view)],
  [/^\/s\/([^/]+)$/, (m) => viewSection(decodeURIComponent(m[1]))],
  [/^\/topic\/([^/]+)$/, (m) => viewTopic(decodeURIComponent(m[1]))],
  [/^\/quiz\/?$/, () => viewQuizSetup(view)],
  [/^\/search\/?$/, viewSearch],
  [/^\/mymap\/?$/, () => viewMyMap(view)],
  [/^\/how\/?$/, () => { view.innerHTML = viewHow(); }]
];

async function route() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path] = raw.split('?');
  for (const a of document.querySelectorAll('.nav a')) {
    const h = a.getAttribute('href').slice(1);
    const on = h === '/' ? path === '/' : path.startsWith(h);
    a.toggleAttribute('aria-current', on);
    if (on) a.setAttribute('aria-current', 'page');
  }
  for (const [re, fn] of routes) {
    const m = path.match(re);
    if (m) {
      try { await fn(m); } catch (e) { fail(e); }
      return;
    }
  }
  view.innerHTML = `<div class="empty"><strong>No such page</strong><a href="#/" style="color:var(--brand)">Back to the overview</a></div>`;
}

function fail(e) {
  console.error(e);
  view.innerHTML = `<div class="empty"><strong>Something did not load</strong>${esc(e.message || e)}</div>`;
}

addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });
route();

// Static GK is built section by section; hide the entry until one exists.
getManifest().then(m => {
  if (!m.sections.some(s => s.kind === 'static')) {
    document.querySelector('.nav a[href="#/static"]')?.remove();
  }
}).catch(() => {});

/* ── overview ─────────────────────────────────────────────────────── */
async function viewHome() {
  const m = await getManifest();
  const months = m.sections.filter(s => s.kind === 'current');
  const statics = m.sections.filter(s => s.kind === 'static');
  const top = m.topics.filter(t => t.kind === 'current')
    .sort((a, b) => (b.importance - a.importance) || (a.rank - b.rank)).slice(0, 12);

  view.innerHTML = `
  <section class="hero">
    <h1>Everything CLAT could ask you about the world, arranged by month.</h1>
    <p>Each month is a ranked list, top to bottom, by how likely the paper is to touch it. Each topic opens into the story behind the headline and a map of what it connects to — the treaty from 1823, the founder, the article of the Constitution, the organisation nobody remembers the headquarters of. Then you drill it in the exam's own format.</p>
    <div class="acts">
      <a class="btn primary lg" href="#/months">Start with the months</a>
      <a class="btn lg" href="#/quiz">Build a quiz</a>
      <a class="btn lg" href="#/how">How the paper tests GK</a>
    </div>
    <div class="stats">
      <div class="stat"><b>${m.stats.months}</b><span>months covered</span></div>
      <div class="stat"><b>${m.stats.topics}</b><span>ranked topics</span></div>
      <div class="stat"><b>${m.stats.nodes.toLocaleString('en-IN')}</b><span>map connections</span></div>
      <div class="stat"><b>${m.stats.questions}</b><span>questions in the bank</span></div>
    </div>
    <div style="margin-top:24px;max-width:460px">${progressBar(m.topics.map(t => t.id))}</div>
  </section>

  <h2 style="font-size:17px;margin-bottom:12px">Months</h2>
  <div class="month-grid" style="margin-bottom:34px">
    ${months.map(s => `<a class="month-cell" href="#/s/${encodeURIComponent(s.id)}">
      <b>${esc(s.label)}</b><span>${s.topicCount} topics · ${s.passageCount * 5} questions</span>
      <em>${esc(clip(s.blurb, 110))}</em>
      ${progressBar(m.topics.filter(t => t.section === s.id).map(t => t.id), false)}</a>`).join('')}
  </div>

  ${statics.length ? `<h2 style="font-size:17px;margin-bottom:12px">Static GK</h2>
  <div class="month-grid" style="margin-bottom:34px">
    ${statics.map(s => `<a class="month-cell" href="#/s/${encodeURIComponent(s.id)}">
      <b>${esc(s.label)}</b><span>${s.topicCount} topics · ${s.passageCount * 5} questions</span>
      <em>${esc(clip(s.blurb, 110))}</em>
      ${progressBar(m.topics.filter(t => t.section === s.id).map(t => t.id), false)}</a>`).join('')}
  </div>` : ''}

  <h2 style="font-size:17px;margin-bottom:4px">If you only had a week</h2>
  <p style="color:var(--muted);font-size:13.5px;margin-bottom:14px">The twelve highest-weighted current affairs topics across every month covered.</p>
  <div class="tlist">${top.map(t => row(t, m)).join('')}</div>`;
}

const clip = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };

function row(t, m) {
  const sec = m.sections.find(s => s.id === t.section);
  return `<div class="trow${isDone(t.id) ? ' done' : ''}" data-row="${esc(t.id)}">
    ${tick(t.id)}
    <a class="tmain" href="#/topic/${encodeURIComponent(t.id)}">
      <span class="rk">${t.rank}</span>
      <span>
        <h3>${esc(t.title)}</h3>
        <p class="hk">${esc(t.hook || '')}</p>
        <span class="mt">
          <span class="chip">${esc(t.category || '')}</span>
          ${sec ? `<span class="chip">${esc(sec.label)}</span>` : ''}
          ${t.date ? `<span style="font-size:11.5px;color:var(--faint)">${esc(fmtDate(t.date))}</span>` : ''}
        </span>
      </span>
    </a>
    <span class="rt">
      <span class="dp ${t.depth === 'deep' ? 'deep' : ''}">${esc(t.depth || '')}</span>
      ${meter(t.importance || 3)}
    </span>
  </div>`;
}

// One delegated listener for every tick on the page, whatever view drew it.
document.addEventListener('click', e => {
  const b = e.target.closest('[data-tick]');
  if (!b) return;
  e.preventDefault();
  const id = b.dataset.tick;
  const on = toggleDone(id);
  for (const el of document.querySelectorAll(`[data-tick="${CSS.escape(id)}"]`)) {
    el.classList.toggle('on', on);
    el.setAttribute('aria-checked', String(on));
    el.closest('[data-row]')?.classList.toggle('done', on);
    if (el.dataset.label) el.querySelector('span').textContent = on ? 'Read' : 'Mark as read';
  }
  document.querySelectorAll('[data-progress]').forEach(refreshProgress);
});

function refreshProgress(el) {
  const ids = JSON.parse(el.dataset.progress || '[]');
  if (!ids.length) return;
  const n = doneCount(ids);
  el.style.setProperty('--p', (n / ids.length * 100).toFixed(1) + '%');
  const label = el.querySelector('[data-progress-label]');
  if (label) label.textContent = `${n} of ${ids.length} read`;
}

function progressBar(ids, label = true) {
  return `<div class="prog-wrap" data-progress='${JSON.stringify(ids)}' style="--p:${(doneCount(ids) / Math.max(1, ids.length) * 100).toFixed(1)}%">
    <div class="prog-track"><i></i></div>
    ${label ? `<span class="prog-num" data-progress-label>${doneCount(ids)} of ${ids.length} read</span>` : ''}
  </div>`;
}

/* ── section index ────────────────────────────────────────────────── */
async function viewSectionIndex(kind) {
  const m = await getManifest();
  const list = m.sections.filter(s => s.kind === kind);
  if (!list.length) {
    view.innerHTML = `<div class="empty"><strong>Nothing here yet</strong>No ${kind} sections have been built.</div>`;
    return;
  }
  location.replace('#/s/' + encodeURIComponent(list[0].id));
}

/* ── one section (a month, or a static area) ──────────────────────── */
async function viewSection(id) {
  const m = await getManifest();
  const meta = m.sections.find(s => s.id === id);
  if (!meta) return fail(new Error('Unknown section ' + id));
  const siblings = m.sections.filter(s => s.kind === meta.kind);

  view.innerHTML = `<div class="split">
    <nav class="rail">
      <h4>${meta.kind === 'current' ? 'Months' : 'Static GK'}</h4>
      ${siblings.map(s => `<a href="#/s/${encodeURIComponent(s.id)}" ${s.id === id ? 'aria-current="page"' : ''}>${esc(s.label)}<i>${s.topicCount}</i></a>`).join('')}
      <hr>
      <a href="#/${meta.kind === 'current' ? 'static' : 'months'}">${meta.kind === 'current' ? 'Static GK →' : 'Months →'}</a>
    </nav>
    <div data-body><div class="skel" style="height:60px;margin-bottom:16px"></div><div class="skel" style="height:300px"></div></div>
  </div>`;

  const sec = await getSection(id);
  const body = view.querySelector('[data-body]');
  const cats = [...new Set(sec.topics.map(t => t.category).filter(Boolean))].sort();
  let activeCat = null;

  const draw = () => {
    const list = sec.topics
      .filter(t => !activeCat || t.category === activeCat)
      .sort((a, b) => a.rank - b.rank);
    body.querySelector('.tlist').innerHTML = list.length
      ? list.map(t => row({ ...t, section: id }, m)).join('')
      : '<div class="empty">Nothing in that category this month.</div>';
    body.querySelectorAll('.filters button').forEach(b =>
      b.classList.toggle('on', (b.dataset.c || null) === activeCat));
  };

  body.innerHTML = `
    <div class="page-head">
      <h1>${esc(sec.label)}</h1>
      <p class="sub">${esc(sec.blurb || '')}</p>
      <p style="margin-top:10px;font-size:13px;color:var(--faint)">${sec.topics.length} topics, ranked. ${sec.passages ? sec.passages.length * 5 : 0} questions in the bank from this section.</p>
      <div style="margin-top:14px;max-width:420px">${progressBar(sec.topics.map(t => t.id))}</div>
    </div>
    <div class="filters">
      <button data-c="">All</button>
      ${cats.map(c => `<button data-c="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>
    <div class="tlist"></div>`;

  body.querySelector('.filters').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    activeCat = b.dataset.c || null;
    draw();
  });
  draw();
}

/* ── one topic ────────────────────────────────────────────────────── */
async function viewTopic(id) {
  view.innerHTML = `<div class="skel" style="height:34px;width:60%;margin-bottom:14px"></div>
    <div class="skel" style="height:300px"></div>`;
  const m = await getManifest();
  const got = await getTopic(id);
  if (!got || !got.topic) return fail(new Error('Topic not found: ' + id));
  const { topic, section } = got;

  const siblings = section.topics.slice().sort((a, b) => a.rank - b.rank);
  const i = siblings.findIndex(t => t.id === id);
  const prev = siblings[i - 1], next = siblings[i + 1];

  const related = m.topics
    .filter(t => t.id !== id && (t.tags || []).some(tag => (topic.tags || []).includes(tag)))
    .sort((a, b) => b.importance - a.importance).slice(0, 6);

  view.innerHTML = `
  <nav class="crumb">
    <a href="#/${section.kind === 'current' ? 'months' : 'static'}">${section.kind === 'current' ? 'Months' : 'Static GK'}</a><s>/</s>
    <a href="#/s/${encodeURIComponent(section.id)}">${esc(section.label)}</a><s>/</s>
    <span>#${topic.rank}</span>
  </nav>

  <header class="topic-head">
    <h1>${esc(topic.title)}</h1>
    <p class="hk">${esc(topic.hook || '')}</p>
    <div class="mt">
      <span class="chip on">${esc(topic.category || '')}</span>
      ${topic.date ? `<span>${esc(fmtDate(topic.date))}</span>` : ''}
      <span>Exam weight ${meter(topic.importance || 3)}</span>
      ${(topic.tags || []).slice(0, 6).map(t => `<span class="chip">${esc(t)}</span>`).join('')}
    </div>
    <button class="donebtn${isDone(topic.id) ? ' on' : ''}" data-tick="${esc(topic.id)}" data-label="1" role="checkbox" aria-checked="${isDone(topic.id)}">
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M2.5 8.5 6 12l7.5-8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span>${isDone(topic.id) ? 'Read' : 'Mark as read'}</span>
    </button>
  </header>

  <div class="topic-body">
    <article>
      <div class="prose">${md(topic.story)}</div>
      ${renderMap(topic)}
      ${topic.map?.nodes?.length ? '<p style="font-size:12.5px;color:var(--faint);margin-top:8px">Click a node for the fact attached to it. Drag to pan, ctrl-scroll or pinch to zoom, or use the buttons. Nodes closest to the centre are the ones an examiner reaches for first.</p>' : ''}
    </article>

    <aside class="side">
      ${topic.facts?.length ? `<div class="box"><h4>Facts worth memorising</h4><dl class="facts">
        ${topic.facts.map(f => `<div><dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd></div>`).join('')}
      </dl></div>` : ''}

      ${topic.timeline?.length ? `<div class="box"><h4>Timeline</h4><ul class="tline">
        ${topic.timeline.map(t => `<li><b>${esc(t.when)}</b><span>${esc(t.what)}</span></li>`).join('')}
      </ul></div>` : ''}

      ${topic.why ? `<div class="box"><h4>How this gets asked</h4><div class="why">${esc(topic.why)}</div></div>` : ''}

      ${related.length ? `<div class="box"><h4>Connected topics</h4><div class="related">
        ${related.map(r => `<a href="#/topic/${encodeURIComponent(r.id)}">${esc(r.title)}<span>${esc((m.sections.find(s => s.id === r.section) || {}).label || '')}</span></a>`).join('')}
      </div></div>` : ''}

      ${topic.sources?.length ? `<div class="box"><h4>Sources</h4><div class="srcs">
        ${topic.sources.slice(0, 6).map(s => `<a href="${esc(s)}" target="_blank" rel="noopener">${esc(s.replace(/^https?:\/\//, '').slice(0, 52))}</a>`).join('')}
      </div></div>` : ''}
    </aside>
  </div>

  <nav class="pager">
    ${prev ? `<a href="#/topic/${encodeURIComponent(prev.id)}">← #${prev.rank}<b>${esc(clip(prev.title, 60))}</b></a>` : '<span></span>'}
    ${next ? `<a href="#/topic/${encodeURIComponent(next.id)}" style="text-align:right">#${next.rank} →<b>${esc(clip(next.title, 60))}</b></a>` : '<span></span>'}
  </nav>`;

  wireMap(view, topic);
}

/* ── search ───────────────────────────────────────────────────────── */
async function viewSearch() {
  const m = await getManifest();
  const q0 = new URLSearchParams(location.hash.split('?')[1] || '').get('q') || '';

  view.innerHTML = `
  <div class="page-head">
    <h1>Search</h1>
    <p class="sub">Across every topic title, hook and tag in the corpus.</p>
  </div>
  <div class="searchbar">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>
    <input class="input" placeholder="Monroe Doctrine, Article 370, WTO, Nobel…" value="${esc(q0)}" autofocus>
  </div>
  <div data-results></div>`;

  const input = view.querySelector('input');
  const out = view.querySelector('[data-results]');

  const run = () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      out.innerHTML = `<div class="empty"><strong>Type at least two letters</strong>Then it filters as you go.</div>`;
      return;
    }
    const words = q.split(/\s+/);
    const hits = m.topics.map(t => {
      const hay = (t.title + ' ' + (t.hook || '') + ' ' + (t.tags || []).join(' ') + ' ' + (t.category || '')).toLowerCase();
      let score = 0;
      for (const w of words) {
        if (!hay.includes(w)) return null;
        if (t.title.toLowerCase().includes(w)) score += 3;
        if ((t.tags || []).some(x => x.toLowerCase().includes(w))) score += 2;
        score += 1;
      }
      return { t, score: score + (t.importance || 0) / 10 };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 60);

    history.replaceState(null, '', '#/search?q=' + encodeURIComponent(input.value));

    out.innerHTML = hits.length
      ? `<p style="font-size:13px;color:var(--muted);margin-bottom:10px">${hits.length} match${hits.length === 1 ? '' : 'es'}</p>
         <div class="tlist">${hits.map(({ t }) => `
           <div class="trow${isDone(t.id) ? ' done' : ''}" data-row="${esc(t.id)}">
             ${tick(t.id)}
             <a class="tmain" href="#/topic/${encodeURIComponent(t.id)}">
               <span class="rk">${t.rank}</span>
               <span><h3>${highlight(t.title, input.value)}</h3>
               <p class="hk">${highlight(t.hook || '', input.value)}</p>
               <span class="mt"><span class="chip">${esc(t.category || '')}</span>
               <span class="chip">${esc((m.sections.find(s => s.id === t.section) || {}).label || '')}</span></span></span>
             </a>
             <span class="rt">${meter(t.importance || 3)}</span>
           </div>`).join('')}</div>`
      : `<div class="empty"><strong>Nothing found</strong>Try a shorter word, or a person's surname.</div>`;
  };

  let t;
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 120); });
  run();
}
