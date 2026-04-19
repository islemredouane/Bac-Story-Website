/**
 * shared.js — Runs on every page of Bac Story Website
 * Handles: component injection, loader, navbar, mobile menu, dropdowns, section nav
 */

// ─── PAGE LOADER ─────────────────────────────────────────────────────────────
(function injectLoader() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-logo">BAC STORY</div>
            <div class="loader-tagline">منصة التميز في البكالوريا</div>
            <div class="loader-dots">
                <span></span><span></span><span></span>
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
    loader.classList.add('loader-hiding');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    // Fallback in case transition doesn't fire
    setTimeout(() => { if (loader.parentNode) loader.remove(); }, 600);
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

// ─── WITHIN-PAGE SECTION NAVIGATION ─────────────────────────────────────────
// showSection is defined in script.js, but for pages that don't need it,
// this is a no-op fallback.
if (typeof window.showSection === 'undefined') {
    window.showSection = function (id) {
        document.querySelectorAll('.resource-content').forEach(s => s.classList.remove('active'));
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    };
}

// ─── ANNOUNCEMENT MODAL — ALL SPECIALTIES ────────────────────────────────────
// Key is versioned: change the suffix (v2, v3…) to re-trigger for future updates
const ANNOUNCE_KEY = 'bs_allspec_v1';

function showAnnouncementModal() {
    // Already seen? Skip.
    if (localStorage.getItem(ANNOUNCE_KEY)) return;

    const overlay = document.createElement('div');
    overlay.id = 'announce-modal';
    overlay.className = 'announce-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'announce-title');

    overlay.innerHTML = `
        <div class="announce-card">

            <!-- Header -->
            <div class="announce-header">
                <button class="announce-close" id="announceClose" aria-label="إغلاق">
                    <i class="fas fa-times"></i>
                </button>
                <span class="announce-emoji">🎉</span>
                <h2 class="announce-title" id="announce-title">
                    منصة <span>BAC STORY</span> الآن لجميع الشعب!
                </h2>
                <p class="announce-subtitle">انضمت شعبتان جديدتان إلى عائلة التميز</p>
            </div>

            <!-- Body -->
            <div class="announce-body">
                <p class="announce-desc">
                    أصبحت منصتنا تخدم <strong>جميع شعب البكالوريا الجزائرية</strong> — ملخصات، تمارين، مواضيع وأدوات لكل طالب، مهما كانت شعبته.
                </p>

                <div class="announce-specs">
                    <div class="announce-spec-chip">
                        <i class="fas fa-calculator"></i>
                        <span>رياضيات</span>
                    </div>
                    <div class="announce-spec-chip">
                        <i class="fas fa-flask"></i>
                        <span>علوم تجريبية</span>
                    </div>
                    <div class="announce-spec-chip">
                        <i class="fas fa-microchip"></i>
                        <span>تقني رياضي</span>
                    </div>
                    <div class="announce-spec-chip">
                        <i class="fas fa-chart-line"></i>
                        <span>تسيير واقتصاد</span>
                    </div>
                    <div class="announce-spec-chip is-new">
                        <span class="announce-new-badge">جديد ✦</span>
                        <i class="fas fa-pen-nib"></i>
                        <span>آداب وفلسفة</span>
                    </div>
                    <div class="announce-spec-chip is-new">
                        <span class="announce-new-badge">جديد ✦</span>
                        <i class="fas fa-globe"></i>
                        <span>لغات أجنبية</span>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="announce-footer">
                <a href="/#specialties" class="announce-cta-primary" id="announceExplore">
                    <i class="fas fa-arrow-left"></i>
                    استكشف الشعب الجديدة
                </a>
                <button class="announce-cta-secondary" id="announceDismiss">
                    ربما لاحقاً
                </button>
            </div>

        </div>`;

    document.body.appendChild(overlay);

    // Mark as seen immediately (so refresh doesn't show it again)
    localStorage.setItem(ANNOUNCE_KEY, '1');

    // Trigger entrance animation after paint
    requestAnimationFrame(() => {
        requestAnimationFrame(() => overlay.classList.add('is-visible'));
    });

    // Close helpers
    const close = () => {
        overlay.classList.remove('is-visible');
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
        setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 500);
    };

    document.getElementById('announceClose').addEventListener('click', close);
    document.getElementById('announceDismiss').addEventListener('click', close);

    // Close on CTA click (navigates away anyway)
    document.getElementById('announceExplore').addEventListener('click', close);

    // Close on backdrop click
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    // Close on ESC
    const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
    document.addEventListener('keydown', escHandler);
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
        { title: 'الرياضيات',            desc: 'ملخصات، تمارين ومواضيع في الرياضيات',             url: '/resources.html#math',       icon: 'fas fa-calculator',      specialty: null,             keywords: ['رياضيات', 'math', 'حساب', 'ملخصات الرياضيات'] },
        { title: 'العلوم الفيزيائية',    desc: 'ميكانيك، كهرباء، كيمياء وتحولات نووية',           url: '/resources.html#phys',       icon: 'fas fa-atom',            specialty: null,             keywords: ['فيزياء', 'فيزيائية', 'physics', 'ملخصات الفيزياء'] },
        { title: 'العلوم الطبيعية',      desc: 'بيولوجيا، البروتين، المناعة والاتصال العصبي',     url: '/resources.html#science',    icon: 'fas fa-flask',           specialty: null,             keywords: ['علوم طبيعية', 'بيولوجيا', 'علوم الحياة', 'ملخصات العلوم'] },
        { title: 'مواد التكنولوجيا',     desc: 'هندسة مدنية، كهربائية، ميكانيكية وطرائق',         url: '/resources.html#tech',       icon: 'fas fa-microchip',       specialty: null,             keywords: ['تكنولوجيا', 'تقني', 'هندسة'] },
        { title: 'تسيير واقتصاد',        desc: 'محاسبة، قانون، اقتصاد ومناجمنت',                 url: '/resources.html#management', icon: 'fas fa-chart-line',      specialty: null,             keywords: ['تسيير', 'اقتصاد', 'management'] },
        { title: 'مواضيع البكالوريا',    desc: 'مواضيع رسمية 2025 و2024 مع التصحيح',             url: '/bac-topics.html',           icon: 'fas fa-file-alt',        specialty: null,             keywords: ['مواضيع', 'بكالوريا', 'BAC', 'تصحيح', 'موضوع', 'اختبار رسمي', 'بكالوريات'] },
        { title: 'دليل الجامعة 2025',    desc: 'تخصصات، معدلات القبول والتوجيه الجامعي',          url: '/university.html',           icon: 'fas fa-university',      specialty: null,             keywords: ['جامعة', 'LMD', 'توجيه', 'معدل القبول', 'تخصص', 'ESTIN', 'ENSIA', 'Polytech', 'طب', 'مهندس', 'صيدلة', 'شبه طبي', 'ذكاء اصطناعي', 'أمن سيبراني', 'Medicine'] },
        { title: 'الأدوات وخطط التميز',  desc: 'حاسبة المعدل، توقيت الباك وخطط الدراسة',          url: '/tools.html',                icon: 'fas fa-tools',           specialty: null,             keywords: ['أدوات', 'خطط', 'حاسبة', 'معدل', 'توقيت', 'تحديات', 'تميز', 'خطة', 'عقبة بن نافع'] },

        // ── MATH — SPECIALTY SECTIONS ──────────────────────────────────────
        { title: 'الرياضيات', desc: 'دروس، ملخصات وتمارين',  url: '/resources.html#math-matheleme', icon: 'fas fa-calculator', specialty: 'رياضيات',        keywords: ['رياضيات', 'ملخصات', 'دروس', 'تمارين'] },
        { title: 'الرياضيات', desc: 'دروس، ملخصات وتمارين',  url: '/resources.html#math-sci',       icon: 'fas fa-calculator', specialty: 'علوم تجريبية',   keywords: ['رياضيات', 'ملخصات', 'دروس', 'تمارين'] },
        { title: 'الرياضيات', desc: 'دروس، ملخصات وتمارين',  url: '/resources.html#math-tech',      icon: 'fas fa-calculator', specialty: 'تقني رياضي',     keywords: ['رياضيات', 'ملخصات', 'دروس', 'تمارين'] },
        { title: 'الرياضيات', desc: 'دروس، ملخصات وتمارين',  url: '/resources.html#ge-math',        icon: 'fas fa-calculator', specialty: 'تسيير واقتصاد',  keywords: ['رياضيات', 'ملخصات', 'دروس', 'تمارين'] },
        { title: 'الرياضيات', desc: 'الرياضيات المختزلة',      url: '/resources.html#math-lit-lang',  icon: 'fas fa-calculator', specialty: 'آداب · لغات',    keywords: ['رياضيات', 'ملخصات', 'دروس'] },

        // ── MATH — GRANULAR TOPICS ─────────────────────────────────────────
        { title: 'الدوال العددية',        desc: 'حدود، اشتقاق ودراسة دالة',                  url: '/resources.html#dawal',                   icon: 'fas fa-wave-square',     specialty: 'علوم · تقني · رياضيات', keywords: ['الدوال', 'دالة', 'اشتقاق', 'حدود', 'نهايات', 'دراسة دالة', 'تمثيل بياني'] },
        { title: 'الدوال العددية',        desc: 'الدوال — آداب ولغات',                       url: '/resources.html#dawal-lit-lang',          icon: 'fas fa-wave-square',     specialty: 'آداب · لغات',           keywords: ['الدوال', 'دالة', 'اشتقاق', 'حدود'] },
        { title: 'الدوال اللوغاريتمية',  desc: 'الدالة اللوغاريتمية وتطبيقاتها',            url: '/resources.html#ge-math-log-functions',   icon: 'fas fa-wave-square',     specialty: 'تسيير واقتصاد',         keywords: ['لوغاريتم', 'لوغاريتمية', 'ln', 'log', 'الدوال'] },
        { title: 'الدوال الأسية',         desc: 'الدالة الأسية والتطبيقات',                  url: '/resources.html#ge-math-exp-functions',   icon: 'fas fa-wave-square',     specialty: 'تسيير واقتصاد',         keywords: ['دوال أسية', 'الأسية', 'exp', 'الدوال'] },
        { title: 'الدوال الأصلية',        desc: 'حساب التكامل والدوال الأصلية',              url: '/resources.html#ge-math-primitive-functions', icon: 'fas fa-wave-square', specialty: 'تسيير واقتصاد',         keywords: ['الدوال الأصلية', 'تكامل', 'أصلية', 'الدوال'] },
        { title: 'الدوال العددية',        desc: 'الدوال والمنحنيات — تسيير واقتصاد',         url: '/resources.html#ge-math-numeric-functions', icon: 'fas fa-wave-square', specialty: 'تسيير واقتصاد',         keywords: ['الدوال', 'دالة عددية', 'الدوال العددية'] },
        { title: 'المتتاليات العددية',    desc: 'متتاليات حسابية وهندسية',                   url: '/resources.html#sequences',               icon: 'fas fa-sort-numeric-up', specialty: 'علوم · تقني · رياضيات', keywords: ['المتتاليات', 'متتالية', 'حسابية', 'هندسية', 'متتاليات عددية'] },
        { title: 'المتتاليات العددية',    desc: 'المتتاليات — آداب ولغات',                   url: '/resources.html#sequences-lit-lang',      icon: 'fas fa-sort-numeric-up', specialty: 'آداب · لغات',           keywords: ['المتتاليات', 'متتالية', 'حسابية', 'هندسية'] },
        { title: 'المتتاليات',            desc: 'مسائل المتتاليات — تسيير واقتصاد',          url: '/resources.html#ge-math-sequences',       icon: 'fas fa-sort-numeric-up', specialty: 'تسيير واقتصاد',         keywords: ['المتتاليات', 'متتالية'] },
        { title: 'الجبر والأعداد',        desc: 'القسمة في Z، المنطق والمعادلات',            url: '/resources.html#algebra',                 icon: 'fas fa-superscript',     specialty: 'علوم · تقني · رياضيات', keywords: ['الجبر', 'الأعداد', 'القسمة', 'PGCD', 'PPCM', 'منطق', 'جبر'] },
        { title: 'الجبر والأعداد',        desc: 'الجبر المختزل — آداب ولغات',               url: '/resources.html#algebra-lit-lang',        icon: 'fas fa-superscript',     specialty: 'آداب · لغات',           keywords: ['الجبر', 'الأعداد'] },
        { title: 'الاحتمالات',            desc: 'شرطية، برنولي وباواسون',                    url: '/resources.html#proba',                   icon: 'fas fa-dice',            specialty: 'علوم · تقني · رياضيات', keywords: ['الاحتمالات', 'احتمال', 'برنولي', 'باواسون', 'احتمالات شرطية'] },
        { title: 'الاحتمالات',            desc: 'الاحتمالات — آداب ولغات',                   url: '/resources.html#proba-lit-lang',          icon: 'fas fa-dice',            specialty: 'آداب · لغات',           keywords: ['الاحتمالات', 'احتمال'] },
        { title: 'الاحتمالات',            desc: 'الاحتمالات — تسيير واقتصاد',               url: '/resources.html#ge-math-probability',     icon: 'fas fa-dice',            specialty: 'تسيير واقتصاد',         keywords: ['الاحتمالات', 'احتمال'] },
        { title: 'الإحصاء',               desc: 'الإحصاء الوصفي والتحليلي',                  url: '/resources.html#ge-math-statistics',      icon: 'fas fa-chart-bar',       specialty: 'تسيير واقتصاد',         keywords: ['الإحصاء', 'إحصاء', 'إحصائيات', 'statistics'] },
        { title: 'الأعداد المركبة',       desc: 'الأشكال الثلاثية، هرميتي وتطبيقات',         url: '/resources.html#complex',                 icon: 'fas fa-infinity',        specialty: 'علوم · تقني · رياضيات', keywords: ['الأعداد المركبة', 'مركبة', 'أعداد مركبة', 'هرميتي', 'مركب'] },
        { title: 'المعادلات التفاضلية',   desc: 'تمارين وملخصات المعادلات التفاضلية',         url: '/resources.html#math-matheleme',          icon: 'fas fa-equals',          specialty: 'رياضيات',               keywords: ['المعادلات التفاضلية', 'تفاضلية'] },
        { title: 'مجلات الخليل',          desc: 'أفكار الوحدة وتمارين مجلة الخليل',          url: '/resources.html#El-khalil-magazines',     icon: 'fas fa-book-open',       specialty: null,                    keywords: ['الخليل', 'مجلات الخليل', 'أفكار الوحدة'] },
        { title: 'المكتسبات القبلية',     desc: 'مراجعة الأساسيات — رياضيات',               url: '/resources.html#moktasabat-math',         icon: 'fas fa-star',            specialty: 'رياضيات',               keywords: ['المكتسبات القبلية', 'مراجعة', 'أساسيات رياضيات'] },

        // ── PHYSICS — SPECIALTY SECTIONS ──────────────────────────────────
        { title: 'العلوم الفيزيائية', desc: 'ميكانيك، كهرباء وكيمياء', url: '/resources.html#phys-matheleme-tech', icon: 'fas fa-atom', specialty: 'رياضيات · تقني',  keywords: ['فيزياء', 'فيزيائية', 'ملخصات', 'تمارين'] },
        { title: 'العلوم الفيزيائية', desc: 'ميكانيك، كهرباء وكيمياء', url: '/resources.html#phys-sci',           icon: 'fas fa-atom', specialty: 'علوم تجريبية',    keywords: ['فيزياء', 'فيزيائية', 'ملخصات', 'تمارين'] },

        // ── PHYSICS — GRANULAR TOPICS ──────────────────────────────────────
        { title: 'المتابعة الزمنية للحركات', desc: 'حركة الأجسام، تركيبات السرعات والقذيفة', url: '/resources.html#motaba3a',       icon: 'fas fa-clock',       specialty: null, keywords: ['المتابعة', 'الزمنية', 'حركة', 'سرعة', 'السقوط', 'القذيفة', 'متابعة زمنية'] },
        { title: 'الميكانيك',               desc: 'القوى، الديناميكا والمستوى المائل',        url: '/resources.html#mechanics',     icon: 'fas fa-cogs',        specialty: null, keywords: ['الميكانيك', 'ميكانيك', 'القوى', 'الديناميكا', 'الأقمار', 'الجاذبية', 'مستوى مائل'] },
        { title: 'الكهرباء',                desc: 'الدوائر الكهربائية RLC، RC، RL',           url: '/resources.html#electricity',   icon: 'fas fa-bolt',        specialty: null, keywords: ['الكهرباء', 'كهربائية', 'RLC', 'RC', 'RL', 'تذبذبات', 'كهرباء'] },
        { title: 'الأحماض والأسس',          desc: 'المعايرة، pH والأحماض الضعيفة والقوية',    url: '/resources.html#acides',        icon: 'fas fa-vial',        specialty: null, keywords: ['الأحماض', 'الأسس', 'معايرة', 'ph', 'كيمياء', 'أحماض', 'أسس'] },
        { title: 'التحولات النووية',        desc: 'الانشطار، الاندماج والنشاط الإشعاعي',      url: '/resources.html#nawawi',        icon: 'fas fa-radiation',   specialty: null, keywords: ['النووي', 'التحولات النووية', 'انشطار', 'اندماج', 'إشعاعي', 'نووي', 'تحولات نووية'] },
        { title: 'الأعمدة الكهربائية',      desc: 'مصادر الطاقة، القوة الدافعة وبطاريات',     url: '/resources.html#a3mida',        icon: 'fas fa-battery-half',specialty: null, keywords: ['الأعمدة', 'الكهربائية', 'بطاريات', 'قوة دافعة', 'أعمدة كهربائية'] },
        { title: 'الأسترة والكيمياء العضوية', desc: 'الأسترة، الصابنة والتوازن الكيميائي',   url: '/resources.html#astara',        icon: 'fas fa-flask',       specialty: null, keywords: ['الأسترة', 'صابنة', 'تحولات كيميائية', 'توازن', 'أستر', 'أسترة'] },
        { title: 'الأسئلة النظرية والمنحنيات', desc: 'مقالات نظرية وقراءة المنحنيات',        url: '/resources.html#theoric',       icon: 'fas fa-chart-line',  specialty: null, keywords: ['نظرية', 'مقالات نظرية', 'منحنيات', 'رسوم بيانية', 'نظري'] },
        { title: 'المكتسبات القبلية',        desc: 'مراجعة الأساسيات — فيزياء',               url: '/resources.html#moktasabat-phys', icon: 'fas fa-star',      specialty: 'فيزياء',        keywords: ['المكتسبات القبلية', 'مراجعة', 'أساسيات فيزياء'] },

        // ── SCIENCE — SPECIALTY SECTIONS ──────────────────────────────────
        { title: 'العلوم الطبيعية', desc: 'بيولوجيا وعلوم الحياة', url: '/resources.html#sci-sci',      icon: 'fas fa-dna', specialty: 'علوم تجريبية', keywords: ['علوم طبيعية', 'بيولوجيا', 'علوم الحياة', 'ملخصات', 'تمارين'] },
        { title: 'العلوم الطبيعية', desc: 'بيولوجيا وعلوم الحياة', url: '/resources.html#sci-matheleme', icon: 'fas fa-dna', specialty: 'رياضيات',       keywords: ['علوم طبيعية', 'بيولوجيا', 'علوم الحياة', 'ملخصات', 'تمارين'] },

        // ── SCIENCE — GRANULAR TOPICS ──────────────────────────────────────
        { title: 'تركيب البروتين',              desc: 'الشيفرة الجينية، النسخ والترجمة',          url: '/resources.html#tarkib-protein',   icon: 'fas fa-dna',        specialty: null, keywords: ['تركيب البروتين', 'البروتين', 'الشيفرة الجينية', 'النسخ', 'الترجمة', 'البروتين'] },
        { title: 'بنية ووظيفة البروتين',        desc: 'العلاقة بين التركيب والوظيفة',             url: '/resources.html#3alaqa-protein',   icon: 'fas fa-dna',        specialty: null, keywords: ['بنية البروتين', 'وظيفة البروتين', 'العلاقة بين بنية ووظيفة', 'البروتين'] },
        { title: 'الإنزيمات',                   desc: 'نشاط الإنزيمات وعوامل التأثير',            url: '/resources.html#inzimat',          icon: 'fas fa-flask',      specialty: null, keywords: ['الإنزيمات', 'إنزيم', 'إنزيمات', 'نشاط إنزيمي'] },
        { title: 'المناعة',                      desc: 'المناعة الخلطية والخلوية، اللقاح والمصل',  url: '/resources.html#mana3a',           icon: 'fas fa-shield-alt', specialty: null, keywords: ['المناعة', 'مناعة', 'مناعي', 'اللقاح', 'المصل', 'خلوية', 'خلطية', 'مناعية'] },
        { title: 'الاتصال العصبي',              desc: 'السيالة العصبية والتشابك العصبي',           url: '/resources.html#itisal',           icon: 'fas fa-brain',      specialty: null, keywords: ['الاتصال العصبي', 'العصبي', 'السيالة', 'تشابك', 'عصبي'] },
        { title: 'التركيب الضوئي',              desc: 'تحويل الطاقة الضوئية وعوامل التأثير',       url: '/resources.html#tarkib',           icon: 'fas fa-seedling',   specialty: null, keywords: ['التركيب الضوئي', 'البناء الضوئي', 'الكلوروفيل', 'ضوئي', 'بناء ضوئي'] },
        { title: 'التنفس الخلوي',               desc: 'مراحل التنفس وتبادل الغازات',              url: '/resources.html#tanafos',          icon: 'fas fa-lungs',      specialty: null, keywords: ['التنفس', 'الخلوي', 'تنفس', 'أكسدة', 'تنفس خلوي'] },
        { title: 'المكتسبات القبلية',            desc: 'مراجعة الأساسيات — علوم طبيعية',          url: '/resources.html#moktasabat-sci',   icon: 'fas fa-star',       specialty: 'علوم طبيعية',  keywords: ['المكتسبات القبلية', 'مراجعة', 'أساسيات علوم'] },

        // ── TECHNOLOGY TYPES ───────────────────────────────────────────────
        { title: 'الهندسة المدنية',    desc: 'مقاومة المواد، التربة والمنشآت',          url: '/resources.html#techno-civile',      icon: 'fas fa-hard-hat', specialty: 'تقني رياضي', keywords: ['الهندسة المدنية', 'مدني', 'مقاومة المواد', 'التربة', 'خرسانة', 'هندسة مدنية'] },
        { title: 'الهندسة الكهربائية', desc: 'الأنظمة الكهربائية والإلكترونية',         url: '/resources.html#techno-electricity', icon: 'fas fa-plug',     specialty: 'تقني رياضي', keywords: ['الهندسة الكهربائية', 'كهربائية', 'إلكترونية', 'دوائر', 'هندسة كهربائية'] },
        { title: 'الهندسة الميكانيكية',desc: 'الأنظمة الميكانيكية وتحليل الحركات',     url: '/resources.html#techno-mech',        icon: 'fas fa-cog',      specialty: 'تقني رياضي', keywords: ['الهندسة الميكانيكية', 'ميكانيكية', 'الأنظمة', 'هندسة ميكانيكية'] },
        { title: 'هندسة الطرائق',      desc: 'تصميم الطرق والمشاريع الإنشائية',        url: '/resources.html#techno-road',        icon: 'fas fa-road',     specialty: 'تقني رياضي', keywords: ['هندسة الطرائق', 'طرائق', 'الطرق', 'إنشائية'] },

        // ── MANAGEMENT TOPICS ──────────────────────────────────────────────
        { title: 'المحاسبة التحليلية والمالية', desc: 'التكاليف، التحليل المالي والتسيير المحاسبي', url: '/resources.html#accounting', icon: 'fas fa-calculator',  specialty: 'تسيير واقتصاد', keywords: ['المحاسبة', 'محاسبة', 'التحليل المالي', 'تكاليف', 'ميزانية', 'محاسبة تحليلية'] },
        { title: 'القانون والاقتصاد',           desc: 'القانون التجاري والمبادئ الاقتصادية',      url: '/resources.html#ge-law',      icon: 'fas fa-gavel',       specialty: 'تسيير واقتصاد', keywords: ['القانون', 'قانون', 'تجاري', 'عقود', 'اقتصاد وقانون'] },
        { title: 'الاقتصاد والمناجمنت',         desc: 'تسيير المؤسسة، التسويق والاستراتيجية',    url: '/resources.html#ge-economics', icon: 'fas fa-chart-line',  specialty: 'تسيير واقتصاد', keywords: ['الاقتصاد', 'المناجمنت', 'management', 'تسويق', 'المؤسسة', 'اقتصاد ومناجمنت'] },

        // ── ARABIC — SPECIALTY SECTIONS ───────────────────────────────────
        { title: 'اللغة العربية', desc: 'الشعر، النثر، القواعد والبلاغة',         url: '/resources.html#arabic',      icon: 'fas fa-book', specialty: null,             keywords: ['العربية', 'اللغة العربية', 'عربي', 'arabic', 'عربية'] },
        { title: 'اللغة العربية', desc: 'الأدب العربي الكلاسيكي والحديث',         url: '/resources.html#lit-arabic',  icon: 'fas fa-book', specialty: 'آداب وفلسفة',   keywords: ['العربية', 'اللغة العربية', 'عربي', 'أدب عربي'] },
        { title: 'اللغة العربية', desc: 'القواعد، المصطلحات والنصوص',             url: '/resources.html#lang-arabic', icon: 'fas fa-book', specialty: 'لغات أجنبية',   keywords: ['العربية', 'اللغة العربية', 'عربي'] },

        // ── ARABIC — GRANULAR TOPICS ───────────────────────────────────────
        { title: 'الشعر التعليمي',         desc: 'قصائد الشعر التعليمي وتحليلها',           url: '/resources.html#chi3r-ta3limi',  icon: 'fas fa-feather-alt', specialty: null, keywords: ['شعر تعليمي', 'الشعر التعليمي', 'شعر', 'قصيدة', 'تعليمي'] },
        { title: 'الشعر المهجري',          desc: 'أدب المهجر وأبرز شعرائه',                 url: '/resources.html#chi3r-mihjari',  icon: 'fas fa-feather-alt', specialty: null, keywords: ['شعر مهجري', 'المهجري', 'المهجر', 'شعر'] },
        { title: 'الشعر السياسي',          desc: 'الشعر في خدمة القضايا السياسية',          url: '/resources.html#chi3r-siyasi',   icon: 'fas fa-feather-alt', specialty: null, keywords: ['شعر سياسي', 'السياسي', 'شعر'] },
        { title: 'الشعر الاجتماعي',        desc: 'القضايا الاجتماعية في الشعر العربي',       url: '/resources.html#chi3r-ijtima3y', icon: 'fas fa-feather-alt', specialty: null, keywords: ['شعر اجتماعي', 'الاجتماعي', 'شعر'] },
        { title: 'شعر الآداب',             desc: 'الشعر الكلاسيكي والحديث',                 url: '/resources.html#lit-chi3r',      icon: 'fas fa-feather-alt', specialty: 'آداب وفلسفة', keywords: ['شعر', 'الشعر', 'قصيدة', 'أدب'] },
        { title: 'نثر الآداب',             desc: 'النثر الأدبي والنصوص',                    url: '/resources.html#lit-nathr',      icon: 'fas fa-pen',         specialty: 'آداب وفلسفة', keywords: ['النثر', 'نثر', 'نصوص أدبية', 'أدب'] },
        { title: 'النشر العلمي المتأدب',   desc: 'النصوص العلمية الأدبية وتحليلها',          url: '/resources.html#nathr-3ilmi',    icon: 'fas fa-pen',         specialty: null, keywords: ['النشر العلمي', 'نشر علمي', 'نثر علمي', 'متأدب'] },
        { title: 'فن المقال',              desc: 'كتابة المقال الأدبي والنقدي',              url: '/resources.html#maqal',          icon: 'fas fa-pen-alt',     specialty: null, keywords: ['فن المقال', 'المقال', 'مقال', 'مقالة'] },
        { title: 'القواعد اللغوية',        desc: 'النحو والصرف والإعراب',                   url: '/resources.html#arabic-grammer', icon: 'fas fa-spell-check', specialty: null, keywords: ['القواعد', 'اللغوية', 'النحو', 'الصرف', 'الإعراب', 'قواعد'] },
        { title: 'البلاغة والصور البيانية',desc: 'الاستعارة، التشبيه والمجاز',              url: '/resources.html#arabic',         icon: 'fas fa-star',        specialty: null, keywords: ['البلاغة', 'الصور البيانية', 'بيانية', 'استعارة', 'تشبيه', 'مجاز', 'بلاغة'] },

        // ── FRENCH — SPECIALTY SECTIONS ───────────────────────────────────
        { title: 'اللغة الفرنسية', desc: 'النصوص، التعبير الكتابي والقواعد',     url: '/resources.html#french',      icon: 'fas fa-language', specialty: null,           keywords: ['الفرنسية', 'فرنسي', 'français', 'french', 'فرنسية'] },
        { title: 'اللغة الفرنسية', desc: 'الفرنسية الأدبية',                    url: '/resources.html#french-lit',  icon: 'fas fa-language', specialty: 'آداب وفلسفة', keywords: ['الفرنسية', 'فرنسي', 'français', 'فرنسية'] },
        { title: 'اللغة الفرنسية', desc: 'الفرنسية — شعبة لغات',               url: '/resources.html#french-lang', icon: 'fas fa-language', specialty: 'لغات أجنبية', keywords: ['الفرنسية', 'فرنسي', 'français', 'فرنسية'] },

        // ── ENGLISH — SPECIALTY SECTIONS ──────────────────────────────────
        { title: 'اللغة الإنجليزية', desc: 'نصوص، محادثة وقواعد الإنجليزية',   url: '/resources.html#english',      icon: 'fas fa-globe', specialty: null,           keywords: ['الإنجليزية', 'إنجليزي', 'English', 'إنجليزية', 'انجليزية', 'Grammer'] },
        { title: 'اللغة الإنجليزية', desc: 'الإنجليزية الأدبية',               url: '/resources.html#english-lit',  icon: 'fas fa-globe', specialty: 'آداب وفلسفة', keywords: ['الإنجليزية', 'إنجليزي', 'English', 'إنجليزية'] },
        { title: 'اللغة الإنجليزية', desc: 'الإنجليزية — شعبة لغات',           url: '/resources.html#english-lang', icon: 'fas fa-globe', specialty: 'لغات أجنبية', keywords: ['الإنجليزية', 'إنجليزي', 'English', 'إنجليزية'] },

        // ── PHILOSOPHY — SPECIALTY SECTIONS ───────────────────────────────
        { title: 'الفلسفة', desc: 'مقالات فلسفية، جدلية واستقصاء',         url: '/resources.html#philo',            icon: 'fas fa-lightbulb', specialty: null,           keywords: ['الفلسفة', 'فلسفة', 'مقالة فلسفية', 'جدلية', 'استقصاء', 'فلسفي'] },
        { title: 'الفلسفة', desc: 'الفلسفة الأدبية',                       url: '/resources.html#literature-philo', icon: 'fas fa-lightbulb', specialty: 'آداب وفلسفة', keywords: ['الفلسفة', 'فلسفة', 'مقالة فلسفية', 'جدلية', 'فلسفي'] },
        { title: 'الفلسفة', desc: 'الفلسفة — شعبة لغات',                  url: '/resources.html#languages-philo',  icon: 'fas fa-lightbulb', specialty: 'لغات أجنبية', keywords: ['الفلسفة', 'فلسفة', 'مقالة فلسفية', 'فلسفي'] },

        // ── HISTORY-GEO — SPECIALTY SECTIONS ──────────────────────────────
        { title: 'التاريخ والجغرافيا', desc: 'الثورة الجزائرية، الحرب الباردة وحركات التحرر', url: '/resources.html#Hist-geo',      icon: 'fas fa-map-marked-alt', specialty: null,            keywords: ['التاريخ', 'الجغرافيا', 'تاريخ', 'جغرافيا', 'الثورة الجزائرية', 'الحرب الباردة'] },
        { title: 'التاريخ والجغرافيا', desc: 'التاريخ والجغرافيا',                             url: '/resources.html#ge-histgeo',    icon: 'fas fa-map-marked-alt', specialty: 'تسيير واقتصاد', keywords: ['التاريخ', 'الجغرافيا', 'تاريخ', 'جغرافيا'] },
        { title: 'التاريخ والجغرافيا', desc: 'التاريخ والجغرافيا',                             url: '/resources.html#histgeo-lit',   icon: 'fas fa-map-marked-alt', specialty: 'آداب وفلسفة',  keywords: ['التاريخ', 'الجغرافيا', 'تاريخ', 'جغرافيا'] },
        { title: 'التاريخ والجغرافيا', desc: 'التاريخ والجغرافيا',                             url: '/resources.html#Hist-geo-lang', icon: 'fas fa-map-marked-alt', specialty: 'لغات أجنبية',  keywords: ['التاريخ', 'الجغرافيا', 'تاريخ', 'جغرافيا'] },
        { title: 'التاريخ — ملخصات',  desc: 'الثورة الجزائرية والتاريخ الحديث',               url: '/resources.html#history-resumes', icon: 'fas fa-landmark',      specialty: null,            keywords: ['الثورة الجزائرية', 'جزائر', 'الاستعمار', 'تاريخ الجزائر', 'التاريخ', 'حركات التحرر'] },
        { title: 'الجغرافيا — ملخصات', desc: 'ملخصات الجغرافيا والخرائط',                   url: '/resources.html#geo-resumes',     icon: 'fas fa-globe-africa',  specialty: null,            keywords: ['الجغرافيا', 'جغرافيا', 'خرائط', 'خريطة'] },

        // ── ISLAMICS ───────────────────────────────────────────────────────
        { title: 'العلوم الإسلامية', desc: 'العقيدة، الشريعة والفقه الإسلامي',    url: '/resources.html#Islamics',  icon: 'fas fa-mosque',  specialty: null, keywords: ['العلوم الإسلامية', 'الشريعة', 'الإسلامية', 'الفقه', 'العقيدة', 'الميراث', 'الربا', 'شريعة', 'إسلاميات'] },

        // ── TAMAZIGHT ──────────────────────────────────────────────────────
        { title: 'اللغة الأمازيغية',  desc: 'دروس وملخصات الأمازيغية',              url: '/resources.html#Tamazight', icon: 'fas fa-mountain', specialty: null, keywords: ['الأمازيغية', 'أمازيغ', 'تمازيغت', 'tamazight', 'Tamazight', 'أمازيغية'] },

        // ── FOREIGN LANGUAGES (شعبة لغات) ─────────────────────────────────
        { title: 'اللغة الألمانية',  desc: 'قواعد، مصطلحات وكتب الألمانية',  url: '/resources.html#german-main',  icon: 'fas fa-globe-europe', specialty: 'لغات أجنبية', keywords: ['الألمانية', 'ألماني', 'Deutsch', 'German', 'ألمانية', 'allemand'] },
        { title: 'اللغة الإسبانية', desc: 'قواعد، مصطلحات وكتب الإسبانية', url: '/resources.html#spanish-main', icon: 'fas fa-globe-europe', specialty: 'لغات أجنبية', keywords: ['الإسبانية', 'إسباني', 'Español', 'Spanish', 'إسبانية', 'espagnol'] },
        { title: 'اللغة الإيطالية', desc: 'قواعد، مصطلحات وكتب الإيطالية', url: '/resources.html#italian-main', icon: 'fas fa-globe-europe', specialty: 'لغات أجنبية', keywords: ['الإيطالية', 'إيطالي', 'Italiano', 'Italian', 'إيطالية', 'italien'] },

        // ── SPECIALTY OVERVIEWS ────────────────────────────────────────────
        { title: 'شعبة آداب وفلسفة',  desc: 'جميع مواد وموارد شعبة الآداب وفلسفة', url: '/resources.html#literature', icon: 'fas fa-pen-nib',  specialty: 'آداب وفلسفة', keywords: ['آداب', 'فلسفة', 'أدب', 'شعبة آداب', 'أدب وفلسفة'] },
        { title: 'شعبة لغات أجنبية',  desc: 'جميع مواد وموارد شعبة اللغات الأجنبية', url: '/resources.html#languages', icon: 'fas fa-comments',  specialty: 'لغات أجنبية', keywords: ['لغات', 'لغات أجنبية', 'شعبة لغات', 'اللغات'] },

        // ── DRIVES & TOOLS ─────────────────────────────────────────────────
        { title: 'درايفات المتفوقين',  desc: 'ملفات مشتركة من أوائل البكالوريا',    url: '/resources.html#Drives', icon: 'fab fa-google-drive', specialty: null, keywords: ['درايف', 'Google Drive', 'المتفوقين', 'إسلام', 'لين', 'سارة', 'حكيم', 'Islam', 'Leen', 'Sara', 'Hakime'] },
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
            const itemTitle    = normalizeSearch(item.title);
            const itemDesc     = normalizeSearch(item.desc);
            const itemKeywords = (item.keywords || []).map(kw => normalizeSearch(kw));

            let score = 0;
            let allWordsMatched = true;

            for (const word of queryWords) {
                let wordMatched = false;

                // Title / desc match (highest weight)
                if (itemTitle.includes(word))      { score += 12; wordMatched = true; }
                else if (itemDesc.includes(word))  { score +=  5; wordMatched = true; }

                // Keyword match
                for (const kw of itemKeywords) {
                    if (!kw) continue;
                    if (kw === word)                   { score += 10; wordMatched = true; }
                    else if (kw.includes(word))        { score +=  6; wordMatched = true; }
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

    // Handle hash-based section
    handleHashNav();

    // Fade in the content
    const pageContent = document.querySelector('main');
    if (pageContent) {
        pageContent.classList.add('fade-in');
    }
    document.body.classList.add('page-ready');

    // Hide loader
    hideLoader();

    // Show one-time announcement modal (800ms after loader — feels intentional, not jarring)
    setTimeout(showAnnouncementModal, 800);
});

