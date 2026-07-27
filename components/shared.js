/**
 * shared.js — Runs on every page of Bac Story Website
 * Handles: component injection, loader, navbar, mobile menu, dropdowns, section nav
 */

// ─── PAGE LOADER ─────────────────────────────────────────────────────────────
const _loaderShownAt = Date.now();
const _LOADER_MIN_MS = 1200; // always visible for at least 1.2 s

(function injectLoader() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.className = 'page-loader';
    // HTML matches the CSS classes in style.css exactly
    loader.innerHTML = `
        <div class="loader-orb"></div>
        <div class="loader-orb loader-orb--2"></div>
        <div class="loader-content">
            <div class="loader-letters">
                <span class="ll">B</span>
                <span class="ll">A</span>
                <span class="ll">C</span>
                <span class="loader-gap"></span>
                <span class="ll">S</span>
                <span class="ll">T</span>
                <span class="ll">O</span>
                <span class="ll">R</span>
                <span class="ll">Y</span>
            </div>
            <div class="loader-divider"><span></span></div>
            <div class="loader-tagline">منصة التميز في البكالوريا</div>
            <div class="loader-bar">
                <div class="loader-bar-fill"></div>
                <div class="loader-bar-glow"></div>
            </div>
        </div>`;
    document.body.prepend(loader);
})();

// ─── COMPONENT INJECTOR ───────────────────────────────────────────────────────
async function injectComponent(selector, url) {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`Failed to fetch component: ${url} (Status: ${res.status})`);
            return;
        }
        const html = await res.text();
        const el = document.querySelector(selector);
        if (el) el.innerHTML = html;
    } catch (e) {
        console.warn(`Could not load component: ${url}`, e);
    }
}

// ─── HIDE LOADER ─────────────────────────────────────────────────────────────
function hideLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    // Guarantee minimum visible time so the animation is always seen
    const elapsed = Date.now() - _loaderShownAt;
    const delay   = Math.max(0, _LOADER_MIN_MS - elapsed);
    setTimeout(function () {
        loader.classList.add('loader-hiding');
        loader.addEventListener('transitionend', () => loader.remove(), { once: true });
        setTimeout(() => { if (loader.parentNode) loader.remove(); }, 700);
    }, delay);
}

// ─── GLOBAL CTA SECTION ──────────────────────────────────────────────────────
function injectGlobalCTA() {
    const ph = document.getElementById('global-cta-placeholder');
    if (!ph) return;

    ph.innerHTML = `
<section class="global-cta" id="global-cta">
    <!-- CTA Cards (side-by-side on desktop, rotating on mobile) -->
    <div class="gcta-cards" id="gcta-cards">
        <a href="/feedback" class="gcta-card gcta-card--feedback">
            <div class="gcta-icon-circle"><i class="fas fa-star"></i></div>
            <div class="gcta-text">
                <strong>قيّم تجربتك مع BAC STORY</strong>
                <span>رافقناك طول العام — الآن جاء دورك. اترك رأيك ونصيحتك لدفعة 2027</span>
            </div>
            <div class="gcta-btn">اكتب رأيك <i class="fas fa-arrow-left"></i></div>
        </a>
        <a href="/tools/calculator" class="gcta-card gcta-card--calc">
            <div class="gcta-icon-circle"><i class="fas fa-calculator"></i></div>
            <div class="gcta-text">
                <strong>حاسبة المعدل</strong>
                <span>احسب معدلك واعرف نتيجتك التقديرية</span>
            </div>
            <div class="gcta-btn">احسب الآن <i class="fas fa-arrow-left"></i></div>
        </a>
        <a href="/tools/weighted-calc" class="gcta-card gcta-card--weighted">
            <div class="gcta-icon-circle"><i class="fas fa-balance-scale"></i></div>
            <div class="gcta-text">
                <strong>المعدل الموزون</strong>
                <span>احسب معدلك الموزون للقبول في التخصصات الجامعية</span>
            </div>
            <div class="gcta-btn">احسب الآن <i class="fas fa-arrow-left"></i></div>
        </a>
        <a href="/university/specialities" class="gcta-card gcta-card--uni">
            <div class="gcta-icon-circle"><i class="fas fa-university"></i></div>
            <div class="gcta-text">
                <strong>مرحباً بك في مرحلة جديدة!</strong>
                <span>اكتشف نظام الجامعة الجزائرية وخطط لمستقبلك</span>
            </div>
            <div class="gcta-btn">اكتشف الجامعة <i class="fas fa-arrow-left"></i></div>
        </a>
        <a href="/tools" class="gcta-card gcta-card--timer">
            <div class="gcta-icon-circle"><i class="fas fa-hourglass-half"></i></div>
            <div class="gcta-text">
                <strong>قداه بقى؟ </strong>
                <span>شوف الوقت المتبقي للتصحيح والنتائج لحظة بلحظة</span>
            </div>
            <div class="gcta-btn">تفقد العد التنازلي <i class="fas fa-arrow-left"></i></div>
        </a>
        <a href="/bac-2026" class="gcta-card gcta-card--correct">
            <div class="gcta-icon-circle"><i class="fas fa-check-double"></i></div>
            <div class="gcta-text">
                <strong>تصحيحات بكالوريا 2026</strong>
                <span>شاهد مواضيع وحلول البكالوريا لجميع الشعب فور توفرها</span>
            </div>
            <div class="gcta-btn">تصفح الحلول <i class="fas fa-arrow-left"></i></div>
        </a>
    </div>
    <!-- Mobile-only rotation dots -->
    <div class="gcta-dots" id="gcta-dots">
        <span class="gcta-dot gcta-dot--active"></span>
        <span class="gcta-dot"></span>
        <span class="gcta-dot"></span>
        <span class="gcta-dot"></span>
        <span class="gcta-dot"></span>
        <span class="gcta-dot"></span>
    </div>
</section>`;

    // ── Card rotation (all screen sizes) ─────────────────────────
    const gcCards   = document.querySelectorAll('.gcta-card');
    const gcDots    = document.querySelectorAll('#gcta-dots .gcta-dot');
    const gcWrapper = document.getElementById('gcta-cards');
    let gcCurrent   = 0;

    function gcSetHeight() {
        // Temporarily make visible to measure, then restore
        gcCards[gcCurrent].style.position = 'relative';
        gcWrapper.style.minHeight = gcCards[gcCurrent].offsetHeight + 'px';
        gcCards[gcCurrent].style.position = '';
    }

    function gcShow(idx) {
        gcCards.forEach(function(c, i) {
            if (i === idx) {
                c.classList.remove('gcta-hidden');
                c.classList.add('gcta-visible');
            } else {
                c.classList.remove('gcta-visible');
                c.classList.add('gcta-hidden');
            }
        });
        gcDots.forEach(function(d, i) {
            d.classList.toggle('gcta-dot--active', i === idx);
        });
        setTimeout(gcSetHeight, 20);
    }

    function gcRotate() {
        gcCurrent = (gcCurrent + 1) % gcCards.length;
        gcShow(gcCurrent);
    }

    // Always show dots
    var dotsEl = document.getElementById('gcta-dots');
    if (dotsEl) dotsEl.style.display = 'flex';

    gcShow(0);
    window.addEventListener('resize', gcSetHeight);
    setInterval(gcRotate, 4000);
}

// ─── MOBILE MENU SETUP ───────────────────────────────────────────────────────
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const bottomMenuBtn = document.getElementById('bottomMenuBtn');
    const menuClose = document.getElementById('menuClose');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.querySelector('.nav-overlay');

    if (!navLinks) return;

    const toggleMenu = (show) => {
        navLinks.classList.toggle('active', show);
        if (hamburger) hamburger.classList.toggle('active', show);
        if (bottomMenuBtn) bottomMenuBtn.classList.toggle('active', show);
        if (navOverlay) navOverlay.classList.toggle('active', show);
        document.body.style.overflow = show ? 'hidden' : '';
    };

    if (hamburger) hamburger.addEventListener('click', () => toggleMenu(true));
    if (bottomMenuBtn) bottomMenuBtn.addEventListener('click', () => toggleMenu(true));
    if (menuClose) menuClose.addEventListener('click', () => toggleMenu(false));
    if (navOverlay) navOverlay.addEventListener('click', () => toggleMenu(false));

    // Close on link click
    navLinks.querySelectorAll('a:not(.dropdown-btn)').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    // Mobile dropdowns
    navLinks.querySelectorAll('.dropdown').forEach(dropdown => {
        const btn = dropdown.querySelector('.dropdown-btn');
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            // CSS mobile menu triggers at 1100px
            if (window.innerWidth <= 1100) {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = dropdown.classList.contains('active');

                // Close all other dropdowns
                navLinks.querySelectorAll('.dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.remove('active');
                });

                // Toggle this one
                if (!isOpen) {
                    dropdown.classList.add('active');
                } else {
                    dropdown.classList.remove('active');
                }
            }
        });
    });
}

// ─── SCROLL HIDE/SHOW NAVBAR ─────────────────────────────────────────────────
function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    const navBrand = document.querySelector('.nav-brand');
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        if (window.innerWidth > 768) {
            navbar.classList.remove('hidden');
            navBrand && navBrand.classList.remove('fixed');
            return;
        }
        if (window.scrollY === 0) {
            navbar.classList.remove('hidden');
            navBrand && navBrand.classList.remove('fixed');
        } else if (window.scrollY > lastScrollY) {
            navbar.classList.add('hidden');
            navBrand && navBrand.classList.add('fixed');
        } else {
            navbar.classList.remove('hidden');
            navBrand && navBrand.classList.remove('fixed');
        }
        lastScrollY = window.scrollY;
    }, { passive: true });
}

// ─── SCROLL TO TOP BUTTON ────────────────────────────────────────────────────
function setupScrollToTop() {
    if (document.getElementById('scrollTopBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'scrollTopBtn';
    btn.className = 'scroll-top-btn';
    btn.setAttribute('data-tooltip', 'العودة للأعلى');
    btn.innerHTML = `
        <i class="fas fa-chevron-up"></i>
    `;
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(btn);

    function updateProgress() {
        const scrollTop = window.scrollY;

        if (scrollTop > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }

    // Run once on load
    updateProgress();

    window.addEventListener('scroll', updateProgress, { passive: true });
}

// ─── BAC 2026 GLOBAL SHARE BUTTON ───────────────────────────────────────────
function buildBac2026ShareBtn() {
    if (document.getElementById('bacShareBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'bacShareBtn';
    btn.className = 'uni-share-btn visible';
    btn.setAttribute('data-tooltip', 'مشاركة الصفحة');
    btn.innerHTML = '<i class="fas fa-share"></i>';
    btn.addEventListener('click', handleBac2026Share);
    document.body.appendChild(btn);
}

function handleBac2026Share() {
    const url = location.href;
    const title = document.title;
    if (navigator.share) {
        navigator.share({ title, url }).catch(() => {});
    } else {
        navigator.clipboard.writeText(url).then(() => showBac2026ShareToast('تم نسخ الرابط ✓')).catch(() => {});
    }
}

function showBac2026ShareToast(msg) {
    let t = document.getElementById('bacShareToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'bacShareToast';
        t.className = 'uni-share-toast';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('visible');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('visible'), 2200);
}

// ─── WITHIN-PAGE SECTION NAVIGATION ─────────────────────────────────────────
// showSection is defined in script.js, but for pages that don't need it,
// this is a no-op fallback.
if (typeof window.showSection === 'undefined') {
    window.showSection = function (id) {
        document.querySelectorAll('.resource-content').forEach(s => s.classList.remove('active'));
        const el = document.getElementById(id);
        if (el) el.classList.add('active');

        // --- GOOGLE ANALYTICS VIRTUAL PAGEVIEW (FALLBACK) ---
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'page_view',
                page_path: window.location.pathname + (id ? '#' + id : ''),
                page_title: document.title + ' - ' + id
            });
        }
    };
}

// ─── BAC 2026 ANNOUNCEMENT MODAL ──────────────────────────────────────────────────
const BAC2026_ANNOUNCE_KEY = 'bs_seen_feedback_invite_v3';

function showBac2026AnnouncementModal() {
    if (localStorage.getItem(BAC2026_ANNOUNCE_KEY)) return;
    // Don't invite people already on the feedback page
    if (location.pathname.replace(/\/$/, '').endsWith('/feedback')) return;

    // Create the overlay container
    const overlay = document.createElement('div');
    overlay.className = 'bac2026-overlay';

    overlay.innerHTML = `
        <div class="welcome-announcement-card modal-version">
            <button class="announcement-modal-close" aria-label="إغلاق">&times;</button>
            <div class="welcome-badge-pill" style="background: linear-gradient(135deg, #ff6b1a, #e8420e); color: #fff; box-shadow: 0 4px 14px rgba(232,66,14,0.35); border: none;">
                <i class="fas fa-chart-bar"></i> دفعة 2026
            </div>
            <h3>رأيك يهمنا</h3>
            <p style="margin-bottom: 1rem;">رافقناك في مشوار بكالوريا 2026 — والآن جاء دورك: قيّم تجربتك مع BAC STORY من نجمة إلى 5 نجوم واترك نصيحتك لدفعة 2027 حول كيفية استخدام الموقع.<br><br>كلمتك تفيد موقعنا و تعطينا دفعة تحفيزية — لا تبخل علينا و على الدفعة القادمة برأيك فيه.</p>
            <div class="card-cta-group">
                <a href="/feedback" class="card-cta-btn card-cta-telegram" style="width: 100%; justify-content: center; font-size: 1.1rem; padding: 12px 40px; background: #fff; color: #2c5cc5;">
                    قيم موقعنا الآن
                </a>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Prevent scroll — set on <html> not <body> to avoid breaking position:fixed containing block
    document.documentElement.style.overflow = 'hidden';

    // Fade in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
    });

    const dismissModal = () => {
        localStorage.setItem(BAC2026_ANNOUNCE_KEY, '1');
        overlay.classList.remove('active');
        document.documentElement.style.overflow = '';
        setTimeout(() => {
            if (overlay.parentNode) overlay.remove();
        }, 500);
        document.removeEventListener('keydown', handleEsc);
    };

    // Close buttons click events
    overlay.querySelector('.announcement-modal-close').addEventListener('click', dismissModal);
    overlay.querySelectorAll('.card-cta-btn').forEach(btn => {
        btn.addEventListener('click', dismissModal);
    });

    // Close on click outside the card
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            dismissModal();
        }
    });

    // Close on ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            dismissModal();
        }
    };
    document.addEventListener('keydown', handleEsc);
}

// ─── HASH-BASED NAVIGATION ON LOAD ───────────────────────────────────────────
function handleHashNav() {
    const hash = location.hash.slice(1);
    if (hash) {
        const el = document.getElementById(hash);
        if (el && el.classList.contains('resource-content')) {
            window.showSection(hash, false);
        }
    }
}

// ─── PAGE BOOT ───────────────────────────────────────────────────────────────
// ─── SEARCH FUNCTIONALITY ─────────────────────────────────────────────────────
function setupSearch() {
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const clearSearch = document.getElementById('clearSearch');
    const closeSearch = document.getElementById('closeSearch');
    const searchBtnMobile = document.getElementById('searchBtnMobile');
    const searchBtnDesktop = document.getElementById('searchBtnDesktop');

    if (!searchOverlay || !searchInput) return;

    // ── RECENT SEARCHES ───────────────────────────────────────────────────────
    const RECENT_KEY = 'bs_recent_searches';
    const MAX_RECENT = 5;
    function getRecent() { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } }
    function saveRecent(q) {
        if (!q || q.length < 2) return;
        let r = getRecent();
        r = [q, ...r.filter(x => x !== q)].slice(0, MAX_RECENT);
        try { localStorage.setItem(RECENT_KEY, JSON.stringify(r)); } catch {}
    }
    function renderRecent() {
        const sec = document.getElementById('searchRecentSection');
        const list = document.getElementById('recentSearchesList');
        if (!sec || !list) return;
        const r = getRecent();
        if (!r.length) { sec.style.display = 'none'; return; }
        list.innerHTML = r.map(q => `<button class="recent-search-item" data-q="${q.replace(/"/g,'&quot;')}"><i class="fas fa-history"></i><span>${q}</span></button>`).join('');
        list.querySelectorAll('.recent-search-item').forEach(btn => {
            btn.addEventListener('click', () => {
                searchInput.value = btn.dataset.q;
                searchInput.dispatchEvent(new Event('input'));
                searchInput.focus();
            });
        });
        sec.style.display = 'block';
    }
    function hideRecent() { const s = document.getElementById('searchRecentSection'); if (s) s.style.display = 'none'; }

    // ── KEYBOARD NAVIGATION ───────────────────────────────────────────────────
    let focusIdx = -1;
    function setFocus(idx) {
        const items = searchResults.querySelectorAll('.search-result-item');
        focusIdx = Math.max(-1, Math.min(idx, items.length - 1));
        items.forEach((el, i) => el.classList.toggle('is-focused', i === focusIdx));
        if (focusIdx >= 0 && items[focusIdx]) items[focusIdx].scrollIntoView({ block: 'nearest' });
    }

    // ── NORMALIZATION ─────────────────────────────────────────────────────────
    const normalizeSearch = (text) => {
        if (!text) return '';
        return text.toString()
            .toLowerCase()
            .replace(/[ً-ٰٟ]/g, '')   // diacritics
            .replace(/[أإآٱ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/ئ/g, 'ي')
            .replace(/ؤ/g, 'و')
            .replace(/(^|\s)ال/g, '$1')              // strip ال per word
            .replace(/\s+/g, ' ')
            .trim();
    };

    // ── SEARCH DATA ───────────────────────────────────────────────────────────
    const navSearchData = [

        // ── SITE SECTIONS (PAGES & ANCHORS) ───────────────────────────────────
        { title: 'الرياضيات', desc: 'ملخصات، تمارين ومواضيع في الرياضيات', url: '/resources/math', icon: 'fas fa-calculator', specialty: null, keywords: ['رياضيات', 'math', 'حساب', 'ملخصات الرياضيات'] },
        { title: 'العلوم الفيزيائية', desc: 'ميكانيك، كهرباء، كيمياء وتحولات نووية', url: '/resources/sci', icon: 'fas fa-atom', specialty: null, keywords: ['فيزياء', 'فيزيائية', 'physics', 'ملخصات الفيزياء'] },
        { title: 'العلوم الطبيعية', desc: 'بيولوجيا، البروتين، المناعة والاتصال العصبي', url: '/resources/sci', icon: 'fas fa-flask', specialty: null, keywords: ['علوم طبيعية', 'بيولوجيا', 'علوم الحياة', 'ملخصات العلوم'] },
        { title: 'مواد التكنولوجيا', desc: 'هندسة مدنية، كهربائية، ميكانيكية وطرائق', url: '/resources/tech', icon: 'fas fa-microchip', specialty: null, keywords: ['تكنولوجيا', 'تقني', 'هندسة'] },
        { title: 'تسيير واقتصاد', desc: 'محاسبة، قانون، اقتصاد ومناجمنت', url: '/resources/ge', icon: 'fas fa-chart-line', specialty: null, keywords: ['تسيير', 'اقتصاد', 'management'] },
        { title: 'مواضيع البكالوريا', desc: 'مواضيع رسمية 2025 و2024 مع التصحيح', url: '/bac-topics', icon: 'fas fa-file-alt', specialty: null, keywords: ['مواضيع', 'بكالوريا', 'BAC', 'تصحيح', 'موضوع', 'اختبار رسمي', 'بكالوريات'] },
        { title: 'تصحيحات بكالوريا 2026', desc: 'الحلول النموذجية لجميع الشعب — دورة 2026', url: '/bac-2026', icon: 'fas fa-check-double', specialty: null, keywords: ['2026', 'بكالوريا 2026', 'تصحيح 2026', 'حلول 2026', 'دورة 2026', 'نتائج', 'تصحيحات'] },
        { title: 'تصحيح 2026 — رياضيات', desc: 'حلول بكالوريا 2026 شعبة رياضيات', url: '/bac-2026/matheleme', icon: 'fas fa-check-double', specialty: 'رياضيات', keywords: ['تصحيح 2026', 'بكالوريا 2026', 'رياضيات', 'حلول رياضيات', 'موضوع رياضيات 2026', 'math 2026'] },
        { title: 'تصحيح 2026 — علوم تجريبية', desc: 'حلول بكالوريا 2026 شعبة علوم تجريبية', url: '/bac-2026/sci', icon: 'fas fa-check-double', specialty: 'علوم تجريبية', keywords: ['تصحيح 2026', 'بكالوريا 2026', 'علوم تجريبية', 'حلول علوم', 'موضوع علوم 2026', 'science 2026'] },
        { title: 'تصحيح 2026 — تقني رياضي', desc: 'حلول بكالوريا 2026 شعبة تقني رياضي', url: '/bac-2026/tech', icon: 'fas fa-check-double', specialty: 'تقني رياضي', keywords: ['تصحيح 2026', 'بكالوريا 2026', 'تقني رياضي', 'تقني', 'tech 2026'] },
        { title: 'تصحيح 2026 — تسيير واقتصاد', desc: 'حلول بكالوريا 2026 شعبة تسيير واقتصاد', url: '/bac-2026/ge', icon: 'fas fa-check-double', specialty: 'تسيير واقتصاد', keywords: ['تصحيح 2026', 'بكالوريا 2026', 'تسيير', 'اقتصاد', 'ge 2026'] },
        { title: 'تصحيح 2026 — آداب وفلسفة', desc: 'حلول بكالوريا 2026 شعبة آداب وفلسفة', url: '/bac-2026/le', icon: 'fas fa-check-double', specialty: 'آداب وفلسفة', keywords: ['تصحيح 2026', 'بكالوريا 2026', 'آداب', 'فلسفة', 'أدب 2026'] },
        { title: 'تصحيح 2026 — لغات أجنبية', desc: 'حلول بكالوريا 2026 شعبة لغات أجنبية', url: '/bac-2026/lp', icon: 'fas fa-check-double', specialty: 'لغات أجنبية', keywords: ['تصحيح 2026', 'بكالوريا 2026', 'لغات أجنبية', 'لغات', 'lp 2026'] },
        { title: 'محاكاة البكالوريا', desc: 'اختبارات تجريبية لمحاكاة ظروف الباك الحقيقية', url: '/simulation', icon: 'fas fa-vr-cardboard', specialty: null, keywords: ['محاكاة', 'تجريبي', 'امتحان تجريبي', 'simulation', 'محاكاة الباك', 'اختبار تجريبي'] },
        { title: 'باقات عقبة بن نافع', desc: 'دروس وتمارين منظمة من عقبة بن نافع', url: '/oqba', icon: 'fas fa-star', specialty: null, keywords: ['عقبة', 'عقبة بن نافع', 'باقات عقبة', 'oqba', 'باقات'] },
        { title: 'الكتب الخارجية', desc: 'كتب دراسية مختارة لتعميق الفهم في كل مادة', url: '/resources/books', icon: 'fas fa-book', specialty: null, keywords: ['كتب', 'كتاب', 'كتب خارجية', 'مراجع', 'مرجع', 'books', 'كتب دراسية'] },
        { title: 'درايفات المتفوقين', desc: 'ملفات مشتركة من أوائل البكالوريا', url: '/resources/drives', icon: 'fab fa-google-drive', specialty: null, keywords: ['درايف', 'Google Drive', 'المتفوقين', 'إسلام', 'لين', 'سارة', 'حكيم', 'Islam', 'Leen', 'Sara', 'Hakime'] },
        { title: 'الخطط الشهرية', desc: 'خطط دراسية شهرية شاملة لجميع المواد', url: '/plans/monthly', icon: 'fas fa-calendar-alt', specialty: null, keywords: ['الخطط الشهرية', 'خطط شهرية', 'خطة شهرية', 'مراجعة شهرية', 'جدول مراجعة', 'خطة دراسية'] },
        { title: 'خطط التميز للمواد', desc: 'خطط متخصصة لكل مادة للوصول للمعدل الأمثل', url: '/plans/subject-plans', icon: 'fas fa-book-open', specialty: null, keywords: ['خطط المواد', 'خطة مادة', 'خطط التميز', 'تميز مادة', 'خطة الرياضيات', 'خطة الفيزياء', 'خطة دراسية'] },
        { title: 'تحديات التميز', desc: 'تحديات يومية وأسبوعية لتطوير مستواك', url: '/plans/challenges', icon: 'fas fa-trophy', specialty: null, keywords: ['تحديات', 'تحدي', 'تميز', 'تحدي يومي', 'تحدي أسبوعي', 'رفع مستوى', 'challenges'] },
        { title: 'العد التنازلي للنتائج', desc: 'كم تبقى على نتائج البكالوريا؟', url: '/tools/countdown', icon: 'fas fa-hourglass-half', specialty: null, keywords: ['العد التنازلي', 'الوقت المتبقي', 'نتائج', 'وقت', 'مؤقت', 'timer', 'قداه بقى', 'متبقي'] },
        { title: 'حاسبة معدل البكالوريا', desc: 'احسب معدلك التقديري بدقة قبل النتائج', url: '/tools/calculator', icon: 'fas fa-calculator', specialty: null, keywords: ['حاسبة', 'معدل', 'احسب معدلي', 'حساب المعدل', 'calculator', 'معدلي', 'احتساب'] },
        { title: 'المعدل الموزون', desc: 'احسب معدلك الموزون للقبول في الجامعات', url: '/tools/weighted-calc', icon: 'fas fa-balance-scale', specialty: null, keywords: ['المعدل الموزون', 'معدل الباك', 'قبول جامعي', 'احتساب المعدل', 'التوجيه', 'موزون'] },
        { title: 'ورقة الإجابة', desc: 'نسخة رقمية من ورقة إجابة البكالوريا الرسمية', url: '/tools/exam-sheet', icon: 'fas fa-file-alt', specialty: null, keywords: ['ورقة الإجابة', 'ورقة امتحان', 'ورقة رسمية', 'exam sheet', 'نموذج', 'استمارة', 'ورقة اجابة'] },
        { title: 'النظام الجامعي الجزائري', desc: 'كل ما تحتاج معرفته عن نظام LMD والجامعة', url: '/university', icon: 'fas fa-university', specialty: null, keywords: ['النظام الجامعي', 'LMD', 'nظام lmd', 'ليسانس ماستر دكتوراه', 'الجامعة الجزائرية', 'نظام الجامعة'] },
        { title: 'الدليل الوزاري للتخصصات', desc: 'الدليل الرسمي لوزارة التعليم العالي', url: '/university/ministry-guide', icon: 'fas fa-scroll', specialty: null, keywords: ['الدليل الوزاري', 'وزاري', 'وزارة', 'الدليل الرسمي', 'دليل التخصصات', 'ministry'] },
        { title: 'التسجيل في المدارس العسكرية', desc: 'دليل التجنيد في الجيش الوطني الشعبي بعد البكالوريا', url: '/university/military-guide', icon: 'fas fa-shield-alt', specialty: null, keywords: ['عسكري', 'مدارس عسكرية', 'جيش', 'تجنيد', 'الجيش الوطني الشعبي', 'ANP', 'mdn', 'preinscription', 'وزارة الدفاع', 'تسجيل عسكري', 'الدفاع الوطني'] },
        { title: 'تخصصات الجامعة والمدارس', desc: 'تعريف كامل بجميع التخصصات الجامعية', url: '/university/specialities', icon: 'fas fa-graduation-cap', specialty: null, keywords: ['تخصصات', 'تخصص جامعي', 'مدارس عليا', 'اختيار تخصص', 'توجيه جامعي', 'جامعة', 'LMD', 'ESTIN', 'ESI', 'ENSIA'] },
        { title: 'معدلات القبول 2025', desc: 'معدلات القبول الرسمية لجميع التخصصات', url: '/university/averages-of-acceptance', icon: 'fas fa-chart-bar', specialty: null, keywords: ['معدلات القبول', 'معدل القبول', 'قبول 2025', 'المعدل المطلوب', 'شروط القبول', 'دخول الجامعة', 'معدل دخول'] },

        // ── MATH — SPECIALTY SECTIONS ──────────────────────────────────────
        { title: 'الرياضيات', desc: 'دروس، ملخصات وتمارين', url: '/resources/math', icon: 'fas fa-calculator', specialty: 'رياضيات', keywords: ['رياضيات', 'ملخصات', 'دروس', 'تمارين'] },
        { title: 'الرياضيات', desc: 'دروس، ملخصات وتمارين', url: '/resources/sci', icon: 'fas fa-calculator', specialty: 'علوم تجريبية', keywords: ['رياضيات', 'ملخصات', 'دروس', 'تمارين'] },
        { title: 'الرياضيات', desc: 'دروس، ملخصات وتمارين', url: '/resources/tech', icon: 'fas fa-calculator', specialty: 'تقني رياضي', keywords: ['رياضيات', 'ملخصات', 'دروس', 'تمارين'] },
        { title: 'الرياضيات', desc: 'دروس، ملخصات وتمارين', url: '/resources/ge', icon: 'fas fa-calculator', specialty: 'تسيير واقتصاد', keywords: ['رياضيات', 'ملخصات', 'دروس', 'تمارين'] },
        { title: 'الرياضيات', desc: 'الرياضيات المختزلة', url: '/resources/le', icon: 'fas fa-calculator', specialty: 'آداب · لغات', keywords: ['رياضيات', 'ملخصات', 'دروس'] },

        // ── MATH — GRANULAR TOPICS ─────────────────────────────────────────
        { title: 'الدوال العددية', desc: 'حدود، اشتقاق ودراسة دالة', url: '/resources/math', icon: 'fas fa-wave-square', specialty: 'علوم · تقني · رياضيات', keywords: ['الدوال', 'دالة', 'اشتقاق', 'حدود', 'نهايات', 'دراسة دالة', 'تمثيل بياني'] },
        { title: 'الدوال العددية', desc: 'الدوال — آداب ولغات', url: '/resources/le', icon: 'fas fa-wave-square', specialty: 'آداب · لغات', keywords: ['الدوال', 'دالة', 'اشتقاق', 'حدود'] },
        { title: 'الدوال اللوغاريتمية', desc: 'الدالة اللوغاريتمية وتطبيقاتها', url: '/resources/ge', icon: 'fas fa-wave-square', specialty: 'تسيير واقتصاد', keywords: ['لوغاريتم', 'لوغاريتمية', 'ln', 'log', 'الدوال'] },
        { title: 'الدوال الأسية', desc: 'الدالة الأسية والتطبيقات', url: '/resources/ge', icon: 'fas fa-wave-square', specialty: 'تسيير واقتصاد', keywords: ['دوال أسية', 'الأسية', 'exp', 'الدوال'] },
        { title: 'الدوال الأصلية', desc: 'حساب التكامل والدوال الأصلية', url: '/resources/ge', icon: 'fas fa-wave-square', specialty: 'تسيير واقتصاد', keywords: ['الدوال الأصلية', 'تكامل', 'أصلية', 'الدوال'] },
        { title: 'الدوال العددية', desc: 'الدوال والمنحنيات — تسيير واقتصاد', url: '/resources/ge', icon: 'fas fa-wave-square', specialty: 'تسيير واقتصاد', keywords: ['الدوال', 'دالة عددية', 'الدوال العددية'] },
        { title: 'المتتاليات العددية', desc: 'متتاليات حسابية وهندسية', url: '/resources/math', icon: 'fas fa-sort-numeric-up', specialty: 'علوم · تقني · رياضيات', keywords: ['المتتاليات', 'متتالية', 'حسابية', 'هندسية', 'متتاليات عددية'] },
        { title: 'المتتاليات العددية', desc: 'المتتاليات — آداب ولغات', url: '/resources/le', icon: 'fas fa-sort-numeric-up', specialty: 'آداب · لغات', keywords: ['المتتاليات', 'متتالية', 'حسابية', 'هندسية'] },
        { title: 'المتتاليات', desc: 'مسائل المتتاليات — تسيير واقتصاد', url: '/resources/ge', icon: 'fas fa-sort-numeric-up', specialty: 'تسيير واقتصاد', keywords: ['المتتاليات', 'متتالية'] },
        { title: 'الجبر والأعداد', desc: 'القسمة في Z، المنطق والمعادلات', url: '/resources/math', icon: 'fas fa-superscript', specialty: 'علوم · تقني · رياضيات', keywords: ['الجبر', 'الأعداد', 'القسمة', 'PGCD', 'PPCM', 'منطق', 'جبر'] },
        { title: 'الجبر والأعداد', desc: 'الجبر المختزل — آداب ولغات', url: '/resources/le', icon: 'fas fa-superscript', specialty: 'آداب · لغات', keywords: ['الجبر', 'الأعداد'] },
        { title: 'الاحتمالات', desc: 'شرطية، برنولي وباواسون', url: '/resources/math', icon: 'fas fa-dice', specialty: 'علوم · تقني · رياضيات', keywords: ['الاحتمالات', 'احتمال', 'برنولي', 'باواسون', 'احتمالات شرطية'] },
        { title: 'الاحتمالات', desc: 'الاحتمالات — آداب ولغات', url: '/resources/le', icon: 'fas fa-dice', specialty: 'آداب · لغات', keywords: ['الاحتمالات', 'احتمال'] },
        { title: 'الاحتمالات', desc: 'الاحتمالات — تسيير واقتصاد', url: '/resources/ge', icon: 'fas fa-dice', specialty: 'تسيير واقتصاد', keywords: ['الاحتمالات', 'احتمال'] },
        { title: 'الإحصاء', desc: 'الإحصاء الوصفي والتحليلي', url: '/resources/ge', icon: 'fas fa-chart-bar', specialty: 'تسيير واقتصاد', keywords: ['الإحصاء', 'إحصاء', 'إحصائيات', 'statistics'] },
        { title: 'الأعداد المركبة', desc: 'الأشكال الثلاثية، هرميتي وتطبيقات', url: '/resources/math', icon: 'fas fa-infinity', specialty: 'علوم · تقني · رياضيات', keywords: ['الأعداد المركبة', 'مركبة', 'أعداد مركبة', 'هرميتي', 'مركب'] },
        { title: 'المعادلات التفاضلية', desc: 'تمارين وملخصات المعادلات التفاضلية', url: '/resources/math', icon: 'fas fa-equals', specialty: 'رياضيات', keywords: ['المعادلات التفاضلية', 'تفاضلية'] },
        { title: 'مجلات الخليل', desc: 'أفكار الوحدة وتمارين مجلة الخليل', url: '/resources/math', icon: 'fas fa-book-open', specialty: null, keywords: ['الخليل', 'مجلات الخليل', 'أفكار الوحدة'] },
        { title: 'المكتسبات القبلية', desc: 'مراجعة الأساسيات — رياضيات', url: '/resources/math', icon: 'fas fa-star', specialty: 'رياضيات', keywords: ['المكتسبات القبلية', 'مراجعة', 'أساسيات رياضيات'] },

        // ── PHYSICS — SPECIALTY SECTIONS ──────────────────────────────────
        { title: 'العلوم الفيزيائية', desc: 'ميكانيك، كهرباء وكيمياء', url: '/resources/math', icon: 'fas fa-atom', specialty: 'رياضيات · تقني', keywords: ['فيزياء', 'فيزيائية', 'ملخصات', 'تمارين'] },
        { title: 'العلوم الفيزيائية', desc: 'ميكانيك، كهرباء وكيمياء', url: '/resources/sci', icon: 'fas fa-atom', specialty: 'علوم تجريبية', keywords: ['فيزياء', 'فيزيائية', 'ملخصات', 'تمارين'] },

        // ── PHYSICS — GRANULAR TOPICS ──────────────────────────────────────
        { title: 'المتابعة الزمنية للحركات', desc: 'حركة الأجسام، تركيبات السرعات والقذيفة', url: '/resources/sci', icon: 'fas fa-clock', specialty: null, keywords: ['المتابعة', 'الزمنية', 'حركة', 'سرعة', 'السقوط', 'القذيفة', 'متابعة زمنية'] },
        { title: 'الميكانيك', desc: 'القوى، الديناميكا والمستوى المائل', url: '/resources/sci', icon: 'fas fa-cogs', specialty: null, keywords: ['الميكانيك', 'ميكانيك', 'القوى', 'الديناميكا', 'الأقمار', 'الجاذبية', 'مستوى مائل'] },
        { title: 'الكهرباء', desc: 'الدوائر الكهربائية RLC، RC، RL', url: '/resources/sci', icon: 'fas fa-bolt', specialty: null, keywords: ['الكهرباء', 'كهربائية', 'RLC', 'RC', 'RL', 'تذبذبات', 'كهرباء'] },
        { title: 'الأحماض والأسس', desc: 'المعايرة، pH والأحماض الضعيفة والقوية', url: '/resources/sci', icon: 'fas fa-vial', specialty: null, keywords: ['الأحماض', 'الأسس', 'معايرة', 'ph', 'كيمياء', 'أحماض', 'أسس'] },
        { title: 'التحولات النووية', desc: 'الانشطار، الاندماج والنشاط الإشعاعي', url: '/resources/sci', icon: 'fas fa-radiation', specialty: null, keywords: ['النووي', 'التحولات النووية', 'انشطار', 'اندماج', 'إشعاعي', 'نووي', 'تحولات نووية'] },
        { title: 'الأعمدة الكهربائية', desc: 'مصادر الطاقة، القوة الدافعة وبطاريات', url: '/resources/sci', icon: 'fas fa-battery-half', specialty: null, keywords: ['الأعمدة', 'الكهربائية', 'بطاريات', 'قوة دافعة', 'أعمدة كهربائية'] },
        { title: 'الأسترة والكيمياء العضوية', desc: 'الأسترة، الصابنة والتوازن الكيميائي', url: '/resources/sci', icon: 'fas fa-flask', specialty: null, keywords: ['الأسترة', 'صابنة', 'تحولات كيميائية', 'توازن', 'أستر', 'أسترة'] },
        { title: 'الأسئلة النظرية والمنحنيات', desc: 'مقالات نظرية وقراءة المنحنيات', url: '/resources/sci', icon: 'fas fa-chart-line', specialty: null, keywords: ['نظرية', 'مقالات نظرية', 'منحنيات', 'رسوم بيانية', 'نظري'] },
        { title: 'المكتسبات القبلية', desc: 'مراجعة الأساسيات — فيزياء', url: '/resources/sci', icon: 'fas fa-star', specialty: 'فيزياء', keywords: ['المكتسبات القبلية', 'مراجعة', 'أساسيات فيزياء'] },

        // ── SCIENCE — SPECIALTY SECTIONS ──────────────────────────────────
        { title: 'العلوم الطبيعية', desc: 'بيولوجيا وعلوم الحياة', url: '/resources/sci', icon: 'fas fa-dna', specialty: 'علوم تجريبية', keywords: ['علوم طبيعية', 'بيولوجيا', 'علوم الحياة', 'ملخصات', 'تمارين'] },
        { title: 'العلوم الطبيعية', desc: 'بيولوجيا وعلوم الحياة', url: '/resources/math', icon: 'fas fa-dna', specialty: 'رياضيات', keywords: ['علوم طبيعية', 'بيولوجيا', 'علوم الحياة', 'ملخصات', 'تمارين'] },

        // ── SCIENCE — GRANULAR TOPICS ──────────────────────────────────────
        { title: 'تركيب البروتين', desc: 'الشيفرة الجينية، النسخ والترجمة', url: '/resources/sci', icon: 'fas fa-dna', specialty: null, keywords: ['تركيب البروتين', 'البروتين', 'الشيفرة الجينية', 'النسخ', 'الترجمة', 'البروتين'] },
        { title: 'بنية ووظيفة البروتين', desc: 'العلاقة بين التركيب والوظيفة', url: '/resources/sci', icon: 'fas fa-dna', specialty: null, keywords: ['بنية البروتين', 'وظيفة البروتين', 'العلاقة بين بنية ووظيفة', 'البروتين'] },
        { title: 'الإنزيمات', desc: 'نشاط الإنزيمات وعوامل التأثير', url: '/resources/sci', icon: 'fas fa-flask', specialty: null, keywords: ['الإنزيمات', 'إنزيم', 'إنزيمات', 'نشاط إنزيمي'] },
        { title: 'المناعة', desc: 'المناعة الخلطية والخلوية، اللقاح والمصل', url: '/resources/sci', icon: 'fas fa-shield-alt', specialty: null, keywords: ['المناعة', 'مناعة', 'مناعي', 'اللقاح', 'المصل', 'خلوية', 'خلطية', 'مناعية'] },
        { title: 'الاتصال العصبي', desc: 'السيالة العصبية والتشابك العصبي', url: '/resources/sci', icon: 'fas fa-brain', specialty: null, keywords: ['الاتصال العصبي', 'العصبي', 'السيالة', 'تشابك', 'عصبي'] },
        { title: 'التركيب الضوئي', desc: 'تحويل الطاقة الضوئية وعوامل التأثير', url: '/resources/sci', icon: 'fas fa-seedling', specialty: null, keywords: ['التركيب الضوئي', 'البناء الضوئي', 'الكلوروفيل', 'ضوئي', 'بناء ضوئي'] },
        { title: 'التنفس الخلوي', desc: 'مراحل التنفس وتبادل الغازات', url: '/resources/sci', icon: 'fas fa-lungs', specialty: null, keywords: ['التنفس', 'الخلوي', 'تنفس', 'أكسدة', 'تنفس خلوي'] },
        { title: 'المكتسبات القبلية', desc: 'مراجعة الأساسيات — علوم طبيعية', url: '/resources/sci', icon: 'fas fa-star', specialty: 'علوم طبيعية', keywords: ['المكتسبات القبلية', 'مراجعة', 'أساسيات علوم'] },

        // ── TECHNOLOGY TYPES ───────────────────────────────────────────────
        { title: 'الهندسة المدنية', desc: 'مقاومة المواد، التربة والمنشآت', url: '/resources/tech', icon: 'fas fa-hard-hat', specialty: 'تقني رياضي', keywords: ['الهندسة المدنية', 'مدني', 'مقاومة المواد', 'التربة', 'خرسانة', 'هندسة مدنية'] },
        { title: 'الهندسة الكهربائية', desc: 'الأنظمة الكهربائية والإلكترونية', url: '/resources/tech', icon: 'fas fa-plug', specialty: 'تقني رياضي', keywords: ['الهندسة الكهربائية', 'كهربائية', 'إلكترونية', 'دوائر', 'هندسة كهربائية'] },
        { title: 'الهندسة الميكانيكية', desc: 'الأنظمة الميكانيكية وتحليل الحركات', url: '/resources/tech', icon: 'fas fa-cog', specialty: 'تقني رياضي', keywords: ['الهندسة الميكانيكية', 'ميكانيكية', 'الأنظمة', 'هندسة ميكانيكية'] },
        { title: 'هندسة الطرائق', desc: 'تصميم الطرق والمشاريع الإنشائية', url: '/resources/tech', icon: 'fas fa-road', specialty: 'تقني رياضي', keywords: ['هندسة الطرائق', 'طرائق', 'الطرق', 'إنشائية'] },

        // ── MANAGEMENT TOPICS ──────────────────────────────────────────────
        { title: 'المحاسبة التحليلية والمالية', desc: 'التكاليف، التحليل المالي والتسيير المحاسبي', url: '/resources/ge', icon: 'fas fa-calculator', specialty: 'تسيير واقتصاد', keywords: ['المحاسبة', 'محاسبة', 'التحليل المالي', 'تكاليف', 'ميزانية', 'محاسبة تحليلية'] },
        { title: 'القانون والاقتصاد', desc: 'القانون التجاري والمبادئ الاقتصادية', url: '/resources/ge', icon: 'fas fa-gavel', specialty: 'تسيير واقتصاد', keywords: ['القانون', 'قانون', 'تجاري', 'عقود', 'اقتصاد وقانون'] },
        { title: 'الاقتصاد والمناجمنت', desc: 'تسيير المؤسسة، التسويق والاستراتيجية', url: '/resources/ge', icon: 'fas fa-chart-line', specialty: 'تسيير واقتصاد', keywords: ['الاقتصاد', 'المناجمنت', 'management', 'تسويق', 'المؤسسة', 'اقتصاد ومناجمنت'] },

        // ── ARABIC — SPECIALTY SECTIONS ───────────────────────────────────
        { title: 'اللغة العربية', desc: 'الشعر، النثر، القواعد والبلاغة', url: '/resources', icon: 'fas fa-book', specialty: null, keywords: ['العربية', 'اللغة العربية', 'عربي', 'arabic', 'عربية'] },
        { title: 'اللغة العربية', desc: 'الأدب العربي الكلاسيكي والحديث', url: '/resources/le', icon: 'fas fa-book', specialty: 'آداب وفلسفة', keywords: ['العربية', 'اللغة العربية', 'عربي', 'أدب عربي'] },
        { title: 'اللغة العربية', desc: 'القواعد، المصطلحات والنصوص', url: '/resources/lp', icon: 'fas fa-book', specialty: 'لغات أجنبية', keywords: ['العربية', 'اللغة العربية', 'عربي'] },

        // ── ARABIC — GRANULAR TOPICS ───────────────────────────────────────
        { title: 'الشعر التعليمي', desc: 'قصائد الشعر التعليمي وتحليلها', url: '/resources/le', icon: 'fas fa-feather-alt', specialty: null, keywords: ['شعر تعليمي', 'الشعر التعليمي', 'شعر', 'قصيدة', 'تعليمي'] },
        { title: 'الشعر المهجري', desc: 'أدب المهجر وأبرز شعرائه', url: '/resources/le', icon: 'fas fa-feather-alt', specialty: null, keywords: ['شعر مهجري', 'المهجري', 'المهجر', 'شعر'] },
        { title: 'الشعر السياسي', desc: 'الشعر في خدمة القضايا السياسية', url: '/resources/le', icon: 'fas fa-feather-alt', specialty: null, keywords: ['شعر سياسي', 'السياسي', 'شعر'] },
        { title: 'الشعر الاجتماعي', desc: 'القضايا الاجتماعية في الشعر العربي', url: '/resources/le', icon: 'fas fa-feather-alt', specialty: null, keywords: ['شعر اجتماعي', 'الاجتماعي', 'شعر'] },
        { title: 'شعر الآداب', desc: 'الشعر الكلاسيكي والحديث', url: '/resources/le', icon: 'fas fa-feather-alt', specialty: 'آداب وفلسفة', keywords: ['شعر', 'الشعر', 'قصيدة', 'أدب'] },
        { title: 'نثر الآداب', desc: 'النثر الأدبي والنصوص', url: '/resources/le', icon: 'fas fa-pen', specialty: 'آداب وفلسفة', keywords: ['النثر', 'نثر', 'نصوص أدبية', 'أدب'] },
        { title: 'النشر العلمي المتأدب', desc: 'النصوص العلمية الأدبية وتحليلها', url: '/resources', icon: 'fas fa-pen', specialty: null, keywords: ['النشر العلمي', 'نشر علمي', 'نثر علمي', 'متأدب'] },
        { title: 'فن المقال', desc: 'كتابة المقال الأدبي والنقدي', url: '/resources', icon: 'fas fa-pen-alt', specialty: null, keywords: ['فن المقال', 'المقال', 'مقال', 'مقالة'] },
        { title: 'القواعد اللغوية', desc: 'النحو والصرف والإعراب', url: '/resources', icon: 'fas fa-spell-check', specialty: null, keywords: ['القواعد', 'اللغوية', 'النحو', 'الصرف', 'الإعراب', 'قواعد'] },
        { title: 'البلاغة والصور البيانية', desc: 'الاستعارة، التشبيه والمجاز', url: '/resources', icon: 'fas fa-star', specialty: null, keywords: ['البلاغة', 'الصور البيانية', 'بيانية', 'استعارة', 'تشبيه', 'مجاز', 'بلاغة'] },

        // ── FRENCH — SPECIALTY SECTIONS ───────────────────────────────────
        { title: 'اللغة الفرنسية', desc: 'النصوص، التعبير الكتابي والقواعد', url: '/resources', icon: 'fas fa-language', specialty: null, keywords: ['الفرنسية', 'فرنسي', 'français', 'french', 'فرنسية'] },
        { title: 'اللغة الفرنسية', desc: 'الفرنسية الأدبية', url: '/resources/le', icon: 'fas fa-language', specialty: 'آداب وفلسفة', keywords: ['الفرنسية', 'فرنسي', 'français', 'فرنسية'] },
        { title: 'اللغة الفرنسية', desc: 'الفرنسية — شعبة لغات', url: '/resources/lp', icon: 'fas fa-language', specialty: 'لغات أجنبية', keywords: ['الفرنسية', 'فرنسي', 'français', 'فرنسية'] },

        // ── ENGLISH — SPECIALTY SECTIONS ──────────────────────────────────
        { title: 'اللغة الإنجليزية', desc: 'نصوص، محادثة وقواعد الإنجليزية', url: '/resources', icon: 'fas fa-globe', specialty: null, keywords: ['الإنجليزية', 'إنجليزي', 'English', 'إنجليزية', 'انجليزية', 'Grammer'] },
        { title: 'اللغة الإنجليزية', desc: 'الإنجليزية الأدبية', url: '/resources/le', icon: 'fas fa-globe', specialty: 'آداب وفلسفة', keywords: ['الإنجليزية', 'إنجليزي', 'English', 'إنجليزية'] },
        { title: 'اللغة الإنجليزية', desc: 'الإنجليزية — شعبة لغات', url: '/resources/lp', icon: 'fas fa-globe', specialty: 'لغات أجنبية', keywords: ['الإنجليزية', 'إنجليزي', 'English', 'إنجليزية'] },

        // ── PHILOSOPHY — SPECIALTY SECTIONS ───────────────────────────────
        { title: 'الفلسفة', desc: 'مقالات فلسفية، جدلية واستقصاء', url: '/resources', icon: 'fas fa-lightbulb', specialty: null, keywords: ['الفلسفة', 'فلسفة', 'مقالة فلسفية', 'جدلية', 'استقصاء', 'فلسفي'] },
        { title: 'الفلسفة', desc: 'الفلسفة الأدبية', url: '/resources/le', icon: 'fas fa-lightbulb', specialty: 'آداب وفلسفة', keywords: ['الفلسفة', 'فلسفة', 'مقالة فلسفية', 'جدلية', 'فلسفي'] },
        { title: 'الفلسفة', desc: 'الفلسفة — شعبة لغات', url: '/resources/lp', icon: 'fas fa-lightbulb', specialty: 'لغات أجنبية', keywords: ['الفلسفة', 'فلسفة', 'مقالة فلسفية', 'فلسفي'] },

        // ── HISTORY-GEO — SPECIALTY SECTIONS ──────────────────────────────
        { title: 'التاريخ والجغرافيا', desc: 'الثورة الجزائرية، الحرب الباردة وحركات التحرر', url: '/resources', icon: 'fas fa-map-marked-alt', specialty: null, keywords: ['التاريخ', 'الجغرافيا', 'تاريخ', 'جغرافيا', 'الثورة الجزائرية', 'الحرب الباردة'] },
        { title: 'التاريخ والجغرافيا', desc: 'التاريخ والجغرافيا', url: '/resources/ge', icon: 'fas fa-map-marked-alt', specialty: 'تسيير واقتصاد', keywords: ['التاريخ', 'الجغرافيا', 'تاريخ', 'جغرافيا'] },
        { title: 'التاريخ والجغرافيا', desc: 'التاريخ والجغرافيا', url: '/resources/le', icon: 'fas fa-map-marked-alt', specialty: 'آداب وفلسفة', keywords: ['التاريخ', 'الجغرافيا', 'تاريخ', 'جغرافيا'] },
        { title: 'التاريخ والجغرافيا', desc: 'التاريخ والجغرافيا', url: '/resources/lp', icon: 'fas fa-map-marked-alt', specialty: 'لغات أجنبية', keywords: ['التاريخ', 'الجغرافيا', 'تاريخ', 'جغرافيا'] },
        { title: 'التاريخ — ملخصات', desc: 'الثورة الجزائرية والتاريخ الحديث', url: '/resources', icon: 'fas fa-landmark', specialty: null, keywords: ['الثورة الجزائرية', 'جزائر', 'الاستعمار', 'تاريخ الجزائر', 'التاريخ', 'حركات التحرر'] },
        { title: 'الجغرافيا — ملخصات', desc: 'ملخصات الجغرافيا والخرائط', url: '/resources', icon: 'fas fa-globe-africa', specialty: null, keywords: ['الجغرافيا', 'جغرافيا', 'خرائط', 'خريطة'] },

        // ── ISLAMICS ───────────────────────────────────────────────────────
        { title: 'العلوم الإسلامية', desc: 'العقيدة، الشريعة والفقه الإسلامي', url: '/resources', icon: 'fas fa-mosque', specialty: null, keywords: ['العلوم الإسلامية', 'الشريعة', 'الإسلامية', 'الفقه', 'العقيدة', 'الميراث', 'الربا', 'شريعة', 'إسلاميات'] },

        // ── TAMAZIGHT ──────────────────────────────────────────────────────
        { title: 'اللغة الأمازيغية', desc: 'دروس وملخصات الأمازيغية', url: '/resources', icon: 'fas fa-mountain', specialty: null, keywords: ['الأمازيغية', 'أمازيغ', 'تمازيغت', 'tamazight', 'Tamazight', 'أمازيغية'] },

        // ── FOREIGN LANGUAGES (شعبة لغات) ─────────────────────────────────
        { title: 'اللغة الألمانية', desc: 'قواعد، مصطلحات وكتب الألمانية', url: '/resources/lp', icon: 'fas fa-globe-europe', specialty: 'لغات أجنبية', keywords: ['الألمانية', 'ألماني', 'Deutsch', 'German', 'ألمانية', 'allemand'] },
        { title: 'اللغة الإسبانية', desc: 'قواعد، مصطلحات وكتب الإسبانية', url: '/resources/lp', icon: 'fas fa-globe-europe', specialty: 'لغات أجنبية', keywords: ['الإسبانية', 'إسباني', 'Español', 'Spanish', 'إسبانية', 'espagnol'] },
        { title: 'اللغة الإيطالية', desc: 'قواعد، مصطلحات وكتب الإيطالية', url: '/resources/lp', icon: 'fas fa-globe-europe', specialty: 'لغات أجنبية', keywords: ['الإيطالية', 'إيطالي', 'Italiano', 'Italian', 'إيطالية', 'italien'] },

        // ── SPECIALTY OVERVIEWS ────────────────────────────────────────────
        { title: 'شعبة آداب وفلسفة', desc: 'جميع مواد وموارد شعبة الآداب وفلسفة', url: '/resources/le', icon: 'fas fa-pen-nib', specialty: 'آداب وفلسفة', keywords: ['آداب', 'فلسفة', 'أدب', 'شعبة آداب', 'أدب وفلسفة'] },
        { title: 'شعبة لغات أجنبية', desc: 'جميع مواد وموارد شعبة اللغات الأجنبية', url: '/resources/lp', icon: 'fas fa-comments', specialty: 'لغات أجنبية', keywords: ['لغات', 'لغات أجنبية', 'شعبة لغات', 'اللغات'] },

        // ── UNIVERSITY SPECIALTIES — TOP SCHOOLS ──────────────────────────
        { title: 'ESTIN بجاية', desc: 'ذكاء اصطناعي، أمن سيبراني وإنترنت الأشياء', url: '/university/speciality/estin', icon: 'fas fa-robot', specialty: 'مدارس عليا', keywords: ['ESTIN', 'estin', 'بجاية', 'ذكاء اصطناعي', 'أمن سيبراني', 'cybersécurité', 'intelligence artificielle', 'iot', 'génie informatique', 'رقمنة', 'machine learning'] },
        { title: 'ESI الجزائر', desc: 'المدرسة العليا للإعلام الآلي — بن عكنون', url: '/university/speciality/esi-alger', icon: 'fas fa-laptop-code', specialty: 'مدارس عليا', keywords: ['ESI', 'esi', 'ISI', 'SIW', 'IRS', 'HCD', 'إعلام آلي', 'génie logiciel', 'سيبراني', 'بن عكنون', 'شبكات'] },
        { title: 'ESI-SBA سيدي بلعباس', desc: 'ذكاء اصطناعي، علوم البيانات ومعمارية الحاسوب', url: '/university/speciality/esi-sba', icon: 'fas fa-laptop-code', specialty: 'مدارس عليا', keywords: ['ESI-SBA', 'esi sba', 'سيدي بلعباس', 'IASD', 'CYS', 'data science', 'علوم بيانات', 'machine learning', 'وهران'] },
        { title: 'ENSIA — الذكاء الاصطناعي', desc: 'المدرسة الوطنية العليا للذكاء الاصطناعي', url: '/university/speciality/ensia', icon: 'fas fa-brain', specialty: 'مدارس عليا', keywords: ['ENSIA', 'ensia', 'ذكاء اصطناعي', 'intelligence artificielle', 'machine learning', 'deep learning', 'neural networks', 'big data', 'AI'] },
        { title: 'ENSCS — الأمن السيبراني', desc: 'المدرسة الوطنية العليا للأمن السيبراني', url: '/university/speciality/enscs', icon: 'fas fa-shield-alt', specialty: 'مدارس عليا', keywords: ['ENSCS', 'enscs', 'cybersécurité', 'سيبراني', 'pentest', 'أمن معلومات', 'ethical hacking', 'أمن شبكات', 'cybersecurity'] },
        { title: 'Polytechnique الجزائر', desc: 'المعهد الوطني البوليتكنيكي — متعدد التخصصات', url: '/university/speciality/polytech', icon: 'fas fa-cogs', specialty: 'مدارس عليا', keywords: ['Polytech', 'polytechnique', 'هندسة مدنية', 'ميكانيك', 'كهربائية', 'كيميائية', 'multidisciplinaire', 'بوليتكنيك'] },
        { title: 'NHSM — الرياضيات', desc: 'المدرسة الوطنية العليا للرياضيات', url: '/university/speciality/nhsm', icon: 'fas fa-square-root-alt', specialty: 'مدارس عليا', keywords: ['NHSM', 'nhsm', 'رياضيات بحتة', 'mathématiques', 'statistiques', 'probabilités', 'الكوليا', 'analyse', 'algèbre'] },
        { title: 'EPAU — هندسة معمارية', desc: 'المدرسة البوليتكنيكية لهندسة البناء والتعمير', url: '/university/speciality/epau', icon: 'fas fa-drafting-compass', specialty: 'مدارس عليا', keywords: ['EPAU', 'epau', 'معمارية', 'architecture', 'urbanisme', 'هندسة', 'تعمير', 'بوليتكنيكية'] },
        { title: 'ENSTP — أشغال عمومية', desc: 'المدرسة الوطنية العليا للأشغال العمومية', url: '/university/speciality/enstp', icon: 'fas fa-hard-hat', specialty: 'مدارس عليا', keywords: ['ENSTP', 'enstp', 'أشغال عمومية', 'travaux publics', 'génie civil', 'VRD', 'routes', 'ponts', 'بناء'] },
        { title: 'IGEE — الكهرباء بومرداس', desc: 'معهد الهندسة الكهربائية والإلكترونيك', url: '/university/speciality/igee', icon: 'fas fa-bolt', specialty: 'مدارس عليا', keywords: ['IGEE', 'igee', 'هندسة كهربائية', 'génie électrique', 'إلكترونيك', 'طاقة', 'أتوماتيك', 'بومرداس'] },

          { title: 'ENSTE - عنابة', desc: 'المدرسة الوطنية العليا للتكنولوجيا والهندسة', url: '/university/speciality/enste', icon: 'fas fa-industry', specialty: 'تكنولوجيا و هندسة', keywords: ['ENSTE', 'enste', 'مناجم', 'معادن', 'صناعية'] },
          { title: 'ESGEE - وهران', desc: 'المدرسة العليا في الهندسة الكهربائية والطاقوية', url: '/university/speciality/esgee', icon: 'fas fa-plug', specialty: 'تكنولوجيا و هندسة', keywords: ['ESGEE', 'esgee', 'كهرباء', 'طاقة', 'متجددة'] },
          { title: 'ENSF - خنشلة', desc: 'المدرسة الوطنية العليا للغابات', url: '/university/speciality/ensf', icon: 'fas fa-tree', specialty: 'طبيعة', keywords: ['ENSF', 'ensf', 'غابات', 'طبيعة', 'خنشلة'] },
          { title: 'Biomedical - هندسة بيوطبية', desc: 'تخصص الهندسة البيوطبية', url: '/university/speciality/biomedical', icon: 'fas fa-heartbeat', specialty: 'تكنولوجيا و هندسة', keywords: ['Biomedical', 'biomedical', 'بيوطبية', 'طب', 'تكنولوجيا'] },

        { title: 'AERONAUTIQUE — الطيران', desc: 'المدرسة الوطنية للطيران المدني — البليدة', url: '/university/speciality/aeronautique', icon: 'fas fa-plane', specialty: 'مدارس عليا', keywords: ['طيران', 'aéronautique', 'aerospace', 'aviation', 'pilot', 'طيار', 'فضاء', 'البليدة', 'صواريخ'] },
        { title: 'ENSH — هيدروليك', desc: 'المدرسة الوطنية العليا للهيدروليك — البليدة', url: '/university/speciality/ensh', icon: 'fas fa-tint', specialty: 'مدارس عليا', keywords: ['ENSH', 'ensh', 'هيدروليك', 'hydraulique', 'ماء', 'سدود', 'ري', 'البليدة', 'ressources en eau'] },
        { title: 'ENSB — البيوتكنولوجيا', desc: 'المدرسة الوطنية العليا للبيوتكنولوجيا', url: '/university/speciality/ensb', icon: 'fas fa-dna', specialty: 'مدارس عليا', keywords: ['ENSB', 'ensb', 'بيوتكنولوجيا', 'biotechnologie', 'biologie moléculaire', 'génétique', 'بيولوجيا جزيئية'] },
        { title: 'EHEC — التجارة', desc: 'المدرسة العليا للتجارة — تيجلابين', url: '/university/speciality/ehec', icon: 'fas fa-chart-line', specialty: 'مدارس عليا', keywords: ['EHEC', 'ehec', 'تجارة', 'commerce', 'marketing', 'management', 'مناجمنت', 'تيجلابين', 'MBA', 'اقتصاد'] },
        { title: 'ENSC — التجارة وهران', desc: 'المدرسة الوطنية العليا للتجارة', url: '/university/speciality/ensc', icon: 'fas fa-chart-line', specialty: 'مدارس عليا', keywords: ['ENSC', 'ensc', 'تجارة', 'وهران', 'commerce', 'marketing', 'sciences commerciales'] },
        { title: 'ESB — البنوك', desc: 'المدرسة العليا للبنوك', url: '/university/speciality/esb', icon: 'fas fa-university', specialty: 'مدارس عليا', keywords: ['ESB', 'esb', 'بنوك', 'بنك', 'banque', 'finance', 'صيرفة', 'إسلامية', 'مالية'] },
        { title: 'ENS — تكوين الأساتذة', desc: 'المدرسة العليا للأساتذة — التكوين التربوي', url: '/university/speciality/ens', icon: 'fas fa-chalkboard-teacher', specialty: 'مدارس عليا', keywords: ['أساتذة', 'ENS', 'ens', 'تعليم', 'تربية', 'enseignement', 'professeur', 'pédagogie', 'école normale', 'أستاذ'] },
        { title: 'ENSA — الزراعة', desc: 'المدرسة الوطنية العليا للزراعة — الجزائر', url: '/university/speciality/ensa', icon: 'fas fa-leaf', specialty: 'مدارس عليا', keywords: ['زراعة', 'agronomie', 'agriculture', 'ENSA', 'ensa', 'فلاحة', 'zootechnie', 'علوم زراعية'] },
        { title: 'ENST — السياحة والفندقة', desc: 'المدرسة الوطنية العليا للسياحة', url: '/university/speciality/enst', icon: 'fas fa-hotel', specialty: 'مدارس عليا', keywords: ['سياحة', 'tourisme', 'فندقة', 'hôtellerie', 'restauration', 'guide touristique', 'voyage', 'ENST', 'enst'] },
        { title: 'ENSSMAL — علوم البحر', desc: 'المدرسة الوطنية العليا للعلوم البحرية', url: '/university/speciality/enssmal', icon: 'fas fa-water', specialty: 'مدارس عليا', keywords: ['ENSSMAL', 'بحر', 'marine', 'halieutique', 'océanographie', 'pêche', 'علوم بحرية', 'بيولوجيا بحرية'] },
        { title: 'NHSAST — أنظمة مستقلة', desc: 'المدرسة العليا للأنظمة المستقلة — روبوتيك، درون، أنظمة مدمجة', url: '/university/speciality/ensas', icon: 'fas fa-robot', specialty: 'مدارس عليا', keywords: ['NHSAST', 'ENSAS', 'nhsast', 'ensas', 'أنظمة مستقلة', 'autonomous systems', 'روبوتيك', 'robotique', 'درون', 'drone', 'UAV', 'ذكاء اصطناعي', 'إلكترونيك', 'برمجة مدمجة', 'embedded', 'سيدي عبد الله', 'national higher school autonomous'] },

        // ── UNIVERSITY TRACKS (LMD) ────────────────────────────────────────
        { title: 'طب عام — كلية الطب', desc: 'الدراسات الطبية الكاملة — الطريق للدكتوراه', url: '/university/speciality/medcine', icon: 'fas fa-stethoscope', specialty: 'طب وصحة', keywords: ['طب', 'médecine', 'طبيب', 'CHU', 'doctor', 'دكتور', 'حكيم', 'كلية الطب', 'résidanat', 'طب عام', 'تخصص طبي'] },
        { title: 'طب الأسنان', desc: 'دراسة طب وجراحة الأسنان', url: '/university/speciality/medcine-dentaire', icon: 'fas fa-tooth', specialty: 'طب وصحة', keywords: ['طب أسنان', 'dentaire', 'dentiste', 'أسنان', 'orthodontie', 'chirurgie dentaire', 'طب الفم'] },
        { title: 'الصيدلة', desc: 'دراسة الصيدلة والعلوم الصيدلانية', url: '/university/speciality/pharmacie', icon: 'fas fa-pills', specialty: 'طب وصحة', keywords: ['صيدلة', 'pharmacie', 'صيدلاني', 'دواء', 'médicaments', 'officine', 'pharmacologie', 'pharmacy'] },
        { title: 'شبه طبي', desc: 'تمريض، كينيزيتيرابيا، مخبر، راديولوجيا', url: '/university/speciality/paramedical', icon: 'fas fa-heartbeat', specialty: 'طب وصحة', keywords: ['شبه طبي', 'infirmier', 'تمريض', 'kinésithérapie', 'كينيزيتيرابيا', 'مخبر', 'labo', 'radiologie', 'أشعة', 'paramedical', 'ممرض'] },
        { title: 'القابلة — توليد', desc: 'تكوين القابلات وصحة الأمومة', url: '/university/speciality/sage-femme', icon: 'fas fa-baby', specialty: 'طب وصحة', keywords: ['قابلة', 'توليد', 'ولادة', 'sage-femme', 'maïeutique', 'obstétrique', 'أمومة'] },
        { title: 'ليسانس إعلام آلي', desc: 'تخصص الإعلام الآلي بالجامعات LMD', url: '/university/speciality/informatique', icon: 'fas fa-code', specialty: 'جامعة LMD', keywords: ['إعلام آلي', 'informatique', 'ليسانس', 'licence', 'génie logiciel', 'réseaux', 'cybersécurité', 'python', 'java', 'web', 'برمجة', 'تطوير'] },
        { title: 'هندسة معمارية LMD', desc: 'الليسانس والماستر في العمارة', url: '/university/speciality/architecture-uni', icon: 'fas fa-building', specialty: 'جامعة LMD', keywords: ['معمارية', 'architecture', 'lmd', 'تعمير', 'urbanisme', 'هندسة بناء', 'بناء'] },
        { title: 'رياضيات — ليسانس', desc: 'الليسانس في الرياضيات والإحصاء', url: '/university/speciality/math', icon: 'fas fa-infinity', specialty: 'جامعة LMD', keywords: ['رياضيات بحتة', 'mathématiques', 'ليسانس رياضيات', 'statistiques', 'analyse', 'algèbre'] },
        { title: 'علوم الفيزياء والكيمياء', desc: 'تخصص علوم المادة في الجامعات', url: '/university/speciality/sm', icon: 'fas fa-atom', specialty: 'جامعة LMD', keywords: ['فيزياء', 'كيمياء', 'sciences de la matière', 'physique', 'chimie', 'SM', 'thermodynamique', 'علوم مادة'] },
        { title: 'بيولوجيا — ليسانس', desc: 'الليسانس في البيولوجيا والبيئة', url: '/university/speciality/biologie', icon: 'fas fa-leaf', specialty: 'جامعة LMD', keywords: ['بيولوجيا', 'biologie', 'écologie', 'environnement', 'génétique', 'microbiologie', 'علوم طبيعية'] },
        { title: 'الهندسة المدنية', desc: 'تخصص هندسة الإنشاء والبناء', url: '/university/speciality/gc', icon: 'fas fa-hard-hat', specialty: 'جامعة LMD', keywords: ['هندسة مدنية', 'génie civil', 'GC', 'بناء', 'بتون', 'VRD', 'هندسة إنشاء', 'géotechnique'] },
        { title: 'الهندسة الميكانيكية', desc: 'تخصص ميكانيك وميكاترونيك', url: '/university/speciality/gmec', icon: 'fas fa-cog', specialty: 'جامعة LMD', keywords: ['هندسة ميكانيكية', 'génie mécanique', 'GMEC', 'ميكانيك', 'machines', 'thermodynamique', 'ميكاترونيك'] },
        { title: 'النفط والغاز', desc: 'هندسة البترول والمحروقات', url: '/university/speciality/hydrocarbures', icon: 'fas fa-oil-can', specialty: 'جامعة LMD', keywords: ['نفط', 'غاز', 'بترول', 'sonatrach', 'pétrole', 'HYDROCARBURES', 'محروقات', 'raffinerie', 'pétrolier'] },
        { title: 'الحقوق والقانون', desc: 'ليسانس في الحقوق والعلوم القانونية', url: '/university/speciality/droit', icon: 'fas fa-gavel', specialty: 'جامعة LMD', keywords: ['حقوق', 'قانون', 'droit', 'محاماة', 'قضاء', 'justice', 'commercial', 'avocat', 'juriste'] },
        { title: 'القانون الجنائي والعلوم الجنائية', desc: 'ماستر جنائي — محاماة، قضاء، إجرام وجرائم مستحدثة', url: '/university/speciality/penal', icon: 'fas fa-balance-scale', specialty: 'جامعة LMD', keywords: ['جنائي', 'قانون جنائي', 'droit pénal', 'PENAL', 'إجرام', 'criminologie', 'جنايات', 'محاماة', 'قاضي', 'وكيل جمهورية', 'cybercrime', 'جرائم إلكترونية', 'ESM'] },
        { title: 'علم الإجرام والسياسة الجنائية', desc: 'ماستر criminologie — تحليل جنائي، سياسة وقاية، تأهيل ومؤسسات عقابية', url: '/university/speciality/criminologie', icon: 'fas fa-user-secret', specialty: 'جامعة LMD', keywords: ['علم إجرام', 'criminologie', 'CRIMINOLOGIE', 'سياسة جنائية', 'علم نفس جنائي', 'علم اجتماع جنائي', 'victimologie', 'علم ضحية', 'مؤسسات عقابية', 'سجون', 'تحليل جنائي', 'أمن وطني', 'درك'] },
        { title: 'الأدلة الجنائية والشرطة العلمية', desc: 'مسار المخبر الجنائي — DNA، بصمات، balistique، أدلة رقمية، INCC', url: '/university/speciality/forensique', icon: 'fas fa-microscope', specialty: 'أمن وطني / درك', keywords: ['شرطة علمية', 'أدلة جنائية', 'FORENSIQUE', 'police scientifique', 'sciences forensiques', 'DNA', 'بصمات', 'مسرح جريمة', 'balistique', 'INCC', 'بوشاوي', 'مخبر جنائي', 'تزوير وثائق', 'جريمة إلكترونية رقمية'] },
        { title: 'الأكاديمية العسكرية بشرشال', desc: 'EMIA شرشال — ضابط مهندس، هندسة تقنية + تكوين عسكري، مضمون في الجيش', url: '/university/speciality/cherchall', icon: 'fas fa-shield-alt', specialty: 'وزارة الدفاع الوطني', keywords: ['شرشال', 'CHERCHALL', 'EMIA', 'أكاديمية عسكرية', 'académie militaire', 'ضابط مهندس', 'جيش وطني شعبي', 'وزارة دفاع', 'mdn', 'دفاع', 'تكوين عسكري', 'هندسة عسكرية', 'بكالوريا رياضيات عسكري'] },
        { title: 'العلوم الاجتماعية', desc: 'علم النفس، علم الاجتماع والأنثروبولوجيا', url: '/university/speciality/ss', icon: 'fas fa-users', specialty: 'جامعة LMD', keywords: ['علم نفس', 'علم اجتماع', 'psychologie', 'sociologie', 'SS', 'anthropologie', 'اجتماع', 'نفس'] },
        { title: 'الفلسفة', desc: 'تخصص الفلسفة العامة — منطق، إبستمولوجيا، نقد وحِجاج', url: '/university/speciality/philo', icon: 'fas fa-brain', specialty: 'جامعة LMD', keywords: ['فلسفة', 'philosophie', 'PHILO', 'منطق', 'إبستمولوجيا', 'نقد', 'حجاج', 'ENS فلسفة', 'فلسفة جامعة', 'أستاذ فلسفة'] },
        { title: 'الإعلام والصحافة', desc: 'علوم الإعلام والاتصال والصحافة', url: '/university/speciality/commu', icon: 'fas fa-newspaper', specialty: 'جامعة LMD', keywords: ['إعلام', 'صحافة', 'journalisme', 'communication', 'médias', 'relations publiques', 'اتصال', 'COMMU'] },
        { title: 'الترجمة', desc: 'تخصص الترجمة التحريرية والفورية', url: '/university/speciality/traduction', icon: 'fas fa-language', specialty: 'جامعة LMD', keywords: ['ترجمة', 'traduction', 'interprétation', 'لغات', 'فورية', 'تحريرية', 'TRADUCTION'] },
        { title: 'العلوم الإسلامية — جامعة', desc: 'الشريعة والفقه والعلوم الإسلامية', url: '/university/speciality/charia', icon: 'fas fa-mosque', specialty: 'جامعة LMD', keywords: ['شريعة', 'فقه', 'حديث', 'قرآن', 'CHARIA', 'إسلامية', 'علوم دينية', 'aqida', 'usoul'] },
        { title: 'علوم سياسية ودبلوماسية', desc: 'العلاقات الدولية والإدارة العامة', url: '/university/speciality/sciences-po', icon: 'fas fa-globe', specialty: 'جامعة LMD', keywords: ['علوم سياسية', 'دبلوماسية', 'relations internationales', 'administration publique', 'SCIENCES-PO', 'دبلوماسي', 'سياسة'] },
        { title: 'تاريخ وجغرافيا — جامعة', desc: 'الليسانس في التاريخ والجغرافيا والآثار', url: '/university/speciality/sciences-hum', icon: 'fas fa-landmark', specialty: 'جامعة LMD', keywords: ['تاريخ', 'جغرافيا', 'آثار', 'تراث', 'histoire', 'géographie', 'archéologie', 'SCIENCES-HUM'] },

        // ── ÉCOLES SUPÉRIEURES SPÉCIALISÉES ──────────────────────────────────
        { title: 'ENA — الإدارة', desc: 'المدرسة الوطنية للإدارة — حيدرة — تكوين الإطارات السامية', url: '/university/speciality/ena', icon: 'fas fa-landmark', specialty: 'مدارس عليا', keywords: ['ENA', 'ena', 'إدارة عامة', 'administration publique', 'حوكمة', 'وزارة', 'والي', 'إطارات دولة', 'fonctionnaire', 'حيدرة', 'مسابقة إدارة', 'الوظيف العمومي'] },
        { title: 'المدرسة العليا للقضاء — ESM', desc: 'تكوين القضاة والمدعين العامين — القليعة', url: '/university/speciality/esm-justice', icon: 'fas fa-gavel', specialty: 'مدارس عليا', keywords: ['قضاء', 'قاضي', 'magistrature', 'محكمة', 'ESM', 'المدرسة العليا للقضاء', 'وكيل جمهورية', 'حكم', 'القليعة', 'وزارة العدل', 'justice', 'مسابقة قضاء'] },
        { title: 'ESSS — الضمان الاجتماعي', desc: 'المدرسة العليا للضمان الاجتماعي — بن عكنون — شراكة BIT/ILO', url: '/university/speciality/esss', icon: 'fas fa-hand-holding-heart', specialty: 'مدارس عليا', keywords: ['ESSS', 'esss', 'ضمان اجتماعي', 'sécurité sociale', 'CNAS', 'CASNOS', 'BIT', 'ILO', 'حماية اجتماعية', 'تأمين', 'بن عكنون', 'travail'] },
        { title: 'ENMAS — إدارة الصحة', desc: 'المدرسة العليا للمناجمنت وإدارة الصحة — برج البحري', url: '/university/speciality/enmas', icon: 'fas fa-hospital', specialty: 'مدارس عليا', keywords: ['ENMAS', 'enmas', 'إدارة صحة', 'management hospitalier', 'مستشفى', 'مدير مستشفى', 'صحة عامة', 'برج البحري', 'وزارة الصحة', 'hôpital'] },
        { title: 'IEDF — الجباية والجمارك', desc: 'معهد الاقتصاد الجبائي والجمركي — القليعة — مشترك جزائري تونسي', url: '/university/speciality/iedf', icon: 'fas fa-receipt', specialty: 'مدارس عليا', keywords: ['IEDF', 'iedf', 'جباية', 'جمارك', 'fiscalité', 'douane', 'ضرائب', 'TVA', 'مفتش ضرائب', 'التجارة الخارجية', 'القليعة', 'مالية', 'impôts'] },
        { title: 'IDRI — الدبلوماسية', desc: 'معهد الدبلوماسية والعلاقات الدولية — بن عكنون — وزارة الخارجية', url: '/university/speciality/idri', icon: 'fas fa-globe-africa', specialty: 'مدارس عليا', keywords: ['IDRI', 'idri', 'دبلوماسية', 'علاقات دولية', 'سفير', 'دبلوماسي', 'وزارة الخارجية', 'MAE', 'سفارة', 'diplomatie', 'relations internationales', 'بن عكنون'] },
        { title: 'ESSP — العلوم السياسية', desc: 'المدرسة العليا للعلوم السياسية — بن عكنون — دراسات استراتيجية', url: '/university/speciality/essp', icon: 'fas fa-vote-yea', specialty: 'مدارس عليا', keywords: ['ESSP', 'essp', 'علوم سياسية', 'sciences politiques', 'دراسات استراتيجية', 'جيوسياسية', 'تحليل سياسي', 'بن عكنون', 'أمن', 'géopolitique'] },
        { title: 'ENSJSI — الصحافة والإعلام', desc: 'المدرسة الوطنية العليا للصحافة وعلوم الإعلام — بن عكنون', url: '/university/speciality/ensjsi', icon: 'fas fa-newspaper', specialty: 'مدارس عليا', keywords: ['ENSJSI', 'ensjsi', 'صحافة', 'إعلام', 'journalisme', 'télévision', 'radio', 'reportage', 'صحفي', 'اتصال', 'médias', 'بودكاست', 'بن عكنون', 'تلفزيون'] },

        // ── اللغات الأجنبية – تخصصات فردية ──
        { title: 'ليسانس الإنجليزية – Anglais', desc: 'تخصص اللغة الإنجليزية — ترجمة، تدريس، شركات دولية، freelance', url: '/university/speciality/anglais', icon: 'fas fa-language', specialty: 'لغات أجنبية', keywords: ['anglais', 'إنجليزية', 'اللغة الإنجليزية', 'ليسانس إنجليزية', 'english', 'ESP', 'ترجمة إنجليزية', 'Fulbright', 'فريلانس', 'Fiverr', 'شركات دولية', 'ENS', 'phonetics', 'linguistics'] },
        { title: 'ليسانس الفرنسية – Français', desc: 'تخصص اللغة الفرنسية — أدب، إدارة، تعليم، صحافة', url: '/university/speciality/francais', icon: 'fas fa-language', specialty: 'لغات أجنبية', keywords: ['français', 'فرنسية', 'اللغة الفرنسية', 'ليسانس فرنسية', 'littérature française', 'didactique', 'FLE', 'إدارة', 'صحافة', 'بنوك', 'grammaire', 'linguistique'] },
        { title: 'ليسانس الإسبانية – Espagnol', desc: 'تخصص اللغة الإسبانية — سياحة، استيراد تصدير، أمريكا لاتينية', url: '/university/speciality/espagnol', icon: 'fas fa-language', specialty: 'لغات أجنبية', keywords: ['espagnol', 'إسبانية', 'اللغة الإسبانية', 'ليسانس إسبانية', 'español', 'أمريكا لاتينية', 'سياحة', 'استيراد تصدير', 'ترجمة إسبانية', 'البليدة 2', 'وهران 2', 'قسنطينة 1', 'تلمسان', 'gramática'] },
        { title: 'ليسانس الألمانية – Allemand', desc: 'تخصص اللغة الألمانية — Ausbildung ألمانيا، شركات ألمانية، Goethe-Institut', url: '/university/speciality/allemand', icon: 'fas fa-language', specialty: 'لغات أجنبية', keywords: ['allemand', 'ألمانية', 'اللغة الألمانية', 'ليسانس ألمانية', 'Deutsch', 'Ausbildung', 'هجرة ألمانيا', 'Goethe-Institut', 'Siemens', 'BASF', 'Volkswagen', 'شركات ألمانية', 'Grammatik'] },
        { title: 'ليسانس الإيطالية – Italien', desc: 'تخصص اللغة الإيطالية — ENI، شراكة جزائرية إيطالية، ترجمة طاقة', url: '/university/speciality/italien', icon: 'fas fa-language', specialty: 'لغات أجنبية', keywords: ['italien', 'إيطالية', 'اللغة الإيطالية', 'ليسانس إيطالية', 'italiano', 'ENI', 'Saipem', 'Mattei Plan', 'طاقة إيطالية', 'ترجمة إيطالية', 'البليدة 2', 'Dante', 'Boccaccio'] },
        { title: 'ليسانس الروسية – Russe', desc: 'تخصص اللغة الروسية — دبلوماسية، Sonatrach-Gazprom، منح روسيا', url: '/university/speciality/russe', icon: 'fas fa-language', specialty: 'لغات أجنبية', keywords: ['russe', 'روسية', 'اللغة الروسية', 'ليسانس روسية', 'Gazprom', 'Sonatrach', 'سفارة روسيا', 'منح روسيا', 'دبلوماسية', 'قسم اللغات الشرقية', 'Dostoevsky', 'Tolstoy', 'سيريلية'] },
        { title: 'ليسانس التركية – Turc', desc: 'تخصص اللغة التركية — Tosyali، Tayal، شركات تركية، أعلى توظيف', url: '/university/speciality/turc', icon: 'fas fa-language', specialty: 'لغات أجنبية', keywords: ['turc', 'تركية', 'اللغة التركية', 'ليسانس تركية', 'Türkçe', 'Tosyali', 'Tayal', 'شركات تركية', 'يونس إمرة', 'Yunus Emre', 'استثمار تركي', 'سفارة تركيا', 'vowel harmony'] },
        { title: 'ليسانس الصينية – Chinois', desc: 'تخصص اللغة الصينية — Huawei، ZTE، موانئ، ترجمة دولة، منح الصين', url: '/university/speciality/chinois', icon: 'fas fa-language', specialty: 'لغات أجنبية', keywords: ['chinois', 'صينية', 'اللغة الصينية', 'ليسانس صينية', 'Huawei', 'ZTE', 'COSCO', 'ميناء الحمدانية', 'منح الصين', 'Confucius', 'كونفوشيوس', 'HSK', 'Hanzi', 'Pinyin', 'ترجمة صينية'] },

        // ── ESAA ──
        { title: 'ESAA — إدارة الأعمال', desc: 'المدرسة العليا الجزائرية للأعمال — المحمدية — شهادة مزدوجة جزائرية فرنسية', url: '/university/speciality/esaa', icon: 'fas fa-briefcase', specialty: 'مدارس عليا', keywords: ['ESAA', 'esaa', 'إدارة أعمال', 'تسيير', 'مالية', 'تسويق', 'شهادة مزدوجة', 'double diplôme', 'Kedge', 'Audencia', 'BNP Paribas', 'Big Four', 'KPMG', 'EY', 'TAGE', 'المحمدية', 'شراكة فرنسية', 'ريادة أعمال', 'محاسبة', 'Schneider', 'Unilever'] },

        // ── تخصصات اقتصاد وتسيير الجامعية ──
        { title: 'العلوم الاقتصادية – Sciences Éco', desc: 'تخصص اقتصاد كلي وجزئي — بنوك، وزارة المالية، مراكز بحوث', url: '/university/speciality/eco', icon: 'fas fa-chart-line', specialty: 'اقتصاد وتسيير', keywords: ['علوم اقتصادية', 'اقتصاد', 'sciences économiques', 'microéconomie', 'macroéconomie', 'اقتصاد كلي', 'اقتصاد جزئي', 'اقتصاد نقدي', 'بنوك', 'بنك مركزي', 'سياسة نقدية', 'تضخم', 'وزارة المالية', 'SEGC', 'تحليل اقتصادي', 'اقتصاد دولي'] },
        { title: 'علوم التسيير – Sciences de Gestion', desc: 'تخصص إدارة وتسيير — محاسبة، موارد بشرية، تدقيق، مراقبة', url: '/university/speciality/gestion', icon: 'fas fa-cogs', specialty: 'اقتصاد وتسيير', keywords: ['علوم التسيير', 'تسيير', 'sciences de gestion', 'management', 'محاسبة', 'comptabilité', 'موارد بشرية', 'GRH', 'تدقيق', 'audit', 'مراقبة التسيير', 'contrôle de gestion', 'مالية', 'CFO', 'ERP', 'SEGC', 'إدارة أعمال'] },
        { title: 'العلوم التجارية – Sciences Commerciales', desc: 'تخصص تسويق وتجارة دولية — لوجيستيك، استيراد تصدير، E-Commerce', url: '/university/speciality/commerce', icon: 'fas fa-store', specialty: 'اقتصاد وتسيير', keywords: ['علوم تجارية', 'تجارية', 'sciences commerciales', 'تسويق', 'marketing', 'تجارة دولية', 'commerce international', 'لوجيستيك', 'supply chain', 'استيراد تصدير', 'import export', 'جمارك', 'e-commerce', 'تسويق رقمي', 'digital marketing', 'SEGC'] },

        // ── المدرسة العليا للضرائب ──
        { title: 'المدرسة العليا للضرائب – ESI قليعة', desc: 'مدرسة عليا للجباية والمالية العامة — دخول بعد Bac+2 عبر مسابقة وزارة المالية', url: '/university/speciality/esi-kolea', icon: 'fas fa-landmark', specialty: 'مدارس عليا', keywords: ['ESI', 'ضرائب', 'جباية', 'fiscalité', 'impôts', 'مدرسة عليا للضرائب', 'قليعة', 'Kolea', 'مالية عامة', 'finances publiques', 'تدقيق جبائي', 'audit fiscal', 'DGI', 'مفتشية الضرائب', 'قانون مالي', 'محاسبة', 'جمارك', 'مستشار جبائي', 'conseiller fiscal', 'وزارة المالية', 'خزينة', 'SCF', 'جباية مؤسسات'] },

        // ── المدرسة الوطنية لحفظ الممتلكات الثقافية ──
        { title: 'المدرسة الوطنية العليا لحفظ الممتلكات الثقافية وترميمها – ENSRPC تيبازة', desc: 'ترميم وحفظ الآثار والمخطوطات والممتلكات الثقافية — دخول بمسابقة وطنية بعد الباك', url: '/university/speciality/ensrpc', icon: 'fas fa-landmark', specialty: 'فنون وتراث', keywords: ['ENSRPC', 'حفظ الممتلكات الثقافية', 'ترميم', 'تراث', 'تيبازة', 'آثار', 'restoration', 'patrimoine', 'مخطوطات', 'متحف', 'OGEBC', 'فنون تشكيلية', 'أثري', 'patrimoine culturel', 'حفظ التراث'] },

        // ── الصحة والحماية الاجتماعية ──
        { title: 'الصحة والحماية الاجتماعية – Santé et Protection Sociale', desc: 'تسيير منظومة الرعاية والضمان — CNAS، CNR، مستشفيات، وزارة الصحة والتضامن الاجتماعي', url: '/university/speciality/health-soc', icon: 'fas fa-heartbeat', specialty: 'اقتصاد وتسيير', keywords: ['الصحة والحماية الاجتماعية', 'ضمان اجتماعي', 'تأمين صحي', 'CNAS', 'CASNOS', 'CNR', 'مستشفى', 'تسيير صحي', 'santé', 'protection sociale', 'اقتصاد الصحة', 'تقاعد', 'حوادث العمل', 'HEALTH-SOC', 'إدارة مستشفيات', 'وزارة الصحة'] },

        // ── اقتصاد + علاقات دولية ──
        { title: 'إقتصاد + علاقات دولية – Double Diplôme', desc: 'الدبلوماسي الاقتصادي — تجارة دولية، جيوسياسية اقتصادية، بنوك دولية، شركات متعددة الجنسيات', url: '/university/speciality/eco-ir', icon: 'fas fa-globe-americas', specialty: 'اقتصاد وعلوم سياسية', keywords: ['اقتصاد', 'علاقات دولية', 'دبلوماسية اقتصادية', 'تجارة دولية', 'مالية دولية', 'économie internationale', 'relations internationales', 'double diplôme', 'جيوسياسية', 'FMI', 'OMC', 'ZLECAF', 'ملحق اقتصادي', 'Risk Analyst', 'بنك دولي', 'صندوق النقد', 'ECO-IR', 'حروب تجارية', 'استثمار دولي'] },

        // ── إتصال + علاقات دولية ──
        { title: 'إتصال + علاقات دولية – Double Diplôme', desc: 'الدبلوماسية الإعلامية — علوم الإعلام والاتصال + علوم سياسية — Global PR، مراسل دولي، منظمات دولية', url: '/university/speciality/comm-ir', icon: 'fas fa-satellite-dish', specialty: 'إعلام وعلوم سياسية', keywords: ['إتصال', 'علاقات دولية', 'إعلام', 'علوم سياسية', 'دبلوماسية إعلامية', 'communication', 'relations internationales', 'double diplôme', 'Global PR', 'attaché de presse', 'صحافة دولية', 'مراسل دولي', 'تسويق سياسي', 'اتصال أزماتي', 'منظمات دولية', 'COMM-IR', 'علاقات عامة دولية'] },

        // ── قانون عام + علاقات دولية ──
        { title: 'قانون عام + علاقات دولية – Double Diplôme', desc: 'بروفايل دبلوماسي-قانوني مزدوج — حقوق + علوم سياسية — دبلوماسية، منظمات دولية، مستشار قانوني', url: '/university/speciality/law-ir', icon: 'fas fa-balance-scale', specialty: 'حقوق وعلوم سياسية', keywords: ['قانون عام', 'علاقات دولية', 'دبلوماسية', 'حقوق', 'علوم سياسية', 'droit public', 'relations internationales', 'double diplôme', 'قانون دولي', 'دستور', 'قانون إداري', 'جيوسياسية', 'منظمات دولية', 'سفارة', 'قنصلية', 'تفاوض', 'NGO', 'أمم متحدة', 'LAW-IR'] },

        // ── العلوم الفلاحية ──
        { title: 'العلوم الفلاحية – Sciences Agronomiques', desc: 'فلاحة ذكية، تربة، نبات، حيوان، Smart Farming | ENSA الحراش – ESAS الوادي – ESA مستغانم', url: '/university/speciality/agro', icon: 'fas fa-seedling', specialty: 'agro', keywords: ['فلاحة', 'زراعة', 'AGRO', 'علوم فلاحية', 'agronome', 'مهندس زراعي', 'ENSA', 'ESAS', 'ESA', 'SNV', 'بيولوجيا', 'تربة', 'نبات', 'حيوان', 'بذور', 'ري تنقيط', 'جنوب صحراء', 'smart farming', 'pivot irrigation', 'DSA', 'INRA', 'آفات', 'حشرات'] },

        // ── الوقاية والأمن الصناعي ──
        { title: 'الوقاية والأمن الصناعي – HSE', desc: 'سلامة مهنية، مخاطر صناعية، QHSE، تلوث بيئي | وهران – باتنة – سكيكدة – ورقلة | سوناطراك', url: '/university/speciality/hse', icon: 'fas fa-hard-hat', specialty: 'hse', keywords: ['HSE', 'وقاية', 'أمن صناعي', 'سلامة مهنية', 'QHSE', 'مخاطر صناعية', 'سوناطراك', 'نفطال', 'مصافي بترول', 'حرائق', 'إخلاء', 'تلوث بيئي', 'ورقلة', 'سكيكدة', 'باتنة', 'وهران', 'MRI', 'HSST', 'GPE', 'SIE', 'صحة سلامة بيئة'] },

        // ── الهندسة الهيدروليكية والري ──
        { title: 'الهندسة الهيدروليكية والري – Hydraulique', desc: 'سدود، شبكات مياه، محطات تصفية، صرف صحي، GIS | ENSH البليدة (مهندس دولة) – وهران – بجاية', url: '/university/speciality/hydro', icon: 'fas fa-water', specialty: 'hydro', keywords: ['هيدروليك', 'ري', 'HYDRO', 'مياه', 'سدود', 'هيدرولوجيا', 'ADE', 'ONA', 'ENSH', 'محطات تصفية', 'شبكات قنوات', 'صرف صحي', 'فيضانات', 'GIS', 'WaterCAD', 'Epanet', 'ArcGIS', 'موارد مائية', 'مياه جوفية', 'VRD', 'hydraulique', 'irrigation'] },

        // ── الآلية والتحكم الآلي ──
        { title: 'الآلية والتحكم الآلي – Automatique', desc: 'أتمتة، PLC، روبوتيك، خطوط إنتاج ذكية، Embedded Systems | بومرداس H22 (MCIL) – INELEC – Polytechnique', url: '/university/speciality/auto', icon: 'fas fa-cogs', specialty: 'auto', keywords: ['آلية', 'تحكم آلي', 'automatique', 'AUTO', 'PLC', 'روبوتيك', 'أتمتة', 'بومرداس', 'MCIL', 'INELEC', 'خطوط إنتاج', 'مصانع ذكية', 'embedded systems', 'سوناطراك', 'سونلغاز', 'Siemens', 'Schneider', 'IoT', 'ladder', 'SCADA'] },

        // ── الكهروتقني ──
        { title: 'الكهروتقني – Électrotechnique', desc: 'طاقة كهربائية، آلات، شبكات، طاقات متجددة، أتمتة صناعية | INELEC بومرداس – البليدة – سطيف – قسنطينة', url: '/university/speciality/electro', icon: 'fas fa-bolt', specialty: 'electro', keywords: ['كهروتقني', 'électrotechnique', 'ELECTRO', 'كهرباء', 'طاقة', 'INELEC', 'سونلغاز', 'سوناطراك', 'محطات توليد', 'أتمتة', 'طاقات متجددة', 'شبكات كهربائية', 'آلات كهربائية', 'PLC', 'SCADA', 'صناعة'] },

        // ── الاتصالات السلكية واللاسلكية ──
        { title: 'الاتصالات السلكية واللاسلكية – Télécommunications', desc: 'شبكات 5G، ألياف بصرية، معالجة إشارة، أمن شبكات | قالمة – USTHB – INTTIC وهران', url: '/university/speciality/telecom', icon: 'fas fa-broadcast-tower', specialty: 'telecom', keywords: ['اتصالات', 'تليكوم', 'TELECOM', 'سلكية لاسلكية', '5G', 'fibre optique', 'ألياف بصرية', 'INTTIC', 'USTHB', 'قالمة', 'أم البواقي', 'معالجة إشارة', 'شبكات', 'تشفير', 'أمن شبكات', 'IoT', 'هندسة اتصالات'] },

        // ── علوم البيئة والمحيط ──
        { title: 'علوم البيئة والمحيط – Environmental Sciences', desc: 'بيئة، تلوث، إيكولوجيا، دراسات أثر بيئي، Green Jobs | قسنطينة 1 (الإخوة منتوري)', url: '/university/speciality/env-sci', icon: 'fas fa-leaf', specialty: 'env-sci', keywords: ['علوم البيئة', 'بيئة', 'ENV-SCI', 'تلوث', 'SNV', 'إيكولوجيا', 'قسنطينة', 'green jobs', 'أثر بيئي', 'استصلاح', 'تربة', 'هواء', 'ماء', 'محيط'] },

        // ── مهن المدينة ──
        { title: 'مهن المدينة – Métiers de la Ville', desc: 'تسيير وإشراف حضري ميداني — بناء مدن، شبكات، GIS، مشاريع عمرانية | تلمسان ISTA – بسكرة – باتنة', url: '/university/speciality/city-jobs', icon: 'fas fa-city', specialty: 'city-jobs', keywords: ['مهن المدينة', 'métiers de la ville', 'CITY-JOBS', 'تسيير حضري', 'ورشة', 'GIS', 'ISTA', 'تلمسان', 'هندسة عمرانية', 'مقاولات', 'تطوير عقاري', 'تعمير', 'بناء'] },

        // ── إنتاج وتصميم رقمي وصناعة المحتوى ──
        { title: 'إنتاج وتصميم رقمي – صناعة المحتوى الرقمي | Digital Content Production', desc: 'تخصص يجمع التصميم الغرافيكي والمونتاج وخوارزميات السوشل ميديا لصناعة محتوى رقمي احترافي', url: '/university/speciality/digital-prod', icon: 'fas fa-photo-video', specialty: 'digital-prod', keywords: ['إنتاج رقمي', 'تصميم رقمي', 'محتوى رقمي', 'digital content', 'content creator', 'graphic design', 'motion graphics', 'montage', 'reels', 'tiktok', 'youtube', 'social media', 'SEO', 'UI UX', 'photoshop', 'after effects', 'premiere', 'freelancing', 'الجزائر 3', 'قسنطينة 3', 'وهران 1', 'DIGITAL-PROD'] },

        // ── ممثل محترف وكاتب مسرحي ──
        { title: 'ممثل محترف وكاتب مسرحي – Acting & Playwriting', desc: 'تخصص فني مزدوج يجمع بين التمثيل الاحترافي والكتابة الدرامية المسرحية فوق الخشبة وخلف الكاميرا', url: '/university/speciality/theater', icon: 'fas fa-theater-masks', specialty: 'theater', keywords: ['تمثيل', 'مسرح', 'كتابة مسرحية', 'acting', 'playwriting', 'فنون عرض', 'دراما', 'ارتجال', 'improvisation', 'دبلجة', 'voice acting', 'ISMACS', 'وهران 1', 'مستغانم', 'باتنة 1', 'سيناريو', 'سينما', 'THEATER'] },

        // ── متحكم في الأداء الموسيقي والإبداع الفني ──
        { title: 'متحكم في الأداء الموسيقي والإبداع الفني – Musical Performance & Artistic Direction', desc: 'تخصص نخبوي يصنع قادة الأوركسترا والمخرجين الموسيقيين والمديرين الإبداعيين للمهرجانات والأوبرا', url: '/university/speciality/music-perf', icon: 'fas fa-music', specialty: 'music-perf', keywords: ['موسيقى', 'أداء موسيقي', 'أوركسترا', 'مايسترو', 'توزيع موسيقي', 'هارموني', 'musical performance', 'artistic direction', 'هندسة صوتية', 'MAO', 'Pro Tools', 'مهرجان', 'أوبرا', 'INSM', 'ISMACS', 'مستغانم', 'تلمسان', 'MUSIC-PERF'] },

        // ── كتابة السيناريو ──
        { title: 'كتابة السيناريو – Screenwriting / Creative Writing', desc: 'تخصص فني إبداعي لتعلم كتابة النصوص السينمائية والدرامية من بناء الحبكة إلى الحوار والشخصيات', url: '/university/speciality/scenario', icon: 'fas fa-pen-fancy', specialty: 'scenario', keywords: ['سيناريو', 'كتابة إبداعية', 'screenwriting', 'سيناريست', 'مسلسل', 'فيلم', 'حوار', 'قصة', 'دراما', 'كوميديا', 'خيال علمي', 'adaptation', 'narrative design', 'ISMACS', 'فنون درامية', 'وهران 1', 'باتنة 1', 'مستغانم', 'SCENARIO'] },

        // ── مصمم ثلاثي الأبعاد ومؤثرات خاصة ──
        { title: 'مصمم ثلاثي الأبعاد – مؤثرات خاصة | 3D Design & VFX', desc: 'تخصص إبداعي تكنولوجي لتصميم المجسمات الرقمية والمؤثرات البصرية للسينما والإعلانات والألعاب', url: '/university/speciality/3d-design', icon: 'fas fa-cube', specialty: '3d-design', keywords: ['3D', 'VFX', 'مصمم', 'ثلاثي الأبعاد', 'مؤثرات خاصة', 'blender', 'maya', 'modeling', 'animation', 'compositing', 'unreal engine', 'unity', 'سينما', 'إعلانات', 'ألعاب فيديو', 'gaming', 'freelancing', 'showreel', 'ISMACS', 'فنون جميلة', '3D-DESIGN'] },

        // ── علم الاجتماع الترفيه والأسفار ──
        { title: 'علم الاجتماع الترفيه والأسفار – Sociology of Leisure & Travel', desc: 'تخصص يدرس سلوك السواح وصناعة الترفيه والسياحة من منظور سوسيولوجي تطبيقي', url: '/university/speciality/soc-leisure', icon: 'fas fa-umbrella-beach', specialty: 'soc-leisure', keywords: ['علم اجتماع', 'ترفيه', 'أسفار', 'سياحة', 'sociology', 'leisure', 'travel', 'camping', 'سواح', 'وقت فراغ', 'فندقة', 'tour operator', 'trip planner', 'تنشيط', 'animation', 'بيوت شباب', 'مخيمات', 'الجزائر 2', 'مستغانم', 'وهران 2', 'بسكرة', 'SOC-LEISURE'] },

        // ── التاريخ والبيانات الضخمة ──
        { title: 'التاريخ والبيانات الضخمة – History & Big Data', desc: 'تخصص هجين يجمع بين علم التاريخ والأرشيف وتقنيات البيانات الضخمة لرقمنة الذاكرة الوطنية', url: '/university/speciality/history-data', icon: 'fas fa-database', specialty: 'history-data', keywords: ['تاريخ', 'بيانات ضخمة', 'big data', 'history', 'أرشيف رقمي', 'مخطوطات', 'ذاكرة وطنية', 'رقمنة', 'digital historian', 'digital humanities', 'GIS', 'text mining', 'علوم إنسانية', 'أرشيف وطني', 'وزارة المجاهدين', 'وزارة الثقافة', 'متحف', 'الجزائر 2', 'قسنطينة 2', 'وهران 1', 'HISTORY-DATA'] },

        // ── الإعلام والاتصال الصحي ──
        { title: 'الإعلام والاتصال الصحي – Health Communication', desc: 'تخصص يجمع الإعلام والاتصال مع القطاع الصحي لتصميم حملات توعية وتسيير أزمات صحية إعلامية', url: '/university/speciality/health-comm', icon: 'fas fa-stethoscope', specialty: 'health-comm', keywords: ['إعلام صحي', 'اتصال صحي', 'health communication', 'حملة توعية', 'صحافة طبية', 'وزارة الصحة', 'مستشفى', 'أدوية', 'اتصال أزمات', 'medical marketing', 'health journalist', 'توعية صحية', 'إشاعات طبية', 'جامعة الجزائر 3', 'قسنطينة 3', 'وهران 1', 'HEALTH-COMM'] },

        // ── التفاوض والتكنولوجيا المالية ──
        { title: 'التفاوض والتكنولوجيا المالية – Negotiation & FinTech', desc: 'Smart Fusion — FinTech، دفع إلكتروني، تفاوض تجاري، BizDev، بنوك رقمية، Startups مالية', url: '/university/speciality/fintech', icon: 'fas fa-mobile-alt', specialty: 'مالية وتكنولوجيا', keywords: ['التفاوض', 'التكنولوجيا المالية', 'fintech', 'negotiation', 'FINTECH', 'e-payment', 'baridimob', 'blockchain', 'mobile money', 'دفع إلكتروني', 'بنك رقمي', 'تمويل جماعي', 'digital banking', 'bizdev', 'business development', 'إقناع', 'صفقات', 'شركات ناشئة مالية', 'stripe', 'paypal', 'الجزائر 3', 'وهران 2', 'قسنطينة 2', 'جيزي', 'أوريدو', 'موبيليس', 'IOB', 'امتثال مالي', 'تأمين ذكي', 'startup'] },

        // ── التداول والأسواق المالية ──
        { title: 'التداول والأسواق المالية – Trading & Financial Markets', desc: 'بورصة، Forex، أسهم، تحليل فني وأساسي، محافظ مالية، Broker، Risk Manager — تسيير واقتصاد', url: '/university/speciality/trading', icon: 'fas fa-chart-bar', specialty: 'مالية وأسواق', keywords: ['التداول', 'الأسواق المالية', 'trading', 'financial markets', 'TRADING', 'بورصة', 'forex', 'أسهم', 'سندات', 'تحليل فني', 'تحليل أساسي', 'technical analysis', 'fundamental analysis', 'portfolio management', 'محافظ مالية', 'risk manager', 'broker', 'وسيط مالي', 'هندسة مالية', 'options', 'futures', 'prop trading', 'الجزائر 3', 'وهران 2', 'قسنطينة 2', 'EHEC', 'ESC', 'بنك', 'استثمار', 'ذهب', 'بترول', 'عملات', 'صندوق استثمار', 'financial english', 'رياضيات مالية'] },

        // ── الإدارة الإلكترونية للأعمال ──
        { title: 'الإدارة الإلكترونية للأعمال – E-Business / E-Management', desc: 'الـ E-Manager — تجارة إلكترونية، ERP، Agile، تحول رقمي، Startups، شركات خاصة — تسيير واقتصاد', url: '/university/speciality/e-biz', icon: 'fas fa-laptop', specialty: 'تسيير رقمي وتكنولوجيا', keywords: ['الإدارة الإلكترونية', 'e-business', 'e-management', 'E-BIZ', 'e-commerce', 'ERP', 'SAP', 'odoo', 'تجارة إلكترونية', 'تحول رقمي', 'digital transformation', 'agile', 'scrum', 'MIS', 'e-payment', 'remote work', 'الجزائر 3', 'وهران 2', 'قسنطينة 2', 'startups', 'تسيير رقمي', 'لوجيستيك', 'supply chain', 'e-commerce manager', 'consulting', 'paperless', 'تشريع رقمي'] },

        // ── الاتصال التسويقي وإدارة العلاقات مع الزبائن ──
        { title: 'الاتصال التسويقي وإدارة العلاقات مع الزبائن – MarCom & CRM', desc: 'تسويق رقمي، إشهار، CRM، Salesforce، وكالات إشهار، شركات — آداب ولغات وتسيير', url: '/university/speciality/marketing-comm', icon: 'fas fa-handshake', specialty: 'إعلام واتصال وتسويق', keywords: ['الاتصال التسويقي', 'إدارة علاقات الزبائن', 'marcom', 'CRM', 'MARKETING-COMM', 'تسويق', 'إشهار', 'customer experience', 'account manager', 'salesforce', 'hubspot', 'consumer behavior', 'سلوك المستهلك', 'digital PR', 'علاقات عامة', 'call center', 'خدمة الزبائن', 'NPS', 'KPI', 'الجزائر 3', 'وهران', 'قسنطينة', 'سطيف', 'عنابة', 'آداب', 'لغات أجنبية', 'brand', 'تجربة الزبائن', 'e-commerce', 'after-sales'] },

        // ── إدارة نظم المعلومات الصحية ──
        { title: 'إدارة نظم المعلومات الصحية – Health Information Systems Management', desc: 'المهندس الرقمي للسبيطار — EHR، أمن بيانات طبية، HealthTech، CNAS، وزارة الصحة', url: '/university/speciality/health-info', icon: 'fas fa-hospital-user', specialty: 'تسيير وإعلام آلي طبي', keywords: ['إدارة نظم المعلومات الصحية', 'health information systems', 'HEALTH-INFO', 'EHR', 'رقمنة صحة', 'digital health', 'ملفات طبية إلكترونية', 'أمن سيبراني طبي', 'biostatistics', 'healthtech', 'سبيطار', 'مستشفى', 'CNAS', 'CASNOS', 'بطاقة الشفاء', 'وزارة الصحة', 'الجزائر 3', 'قسنطينة 2', 'إدارة مستشفيات', 'CHU', 'health IT manager', 'تأمين صحي', 'بيانات ضخمة طبية'] },

        // ── التربية والنفس حركية لمرحلة الطفولة ──
        { title: 'التربية والنفس حركية لمرحلة الطفولة – Psychomotor Education & Early Childhood', desc: 'أخصائي نفس حركي — توحد، ADHD، روضة، مراكز التربية الخاصة، وزارة التضامن', url: '/university/speciality/childhood', icon: 'fas fa-child', specialty: 'علوم التربية وعلم النفس', keywords: ['التربية النفس حركية', 'مرحلة الطفولة', 'psychomotricité', 'early childhood', 'CHILDHOOD', 'طفل', 'روضة', 'توحد', 'autism', 'ADHD', 'صعوبات تعلم', 'dyslexia', 'علم نفس الطفل', 'child psychology', 'نمو الطفل', 'بيداغوجيا', 'إعاقة', 'الجزائر 2', 'قسنطينة 2', 'وهران 2', 'سطيف 2', 'أرطفوني', 'orthophonie', 'تربية خاصة', 'وزارة التضامن', 'مركز نفسي بيداغوجي', 'إدماج'] },

        // ── دراسات وابتكار عمومي ──
        { title: 'دراسات وابتكار عمومي – Public Studies & Innovation', desc: 'عصرنة الدولة — حوكمة إلكترونية، سياسات عمومية، Design Thinking — وزارات، ولايات، Think Tanks', url: '/university/speciality/public-innov', icon: 'fas fa-city', specialty: 'علوم سياسية وحوكمة', keywords: ['دراسات عمومية', 'ابتكار عمومي', 'public studies', 'public innovation', 'PUBLIC-INNOV', 'حوكمة', 'رقمنة', 'e-government', 'سياسات عمومية', 'design thinking', 'تحول رقمي', 'عصرنة الإدارة', 'علوم سياسية', 'think tank', 'مستشار استراتيجي', 'الجزائر 3', 'قسنطينة 3', 'وهران 2', 'وزارة', 'بلدية', 'ولاية', 'إطار سامي', 'consulting', 'بيانات ضخمة', 'تسيير مشاريع عمومية', 'مرفق عام'] },

        // ── السينما والميديا الرقمية ──
        { title: 'السينما والميديا الرقمية – Cinema & Digital Media', desc: 'إنتاج سمعي بصري رقمي — مونتاج، إخراج، سيناريو، يوتيوب، Netflix — كليات الإعلام والاتصال', url: '/university/speciality/cinema-media', icon: 'fas fa-film', specialty: 'إعلام واتصال وفنون', keywords: ['السينما', 'الميديا الرقمية', 'cinema', 'digital media', 'CINEMA-MEDIA', 'مونتاج', 'إخراج', 'سيناريو', 'video editing', 'adobe premiere', 'davinci resolve', 'سمعي بصري', 'audiovisuel', 'يوتيوب', 'netflix', 'streaming', 'فيلم قصير', 'وثائقي', 'إعلام واتصال', 'الجزائر 3', 'قسنطينة 3', 'وهران 1', 'in-house video', 'freelance', 'portfolio', 'sound design', 'storytelling', 'صناعة محتوى', 'كاميرا', 'DSLR', 'إشهار'] },

        // ── الاتصال السياحي والترويج للأقاليم ──
        { title: 'الاتصال السياحي والترويج للأقاليم – Tourism Communication & Territorial Branding', desc: 'مسوق الأقاليم — سياحة، تراث، تسويق إقليمي، ONT، مديريات السياحة — آداب ولغات أجنبية', url: '/university/speciality/comm-tourism', icon: 'fas fa-map-marked-alt', specialty: 'إعلام واتصال وسياحة', keywords: ['الاتصال السياحي', 'الترويج للأقاليم', 'tourism communication', 'territorial branding', 'COMM-TOURISM', 'سياحة', 'تسويق إقليمي', 'marketing territorial', 'ديوان السياحة', 'ONT', 'تراث', 'جغرافية السياحة', 'فيديو ترويجي', 'vlogging', 'علاقات عامة', 'تيبازة', 'مستغانم', 'بسكرة', 'صحراء', 'آثار', 'tour operator', 'فندقة', 'استثمار سياحي', 'آداب', 'لغات أجنبية', 'الجزائر 3'] },

        // ── الاتصال الرقمي وإدارة الأعمال ──
        { title: 'الاتصال الرقمي وإدارة الأعمال – Digital Communication & Business Administration', desc: 'بروفايل Digital Manager يجمع بين الإعلام الرقمي وتسيير الأعمال — Startups، وكالات إشهار، Brand Manager', url: '/university/speciality/digital-biz', icon: 'fas fa-laptop-code', specialty: 'إعلام واتصال وتسيير', keywords: ['الاتصال الرقمي', 'إدارة الأعمال', 'digital communication', 'business administration', 'DIGITAL-BIZ', 'سوشل ميديا', 'تسويق رقمي', 'digital marketing', 'brand manager', 'growth hacker', 'SEO', 'copywriting', 'تحليل بيانات', 'analytics', 'إدارة مشاريع رقمية', 'digital project management', 'الجزائر 3', 'وهران 2', 'قسنطينة 2', 'سمعة رقمية', 'digital reputation', 'startup', 'وكالة إشهار', 'اتصال مؤسساتي', 'e-business', 'e-management', 'أمن سيبراني'] },

        // ── إدارة المطارات والعبور ──
        { title: 'إدارة المطارات والعبور – Management Aéroportuaire', desc: 'تخصص لطلبة الآداب واللغات — لوجيستيك جوي، عبور، جمارك، شحن جوي', url: '/university/speciality/aeroport', icon: 'fas fa-plane', specialty: 'اقتصاد وتسيير', keywords: ['إدارة المطارات', 'management aéroportuaire', 'transit', 'عبور', 'طيران', 'aviation', 'لوجيستيك جوي', 'شحن جوي', 'fret', 'EGSA', 'ground handling', 'آداب', 'لغات أجنبية', 'جمارك', 'douane', 'خطوط جوية', 'مطار', 'aéroport', 'aviation english', 'supply chain', 'courier', 'freight', 'استيراد تصدير'] },
    ];

    const PLACEHOLDER = '<div class="search-placeholder"><i class="fas fa-keyboard"></i><p>ابدأ الكتابة للبحث في المنصة</p></div>';
    const NORESULT   = '<div class="search-placeholder"><i class="fas fa-search"></i><p>لا توجد نتائج — جرّب كلمة أخرى</p></div>';

    // ── OPEN / CLOSE ──────────────────────────────────────────────────────────
    const toggleSearch = (show) => {
        searchOverlay.classList.toggle('active', show);
        document.body.classList.toggle('search-active', show);
        document.body.style.overflow = show ? 'hidden' : '';
        focusIdx = -1;
        if (show) {
            setTimeout(() => searchInput.focus(), 300);
            if (!searchInput.value.trim()) renderRecent();
        } else {
            searchInput.value = '';
            searchResults.innerHTML = PLACEHOLDER;
            clearSearch.classList.remove('visible');
            hideRecent();
        }
    };

    // Global keyboard shortcut Ctrl+K / ⌘K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleSearch(!searchOverlay.classList.contains('active'));
        }
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            toggleSearch(false);
        }
    });

    // Arrow-key navigation inside the input
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setFocus(focusIdx + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setFocus(focusIdx - 1); }
        else if (e.key === 'Enter') {
            const items = searchResults.querySelectorAll('.search-result-item');
            if (focusIdx >= 0 && items[focusIdx]) { e.preventDefault(); items[focusIdx].click(); }
        }
    });

    if (searchBtnMobile)  searchBtnMobile.addEventListener('click',  () => toggleSearch(true));
    if (searchBtnDesktop) searchBtnDesktop.addEventListener('click', () => toggleSearch(true));
    if (closeSearch)      closeSearch.addEventListener('click',      () => toggleSearch(false));
    if (searchOverlay)    searchOverlay.addEventListener('click',    (e) => { if (e.target === searchOverlay) toggleSearch(false); });

    // ── SEARCH HANDLER ────────────────────────────────────────────────────────
    searchInput.addEventListener('input', (e) => {
        const queryRaw = e.target.value.trim();
        clearSearch.classList.toggle('visible', queryRaw.length > 0);
        focusIdx = -1;

        if (!queryRaw) {
            searchResults.innerHTML = PLACEHOLDER;
            renderRecent();
            return;
        }
        hideRecent();
        if (queryRaw.length < 2) { searchResults.innerHTML = PLACEHOLDER; return; }

        const query = normalizeSearch(queryRaw);
        const queryWords = query.split(/\s+/).filter(w => w.length >= 1);

        const scored = navSearchData.map(item => {
            const normTitle   = normalizeSearch(item.title);
            const normDesc    = normalizeSearch(item.desc);
            const normKws     = (item.keywords || []).map(k => normalizeSearch(k));
            const normSp      = item.specialty ? normalizeSearch(item.specialty) : '';

            let score = 0;
            let allMatched = true;

            for (const word of queryWords) {
                let hit = false;

                // Title (highest weight) — exact > startsWith > contains
                if (normTitle === word)             { score += 22; hit = true; }
                else if (normTitle.startsWith(word)){ score += 15; hit = true; }
                else if (normTitle.includes(word))  { score += 12; hit = true; }

                // Description
                if (!hit && normDesc.includes(word)) { score += 5; hit = true; }

                // Keywords
                for (const kw of normKws) {
                    if (!kw) continue;
                    if (kw === word)                       { score += 10; hit = true; }
                    else if (kw.startsWith(word))          { score +=  8; hit = true; }
                    else if (kw.includes(word))            { score +=  6; hit = true; }
                    else if (word.includes(kw) && kw.length > 2) { score += 3; hit = true; }
                }

                // Specialty badge
                if (!hit && normSp && (normSp.includes(word) || word.includes(normSp))) { score += 4; hit = true; }

                if (!hit) { allMatched = false; break; }
            }

            return { item, score, matched: allMatched };
        })
            .filter(x => x.matched && x.score > 0)
            .sort((a, b) => b.score - a.score);

        const topItems = scored.slice(0, 10).map(x => x.item);

        if (!topItems.length) {
            searchResults.innerHTML = NORESULT;
            return;
        }

        searchResults.innerHTML = '';
        topItems.forEach(item => {
            const a = document.createElement('a');
            a.href = item.url;
            a.className = 'search-result-item';
            a.innerHTML = `<i class="${item.icon}"></i><div class="result-info"><h4>${item.title}${item.specialty ? `<span class="result-specialty-badge">${item.specialty}</span>` : ''}</h4><p>${item.desc}</p></div>`;
            a.addEventListener('click', () => { saveRecent(queryRaw); toggleSearch(false); });
            searchResults.appendChild(a);
        });
    });

    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        clearSearch.classList.remove('visible');
        focusIdx = -1;
        searchResults.innerHTML = PLACEHOLDER;
        renderRecent();
    });
}

// ─── AD STRIP INJECTION ──────────────────────────────────────────────────────
function _setNavbarHeightVar() {
    const nav = document.querySelector('.navbar');
    if (nav) document.documentElement.style.setProperty('--navbar-height', nav.offsetHeight + 'px');
}

function injectAdStrip() {
    if (typeof window.BAC_ADS === 'undefined') return;
    if (BAC_ADS.isStripDismissed()) return;

    const ads = BAC_ADS.getActiveStripAds();
    if (!ads.length) return;

    requestAnimationFrame(_setNavbarHeightVar);
    document.fonts.ready.then(_setNavbarHeightVar);
    window.addEventListener('load', _setNavbarHeightVar);
    window.addEventListener('resize', _setNavbarHeightVar);

    const AD_H = 52;
    let currentIdx = 0;

    function buildContentHTML(ad) {
        return `
            <span class="ad-strip-emoji">${ad.emoji || '📢'}</span>
            <span class="ad-strip-text">
                <span class="ad-strip-headline">${ad.headline}</span>
                ${ad.subline ? `<span class="ad-strip-subline">${ad.subline}</span>` : ''}
            </span>
            ${ad.badge ? `<span class="ad-strip-badge">${ad.badge}</span>` : ''}`;
    }

    const strip = document.createElement('div');
    strip.className = 'ad-strip is-hidden';
    strip.innerHTML = `
        <div class="ad-strip-inner">
            <div class="ad-strip-content">${buildContentHTML(ads[0])}</div>
            <div class="ad-strip-actions">
                <a href="${ads[0].ctaHref}" target="${ads[0].ctaTarget || '_self'}" class="ad-strip-cta">
                    ${ads[0].ctaText}
                </a>
                <button class="ad-strip-dismiss" aria-label="إغلاق الإعلان">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>`;
    document.body.appendChild(strip);

    // Adjust body padding-top
    document.documentElement.style.setProperty('--ad-strip-height', AD_H + 'px');
    document.body.style.paddingTop = (75 + AD_H) + 'px';

    // Animate in
    requestAnimationFrame(() => requestAnimationFrame(() => strip.classList.remove('is-hidden')));

    // Dismiss
    strip.querySelector('.ad-strip-dismiss').addEventListener('click', () => {
        BAC_ADS.dismissStrip();
        strip.classList.add('is-hidden');
        const cleanup = () => {
            if (strip.parentNode) strip.remove();
            document.documentElement.style.setProperty('--ad-strip-height', '0px');
            document.body.style.paddingTop = '75px';
        };
        strip.addEventListener('transitionend', cleanup, { once: true });
        setTimeout(cleanup, 500);
    });

    // Auto-rotation (only if multiple active ads)
    if (ads.length > 1) {
        setInterval(() => {
            currentIdx = (currentIdx + 1) % ads.length;
            const ad = ads[currentIdx];
            const contentEl = strip.querySelector('.ad-strip-content');
            const ctaEl = strip.querySelector('.ad-strip-cta');
            contentEl.classList.add('rotating-out');
            contentEl.addEventListener('animationend', () => {
                contentEl.innerHTML = buildContentHTML(ad);
                ctaEl.href = ad.ctaHref;
                ctaEl.textContent = ad.ctaText;
                contentEl.classList.remove('rotating-out');
                contentEl.classList.add('rotating-in');
                contentEl.addEventListener('animationend', () => {
                    contentEl.classList.remove('rotating-in');
                }, { once: true });
            }, { once: true });
        }, 6000);
    }
}

// ─── INLINE AD CARD INJECTION ────────────────────────────────────────────────
function injectAdCards() {
    if (typeof window.BAC_ADS === 'undefined') return;

    const cards = BAC_ADS.getActiveRotatingCards ? BAC_ADS.getActiveRotatingCards() : [          { title: 'ESESM - الصم والبكم', desc: 'المدرسة العليا لأساتذة الصم والبكم', url: '/university/speciality/esesm', icon: 'fas fa-hands-helping', specialty: 'المدارس العليا للأساتذة', keywords: ['ESESM', 'esesm', 'صم', 'بكم', 'أساتذة', 'تربية'] },
];
    if (!cards.length) return;

    const placeholders = document.querySelectorAll('.ad-card-inject');
    if (!placeholders.length) return;

    let currentIdx = 0;

    // Rich layout: advertiser background photo + HTML text overlay (layout: 'rich-bg')
    function buildRichCardHTML(card) {
        const chipsHTML = (card.chips || []).map(function (c) {
            return `<span class="adx-chip"><i class="${c.icon || 'fas fa-check'}"></i> ${c.text}</span>`;
        }).join('');
        const dealHTML = card.dealAmount ? `
                <div class="adx-deal">
                    <div class="adx-deal-inline">
                        <span class="adx-deal-top">${card.dealLabel || ''}</span>
                        <span class="adx-deal-num">${card.dealAmount}<small>${card.dealUnit || ''}</small></span>
                    </div>
                    ${card.dealCode ? `<span class="adx-code">${card.dealCode}</span>` : ''}
                </div>` : '';
        return `
            <div class="ad-card-wrap">
                <div class="adx-hybrid">
                    <div class="adx-hybrid-bg" style="--bg:url('${card.bgImage}')"></div>
                    <div class="adx-hybrid-scrim"></div>
                    <span class="adx-sponsor">${card.sponsorLabel || 'إعلان مموّل'}</span>
                    <div class="adx-hybrid-inner">
                        <div class="adx-head-row">
                            ${card.logoUrl ? `
                            <div class="adx-logo">
                                <img src="${card.logoUrl}" alt="${card.name}">
                            </div>` : ''}
                            <div class="adx-hybrid-body">
                                <p class="adx-name">${card.name}</p>
                                ${card.subline ? `<p class="adx-sub">${card.subline}</p>` : ''}
                                ${chipsHTML ? `<div class="adx-chips">${chipsHTML}</div>` : ''}
                            </div>
                        </div>
                        ${dealHTML}
                        <div class="adx-actions">
                            <a class="adx-cta" href="${card.ctaHref}" target="${card.ctaTarget || '_self'}" rel="noopener">
                                <i class="${card.ctaIcon || 'fas fa-arrow-left'}"></i> ${card.ctaText}
                            </a>
                            ${card.secondaryHref ? `
                            <a class="adx-ig" href="${card.secondaryHref}" target="_blank" rel="noopener" aria-label="${card.secondaryLabel || ''}">
                                <i class="${card.secondaryIcon || 'fas fa-link'}"></i>
                            </a>` : ''}
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function buildCardHTML(card) {
        if (card.layout === 'rich-bg' && card.bgImage) return buildRichCardHTML(card);
        const specialtyHTML = card.specialty
            ? `<span class="ad-card-specialty">${card.specialty}</span>` : '';
        const iconFallback = (card.avatarIcon || 'fas fa-star').replace(/'/g, "\\'");
        const avatarInner = card.logoUrl
            ? `<img src="${card.logoUrl}" alt="${card.name}" class="ad-card-logo-img" onerror="this.outerHTML='<i class=\'${iconFallback}\'></i>'">`
            : `<i class="${card.avatarIcon || 'fas fa-star'}"></i>`;
        return `
            <div class="ad-card-wrap">
                <div class="ad-card">
                    <span class="ad-card-sponsor">${card.sponsorLabel || 'محتوى مدعوم'}</span>
                    <div class="ad-card-avatar" style="background:${card.avatarColor || '#2c5cc5'};box-shadow:0 8px 24px ${card.avatarColor || '#2c5cc5'}99, 0 2px 8px ${card.avatarColor || '#2c5cc5'}55;">
                        ${avatarInner}
                    </div>
                    <div class="ad-card-body">
                        <p class="ad-card-name">${card.name}</p>
                        <div class="ad-card-meta">
                            ${card.subject ? `<span class="ad-card-subject">${card.subject}</span>` : ''}
                            ${specialtyHTML}
                        </div>
                        <p class="ad-card-pitch">${card.pitch}</p>
                    </div>
                    <div class="ad-card-actions">
                        <a href="${card.ctaHref}" target="${card.ctaTarget || '_self'}" class="ad-card-cta">
                            ${card.ctaText} <i class="${card.ctaIcon || 'fas fa-arrow-left'}"></i>
                        </a>
                        ${card.secondaryHref ? `
                        <a href="${card.secondaryHref}" target="_blank" rel="noopener" class="ad-card-cta-secondary" aria-label="${card.secondaryLabel || ''}" data-tooltip="${card.secondaryLabel || ''}">
                            <i class="${card.secondaryIcon || 'fas fa-link'}"></i>
                        </a>` : ''}
                    </div>
                </div>
            </div>`;
    }

    // Render a specific card index on all placeholders with a fade transition
    function renderCard(idx, animate) {
        if (animate) {
            placeholders.forEach(ph => ph.classList.add('ad-card-fade-out'));
            setTimeout(() => {
                placeholders.forEach(ph => {
                    ph.innerHTML = buildCardHTML(cards[idx]);
                    ph.classList.remove('ad-card-fade-out');
                    ph.classList.add('ad-card-fade-in');
                    setTimeout(() => ph.classList.remove('ad-card-fade-in'), 400);
                });
            }, 300);
        } else {
            placeholders.forEach(ph => { ph.innerHTML = buildCardHTML(cards[idx]); });
        }
    }

    // Initial render (no animation on first paint)
    renderCard(0, false);

    // Rotate globally if multiple active cards
    if (cards.length > 1) {
        setInterval(() => {
            currentIdx = (currentIdx + 1) % cards.length;
            renderCard(currentIdx, true);
        }, BAC_ADS.cardRotationMs || 7000);
    }
}

// ── School Detail Tabs bootstrap for standalone speciality pages ─────────
// script.js already defines TAB_KEYWORDS / TAB_LABELS / initSchoolTabs(sectionId),
// but it's only ever invoked from the single-page university.html showSection hook.
// Standalone /university/speciality/*.html pages render their section as already
// "active" and never call showSection, so the tab bar never got built there.
// This just calls the existing global initSchoolTabs() with that section's id.
function setupSpecFilterTabs() {
    if (typeof window.initSchoolTabs !== 'function') return;
    var sectionEl = document.querySelector('.resource-content.active');
    if (sectionEl && sectionEl.id) window.initSchoolTabs(sectionEl.id);
}

// ─── PAGE BOOT ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // Inject components concurrently using absolute paths
    await Promise.all([
        injectComponent('#navbar-placeholder', '/components/navbar.html'),
        injectComponent('#footer-placeholder', '/components/footer.html')
    ]);

    // Ensure search placeholder is at body level for max z-index
    if (!document.getElementById('search-placeholder')) {
        const sp = document.createElement('div');
        sp.id = 'search-placeholder';
        document.body.appendChild(sp);
    }
    await injectComponent('#search-placeholder', '/components/search.html');

    // Setup after injection
    setupMobileMenu();
    setupNavbarScroll();
    setupSearch();
    injectAdStrip();
    injectAdCards();
    setupScrollToTop();
    setupSpecFilterTabs();

    // Add share button to all bac-2026 pages
    if (window.location.pathname.includes('bac-2026')) {
        buildBac2026ShareBtn();
    }

    // Handle hash-based section
    handleHashNav();

    // Fade in the content
    const pageContent = document.querySelector('main');
    if (pageContent) {
        pageContent.classList.add('fade-in');
    }
    document.body.classList.add('page-ready');

    // Inject global CTA section (all pages except university)
    injectGlobalCTA();

    // Hide loader
    hideLoader();

    // Show premium one-time Bac 2026 Announcement modal (900ms after loader)
    if (!localStorage.getItem(BAC2026_ANNOUNCE_KEY)) {
        setTimeout(showBac2026AnnouncementModal, 900);
    }

    // Register Service Worker for PWA / Shortcut functionality
    if ('serviceWorker' in navigator) {
        // Captured before registration resolves, so a brand-new visitor (no
        // prior controller) never gets force-reloaded on first install —
        // only real updates for returning visitors trigger a refresh.
        var hadController = !!navigator.serviceWorker.controller;

        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => {
                    reg.update();
                })
                .catch(err => console.warn('SW failed', err));
        });

        // Reload once when a new service worker takes control. The guard is
        // stored in sessionStorage (not a local variable) so it survives the
        // reload itself — a local var resets to false on every page load,
        // which let a single controllerchange event trigger an infinite
        // reload loop during CDN cache propagation.
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!hadController) return;
            if (sessionStorage.getItem('bsSwReloaded')) return;
            try { sessionStorage.setItem('bsSwReloaded', '1'); } catch (e) {}
            window.location.reload();
        });
    }
});
