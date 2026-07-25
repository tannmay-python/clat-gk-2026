// Quiz engine. CLAT format: one passage, five questions, four options.
// Every run samples a fresh set from the bank, so repeats are rare.

import { getManifest, getPassages } from './data.js';
import { esc, md, rng, shuffle, store } from './ui.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const defaults = () => ({
  count: 25,
  mode: 'both',
  sections: [],      // empty = all sections allowed by mode
  categories: [],    // empty = all
  difficulty: 0,     // 0 = any
  shuffleOpts: true
});

let cfg = { ...defaults(), ...store.get('quizcfg', {}) };
let run = null;

/* ── setup screen ─────────────────────────────────────────────────── */

export async function viewQuizSetup(el) {
  const m = await getManifest();
  const cur = m.sections.filter(s => s.kind === 'current');
  const sta = m.sections.filter(s => s.kind === 'static');
  const cats = m.categories;

  el.innerHTML = `
  <div class="page-head">
    <h1>Quiz</h1>
    <p class="sub">Set the shape of the paper and the engine builds it from the passage bank. CLAT format throughout: a passage, then five questions on it.</p>
  </div>
  <div class="qsetup">
    <div>
      <div class="qgroup">
        <h4>How many questions</h4>
        <p>Questions come in blocks of five, one block per passage.</p>
        <div class="count-row">
          <input type="range" min="5" max="60" step="5" value="${cfg.count}" data-count>
          <b data-count-label>${cfg.count}</b>
          <span data-count-sub>${cfg.count / 5} passage${cfg.count === 5 ? '' : 's'}</span>
        </div>
      </div>

      <div class="qgroup">
        <h4>Current affairs or static</h4>
        <p>Static covers polity, history, economy, organisations and the rest of the permanent syllabus.</p>
        <div class="seg" data-mode>
          <button data-v="both" class="${cfg.mode === 'both' ? 'on' : ''}">Both</button>
          <button data-v="current" class="${cfg.mode === 'current' ? 'on' : ''}">Current only</button>
          <button data-v="static" class="${cfg.mode === 'static' ? 'on' : ''}">Static only</button>
        </div>
      </div>

      <div class="qgroup" data-g-months>
        <h4>Months</h4>
        <p>Leave everything off to draw from all months.</p>
        <div class="pick" data-sections>
          ${cur.map(s => `<button data-v="${esc(s.id)}" class="${cfg.sections.includes(s.id) ? 'on' : ''}">${esc(s.label)}</button>`).join('')}
        </div>
      </div>

      <div class="qgroup" data-g-static>
        <h4>Static sections</h4>
        <p>Leave everything off to draw from all of them.</p>
        <div class="pick" data-sections-static>
          ${sta.map(s => `<button data-v="${esc(s.id)}" class="${cfg.sections.includes(s.id) ? 'on' : ''}">${esc(s.label)}</button>`).join('')}
        </div>
      </div>

      <div class="qgroup">
        <h4>Topics</h4>
        <p>Narrow to specific subject areas, or leave it open.</p>
        <div class="pick" data-cats>
          ${cats.map(c => `<button data-v="${esc(c)}" class="${cfg.categories.includes(c) ? 'on' : ''}">${esc(c)}</button>`).join('')}
        </div>
      </div>

      <div class="qgroup">
        <h4>Difficulty</h4>
        <p>Hard passages lean on inference and outside knowledge rather than lifting an answer off the page.</p>
        <div class="seg" data-diff>
          <button data-v="0" class="${cfg.difficulty === 0 ? 'on' : ''}">Any</button>
          <button data-v="1" class="${cfg.difficulty === 1 ? 'on' : ''}">Easy</button>
          <button data-v="2" class="${cfg.difficulty === 2 ? 'on' : ''}">Moderate</button>
          <button data-v="3" class="${cfg.difficulty === 3 ? 'on' : ''}">Hard</button>
        </div>
      </div>

      <div class="qgroup" style="border-bottom:0">
        <h4>Options</h4>
        <div class="pick">
          <button data-shuffle class="${cfg.shuffleOpts ? 'on' : ''}">Shuffle answer choices</button>
        </div>
      </div>
    </div>

    <aside class="qsum">
      <h4>This paper</h4>
      <dl>
        <dt>Questions</dt><dd data-s-count>${cfg.count}</dd>
        <dt>Passages</dt><dd data-s-pass>${cfg.count / 5}</dd>
        <dt>Pool available</dt><dd data-s-pool>—</dd>
      </dl>
      <div data-s-warn></div>
      <button class="btn primary lg" style="width:100%" data-start>Start</button>
      <p style="font-size:12px;color:var(--muted);margin-top:10px;line-height:1.45">Nothing is timed. The clock counts up so you can see your own pace.</p>
    </aside>
  </div>`;

  const $ = s => el.querySelector(s);
  const pool = () => filterStubs(m);

  function refresh() {
    store.set('quizcfg', cfg);
    const n = pool().length;
    $('[data-s-pool]').textContent = n + ' passage' + (n === 1 ? '' : 's');
    $('[data-s-count]').textContent = cfg.count;
    $('[data-s-pass]').textContent = cfg.count / 5;
    $('[data-count-label]').textContent = cfg.count;
    $('[data-count-sub]').textContent = (cfg.count / 5) + ' passage' + (cfg.count === 5 ? '' : 's');
    const need = cfg.count / 5;
    const warn = $('[data-s-warn]');
    warn.innerHTML = n === 0
      ? '<p class="warn">Nothing matches these filters. Loosen one.</p>'
      : n < need ? `<p class="warn">Only ${n} passage${n === 1 ? '' : 's'} match. You will get ${n * 5} questions.</p>` : '';
    $('[data-start]').disabled = n === 0;
    $('[data-g-months]').style.display = (cfg.mode === 'static' || !cur.length) ? 'none' : '';
    $('[data-g-static]').style.display = (cfg.mode === 'current' || !sta.length) ? 'none' : '';
  }

  $('[data-count]').addEventListener('input', e => { cfg.count = +e.target.value; refresh(); });

  const segs = (sel, key, cast = v => v) => $(sel).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    cfg[key] = cast(b.dataset.v);
    $(sel).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    refresh();
  });
  segs('[data-mode]', 'mode');
  segs('[data-diff]', 'difficulty', Number);

  const multi = (sel, key) => $(sel).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const v = b.dataset.v;
    const i = cfg[key].indexOf(v);
    if (i < 0) cfg[key].push(v); else cfg[key].splice(i, 1);
    b.classList.toggle('on', i < 0);
    refresh();
  });
  multi('[data-sections]', 'sections');
  multi('[data-sections-static]', 'sections');
  multi('[data-cats]', 'categories');

  $('[data-shuffle]').addEventListener('click', e => {
    cfg.shuffleOpts = !cfg.shuffleOpts;
    e.target.classList.toggle('on', cfg.shuffleOpts);
    store.set('quizcfg', cfg);
  });

  $('[data-start]').addEventListener('click', () => start(el, m));
  refresh();
}

function filterStubs(m) {
  const kindOf = id => (m.sections.find(s => s.id === id) || {}).kind;
  const selCur = cfg.sections.filter(id => kindOf(id) === 'current');
  const selSta = cfg.sections.filter(id => kindOf(id) === 'static');
  return m.passages.filter(p => {
    if (cfg.mode !== 'both' && p.kind !== cfg.mode) return false;
    const sel = p.kind === 'current' ? selCur : selSta;
    if (sel.length && !sel.includes(p.section)) return false;
    if (cfg.categories.length && !cfg.categories.includes(p.category)) return false;
    if (cfg.difficulty && p.difficulty !== cfg.difficulty) return false;
    return true;
  });
}

/* ── run ──────────────────────────────────────────────────────────── */

async function start(el, m) {
  el.innerHTML = `<div class="page-head"><h1>Building your paper…</h1></div>
    <div class="skel" style="height:180px;margin-bottom:14px"></div>
    <div class="skel" style="height:52px;margin-bottom:8px"></div>
    <div class="skel" style="height:52px"></div>`;

  const seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0;
  const rand = rng(seed);
  const want = cfg.count / 5;
  const picked = shuffle(filterStubs(m), rand).slice(0, want);
  const secIds = [...new Set(picked.map(p => p.section))];
  const ids = new Set(picked.map(p => p.id));
  const full = await getPassages(secIds, p => ids.has(p.id));

  const order = new Map(picked.map((p, i) => [p.id, i]));
  full.sort((a, b) => order.get(a.id) - order.get(b.id));

  run = {
    seed,
    started: Date.now(),
    idx: 0,
    done: false,
    items: full.map(p => ({
      ...p,
      questions: p.questions.map(q => {
        if (!cfg.shuffleOpts) return { ...q, order: q.options.map((_, i) => i) };
        const ord = shuffle(q.options.map((_, i) => i), rand);
        return { ...q, order: ord };
      })
    })),
    answers: {}
  };
  paint(el);
}

function paint(el) {
  if (!run) return;
  if (run.done) return results(el);

  const it = run.items[run.idx];
  const total = run.items.length * 5;
  const answered = Object.keys(run.answers).length;

  el.innerHTML = `
  <div class="qbar">
    <span class="n">Passage ${run.idx + 1} of ${run.items.length}</span>
    <div class="prog"><i style="width:${(answered / total * 100).toFixed(1)}%"></i></div>
    <span class="n">${answered}/${total} answered</span>
    <span class="clock" data-clock>0:00</span>
  </div>

  <div class="passage">
    <h4>${esc(it.sectionLabel || '')}${it.category ? ' · ' + esc(it.category) : ''}</h4>
    ${md(it.passage)}
  </div>

  <div class="qblock">
    ${it.questions.map((q, qi) => {
      const key = it.id + ':' + qi;
      const chosen = run.answers[key];
      return `<div class="qitem">
        <div class="qq"><b>${run.idx * 5 + qi + 1}.</b><span>${esc(q.q)}</span></div>
        <div class="opts" data-q="${qi}">
          ${q.order.map((oi, pos) => `
            <button class="opt ${chosen === oi ? 'on' : ''}" data-o="${oi}">
              <span class="lt">${LETTERS[pos]}</span><span>${esc(q.options[oi])}</span>
            </button>`).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>

  <div class="qnav">
    <button class="btn" data-prev ${run.idx === 0 ? 'disabled' : ''}>&larr; Previous</button>
    <span class="sp"></span>
    <button class="btn" data-quit>Abandon</button>
    ${run.idx === run.items.length - 1
      ? '<button class="btn primary" data-submit>Submit paper</button>'
      : '<button class="btn primary" data-next>Next passage &rarr;</button>'}
  </div>`;

  el.querySelectorAll('.opts').forEach(box => box.addEventListener('click', e => {
    const b = e.target.closest('.opt'); if (!b) return;
    const qi = box.dataset.q;
    run.answers[it.id + ':' + qi] = +b.dataset.o;
    box.querySelectorAll('.opt').forEach(x => x.classList.toggle('on', x === b));
    const a = Object.keys(run.answers).length;
    el.querySelector('.prog i').style.width = (a / total * 100).toFixed(1) + '%';
    el.querySelectorAll('.qbar .n')[1].textContent = `${a}/${total} answered`;
  }));

  el.querySelector('[data-prev]')?.addEventListener('click', () => { run.idx--; paint(el); scrollTop(); });
  el.querySelector('[data-next]')?.addEventListener('click', () => { run.idx++; paint(el); scrollTop(); });
  el.querySelector('[data-submit]')?.addEventListener('click', () => { run.done = true; run.ended = Date.now(); paint(el); scrollTop(); });
  el.querySelector('[data-quit]')?.addEventListener('click', () => { run = null; location.hash = '#/quiz'; viewQuizSetup(el); });

  clock(el.querySelector('[data-clock]'));
}

function scrollTop() { window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }

let clockTimer = null;
function clock(node) {
  clearInterval(clockTimer);
  if (!node || !run) return;
  const tick = () => {
    if (!run) return clearInterval(clockTimer);
    const s = Math.floor(((run.ended || Date.now()) - run.started) / 1000);
    node.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };
  tick();
  clockTimer = setInterval(tick, 1000);
}

/* ── results ──────────────────────────────────────────────────────── */

function results(el) {
  clearInterval(clockTimer);
  let right = 0, total = 0;
  const byCat = {};
  for (const it of run.items) {
    it.questions.forEach((q, qi) => {
      total++;
      const got = run.answers[it.id + ':' + qi];
      const ok = got === q.answer;
      if (ok) right++;
      const c = it.category || 'Other';
      byCat[c] = byCat[c] || { r: 0, n: 0 };
      byCat[c].n++; if (ok) byCat[c].r++;
    });
  }
  const secs = Math.floor(((run.ended || Date.now()) - run.started) / 1000);
  const pct = total ? Math.round(right / total * 100) : 0;
  // CLAT marks: +1 correct, -0.25 wrong, 0 unattempted
  const attempted = Object.keys(run.answers).length;
  const marks = (right - (attempted - right) * 0.25).toFixed(2);

  const verdict =
    pct >= 85 ? 'That is a sectional topper score. Push into the harder passages.'
    : pct >= 70 ? 'Solid. The gap now is usually the second-order fact, not the headline.'
    : pct >= 50 ? 'Middling. Go back through the maps for whatever you missed — the wrong answers cluster.'
    : 'Read the month pages before drilling again. Quizzing on material you have not read is just guessing.';

  el.innerHTML = `
  <div class="score">
    <div class="big">${right}</div>
    <div class="of">of ${total} correct · ${pct}%</div>
    <div class="line">${esc(verdict)}</div>
  </div>

  <div class="brk">
    <div><b>${marks}</b><span>CLAT marks (+1 / &minus;0.25)</span></div>
    <div><b>${attempted}</b><span>Attempted</span></div>
    <div><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b><span>Time taken</span></div>
    <div><b>${total ? (secs / total).toFixed(0) : 0}s</b><span>Per question</span></div>
  </div>

  <div class="box" style="margin-bottom:26px">
    <h4>By subject</h4>
    <div class="facts">
      ${Object.entries(byCat).sort((a, b) => b[1].n - a[1].n).map(([c, v]) =>
        `<div style="display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px">
          <span style="font-size:13.5px;color:var(--ink)">${esc(c)}</span>
          <span style="font-variant-numeric:tabular-nums;font-size:13.5px;font-weight:560;color:${v.r === v.n ? 'var(--ok)' : v.r / v.n < 0.5 ? 'var(--bad)' : 'var(--muted)'}">${v.r}/${v.n}</span>
        </div>`).join('')}
    </div>
  </div>

  <h2 style="font-size:18px;margin-bottom:6px">Review</h2>
  <p style="color:var(--muted);font-size:13.5px;margin-bottom:18px">Every question, with the reasoning. This is the part that actually moves the score.</p>

  ${run.items.map((it, pi) => `
    <section style="margin-bottom:34px">
      <div class="passage">
        <h4>Passage ${pi + 1} · ${esc(it.sectionLabel || '')}${it.category ? ' · ' + esc(it.category) : ''}</h4>
        ${md(it.passage)}
      </div>
      <div class="qblock">
      ${it.questions.map((q, qi) => {
        const got = run.answers[it.id + ':' + qi];
        return `<div class="qitem">
          <div class="qq"><b>${pi * 5 + qi + 1}.</b><span>${esc(q.q)}</span></div>
          <div class="opts">
            ${q.order.map((oi, pos) => {
              const cls = oi === q.answer ? 'right' : (got === oi ? 'wrong' : '');
              return `<div class="opt ${cls}"><span class="lt">${LETTERS[pos]}</span><span>${esc(q.options[oi])}</span></div>`;
            }).join('')}
          </div>
          <div class="expl"><b>${got === undefined ? 'Not attempted.' : got === q.answer ? 'Correct.' : 'Wrong.'}</b> ${esc(q.explain || '')}</div>
        </div>`;
      }).join('')}
      </div>
      ${(it.topicIds || []).length ? `<p style="margin-top:12px;font-size:13px;color:var(--muted)">Read up: ${it.topicIds.map(t => `<a href="#/topic/${encodeURIComponent(t)}" style="color:var(--brand)">${esc(t.replace(/^\d{4}-\d{2}-|^[a-z]+-/, '').replace(/-/g, ' '))}</a>`).join(' · ')}</p>` : ''}
    </section>`).join('')}

  <div class="qnav">
    <button class="btn primary" data-again>Another paper, same settings</button>
    <button class="btn" data-config>Change settings</button>
  </div>`;

  el.querySelector('[data-again]').addEventListener('click', async () => {
    scrollTop();
    start(el, await getManifest());
  });
  el.querySelector('[data-config]').addEventListener('click', () => { run = null; viewQuizSetup(el); scrollTop(); });
}

export function quizActive() { return !!run && !run.done; }
