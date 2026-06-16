// calculatorState is kept here because showSection() and the popstate handler reference it.
// All calculator logic (coefficients, selectField, calculateAverage, reveals, etc.)
// lives in components/calculator.js — loaded only on tools.html.
let calculatorState = 'fieldSelection';

function showSection(id, push = true) {
    if (id === 'calculator') {
        const savedState = localStorage.getItem('calculatorState') || 'fieldSelection';
        if (savedState !== 'fieldSelection') {
            showSection(savedState, push);
            return;
        }
    }
    if (id === 'fieldSelection' || id === 'mathSubjects' ||
        id === 'scienceSubjects' || id === 'techSubjects' || id === 'managementSubjects' ||
        id === 'literatureSubjects' || id === 'languagesSubjects') {

        document.getElementById('fieldSelection').style.display =
            (id === 'fieldSelection') ? 'grid' : 'none';

        const nameRow = document.getElementById('calcNameRow');
        if (nameRow) {
            nameRow.style.display = (id === 'fieldSelection') ? 'none' : 'grid';
        }

        document.querySelectorAll('.subject-container').forEach(container => {
            container.style.display = (container.id === id) ? 'block' : 'none';
        });

        if (id !== 'fieldSelection') {
            const fieldName = getFieldName(id.replace('Subjects', ''));
            document.querySelector('.calculator-header h2').textContent =
                `حساب معدل البكالوريا - ${fieldName}`;
            document.querySelector('.calculator-header p').textContent = 'أدخل علاماتك';
        } else {
            document.querySelector('.calculator-header h2').textContent = 'حساب معدل البكالوريا';
            document.querySelector('.calculator-header p').textContent = 'اختر شعبتك لحساب المعدل';
        }

        document.getElementById('resultSection').style.display = 'none';

        calculatorState = id;
        id = 'calculator';
    }

    // MAPPING FOR CROSS-PAGE NAVIGATION
    // If a section doesn't exist on the current page, we need to redirect to the page that has it
    const pageMapping = {
        'math': 'resources.html',
        'science': 'resources.html',
        'tech': 'resources.html',
        'management': 'resources.html',
        'resumes-exercises': 'resources.html',
        'books': 'resources.html',
        'Drives': 'resources.html',
        'bac-topics': 'bac-topics.html',
        'monthly-plans': 'plans.html',
        'subject-plans': 'plans.html',
        'challenges': 'plans.html',
        'timer': 'tools.html',
        'calculator': 'tools.html',
        'exam-sheet': 'tools.html',
        'weighted-calc': 'tools.html',
        'university-system': 'university.html',
        'university-section': 'university.html',
        'averages-of-acceptance': 'university.html',
        'oqba': 'oqba.html'
    };

    const section = document.getElementById(id);

    // If section doesn't exist on this page, but exists in our map, redirect there!
    if (!section && pageMapping[id] && !window.location.pathname.includes(pageMapping[id])) {
        window.location.href = `/${pageMapping[id]}#${id}`;
        return;
    }

    if (section) {
        document.querySelectorAll('.resource-content')
            .forEach(sec => sec.classList.remove('active'));

        section.classList.add('active');
        if (push) {
            history.pushState({ section: id, calculatorState }, '', `#${id}`);
        }

        // --- GOOGLE ANALYTICS VIRTUAL PAGEVIEW ---
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'page_view',
                page_path: window.location.pathname + (id ? '#' + id : ''),
                page_title: document.title + ' - ' + id
            });
        }

        // Scroll to top when section changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

window.addEventListener('popstate', (event) => {
    const state = event.state;
    const id = state?.section || location.hash.slice(1) || 'home';
    const calcState = state?.calculatorState || 'fieldSelection';

    if (id === 'calculator') {
        calculatorState = calcState;
        showSection(calcState, false);
    } else {
        showSection(id, false);
    }
});

const TIMERS_CONFIG = [
    { suffix: '1', target: new Date(2026, 5, 26, 8, 0, 0) },  // June 26 - التصحيح
    { suffix: '2', target: new Date(2026, 6, 18, 8, 0, 0) },  // July 18 - النتائج
    { suffix: '3', target: new Date(2027, 5, 7,  8, 30, 0) }, // June 7 2027 - بكالوريا 2027
];

function updateAllTimers() {
    const now = new Date();
    TIMERS_CONFIG.forEach(function(cfg) {
        const diff = cfg.target - now;
        const s = cfg.suffix;
        const set = function(id, val) {
            const el = document.getElementById(id + s);
            if (el) el.textContent = String(Math.max(0, val)).padStart(2, '0');
        };
        if (diff <= 0) {
            set('t-days-', 0); set('t-hours-', 0); set('t-min-', 0); set('t-sec-', 0);
            const doneEl = document.getElementById('timer-done-' + s);
            if (doneEl) doneEl.style.display = 'block';
            return;
        }
        set('t-days-', Math.floor(diff / 86400000));
        set('t-hours-', Math.floor((diff % 86400000) / 3600000));
        set('t-min-',   Math.floor((diff % 3600000)  / 60000));
        set('t-sec-',   Math.floor((diff % 60000)    / 1000));
    });
}

// Timer with Page Visibility API — pauses when tab is hidden
let timerInterval = null;
function startTimer() {
    if (timerInterval) return;
    updateAllTimers();
    timerInterval = setInterval(updateAllTimers, 1000);
}
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}
document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTimer();
    else startTimer();
}, { passive: true });

// ── Share Card ──────────────────────────────────────────────────────────────
(function () {
    var overlay, card, cardSubject, cardUrl;

    function buildCard() {
        // overlay
        overlay = document.createElement('div');
        overlay.className = 'share-overlay';
        overlay.addEventListener('click', closeCard);

        // card
        card = document.createElement('div');
        card.className = 'share-card';
        card.addEventListener('click', function (e) { e.stopPropagation(); });

        card.innerHTML =
            '<span class="share-card__handle"></span>' +
            /* ── Gradient hero header ── */
            '<div class="share-card__hero">' +
                '<div class="share-card__hero-icon"><i class="fas fa-share-nodes"></i></div>' +
                '<div class="share-card__hero-text">' +
                    '<strong>شارك الملف</strong>' +
                    '<span id="sc-subject"></span>' +
                '</div>' +
                '<button class="share-card__close" aria-label="إغلاق"><i class="fas fa-times"></i></button>' +
            '</div>' +
            /* ── Body ── */
            '<div class="share-card__body">' +
                '<p class="share-card__label">مشاركة عبر</p>' +
                '<div class="share-card__options">' +
                    '<button class="share-option share-option--wa"  onclick="scShare(\'wa\')">' +
                        '<div class="share-option__icon"><i class="fab fa-whatsapp"></i></div>' +
                        '<span>واتساب</span></button>' +
                    '<button class="share-option share-option--tg"  onclick="scShare(\'tg\')">' +
                        '<div class="share-option__icon"><i class="fab fa-telegram-plane"></i></div>' +
                        '<span>تيليغرام</span></button>' +
                    '<button class="share-option share-option--fb"  onclick="scShare(\'fb\')">' +
                        '<div class="share-option__icon"><i class="fab fa-facebook-f"></i></div>' +
                        '<span>فيسبوك</span></button>' +
                    '<button class="share-option share-option--copy" onclick="scShare(\'copy\')">' +
                        '<div class="share-option__icon" id="sc-copy-icon"><i class="fas fa-link"></i></div>' +
                        '<span>نسخ الرابط</span></button>' +
                '</div>' +
                '<div class="share-card__url-row">' +
                    '<span class="share-card__url" id="sc-url-text"></span>' +
                    '<button class="share-card__copy-url" onclick="scShare(\'copy\')">' +
                        '<i class="fas fa-copy"></i> نسخ' +
                    '</button>' +
                '</div>' +
            '</div>';

        card.querySelector('.share-card__close').addEventListener('click', closeCard);
        cardSubject = card.querySelector('#sc-subject');
        cardUrl     = card.querySelector('#sc-url-text');

        document.body.appendChild(overlay);
        document.body.appendChild(card);
    }

    function openCard(title, url) {
        if (!overlay) buildCard();
        cardSubject.textContent = title;
        cardUrl.textContent = url;
        card.dataset.url   = url;
        card.dataset.title = title;
        overlay.classList.add('active');
        requestAnimationFrame(function () { card.classList.add('active'); });
        document.body.style.overflow = 'hidden';
    }

    function closeCard() {
        if (!card) return;
        card.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeCard();
    });

    // exposed globally
    window.scShare = function (type) {
        var url   = card.dataset.url;
        var title = card.dataset.title;
        var encoded = encodeURIComponent(title + '\n' + url);
        if (type === 'wa')   window.open('https://wa.me/?text=' + encoded, '_blank', 'noopener');
        if (type === 'tg')   window.open('https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title), '_blank', 'noopener');
        if (type === 'fb')   window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank', 'noopener');
        if (type === 'copy') {
            var icon    = document.getElementById('sc-copy-icon');
            var copyBtn = card.querySelector('.share-card__copy-url');

            function onCopied() {
                icon.innerHTML = '<i class="fas fa-check"></i>';
                if (copyBtn) copyBtn.innerHTML = '<i class="fas fa-check"></i> تم!';
                setTimeout(function () {
                    icon.innerHTML = '<i class="fas fa-link"></i>';
                    if (copyBtn) copyBtn.innerHTML = '<i class="fas fa-copy"></i> نسخ';
                }, 2000);
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(onCopied).catch(function () {
                    // Fallback for denied clipboard permission
                    try {
                        var ta = document.createElement('textarea');
                        ta.value = url;
                        ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
                        document.body.appendChild(ta);
                        ta.focus(); ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                        onCopied();
                    } catch (e) { /* silent */ }
                });
            } else {
                // Legacy fallback
                try {
                    var ta = document.createElement('textarea');
                    ta.value = url;
                    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
                    document.body.appendChild(ta);
                    ta.focus(); ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    onCopied();
                } catch (e) { /* silent */ }
            }
        }
    };

    window._openShareCard = openCard;
}());

function shareOnWhatsApp(btn) {
    var section = btn.closest('.resource-content');
    var title   = (section && section.querySelector('h2'))
        ? section.querySelector('h2').textContent.trim()
        : 'مواضيع بكالوريا 2026';

    // Read the section ID directly from the DOM — always accurate, no window.location dependency
    var sectionId = section ? section.id : '';
    var base = window.location.origin + window.location.pathname.replace(/\/$/, '');
    var url  = sectionId ? (base + '#' + sectionId) : base;

    window._openShareCard(title, url);
}

// Inject share buttons into all .pdf-buttons containers
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.pdf-buttons').forEach(function (div) {
        if (div.querySelector('.share-btn')) return; // already injected
        const btn = document.createElement('button');
        btn.className = 'share-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'شارك على واتساب');
        btn.innerHTML = '<i class="fas fa-share-nodes"></i> شارك الملف';
        btn.addEventListener('click', function () { shareOnWhatsApp(btn); });
        div.appendChild(btn);
    });

});

// Handle form submission with AJAX
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitButton = this.querySelector('button[type="submit"]');
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');

        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';

        submitButton.disabled = true;
        submitButton.textContent = 'جاري الإرسال...';

        fetch(this.action, {
            method: this.method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: this.querySelector('[name="name"]').value,
                email: this.querySelector('[name="email"]').value,
                subject: this.querySelector('[name="subject"]').value,
                message: this.querySelector('[name="message"]').value
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    successMessage.style.display = 'block';
                    this.reset();
                } else {
                    errorMessage.textContent = data.message;
                    errorMessage.style.display = 'block';
                }
            })
            .catch(() => {
                errorMessage.textContent = 'حدث خطأ في الشبكة. يرجى المحاولة لاحقاً.';
                errorMessage.style.display = 'block';
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'إرسال الرسالة';

                setTimeout(() => {
                    successMessage.style.display = 'none';
                    errorMessage.style.display = 'none';
                }, 5000);
            });
    });
}

// Fullscreen toggler for multiple PDF viewers
// Strategy: try native Fullscreen API (desktop) → catch failure → CSS overlay (mobile/iOS)
function toggleFullScreen(event) {
    const btn     = event.currentTarget;
    const wrapper = btn.closest('.pdf-wrapper');
    const iframe  = wrapper.querySelector('iframe');

    const ICON_EXPAND  = '<i class="fa-solid fa-expand"></i> تكبير الملف';
    const ICON_COMPRESS = '<i class="fa-solid fa-compress"></i> تصغير الملف';

    // ── CSS overlay helpers ──────────────────────────────────────────────────
    function enterCSSFullscreen() {
        wrapper.classList.add('pdf-fullscreen');
        document.body.classList.add('pdf-body-lock');
        btn.innerHTML = ICON_COMPRESS;
    }
    function exitCSSFullscreen() {
        wrapper.classList.remove('pdf-fullscreen');
        document.body.classList.remove('pdf-body-lock');
        btn.innerHTML = ICON_EXPAND;
    }

    // ── Already in CSS fullscreen? → exit ───────────────────────────────────
    if (wrapper.classList.contains('pdf-fullscreen')) {
        exitCSSFullscreen();
        return;
    }

    // ── Already in native fullscreen? → exit ────────────────────────────────
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (fsEl === iframe) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        return;
    }

    // ── Try native fullscreen; fall back to CSS on rejection (Android) ───────
    const reqFS = iframe.requestFullscreen
               || iframe.webkitRequestFullscreen
               || iframe.msRequestFullscreen;

    if (reqFS) {
        reqFS.call(iframe).catch(() => enterCSSFullscreen());
    } else {
        // iOS Safari — requestFullscreen not available on iframes
        enterCSSFullscreen();
    }
}

// Sync button icons when native fullscreen exits via ESC or browser chrome
function _syncFSButtons() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        document.querySelectorAll('.full-btn').forEach(function (b) {
            b.innerHTML = '<i class="fa-solid fa-expand"></i> تكبير الملف';
        });
    }
}
document.addEventListener('fullscreenchange', _syncFSButtons);
document.addEventListener('webkitfullscreenchange', _syncFSButtons);

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        // Native fullscreen
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen();
        }
        // CSS fullscreen
        var cssFs = document.querySelector('.pdf-wrapper.pdf-fullscreen');
        if (cssFs) {
            cssFs.classList.remove('pdf-fullscreen');
            document.body.classList.remove('pdf-body-lock');
            var b = cssFs.querySelector('.full-btn');
            if (b) b.innerHTML = '<i class="fa-solid fa-expand"></i> تكبير الملف';
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Section Loading — replaceState stamps the initial entry so
    //    the popstate handler always gets valid state when the user presses back.
    const initial = location.hash.slice(1) || 'home';
    const savedState = localStorage.getItem('calculatorState') || 'fieldSelection';

    if (initial === 'calculator') {
        calculatorState = savedState;
        history.replaceState({ section: 'calculator', calculatorState: savedState }, '', location.href);
        showSection(savedState, false);
    } else {
        history.replaceState({ section: initial, calculatorState: savedState }, '', location.href);
        showSection(initial, false);
    }

    // 2. Timer Setup — start immediately if timer elements exist on this page
    if (document.getElementById('t-days-1')) {
        startTimer();
    }

    // 3. Load calculator data (only runs when calculator.js is present on tools.html)
    if (typeof loadCalculatorData === 'function') loadCalculatorData();

    // 4. Anchor Link Smooth Scrolling & Section Management
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                if (targetElement.classList.contains('resource-content')) {
                    showSection(targetId);
                } else {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // 5. Gallery / Slider logic
    document.querySelectorAll('.resource-content').forEach(resource => {
        const galleryImages = Array.from(resource.querySelectorAll('.gallery-images img'));
        const centerImg = resource.querySelector('.center-photo-img');
        const leftImg = resource.querySelector('.left-photo');
        const rightImg = resource.querySelector('.right-photo');
        const counter = resource.querySelector('.photo-counter');
        const leftNav = resource.querySelector('.left-nav');
        const rightNav = resource.querySelector('.right-nav');

        if (!galleryImages.length || !centerImg || !leftImg || !rightImg || !leftNav || !rightNav || !counter) {
            return;
        }

        let currentIndex = 0;

        function updateGallery() {
            const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            const nextIndex = (currentIndex + 1) % galleryImages.length;

            centerImg.src = galleryImages[currentIndex].src;
            centerImg.alt = galleryImages[currentIndex].alt;
            leftImg.src = galleryImages[prevIndex].src;
            leftImg.alt = galleryImages[prevIndex].alt;
            rightImg.src = galleryImages[nextIndex].src;
            rightImg.alt = galleryImages[nextIndex].alt;
            counter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
        }

        leftNav.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            updateGallery();
        });

        rightNav.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % galleryImages.length;
            updateGallery();
        });

        updateGallery();
    });
});


/* ═══════════════════════════════════════════════════
   UNIVERSITY PAGE — FILTER, TABS & SCROLL-TO-TOP
═══════════════════════════════════════════════════ */

// ── Speciality Filter ─────────────────────────────
(function initSpecFilter() {
    var ready = false;

    function setup() {
        if (ready) return;
        var container = document.getElementById('spec-cards-container');
        if (!container) return;
        ready = true;

        var chips = document.querySelectorAll('.filter-chip');
        var searchInput = document.getElementById('spec-search');
        var cards = container.querySelectorAll('.spec-card');
        var emptyState = document.getElementById('spec-empty-state');

        var activeCategory = 'all';
        var searchText = '';

        function applyFilters() {
            var visible = 0;
            cards.forEach(function (card) {
                var cat = card.dataset.category || '';
                var name = (card.dataset.name || '').toLowerCase();
                var matchCat = activeCategory === 'all' || cat === activeCategory;
                var matchSearch = !searchText || name.indexOf(searchText) !== -1;
                card.style.display = (matchCat && matchSearch) ? '' : 'none';
                if (matchCat && matchSearch) visible++;
            });
            if (emptyState) {
                emptyState.style.display = visible === 0 ? 'block' : 'none';
            }
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                var type = chip.dataset.filterType;
                var val = chip.dataset.filterVal;
                document.querySelectorAll('.filter-chip[data-filter-type="' + type + '"]')
                    .forEach(function (c) { c.classList.remove('active'); });
                chip.classList.add('active');
                if (type === 'category') activeCategory = val;
                applyFilters();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                searchText = searchInput.value.trim().toLowerCase();
                applyFilters();
            });
        }
    }

    // Run on page load and also when university-section becomes active
    document.addEventListener('DOMContentLoaded', setup);
    // Hook into showSection
    var _origShowSection = window.showSection;
    if (typeof _origShowSection === 'function') {
        window.showSection = function (id, push) {
            _origShowSection(id, push);
            if (id === 'university-section') {
                setTimeout(setup, 50);
            }
            if (id && id !== 'university-system' && id !== 'university-section' && id !== 'averages-of-acceptance') {
                setTimeout(function () { initSchoolTabs(id); }, 50);
            }
        };
    }
})();

// ── School Detail Tabs ────────────────────────────
var TAB_KEYWORDS = {
    admission: ['معدلات القبول', 'القبول'],
    system: ['نظام الدراسة', 'صعوبة الدراسة', 'هل توجد مشاريع', 'مستوى الدكاترة', 'الفرق بينها', 'الفرق بين'],
    career: ['العمل في', 'فرص العمل'],
    student: ['النوادي العلمية', 'فائدة النوادي', 'الإقامة'],
    firstyear: ['المقاييس المدروسة', 'السنة الأولى']
};
var TAB_LABELS = {
    admission: 'القبول',
    system: 'نظام الدراسة',
    career: 'المسار المهني',
    student: 'حياة الطالب',
    firstyear: 'السنة الأولى'
};

function initSchoolTabs(sectionId) {
    var sectionEl = document.getElementById(sectionId);
    if (!sectionEl) return;
    if (sectionEl.querySelector('.school-tab-bar')) return; // already initialized

    var detailsEl = sectionEl.querySelector('.details');
    if (!detailsEl) return;

    var cards = detailsEl.querySelectorAll('.detail-card');
    if (cards.length < 4) return; // not enough cards for tabs

    var tabsPresent = {};

    cards.forEach(function (card) {
        var h3 = card.querySelector('h3');
        if (!h3) { card.dataset.tab = 'general'; return; }
        var text = h3.textContent.trim();
        var assigned = false;
        for (var tab in TAB_KEYWORDS) {
            var kws = TAB_KEYWORDS[tab];
            for (var i = 0; i < kws.length; i++) {
                if (text.indexOf(kws[i]) !== -1) {
                    card.dataset.tab = tab;
                    tabsPresent[tab] = true;
                    assigned = true;
                    break;
                }
            }
            if (assigned) break;
        }
        if (!assigned) card.dataset.tab = 'general';
    });

    if (Object.keys(tabsPresent).length === 0) return;

    var tabBar = document.createElement('div');
    tabBar.className = 'school-tab-bar';

    var indicator = document.createElement('div');
    indicator.className = 'school-tab-indicator';
    tabBar.appendChild(indicator);

    // "All" button
    var allBtn = document.createElement('button');
    allBtn.className = 'school-tab-btn active';
    allBtn.dataset.tab = 'all';
    allBtn.textContent = 'الكل';
    tabBar.appendChild(allBtn);

    // Category buttons in order
    ['admission', 'system', 'career', 'student', 'firstyear'].forEach(function (tab) {
        if (!tabsPresent[tab]) return;
        var btn = document.createElement('button');
        btn.className = 'school-tab-btn';
        btn.dataset.tab = tab;
        btn.textContent = TAB_LABELS[tab];
        tabBar.appendChild(btn);
    });

    detailsEl.parentNode.insertBefore(tabBar, detailsEl);

    function updateIndicator(btn) {
        if (!btn) return;
        indicator.style.width = btn.offsetWidth + 'px';
        indicator.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
    }

    tabBar.addEventListener('click', function (e) {
        var btn = e.target.closest('.school-tab-btn');
        if (!btn) return;
        tabBar.querySelectorAll('.school-tab-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        updateIndicator(btn);

        var activeTab = btn.dataset.tab;
        cards.forEach(function (card) {
            if (activeTab === 'all') {
                card.classList.remove('tab-hidden');
            } else {
                if (card.dataset.tab === activeTab) {
                    card.classList.remove('tab-hidden');
                } else {
                    card.classList.add('tab-hidden');
                }
            }
        });
    });

    setTimeout(function () {
        var activeBtn = tabBar.querySelector('.school-tab-btn.active');
        if (activeBtn) updateIndicator(activeBtn);
    }, 50);
}
