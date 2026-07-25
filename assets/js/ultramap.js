// Ultra Map. Progressive Reveal Engine.
// Hubs are displayed cleanly on initial view. Clicking a hub expands its topic nodes.

import { getManifest, getSection } from './data.js';
import { esc, meter } from './ui.js';

const W = 2000, H = 1300, CX = 1000, CY = 650;

export async function viewUltraMap(el) {
  el.innerHTML = `
  <div class="page-head">
    <h1>Ultra Map</h1>
    <p class="sub">Click any section hub to expand its topic constellation and explore connections across static GK and current affairs.</p>
  </div>
  <div class="skel" style="height:600px;border-radius:12px"></div>`;

  const m = await getManifest();

  // Load all sections
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

  // Extract explicit cross-links (topicRef)
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

  // Layout cluster hubs and topic nodes
  const { hubs, nodes } = layoutClusters(m.sections, allTopics);

  drawUltraMap(el, m, hubs, nodes, edges, topicMap);
}

function layoutClusters(sections, topics) {
  const staticSecs = sections.filter(s => s.kind === 'static');
  const currentSecs = sections.filter(s => s.kind === 'current');

  const hubs = [];
  const nodes = [];

  // Inner circle of static hubs
  const R_static = 300;
  staticSecs.forEach((s, i) => {
    const angle = (i / Math.max(1, staticSecs.length)) * Math.PI * 2 - Math.PI / 2;
    const hx = CX + R_static * Math.cos(angle) * 1.3;
    const hy = CY + R_static * Math.sin(angle);
    hubs.push({ id: s.id, label: s.label, kind: 'static', x: hx, y: hy, count: s.topicCount });

    const secTopics = topics.filter(t => t.sectionId === s.id);
    const subRadius = 130;
    secTopics.forEach((t, j) => {
      const tAngle = angle + ((j - secTopics.length / 2) / Math.max(1, secTopics.length)) * 0.95;
      const dist = subRadius + (t.rank % 3) * 28;
      nodes.push({
        ...t,
        x: hx + dist * Math.cos(tAngle),
        y: hy + dist * Math.sin(tAngle),
        hubX: hx,
        hubY: hy,
        hubId: s.id
      });
    });
  });

  // Outer circle of current hubs
  const R_current = 580;
  currentSecs.forEach((s, i) => {
    const angle = (i / Math.max(1, currentSecs.length)) * Math.PI * 2 - Math.PI / 2;
    const hx = CX + R_current * Math.cos(angle) * 1.35;
    const hy = CY + R_current * Math.sin(angle);
    hubs.push({ id: s.id, label: s.label, kind: 'current', x: hx, y: hy, count: s.topicCount });

    const secTopics = topics.filter(t => t.sectionId === s.id);
    const subRadius = 150;
    secTopics.forEach((t, j) => {
      const tAngle = angle + ((j - secTopics.length / 2) / Math.max(1, secTopics.length)) * 0.85;
      const dist = subRadius + (t.rank % 4) * 32;
      nodes.push({
        ...t,
        x: hx + dist * Math.cos(tAngle),
        y: hy + dist * Math.sin(tAngle),
        hubX: hx,
        hubY: hy,
        hubId: s.id
      });
    });
  });

  return { hubs, nodes };
}

function drawUltraMap(el, m, hubs, nodes, edges, topicMap) {
  const nodeById = new Map(nodes.map(n => [n.id, n]));
  const hubById = new Map(hubs.map(h => [h.id, h]));
  const categories = m.categories || [];

  const svgContent = buildSvg(hubs, nodes, edges, nodeById, hubById);

  el.innerHTML = `
  <div class="page-head" style="margin-bottom:14px">
    <h1>Ultra Map</h1>
    <p class="sub">Progressive Reveal: Click any section hub to expand its topics. Click a topic for facts & cross-links.</p>
  </div>

  <div class="mapwrap" data-ultramap style="height: 700px">
    <div class="map-bar">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input class="input" style="width:190px;padding:4px 10px;font-size:13px" placeholder="Filter title or tag…" data-um-search>
        <select class="input" style="width:160px;padding:4px 8px;font-size:12.5px" data-um-sec>
          <option value="">Select Section Hub</option>
          ${hubs.map(h => `<option value="${esc(h.id)}">${esc(h.label)} (${h.count})</option>`).join('')}
        </select>
        <button class="btn sm" data-um-toggle-all>Expand All</button>
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

  wireUltraMap(el, hubs, nodes, edges, nodeById, hubById, topicMap);
}

function buildSvg(hubs, nodes, edges, nodeById, hubById) {
  // Spoke lines
  const spokeLines = [];
  for (const n of nodes) {
    const h = hubById.get(n.hubId);
    if (!h) continue;
    spokeLines.push(`<line class="mp-spoke" data-spoke-hub="${esc(h.id)}" data-spoke-node="${esc(n.id)}" x1="${h.x.toFixed(1)}" y1="${h.y.toFixed(1)}" x2="${n.x.toFixed(1)}" y2="${n.y.toFixed(1)}" opacity="0"/>`);
  }

  // Cross-link edges
  const edgeLines = [];
  for (const e of edges) {
    const s = nodeById.get(e.source), t = nodeById.get(e.target);
    if (!s || !t) continue;
    edgeLines.push(`<line class="mp-edge t1" data-edge-s="${esc(s.id)}" data-edge-t="${esc(t.id)}" x1="${s.x.toFixed(1)}" y1="${s.y.toFixed(1)}" x2="${t.x.toFixed(1)}" y2="${t.y.toFixed(1)}" stroke-dasharray="3 3" opacity="0"/>`);
  }

  // Section Hub Marks
  const hubMarks = [];
  for (const h of hubs) {
    const isStatic = h.kind === 'static';
    const r = 24;
    hubMarks.push(
      `<g class="mp-hub ${isStatic ? 'static-hub' : 'current-hub'}" data-hub="${esc(h.id)}" transform="translate(${h.x.toFixed(1)} ${h.y.toFixed(1)})">` +
      `<circle class="hit" r="${r + 10}"/>` +
      `<circle class="hub-bg" r="${r}" fill="${isStatic ? 'var(--brand)' : 'var(--ink)'}"/>` +
      `<text x="0" y="-2" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">${h.count}</text>` +
      `<text class="hub-state" x="0" y="10" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-size="10" font-weight="600">+</text>` +
      `<text x="0" y="${r + 16}" text-anchor="middle" font-size="13" font-weight="650" fill="var(--ink)">${esc(h.label)}</text>` +
      `</g>`
    );
  }

  // Topic Node Marks (Collapsed at hub center initially)
  const nodeMarks = [];
  for (const n of nodes) {
    const isStatic = n.kind === 'static';
    const isTop = (n.rank || 99) <= 3 || n.depth === 'deep';
    const r = isStatic ? (isTop ? 6.5 : 4.5) : (isTop ? 6 : 4);
    const right = n.x >= CX;
    const dx = right ? r + 6 : -(r + 6);
    const anchor = right ? 'start' : 'end';
    const shortLabel = n.title.length > 26 ? n.title.slice(0, 24) + '…' : n.title;

    nodeMarks.push(
      `<g class="mp-node ${isTop ? 't1' : 't2'} collapsed" data-node="${esc(n.id)}" data-hub="${esc(n.hubId)}" data-cat="${esc(n.category || '')}" tabindex="0" transform="translate(${n.hubX.toFixed(1)} ${n.hubY.toFixed(1)})" opacity="0">` +
      `<circle class="hit" r="${Math.max(14, r + 8)}"/>` +
      `<circle r="${r.toFixed(1)}" fill="${isStatic ? 'var(--brand)' : 'var(--muted)'}"/>` +
      `<text class="node-lbl" x="${dx}" y="3" text-anchor="${anchor}" font-size="11.5" fill="var(--ink-2)" opacity="0.9">${esc(shortLabel)}</text>` +
      `</g>`
    );
  }

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
    <g data-cam>
      <!-- Concentric guide rings -->
      <circle cx="${CX}" cy="${CY}" r="300" fill="none" stroke="var(--line-soft)" stroke-dasharray="6 6" opacity="0.4"/>
      <circle cx="${CX}" cy="${CY}" r="580" fill="none" stroke="var(--line-soft)" stroke-dasharray="4 4" opacity="0.3"/>
      
      <g data-spokes>${spokeLines.join('')}</g>
      <g data-edges>${edgeLines.join('')}</g>
      <g data-nodes>${nodeMarks.join('')}</g>
      <g data-hubs>${hubMarks.join('')}</g>
    </g>
  </svg>`;
}

function wireUltraMap(scope, hubs, nodes, edges, nodeById, hubById, topicMap) {
  const wrap = scope.querySelector('[data-ultramap]');
  if (!wrap) return;
  const stage = wrap.querySelector('[data-stage]');
  const cam = wrap.querySelector('[data-cam]');
  const detail = wrap.querySelector('[data-detail]');
  const body = wrap.querySelector('[data-detail-body]');
  const inputSearch = wrap.querySelector('[data-um-search]');
  const selectSec = wrap.querySelector('[data-um-sec]');
  const btnToggleAll = wrap.querySelector('[data-um-toggle-all]');

  const expandedHubs = new Set();

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
    const g = e.target.closest('[data-node]') || e.target.closest('[data-hub]');
    drag = {
      x: e.clientX, y: e.clientY, tx, ty,
      node: g ? g.dataset.node : null,
      hub: g ? g.dataset.hub : null,
      moved: false
    };
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
    if (drag && !drag.moved) {
      if (drag.node) selectNode(drag.node);
      else if (drag.hub) toggleHub(drag.hub);
    }
    drag = null;
    stage.classList.remove('drag');
    if (e) { try { stage.releasePointerCapture(e.pointerId); } catch {} }
  };
  stage.addEventListener('pointerup', endDrag);

  function toggleHub(hubId) {
    if (expandedHubs.has(hubId)) expandedHubs.delete(hubId);
    else expandedHubs.add(hubId);
    updateVisibility();

    const h = hubById.get(hubId);
    if (h && expandedHubs.has(hubId)) {
      body.innerHTML = `
        <div class="k">${esc(h.kind === 'static' ? 'Static Section' : 'Current Affairs Month')}</div>
        <h5>${esc(h.label)}</h5>
        <p style="margin-top:6px;font-size:13px;color:var(--muted)">Revealed ${h.count} topics. Click any topic dot for facts.</p>
        <div style="margin-top:14px">
          <a class="btn primary sm" href="#/s/${encodeURIComponent(h.id)}">Open section page &rarr;</a>
        </div>`;
      detail.classList.add('on');
    }
  }

  let allExpanded = false;
  btnToggleAll.addEventListener('click', () => {
    allExpanded = !allExpanded;
    btnToggleAll.textContent = allExpanded ? 'Collapse All' : 'Expand All';
    if (allExpanded) {
      hubs.forEach(h => expandedHubs.add(h.id));
    } else {
      expandedHubs.clear();
    }
    updateVisibility();
  });

  function updateVisibility() {
    const q = inputSearch.value.trim().toLowerCase();

    // 1. Update Hub Icons & Opacity
    stage.querySelectorAll('[data-hub]').forEach(hG => {
      const hid = hG.dataset.hub;
      const isOpen = expandedHubs.has(hid);
      const stateTxt = hG.querySelector('.hub-state');
      if (stateTxt) stateTxt.textContent = isOpen ? '−' : '+';
      hG.classList.toggle('expanded', isOpen);
    });

    // 2. Animate Node Positions & Opacity
    stage.querySelectorAll('[data-node]').forEach(g => {
      const id = g.dataset.node;
      const n = nodeById.get(id);
      if (!n) return;

      const isOpen = expandedHubs.has(n.hubId) || (q && (n.title.toLowerCase().includes(q) || (n.tags || []).some(t => t.toLowerCase().includes(q))));

      if (isOpen) {
        g.setAttribute('transform', `translate(${n.x.toFixed(1)}, ${n.y.toFixed(1)})`);
        g.style.opacity = '1';
        g.style.pointerEvents = 'auto';
      } else {
        g.setAttribute('transform', `translate(${n.hubX.toFixed(1)}, ${n.hubY.toFixed(1)})`);
        g.style.opacity = '0';
        g.style.pointerEvents = 'none';
      }
    });

    // 3. Update Spokes
    stage.querySelectorAll('[data-spoke-hub]').forEach(line => {
      const hid = line.dataset.spokeHub;
      const isOpen = expandedHubs.has(hid);
      line.style.opacity = isOpen ? '0.35' : '0';
    });

    // 4. Update Cross-link Edges
    stage.querySelectorAll('[data-edge-s]').forEach(line => {
      const sId = line.dataset.edgeS, tId = line.dataset.edgeT;
      const sNode = nodeById.get(sId), tNode = nodeById.get(tId);
      if (!sNode || !tNode) return;
      const sOpen = expandedHubs.has(sNode.hubId);
      const tOpen = expandedHubs.has(tNode.hubId);
      line.style.opacity = (sOpen && tOpen) ? '0.7' : '0';
    });
  }

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
      <div style="margin-top:10px;font-size:12px;color:var(--faint)">Section: ${esc(n.sectionLabel || n.sectionId)} (Rank #${n.rank})</div>
      ${n.importance ? `<div style="margin-top:6px;font-size:12px">Exam weight ${meter(n.importance)}</div>` : ''}

      ${neighbors.length ? `<div style="margin-top:14px">
        <h6 style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--muted)">Cross-linked Topics (${neighbors.length})</h6>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${neighbors.map(nb => `<a href="#/topic/${encodeURIComponent(nb.id)}" style="font-size:12.5px;color:var(--brand);display:block;line-height:1.3">· ${esc(nb.title)} (${esc(nb.sectionLabel)})</a>`).join('')}
        </div>
      </div>` : ''}

      <div style="margin-top:16px">
        <a class="btn primary sm" href="#/topic/${encodeURIComponent(n.id)}">Open topic page &rarr;</a>
      </div>`;

    detail.classList.add('on');
  }

  selectSec.addEventListener('change', e => {
    const hid = e.target.value;
    if (hid) {
      expandedHubs.add(hid);
      updateVisibility();
      selectHub(hid);
    }
  });

  inputSearch.addEventListener('input', () => updateVisibility());

  wrap.querySelector('[data-close]').addEventListener('click', () => {
    detail.classList.remove('on');
    stage.querySelectorAll('.sel').forEach(el => el.classList.remove('sel'));
  });

  updateVisibility();
}
