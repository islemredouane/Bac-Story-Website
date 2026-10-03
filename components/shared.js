/**
 * shared.js — Runs on every page of Bac Story Website
 * Handles: component injection, loader, navbar, mobile menu, dropdowns, section nav
 */

// ─── PAGE LOADER ─────────────────────────────────────────────────────────────
const _loaderShownAt = Date.now();
const _LOADER_MIN_MS = 1000; // visible for at least 1.0 s for animation
let _loaderDismissed = false;

(function injectLoader() {
    try {
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
        (document.body || document.documentElement).prepend(loader);
    } catch (e) {
        console.warn('Loader inject error', e);
    }
})();

// Safety Watchdog: Under NO circumstances should the loader block the screen longer than 2.5s
setTimeout(function () {
    hideLoader();
}, 2500);

// ─── COMPONENT INJECTOR ───────────────────────────────────────────────────────
async function injectComponent(selector, url) {
    try {
        let res;
        if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
            res = await fetch(url, { signal: AbortSignal.timeout(2200) });
        } else {
            const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            const timer = controller ? setTimeout(() => controller.abort(), 2200) : null;
            res = await fetch(url, controller ? { signal: controller.signal } : {});
            if (timer) clearTimeout(timer);
        }
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
    if (_loaderDismissed) return;
    const loader = document.getElementById('page-loader');
    if (!loader) {
        _loaderDismissed = true;
        return;
    }
    _loaderDismissed = true;
    const elapsed = Date.now() - _loaderShownAt;
    const delay   = Math.max(0, _LOADER_MIN_MS - elapsed);
    setTimeout(function () {
        loader.classList.add('loader-hiding');
        loader.style.pointerEvents = 'none';
        loader.addEventListener('transitionend', () => {
            if (loader.parentNode) loader.remove();
        }, { once: true });
        setTimeout(() => { if (loader.parentNode) loader.remove(); }, 600);
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
        <!-- 1. Urgent Start of Year / Prerequisites -->
        <a href="/plans/monthly/prerequisites" class="gcta-card gcta-card--moktasabat">
            <div class="gcta-icon-circle"><i class="fa-solid fa-book-open-reader"></i></div>
            <div class="gcta-text">
                <strong>كُتيّب المكتسبات القبلية 2027</strong>
                <span>شروحات يوتيوب تفاعلية وروابط ملخصات وتمارين لجميع الشعب</span>
            </div>
            <div class="gcta-btn">تصفح الكُتيّب <i class="fas fa-arrow-left"></i></div>
        </a>
        <!-- 2. Experiences of Top Rankers -->
        <a href="/experiences" class="gcta-card gcta-card--experiences">
            <div class="gcta-icon-circle"><i class="fas fa-medal"></i></div>
            <div class="gcta-text">
                <strong>تجارب أوائل البكالوريا</strong>
                <span>خلاصة مسيرة ونظام دراسة أوائل الجزائر بمعدلات تفوق 18 و19</span>
            </div>
            <div class="gcta-btn">تصفح التجارب <i class="fas fa-arrow-left"></i></div>
        </a>
        <!-- 3. Essential Bag & Resources -->
        <a href="/resources" class="gcta-card gcta-card--resources">
            <div class="gcta-icon-circle"><i class="fas fa-briefcase"></i></div>
            <div class="gcta-text">
                <strong>حقيبة بكالوريا 2027</strong>
                <span>حمل أفضل الكتب الخارجية، الملخصات، ودرايفات المتفوقين</span>
            </div>
            <div class="gcta-btn">تصفح المصادر <i class="fas fa-arrow-left"></i></div>
        </a>
        <!-- 4. Monthly Study Plans -->
        <a href="/plans/monthly" class="gcta-card gcta-card--plans">
            <div class="gcta-icon-circle"><i class="fas fa-rocket"></i></div>
            <div class="gcta-text">
                <strong>بكالوريا 2027؟ ابدأ بقوة!</strong>
                <span>اكتشف خطط التميز الشهرية ونظم وقتك من بداية العام الدراسي</span>
            </div>
            <div class="gcta-btn">تصفح الخطط <i class="fas fa-arrow-left"></i></div>
        </a>
        <!-- 5. Oqba Roadmaps -->
        <a href="/oqba" class="gcta-card gcta-card--oqba">
            <div class="gcta-icon-circle"><i class="fas fa-map-signs"></i></div>
            <div class="gcta-text">
                <strong>طريقك للنجاح 2027</strong>
                <span>باقات عقبة بن نافع — دليلك الشامل لجميع المواد خطوة بخطوة</span>
            </div>
            <div class="gcta-btn">اكتشف الباقات <i class="fas fa-arrow-left"></i></div>
        </a>
        <!-- 6. Telegram Community & News -->
        <a href="https://t.me/islembacdz" target="_blank" rel="noopener noreferrer" class="gcta-card gcta-card--news">
            <div class="gcta-icon-circle"><i class="fas fa-newspaper"></i></div>
            <div class="gcta-text">
                <strong>آخر الأخبار والتحديثات</strong>
                <span>تابع قناتنا الرسمية على التلغرام للحصول على المستجدات والنصائح اليومية</span>
            </div>
            <div class="gcta-btn">تابع الأخبار <i class="fas fa-arrow-left"></i></div>
        </a>
        <!-- 7. Contribute Resources -->
        <a href="/contribute" class="gcta-card gcta-card--contribute">
            <div class="gcta-icon-circle"><i class="fas fa-upload"></i></div>
            <div class="gcta-text">
                <strong>شارك مصادرك مع الجيل القادم</strong>
                <span>درس ساعدك؟ تمرين أنقذك؟ شاركه مجاناً وباسمك لآلاف الطلاب</span>
            </div>
            <div class="gcta-btn">شارك الآن <i class="fas fa-arrow-left"></i></div>
        </a>
        <!-- 8. Platform Feedback & Rating -->
        <a href="/feedback" class="gcta-card gcta-card--feedback">
            <div class="gcta-icon-circle"><i class="fas fa-star"></i></div>
            <div class="gcta-text">
                <strong>قيّم تجربتك مع BAC STORY</strong>
                <span>رافقناك طول العام — الآن جاء دورك. اترك رأيك ونصيحتك لدفعة 2027</span>
            </div>
            <div class="gcta-btn">اكتب رأيك <i class="fas fa-arrow-left"></i></div>
        </a>
    </div></div>
    <!-- Mobile-only rotation dots (count = active gcta-card count) -->
    <div class="gcta-dots" id="gcta-dots">
        <span class="gcta-dot gcta-dot--active"></span>
        <span class="gcta-dot"></span>
        <span class="gcta-dot"></span>
        <span class="gcta-dot"></span>
        <span class="gcta-dot"></span>
        <span class="gcta-dot"></span>
        <span class="gcta-dot"></span>
        <span class="gcta-dot"></span>
    </div>
</section>`;

    // ── Card rotation (viewport-aware + hover pause + dot navigation) ──
    const gcCards   = document.querySelectorAll('.gcta-card');
    const gcDots    = document.querySelectorAll('#gcta-dots .gcta-dot');
    const gcWrapper = document.getElementById('gcta-cards');
    const gcSection = document.getElementById('global-cta');
    let gcCurrent   = 0;
    let gcTimer     = null;
    let isPaused    = false;

    function gcSetHeight() {
        if (!gcCards.length || !gcCards[gcCurrent]) return;
        gcCards[gcCurrent].style.position = 'relative';
        gcWrapper.style.minHeight = gcCards[gcCurrent].offsetHeight + 'px';
        gcCards[gcCurrent].style.position = '';
    }

    function gcShow(idx) {
        gcCurrent = (idx + gcCards.length) % gcCards.length;
        gcCards.forEach(function(c, i) {
            if (i === gcCurrent) {
                c.classList.remove('gcta-hidden');
                c.classList.add('gcta-visible');
            } else {
                c.classList.remove('gcta-visible');
                c.classList.add('gcta-hidden');
            }
        });
        gcDots.forEach(function(d, i) {
            d.classList.toggle('gcta-dot--active', i === gcCurrent);
        });
        setTimeout(gcSetHeight, 20);
    }

    function gcRotate() {
        if (!isPaused) {
            gcShow(gcCurrent + 1);
        }
    }

    function startTimer() {
        if (gcTimer) clearInterval(gcTimer);
        gcTimer = setInterval(gcRotate, 4500);
    }

    function stopTimer() {
        if (gcTimer) {
            clearInterval(gcTimer);
            gcTimer = null;
        }
    }

    // Interactive dots
    gcDots.forEach(function(dot, idx) {
        dot.style.cursor = 'pointer';
        dot.addEventListener('click', function() {
            gcShow(idx);
            startTimer();
        });
    });

    // Pause on hover
    if (gcWrapper) {
        gcWrapper.addEventListener('mouseenter', function() { isPaused = true; });
        gcWrapper.addEventListener('mouseleave', function() { isPaused = false; });
    }

    // Always show dots
    var dotsEl = document.getElementById('gcta-dots');
    if (dotsEl) dotsEl.style.display = 'flex';

    gcShow(0);
    window.addEventListener('resize', gcSetHeight);

    // Viewport-aware: only rotate when CTA section is in view
    if (gcSection && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    startTimer();
                } else {
                    stopTimer();
                }
            });
        }, { threshold: 0.15 });
        obs.observe(gcSection);
    } else {
        startTimer();
    }
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

// ─── POPUP MODAL SYSTEM (Sponsored Ad & Experiences Handshake) ─────────────
const BMA_POPUP_KEY = 'bs_seen_bma_popup_ts_v1';
const BMA_POPUP_HIDE_MS = 24 * 60 * 60 * 1000; // 24 hours (86400000 ms)

const EXP_POPUP_KEY = 'bs_seen_experiences_announce_2026_v13';
const EXP_POPUP_HIDE_MS = 24 * 60 * 60 * 1000; // 24 hours (86400000 ms)

function mountAnnouncementModal(htmlContent, storageKey) {
    if (document.querySelector('.bac2026-overlay')) return;

    // Mark timestamp immediately upon presentation to prevent race conditions
    try {
        localStorage.setItem(storageKey, Date.now().toString());
    } catch (e) {}

    const overlay = document.createElement('div');
    overlay.className = 'bac2026-overlay';
    overlay.innerHTML = htmlContent;

    document.body.appendChild(overlay);

    // Prevent background scroll — set on <html> not <body> to avoid breaking position:fixed containing block
    document.documentElement.style.overflow = 'hidden';

    // Double RAF for smooth paint transition
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
    });

    const dismissModal = () => {
        try { localStorage.setItem(storageKey, Date.now().toString()); } catch (e) {}
        overlay.classList.remove('active');
        document.documentElement.style.overflow = '';
        setTimeout(() => {
            if (overlay.parentNode) overlay.remove();
        }, 500);
        document.removeEventListener('keydown', handleEsc);
    };

    // Close buttons click events
    const closeBtn = overlay.querySelector('.announcement-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', dismissModal);

    overlay.querySelectorAll('.bma-popup-btn-tg, .bma-popup-btn-ig, .card-cta-web, .card-cta-telegram').forEach(btn => {
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

function showBac2026AnnouncementModal() {
    // 1. Singleton guard — prevent duplicate modals if invoked multiple times
    if (document.querySelector('.bac2026-overlay')) return;

    // 2. Blacklisted routes check
    if (location.pathname.replace(/\/$/, '').endsWith('/feedback')) return;

    // 3. Sync with ads-config.js — check if BMA Sponsored Ad is enabled
    let isBmaActive = true;
    if (window.BAC_ADS && Array.isArray(window.BAC_ADS.rotatingCards)) {
        const bmaAd = window.BAC_ADS.rotatingCards.find(c => c.id === 'card-bacmath-bma');
        if (bmaAd && bmaAd.active === false) isBmaActive = false;
    }

    // 4. Check if BMA ad is ready (Priority 1)
    let shouldShowBma = false;
    if (isBmaActive) {
        try {
            const raw = localStorage.getItem(BMA_POPUP_KEY);
            if (!raw) {
                shouldShowBma = true;
            } else {
                const lastSeen = parseInt(raw, 10);
                if (isNaN(lastSeen) || (Date.now() - lastSeen) >= BMA_POPUP_HIDE_MS) {
                    shouldShowBma = true;
                }
            }
        } catch (e) {
            shouldShowBma = false;
        }
    }

    if (shouldShowBma) {
        // Priority 1: Render BMA Math Sponsored Modal
        const bmaHtml = `
            <div class="bma-popup-card">
                <button class="announcement-modal-close" aria-label="إغلاق">&times;</button>
                
                <!-- Sponsored Header Pill -->
                <div class="welcome-badge-pill" style="background: linear-gradient(135deg, #ff6b1a, #e8420e); color: #fff; box-shadow: 0 4px 16px rgba(232,66,14,0.45); border: none; font-size: 0.78rem; padding: 4px 14px; margin-bottom: 0.6rem;">
                    <i class="fas fa-bolt" style="color: #ffd700;"></i> إعلان مموّل · بكالوريا 2027
                </div>

                <!-- Brand Header -->
                <div class="bma-popup-head">
                    <div class="bma-popup-logo">
                        <img src="/images/bma-logo.jpg" alt="BAC MATH WITH BMA">
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h3 class="bma-popup-title">دورة الرياضيات — BAC MATH WITH BMA</h3>
                        <span class="bma-popup-sub">مسار تدريبي شامل للشعب العلمية + مسار الأولمبياد</span>
                    </div>
                </div>

                <!-- Free Content / Live Sessions Alert Box (The Hook) -->
                <div class="bma-popup-live">
                    <span class="bma-popup-live-icon">
                        <i class="fas fa-gift"></i>
                    </span>
                    <div style="flex: 1; min-width: 0;">
                        <div class="bma-popup-live-title">
                            <span class="bma-popup-live-text">🎁 ملخصات وحصص مجانية دورية</span>
                            <span class="bma-popup-free-badge">متاح للجميع</span>
                        </div>
                        <div class="bma-popup-live-sub">سلاسل تمارين، ملخصات وبثوث مجانية على قناة التلغرام</div>
                    </div>
                </div>

                <!-- 3-Tier System Mini Cards -->
                <div class="bma-popup-tiers">
                    <div class="bma-popup-tier" style="border-color: rgba(205, 127, 50, 0.4);">
                        <div class="bma-popup-tier-name" style="color: #ffedd5; font-weight: 800;">🥉 Bronze</div>
                        <div class="bma-popup-tier-desc" style="color: #fed7aa; font-weight: 700;">تثبيت الأساسيات</div>
                    </div>
                    <div class="bma-popup-tier" style="border-color: rgba(192, 192, 192, 0.4);">
                        <div class="bma-popup-tier-name" style="color: #f8fafc; font-weight: 800;">🥈 Silver</div>
                        <div class="bma-popup-tier-desc" style="color: #e2e8f0; font-weight: 700;">تطبيق نمط الباك</div>
                    </div>
                    <div class="bma-popup-tier" style="border-color: rgba(255, 215, 0, 0.4);">
                        <div class="bma-popup-tier-name" style="color: #fef9c3; font-weight: 800;">🥇 Gold</div>
                        <div class="bma-popup-tier-desc" style="color: #fef08a; font-weight: 700;">تحدي وتمارين أجنبية</div>
                    </div>
                </div>

                <!-- Price & Specs Bar -->
                <div class="bma-popup-pricebar">
                    <span class="bma-popup-price-desc" style="color: #e0e7ff; font-weight: 700;">
                        <i class="fas fa-check-circle" style="color: #4ade80;"></i> 4 حصص + تسجيلات + تصحيحات
                    </span>
                    <span class="bma-popup-price-tag" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; font-weight: 900; border-radius: 20px; box-shadow: 0 4px 12px rgba(37,99,235,0.4); white-space: nowrap;">
                        1500 دج / شهر
                    </span>
                </div>

                <!-- CTA Buttons -->
                <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                    <a href="https://t.me/math_with_bma" target="_blank" rel="noopener noreferrer" class="bma-popup-btn-tg">
                        <i class="fab fa-telegram-plane" style="font-size: 1.15rem;"></i> <span>انضم للتلغرام و احجز مقعدك</span>
                    </a>
                    <a href="https://www.instagram.com/bacmathwithbma?stkn=MTE0amc1NnJlOXR5bg==" target="_blank" rel="noopener noreferrer" class="bma-popup-btn-ig">
                        <i class="fab fa-instagram" style="color: #fb7185; font-size: 1.05rem;"></i> <span>تواصل عبر الإنستغرام</span>
                    </a>
                </div>
            </div>
        `;
        mountAnnouncementModal(bmaHtml, BMA_POPUP_KEY);
    } else {
        // Priority 2: During BMA 24h cooldown, show Experiences Announcement Modal
        let shouldShowExp = false;
        try {
            const rawExp = localStorage.getItem(EXP_POPUP_KEY);
            if (!rawExp) {
                shouldShowExp = true;
            } else {
                const lastExp = parseInt(rawExp, 10);
                if (isNaN(lastExp) || (Date.now() - lastExp) >= EXP_POPUP_HIDE_MS) {
                    shouldShowExp = true;
                }
            }
        } catch (e) {
            shouldShowExp = false;
        }

        if (shouldShowExp) {
            const expHtml = `
                <div class="welcome-announcement-card modal-version">
                    <button class="announcement-modal-close" aria-label="إغلاق">&times;</button>
                    <div class="welcome-badge-pill" style="background: linear-gradient(135deg, #ff6b1a, #e8420e); color: #fff; box-shadow: 0 4px 14px rgba(232,66,14,0.35); border: none;">
                        <i class="fas fa-star"></i> جديد القناة و المنصة
                    </div>
                    <h3>سلسلة تجارب المتفوقين</h3>
                    <p style="margin-bottom: 1.2rem; line-height: 1.65; color: rgba(255, 255, 255, 0.95);">أطلقنا سلسلة جديدة وحصرية على قناتنا تحت عنوان «تجارب المتفوقين»، حيث نستضيف نخبة من الطلبة الحاصلين على تقدير امتياز (بمعدلات تفوق 18) من مختلف الشعب الدراسية.<br><br>هؤلاء المتفوقون سيشاركونك رحلتهم نحو النجاح ويقدمون لك نصائح ذهبية لتستفيد منها. تصفح التجارب الآن عبر الموقع أو تابعها عبر قناتنا على التلغرام!</p>
                    <div class="card-cta-group" style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
                        <a href="/experiences" class="card-cta-btn card-cta-web" style="display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; width: 100% !important; font-size: 1.05rem !important; font-weight: 800 !important; padding: 13px 24px !important; background-color: #ffffff !important; background: #ffffff !important; color: #1a3c8d !important; border: 2px solid #ffffff !important; border-radius: 999px !important; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18) !important; text-decoration: none !important; cursor: pointer !important; box-sizing: border-box !important; transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease !important;" onmouseenter="this.style.setProperty('transform', 'translateY(-3px)', 'important'); this.style.setProperty('box-shadow', '0 12px 24px rgba(0,0,0,0.25)', 'important'); this.style.setProperty('background', '#f8fafc', 'important'); this.style.setProperty('background-color', '#f8fafc', 'important');" onmouseleave="this.style.setProperty('transform', 'translateY(0)', 'important'); this.style.setProperty('box-shadow', '0 6px 20px rgba(0,0,0,0.18)', 'important'); this.style.setProperty('background', '#ffffff', 'important'); this.style.setProperty('background-color', '#ffffff', 'important');">
                            <i class="fas fa-medal" style="color: #ff6b35 !important; font-size: 1.1rem !important;"></i> <span style="color: #1a3c8d !important; font-weight: 800 !important;">تصفح التجارب على الموقع</span>
                        </a>
                        <a href="https://t.me/islembacdz" target="_blank" rel="noopener noreferrer" class="card-cta-btn card-cta-telegram" style="display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; width: 100% !important; font-size: 1.05rem !important; font-weight: 800 !important; padding: 13px 24px !important; background-color: #2AABEE !important; background: #2AABEE !important; color: #ffffff !important; border: none !important; border-radius: 999px !important; box-shadow: 0 6px 20px rgba(42, 171, 238, 0.4) !important; text-decoration: none !important; cursor: pointer !important; box-sizing: border-box !important; transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease !important;" onmouseenter="this.style.setProperty('transform', 'translateY(-3px)', 'important'); this.style.setProperty('box-shadow', '0 12px 24px rgba(42,171,238,0.55)', 'important'); this.style.setProperty('background', '#1a9adc', 'important'); this.style.setProperty('background-color', '#1a9adc', 'important');" onmouseleave="this.style.setProperty('transform', 'translateY(0)', 'important'); this.style.setProperty('box-shadow', '0 6px 20px rgba(42,171,238,0.4)', 'important'); this.style.setProperty('background', '#2AABEE', 'important'); this.style.setProperty('background-color', '#2AABEE', 'important');">
                            <i class="fab fa-telegram-plane"></i> <span style="color: #ffffff !important; font-weight: 800 !important;">انضم إلينا على التلغرام</span>
                        </a>
                    </div>
                </div>
            `;
            mountAnnouncementModal(expHtml, EXP_POPUP_KEY);
        }
    }
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
        list.innerHTML = r.map(q => '<button class="recent-search-item" data-q="' + q.replace(/"/g, '&quot;') + '"><i class="fas fa-history"></i><span>' + q + '</span></button>').join('');
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

    // ── SENIOR-GRADE NORMALIZATION & ARABIC STEMMING ENGINE ────────────────────
    const normalizeSearch = (text) => {
        if (!text) return '';
        return text.toString()
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove Latin diacritics
            .replace(/[\u064B-\u065F\u0670\u0640]/g, '')   // remove Arabic tashkeel & tatweel
            .replace(/[أإآٱ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/[ىئ]/g, 'ي')
            .replace(/ؤ/g, 'و')
            .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    };

    // Senior Arabic NLP Lemmatization & Morphological Dictionary
    const ARABIC_SYNONYMS_AND_PLURALS = {
        'تجربه': ['تجارب', 'تجريبيه', 'تجريب', 'ممارسه', 'قصه'],
        'تجارب': ['تجربه', 'تجريبيه', 'قصص', 'خبرات', 'نصائح'],
        'متفوق': ['متفوقين', 'متفوقه', 'متفوقات', 'اوائل', 'تفوق', 'ناجح', 'امتياز'],
        'متفوقين': ['متفوق', 'متفوقه', 'متفوقات', 'اوائل', 'تفوق', 'ناجحين', 'امتياز'],
        'متفوقه': ['متفوق', 'متفوقين', 'متفوقات', 'اوائل', 'تفوق'],
        'اوائل': ['اول', 'اولي', 'متفوقين', 'متفوق', 'مرتبه'],
        'رياضيات': ['رياضي', 'رياضيه', 'رياضه', 'ماط', 'math'],
        'رياضي': ['رياضيات', 'رياضيه', 'تقني', 'math'],
        'مواضيع': ['موضوع', 'امتحانات', 'اختبارات', 'حوليات'],
        'موضوع': ['مواضيع', 'امتحان', 'اختبار', 'حوليه'],
        'حلول': ['حل', 'تصحيح', 'تصحيحات', 'اجابه', 'اجوبه'],
        'تصحيح': ['تصحيحات', 'حلول', 'حل', 'نموذجي'],
        'تصحيحات': ['تصحيح', 'حلول', 'حل'],
        'ملخصات': ['ملخص', 'دروس', 'مراجع'],
        'ملخص': ['ملخصات', 'درس', 'مذكره'],
        'تخصصات': ['تخصص', 'شعب', 'شعبات', 'فروع'],
        'تخصص': ['تخصصات', 'فرع', 'شعب'],
        'شعب': ['شعبه', 'شعبات', 'تخصصات'],
        'شعبه': ['شعب', 'شعبات', 'تخصص'],
        'نظامي': ['نظاميون', 'نظاميين', 'متمدرس', 'تلميذ', 'تلميذه'],
        'نظاميه': ['نظامي', 'نظاميون', 'نظاميين', 'تلميذه'],
        'نظاميين': ['نظامي', 'متمدرسين', 'تلاميذ'],
        'نظاميون': ['نظامي', 'متمدرسين'],
        'حر': ['احرار', 'اعاده', 'طالب حر', 'طالبه حره'],
        'حره': ['حر', 'احرار', 'طالبه حره', 'اعاده'],
        'احرار': ['حر', 'طالب حر', 'اعاده', 'حره'],
        'امتحانات': ['امتحان', 'مواضيع', 'اختبارات', 'بكالوريات'],
        'امتحان': ['امتحانات', 'موضوع', 'اختبار', 'بكالوريا'],
        'مراجعات': ['مراجعه', 'تحضير', 'خطه'],
        'مراجعه': ['مراجعات', 'تحضير', 'تحدي'],
        'تمارين': ['تمرين', 'سلاسل', 'مسائل', 'انشطه'],
        'تمرين': ['تمارين', 'سلسله', 'مساله'],
        'فيديوهات': ['فيديو', 'يوتيوب', 'قناه', 'شروحات'],
        'فيديو': ['فيديوهات', 'شرح', 'يوتيوب'],
        'دروس': ['درس', 'محاضرات', 'شروحات'],
        'درس': ['دروس', 'شرح'],
        'اساتذه': ['استاذ', 'معلم', 'مؤطر'],
        'استاذ': ['اساتذه', 'معلم'],
        'سلاسل': ['سلسله', 'تمارين', 'حقائب'],
        'سلسله': ['سلاسل', 'تمارين'],
        'حوليات': ['حوليه', 'ارشيف', 'مواضيع', 'سوابق'],
        'حوليه': ['حوليات', 'مواضيع', 'ارشيف'],
        'كتب': ['كتاب', 'مراجع', 'كتيب'],
        'كتاب': ['كتب', 'مرجع'],
        'درايفات': ['درايف', 'drive', 'ملفات'],
        'درايف': ['درايفات', 'drive', 'ملف']
    };

    const ARABIC_STOP_WORDS = new Set([
        'في', 'من', 'عن', 'على', 'علي', 'الى', 'الي', 'مع', 'حتى', 'او', 'و', 'ثم', 'ف', 'ب', 'ل', 'ك',
        'هو', 'هي', 'هم', 'هن', 'هذا', 'هذه', 'هؤلاء', 'ذلك', 'تلك', 'التي', 'الذي', 'الذين', 'اللواتي',
        'كل', 'جميع', 'بعض', 'غير', 'سوى', 'عند', 'نحو', 'بين', 'خلال', 'ضد', 'اما', 'ان', 'انما', 'لكن'
    ]);

    // Arabic prefix/suffix stem generator for matching flexibility
    const getWordStems = (word) => {
        const stems = new Set([word]);
        if (word.startsWith('ال') && word.length > 3) {
            stems.add(word.slice(2));
        }
        for (const w of Array.from(stems)) {
            if (w.length > 3) {
                if (w.endsWith('ات')) stems.add(w.slice(0, -2));
                if (w.endsWith('ون')) stems.add(w.slice(0, -2));
                if (w.endsWith('ين')) stems.add(w.slice(0, -2));
                if (w.endsWith('ان')) stems.add(w.slice(0, -2));
                if (w.endsWith('يه')) stems.add(w.slice(0, -2));
                if (w.endsWith('ية')) stems.add(w.slice(0, -2));
                if (w.endsWith('ه'))  stems.add(w.slice(0, -1));
                if (w.endsWith('ة'))  stems.add(w.slice(0, -1));
            }
            if (ARABIC_SYNONYMS_AND_PLURALS[w]) {
                ARABIC_SYNONYMS_AND_PLURALS[w].forEach(s => stems.add(s));
            }
        }
        return Array.from(stems);
    };

    // Levenshtein distance for fuzzy matching
    const editDistance = (a, b) => {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    };

    // Highlight matches in rendering
    const highlightMatches = (text, tokens) => {
        if (!text || !tokens || !tokens.length) return text;
        const stems = tokens.flatMap(t => getWordStems(t)).filter(t => t && t.length >= 2);
        if (!stems.length) return text;
        const escaped = stems.map(s => s.replace(/[.*+?^$${}()|[\]\\]/g, '\\$&'));
        try {
            const regex = new RegExp('(' + escaped.join('|') + ')', 'gi');
            return text.replace(regex, '<mark class="search-highlight">$1</mark>');
        } catch (e) {
            return text;
        }
    };

    // ── SEARCH DATA (lazy-loaded) ─────────────────────────────────────────────
    // The search index lives in /search-index.json (~1.6 MB). It is downloaded
    // only when a visitor opens or hovers the search button, so ordinary page
    // loads stay light. To add or edit entries, edit /search-index.json and
    // change the ?v= value below so browsers fetch the new copy.
    const SEARCH_INDEX_URL = '/search-index.json?v=fa12153083';
    let navSearchData = null;
    let searchIndexPromise = null;
    const loadSearchIndex = () => {
        if (navSearchData) return Promise.resolve(navSearchData);
        if (!searchIndexPromise) {
            searchIndexPromise = fetch(SEARCH_INDEX_URL)
                .then(res => {
                    if (!res.ok) throw new Error('Search index HTTP ' + res.status);
                    return res.json();
                })
                .then(data => {
                    if (!Array.isArray(data)) throw new Error('Search index is not an array');
                    navSearchData = data;
                    return data;
                })
                .catch(err => {
                    searchIndexPromise = null; // allow a retry on the next attempt
                    console.warn('Search index failed to load', err);
                    throw err;
                });
        }
        return searchIndexPromise;
    };
    const warmSearchIndex = () => { loadSearchIndex().catch(() => {}); };

    const PLACEHOLDER = '<div class="search-placeholder"><i class="fas fa-keyboard"></i><p>ابدأ الكتابة للبحث في المنصة</p></div>';
    const NORESULT   = '<div class="search-placeholder"><i class="fas fa-search"></i><p>لا توجد نتائج — جرّب كلمة أخرى</p></div>';
    const LOADING    = '<div class="search-placeholder"><i class="fas fa-spinner fa-spin"></i><p>جارٍ تحميل البحث…</p></div>';
    const LOADERROR  = '<div class="search-placeholder"><i class="fas fa-wifi"></i><p>تعذّر تحميل البحث — تحقّق من الاتصال وحاول مجددًا</p></div>';

    // ── OPEN / CLOSE ──────────────────────────────────────────────────────────
    const toggleSearch = (show) => {
        searchOverlay.classList.toggle('active', show);
        document.body.classList.toggle('search-active', show);
        document.body.style.overflow = show ? 'hidden' : '';
        focusIdx = -1;
        if (show) {
            warmSearchIndex();
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

    // Start downloading the index as soon as the visitor shows intent to search
    [searchBtnMobile, searchBtnDesktop].forEach(btn => {
        if (!btn) return;
        btn.addEventListener('pointerenter', warmSearchIndex, { once: true, passive: true });
        btn.addEventListener('touchstart',   warmSearchIndex, { once: true, passive: true });
    });

    if (searchBtnMobile)  searchBtnMobile.addEventListener('click',  () => toggleSearch(true));
    if (searchBtnDesktop) searchBtnDesktop.addEventListener('click', () => toggleSearch(true));
    if (closeSearch)      closeSearch.addEventListener('click',      () => toggleSearch(false));
    if (searchOverlay)    searchOverlay.addEventListener('click',    (e) => { if (e.target === searchOverlay) toggleSearch(false); });

    // ── SEARCH HANDLER WITH ADVANCED RELEVANCE SCORING ────────────────────────
    let debounceTimer = null;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
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

        debounceTimer = setTimeout(() => {
            // Index not downloaded yet: show a loader, then re-run this search
            if (!navSearchData) {
                searchResults.innerHTML = LOADING;
                loadSearchIndex()
                    .then(() => {
                        if (searchInput.value.trim()) searchInput.dispatchEvent(new Event('input'));
                    })
                    .catch(() => {
                        if (searchInput.value.trim() === queryRaw) searchResults.innerHTML = LOADERROR;
                    });
                return;
            }

            const query = normalizeSearch(queryRaw);
            const queryWords = query.split(/\s+/).filter(w => w.length >= 1);

            const scored = navSearchData.map(item => {
                const normTitle   = normalizeSearch(item.title);
                const normDesc    = normalizeSearch(item.desc);
                const normKws     = (item.keywords || []).map(k => normalizeSearch(k));
                const normSp      = item.specialty ? normalizeSearch(item.specialty) : '';

                let totalScore = 0;
                let matchedWordsCount = 0;

                // Exact full query boost
                if (normTitle === query)                   totalScore += 250;
                else if (normTitle.startsWith(query))       totalScore += 160;
                else if (normTitle.includes(query))         totalScore += 110;
                else if (normDesc.includes(query))          totalScore += 45;

                for (const word of queryWords) {
                    let bestTokenScore = 0;
                    const stems = getWordStems(word);

                    for (const stem of stems) {
                        // Title matches
                        if (normTitle === stem) {
                            bestTokenScore = Math.max(bestTokenScore, 100);
                        } else if (normTitle.startsWith(stem) || normTitle.includes(' ' + stem)) {
                            bestTokenScore = Math.max(bestTokenScore, 75);
                        } else if (normTitle.includes(stem)) {
                            bestTokenScore = Math.max(bestTokenScore, 45);
                        }

                        // Specialty matches
                        if (normSp) {
                            if (normSp === stem || normSp.startsWith(stem)) {
                                bestTokenScore = Math.max(bestTokenScore, 65);
                            } else if (normSp.includes(stem)) {
                                bestTokenScore = Math.max(bestTokenScore, 35);
                            }
                        }

                        // Keywords matches
                        for (const kw of normKws) {
                            if (!kw) continue;
                            if (kw === stem) {
                                bestTokenScore = Math.max(bestTokenScore, 55);
                            } else if (kw.startsWith(stem) || kw.includes(' ' + stem)) {
                                bestTokenScore = Math.max(bestTokenScore, 40);
                            } else if (kw.includes(stem)) {
                                bestTokenScore = Math.max(bestTokenScore, 25);
                            }
                        }

                        // Description matches
                        if (normDesc.includes(stem)) {
                            bestTokenScore = Math.max(bestTokenScore, 18);
                        }

                        // Fuzzy tolerance for words >= 4 letters if no exact hit
                        if (bestTokenScore === 0 && stem.length >= 4) {
                            const titleWords = normTitle.split(/\s+/);
                            for (const tw of titleWords) {
                                if (Math.abs(tw.length - stem.length) <= 1 && editDistance(tw, stem) === 1) {
                                    bestTokenScore = Math.max(bestTokenScore, 30);
                                    break;
                                }
                            }
                        }
                    }

                    if (bestTokenScore > 0) {
                        matchedWordsCount++;
                        totalScore += bestTokenScore;
                    }
                }

                // If no tokens matched at all
                if (matchedWordsCount === 0) return { item, score: 0, matched: false };

                // Conjunction bonus: matching all user words gives a significant multiplier
                if (matchedWordsCount === queryWords.length) {
                    totalScore *= 1.8;
                } else {
                    totalScore *= (matchedWordsCount / queryWords.length) * 0.6;
                }

                return { item, score: Math.round(totalScore), matched: totalScore > 0 };
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
                const highlightedTitle = highlightMatches(item.title, queryWords);
                const highlightedDesc  = highlightMatches(item.desc, queryWords);
                a.innerHTML = '<i class="' + item.icon + '"></i><div class="result-info"><h4>' + highlightedTitle + (item.specialty ? '<span class="result-specialty-badge">' + item.specialty + '</span>' : '') + '</h4><p>' + highlightedDesc + '</p></div>';
                a.addEventListener('click', () => { saveRecent(queryRaw); toggleSearch(false); });
                searchResults.appendChild(a);
            });
        }, 40);
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
async function bootPage() {
    try {
        // Share button runs immediately — before any async ops that could fail
        try { buildBac2026ShareBtn(); } catch (e) { console.warn(e); }

        // Inject components concurrently with safe timeouts
        await Promise.all([
            injectComponent('#navbar-placeholder', '/components/navbar?v=1.7'),
            injectComponent('#footer-placeholder', '/components/footer?v=1.4')
        ]);

        // Ensure search placeholder is at body level for max z-index
        if (!document.getElementById('search-placeholder')) {
            const sp = document.createElement('div');
            sp.id = 'search-placeholder';
            (document.body || document.documentElement).appendChild(sp);
        }
        await injectComponent('#search-placeholder', '/components/search');

        // Setup after injection - isolate each step so one failure cannot kill boot
        try { setupMobileMenu(); } catch (e) { console.warn('MobileMenu error', e); }
        try { setupNavbarScroll(); } catch (e) { console.warn('NavbarScroll error', e); }
        try { setupSearch(); } catch (e) { console.warn('Search error', e); }
        try { injectAdStrip(); } catch (e) { console.warn('AdStrip error', e); }
        try { injectAdCards(); } catch (e) { console.warn('AdCards error', e); }
        try { setupScrollToTop(); } catch (e) { console.warn('ScrollToTop error', e); }
        try { setupSpecFilterTabs(); } catch (e) { console.warn('SpecFilter error', e); }

        // Handle hash-based section
        try { handleHashNav(); } catch (e) { console.warn('HashNav error', e); }

        // Fade in the content
        const pageContent = document.querySelector('main');
        if (pageContent) {
            pageContent.classList.add('fade-in');
        }
        if (document.body) {
            document.body.classList.add('page-ready');
        }

        // Inject global CTA section (all pages except university)
        try { injectGlobalCTA(); } catch (e) { console.warn('CTA error', e); }

        // Setup smooth accordion animations for FAQs across the site
        try { initSmoothDetails(); } catch (e) { console.warn('FAQ anim error', e); }

        // Setup sticky stack cards animation (.adp-scard on advertise & contribute pages)
        try { initStickyStackCards(); } catch (e) { console.warn('StickyStack error', e); }

        // Setup network-aware smart speculative prefetching (0% data waste, instant clicks on good networks)
        try { setupSmartPrefetch(); } catch (e) { console.warn('SmartPrefetch error', e); }
    } catch (err) {
        console.error('Error during page boot:', err);
    } finally {
        // GUARANTEE LOADER DISMISSAL: hideLoader() is always called regardless of success or failure
        hideLoader();
    }

    // Show BMA Sponsored Announcement modal (900ms after loader) - appears once every 24 hours
    try {
        setTimeout(showBac2026AnnouncementModal, 900);
    } catch (e) {}

    // Register Service Worker for PWA / Shortcut functionality
    if ('serviceWorker' in navigator) {
        var hadController = !!navigator.serviceWorker.controller;

        const regSw = () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => { reg.update(); })
                .catch(err => console.warn('SW failed', err));
        };

        if (document.readyState === 'complete') {
            regSw();
        } else {
            window.addEventListener('load', regSw, { once: true });
        }

    }
}

/* ── Global Interactive Sticky Stack Cards (.adp-scard) ── */
function initStickyStackCards() {
    const stacks = document.querySelectorAll('.adp-why-stack, .cnt-why-stack');
    if (!stacks.length) return;

    stacks.forEach(stack => {
        if (stack._stackInit) return;
        stack._stackInit = true;

        const cards = [...stack.querySelectorAll('.adp-scard')];
        if (cards.length < 2) return;

        // Ensure proper ascending z-index so next cards always stack cleanly above previous ones
        cards.forEach((card, idx) => {
            card.style.zIndex = (idx + 1).toString();
        });

        let ticking = false;

        function update() {
            ticking = false;
            const N = cards.length;

            cards.forEach((card, i) => {
                const computedTop = parseFloat(window.getComputedStyle(card).top) || 110;
                const cardH = card.offsetHeight || 160;
                let depth = 0;

                for (let j = i + 1; j < N; j++) {
                    const nextRect = cards[j].getBoundingClientRect();
                    const nextComputedTop = parseFloat(window.getComputedStyle(cards[j]).top) || (computedTop + (j - i) * 20);
                    const dist = nextRect.top - nextComputedTop;
                    if (dist <= 0) {
                        depth += 1;
                    } else if (dist < cardH) {
                        depth += (1 - dist / cardH);
                    }
                }

                if (depth <= 0.001) {
                    card.style.transform = 'none';
                    card.style.filter = 'none';
                } else {
                    const scale = (1 - depth * 0.045).toFixed(4);
                    const translateY = -(depth * 14).toFixed(1);
                    const brightness = Math.max(1 - depth * 0.07, 0.72).toFixed(4);

                    card.style.transform = `scale(${scale}) translateY(${translateY}px)`;
                    card.style.filter = `brightness(${brightness})`;
                }
            });
        }

        function requestUpdate() {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }

        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate, { passive: true });
        // Immediate runs
        requestAnimationFrame(update);
        setTimeout(update, 100);
        setTimeout(update, 400);
        window.addEventListener('load', update, { once: true });
    });
}

// Auto-run immediately when script loads if DOM is ready
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initStickyStackCards();
} else {
    document.addEventListener('DOMContentLoaded', initStickyStackCards);
}

/* ── Global Smooth Details / FAQ Accordion ── */
function initSmoothDetails() {
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function getElementClosedHeight(el, summary) {
        var computed = window.getComputedStyle(el);
        var padTop = parseFloat(computed.paddingTop) || 0;
        var padBottom = parseFloat(computed.paddingBottom) || 0;
        var borderTop = parseFloat(computed.borderTopWidth) || 0;
        var borderBottom = parseFloat(computed.borderBottomWidth) || 0;
        var summaryHeight = summary.getBoundingClientRect().height;
        return Math.ceil(summaryHeight + padTop + padBottom + borderTop + borderBottom);
    }

    function setupSmoothDetails(el) {
        if (el._smoothInit) return;
        el._smoothInit = true;

        var summary = el.querySelector('summary');
        if (!summary || !el.animate) return;

        var content = el.querySelector('p, .crc-faq-content') || Array.prototype.find.call(el.children, function (c) { return c.tagName !== 'SUMMARY'; });
        var anim = null;
        var contentAnim = null;
        var isClosing = false;
        var isExpanding = false;

        function finishAnimation(isOpen) {
            el.open = isOpen;
            anim = null;
            contentAnim = null;
            isClosing = false;
            isExpanding = false;
            el.style.height = '';
            el.style.overflow = '';
            el.classList.remove('is-closing');
        }

        function shrink() {
            if (isClosing || !el.open) return;
            isClosing = true;
            isExpanding = false;
            el.classList.add('is-closing');

            if (reducedMotion) {
                finishAnimation(false);
                return;
            }

            var startHeight = el.getBoundingClientRect().height;
            var endHeight = getElementClosedHeight(el, summary);

            if (anim) anim.cancel();
            if (contentAnim) contentAnim.cancel();

            el.style.overflow = 'hidden';

            anim = el.animate(
                [{ height: startHeight + 'px' }, { height: endHeight + 'px' }],
                { duration: 320, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
            );

            if (content) {
                contentAnim = content.animate(
                    [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-6px)' }],
                    { duration: 240, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
                );
            }

            anim.onfinish = function () { finishAnimation(false); };
            anim.oncancel = function () { isClosing = false; };
        }

        function open() {
            if (isExpanding || el.open) return;
            isExpanding = true;
            isClosing = false;
            el.classList.remove('is-closing');

            if (reducedMotion) {
                finishAnimation(true);
                return;
            }

            var startHeight = el.getBoundingClientRect().height || getElementClosedHeight(el, summary);
            el.style.height = startHeight + 'px';
            el.style.overflow = 'hidden';
            el.open = true;

            window.requestAnimationFrame(function () {
                var computed = window.getComputedStyle(el);
                var borderTop = parseFloat(computed.borderTopWidth) || 0;
                var borderBottom = parseFloat(computed.borderBottomWidth) || 0;
                var endHeight = Math.ceil(el.scrollHeight + borderTop + borderBottom);

                if (anim) anim.cancel();
                if (contentAnim) contentAnim.cancel();

                anim = el.animate(
                    [{ height: startHeight + 'px' }, { height: endHeight + 'px' }],
                    { duration: 360, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
                );

                if (content) {
                    contentAnim = content.animate(
                        [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'translateY(0)' }],
                        { duration: 360, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
                    );
                }

                anim.onfinish = function () { finishAnimation(true); };
                anim.oncancel = function () { isExpanding = false; };
            });
        }

        function doToggle() {
            if (el.open && !isClosing) {
                shrink();
            } else {
                open();
            }
        }

        summary.addEventListener('click', function (e) {
            e.preventDefault();
            doToggle();
        });

        el.addEventListener('click', function (e) {
            if (e.target.closest('a, button, input, textarea, select')) return;
            if (e.target === el) {
                e.preventDefault();
                doToggle();
            }
        });

        el._smoothOpen = open;
        el._smoothClose = shrink;
    }

    document.querySelectorAll('.crc-faq details, .faq-accordion details, details.smooth-details, .accordion-item details').forEach(setupSmoothDetails);
}


// ─── NETWORK-AWARE SMART SPECULATIVE PREFETCHER ───────────────────────────────
// Smooth, zero-data-waste speculative prefetching for instant page transitions
function setupSmartPrefetch() {
    // 1. Connection check: Don't prefetch if user has Save-Data or is on 2G/3G
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
        if (conn.saveData) return; // User requested data saver
        if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.effectiveType === '3g') {
            return; // Slow network -> preserve bandwidth
        }
    }

    var prefetched = new Set();
    var isInternal = function(url) {
        try {
            var u = new URL(url, location.href);
            return u.origin === location.origin &&
                   !u.pathname.match(/\.(pdf|zip|png|jpg|jpeg|webp|svg|ico)$/i) &&
                   u.pathname !== location.pathname;
        } catch (e) {
            return false;
        }
    };

    var prefetchUrl = function(url) {
        if (!url || prefetched.has(url) || !isInternal(url)) return;
        prefetched.add(url);

        var link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = 'document';
        document.head.appendChild(link);
    };

    var hoverTimer = null;

    document.addEventListener('mouseover', function(e) {
        var anchor = e.target.closest('a[href]');
        if (!anchor) return;
        var href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

        hoverTimer = setTimeout(function() {
            prefetchUrl(anchor.href);
        }, 65);
    }, { passive: true });

    document.addEventListener('mouseout', function(e) {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
    }, { passive: true });

    document.addEventListener('touchstart', function(e) {
        var anchor = e.target.closest('a[href]');
        if (!anchor) return;
        var href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
        prefetchUrl(anchor.href);
    }, { passive: true });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootPage, { once: true });
} else {
    bootPage();
}
