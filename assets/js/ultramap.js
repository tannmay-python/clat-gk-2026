// Ultra Map. Consolidates all current & static topics into a unified graph.
// Visualises how current affairs topics link to static GK hooks and how static topics interlink.

import { getManifest, getSection } from './data.js';
import { esc, meter, highlight } from './ui.js';

const W = 1600, H = 1100, CX = 800, CY = 550;

export async function viewUltraMap(el) {
  el.innerHTML = `
  <div class="page-head">
    <h1>Ultra Map</h1>
    <p class="sub">The entire corpus connected in one view. See how news events link to constitutional articles, historical precedents, treaties, and static GK topics.</p>
  </div>
  <div class="skel" style="height:550px;border-radius:12px"></div>`;

  const m = await getManifest();

  // Load all sections into memory to build full edge connectivity
  const allSections = await Promise.all(m.sections.map(s => getSection(s.id)));
  const topicMap = new Map();
  const allTopics = [];

  for (const s of allSections) {
    if (!s || !s.topics) continue;
    for (const t of s.topics) {
      const item = { ...t, sectionId: s.id, sectionLabel: s.label, kind: s.kind };
      topicMap.set(t.id, item);
      allTopics.push(item);
    }
  }

  // Extract edges: topicRef, staticRef, and tag-based linkages
  const edges = [];
  const edgeSet = new Set();

  for (const t of allTopics) {
    if (t.map && t.map.nodes) {
      for (const n of t.map.nodes) {
        if (n.topicRef && topicMap.has(n.topicRef)) {
          const key = [t.id, n.topicRef].sort().join('<->');
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push({ source: t.id, target: n.topicRef, rel: n.rel || 'connected', type: 'explicit' });
          }
        }
      }
    }
  }

  // Also build implicit tag edges if topics share 2+ tags
  for (let i = 0; i < allTopics.length; i++) {
    for (let j = i + 1; j < allTopics.length; j++) {
      const t1 = allTopics[i], t2 = allTopics[j];
      if (t1.kind !== t2.kind && t1.tags && t2.tags) {
        const shared = t1.tags.filter(tag => t2.tags.includes(tag));
        if (shared.length >= 2) {
          const key = [t1.id, t2.id].sort().join('<->');
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push({ source: t1.id, target: t2.id, rel: shared.join(', '), type: 'tag' });
          }
        }
      }
    }
  }

  // Layout positions: Group by static vs current, distributed in circular sectors
  const nodes = layoutGraph(allTopics, edges);

  drawUltraMap(el, m, nodes, edges, topicMap);
}

function layoutGraph(topics, edges) {
  const statics = topics.filter(t => t.kind === 'static');
  const currents = topics.filter(t => t.kind === 'current');

  const nodes = [];

  // Inner orbit: Static GK sections
  const staticRadius = 260;
  statics.forEach((t, i) => {
    const angle = (i / Math.max(1, statics.length)) * Math.PI * 2 - Math.PI / 2;
    // add small spread jitter based on index
    const r = staticRadius + (i % 3) * 35;
    nodes.push({
      ...t,
      x: CX + r * Math.cos(angle) * 1.35,
      y: CY + r * Math.sin(angle),
      angle,
      orbit: 'inner'
    });
  });

  // Outer orbit: Current affairs topics grouped by month
  const currentRadius = 460;
  const months = [...new Set(currents.map(t => t.sectionId))].sort();
  currents.forEach((t) => {
    const mIdx = months.indexOf(t.sectionId);
    const mCount = months.length;
    const baseAngle = (mIdx / mCount) * Math.PI * 2 - Math.PI / 2;
    const sameMonth = currents.filter(x => x.sectionId === t.sectionId);
    const inMonthIdx = sameMonth.findIndex(x => x.id === t.id);
    const monthSpan = (Math.PI * 2 / mCount) * 0.85;
    const angle = baseAngle - monthSpan / 2 + (inMonthIdx / Math.max(1, sameMonth.length)) * monthSpan;

    const r = currentRadius + (t.rank % 4) * 30;
    nodes.push({
      ...t,
      x: CX + r * Math.cos(angle) * 1.35,
      y: CY + r * Math.sin(angle),
      angle,
      orbit: 'outer'
    });
  });

  return nodes;
}

function drawUltraMap(el, m, nodes, edges, topicMap) {
  const nodeById = new Map(nodes.map(n => [n.id, n]));
  const categories = m.categories || [];
  const sections = m.sections || [];

  const svgContent = buildSvg(nodes, edges, nodeById);

  el.innerHTML = `
  <div class="page-head" style="margin-bottom:14px">
    <h1>Ultra Map</h1>
    <p class="sub">The global neural map connecting <b>${nodes.length}</b> topics and <b>${edges.length}</b> cross-references across static GK and current affairs.</p>
  </div>

  <div class="mapwrap" data-ultramap style="height: 680px">
    <div class="map-bar">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input class="input" style="width:200px;padding:4px 10px;font-size:13px" placeholder="Filter node title or tag…" data-um-search>
        <select class="input" style="width:160px;padding:4px 8px;font-size:12.5px" data-um-cat>
          <option value="">All Categories</option>
          ${categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
        </select>
        <select class="input" style="width:140px;padding:4px 8px;font-size:12.5px" data-um-kind>
          <option value="">All Types</option>
          <option value="static">Static GK Only</option>
          <option value="current">Current Affairs Only</option>
        </select>
      </div>
      <div class="map-tools">
        <button data-z="-1" title="Zoom out">&minus;</button>
        <button data-z="0" title="Reset view">&#9678;</button>
        <button data-z="1" title="Zoom in">+</button>
        <button data-full title="Expand">&#9974;</button>
      </div>
    </div>
    <div class="map-stage" data-stage>
      ${svgContent}
      <div class="map-detail" data-detail>
        <button class="x" data-close aria-label="Close">&times;</button>
        <div data-detail-body></div>
      </div>
    </div>
  </div>`;

  wireUltraMap(el, nodes, edges, nodeById, topicMap);
}

function buildSvg(nodes, edges, nodeById) {
  const edgeLines = [];
  for (const e of edges) {
    const s = nodeById.get(e.source), t = nodeById.get(e.target);
    if (!s || !t) continue;
    edgeLines.push(`<line class="mp-edge ${e.type === 'explicit' ? 't1' : 't3'}" data-edge-s="${esc(s.id)}" data-edge-t="${esc(t.id)}" x1="${s.x.toFixed(1)}" y1="${s.y.toFixed(1)}" x2="${t.x.toFixed(1)}" y2="${t.y.toFixed(1)}"/>`);
  }

  const nodeMarks = [];
  for (const n of nodes) {
    const isStatic = n.kind === 'static';
    const r = isStatic ? 7.5 : Math.max(3.8, 8 - (n.rank || 1) * 0.15);
    const cls = isStatic ? 'mp-node t1' : n.depth === 'deep' ? 'mp-node t1' : 'mp-node t2';
    const right = n.x >= CX;
    const dx = right ? r + 6 : -(r + 6);
    const anchor = right ? 'start' : 'end';
    const shortLabel = n.title.length > 28 ? n.title.slice(0, 26) + '…' : n.title;

    nodeMarks.push(
      `<g class="${cls}" data-node="${esc(n.id)}" data-cat="${esc(n.category || '')}" data-kind="${esc(n.kind)}" tabindex="0" transform="translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})">` +
      `<circle class="hit" r="${Math.max(14, r + 8)}"/>` +
      `<circle r="${r.toFixed(1)}" fill="${isStatic ? 'var(--brand)' : 'var(--ink)'}"/>` +
      `<text x="${dx}" y="3" text-anchor="${anchor}">${esc(shortLabel)}</text>` +
      `</g>`
    );
  }

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
    <g data-cam>
      <!-- Central static ring indicator -->
      <circle cx="${CX}" cy="${CY}" r="270" fill="none" stroke="var(--line-soft)" stroke-dasharray="6 6" opacity="0.6"/>
      <circle cx="${CX}" cy="${CY}" r="470" fill="none" stroke="var(--line-soft)" stroke-dasharray="4 4" opacity="0.4"/>
      <g data-edges>${edgeLines.join('')}</g>
      <g data-nodes>${nodeMarks.join('')}</g>
    </g>
  </svg>`;
}

function wireUltraMap(scope, nodes, edges, nodeById, topicMap) {
  const wrap = scope.querySelector('[data-ultramap]');
  if (!wrap) return;
  const stage = wrap.querySelector('[data-stage]');
  const cam = wrap.querySelector('[data-cam]');
  const detail = wrap.querySelector('[data-detail]');
  const body = wrap.querySelector('[data-detail-body]');
  const inputSearch = wrap.querySelector('[data-um-search]');
  const selectCat = wrap.querySelector('[data-um-cat]');
  const selectKind = wrap.querySelector('[data-um-kind]');

  let scale = 1, tx = 0, ty = 0;
  const apply = () => {
    cam.setAttribute('transform', `translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${scale})`);
  };

  wrap.querySelectorAll('[data-z]').forEach(b => b.addEventListener('click', () => {
    const z = +b.dataset.z;
    if (z === 0) { scale = 1; tx = 0; ty = 0; }
    else scale = Math.min(3.5, Math.max(0.4, scale * (z > 0 ? 1.3 : 0.75)));
    apply();
  }));

  wrap.querySelector('[data-full]').addEventListener('click', () => {
    wrap.classList.toggle('full');
    document.body.style.overflow = wrap.classList.contains('full') ? 'hidden' : '';
  });

  stage.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    scale = Math.min(3.5, Math.max(0.4, scale * (e.deltaY > 0 ? 0.92 : 1.08)));
    apply();
  }, { passive: false });

  // Pan interaction
  let drag = null;
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('.map-detail') || e.target.closest('.map-tools')) return;
    const g = e.target.closest('[data-node]');
    drag = { x: e.clientX, y: e.clientY, tx, ty, node: g ? g.dataset.node : null, moved: false };
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
    tx = drag.tx + dx * k;
    ty = drag.ty + dy * k;
    apply();
  });

  const endDrag = e => {
    if (drag && !drag.moved && drag.node) selectNode(drag.node);
    drag = null;
    stage.classList.remove('drag');
    if (e) { try { stage.releasePointerCapture(e.pointerId); } catch {} }
  };
  stage.addEventListener('pointerup', endDrag);

  function selectNode(id) {
    stage.querySelectorAll('.sel').forEach(el => el.classList.remove('sel'));
    const n = nodeById.get(id);
    if (!n) return;
    const nodeEl = stage.querySelector(`[data-node="${CSS.escape(id)}"]`);
    if (nodeEl) nodeEl.classList.add('sel');

    const connectedEdges = edges.filter(e => e.source === id || e.target === id);
    const neighborIds = connectedEdges.map(e => e.source === id ? e.target : e.source);
    const neighbors = neighborIds.map(nid => nodeById.get(nid)).filter(Boolean);

    body.innerHTML = `
      <div class="k">${esc(n.kind === 'static' ? 'Static GK' : 'Current Affairs')} · ${esc(n.category || 'Topic')}</div>
      <h5>${esc(n.title)}</h5>
      <p style="margin-top:6px;font-size:13px;line-height:1.4">${esc(n.hook || '')}</p>
      <div style="margin-top:10px;font-size:12px;color:var(--faint)">Section: ${esc(n.sectionLabel || n.sectionId)}</div>
      ${n.importance ? `<div style="margin-top:6px;font-size:12px">Exam weight ${meter(n.importance)}</div>` : ''}

      ${neighbors.length ? `<div style="margin-top:14px">
        <h6 style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--muted)">Connected Topics (${neighbors.length})</h6>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${neighbors.map(nb => `<a href="#/topic/${encodeURIComponent(nb.id)}" style="font-size:12.5px;color:var(--brand);display:block;line-height:1.3">· ${esc(nb.title)}</a>`).join('')}
        </div>
      </div>` : ''}

      <div style="margin-top:16px">
        <a class="btn primary sm" href="#/topic/${encodeURIComponent(n.id)}">Open topic page &rarr;</a>
      </div>`;

    detail.classList.add('on');
  }

  // Filter handler
  const filterNodes = () => {
    const q = inputSearch.value.trim().toLowerCase();
    const cat = selectCat.value;
    const kind = selectKind.value;

    stage.querySelectorAll('[data-node]').forEach(g => {
      const id = g.dataset.node;
      const n = nodeById.get(id);
      if (!n) return;
      let ok = true;
      if (cat && n.category !== cat) ok = false;
      if (kind && n.kind !== kind) ok = false;
      if (q && !n.title.toLowerCase().includes(q) && !(n.tags || []).some(t => t.toLowerCase().includes(q))) ok = false;

      g.style.opacity = ok ? '1' : '0.12';
      g.style.pointerEvents = ok ? 'auto' : 'none';
    });
  };

  inputSearch.addEventListener('input', filterNodes);
  selectCat.addEventListener('change', filterNodes);
  selectKind.addEventListener('change', filterNodes);

  wrap.querySelector('[data-close]').addEventListener('click', () => {
    detail.classList.remove('on');
    stage.querySelectorAll('.sel').forEach(el => el.classList.remove('sel'));
  });
}
