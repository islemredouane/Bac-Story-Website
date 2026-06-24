/* ============================================================
   TAWJIHI — Landing page interactions
   Theme · mobile menu · scroll reveals · parallax · pointer
   drift · 3D tilt · animated counters.
   Vanilla ES, single IIFE, zero dependencies, runs on defer.
   ============================================================ */
(() => {
  'use strict';

  /* Signal that landing.js parsed and ran — the HTML failsafe checks this to
     reveal all content if the script ever fails to load (avoids a blank page). */
  window.__landingReady = true;

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;

  const reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  const coarsePointer = window.matchMedia
    ? window.matchMedia('(pointer: coarse)').matches
    : ('ontouchstart' in window);
  const allowMotionFx = !reduceMotion && !coarsePointer;

  /* ------------------------------------------------------------
     1) THEME TOGGLE (persisted, key 'tw-theme' — drives every
        .js-theme-toggle: header icon button + sheet labelled button)
     ------------------------------------------------------------ */
  (() => {
    const saved = localStorage.getItem('tw-theme') || 'light';
    root.setAttribute('data-theme', saved);

    const toggles = $$('.js-theme-toggle');

    const sync = () => {
      const dark = root.getAttribute('data-theme') === 'dark';
      toggles.forEach((el) => {
        const icon = el.querySelector('i');
        if (icon) icon.className = `fas fa-${dark ? 'sun' : 'moon'}`;
        const label = el.querySelector('.js-theme-label');
        if (label) label.textContent = dark ? 'الوضع النهاري' : 'الوضع الليلي';
      });
    };
    sync();

    toggles.forEach((el) => {
      el.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('tw-theme', next);
        sync();
      });
    });
  })();

  /* ------------------------------------------------------------
     2) MOBILE SHEET (full-screen overlay)
        burger morph · body scroll lock · Esc / link / backdrop close
     ------------------------------------------------------------ */
  (() => {
    const btn   = $('#lpMenuBtn');
    const sheet = $('#lpMobileMenu');
    if (!btn || !sheet) return;

    const setOpen = (open) => {
      sheet.classList.toggle('is-open', open);
      btn.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
      sheet.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.classList.toggle('lp-no-scroll', open);
    };
    setOpen(false);

    const isOpen = () => sheet.classList.contains('is-open');

    btn.addEventListener('click', () => setOpen(!isOpen()));

    // Close on Escape.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) setOpen(false);
    });

    // Close on backdrop tap (click on the sheet itself, not its inner content).
    sheet.addEventListener('click', (e) => {
      if (e.target === sheet) setOpen(false);
    });

    // Close on any navigation link (theme button is excluded — keep sheet open).
    $$('a', sheet).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  })();

  /* ------------------------------------------------------------
     3) SCROLL-AWARE NAVBAR + SCROLL-SPY active link
     ------------------------------------------------------------ */
  (() => {
    const nav = $('#lpNav');
    const links = $$('.lp-nav-center [data-nav]');

    // condensed glass state after a small scroll
    if (nav) {
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          nav.classList.toggle('scrolled', window.scrollY > 20);
          ticking = false;
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // scroll-spy: highlight the link whose section is in view
    if (links.length && 'IntersectionObserver' in window) {
      const byId = {};
      const sections = [];
      links.forEach((l) => {
        const id = (l.getAttribute('href') || '').replace('#', '');
        const sec = id && document.getElementById(id);
        if (sec) { byId[id] = l; sections.push(sec); }
      });
      if (sections.length) {
        const spy = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            links.forEach((l) => l.classList.remove('active'));
            const active = byId[e.target.id];
            if (active) active.classList.add('active');
          });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
        sections.forEach((s) => spy.observe(s));
      }
    }
  })();

  /* ------------------------------------------------------------
     3) SCROLL REVEALS
     ------------------------------------------------------------ */
  (() => {
    const els = $$('.reveal');
    if (!els.length) return;

    const reveal = (el) => {
      const delay = parseInt(el.getAttribute('data-reveal-delay'), 10) || 0;
      el.style.setProperty('--reveal-delay', delay + 'ms');
      el.classList.add('in');
    };

    if (!('IntersectionObserver' in window)) {
      els.forEach(reveal);
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    els.forEach((el) => io.observe(el));
  })();

  /* ------------------------------------------------------------
     SHARED rAF SCROLL LOOP (parallax + pointer-drift base)
     Each registered subscriber gets the latest scrollY.
     ------------------------------------------------------------ */
  const scrollSubs = [];
  let scrollY = window.pageYOffset || 0;
  let scrollTicking = false;

  const runScrollSubs = () => {
    scrollSubs.forEach((fn) => fn(scrollY));
    scrollTicking = false;
  };
  const onScroll = () => {
    scrollY = window.pageYOffset || 0;
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(runScrollSubs);
    }
  };
  const startScrollLoop = () => {
    if (!scrollSubs.length) return;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.requestAnimationFrame(runScrollSubs); // initial position
  };

  /* ------------------------------------------------------------
     4) PARALLAX  +  5) POINTER DRIFT (hero floaters)
     ------------------------------------------------------------ */
  (() => {
    if (!allowMotionFx) return;

    const nodes = $$('[data-parallax]');
    if (!nodes.length) return;

    // Each item keeps a scroll-derived base translate; hero-floaters
    // additionally receive a pointer-driven offset combined on top.
    const items = nodes.map((el) => {
      const factor = parseFloat(el.getAttribute('data-parallax')) || 0;
      const isFloat = el.classList.contains('hero-float');
      el.style.willChange = 'transform';
      return { el, factor, isFloat, baseY: 0, dx: 0, dy: 0 };
    });

    const apply = (item) => {
      // RTL-safe: vertical drift is direction-agnostic; pointer dx is
      // applied in raw pixel space (no horizontal mirroring needed).
      const x = item.dx;
      const y = item.baseY + item.dy;
      item.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    };

    scrollSubs.push((y) => {
      items.forEach((item) => {
        // Gentle depth drift: scrollY mapped into the -0.1 .. -0.3
        // px-per-px band (subtle, upward as you scroll).
        const depth = -(0.1 + item.factor * 0.2);
        item.baseY = y * depth;
        apply(item);
      });
    });

    // Pointer drift — hero only, combined onto the scroll base.
    const hero = $('.hero');
    const floats = items.filter((i) => i.isFloat);
    if (hero && floats.length) {
      let pointerTicking = false;
      let pendingX = 0, pendingY = 0;

      const applyPointer = () => {
        floats.forEach((item) => {
          // Stronger factor floaters drift a touch more.
          const strength = 14 * (0.5 + item.factor);
          item.dx = pendingX * strength;
          item.dy = pendingY * strength;
          apply(item);
        });
        pointerTicking = false;
      };

      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        if (!r.width || !r.height) return;
        // Offset of cursor from hero center, normalized to -0.5 .. 0.5
        pendingX = (e.clientX - (r.left + r.width / 2)) / r.width;
        pendingY = (e.clientY - (r.top + r.height / 2)) / r.height;
        if (!pointerTicking) {
          pointerTicking = true;
          window.requestAnimationFrame(applyPointer);
        }
      }, { passive: true });

      hero.addEventListener('mouseleave', () => {
        pendingX = 0; pendingY = 0;
        if (!pointerTicking) {
          pointerTicking = true;
          window.requestAnimationFrame(applyPointer);
        }
      }, { passive: true });
    }

    startScrollLoop();
  })();

  /* ------------------------------------------------------------
     6) 3D TILT
     Tilt targets are also .reveal — only active once revealed (.in).
     ------------------------------------------------------------ */
  (() => {
    if (!allowMotionFx) return;

    const nodes = $$('[data-tilt]');
    if (!nodes.length) return;

    nodes.forEach((el) => {
      const max = parseFloat(el.getAttribute('data-tilt-max')) || 8;
      const isRevealTarget = el.classList.contains('reveal');
      const ready = () => !isRevealTarget || el.classList.contains('in');

      el.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'touch' || !ready()) return;
        el.style.transition = 'transform .12s ease-out';
      });

      el.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch' || !ready()) return;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const px = (e.clientX - r.left) / r.width;   // 0 .. 1
        const py = (e.clientY - r.top) / r.height;   // 0 .. 1
        // rotateX from vertical pos (top tilts back), rotateY from horizontal.
        const rotX = (0.5 - py) * 2 * max;
        const rotY = (px - 0.5) * 2 * max;
        el.style.transform =
          `perspective(900px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.01)`;
      });

      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
        el.style.transition = '';
      });
    });
  })();

  /* ------------------------------------------------------------
     7) COUNTERS
     ------------------------------------------------------------ */
  (() => {
    const nodes = $$('[data-count]');
    if (!nodes.length) return;

    const finalText = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      const suffix = el.getAttribute('data-suffix') || '';
      return { target, suffix };
    };

    const setFinal = (el) => {
      const { target, suffix } = finalText(el);
      el.textContent = target + suffix;
    };

    if (reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach(setFinal);
      return;
    }

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (el) => {
      const { target, suffix } = finalText(el);
      const duration = 1400;
      let start = null;

      const step = (ts) => {
        if (start === null) start = ts;
        const t = Math.min((ts - start) / duration, 1);
        const value = Math.round(easeOutCubic(t) * target);
        el.textContent = value + (t >= 1 ? suffix : '');
        if (t < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    nodes.forEach((el) => io.observe(el));
  })();

  /* ------------------------------------------------------------
     8) SPOTLIGHT TRACKING
     Feeds --mx/--my (cursor pos relative to card top-left) to the
     CSS ::after glow. Pointer-only; opacity handled by CSS :hover.
     ------------------------------------------------------------ */
  (() => {
    if (coarsePointer) return;

    const cards = $$('.feat-card, .step-card, .stat-card, .testimonial');
    if (!cards.length) return;

    cards.forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        el.style.setProperty('--mx', (e.clientX - r.left).toFixed(1) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top).toFixed(1) + 'px');
      }, { passive: true });
    });
  })();

  /* ------------------------------------------------------------
     9) MAGNETIC BUTTONS
     Nudge [data-magnetic] toward the cursor within a padded zone.
     Not tilt/float targets — no transform conflict. FX-gated.
     ------------------------------------------------------------ */
  (() => {
    if (!allowMotionFx) return;

    const btns = $$('[data-magnetic]');
    if (!btns.length) return;

    const PAD = 28;     // padded hit zone around the button (px)
    const FACTOR = 0.25;
    const MAX = 10;     // clamp the pull (px)

    const clamp = (v) => Math.max(-MAX, Math.min(MAX, v));

    btns.forEach((el) => {
      el.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'touch') return;
        el.style.transition = 'transform .15s ease-out';
      });

      el.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // Only pull while inside the padded zone.
        if (e.clientX < r.left - PAD || e.clientX > r.right + PAD ||
            e.clientY < r.top - PAD  || e.clientY > r.bottom + PAD) {
          el.style.transform = '';
          return;
        }
        const x = clamp((e.clientX - cx) * FACTOR);
        const y = clamp((e.clientY - cy) * FACTOR);
        el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      }, { passive: true });

      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  })();

  /* ------------------------------------------------------------
     10) WORD-SPLIT (.hero-title[data-split])
     Wrap each word in <span class="split-word" style="--i:N">,
     preserving <br> and the .grad span (its words split in place).
     Runs synchronously so spans exist before reveal adds .in.
     ------------------------------------------------------------ */
  (() => {
    const title = $('.hero-title[data-split]');
    if (!title || title.dataset.splitDone) return;

    let i = 0;

    // Replace a text node with .split-word spans (trailing space kept).
    const splitTextNode = (node, container) => {
      const text = node.textContent;
      if (!/\S/.test(text)) return;            // pure whitespace: leave as-is
      const frag = document.createDocumentFragment();
      // Split keeping the spaces attached to each preceding word.
      const parts = text.split(/(\s+)/);
      for (let p = 0; p < parts.length; p++) {
        const chunk = parts[p];
        if (!chunk) continue;
        if (/^\s+$/.test(chunk)) {             // whitespace run: keep literal
          frag.appendChild(document.createTextNode(chunk));
          continue;
        }
        const span = document.createElement('span');
        span.className = 'split-word';
        span.style.setProperty('--i', i++);
        span.textContent = chunk;
        frag.appendChild(span);
      }
      container.replaceChild(frag, node);
    };

    // Snapshot children first (we mutate as we go).
    Array.from(title.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        splitTextNode(node, title);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Keep the element; split words inside the .grad span in place.
        if (node.classList && node.classList.contains('grad')) {
          Array.from(node.childNodes).forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) splitTextNode(child, node);
          });
        }
        // Other elements (e.g. <br>) are preserved untouched.
      }
    });

    title.dataset.splitDone = 'true';
  })();

})();
