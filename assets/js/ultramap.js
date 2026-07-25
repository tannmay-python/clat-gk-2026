// Ultra map: the whole corpus at once, clustered by subject, with the links
// that actually exist in the data — shared tags, and the explicit cross
// references topic maps make to other topics.
//
// The point of the view is the lines that cross between static GK and current
// affairs, because that crossing is what CLAT tests.

import { getManifest } from './data.js';
import { esc, meter, isDone } from './ui.js';

const W = 1680, H = 1060, CX = 840, CY = 520;

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
  const add = (a, b, w) => {
    if (a === b) return;
    const k = a < b ? a + '|' + b : b + '|' + a;
    pair.set(k, (pair.get(k) || 0) + w);
  };

  for (const [tag, list] of byTag) {
    if (list.length < 2 || list.length > 14) continue;
    const w = 1.4 / Math.log2(freq.get(tag) + 2);
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) add(list[i].id, list[j].id, w);
  }

  const known = new Set(topics.map(t => t.id));
  for (const t of topics) for (const r of t.refs || []) if (known.has(r)) add(t.id, r, 1.6);

  const kind = new Map(topics.map(t => [t.id, t.kind]));
  const edges = [];
  for (const [k, w] of pair) {
    const [a, b] = k.split('|');
    const cross = kind.get(a) !== kind.get(b);
    if (w < (cross ? 0.5 : 0.85)) continue;
    edges.push({ a, b, w, cross });
  }

  // Thin the hairball: keep each node's strongest links only.
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

/* ── layout ───────────────────────────────────────────────────────── */

function layout(topics, activeCats) {
  const groups = new Map();
  for (const t of topics) (groups.get(t.category) || groups.set(t.category, []).get(t.category)).push(t);

  const cats = [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .filter(([c]) => !activeCats.size || activeCats.has(c));

  // Big clusters get more of the circle, so the middle of the canvas stays
  // walkable instead of turning into a knot.
  // Every category gets a floor on its slice, otherwise the eight small ones
  // pile into a few degrees and their labels sit on top of each other.
  const FLOOR = 9;
  const weight = l => l.length + FLOOR;
  const total = cats.reduce((s, [, v]) => s + weight(v), 0) || 1;
  const pos = new Map();
  const hubs = [];
  let angle = -Math.PI / 2;

  for (const [cat, list] of cats) {
    const share = weight(list) / total;
    const span = share * Math.PI * 2;
    const mid = angle + span / 2;
    const hubR = 258 + Math.min(1, 0.25 + (list.length / 60)) * 160;
    const hx = CX + hubR * 1.32 * Math.cos(mid);
    const hy = CY + hubR * Math.sin(mid);
    hubs.push({ cat, x: hx, y: hy, n: list.length });

    // Inside a cluster: importance first, spiralling out from the hub on the
    // golden angle, which packs evenly without looking like a grid.
    const sorted = list.slice().sort((a, b) => (b.importance - a.importance) || a.rank - b.rank);
    const step = 2.399963;
    sorted.forEach((t, i) => {
      const r = 16 * Math.sqrt(i + 0.6);
      const a = i * step + mid;
      pos.set(t.id, { x: hx + r * 1.28 * Math.cos(a), y: hy + r * Math.sin(a), t, cat });
    });

    angle += span;
  }
  return { pos, hubs };
}

/* ── view ─────────────────────────────────────────────────────────── */

export async function viewUltraMap(el) {
  const m = await getManifest();
  const topics = m.topics.map(t => ({ ...t, refs: t.refs || [] }));
  const cats = [...new Set(topics.map(t => t.category))].sort();

  const state = { cats: new Set(), mode: 'all', sel: null, scale: 1, tx: 0, ty: 0 };

  el.innerHTML = `
  <div class="page-head">
    <h1>Ultra map</h1>
    <p class="sub">Every topic in the corpus, clustered by subject. A line means two topics share real ground — the same treaty, the same court, the same country — taken from their tags and from the cross-references inside their own connection maps. Rose lines cross between static GK and current affairs, which is the crossing the exam lives on.</p>
  </div>

  <div class="ultra-bar">
    <div class="seg" data-mode>
      <button data-v="all" class="on">Every link</button>
      <button data-v="cross">Static ↔ current</button>
      <button data-v="static">Static only</button>
      <button data-v="current">Current only</button>
    </div>
    <span class="ultra-count" data-count></span>
    <div class="ultra-tools">
      <button class="mini" data-z="-1">&minus;</button>
      <button class="mini" data-z="0">Reset</button>
      <button class="mini" data-z="1">+</button>
    </div>
  </div>

  <div class="pick ultra-cats" data-cats>
    ${cats.map(c => `<button data-v="${esc(c)}">${esc(c)}</button>`).join('')}
  </div>

  <div class="ultrawrap">
    <div class="map-stage ultra-stage" data-stage></div>
    <div class="ultra-card" data-card></div>
    <div class="ultra-key">
      <span><i class="dot cur"></i>Current affairs</span>
      <span><i class="dot sta"></i>Static GK</span>
      <span><i class="ln cross"></i>Crosses between them</span>
      <span><i class="ln same"></i>Within one side</span>
    </div>
  </div>
  <p style="font-size:12.5px;color:var(--faint);margin-top:10px">Dot size is exam weight. A ring means you have marked it read. Click a dot to see what it connects to. Drag to pan, ctrl-scroll to zoom.</p>`;

  const stage = el.querySelector('[data-stage]');
  const card = el.querySelector('[data-card]');
  const count = el.querySelector('[data-count]');

  const visible = () => topics.filter(t => {
    if (state.cats.size && !state.cats.has(t.category)) return false;
    if (state.mode === 'static' && t.kind !== 'static') return false;
    if (state.mode === 'current' && t.kind !== 'current') return false;
    return true;
  });

  const apply = () => {
    const cam = stage.querySelector('[data-cam]');
    if (cam) cam.setAttribute('transform', `translate(${state.tx.toFixed(1)} ${state.ty.toFixed(1)}) scale(${state.scale})`);
  };

  function draw() {
    const list = visible();
    const ids = new Set(list.map(t => t.id));
    let edges = buildGraph(list).filter(e => ids.has(e.a) && ids.has(e.b));
    if (state.mode === 'cross') edges = edges.filter(e => e.cross);

    const { pos, hubs } = layout(list, state.cats);

    const lines = edges.map(e => {
      const A = pos.get(e.a), B = pos.get(e.b);
      if (!A || !B) return '';
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      const cx = mx + (CY - my) * 0.16, cy = my + (mx - CX) * 0.16;
      return `<path class="ul-edge${e.cross ? ' cross' : ''}" data-a="${esc(e.a)}" data-b="${esc(e.b)}" d="M${A.x.toFixed(1)} ${A.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${B.x.toFixed(1)} ${B.y.toFixed(1)}" style="stroke-width:${(0.35 + e.w * 0.6).toFixed(2)}"/>`;
    }).join('');

    const hubMarks = hubs.map(h =>
      `<text class="ul-hub" x="${h.x.toFixed(1)}" y="${(h.y - 20 - Math.sqrt(h.n) * 9).toFixed(1)}" text-anchor="middle">${esc(h.cat)}<tspan class="ul-hub-n" dx="6">${h.n}</tspan></text>`
    ).join('');

    const dots = [...pos.values()].map(({ x, y, t }) => {
      const r = 2.6 + (t.importance || 3) * 1.15;
      return `<g class="ul-node ${t.kind}${isDone(t.id) ? ' read' : ''}" data-id="${esc(t.id)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <circle class="hit" r="${(r + 7).toFixed(1)}"/>
        <circle class="ring" r="${(r + 3.2).toFixed(1)}"/>
        <circle class="core" r="${r.toFixed(1)}"/>
      </g>`;
    }).join('');

    stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Map of every topic and the links between them">
      <g data-cam><g class="ul-edges">${lines}</g>${hubMarks}<g class="ul-nodes">${dots}</g></g>
    </svg>`;
    count.textContent = `${list.length} topics · ${edges.length} links`;
    wire(edges);
    apply();
  }

  function wire(edges) {
    const nbr = new Map();
    for (const e of edges) {
      (nbr.get(e.a) || nbr.set(e.a, []).get(e.a)).push(e.b);
      (nbr.get(e.b) || nbr.set(e.b, []).get(e.b)).push(e.a);
    }

    const focus = id => {
      stage.querySelectorAll('.hi').forEach(n => n.classList.remove('hi'));
      if (!id) { stage.classList.remove('focus'); return; }
      stage.classList.add('focus');
      for (const nid of new Set([id, ...(nbr.get(id) || [])]))
        stage.querySelector(`.ul-node[data-id="${CSS.escape(nid)}"]`)?.classList.add('hi');
      stage.querySelectorAll('.ul-edge').forEach(p => {
        if (p.dataset.a === id || p.dataset.b === id) p.classList.add('hi');
      });
    };

    const show = id => {
      const t = topics.find(x => x.id === id);
      if (!t) return;
      const links = (nbr.get(id) || []).map(x => topics.find(y => y.id === x)).filter(Boolean)
        .sort((a, b) => b.importance - a.importance).slice(0, 7);
      const sec = m.sections.find(s => s.id === t.section);
      card.innerHTML = `
        <button class="x" data-close aria-label="Close">&times;</button>
        <div class="k">${esc(sec ? sec.label : '')} · ${esc(t.category || '')}</div>
        <h5>${esc(t.title)}</h5>
        <p>${esc(t.hook || '')}</p>
        <div style="margin:9px 0 2px">${meter(t.importance || 3)}</div>
        ${links.length ? `<div class="ul-links"><b>Connects to</b>${links.map(l =>
          `<a href="#/topic/${encodeURIComponent(l.id)}"><i class="${l.kind}"></i>${esc(l.title)}</a>`).join('')}</div>` : ''}
        <a class="btn sm primary" style="margin-top:10px" href="#/topic/${encodeURIComponent(t.id)}">Open topic</a>`;
      card.classList.add('on');
      card.querySelector('[data-close]').addEventListener('click', () => {
        card.classList.remove('on');
        state.sel = null;
        stage.querySelectorAll('.sel').forEach(n => n.classList.remove('sel'));
        focus(null);
      });
      stage.querySelectorAll('.sel').forEach(n => n.classList.remove('sel'));
      stage.querySelector(`.ul-node[data-id="${CSS.escape(id)}"]`)?.classList.add('sel');
    };

    stage.onpointerover = e => {
      const g = e.target.closest('.ul-node');
      if (g && !state.sel) focus(g.dataset.id);
    };
    stage.onpointerleave = () => { if (!state.sel) focus(null); };

    let drag = null;
    stage.onpointerdown = e => {
      if (e.target.closest('.ultra-card')) return;
      const g = e.target.closest('.ul-node');
      drag = { x: e.clientX, y: e.clientY, tx: state.tx, ty: state.ty, id: g ? g.dataset.id : null, moved: false };
    };
    stage.onpointermove = e => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved) {
        if (dx * dx + dy * dy < 16) return;
        drag.moved = true;
        stage.classList.add('drag');
        try { stage.setPointerCapture(e.pointerId); } catch {}
      }
      const k = (W / stage.clientWidth) || 1;
      state.tx = Math.max(-W, Math.min(W, drag.tx + dx * k));
      state.ty = Math.max(-H, Math.min(H, drag.ty + dy * k));
      apply();
    };
    const end = e => {
      if (drag && !drag.moved) {
        if (drag.id) { state.sel = drag.id; focus(drag.id); show(drag.id); }
        else { state.sel = null; focus(null); card.classList.remove('on'); }
      }
      drag = null;
      stage.classList.remove('drag');
      if (e) { try { stage.releasePointerCapture(e.pointerId); } catch {} }
    };
    stage.onpointerup = end;
    stage.onpointercancel = end;
    stage.onwheel = e => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      state.scale = Math.min(4, Math.max(0.5, state.scale * (e.deltaY > 0 ? 0.9 : 1.1)));
      apply();
    };
  }

  el.querySelector('[data-mode]').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    state.mode = b.dataset.v;
    state.sel = null; card.classList.remove('on');
    el.querySelectorAll('[data-mode] button').forEach(x => x.classList.toggle('on', x === b));
    draw();
  });

  el.querySelector('[data-cats]').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const c = b.dataset.v;
    if (state.cats.has(c)) state.cats.delete(c); else state.cats.add(c);
    b.classList.toggle('on', state.cats.has(c));
    state.sel = null; card.classList.remove('on');
    draw();
  });

  el.querySelectorAll('[data-z]').forEach(b => b.addEventListener('click', () => {
    const z = +b.dataset.z;
    if (z === 0) { state.scale = 1; state.tx = 0; state.ty = 0; }
    else state.scale = Math.min(4, Math.max(0.5, state.scale * (z > 0 ? 1.25 : 0.8)));
    apply();
  }));

  draw();
}
