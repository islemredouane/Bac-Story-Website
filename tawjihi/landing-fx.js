/* ============================================================
   TAWJIHI — Landing hero particle constellation
   Vanilla canvas 2D background for #lpParticles inside .lp-aurora.
   Zero dependencies, single defer-safe IIFE. Subtle by design:
   it sits behind hero text and must never hurt legibility.
   ============================================================ */
(() => {
  'use strict';

  const canvas = document.getElementById('lpParticles');
  if (!canvas || !canvas.getContext) return;            // guard: nothing to do

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const root = document.documentElement;
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqCoarse = window.matchMedia('(pointer: coarse)');

  /* ---- Tunables ---- */
  const LINK_DIST = 130;        // px: connect points closer than this
  const POINTER_DIST = 160;     // px: pointer influence radius
  const AREA_PER_POINT = 16000; // viewport px² budget per particle
  const MIN_POINTS = 28;
  const MAX_POINTS = 90;
  const SPEED = 0.18;           // base drift speed (css px / frame)

  /* ---- State ---- */
  let dpr = 1;
  let w = 0, h = 0;             // CSS pixel dimensions
  let points = [];
  let rafId = 0;
  let running = false;
  let resizeRaf = 0;
  let inView = true;

  const pointer = { x: -9999, y: -9999, active: false };
  const usePointer = !mqCoarse.matches;

  /* ---- Theme-aware colours (re-read on toggle) ---- */
  let baseRGB = [44, 92, 197];      // light fallback ≈ --brand-blue
  let lineRGB = [44, 92, 197];

  function parseRGB(str, fallback) {
    if (!str) return fallback;
    str = str.trim();
    // #rgb / #rrggbb
    let m = str.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (m) {
      let hex = m[1];
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
    }
    // rgb()/rgba()
    m = str.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
    if (m) return [+m[1], +m[2], +m[3]];
    return fallback;
  }

  function readColors() {
    const dark = root.getAttribute('data-theme') === 'dark';
    const cssVar = parseRGB(
      getComputedStyle(root).getPropertyValue('--brand-blue'),
      null
    );
    if (dark) {
      // brighter, airier tint so points read against a dark canvas
      baseRGB = [120, 150, 235];
      lineRGB = [120, 150, 235];
    } else {
      baseRGB = cssVar || [44, 92, 197];
      lineRGB = cssVar || [44, 92, 197];
    }
  }

  /* ---- Sizing (DPR-aware) ---- */
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); // cap DPR for perf
    w = canvas.clientWidth || canvas.offsetWidth || window.innerWidth;
    h = canvas.clientHeight || canvas.offsetHeight || window.innerHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS px units
  }

  function targetCount() {
    const n = Math.round((w * h) / AREA_PER_POINT);
    return Math.max(MIN_POINTS, Math.min(MAX_POINTS, n));
  }

  function makePoint() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r: 1 + Math.random() * 1.4
    };
  }

  function buildPoints() {
    const n = targetCount();
    points = [];
    for (let i = 0; i < n; i++) points.push(makePoint());
  }

  /* ---- Simulation step ---- */
  function step() {
    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;

      // gentle pointer attraction / parallax
      if (usePointer && pointer.active) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < POINTER_DIST * POINTER_DIST && d2 > 1) {
          const d = Math.sqrt(d2);
          const force = (1 - d / POINTER_DIST) * 0.35;
          p.x += (dx / d) * force;
          p.y += (dy / d) * force;
        }
      }

      // wrap at edges
      if (p.x < -5) p.x = w + 5; else if (p.x > w + 5) p.x = -5;
      if (p.y < -5) p.y = h + 5; else if (p.y > h + 5) p.y = -5;
    }
  }

  /* ---- Render ---- */
  function draw() {
    ctx.clearRect(0, 0, w, h);

    const [br, bg, bb] = baseRGB;
    const [lr, lg, lb] = lineRGB;
    const n = points.length;

    // connecting lines
    for (let i = 0; i < n; i++) {
      const a = points[i];
      for (let j = i + 1; j < n; j++) {
        const b = points[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.28;
          ctx.strokeStyle = `rgba(${lr},${lg},${lb},${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // brighter links to the cursor
      if (usePointer && pointer.active) {
        const dx = a.x - pointer.x;
        const dy = a.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < POINTER_DIST * POINTER_DIST) {
          const alpha = (1 - Math.sqrt(d2) / POINTER_DIST) * 0.5;
          ctx.strokeStyle = `rgba(${lr},${lg},${lb},${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
    }

    // points
    for (let i = 0; i < n; i++) {
      const p = points[i];
      ctx.fillStyle = `rgba(${br},${bg},${bb},0.7)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ---- Loop control ---- */
  function tick() {
    step();
    draw();
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running || mqReduce.matches) return;
    if (document.hidden || !inView) return;
    running = true;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  /* ---- Static single frame (reduced motion) ---- */
  function renderStatic() {
    resize();
    readColors();
    buildPoints();
    draw();
  }

  /* ---- Event wiring ---- */
  function onResize() {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      const prevN = points.length;
      resize();
      // keep density correct; preserve points where possible
      const want = targetCount();
      if (!prevN) {
        buildPoints();
      } else if (want > prevN) {
        for (let i = prevN; i < want; i++) points.push(makePoint());
      } else if (want < prevN) {
        points.length = want;
      }
      // clamp existing points into new bounds
      for (const p of points) {
        if (p.x > w) p.x = Math.random() * w;
        if (p.y > h) p.y = Math.random() * h;
      }
      if (mqReduce.matches) draw();
    });
  }

  function onPointerMove(e) {
    if (!usePointer) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  }
  function onPointerLeave() {
    pointer.active = false;
    pointer.x = pointer.y = -9999;
  }

  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }

  function bindThemeObserver() {
    const obs = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.attributeName === 'data-theme') {
          readColors();
          if (mqReduce.matches || !running) draw(); // refresh when paused/static
          break;
        }
      }
    });
    obs.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function bindIntersection() {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) start(); else stop();
    }, { threshold: 0 });
    io.observe(canvas);
  }

  function reactToReduceMotion() {
    if (mqReduce.matches) {
      stop();
      renderStatic();
    } else {
      start();
    }
  }

  /* ---- Init ---- */
  function init() {
    readColors();
    resize();
    buildPoints();
    bindThemeObserver();

    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    if (usePointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerleave', onPointerLeave, { passive: true });
      window.addEventListener('blur', onPointerLeave);
    }

    // react to reduced-motion preference (and live changes)
    if (typeof mqReduce.addEventListener === 'function') {
      mqReduce.addEventListener('change', reactToReduceMotion);
    } else if (typeof mqReduce.addListener === 'function') {
      mqReduce.addListener(reactToReduceMotion); // legacy Safari
    }

    if (mqReduce.matches) {
      draw();              // one static frame, no loop
    } else {
      bindIntersection();
      start();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
