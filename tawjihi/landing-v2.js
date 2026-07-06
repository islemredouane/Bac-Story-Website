/* landing-v2.js — Tawjihi Landing V2
   Follows build-premium-website skill patterns.
   GSAP loaded via CDN, registered when available. */
(function () {
  'use strict';

  /* ── Reduce motion gate ─────────────────────────────────── */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Theme toggle ─────────────────────────────────────────── */
  var themeBtn = document.getElementById('themeBtn');
  var html = document.documentElement;

  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    localStorage.setItem('tawjihi-theme', t);
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ── Navbar: transparent → glass on scroll ────────────────── */
  var nav = document.getElementById('lv2Nav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Burger / mobile menu ─────────────────────────────────── */
  var burger = document.getElementById('lv2Burger');
  var mobileMenu = document.getElementById('lv2MobileMenu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var open = burger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      mobileMenu.setAttribute('aria-hidden', String(!open));
    });

    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        burger.classList.remove('open');
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /* ── Smooth anchor scroll (offset for sticky nav) ────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: top, behavior: 'smooth' });
        // close mobile menu if open
        if (burger) { burger.classList.remove('open'); mobileMenu.classList.remove('open'); }
      }
    });
  });

  /* ── CountUp (IntersectionObserver + rAF) ─────────────────── */
  document.querySelectorAll('.lv2-countup[data-target]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var started = false;

    var obs = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || started) return;
      started = true;
      obs.disconnect();
      var startTs = performance.now();
      var duration = 1800;

      function tick(now) {
        var t = Math.min(1, (now - startTs) / duration);
        var eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });

    obs.observe(el);
  });

  /* ── Feature cards — GSAP reveal with stagger ───── */
  (function () {
    var cards = document.querySelectorAll('.feature-card');
    if (!cards.length || !('IntersectionObserver' in window)) {
      cards.forEach(function (c) { c.classList.add('revealed'); });
      return;
    }
    var revealed = new Set();
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || revealed.has(e.target)) return;
        revealed.add(e.target);
        var idx = Array.prototype.indexOf.call(cards, e.target);

        if (typeof gsap !== 'undefined') {
          gsap.to(e.target, {
            opacity: 1,
            transform: 'translateY(0) scale(1)',
            duration: 0.7,
            delay: idx * 0.15,
            ease: 'power3.out'
          });
        } else {
          e.target.classList.add('revealed');
        }
        obs.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    cards.forEach(function (c) { obs.observe(c); });
  }());

  /* ── FAQ accordion ────────────────────────────────────────── */
  document.querySelectorAll('.lv2-faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var answer = btn.nextElementSibling;

      // collapse others
      document.querySelectorAll('.lv2-faq-q[aria-expanded="true"]').forEach(function (b) {
        if (b !== btn) {
          b.setAttribute('aria-expanded', 'false');
          if (b.nextElementSibling) b.nextElementSibling.style.maxHeight = '0';
        }
      });

      if (expanded) {
        btn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0';
      } else {
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ── Signature animation — status cycling ─────────────────── */
  var sigStatus = document.getElementById('sigStatus');
  var statusLabels = ['يحدد المسار', 'يكتشف الخيارات', 'يطابق معدلك', 'مسارك جاهز'];
  var statusIdx = 0;

  if (sigStatus) {
    setInterval(function () {
      statusIdx = (statusIdx + 1) % statusLabels.length;
      sigStatus.style.opacity = '0';
      setTimeout(function () {
        sigStatus.textContent = statusLabels[statusIdx];
        sigStatus.style.opacity = '1';
      }, 200);
    }, 2300);
    sigStatus.style.transition = 'opacity .2s';
  }

  /* ── Shuffler animation ───────────────────────────────────── */
  var shuffler = document.getElementById('lv2Shuffler');
  if (shuffler && !prefersReduced) {
    var cards = Array.from(shuffler.querySelectorAll('.lv2-shuffler-card'));
    var shuffleIdx = 0;

    function shuffleNext() {
      shuffleIdx = (shuffleIdx + 1) % cards.length;
      cards.forEach(function (c, i) {
        var offset = ((i - shuffleIdx + cards.length) % cards.length);
        c.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1), opacity .5s';
        c.style.transform = offset === 0
          ? 'none'
          : offset === 1
          ? 'translateY(8px) scale(.97)'
          : 'translateY(16px) scale(.94)';
        c.style.opacity = offset === 0 ? '1' : offset === 1 ? '.7' : '.4';
        c.style.zIndex = String(-offset);
      });
    }

    setInterval(shuffleNext, 2800);
  }

  /* ── GSAP — wait for CDN load ─────────────────────────────── */
  function initGsap() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    if (prefersReduced) return; // respect motion preference

    /* Hero entrance stagger */
    var heroCtx = gsap.context(function () {
      gsap.from('.hero-line-1', {
        y: 40, opacity: 0, duration: 1, delay: 0.3, ease: 'power3.out'
      });
      gsap.from('.hero-line-2', {
        y: 60, opacity: 0, duration: 1.2, delay: 0.5, ease: 'power3.out'
      });
      gsap.from('.hero-meta, .hero-cta', {
        y: 24, opacity: 0, duration: 0.8, delay: 0.8, stagger: 0.12, ease: 'power3.out'
      });
    });

    /* Pillar counters section reveal */
    gsap.from('.lv2-pillar', {
      scrollTrigger: { trigger: '.lv2-pillars', start: 'top 80%', once: true },
      y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out'
    });

    /* Trust cards */
    gsap.from('.lv2-trust-card', {
      scrollTrigger: { trigger: '.lv2-trust', start: 'top 80%', once: true },
      y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out'
    });

    /* Protocol sticky-stack scrub */
    var pStack = document.getElementById('lv2ProtocolStack');
    if (pStack) {
      var pCards = pStack.querySelectorAll('.lv2-protocol-card');
      pCards.forEach(function (card, i) {
        if (i === pCards.length - 1) return; // last card stays
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top top+=80',
            end: '+=420',
            scrub: 1
          },
          scale: 0.93,
          filter: 'blur(4px) saturate(0.6)',
          opacity: 0.45,
          ease: 'none'
        });
      });
    }

    /* Service tiles fade-in */
    gsap.from('.lv2-service-tile', {
      scrollTrigger: { trigger: '.lv2-services', start: 'top 75%', once: true },
      y: 25, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out'
    });

    /* Footer tagline */
    gsap.from('.lv2-footer-tagline', {
      scrollTrigger: { trigger: '.lv2-footer', start: 'top 85%', once: true },
      y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
    });

    /* Cleanup on page unload */
    window.addEventListener('beforeunload', function () {
      heroCtx.revert();
      ScrollTrigger.killAll();
    });

    setTimeout(function () { ScrollTrigger.refresh(); }, 300);
  }

  /* Try after scripts load */
  window.addEventListener('load', function () {
    setTimeout(initGsap, 100);
  });

  /* Also try immediately in case scripts already loaded */
  if (document.readyState === 'complete') initGsap();

  /* ── Compass logo needle — subtle mouse follow ───────────── */
  var logoNeedle = document.getElementById('lv2LogoNeedle');
  if (logoNeedle && !prefersReduced) {
    document.addEventListener('mousemove', function (e) {
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      var angle = Math.atan2(e.clientX - cx, -(e.clientY - cy)) * (180 / Math.PI);
      logoNeedle.style.transform = 'rotate(' + angle + 'deg)';
      logoNeedle.style.transformOrigin = '16px 16px';
    }, { passive: true });
  }

})();