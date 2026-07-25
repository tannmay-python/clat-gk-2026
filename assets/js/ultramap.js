// Ultra map: an exploration of the whole corpus rather than a picture of it.
//
// You start with a handful of anchor topics and nothing else. Clicking one
// opens it, and its neighbours fade in around it. What you have not clicked
// stays hidden, so the graph grows along the path you walk instead of
// arriving as a hairball. The links are real: shared rare tags, and the
// explicit cross-references topic maps make to other topics.

import { getManifest } from './data.js';
import { esc, meter, isDone } from './ui.js';

const clip = (s, n) => (s = String(s || ''), s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

const W = 1680, H = 1060, CX = 840, CY = 520;
const STEP = 158;   // how far a child sits from its parent
const MIN = 104;    // closest two nodes may be placed

/* ── graph ────────────────────────────────────────────────────────── */

function buildGraph(topics) {
  const norm = s => String(s || '').toLowerCase().trim();

  // A tag shared by half the corpus links nothing. Weight each tag by how rare
  // it is, so "India" counts for almost nothing and "Monroe Doctrine" counts.
  // Tags alone are too sparse — different writers tagged differently. Proper
  // nouns out of the titles carry the same signal and cost nothing.
  const STOP = new Set(['about', 'after', 'again', 'against', 'among', 'become', 'before', 'being',
    'between', 'called', 'court', 'every', 'first', 'from', 'india', 'india\'s', 'indian', 'into',
    'its', 'more', 'most', 'new', 'over', 'part', 'raise', 'return', 'their', 'there', 'these',
    'this', 'through', 'under', 'what', 'when', 'where', 'which', 'while', 'with', 'without',
    'year', 'years', 'holds', 'takes', 'opens', 'clears', 'strikes', 'reaches', 'grinds']);
  const tokens = t => {
    const out = new Set((t.tags || []).map(norm).filter(Boolean));
    for (const w of String(t.title || '').toLowerCase().split(/[^a-z0-9']+/))
      if (w.length > 4 && !STOP.has(w)) out.add(w);
    return out;
  };

  const bag = new Map(topics.map(t => [t.id, tokens(t)]));
  const freq = new Map();
  for (const set of bag.values()) for (const k of set) freq.set(k, (freq.get(k) || 0) + 1);

  const byTag = new Map();
  for (const t of topics) {
    for (const tag of bag.get(t.id)) {
      if (!tag || freq.get(tag) > 24) continue;
      (byTag.get(tag) || byTag.set(tag, []).get(tag)).push(t);
    }
  }

  const pair = new Map();
  const why = new Map();
  const add = (a, b, w, reason) => {
    if (a === b) return;
    const k = a < b ? a + '|' + b : b + '|' + a;
    pair.set(k, (pair.get(k) || 0) + w);
    if (reason && !why.has(k)) why.set(k, reason);
  };

  for (const [tag, list] of byTag) {
    if (list.length < 2 || list.length > 14) continue;
    const w = 1.4 / Math.log2(freq.get(tag) + 2);
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) add(list[i].id, list[j].id, w, tag);
  }

  const known = new Set(topics.map(t => t.id));
  for (const t of topics) for (const r of t.refs || []) if (known.has(r)) add(t.id, r, 1.6, 'named in the map');

  const kind = new Map(topics.map(t => [t.id, t.kind]));
  const edges = [];
  for (const [k, w] of pair) {
    const [a, b] = k.split('|');
    const cross = kind.get(a) !== kind.get(b);
    if (w < (cross ? 0.5 : 0.85)) continue;
    edges.push({ a, b, w, cross, why: why.get(k) || '' });
  }

  // Thin the hairball: keep each node's strongest links only. In an
  // exploration view this matters twice over, because the cap is also the
  // most branches a single click can open at once.
  const perNode = new Map();
  edges.sort((x, y) => y.w - x.w);
  const keep = [];
  for (const e of edges) {
    const na = perNode.get(e.a) || 0, nb = perNode.get(e.b) || 0;
    const cap = e.cross ? 6 : 4;
    if (na >= cap && nb >= cap) continue;
    perNode.set(e.a, na + 1);
    perNode.set(e.b, nb + 1);
    keep.push(e);
  }
  return keep;
}

/* ── view ─────────────────────────────────────────────────────────── */

export async function viewUltraMap(el) {
  const m = await getManifest();
  const topics = m.topics.map(t => ({ ...t, refs: t.refs || [] }));
  const byId = new Map(topics.map(t => [t.id, t]));
  const edges = buildGraph(topics);

  const nbr = new Map();
  for (const e of edges) {
    (nbr.get(e.a) || nbr.set(e.a, []).get(e.a)).push(e.b);
    (nbr.get(e.b) || nbr.set(e.b, []).get(e.b)).push(e.a);
  }
  const degree = id => (nbr.get(id) || []).length;

  // Anchors: the best-connected, heaviest topic in each of the largest
  // subjects, so the six starting points sit in different parts of the corpus.
  function anchors(n = 6) {
    const best = new Map();
    for (const t of topics) {
      if (!degree(t.id)) continue;
      const score = (t.importance || 3) * 3 + degree(t.id) + (t.kind === 'static' ? 4 : 0);
      const cur = best.get(t.category);
      if (!cur || score > cur.score) best.set(t.category, { t, score });
    }
    return [...best.values()].sort((a, b) => b.score - a.score).slice(0, n).map(x => x.t.id);
  }

  const state = {
    pos: new Map(),      // id -> {x, y}
    opened: new Set(),   // ids the user has clicked open
    fresh: new Set(),    // placed since the last draw, so only they animate
    order: [],           // click order, for step-back
    sel: null, scale: 1, tx: 0, ty: 0
  };

  el.innerHTML = `
  <div class="page-head">
    <h1>Ultra map</h1>
    <p class="sub">The whole corpus, revealed a step at a time. Six anchors to begin with; click one and the topics it shares real ground with fade in around it. Keep clicking and the map grows along whatever thread you are pulling. Rose links cross between static GK and current affairs, which is the crossing the exam lives on.</p>
  </div>

  <div class="ultra-bar">
    <span class="ultra-count" data-count></span>
    <div class="ultra-tools">
      <button class="mini" data-act="back">Step back</button>
      <button class="mini" data-act="reset">Start over</button>
      <button class="mini" data-z="-1">&minus;</button>
      <button class="mini" data-z="0">Centre</button>
      <button class="mini" data-z="1">+</button>
    </div>
  </div>

  <div class="ultrawrap">
    <div class="map-stage ultra-stage" data-stage></div>
    <div class="ultra-card" data-card></div>
    <div class="ultra-key">
      <span><i class="dot cur"></i>Current affairs</span>
      <span><i class="dot sta"></i>Static GK</span>
      <span><i class="dot fro"></i>Unopened</span>
      <span><i class="ln cross"></i>Crosses between them</span>
    </div>
  </div>
  <p style="font-size:12.5px;color:var(--faint);margin-top:10px">Hollow dots are unopened. Click one to reveal what it connects to. Drag to pan, ctrl-scroll or pinch to zoom.</p>`;

  const stage = el.querySelector('[data-stage]');
  const card = el.querySelector('[data-card]');
  const count = el.querySelector('[data-count]');

  const apply = () => {
    const cam = stage.querySelector('[data-cam]');
    if (cam) cam.setAttribute('transform', `translate(${state.tx.toFixed(1)} ${state.ty.toFixed(1)}) scale(${state.scale})`);
  };

  const tooClose = (x, y) => {
    for (const q of state.pos.values())
      if ((q.x - x) ** 2 + (q.y - y) ** 2 < MIN * MIN) return true;
    return false;
  };

  // Children fan out on the far side of the parent from wherever the parent
  // came in, so a chain reads outward instead of folding back on itself.
  function place(parentId, ids) {
    const p = state.pos.get(parentId);
    const base = p.from && state.pos.has(p.from)
      ? Math.atan2(p.y - state.pos.get(p.from).y, p.x - state.pos.get(p.from).x)
      : Math.atan2(p.y - CY, p.x - CX) || 0;
    const n = ids.length;
    const spread = n <= 2 ? 1.5 : n <= 4 ? 2.5 : 3.5;

    ids.forEach((id, i) => {
      let a = base + (n === 1 ? 0 : -spread / 2 + spread * (i / (n - 1)));
      let r = STEP + (i % 2) * 26;
      let x = p.x + r * Math.cos(a), y = p.y + r * Math.sin(a);
      for (let k = 0; k < 48 && tooClose(x, y); k++) {
        a += 0.26; r += 7;
        x = p.x + r * Math.cos(a); y = p.y + r * Math.sin(a);
      }
      state.pos.set(id, { x, y, from: parentId });
      state.fresh.add(id);
    });
  }

  function open(id) {
    if (state.opened.has(id)) return false;
    state.opened.add(id);
    state.order.push(id);
    const next = (nbr.get(id) || [])
      .filter(x => !state.pos.has(x))
      .sort((a, b) => (byId.get(b)?.importance || 3) - (byId.get(a)?.importance || 3));
    if (next.length) place(id, next);
    return true;
  }

  function reset() {
    state.pos.clear(); state.opened.clear(); state.fresh.clear(); state.order = [];
    state.sel = null; state.scale = 1; state.tx = 0; state.ty = 0;
    card.classList.remove('on');
    const seeds = anchors(6);
    seeds.forEach((id, i) => {
      const a = -Math.PI / 2 + (i / seeds.length) * Math.PI * 2;
      state.pos.set(id, { x: CX + 300 * Math.cos(a), y: CY + 236 * Math.sin(a), from: null });
      state.fresh.add(id);
    });
  }

  // Step back removes the last opened node's exclusive discoveries, so the
  // map shrinks the way it grew.
  function stepBack() {
    const last = state.order.pop();
    if (!last) return;
    state.opened.delete(last);
    for (const [id, p] of [...state.pos])
      if (p.from === last && !state.opened.has(id)) state.pos.delete(id);
    state.sel = null;
    card.classList.remove('on');
  }

  function draw() {
    const shown = state.pos;
    const live = edges.filter(e =>
      shown.has(e.a) && shown.has(e.b) && (state.opened.has(e.a) || state.opened.has(e.b)));

    const lines = live.map(e => {
      const A = shown.get(e.a), B = shown.get(e.b);
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      const cx = mx + (A.y - B.y) * 0.11, cy = my + (B.x - A.x) * 0.11;
      const isNew = state.fresh.has(e.a) || state.fresh.has(e.b);
      return `<path class="ul-edge${e.cross ? ' cross' : ''}${isNew ? ' grew' : ''}" data-a="${esc(e.a)}" data-b="${esc(e.b)}" d="M${A.x.toFixed(1)} ${A.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${B.x.toFixed(1)} ${B.y.toFixed(1)}" style="stroke-width:${(0.5 + e.w * 0.7).toFixed(2)}"/>`;
    }).join('');

    const dots = [...shown].map(([id, p]) => {
      const t = byId.get(id); if (!t) return '';
      const r = 6 + (t.importance || 3) * 1.9;
      const opened = state.opened.has(id);
      const hidden = (nbr.get(id) || []).filter(x => !shown.has(x)).length;
      const cls = ['ul-node', t.kind, opened ? 'open' : 'frontier'];
      if (isDone(id)) cls.push('read');
      if (state.sel === id) cls.push('sel');
      if (state.fresh.has(id)) cls.push('grew');
      const from = p.from && shown.has(p.from) ? shown.get(p.from) : { x: p.x, y: p.y };
      // The placement transform lives on the outer group and the entry
      // animation on the inner one, because a CSS transform would otherwise
      // overwrite the attribute and drop the node at the origin.
      return `<g class="${cls.join(' ')}" data-id="${esc(id)}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})">
        <g class="ul-in" style="--fx:${(from.x - p.x).toFixed(1)}px;--fy:${(from.y - p.y).toFixed(1)}px">
          <circle class="hit" r="${(r + 14).toFixed(1)}"/>
          <circle class="halo" r="${(r + 7).toFixed(1)}"/>
          <circle class="core" r="${r.toFixed(1)}"/>
          ${!opened && hidden ? `<text class="ul-more" y="3.2" text-anchor="middle">${hidden}</text>` : ''}
          <text class="ul-lab" y="${(r + 17).toFixed(1)}" text-anchor="middle">${esc(clip(t.title, 34))}</text>
        </g>
      </g>`;
    }).join('');

    stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Explorable map of the corpus">
      <g data-cam><g class="ul-edges">${lines}</g><g class="ul-nodes">${dots}</g></g>
    </svg>`;

    const frontier = shown.size - state.opened.size;
    count.textContent = `${state.opened.size} opened · ${frontier} waiting · ${topics.length - shown.size} still dark`;
    state.fresh.clear();
    apply();
  }

  function show(id) {
    const t = byId.get(id);
    if (!t) return;
    const links = (nbr.get(id) || []).map(x => byId.get(x)).filter(Boolean)
      .sort((a, b) => b.importance - a.importance);
    const found = links.filter(l => state.pos.has(l.id)).length;
    const sec = m.sections.find(s => s.id === t.section);
    card.innerHTML = `
      <button class="x" data-close aria-label="Close">&times;</button>
      <div class="k">${esc(sec ? sec.label : '')} · ${esc(t.category || '')}</div>
      <h5>${esc(t.title)}</h5>
      <p>${esc(t.hook || '')}</p>
      <div style="margin:9px 0 2px">${meter(t.importance || 3)}</div>
      ${links.length ? `<div class="ul-links"><b>${found} of ${links.length} connections revealed</b>${links.slice(0, 8).map(l =>
        state.pos.has(l.id)
          ? `<a href="#/topic/${encodeURIComponent(l.id)}"><i class="${l.kind}"></i>${esc(l.title)}</a>`
          : `<span class="dark"><i></i>Not yet found</span>`).join('')}</div>` : ''}
      <a class="btn sm primary" style="margin-top:10px" href="#/topic/${encodeURIComponent(t.id)}">Open topic</a>`;
    card.classList.add('on');
    card.querySelector('[data-close]').addEventListener('click', () => {
      card.classList.remove('on');
      state.sel = null;
      stage.querySelectorAll('.sel').forEach(n => n.classList.remove('sel'));
    });
  }

  /* ── interaction ─────────────────────────────────────────────────── */

  let drag = null;
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('.ultra-card')) return;
    const g = e.target.closest('.ul-node');
    drag = { x: e.clientX, y: e.clientY, tx: state.tx, ty: state.ty, id: g ? g.dataset.id : null, moved: false };
  });
  stage.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved) {
      if (dx * dx + dy * dy < 16) return;
      drag.moved = true;
      stage.classList.add('drag');
      try { stage.setPointerCapture(e.pointerId); } catch {}
    }
    const k = (W / stage.clientWidth) || 1;
    state.tx = Math.max(-W * 1.6, Math.min(W * 1.6, drag.tx + dx * k));
    state.ty = Math.max(-H * 1.6, Math.min(H * 1.6, drag.ty + dy * k));
    apply();
  });
  const end = e => {
    if (drag && !drag.moved) {
      if (drag.id) {
        state.sel = drag.id;
        const grew = open(drag.id);
        show(drag.id);
        if (grew) draw(); else {
          stage.querySelectorAll('.sel').forEach(n => n.classList.remove('sel'));
          stage.querySelector(`.ul-node[data-id="${CSS.escape(drag.id)}"]`)?.classList.add('sel');
        }
      } else {
        state.sel = null;
        card.classList.remove('on');
        stage.querySelectorAll('.sel').forEach(n => n.classList.remove('sel'));
      }
    }
    drag = null;
    stage.classList.remove('drag');
    if (e) { try { stage.releasePointerCapture(e.pointerId); } catch {} }
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    state.scale = Math.min(4, Math.max(0.35, state.scale * (e.deltaY > 0 ? 0.9 : 1.1)));
    apply();
  }, { passive: false });

  el.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.act === 'reset') reset(); else stepBack();
    draw();
  }));

  el.querySelectorAll('[data-z]').forEach(b => b.addEventListener('click', () => {
    const z = +b.dataset.z;
    if (z === 0) { state.scale = 1; state.tx = 0; state.ty = 0; }
    else state.scale = Math.min(4, Math.max(0.35, state.scale * (z > 0 ? 1.25 : 0.8)));
    apply();
  }));

  reset();
  draw();
}
