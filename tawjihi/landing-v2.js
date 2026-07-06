/* landing-v2.js — Tawjihi Landing Page interactions */

(function () {
  'use strict';

  /* ── Theme toggle ─────────────────────────────────────────── */
  const themeBtn = document.getElementById('themeBtn');
  const html = document.documentElement;

  function setTheme(t) {
    html.setAttribute('data-theme', t);
    localStorage.setItem('tawjihi-theme', t);
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ── Navbar glass on scroll ───────────────────────────────── */
  var nav = document.getElementById('lv2Nav');
  if (nav) {
    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile burger / drawer ───────────────────────────────── */
  var burger = document.getElementById('lv2Burger');
  var drawer = document.getElementById('lv2Drawer');

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = burger.classList.toggle('open');
      drawer.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
    });

    // Close on drawer link click
    drawer.querySelectorAll('.lv2-drawer-link, .lv2-btn-primary').forEach(function (el) {
      el.addEventListener('click', function () {
        burger.classList.remove('open');
        drawer.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /* ── Reveal on scroll (IntersectionObserver) ──────────────── */
  var revealEls = document.querySelectorAll('.lv2-reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('lv2-in');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    // Fallback — show everything
    revealEls.forEach(function (el) { el.classList.add('lv2-in'); });
  }

  /* ── CountUp animation ────────────────────────────────────── */
  var counters = document.querySelectorAll('.lv2-counter-num[data-target]');

  if (counters.length) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countObs.unobserve(e.target);
        var el = e.target;
        var target = parseInt(el.getAttribute('data-target'), 10);
        var start = 0;
        var duration = 1400;
        var startTime = null;

        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          // ease-out-quart
          var eased = 1 - Math.pow(1 - progress, 4);
          el.textContent = Math.round(start + (target - start) * eased);
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { countObs.observe(el); });
  }

  /* ── FAQ accordion ────────────────────────────────────────── */
  var faqBtns = document.querySelectorAll('.lv2-faq-q');

  faqBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var answer = btn.nextElementSibling;

      // Collapse others
      faqBtns.forEach(function (b) {
        if (b !== btn) {
          b.setAttribute('aria-expanded', 'false');
          var a = b.nextElementSibling;
          if (a) a.style.maxHeight = '0';
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

  /* ── Chat demo typing animation ───────────────────────────── */
  function runChatDemo() {
    var dots = document.querySelectorAll('.lv2-typing-dot');
    var text = document.querySelector('.lv2-chat-text');
    if (!dots.length || !text) return;

    setTimeout(function () {
      dots.forEach(function (d) { d.style.display = 'none'; });
      text.style.display = 'inline';
    }, 2000);
  }

  // Re-run when feature section enters view
  var featSection = document.getElementById('features');
  if (featSection) {
    var featObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        runChatDemo();
        featObs.disconnect();
      }
    }, { threshold: 0.2 });
    featObs.observe(featSection);
  }

  /* ── Smooth anchor scrolling (mobile drawer links) ────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        var offset = 72; // nav height
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ── Compass nav needle subtle follow-mouse ───────────────── */
  var needle = document.getElementById('lv2-compass-needle');
  if (needle) {
    document.addEventListener('mousemove', function (e) {
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      var angle = Math.atan2(e.clientX - cx, -(e.clientY - cy)) * (180 / Math.PI);
      needle.style.transform = 'rotate(' + angle + 'deg)';
      needle.style.transformOrigin = '16px 16px';
    }, { passive: true });
  }

})();