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
        <a href="/tools.html#calculator" class="gcta-card gcta-card--calc">
            <div class="gcta-icon-circle"><i class="fas fa-calculator"></i></div>
            <div class="gcta-text">
                <strong>حاسبة المعدل</strong>
                <span>احسب معدلك واعرف نتيجتك التقديرية</span>
            </div>
            <div class="gcta-btn">احسب الآن <i class="fas fa-arrow-left"></i></div>
        </a>
        <a href="/university.html" class="gcta-card gcta-card--uni">
            <div class="gcta-icon-circle"><i class="fas fa-university"></i></div>
            <div class="gcta-text">
                <strong>مرحباً بك في مرحلة جديدة!</strong>
                <span>اكتشف نظام الجامعة الجزائرية وخطط لمستقبلك</span>
            </div>
            <div class="gcta-btn">اكتشف الجامعة <i class="fas fa-arrow-left"></i></div>
        </a>
        <a href="/tools.html" class="gcta-card gcta-card--timer">
            <div class="gcta-icon-circle"><i class="fas fa-hourglass-half"></i></div>
            <div class="gcta-text">
                <strong>قداه بقى؟ </strong>
                <span>شوف الوقت المتبقي للتصحيح والنتائج لحظة بلحظة</span>
            </div>
            <div class="gcta-btn">تفقد العد التنازلي <i class="fas fa-arrow-left"></i></div>
        </a>
    </div>
    <!-- Mobile-only rotation dots -->
    <div class="gcta-dots" id="gcta-dots">
        <span class="gcta-dot gcta-dot--active"></span>
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
    btn.setAttribute('title', 'scroll-btn');
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

// ─── TELEGRAM ANNOUNCEMENT CARD ────────────────────────────────────────────────────
const WELCOME_KEY = 'bs_seen_telegram_announce_v20';

function showTelegramWelcomeModal() {
    if (localStorage.getItem(WELCOME_KEY)) return;

    // Dynamic Loading of the CSS stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/islamic-welcome.css?v=2.9';
    document.head.appendChild(link);

    // Create the HTML overlay structure
    const overlay = document.createElement('div');
    overlay.id = 'islamic-welcome-overlay';
    overlay.className = 'islamic-overlay';

    // Golden Lantern SVGs with elegant designs
    const lanternSVGLeft = `
        <svg class="islamic-lantern islamic-lantern-left" viewBox="0 0 100 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="50" y1="0" x2="50" y2="40" stroke="#bf953f" stroke-width="2.5"/>
            <!-- Ring -->
            <circle cx="50" cy="46" r="6" stroke="#bf953f" stroke-width="2.5"/>
            <!-- Top Cap -->
            <path d="M50 56 L35 76 L65 76 Z" fill="url(#gold-grad)"/>
            <!-- Glass Body -->
            <path d="M35 76 L40 126 L60 126 L65 76 Z" fill="rgba(255, 215, 0, 0.15)" stroke="#bf953f" stroke-width="2.5"/>
            <!-- Inner Light Glow -->
            <circle cx="50" cy="101" r="14" fill="#ffd54f" opacity="0.35" filter="blur(4px)"/>
            <circle cx="50" cy="101" r="6" fill="#ffffff" opacity="0.9"/>
            <!-- Bottom Cap -->
            <path d="M38 126 L30 136 L70 136 L62 126 Z" fill="url(#gold-grad)"/>
            <!-- Tassel hanging -->
            <line x1="50" y1="136" x2="50" y2="166" stroke="#bf953f" stroke-width="2"/>
            <circle cx="50" cy="170" r="4" fill="#bf953f"/>
        </svg>
    `;

    const lanternSVGRight = `
        <svg class="islamic-lantern islamic-lantern-right" viewBox="0 0 100 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="50" y1="0" x2="50" y2="40" stroke="#bf953f" stroke-width="2.5"/>
            <!-- Ring -->
            <circle cx="50" cy="46" r="6" stroke="#bf953f" stroke-width="2.5"/>
            <!-- Top Cap -->
            <path d="M50 56 L35 76 L65 76 Z" fill="url(#gold-grad)"/>
            <!-- Glass Body -->
            <path d="M35 76 L40 126 L60 126 L65 76 Z" fill="rgba(255, 215, 0, 0.15)" stroke="#bf953f" stroke-width="2.5"/>
            <!-- Inner Light Glow -->
            <circle cx="50" cy="101" r="14" fill="#ffd54f" opacity="0.35" filter="blur(4px)"/>
            <circle cx="50" cy="101" r="6" fill="#ffffff" opacity="0.9"/>
            <!-- Bottom Cap -->
            <path d="M38 126 L30 136 L70 136 L62 126 Z" fill="url(#gold-grad)"/>
            <!-- Tassel hanging -->
            <line x1="50" y1="136" x2="50" y2="166" stroke="#bf953f" stroke-width="2"/>
            <circle cx="50" cy="170" r="4" fill="#bf953f"/>
        </svg>
    `;

    // Islamic Ornamental Divider SVG
    const dividerSVG = `
        <svg viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#ff6b35" />
                    <stop offset="25%" stop-color="#ff9f43" />
                    <stop offset="50%" stop-color="#ffebbc" />
                    <stop offset="75%" stop-color="#ff9f43" />
                    <stop offset="100%" stop-color="#ff6b35" />
                </linearGradient>
            </defs>
            <!-- Left scroll line -->
            <path d="M15 10 Q 55 2, 90 10" stroke="url(#gold-grad)" stroke-width="1.5" fill="none"/>
            <!-- Right scroll line -->
            <path d="M185 10 Q 145 2, 110 10" stroke="url(#gold-grad)" stroke-width="1.5" fill="none"/>
            <!-- Central Simple Ornament -->
            <path d="M100 6 L104 10 L100 14 L96 10 Z" fill="url(#gold-grad)"/>
            <circle cx="83" cy="10" r="2.5" fill="url(#gold-grad)"/>
            <circle cx="117" cy="10" r="2.5" fill="url(#gold-grad)"/>
            <circle cx="73" cy="10" r="1.5" fill="url(#gold-grad)"/>
            <circle cx="127" cy="10" r="1.5" fill="url(#gold-grad)"/>
        </svg>
    `;

    overlay.innerHTML = `
        <div class="islamic-card">
            <button class="islamic-close-btn" id="islamicCloseBtn" aria-label="إغلاق">
                <i class="fas fa-times"></i>
            </button>
            <div class="islamic-card-pattern"></div>

            <div class="islamic-decor-top"><i class="fa-solid fa-graduation-cap"></i></div>

            <h3 class="islamic-welcome-title">تحديث جديد وحصري لمرحلة ما بعد الباك!</h3>

            <div class="islamic-divider-ornament">
                ${dividerSVG}
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.8rem; margin: 0.6rem 0 1.2rem 0; direction: rtl; text-align: right; z-index: 1; position: relative; padding: 0 15px;">
                <div style="font-size: 0.98rem; color: #fff; line-height: 1.6;">
                    <strong>حاسبة المعدل:</strong> كيف سيبدو كشف نقاطك أو اسمك في الجريدة الرسمية؟
                </div>
                <div style="font-size: 0.98rem; color: #fff; line-height: 1.6;">
                    <strong>دليل الجامعة:</strong> تصفح شروط ومعدلات القبول لجميع التخصصات.
                </div>
                <div style="font-size: 0.98rem; color: #fff; line-height: 1.6;">
                    <strong>التصحيحات و الأخبار:</strong> تحصل على التصحيحات النموذجية في الموقع فور توفرها، و تابع أخبار الجوائز الحصرية على قناتنا في التلغرام.
                </div>
            </div>

            <div class="islamic-btn-group">
                <a href="/tools.html#calculator" class="islamic-welcome-btn btn-orange" id="islamicWelcomeBtn">
                    <i class="fas fa-calculator"></i> جرب حاسبة المعدل وكشف النقاط
                </a>
                <a href="/university.html" class="islamic-welcome-btn btn-navy">
                    <i class="fas fa-university"></i> تصفح دليل التخصصات الجامعية
                </a>
                <a href="https://t.me/islembacdz" target="_blank" class="islamic-welcome-btn btn-blue">
                    <i class="fab fa-telegram-plane"></i> تابع أخبار النتائج والجوائز
                </a>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';

    // Fade in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.classList.add('is-visible');
        });
    });

    const dismissModal = () => {
        // Write to localStorage so they don't see it again immediately
        localStorage.setItem(WELCOME_KEY, '1');
        
        // Fade out
        overlay.classList.add('fade-out');
        
        // Restore scrolling
        document.body.style.overflow = '';
        
        // Clean up DOM after transition
        setTimeout(() => {
            if (overlay.parentNode) overlay.remove();
        }, 600);
        
        // Clean up key listener
        document.removeEventListener('keydown', handleEsc);
    };

    // Close on button clicks
    overlay.querySelectorAll('.islamic-welcome-btn, .islamic-close-btn').forEach(btn => {
        btn.addEventListener('click', dismissModal);
    });

    // Close on clicking outside the card (overlay background)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            dismissModal();
        }
    });

    // Close on ESC key press
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

    // ── SMART SEARCH DATA ─────────────────────────────────────────────────────
    // Each entry: { title, desc, url, icon, specialty (null = all), keywords[] }
    // specialty: string label shown as a badge when the result is specialty-specific
    const navSearchData = [

        // ── BROAD SUBJECT ENTRIES (matched by subject name) ────────────────
        { title: 'الرياضيات', desc: 'ملخصات، تمارين ومواضيع في الرياضيات', url: '/resources.html#math', icon: 'fas fa-calculator', specialty: null, keywords: ['رياضيات', 'math', 'حساب', 'ملخصات الرياضيات'] },
        { title: 'العلوم الفيزيائية', desc: 'ميكانيك، كهرباء، كيمياء وتحولات نووية', url: '/resources.html#phys', icon: 'fas fa-atom', specialty: null, keywords: ['فيزياء', 'فيزيائية', 'physics', 'ملخصات الفيزياء'] },
        { title: 'العلوم الطبيعية', desc: 'بيولوجيا، البروتين، المناعة والاتصال العصبي', url: '/resources.html#science', icon: 'fas fa-flask', specialty: null, keywords: ['علوم طبيعية', 'بيولوجيا', 'علوم الحياة', 'ملخصات العلوم'] },
        { title: 'مواد التكنولوجيا', desc: 'هندسة مدنية، كهربائية، ميكانيكية وطرائق', url: '/resources.html#tech', icon: 'fas fa-microchip', specialty: null, keywords: ['تكنولوجيا', 'تقني', 'هندسة'] },
        { title: 'تسيير واقتصاد', desc: 'محاسبة، قانون، اقتصاد ومناجمنت', url: '/resources.html#management', icon: 'fas fa-chart-line', specialty: null, keywords: ['تسيير', 'اقتصاد', 'management'] },
        { title: 'مواضيع البكالوريا', desc: 'مواضيع رسمية 2025 و2024 مع التصحيح', url: '/bac-topics.html', icon: 'fas fa-file-alt', specialty: null, keywords: ['مواضيع', 'بكالوريا', 'BAC', 'تصحيح', 'موضوع', 'اختبار رسمي', 'بكالوريات'] },
        { title: 'دليل الجامعة 2025', desc: 'تخصصات، معدلات القبول والتوجيه الجامعي', url: '/university.html', icon: 'fas fa-university', specialty: null, keywords: ['جامعة', 'LMD', 'توجيه', 'معدل القبول', 'تخصص', 'ESTIN', 'ENSIA', 'Polytech', 'طب', 'مهندس', 'صيدلة', 'شبه طبي', 'ذكاء اصطناعي', 'أمن سيبراني', 'Medicine'] },
        { title: 'الأدوات وخطط التميز', desc: 'حاسبة المعدل، توقيت الباك وخطط الدراسة', url: '/tools.html', icon: 'fas fa-tools', specialty: null, keywords: ['أدوات', 'خطط', 'حاسبة', 'معدل', 'توقيت', 'تحديات', 'تميز', 'خطة', 'عقبة بن نافع'] },

        // ── MATH — SPECIALTY SECTIONS ──────────────────────────────────────
        { title: 'الرياضيات', desc: 'دروس، ملخصات وتمارين', url: '/resources.html#math-matheleme', icon: 'fas fa-calculator', specialty: 'رياضيات', keywords: ['رياضيات', 'ملخصات', 'دروس', 'تمارين'] },
        { title: 'الرياضيات', desc: 'دروس، ملخصات وتمارين', url: '/resources.html#math-sci', icon: 'fas fa-calculator', specialty: 'علوم تجريبية', keywords: ['رياضيات', 'ملخصات', 'دروس', 'تمارين'] },
        { title: 'الرياضيات', desc: 'دروس، ملخصات وتمارين', url: '/resources.html#math-tech', icon: 'fas fa-calculator', specialty: 'تقني رياضي', keywords: ['رياضيات', 'ملخصات', 'دروس', 'تمارين'] },
        { title: 'الرياضيات', desc: 'دروس، ملخصات وتمارين', url: '/resources.html#ge-math', icon: 'fas fa-calculator', specialty: 'تسيير واقتصاد', keywords: ['رياضيات', 'ملخصات', 'دروس', 'تمارين'] },
        { title: 'الرياضيات', desc: 'الرياضيات المختزلة', url: '/resources.html#math-lit-lang', icon: 'fas fa-calculator', specialty: 'آداب · لغات', keywords: ['رياضيات', 'ملخصات', 'دروس'] },

        // ── MATH — GRANULAR TOPICS ─────────────────────────────────────────
        { title: 'الدوال العددية', desc: 'حدود، اشتقاق ودراسة دالة', url: '/resources.html#dawal', icon: 'fas fa-wave-square', specialty: 'علوم · تقني · رياضيات', keywords: ['الدوال', 'دالة', 'اشتقاق', 'حدود', 'نهايات', 'دراسة دالة', 'تمثيل بياني'] },
        { title: 'الدوال العددية', desc: 'الدوال — آداب ولغات', url: '/resources.html#dawal-lit-lang', icon: 'fas fa-wave-square', specialty: 'آداب · لغات', keywords: ['الدوال', 'دالة', 'اشتقاق', 'حدود'] },
        { title: 'الدوال اللوغاريتمية', desc: 'الدالة اللوغاريتمية وتطبيقاتها', url: '/resources.html#ge-math-log-functions', icon: 'fas fa-wave-square', specialty: 'تسيير واقتصاد', keywords: ['لوغاريتم', 'لوغاريتمية', 'ln', 'log', 'الدوال'] },
        { title: 'الدوال الأسية', desc: 'الدالة الأسية والتطبيقات', url: '/resources.html#ge-math-exp-functions', icon: 'fas fa-wave-square', specialty: 'تسيير واقتصاد', keywords: ['دوال أسية', 'الأسية', 'exp', 'الدوال'] },
        { title: 'الدوال الأصلية', desc: 'حساب التكامل والدوال الأصلية', url: '/resources.html#ge-math-primitive-functions', icon: 'fas fa-wave-square', specialty: 'تسيير واقتصاد', keywords: ['الدوال الأصلية', 'تكامل', 'أصلية', 'الدوال'] },
        { title: 'الدوال العددية', desc: 'الدوال والمنحنيات — تسيير واقتصاد', url: '/resources.html#ge-math-numeric-functions', icon: 'fas fa-wave-square', specialty: 'تسيير واقتصاد', keywords: ['الدوال', 'دالة عددية', 'الدوال العددية'] },
        { title: 'المتتاليات العددية', desc: 'متتاليات حسابية وهندسية', url: '/resources.html#sequences', icon: 'fas fa-sort-numeric-up', specialty: 'علوم · تقني · رياضيات', keywords: ['المتتاليات', 'متتالية', 'حسابية', 'هندسية', 'متتاليات عددية'] },
        { title: 'المتتاليات العددية', desc: 'المتتاليات — آداب ولغات', url: '/resources.html#sequences-lit-lang', icon: 'fas fa-sort-numeric-up', specialty: 'آداب · لغات', keywords: ['المتتاليات', 'متتالية', 'حسابية', 'هندسية'] },
        { title: 'المتتاليات', desc: 'مسائل المتتاليات — تسيير واقتصاد', url: '/resources.html#ge-math-sequences', icon: 'fas fa-sort-numeric-up', specialty: 'تسيير واقتصاد', keywords: ['المتتاليات', 'متتالية'] },
        { title: 'الجبر والأعداد', desc: 'القسمة في Z، المنطق والمعادلات', url: '/resources.html#algebra', icon: 'fas fa-superscript', specialty: 'علوم · تقني · رياضيات', keywords: ['الجبر', 'الأعداد', 'القسمة', 'PGCD', 'PPCM', 'منطق', 'جبر'] },
        { title: 'الجبر والأعداد', desc: 'الجبر المختزل — آداب ولغات', url: '/resources.html#algebra-lit-lang', icon: 'fas fa-superscript', specialty: 'آداب · لغات', keywords: ['الجبر', 'الأعداد'] },
        { title: 'الاحتمالات', desc: 'شرطية، برنولي وباواسون', url: '/resources.html#proba', icon: 'fas fa-dice', specialty: 'علوم · تقني · رياضيات', keywords: ['الاحتمالات', 'احتمال', 'برنولي', 'باواسون', 'احتمالات شرطية'] },
        { title: 'الاحتمالات', desc: 'الاحتمالات — آداب ولغات', url: '/resources.html#proba-lit-lang', icon: 'fas fa-dice', specialty: 'آداب · لغات', keywords: ['الاحتمالات', 'احتمال'] },
        { title: 'الاحتمالات', desc: 'الاحتمالات — تسيير واقتصاد', url: '/resources.html#ge-math-probability', icon: 'fas fa-dice', specialty: 'تسيير واقتصاد', keywords: ['الاحتمالات', 'احتمال'] },
        { title: 'الإحصاء', desc: 'الإحصاء الوصفي والتحليلي', url: '/resources.html#ge-math-statistics', icon: 'fas fa-chart-bar', specialty: 'تسيير واقتصاد', keywords: ['الإحصاء', 'إحصاء', 'إحصائيات', 'statistics'] },
        { title: 'الأعداد المركبة', desc: 'الأشكال الثلاثية، هرميتي وتطبيقات', url: '/resources.html#complex', icon: 'fas fa-infinity', specialty: 'علوم · تقني · رياضيات', keywords: ['الأعداد المركبة', 'مركبة', 'أعداد مركبة', 'هرميتي', 'مركب'] },
        { title: 'المعادلات التفاضلية', desc: 'تمارين وملخصات المعادلات التفاضلية', url: '/resources.html#math-matheleme', icon: 'fas fa-equals', specialty: 'رياضيات', keywords: ['المعادلات التفاضلية', 'تفاضلية'] },
        { title: 'مجلات الخليل', desc: 'أفكار الوحدة وتمارين مجلة الخليل', url: '/resources.html#El-khalil-magazines', icon: 'fas fa-book-open', specialty: null, keywords: ['الخليل', 'مجلات الخليل', 'أفكار الوحدة'] },
        { title: 'المكتسبات القبلية', desc: 'مراجعة الأساسيات — رياضيات', url: '/resources.html#moktasabat-math', icon: 'fas fa-star', specialty: 'رياضيات', keywords: ['المكتسبات القبلية', 'مراجعة', 'أساسيات رياضيات'] },

        // ── PHYSICS — SPECIALTY SECTIONS ──────────────────────────────────
        { title: 'العلوم الفيزيائية', desc: 'ميكانيك، كهرباء وكيمياء', url: '/resources.html#phys-matheleme-tech', icon: 'fas fa-atom', specialty: 'رياضيات · تقني', keywords: ['فيزياء', 'فيزيائية', 'ملخصات', 'تمارين'] },
        { title: 'العلوم الفيزيائية', desc: 'ميكانيك، كهرباء وكيمياء', url: '/resources.html#phys-sci', icon: 'fas fa-atom', specialty: 'علوم تجريبية', keywords: ['فيزياء', 'فيزيائية', 'ملخصات', 'تمارين'] },

        // ── PHYSICS — GRANULAR TOPICS ──────────────────────────────────────
        { title: 'المتابعة الزمنية للحركات', desc: 'حركة الأجسام، تركيبات السرعات والقذيفة', url: '/resources.html#motaba3a', icon: 'fas fa-clock', specialty: null, keywords: ['المتابعة', 'الزمنية', 'حركة', 'سرعة', 'السقوط', 'القذيفة', 'متابعة زمنية'] },
        { title: 'الميكانيك', desc: 'القوى، الديناميكا والمستوى المائل', url: '/resources.html#mechanics', icon: 'fas fa-cogs', specialty: null, keywords: ['الميكانيك', 'ميكانيك', 'القوى', 'الديناميكا', 'الأقمار', 'الجاذبية', 'مستوى مائل'] },
        { title: 'الكهرباء', desc: 'الدوائر الكهربائية RLC، RC، RL', url: '/resources.html#electricity', icon: 'fas fa-bolt', specialty: null, keywords: ['الكهرباء', 'كهربائية', 'RLC', 'RC', 'RL', 'تذبذبات', 'كهرباء'] },
        { title: 'الأحماض والأسس', desc: 'المعايرة، pH والأحماض الضعيفة والقوية', url: '/resources.html#acides', icon: 'fas fa-vial', specialty: null, keywords: ['الأحماض', 'الأسس', 'معايرة', 'ph', 'كيمياء', 'أحماض', 'أسس'] },
        { title: 'التحولات النووية', desc: 'الانشطار، الاندماج والنشاط الإشعاعي', url: '/resources.html#nawawi', icon: 'fas fa-radiation', specialty: null, keywords: ['النووي', 'التحولات النووية', 'انشطار', 'اندماج', 'إشعاعي', 'نووي', 'تحولات نووية'] },
        { title: 'الأعمدة الكهربائية', desc: 'مصادر الطاقة، القوة الدافعة وبطاريات', url: '/resources.html#a3mida', icon: 'fas fa-battery-half', specialty: null, keywords: ['الأعمدة', 'الكهربائية', 'بطاريات', 'قوة دافعة', 'أعمدة كهربائية'] },
        { title: 'الأسترة والكيمياء العضوية', desc: 'الأسترة، الصابنة والتوازن الكيميائي', url: '/resources.html#astara', icon: 'fas fa-flask', specialty: null, keywords: ['الأسترة', 'صابنة', 'تحولات كيميائية', 'توازن', 'أستر', 'أسترة'] },
        { title: 'الأسئلة النظرية والمنحنيات', desc: 'مقالات نظرية وقراءة المنحنيات', url: '/resources.html#theoric', icon: 'fas fa-chart-line', specialty: null, keywords: ['نظرية', 'مقالات نظرية', 'منحنيات', 'رسوم بيانية', 'نظري'] },
        { title: 'المكتسبات القبلية', desc: 'مراجعة الأساسيات — فيزياء', url: '/resources.html#moktasabat-phys', icon: 'fas fa-star', specialty: 'فيزياء', keywords: ['المكتسبات القبلية', 'مراجعة', 'أساسيات فيزياء'] },

        // ── SCIENCE — SPECIALTY SECTIONS ──────────────────────────────────
        { title: 'العلوم الطبيعية', desc: 'بيولوجيا وعلوم الحياة', url: '/resources.html#sci-sci', icon: 'fas fa-dna', specialty: 'علوم تجريبية', keywords: ['علوم طبيعية', 'بيولوجيا', 'علوم الحياة', 'ملخصات', 'تمارين'] },
        { title: 'العلوم الطبيعية', desc: 'بيولوجيا وعلوم الحياة', url: '/resources.html#sci-matheleme', icon: 'fas fa-dna', specialty: 'رياضيات', keywords: ['علوم طبيعية', 'بيولوجيا', 'علوم الحياة', 'ملخصات', 'تمارين'] },

        // ── SCIENCE — GRANULAR TOPICS ──────────────────────────────────────
        { title: 'تركيب البروتين', desc: 'الشيفرة الجينية، النسخ والترجمة', url: '/resources.html#tarkib-protein', icon: 'fas fa-dna', specialty: null, keywords: ['تركيب البروتين', 'البروتين', 'الشيفرة الجينية', 'النسخ', 'الترجمة', 'البروتين'] },
        { title: 'بنية ووظيفة البروتين', desc: 'العلاقة بين التركيب والوظيفة', url: '/resources.html#3alaqa-protein', icon: 'fas fa-dna', specialty: null, keywords: ['بنية البروتين', 'وظيفة البروتين', 'العلاقة بين بنية ووظيفة', 'البروتين'] },
        { title: 'الإنزيمات', desc: 'نشاط الإنزيمات وعوامل التأثير', url: '/resources.html#inzimat', icon: 'fas fa-flask', specialty: null, keywords: ['الإنزيمات', 'إنزيم', 'إنزيمات', 'نشاط إنزيمي'] },
        { title: 'المناعة', desc: 'المناعة الخلطية والخلوية، اللقاح والمصل', url: '/resources.html#mana3a', icon: 'fas fa-shield-alt', specialty: null, keywords: ['المناعة', 'مناعة', 'مناعي', 'اللقاح', 'المصل', 'خلوية', 'خلطية', 'مناعية'] },
        { title: 'الاتصال العصبي', desc: 'السيالة العصبية والتشابك العصبي', url: '/resources.html#itisal', icon: 'fas fa-brain', specialty: null, keywords: ['الاتصال العصبي', 'العصبي', 'السيالة', 'تشابك', 'عصبي'] },
        { title: 'التركيب الضوئي', desc: 'تحويل الطاقة الضوئية وعوامل التأثير', url: '/resources.html#tarkib', icon: 'fas fa-seedling', specialty: null, keywords: ['التركيب الضوئي', 'البناء الضوئي', 'الكلوروفيل', 'ضوئي', 'بناء ضوئي'] },
        { title: 'التنفس الخلوي', desc: 'مراحل التنفس وتبادل الغازات', url: '/resources.html#tanafos', icon: 'fas fa-lungs', specialty: null, keywords: ['التنفس', 'الخلوي', 'تنفس', 'أكسدة', 'تنفس خلوي'] },
        { title: 'المكتسبات القبلية', desc: 'مراجعة الأساسيات — علوم طبيعية', url: '/resources.html#moktasabat-sci', icon: 'fas fa-star', specialty: 'علوم طبيعية', keywords: ['المكتسبات القبلية', 'مراجعة', 'أساسيات علوم'] },

        // ── TECHNOLOGY TYPES ───────────────────────────────────────────────
        { title: 'الهندسة المدنية', desc: 'مقاومة المواد، التربة والمنشآت', url: '/resources.html#techno-civile', icon: 'fas fa-hard-hat', specialty: 'تقني رياضي', keywords: ['الهندسة المدنية', 'مدني', 'مقاومة المواد', 'التربة', 'خرسانة', 'هندسة مدنية'] },
        { title: 'الهندسة الكهربائية', desc: 'الأنظمة الكهربائية والإلكترونية', url: '/resources.html#techno-electricity', icon: 'fas fa-plug', specialty: 'تقني رياضي', keywords: ['الهندسة الكهربائية', 'كهربائية', 'إلكترونية', 'دوائر', 'هندسة كهربائية'] },
        { title: 'الهندسة الميكانيكية', desc: 'الأنظمة الميكانيكية وتحليل الحركات', url: '/resources.html#techno-mech', icon: 'fas fa-cog', specialty: 'تقني رياضي', keywords: ['الهندسة الميكانيكية', 'ميكانيكية', 'الأنظمة', 'هندسة ميكانيكية'] },
        { title: 'هندسة الطرائق', desc: 'تصميم الطرق والمشاريع الإنشائية', url: '/resources.html#techno-road', icon: 'fas fa-road', specialty: 'تقني رياضي', keywords: ['هندسة الطرائق', 'طرائق', 'الطرق', 'إنشائية'] },

        // ── MANAGEMENT TOPICS ──────────────────────────────────────────────
        { title: 'المحاسبة التحليلية والمالية', desc: 'التكاليف، التحليل المالي والتسيير المحاسبي', url: '/resources.html#accounting', icon: 'fas fa-calculator', specialty: 'تسيير واقتصاد', keywords: ['المحاسبة', 'محاسبة', 'التحليل المالي', 'تكاليف', 'ميزانية', 'محاسبة تحليلية'] },
        { title: 'القانون والاقتصاد', desc: 'القانون التجاري والمبادئ الاقتصادية', url: '/resources.html#ge-law', icon: 'fas fa-gavel', specialty: 'تسيير واقتصاد', keywords: ['القانون', 'قانون', 'تجاري', 'عقود', 'اقتصاد وقانون'] },
        { title: 'الاقتصاد والمناجمنت', desc: 'تسيير المؤسسة، التسويق والاستراتيجية', url: '/resources.html#ge-economics', icon: 'fas fa-chart-line', specialty: 'تسيير واقتصاد', keywords: ['الاقتصاد', 'المناجمنت', 'management', 'تسويق', 'المؤسسة', 'اقتصاد ومناجمنت'] },

        // ── ARABIC — SPECIALTY SECTIONS ───────────────────────────────────
        { title: 'اللغة العربية', desc: 'الشعر، النثر، القواعد والبلاغة', url: '/resources.html#arabic', icon: 'fas fa-book', specialty: null, keywords: ['العربية', 'اللغة العربية', 'عربي', 'arabic', 'عربية'] },
        { title: 'اللغة العربية', desc: 'الأدب العربي الكلاسيكي والحديث', url: '/resources.html#lit-arabic', icon: 'fas fa-book', specialty: 'آداب وفلسفة', keywords: ['العربية', 'اللغة العربية', 'عربي', 'أدب عربي'] },
        { title: 'اللغة العربية', desc: 'القواعد، المصطلحات والنصوص', url: '/resources.html#lang-arabic', icon: 'fas fa-book', specialty: 'لغات أجنبية', keywords: ['العربية', 'اللغة العربية', 'عربي'] },

        // ── ARABIC — GRANULAR TOPICS ───────────────────────────────────────
        { title: 'الشعر التعليمي', desc: 'قصائد الشعر التعليمي وتحليلها', url: '/resources.html#chi3r-ta3limi', icon: 'fas fa-feather-alt', specialty: null, keywords: ['شعر تعليمي', 'الشعر التعليمي', 'شعر', 'قصيدة', 'تعليمي'] },
        { title: 'الشعر المهجري', desc: 'أدب المهجر وأبرز شعرائه', url: '/resources.html#chi3r-mihjari', icon: 'fas fa-feather-alt', specialty: null, keywords: ['شعر مهجري', 'المهجري', 'المهجر', 'شعر'] },
        { title: 'الشعر السياسي', desc: 'الشعر في خدمة القضايا السياسية', url: '/resources.html#chi3r-siyasi', icon: 'fas fa-feather-alt', specialty: null, keywords: ['شعر سياسي', 'السياسي', 'شعر'] },
        { title: 'الشعر الاجتماعي', desc: 'القضايا الاجتماعية في الشعر العربي', url: '/resources.html#chi3r-ijtima3y', icon: 'fas fa-feather-alt', specialty: null, keywords: ['شعر اجتماعي', 'الاجتماعي', 'شعر'] },
        { title: 'شعر الآداب', desc: 'الشعر الكلاسيكي والحديث', url: '/resources.html#lit-chi3r', icon: 'fas fa-feather-alt', specialty: 'آداب وفلسفة', keywords: ['شعر', 'الشعر', 'قصيدة', 'أدب'] },
        { title: 'نثر الآداب', desc: 'النثر الأدبي والنصوص', url: '/resources.html#lit-nathr', icon: 'fas fa-pen', specialty: 'آداب وفلسفة', keywords: ['النثر', 'نثر', 'نصوص أدبية', 'أدب'] },
        { title: 'النشر العلمي المتأدب', desc: 'النصوص العلمية الأدبية وتحليلها', url: '/resources.html#nathr-3ilmi', icon: 'fas fa-pen', specialty: null, keywords: ['النشر العلمي', 'نشر علمي', 'نثر علمي', 'متأدب'] },
        { title: 'فن المقال', desc: 'كتابة المقال الأدبي والنقدي', url: '/resources.html#maqal', icon: 'fas fa-pen-alt', specialty: null, keywords: ['فن المقال', 'المقال', 'مقال', 'مقالة'] },
        { title: 'القواعد اللغوية', desc: 'النحو والصرف والإعراب', url: '/resources.html#arabic-grammer', icon: 'fas fa-spell-check', specialty: null, keywords: ['القواعد', 'اللغوية', 'النحو', 'الصرف', 'الإعراب', 'قواعد'] },
        { title: 'البلاغة والصور البيانية', desc: 'الاستعارة، التشبيه والمجاز', url: '/resources.html#arabic', icon: 'fas fa-star', specialty: null, keywords: ['البلاغة', 'الصور البيانية', 'بيانية', 'استعارة', 'تشبيه', 'مجاز', 'بلاغة'] },

        // ── FRENCH — SPECIALTY SECTIONS ───────────────────────────────────
        { title: 'اللغة الفرنسية', desc: 'النصوص، التعبير الكتابي والقواعد', url: '/resources.html#french', icon: 'fas fa-language', specialty: null, keywords: ['الفرنسية', 'فرنسي', 'français', 'french', 'فرنسية'] },
        { title: 'اللغة الفرنسية', desc: 'الفرنسية الأدبية', url: '/resources.html#french-lit', icon: 'fas fa-language', specialty: 'آداب وفلسفة', keywords: ['الفرنسية', 'فرنسي', 'français', 'فرنسية'] },
        { title: 'اللغة الفرنسية', desc: 'الفرنسية — شعبة لغات', url: '/resources.html#french-lang', icon: 'fas fa-language', specialty: 'لغات أجنبية', keywords: ['الفرنسية', 'فرنسي', 'français', 'فرنسية'] },

        // ── ENGLISH — SPECIALTY SECTIONS ──────────────────────────────────
        { title: 'اللغة الإنجليزية', desc: 'نصوص، محادثة وقواعد الإنجليزية', url: '/resources.html#english', icon: 'fas fa-globe', specialty: null, keywords: ['الإنجليزية', 'إنجليزي', 'English', 'إنجليزية', 'انجليزية', 'Grammer'] },
        { title: 'اللغة الإنجليزية', desc: 'الإنجليزية الأدبية', url: '/resources.html#english-lit', icon: 'fas fa-globe', specialty: 'آداب وفلسفة', keywords: ['الإنجليزية', 'إنجليزي', 'English', 'إنجليزية'] },
        { title: 'اللغة الإنجليزية', desc: 'الإنجليزية — شعبة لغات', url: '/resources.html#english-lang', icon: 'fas fa-globe', specialty: 'لغات أجنبية', keywords: ['الإنجليزية', 'إنجليزي', 'English', 'إنجليزية'] },

        // ── PHILOSOPHY — SPECIALTY SECTIONS ───────────────────────────────
        { title: 'الفلسفة', desc: 'مقالات فلسفية، جدلية واستقصاء', url: '/resources.html#philo', icon: 'fas fa-lightbulb', specialty: null, keywords: ['الفلسفة', 'فلسفة', 'مقالة فلسفية', 'جدلية', 'استقصاء', 'فلسفي'] },
        { title: 'الفلسفة', desc: 'الفلسفة الأدبية', url: '/resources.html#literature-philo', icon: 'fas fa-lightbulb', specialty: 'آداب وفلسفة', keywords: ['الفلسفة', 'فلسفة', 'مقالة فلسفية', 'جدلية', 'فلسفي'] },
        { title: 'الفلسفة', desc: 'الفلسفة — شعبة لغات', url: '/resources.html#languages-philo', icon: 'fas fa-lightbulb', specialty: 'لغات أجنبية', keywords: ['الفلسفة', 'فلسفة', 'مقالة فلسفية', 'فلسفي'] },

        // ── HISTORY-GEO — SPECIALTY SECTIONS ──────────────────────────────
        { title: 'التاريخ والجغرافيا', desc: 'الثورة الجزائرية، الحرب الباردة وحركات التحرر', url: '/resources.html#Hist-geo', icon: 'fas fa-map-marked-alt', specialty: null, keywords: ['التاريخ', 'الجغرافيا', 'تاريخ', 'جغرافيا', 'الثورة الجزائرية', 'الحرب الباردة'] },
        { title: 'التاريخ والجغرافيا', desc: 'التاريخ والجغرافيا', url: '/resources.html#ge-histgeo', icon: 'fas fa-map-marked-alt', specialty: 'تسيير واقتصاد', keywords: ['التاريخ', 'الجغرافيا', 'تاريخ', 'جغرافيا'] },
        { title: 'التاريخ والجغرافيا', desc: 'التاريخ والجغرافيا', url: '/resources.html#histgeo-lit', icon: 'fas fa-map-marked-alt', specialty: 'آداب وفلسفة', keywords: ['التاريخ', 'الجغرافيا', 'تاريخ', 'جغرافيا'] },
        { title: 'التاريخ والجغرافيا', desc: 'التاريخ والجغرافيا', url: '/resources.html#Hist-geo-lang', icon: 'fas fa-map-marked-alt', specialty: 'لغات أجنبية', keywords: ['التاريخ', 'الجغرافيا', 'تاريخ', 'جغرافيا'] },
        { title: 'التاريخ — ملخصات', desc: 'الثورة الجزائرية والتاريخ الحديث', url: '/resources.html#history-resumes', icon: 'fas fa-landmark', specialty: null, keywords: ['الثورة الجزائرية', 'جزائر', 'الاستعمار', 'تاريخ الجزائر', 'التاريخ', 'حركات التحرر'] },
        { title: 'الجغرافيا — ملخصات', desc: 'ملخصات الجغرافيا والخرائط', url: '/resources.html#geo-resumes', icon: 'fas fa-globe-africa', specialty: null, keywords: ['الجغرافيا', 'جغرافيا', 'خرائط', 'خريطة'] },

        // ── ISLAMICS ───────────────────────────────────────────────────────
        { title: 'العلوم الإسلامية', desc: 'العقيدة، الشريعة والفقه الإسلامي', url: '/resources.html#Islamics', icon: 'fas fa-mosque', specialty: null, keywords: ['العلوم الإسلامية', 'الشريعة', 'الإسلامية', 'الفقه', 'العقيدة', 'الميراث', 'الربا', 'شريعة', 'إسلاميات'] },

        // ── TAMAZIGHT ──────────────────────────────────────────────────────
        { title: 'اللغة الأمازيغية', desc: 'دروس وملخصات الأمازيغية', url: '/resources.html#Tamazight', icon: 'fas fa-mountain', specialty: null, keywords: ['الأمازيغية', 'أمازيغ', 'تمازيغت', 'tamazight', 'Tamazight', 'أمازيغية'] },

        // ── FOREIGN LANGUAGES (شعبة لغات) ─────────────────────────────────
        { title: 'اللغة الألمانية', desc: 'قواعد، مصطلحات وكتب الألمانية', url: '/resources.html#german-main', icon: 'fas fa-globe-europe', specialty: 'لغات أجنبية', keywords: ['الألمانية', 'ألماني', 'Deutsch', 'German', 'ألمانية', 'allemand'] },
        { title: 'اللغة الإسبانية', desc: 'قواعد، مصطلحات وكتب الإسبانية', url: '/resources.html#spanish-main', icon: 'fas fa-globe-europe', specialty: 'لغات أجنبية', keywords: ['الإسبانية', 'إسباني', 'Español', 'Spanish', 'إسبانية', 'espagnol'] },
        { title: 'اللغة الإيطالية', desc: 'قواعد، مصطلحات وكتب الإيطالية', url: '/resources.html#italian-main', icon: 'fas fa-globe-europe', specialty: 'لغات أجنبية', keywords: ['الإيطالية', 'إيطالي', 'Italiano', 'Italian', 'إيطالية', 'italien'] },

        // ── SPECIALTY OVERVIEWS ────────────────────────────────────────────
        { title: 'شعبة آداب وفلسفة', desc: 'جميع مواد وموارد شعبة الآداب وفلسفة', url: '/resources.html#literature', icon: 'fas fa-pen-nib', specialty: 'آداب وفلسفة', keywords: ['آداب', 'فلسفة', 'أدب', 'شعبة آداب', 'أدب وفلسفة'] },
        { title: 'شعبة لغات أجنبية', desc: 'جميع مواد وموارد شعبة اللغات الأجنبية', url: '/resources.html#languages', icon: 'fas fa-comments', specialty: 'لغات أجنبية', keywords: ['لغات', 'لغات أجنبية', 'شعبة لغات', 'اللغات'] },

        // ── DRIVES & TOOLS ─────────────────────────────────────────────────
        { title: 'درايفات المتفوقين', desc: 'ملفات مشتركة من أوائل البكالوريا', url: '/resources.html#Drives', icon: 'fab fa-google-drive', specialty: null, keywords: ['درايف', 'Google Drive', 'المتفوقين', 'إسلام', 'لين', 'سارة', 'حكيم', 'Islam', 'Leen', 'Sara', 'Hakime'] },
    ];

    const toggleSearch = (show) => {
        searchOverlay.classList.toggle('active', show);
        document.body.classList.toggle('search-active', show);
        document.body.style.overflow = show ? 'hidden' : '';
        if (show) {
            setTimeout(() => searchInput.focus(), 300);
        } else {
            searchInput.value = '';
            searchResults.innerHTML = '<div class="search-placeholder"><i class="fas fa-keyboard"></i><p>ابدأ الكتابة للبحث في المنصة</p></div>';
            clearSearch.classList.remove('visible');
        }
    };

    if (searchBtnMobile) searchBtnMobile.addEventListener('click', () => toggleSearch(true));
    if (searchBtnDesktop) searchBtnDesktop.addEventListener('click', () => toggleSearch(true));
    if (closeSearch) closeSearch.addEventListener('click', () => toggleSearch(false));
    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) toggleSearch(false);
        });
    }

    const normalizeSearch = (text) => {
        if (!text) return "";
        return text.toString().toLowerCase()
            .replace(/[أإآ]/g, "ا")
            .replace(/ة/g, "ه")
            .replace(/ى/g, "ي")
            .replace(/^(ال)/, "") // Remove leading "Al"
            .trim();
    };

    searchInput.addEventListener('input', (e) => {
        const queryRaw = e.target.value.trim();
        const query = normalizeSearch(queryRaw);
        clearSearch.classList.toggle('visible', queryRaw.length > 0);

        if (queryRaw.length < 1) {
            searchResults.innerHTML = '<div class="search-placeholder"><i class="fas fa-keyboard"></i><p>ابدأ الكتابة للبحث في المنصة</p></div>';
            return;
        }

        const queryWords = query.split(/\s+/).filter(w => w.length > 0);

        // Score-based ranking: exact title match > keyword exact > partial
        const scored = navSearchData.map(item => {
            const itemTitle = normalizeSearch(item.title);
            const itemDesc = normalizeSearch(item.desc);
            const itemKeywords = (item.keywords || []).map(kw => normalizeSearch(kw));

            let score = 0;
            let allWordsMatched = true;

            for (const word of queryWords) {
                let wordMatched = false;

                // Title / desc match (highest weight)
                if (itemTitle.includes(word)) { score += 12; wordMatched = true; }
                else if (itemDesc.includes(word)) { score += 5; wordMatched = true; }

                // Keyword match
                for (const kw of itemKeywords) {
                    if (!kw) continue;
                    if (kw === word) { score += 10; wordMatched = true; }
                    else if (kw.includes(word)) { score += 6; wordMatched = true; }
                    else if (word.includes(kw) && kw.length > 2) { score += 3; wordMatched = true; }
                }

                // Specialty label match (helps "آداب" show آداب-specialty entries)
                if (item.specialty) {
                    const sp = normalizeSearch(item.specialty);
                    if (sp.includes(word) || word.includes(sp)) { score += 4; wordMatched = true; }
                }

                if (!wordMatched) { allWordsMatched = false; break; }
            }

            return { item, score, matched: allWordsMatched };
        })
            .filter(x => x.matched && x.score > 0)
            .sort((a, b) => b.score - a.score);

        const topResults = scored.slice(0, 8).map(x => x.item);

        if (topResults.length === 0) {
            searchResults.innerHTML = '<div class="search-placeholder"><i class="fas fa-search"></i><p>لم يتم العثور على نتائج</p></div>';
        } else {
            searchResults.innerHTML = topResults.map(item => `
                <a href="${item.url}" class="search-result-item" onclick="document.getElementById('searchOverlay').classList.remove('active'); document.body.classList.remove('search-active'); document.body.style.overflow='';">
                    <i class="${item.icon}"></i>
                    <div class="result-info">
                        <h4>${item.title}${item.specialty ? `<span class="result-specialty-badge">${item.specialty}</span>` : ''}</h4>
                        <p>${item.desc}</p>
                    </div>
                </a>
            `).join('');
        }
    });

    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        clearSearch.classList.remove('visible');
        searchResults.innerHTML = '<div class="search-placeholder"><i class="fas fa-keyboard"></i><p>ابدأ الكتابة للبحث في المنصة</p></div>';
    });
}

// ─── AD STRIP INJECTION ──────────────────────────────────────────────────────
function injectAdStrip() {
    if (typeof window.BAC_ADS === 'undefined') return;
    if (BAC_ADS.isStripDismissed()) return;

    const ads = BAC_ADS.getActiveStripAds();
    if (!ads.length) return;

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
            <span class="ad-strip-countdown">${BAC_ADS.getCountdownText()}</span>
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

    const cards = BAC_ADS.getActiveRotatingCards ? BAC_ADS.getActiveRotatingCards() : [];
    if (!cards.length) return;

    const placeholders = document.querySelectorAll('.ad-card-inject');
    if (!placeholders.length) return;

    let currentIdx = 0;

    function buildCardHTML(card) {
        const specialtyHTML = card.specialty
            ? `<span class="ad-card-specialty">${card.specialty}</span>` : '';
        return `
            <div class="ad-card-wrap">
                <div class="ad-card">
                    <span class="ad-card-sponsor">${card.sponsorLabel || 'محتوى مدعوم'}</span>
                    <div class="ad-card-avatar" style="background:${card.avatarColor || '#2c5cc5'};box-shadow:0 8px 24px ${card.avatarColor || '#2c5cc5'}99, 0 2px 8px ${card.avatarColor || '#2c5cc5'}55;">
                        <i class="${card.avatarIcon || 'fas fa-star'}"></i>
                    </div>
                    <div class="ad-card-body">
                        <p class="ad-card-name">${card.name}</p>
                        <div class="ad-card-meta">
                            ${card.subject ? `<span class="ad-card-subject">${card.subject}</span>` : ''}
                            ${specialtyHTML}
                        </div>
                        <p class="ad-card-pitch">${card.pitch}</p>
                    </div>
                    <a href="${card.ctaHref}" target="${card.ctaTarget || '_self'}" class="ad-card-cta">
                        ${card.ctaText} <i class="fas fa-arrow-left"></i>
                    </a>
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

    // Show premium one-time Islamic welcome modal (800ms after loader)
    setTimeout(showTelegramWelcomeModal, 800);

    // Register Service Worker for PWA / Shortcut functionality
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => {
                    console.log('Service Worker registered');
                    // Check for updates periodically
                    reg.update();
                })
                .catch(err => console.warn('SW failed', err));
        });

        // Detect when a new service worker takes over and reload automatically
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    }
});
