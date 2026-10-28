// js/mindmap.js — BAC STORY Inline Mindmap Component
// Renders a simple SVG tree from JSON data
'use strict';

window.Mindmap = (() => {

  function parseMap(raw) {
    const decoded = (raw || '')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    try {
      return JSON.parse(decoded);
    } catch {
      // Fallback: build a flat tree from plain text
      const lines = decoded.trim().split('\n').filter(l => l.trim());
      if (!lines.length) return null;
      return {
        label: lines[0].trim().replace(/^#+\s*/, ''),
        children: lines.slice(1).map(l => ({
          label: l.trim().replace(/^[-*•#]+\s*/, ''),
        })),
      };
    }
  }

  function init(container, rawData) {
    const data = parseMap(rawData);
    if (!data) { container.style.display = 'none'; return; }

    const wrap = document.createElement('div');
    wrap.className = 'mindmap-container';

    wrap.innerHTML = `
      <div class="mindmap-header">
        <div class="mindmap-header-label"><span>🧠</span> خريطة ذهنية</div>
        <div class="mindmap-controls">
          <button class="mindmap-ctrl-btn" id="mm-zoom-in" title="تكبير"><i class="fas fa-search-plus"></i></button>
          <button class="mindmap-ctrl-btn" id="mm-zoom-out" title="تصغير"><i class="fas fa-search-minus"></i></button>
          <button class="mindmap-ctrl-btn" id="mm-reset" title="إعادة تعيين"><i class="fas fa-expand"></i></button>
        </div>
      </div>
      <div class="mindmap-canvas" id="mm-canvas">
        <svg id="mm-svg" xmlns="http://www.w3.org/2000/svg"></svg>
      </div>
      <div class="mindmap-footer">
        <div class="mindmap-hint">اضغط على أي عقدة لتوسيعها • اسحب للتحريك</div>
        <button class="mindmap-export-btn" id="mm-export">
          <i class="fas fa-download"></i> تصدير PNG
        </button>
      </div>
    `;

    container.replaceWith(wrap);

    const canvas = wrap.querySelector('#mm-canvas');
    const svg    = wrap.querySelector('#mm-svg');

    let scale = 1;
    let pan   = { x: 0, y: 0 };
    let dragging = false;
    let dragStart = { x: 0, y: 0 };

    const COLORS = {
      root:  '#2c5cc5',
      l1:    '#ff6b35',
      l2:    '#10b981',
      l3:    '#8b5cf6',
      text_root: '#ffffff',
      text_other: '#1e293b',
    };
    const NODE_H  = 36;
    const H_GAP   = 60;
    const V_GAP   = 14;

    // ── Layout ──────────────────────────────────────────────
    function measureNode(node) {
      // Estimate text width
      const len = (node.label || '').length;
      node._w = Math.max(90, Math.min(200, len * 11 + 28));
      node._h = NODE_H;
      if (node.children?.length) {
        node.children.forEach(measureNode);
        const childH = node.children.reduce((s, c) => s + c._subtreeH, 0)
                     + (node.children.length - 1) * V_GAP;
        node._subtreeH = Math.max(node._h, childH);
      } else {
        node._subtreeH = node._h;
      }
    }

    function layoutNode(node, x, y, depth) {
      node._x = x;
      node._y = y + (node._subtreeH - node._h) / 2;
      node._depth = depth;
      let childY = y;
      (node.children || []).forEach(child => {
        layoutNode(child, x + node._w + H_GAP, childY, depth + 1);
        childY += child._subtreeH + V_GAP;
      });
    }

    function collectNodes(node, arr = []) {
      arr.push(node);
      (node.children || []).forEach(c => collectNodes(c, arr));
      return arr;
    }

    function collectLinks(node, links = []) {
      (node.children || []).forEach(c => {
        links.push({ parent: node, child: c });
        collectLinks(c, links);
      });
      return links;
    }

    function getColor(depth) {
      return [COLORS.root, COLORS.l1, COLORS.l2, COLORS.l3][Math.min(depth, 3)];
    }

    function render() {
      measureNode(data);
      layoutNode(data, 40, 20, 0);

      const nodes = collectNodes(data);
      const links = collectLinks(data);

      const maxX = Math.max(...nodes.map(n => n._x + n._w));
      const maxY = Math.max(...nodes.map(n => n._y + n._h));
      const W = maxX + 40;
      const H = maxY + 40;

      svg.setAttribute('width',  W);
      svg.setAttribute('height', H);
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.innerHTML = '';

      // ── Links ──
      links.forEach(({ parent: p, child: c }) => {
        const x1 = p._x + p._w;
        const y1 = p._y + p._h / 2;
        const x2 = c._x;
        const y2 = c._y + c._h / 2;
        const mx = (x1 + x2) / 2;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
        path.setAttribute('class', 'mm-link');
        path.setAttribute('stroke', getColor(c._depth));
        path.setAttribute('stroke-opacity', '.4');
        svg.appendChild(path);
      });

      // ── Nodes ──
      nodes.forEach(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'mm-node');

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('class', 'mm-node-rect');
        rect.setAttribute('x',      node._x);
        rect.setAttribute('y',      node._y);
        rect.setAttribute('width',  node._w);
        rect.setAttribute('height', node._h);
        rect.setAttribute('fill',   getColor(node._depth));
        rect.setAttribute('rx',     '10');
        rect.setAttribute('ry',     '10');
        rect.setAttribute('fill-opacity', node._depth === 0 ? '1' : '.85');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'mm-node-text');
        text.setAttribute('x',     node._x + node._w / 2);
        text.setAttribute('y',     node._y + node._h / 2 + 1);
        text.setAttribute('fill',  node._depth === 0 ? COLORS.text_root : COLORS.text_other);
        text.setAttribute('font-size', node._depth === 0 ? '13' : '11.5');
        text.setAttribute('font-weight', node._depth === 0 ? '800' : '700');
        text.textContent = (node.label || '').slice(0, 22) + ((node.label || '').length > 22 ? '…' : '');

        g.appendChild(rect);
        g.appendChild(text);

        // Toggle collapse on click (for nodes with children)
        if (node.children?.length) {
          g.style.cursor = 'pointer';
          g.addEventListener('click', () => {
            node._collapsed = !node._collapsed;
            if (node._collapsed) {
              node._savedChildren = node.children;
              node.children = [];
            } else {
              node.children = node._savedChildren || [];
            }
            render();
          });
        }

        svg.appendChild(g);
      });

      applyTransform();
    }

    function applyTransform() {
      svg.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${scale})`;
      svg.style.transformOrigin = 'top right';
    }

    // ── Zoom ──
    wrap.querySelector('#mm-zoom-in').addEventListener('click', () => { scale = Math.min(2, scale + .15); applyTransform(); });
    wrap.querySelector('#mm-zoom-out').addEventListener('click', () => { scale = Math.max(.4, scale - .15); applyTransform(); });
    wrap.querySelector('#mm-reset').addEventListener('click', () => { scale = 1; pan = { x: 0, y: 0 }; applyTransform(); });

    // ── Pan ──
    canvas.addEventListener('mousedown', e => { dragging = true; dragStart = { x: e.clientX - pan.x, y: e.clientY - pan.y }; });
    canvas.addEventListener('mousemove', e => { if (!dragging) return; pan = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }; applyTransform(); });
    canvas.addEventListener('mouseup',   () => dragging = false);
    canvas.addEventListener('mouseleave',() => dragging = false);

    // ── Touch pan ──
    let touch0;
    canvas.addEventListener('touchstart', e => { touch0 = e.touches[0]; dragStart = { x: touch0.clientX - pan.x, y: touch0.clientY - pan.y }; }, { passive: true });
    canvas.addEventListener('touchmove',  e => {
      if (!touch0) return;
      pan = { x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y };
      applyTransform();
    }, { passive: true });

    // ── Export ──
    wrap.querySelector('#mm-export').addEventListener('click', () => {
      try {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob    = new Blob([svgData], { type: 'image/svg+xml' });
        const url     = URL.createObjectURL(blob);
        const a       = document.createElement('a');
        a.href = url; a.download = 'mindmap.svg'; a.click();
        URL.revokeObjectURL(url);
      } catch { alert('تصدير SVG متاح — غير متاح في هذا المتصفح'); }
    });

    render();
  }

  return { init };
})();
