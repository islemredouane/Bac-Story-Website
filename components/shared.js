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
        if (!res.ok) return;
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
            // CSS mobile menu triggers at 900px, but padding changes up to 1024px
            // Let's ensure this works for mobile toggle
            if (window.innerWidth <= 1024) {
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

    const navSearchData = [
        {
            title: 'مادة الرياضيات',
            desc: 'الدوال، المتتاليات، الاحتمالات، الأعداد المركبة و الحساب',
            url: '/resources.html#math',
            icon: 'fas fa-calculator',
            keywords: [
                'الرياضيات', 'المكتسبات القبلية', 'الدوال', 'الدوال العددية', 'الدوال الأسية', 'الدوال اللوغاريتمية', 'الدوال الأصلية', 'المتتاليات', 'المتتاليات العددية', 'الإحصاء', 'الاحتمالات', 'الإحتمالات الشرطية', 'القسمة في Z', 'الجبر', 'الأعداد و الحساب', 'الأعداد المركبة', 'مجلات الخليل', 'أفكار الوحدة', 'المعادلات التفاضلية',
                'ملخصات الرياضيات', 'ملخصات المكتسبات القبلية', 'ملخصات الدوال', 'ملخصات المتتاليات', 'ملخصات الأعداد والحساب', 'ملخصات الاحتمالات', 'ملخصات الأعداد المركبة', 'نور الدين', 'الدوال من الألف للياء',
                'تمارين الدوال', 'تمارين المتتاليات', 'تمارين الاحتمالات', 'تمارين الأعداد والحساب', 'تمارين الأعداد المركبة', 'سلاسل تمارين الرياضيات', 'مواضيع الرياضيات', 'اختبارات الرياضيات', 'بكالوريا الرياضيات', 'مواضيع تحضيرية', 'مواضيع التميز', 'مواضيع أشبال الأمة'
            ]
        },
        {
            title: 'مادة العلوم الفيزيائية',
            desc: 'الميكانيك، الكهرباء، التجريبية و التحولات النووية',
            url: '/resources.html#phys',
            icon: 'fas fa-atom',
            keywords: [
                'العلوم الفيزيائية', 'الفيزياء', 'المكتسبات القبلية', 'المتابعة الزمنية', 'المعايرة', 'الميكانيك', 'تطور جملة ميكانيكية', 'السقوط', 'الأقمار', 'المستوي الأفقي', 'المستوي المائل', 'القذيفة', 'الكهرباء', 'الظواهر الكهربائية', 'Rc', 'Rl', 'الأحماض و الأسس', 'النووي', 'التحولات النووية', 'الأسترة', 'الأعمدة الكهربائية', 'الأسئلة النظرية', 'البروتوكولات التجريبية', 'القوانين والمنحنيات',
                'ملخصات الفيزياء', 'ملخص المتابعة الزمنية', 'ملخص الميكانيك', 'ملخص الكهرباء', 'ملخص الأحماض والأسس', 'ملخص التحولات النووية', 'ملخص الأسترة', 'تأشيرة النجاح', 'فرڨاني', 'كتاب المغني',
                'تمارين المتابعة الزمنية', 'تمارين الميكانيك', 'تمارين الكهرباء', 'تمارين الأحماض والأسس', 'تمارين التحولات النووية', 'تمارين الأسترة', 'مواضيع الفيزياء', 'إختبارات الفيزياء', 'بكالوريا الفيزياء', 'مواضيع التميز'
            ]
        },
        {
            title: 'مادة العلوم الطبيعية',
            desc: 'تركيب البروتين، الإنزيمات، المناعة و الاتصال العصبي',
            url: '/resources.html#science',
            icon: 'fas fa-flask',
            keywords: [
                'العلوم الطبيعية', 'العلوم', 'المكتسبات القبلية', 'تركيب البروتين', 'العلاقة بين بنية و وظيفة البروتين', 'الإنزيمات', 'المناعة', 'الإتصال العصبي', 'التركيب الضوئي', 'التنفس', 'النصوص العلمية', 'التجارب المقررة', 'منهجية الإجابة',
                'ملخصات العلوم', 'ملخص تركيب البروتين', 'ملخص الإنزيمات', 'ملخص المناعة', 'ملخص الاتصال العصبي', 'السلسلة الفضية', 'السلسلة الزرقاء',
                'تمارين تركيب البروتين', 'تمارين الإنزيمات', 'تمارين المناعة', 'تمارين الاتصال العصبي', 'تمارين التركيب الضوئي', 'مواضيع العلوم الطبيعية', 'إختبارات العلوم', 'بكالوريا العلوم', 'مواضيع أشبال الأمة'
            ]
        },
        {
            title: 'تسيير و اقتصاد',
            desc: 'المحاسبة، القانون، الاقتصاد و المناجمنت',
            url: '/resources.html#management',
            icon: 'fas fa-chart-line',
            keywords: [
                'تسيير محاسبي ومالي', 'المحاسبة التحليلية', 'المراجعة النهائية', 'المحاسبة', 'القانون', 'الاقتصاد والقانون', 'الخباش', 'المجتهد', 'الاقتصاد والمناجمنت', 'كتاب البسيط', 'وضعيات اقتصادية',
                'ملخصات المحاسبة', 'ملخص القانون', 'ملخص الاقتصاد', 'تمارين المحاسبة', 'مواضيع المحاسبة', 'اختبارات الفصول', 'بكالوريا التسيير والاقتصاد'
            ]
        },
        {
            title: 'مواد التكنولوجيا',
            desc: 'هندسة مدنية، كهربائية، ميكانيكية و طرائق',
            url: '/resources.html#tech',
            icon: 'fas fa-microchip',
            keywords: [
                'الهندسة المدنية', 'الهندسة الكهربائية', 'الهندسة الميكانيكية', 'هندسة الطرائق', 'المكتسبات القبلية', 'تحويل الوحدات', 'الرسم التقني', 'المختار', 'كتاب الزاد', 'كتاب الآلاء',
                'ملخصات التكنولوجيا', 'تمارين التكنولوجيا', 'مواضيع التكنولوجيا', 'اختبارات التكنولوجيا', 'بكالوريا التكنولوجيا'
            ]
        },
        {
            title: 'اللغات الأجنبية و العربية',
            desc: 'عربية، فرنسية، إنجليزية و أمازيغية',
            url: '/resources.html#arabic',
            icon: 'fas fa-language',
            keywords: [
                'اللغة العربية', 'شعر تعليمي', 'شعر مهجري', 'شعر سياسي', 'شعر اجتماعي', 'النشر العلمي المتأدب', 'فن المقال', 'القواعد', 'البلاغة', 'البناء الفكري', 'النوابغ',
                'اللغة الفرنسية', 'texte d\'histoire', 'texte argumentatif', 'L\'appel', 'Révision finale', 'فقرات الفرنسية',
                'اللغة الإنجليزية', 'Ethics in business', 'Safety first', 'Astronomy', 'Grammer', 'English', 'الأستاذ منصوري',
                'اللغة الأمازيغية', 'Agzul', 'Isentalen', 'الأمازيغية',
                'ملخصات العربية', 'ملخصات الفرنسية', 'ملخصات الإنجليزية', 'مواضيع اللغات', 'بكالوريا اللغات'
            ]
        },
        {
            title: 'المواد الأدبية',
            desc: 'شريعة، تاريخ و جغرافيا، و فلسفة',
            url: '/resources.html#Islamics',
            icon: 'fas fa-book-open',
            keywords: [
                'العلوم الإسلامية', 'الشريعة', 'العقيدة', 'مقاصد الشريعة', 'الميراث', 'الربا', 'السلسلة الأرجوانية',
                'التاريخ والجغرافيا', 'الحرب الباردة', 'الثورة الجزائرية', 'حركات التحرر', 'الاقتصاد العالمي', 'الشخصيات', 'الخرائط', 'المصطلحات', 'المصفوفة الشاملة',
                'الفلسفة', 'مقالات فلسفية', 'جدلية', 'استقصاء', 'كتاب الهدى',
                'ملخصات الشريعة', 'ملخصات التاريخ', 'ملخصات الجغرافيا', 'ملخصات الفلسفة', 'بكالوريا'
            ]
        },
        {
            title: 'دليل الجامعة 2025',
            desc: 'التخصصات الجامعية، معدلات القبول و التوجيه',
            url: '/university.html',
            icon: 'fas fa-university',
            keywords: [
                'النظام الجامعي', 'نظام LMD', 'مهندس', 'Ingénieur', 'معدلات القبول 2025', 'اختيار التخصص', 'الإقامة الجامعية', 'المنحة', 'النوادي العلمية', 'التربصات',
                'ESTIN', 'ENSIA', 'ENSCS', 'NHSM', 'Polytech', 'ENSTTIC', 'الذكاء الاصطناعي', 'الأمن السيبراني',
                'الطب', 'Medicine', 'طب الأسنان', 'الصيدلة', 'الطب البيطري',
                'شبه طبي', 'Paramedical', 'Kiné', 'مخبري', 'راديو', 'تخدير وإنعاش', 'ممرض', 'ISP', 'قابلة', 'Sage-Femme',
                'ENSC', 'EHEC', 'ESGEN', 'ENSSEA', 'ESSAIA', 'ENSA', 'ENSB', 'ENSSMAL', 'ENS', 'EPAU', 'ENSSN', 'ENSAS', 'ENSTP', 'IGEE',
                'ST', 'SM', 'بيولوجيا', 'محروقات', 'بصريات'
            ]
        },
        {
            title: 'الأدوات و خطط التميز',
            desc: 'توقيت الباك، حاسبة المعدل، الدرايفات و الخطط',
            url: '/tools.html',
            icon: 'fas fa-tools',
            keywords: [
                'الوقت المتبقي', 'حاسبة معدل البكالوريا', 'ورقة الإجابة', 'خطط التميز الشهرية', 'خطة الاستدراك', 'تحديات التميز', 'باقات عقبة بن نافع', 'عقبة بن نافع 2025',
                'درايفات المتفوقين', 'درايف إسلام', 'درايف لين', 'درايف سارة', 'درايف حكيم', 'Islam', 'Leen', 'Hakime', 'Sara', 'Google Drive'
            ]
        }
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

        const filtered = navSearchData.filter(item => {
            const itemTitle = normalizeSearch(item.title);
            const itemDesc = normalizeSearch(item.desc);
            const itemKeywords = (item.keywords || []).map(kw => normalizeSearch(kw));

            // Smart match: Every word in query must match something in the item
            return queryWords.every(word => {
                // 1. Check title/desc
                if (itemTitle.includes(word) || itemDesc.includes(word)) return true;

                // 2. Check keywords (Bidirectional partial match)
                // "Word searched contains part of keyword" OR "Keyword contains part of word"
                return itemKeywords.some(kw => {
                    if (!kw) return false;
                    return kw.includes(word) || word.includes(kw);
                });
            });
        });

        if (filtered.length === 0) {
            searchResults.innerHTML = '<div class="search-placeholder"><i class="fas fa-search"></i><p>لم يتم العثور على نتائج</p></div>';
        } else {
            searchResults.innerHTML = filtered.map(item => `
                <a href="${item.url}" class="search-result-item">
                    <i class="${item.icon}"></i>
                    <div class="result-info">
                        <h4>${item.title}</h4>
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
    // Inject components concurrently
    await Promise.all([
        injectComponent('#navbar-placeholder', 'components/navbar.html'),
        injectComponent('#footer-placeholder', 'components/footer.html')
    ]);

    // Ensure search placeholder is at body level for max z-index
    if (!document.getElementById('search-placeholder')) {
        const sp = document.createElement('div');
        sp.id = 'search-placeholder';
        document.body.appendChild(sp);
    }
    await injectComponent('#search-placeholder', 'components/search.html');

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
});

