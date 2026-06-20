/* ============================================================
   TAWJIHI — Shared shell logic (theme + sidebar/drawer)
   Factored out of app.js so non-chat pages reuse the SAME
   behavior. Mirrors the inline logic in app.js exactly:
   - theme persisted under localStorage 'tw-theme'
   - desktop sidebar collapse via #sidebarToggle
   - mobile drawer via #drawerBtn / #scrim
   Safe to load on any page that uses the app shell markup.
   ============================================================ */

/* ---- Auth gate (secondary defence — primary is inline in <head>) ---- */
(async function () {
  const p = location.pathname.split('/').pop() || '';
  const PUBLIC_PAGES = ['login.html', 'onboarding.html', 'index.html', ''];
  if (PUBLIC_PAGES.includes(p)) return;

  const twAuth = localStorage.getItem('tw-auth');

  if (!twAuth) {
    // No local session — try recovering from Supabase
    if (typeof tw_supabase !== 'undefined') {
      const { data: { session } } = await tw_supabase.auth.getSession();
      if (session) {
        localStorage.setItem('tw-auth', JSON.stringify({ provider: 'google', uid: session.user.id }));
        if (!localStorage.getItem('tw-profile')) { location.replace('onboarding.html'); return; }
      } else {
        location.replace('login.html'); return;
      }
    } else {
      location.replace('login.html'); return;
    }
  }

  if (!localStorage.getItem('tw-profile')) { location.replace('onboarding.html'); return; }

  // Background session health check (don't block render)
  if (typeof tw_supabase !== 'undefined') {
    tw_supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Session expired — clear local state and redirect
        ['tw-auth','tw-profile','tw-wishlist','tw-history','tw-credits','tw-referral'].forEach(k => localStorage.removeItem(k));
        location.replace('login.html');
      }
    });
  }
}());

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const app = $('#app');
  const root = document.documentElement;

  /* ---- Theme (persisted) — same mechanism as app.js ---- */
  const savedTheme = localStorage.getItem('tw-theme') || 'light';
  root.setAttribute('data-theme', savedTheme);

  const syncThemeIcon = () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    const btn = $('#themeBtn');
    if (btn) btn.innerHTML = `<i class="fas fa-${dark ? 'sun' : 'moon'}"></i>`;
  };
  syncThemeIcon();

  const themeBtn = $('#themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('tw-theme', next);
      syncThemeIcon();
    });
  }

  /* ---- Sidebar collapse (desktop) + drawer (mobile) ---- */
  const sidebarToggle = $('#sidebarToggle');
  if (sidebarToggle && app) {
    sidebarToggle.addEventListener('click', () => {
      if (window.innerWidth <= 900) app.classList.remove('drawer-open');
      else app.classList.toggle('sidebar-collapsed');
    });
  }
  /* Hide floating actions pill when it has no visible buttons */
  const actionsEl = $('.topbar-actions');
  if (actionsEl) {
    const hasVisible = [...actionsEl.children].some(el => el.id !== 'themeBtn');
    if (!hasVisible) actionsEl.style.display = 'none';
  }

  const drawerBtn = $('#drawerBtn');
  if (drawerBtn && app) drawerBtn.addEventListener('click', () => app.classList.add('drawer-open'));
  const scrim = $('#scrim');
  if (scrim && app) scrim.addEventListener('click', () => app.classList.remove('drawer-open'));
})();

/* ---- Mobile Navigation: Top Bar + Bottom Tab Nav ---- */
(() => {
  const page = location.pathname.split('/').pop().replace('.html', '') || 'app';
  if (['login', 'onboarding', 'index'].includes(page)) return;

  /* Chat page: keep old floating pills, skip mobile nav entirely */
  if (page === 'app') {
    document.body.classList.add('no-mobile-nav');
    return;
  }

  const root = document.documentElement;
  const appEl = document.getElementById('app');

  /* ── Top Bar: [hamburger] [logo centered] [theme] ── */
  const topbar = document.createElement('header');
  topbar.className = 'mobile-topbar';
  topbar.innerHTML = `
    <button class="mtb-btn" id="mobileDrawerBtn" aria-label="القائمة">
      <i class="fas fa-bars"></i>
    </button>
    <span class="mtb-logo">توجيهي</span>
    <button class="mtb-btn" id="mobileThemeBtn" aria-label="تبديل الوضع">
      <i class="fas fa-${root.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon'}"></i>
    </button>
  `;
  document.body.appendChild(topbar);

  /* Hamburger → open sidebar drawer */
  document.getElementById('mobileDrawerBtn')?.addEventListener('click', () => {
    appEl?.classList.add('drawer-open');
  });

  /* Theme toggle */
  const mobileThemeBtn = document.getElementById('mobileThemeBtn');
  if (mobileThemeBtn) {
    mobileThemeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('tw-theme', next);
      mobileThemeBtn.querySelector('i').className = `fas fa-${next === 'dark' ? 'sun' : 'moon'}`;
      const sideIcon = document.getElementById('themeIconSide');
      if (sideIcon) sideIcon.className = `fas fa-${next === 'dark' ? 'sun' : 'moon'}`;
    });
  }

  /* ── Bottom Nav ── */
  const navItems = [
    { id: 'dashboard',    href: 'dashboard.html',    icon: 'fa-gauge-high', label: 'لوحتي'    },
    { id: 'specialities', href: 'specialities.html', icon: 'fa-compass',    label: 'التخصصات' },
    { id: 'app',          href: 'app.html',          icon: 'fa-comments',   label: 'المرشد', center: true },
    { id: 'simulator',    href: 'simulator.html',    icon: 'fa-list-check', label: 'المحاكي'  },
    { id: 'referral',     href: 'referral.html',     icon: 'fa-gift',       label: 'إحالة'    },
  ];

  const nav = document.createElement('nav');
  nav.className = 'mobile-nav';
  nav.setAttribute('aria-label', 'التنقل الرئيسي');
  nav.innerHTML = '<div class="mnav-slider"></div>' + navItems.map(item => `
    <a class="mnav-item${item.center ? ' mnav-center' : ''}${page === item.id ? ' active' : ''}"
       href="${item.href}" aria-label="${item.label}">
      <span class="mnav-icon"><i class="fas ${item.icon}"></i></span>
      <span class="mnav-label">${item.label}</span>
    </a>
  `).join('');
  document.body.appendChild(nav);

  /* ── Sliding active indicator ── */
  const slider = nav.querySelector('.mnav-slider');

  function placeSlider(targetItem, animate) {
    if (!slider || !targetItem || targetItem.classList.contains('mnav-center')) {
      if (slider) slider.style.opacity = '0';
      return;
    }
    const iconEl = targetItem.querySelector('.mnav-icon');
    const navRect = nav.getBoundingClientRect();
    const iconRect = iconEl.getBoundingClientRect();

    if (!animate) {
      slider.style.transition = 'none';
      slider.getBoundingClientRect(); /* force reflow */
    } else {
      slider.style.transition = '';
    }
    /* Centre the fixed-size pill over the icon — width/height stay constant (set in CSS) */
    const PILL_W = 52;
    const PILL_H = 34;
    slider.style.left = (iconRect.left + iconRect.width  / 2 - navRect.left - PILL_W / 2) + 'px';
    slider.style.top  = (iconRect.top  + iconRect.height / 2 - navRect.top  - PILL_H / 2) + 'px';
    slider.style.opacity = '1';
  }

  /* Snap to initial active item with no animation */
  setTimeout(() => placeSlider(nav.querySelector('.mnav-item.active'), false), 0);

  /* Animate slider then navigate on tab click */
  nav.querySelectorAll('.mnav-item').forEach(item => {
    item.addEventListener('click', e => {
      if (item.classList.contains('mnav-center')) return; /* navigates normally */
      e.preventDefault();
      const href = item.getAttribute('href');
      nav.querySelectorAll('.mnav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      placeSlider(item, true);
      setTimeout(() => { window.location.href = href; }, 240);
    });
  });
})();

/* ---- Global sign-out helper ---- */
window.twSignOut = async function () {
  if (typeof tw_supabase !== 'undefined') await tw_supabase.auth.signOut();
  ['tw-auth','tw-profile','tw-wishlist','tw-history','tw-credits','tw-referral'].forEach(k => localStorage.removeItem(k));
  window.location.href = '/tawjihi/login.html';
};
