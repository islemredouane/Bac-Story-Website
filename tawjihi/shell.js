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

  // Hide content until auth is confirmed — prevents flash of protected content
  document.body.classList.add('auth-checking');

  if (!twAuth) {
    // No local session — try recovering from Supabase
    if (typeof tw_supabase !== 'undefined') {
      const { data: { session } } = await tw_supabase.auth.getSession();
      if (session) {
        localStorage.setItem('tw-auth', JSON.stringify({ provider: 'google', uid: session.user.id }));
        document.body.classList.remove('auth-checking');
        if (!localStorage.getItem('tw-profile')) { location.replace('onboarding.html' + location.search); return; }
      } else {
        localStorage.removeItem('tw-auth');
        localStorage.removeItem('tw-profile');
        location.replace('login.html' + location.search); return;
      }
    } else {
      localStorage.removeItem('tw-auth');
      localStorage.removeItem('tw-profile');
      location.replace('login.html' + location.search); return;
    }
  } else {
    // tw-auth exists — confirm the Supabase session is still valid before revealing content
    if (typeof tw_supabase !== 'undefined') {
      const { data: { session } } = await tw_supabase.auth.getSession();
      if (session) {
        document.body.classList.remove('auth-checking');
      } else {
        // Session expired — clear local state and redirect
        localStorage.removeItem('tw-auth');
        localStorage.removeItem('tw-profile');
        location.replace('login.html' + location.search); return;
      }
    } else {
      // Supabase unavailable — allow render but clear class
      document.body.classList.remove('auth-checking');
    }
  }

  if (!localStorage.getItem('tw-profile')) { location.replace('onboarding.html' + location.search); return; }
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

/* ---- Shared sidebar — injected once, identical on every page ---- */
(function () {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    var page = location.pathname.split('/').pop().replace('.html', '') || 'index';
    /* speciality detail page belongs to the specialities section */
    var activeId = page === 'speciality' ? 'specialities' : page;

    var NAV = [
        { id: 'app',          href: 'app.html',          icon: 'fa-comments',   label: 'المرشد الذكي' },
        { id: 'specialities', href: 'specialities.html', icon: 'fa-compass',    label: 'دليل التخصصات' },
        { id: 'simulator',    href: 'simulator.html',    icon: 'fa-list-check', label: 'محاكي بطاقة الرغبات' },
        { id: 'dashboard',    href: 'dashboard.html',    icon: 'fa-gauge-high', label: 'لوحتي' },
        { id: 'referral',     href: 'referral.html',     icon: 'fa-gift',       label: 'الإحالة والمكافآت' },
    ];

    sidebar.innerHTML =
        '<div class="sidebar-head">' +
            '<a href="dashboard.html" class="sidebar-logo-link" aria-label="توجيهي — الرئيسية">' +
                '<svg class="sidebar-logo-svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">' +
                    '<circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="1.5"/>' +
                    '<circle cx="16" cy="16" r="2.5" fill="currentColor"/>' +
                    '<line x1="16" y1="3" x2="16" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
                    '<line x1="16" y1="23" x2="16" y2="29" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
                    '<line x1="3" y1="16" x2="9" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
                    '<line x1="23" y1="16" x2="29" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
                    '<line x1="16" y1="16" x2="16" y2="7" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>' +
                '</svg>' +
                '<span class="sidebar-logo sidebar-logo-brand">توجيهي</span>' +
            '</a>' +
        '</div>' +
        '<nav class="nav-group">' +
            NAV.map(function (item) {
                return '<a class="nav-item' + (activeId === item.id ? ' active' : '') + '" href="' + item.href + '">' +
                    '<i class="fas ' + item.icon + '"></i><span>' + item.label + '</span>' +
                '</a>';
            }).join('') +
        '</nav>' +
        '<div class="sidebar-foot">' +
            '<a class="nav-item" href="#" onclick="(function(){var r=document.documentElement;var n=r.getAttribute(\'data-theme\')==\'dark\'?\'light\':\'dark\';r.setAttribute(\'data-theme\',n);localStorage.setItem(\'tw-theme\',n);var ic=document.getElementById(\'themeIconSide\');if(ic){ic.className=\'fas fa-\'+(n===\'dark\'?\'sun\':\'moon\');}})();return false;">' +
                '<i class="fas fa-circle-half-stroke" id="themeIconSide"></i><span>الوضع الليلي</span>' +
            '</a>' +
            '<a class="nav-item" href="dashboard.html"><i class="fas fa-user-circle"></i><span>حسابي</span></a>' +
            '<a class="nav-item" href="settings.html"><i class="fas fa-gear"></i><span>الإعدادات</span></a>' +
            '<a class="nav-item" href="#" id="logoutBtn" onclick="if(window.twSignOut){window.twSignOut()}else{localStorage.clear();location.href=\'login.html\'};return false;">' +
                '<i class="fas fa-right-from-bracket"></i><span>تسجيل الخروج</span>' +
            '</a>' +
        '</div>';

    /* Append the collapse tab directly to #app (not inside #sidebar) so
       position:absolute works relative to the grid container, not the
       sticky sidebar element which breaks cross-browser.
       Listener is attached here so ALL pages get toggle — app.js and
       dashboard.html guard against double-attaching via data-tw-toggle. */
    var appEl = document.getElementById('app');
    if (appEl && !document.getElementById('sidebarToggle')) {
        var tab = document.createElement('button');
        tab.id = 'sidebarToggle';
        tab.className = 'sidebar-collapse-tab';
        tab.setAttribute('aria-label', 'طي القائمة');
        tab.setAttribute('data-tw-toggle', '1');
        tab.innerHTML = '<i class="fas fa-chevron-right"></i>';
        tab.addEventListener('click', function () {
            if (window.innerWidth <= 900) appEl.classList.remove('drawer-open');
            else appEl.classList.toggle('sidebar-collapsed');
        });
        appEl.appendChild(tab);
    }
}());

/* ---- Mobile Navigation: Top Bar + Bottom Tab Nav ---- */
(() => {
  const page = location.pathname.split('/').pop().replace('.html', '') || 'app';
  if (['login', 'onboarding', 'index', 'speciality'].includes(page)) return;

  /* Chat page: keep old floating pills, skip mobile nav entirely */
  if (page === 'app') {
    document.body.classList.add('no-mobile-nav');
    return;
  }

  const root = document.documentElement;
  const appEl = document.getElementById('app');

  /* ── Top Bar: [Branding right] [Actions left] ── */
  const topbar = document.createElement('header');
  topbar.className = 'mobile-topbar';
  if (page === 'speciality') {
    topbar.innerHTML = `
      <a class="mtb-back-link" href="specialities.html" onclick="event.preventDefault(); history.length > 1 ? history.back() : location.href='specialities.html'" aria-label="رجوع">
        <i class="fas fa-arrow-right"></i>
        <span class="mtb-back-text">التخصصات</span>
      </a>
      <span class="mtb-page-title">تفاصيل التخصص</span>
      <div class="mtb-actions">
        <button class="mtb-btn" id="mobileThemeBtn" aria-label="تبديل الوضع">
          <i class="fas fa-${root.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon'}"></i>
        </button>
      </div>
    `;
  } else {
    topbar.innerHTML = `
      <a class="mtb-logo-link" href="dashboard.html" aria-label="توجيهي — الرئيسية">
        <svg class="lv2-logo-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="16" cy="16" r="2.5" fill="currentColor"/>
          <line x1="16" y1="3" x2="16" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="16" y1="23" x2="16" y2="29" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="3" y1="16" x2="9" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="23" y1="16" x2="29" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line id="lv2LogoNeedle" x1="16" y1="16" x2="16" y2="7" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="mtb-logo-text">توجيهي</span>
      </a>
      <div class="mtb-actions">
        <button class="mtb-btn" id="mobileThemeBtn" aria-label="تبديل الوضع">
          <i class="fas fa-${root.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon'}"></i>
        </button>
        <a class="mtb-btn" href="settings.html" aria-label="الإعدادات">
          <i class="fas fa-user-circle"></i>
        </a>
      </div>
    `;
  }
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

    /* Centre the fixed-size pill over the icon — width/height stay constant (set in CSS) */
    const PILL_W = 58;
    const PILL_H = 38;
    const dx = iconRect.left + iconRect.width  / 2 - navRect.left - PILL_W / 2;
    const dy = iconRect.top  + iconRect.height / 2 - navRect.top  - PILL_H / 2;

    if (!animate) {
      /* Initial placement — no animation to avoid FLIP glitch */
      slider.style.transition = 'none';
      slider.style.transform = `translate(${dx}px, ${dy}px)`;
      slider.getBoundingClientRect(); /* force reflow */
      /* Enable animation for subsequent moves */
      slider.style.transition = 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)';
    } else {
      slider.style.transition = 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      slider.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    slider.style.opacity = '1';
  }

  /* Snap to initial active item with no animation */
  setTimeout(() => placeSlider(nav.querySelector('.mnav-item.active'), false), 0);

  /* ── View Transitions: inject CSS for cross-page animations ── */
  const transitionStyle = document.createElement('style');
  transitionStyle.textContent = `
    ::view-transition-old(root) {
      animation: 200ms ease-out both tw-fade-out-scale;
    }
    ::view-transition-new(root) {
      animation: 300ms ease-out both tw-fade-in-scale;
    }
    @keyframes tw-fade-out-scale {
      to { opacity: 0; transform: scale(0.98); }
    }
    @keyframes tw-fade-in-scale {
      from { opacity: 0; transform: scale(1.02); }
    }
  `;
  document.head.appendChild(transitionStyle);

  function navigateTo(href) {
    if (!document.startViewTransition) {
      window.location.href = href;
      return;
    }
    document.startViewTransition(() => {
      window.location.href = href;
    });
  }

  /* Animate slider then navigate on tab click */
  nav.querySelectorAll('.mnav-item').forEach(item => {
    item.addEventListener('click', e => {
      if (item.classList.contains('mnav-center')) return; /* navigates normally */
      e.preventDefault();
      const href = item.getAttribute('href');
      nav.querySelectorAll('.mnav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      placeSlider(item, true);
      setTimeout(() => navigateTo(href), 240);
    });
  });
})();

/* ---- Global sign-out helper ---- */
window.twSignOut = async function () {
  if (typeof tw_supabase !== 'undefined') await tw_supabase.auth.signOut();
  ['tw-auth','tw-profile','tw-wishlist','tw-history','tw-credits','tw-referral'].forEach(k => localStorage.removeItem(k));
  window.location.href = '/tawjihi/login.html';
};
