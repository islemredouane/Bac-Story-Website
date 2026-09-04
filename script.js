// calculatorState is kept here because showSection() and the popstate handler reference it.
// All calculator logic (coefficients, selectField, calculateAverage, reveals, etc.)
// lives in components/calculator.js — loaded only on tools.html.
let calculatorState = 'fieldSelection';

// The section marked `.active` in a page's raw HTML is that page's true
// default view — captured once, before any showSection() call mutates the
// DOM. Every resources/*.html file bundles many sub-sections behind
// showSection() but only index.html's default happens to be id="home"; the
// literal 'home' fallback used to be hardcoded everywhere, so on every other
// page (math.html, sci.html, etc.) going back to the initial state called
// showSection('home', ...), found no matching element, and silently did
// nothing — leaving the UI stuck on whatever sub-section was last shown.
const DEFAULT_SECTION_ID = (function () {
    var el = document.querySelector('.resource-content.active');
    return (el && el.id) ? el.id : 'home';
})();

// Sub-sections reached via showSection() have no way back except this
// button — browser/gesture back is fixed below, but a visible, page-agnostic
// "رجوع" control removes the dependency on the user knowing that shortcut.
function ensureBackButton(section) {
    if (!section || section.id === DEFAULT_SECTION_ID) return;
    var container = section.querySelector('.container');
    if (!container || container.querySelector('.auto-back-wrap') || container.querySelector('a.modern-cta-btn, button.modern-cta-btn')) return;
    var wrap = document.createElement('div');
    wrap.className = 'auto-back-wrap';
    wrap.style.textAlign = 'center';
    wrap.style.marginTop = '1.5rem';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'modern-cta-btn';
    btn.innerHTML = '<i class="fas fa-arrow-right"></i> رجوع';
    btn.addEventListener('click', function () { history.back(); });
    wrap.appendChild(btn);
    container.appendChild(wrap);
}

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

        // Resolve to whatever this page can actually show, regardless of caller
        // (initial load, popstate, a stale #mathSubjects hash link, anything).
        // A specific subject only makes sense if this page has that subject's
        // container — the hub page (/tools/calculator) never does. 'fieldSelection'
        // only makes sense if this page has the picker grid — a per-subject page
        // (/tools/calculator/math, etc.) never does, it always has exactly one
        // subject to show instead.
        if (id !== 'fieldSelection' && !document.getElementById(id)) {
            id = 'fieldSelection';
        }
        if (id === 'fieldSelection' && !document.getElementById('fieldSelection')) {
            const ownSubjectContainer = document.querySelector('.subject-container');
            if (ownSubjectContainer) id = ownSubjectContainer.id;
        }

        // Every element below only exists on the old single-page calculator layout.
        // The hub (/tools/calculator) has #fieldSelection but no .subject-container;
        // the per-subject pages (/tools/calculator/math, etc.) have the opposite —
        // null-guard each lookup so restoring a saved state on either page can't throw.
        const fieldSelectionEl = document.getElementById('fieldSelection');
        if (fieldSelectionEl) {
            fieldSelectionEl.style.display = (id === 'fieldSelection') ? 'grid' : 'none';
        }

        const nameRow = document.getElementById('calcNameRow');
        if (nameRow) {
            nameRow.style.display = (id === 'fieldSelection') ? 'none' : 'grid';
        }

        document.querySelectorAll('.subject-container').forEach(container => {
            container.style.display = (container.id === id) ? 'block' : 'none';
        });

        const headerH2 = document.querySelector('.calculator-header h2');
        const headerP = document.querySelector('.calculator-header p');
        if (id !== 'fieldSelection' && typeof getFieldName === 'function') {
            const fieldName = getFieldName(id.replace('Subjects', ''));
            if (headerH2) headerH2.textContent = `حساب معدل البكالوريا - ${fieldName}`;
            if (headerP) headerP.textContent = 'أدخل علاماتك';
        } else if (id === 'fieldSelection') {
            if (headerH2) headerH2.textContent = 'حساب معدل البكالوريا';
            if (headerP) headerP.textContent = 'اختر شعبتك لحساب المعدل';
        }

        const resultSection = document.getElementById('resultSection');
        if (resultSection) resultSection.style.display = 'none';

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
        ensureBackButton(section);
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
    const id = state?.section || location.hash.slice(1) || DEFAULT_SECTION_ID;
    const calcState = state?.calculatorState || 'fieldSelection';

    if (id === 'calculator') {
        calculatorState = calcState;
        showSection(calcState, false);
    } else {
        showSection(id, false);
    }
});

const TIMERS_CONFIG = [
    { suffix: '2', target: new Date(2026, 6, 12, 10, 0, 0) }, // July 12 - النتائج
    { suffix: '3', target: new Date(2027, 5, 7, 8, 30, 0) }, // June 7 2027 - بكالوريا 2027
    { suffix: '4', target: new Date(2026, 8, 21, 8, 0, 0) }, // September 21 2026 - الدخول المدرسي
];

function updateAllTimers() {
    const now = new Date();
    TIMERS_CONFIG.forEach(function (cfg) {
        const diff = cfg.target - now;
        const s = cfg.suffix;
        const set = function (id, val) {
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
        set('t-min-', Math.floor((diff % 3600000) / 60000));
        set('t-sec-', Math.floor((diff % 60000) / 1000));
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
startTimer();
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
            /* — Body — */
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
        cardUrl = card.querySelector('#sc-url-text');

        document.body.appendChild(overlay);
        document.body.appendChild(card);
    }

    function openCard(title, url) {
        if (!overlay) buildCard();
        cardSubject.textContent = title;
        cardUrl.textContent = url;
        card.dataset.url = url;
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
        var url = card.dataset.url;
        var title = card.dataset.title;
        var encoded = encodeURIComponent(title + '\n' + url);
        if (type === 'wa') window.open('https://wa.me/?text=' + encoded, '_blank', 'noopener');
        if (type === 'tg') window.open('https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title), '_blank', 'noopener');
        if (type === 'fb') window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank', 'noopener');
        if (type === 'copy') {
            var icon = document.getElementById('sc-copy-icon');
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
    var title = (section && section.querySelector('h2'))
        ? section.querySelector('h2').textContent.trim()
        : 'مواضيع بكالوريا 2026';

    // Read the section ID directly from the DOM — always accurate, no window.location dependency
    var sectionId = section ? section.id : '';
    var base = window.location.origin + window.location.pathname.replace(/\/$/, '');
    var url = sectionId ? (base + '#' + sectionId) : base;

    window._openShareCard(title, url);
}

// Inject share buttons into all .pdf-buttons containers
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.pdf-buttons').forEach(function (div) {
        if (div.querySelector('.share-btn')) return; // already injected
        const btn = document.createElement('button');
        btn.className = 'share-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'شارك الملف');
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
    const btn = event.currentTarget;
    const wrapper = btn.closest('.pdf-wrapper');
    const iframe = wrapper.querySelector('iframe');

    const ICON_EXPAND = '<i class="fa-solid fa-expand"></i> تكبير الملف';
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
    const initial = location.hash.slice(1) || DEFAULT_SECTION_ID;
    const savedState = localStorage.getItem('calculatorState') || 'fieldSelection';

    if (initial === 'calculator') {
        // showSection() resolves a saved subject that doesn't belong on this page
        // (hub vs. per-subject page) on its own — see the guards at its top.
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

// Rich keyword aliases keyed by section ID — searched in addition to data-name
var SPEC_KEYWORDS = {
      'esesm': 'المدرسة العليا لأساتذة الصم والبكم صم بكم صم وبكم أصم أبكم معاق سمعيا معاقين سمعيا إعاقة سمعية خفيفة متوسطة ضعاف السمع ضعف السمع أستاذ أساتذة تعليم ثانوي بني مسوس أقسام مدمجة قسم مدمج دمج إدماج تربية خاصة ذوي الاحتياجات الخاصة ذوي الهمم وزارة التربية الوطنية لغة الإشارة الإشارية أرطوفونيا عيوب النطق تقويم النطق بيداغوجيا esesm sourds muets malentendant malentendants sourd-muet handicap auditif déficience auditive classe inclusive intégration scolaire langue des signes LSF orthophonie éducation spécialisée besoins spécifiques',
      'ENSTE': 'تكنولوجيا هندسة مناجم معادن صناعية عنابة enste',
      'ESGEE': 'هندسة كهربائية طاقوية وهران طاقات متجددة esgee',
      'ENSF': 'غابات طبيعة خنشلة aménagement forestier ensf',
      'biomedical': 'هندسة بيوطبية طب تكنولوجيا santé génie biomédical',

    'ESTIN': 'ذكاء اصطناعي أمن سيبراني انترنت الأشياء intelligence artificielle cybersécurité iot internet des objets génie informatique logiciel réseaux machine learning deep learning numérique digital بجاية مدرسة عليا رقمنة',
    'ESI-ALGER': 'مدرسة عليا إعلام آلي isi siw irs hcd génie logiciel systèmes informatiques réseaux cybersécurité grande école informatique الجزائر العاصمة بن عكنون',
    'ESI-SBA': 'isi siw iasd cys génie informatique intelligence artificielle sciences des données data science سيدي بلعباس وهران ingénierie systèmes information computer architecture data structures algorithms linux assembly language digital electronics linear algebra information systems digital economy ai literacy quantum computing حوسبة كمومية AI and Quantum Community Alphabet Ingeniums أمن سيبراني',
    'ENSIA': 'ia intelligence artificielle artificial intelligence machine learning deep learning neural networks data science big data المدرسة الوطنية العليا للذكاء الاصطناعي الجزائر',
    'ENSCS': 'cybersécurité cybersecurity sécurité informatique سيبراني سيبرانيا أمن المعلومات أمن الشبكات pentest ethical hacking هجمات حماية أنظمة المدرسة الوطنية العليا للأمن السيبراني',
    'ENSTTIC': 'télécommunications telecom réseaux TIC technologies information communication ستيك بوزريعة haut débit fibre optique 5g',
    'NHSM': 'mathématiques mathematics statistiques probabilités analyse algèbre analyse numérique المدرسة الوطنية العليا للرياضيات الكوليا',
    'POLYTECH': 'polytechnique génie civil mécanique électrique chimique matériaux multidisciplinaire complexe polytechnique الجزائر',
    'EPAU': 'architecture urbanisme design urbain habitat logement patrimoine paysage المدرسة البوليتكنيكية هندسة تعمير',
    'ENSSN': 'nanotechnologie nanosciences matériaux optique photonique microélectronique nanostructures نانو',
    'ENSAS': 'robotique robotics systèmes autonomes drones véhicules autonomes automation روبوت المدرسة الوطنية العليا للأنظمة المستقلة',
    'ENSTP': 'travaux publics génie civil voirie VRD btp routes ponts barrages infrastructure أشغال المدرسة الوطنية العليا للأشغال العمومية',
    'ENSH': 'hydraulique ressources en eau irrigation eau potable traitement des eaux barrage البليدة المدرسة الوطنية العليا للهيدروليك',
    'IGEE': 'génie électrique électronique électrotechnique automatique systèmes électriques énergétique بومرداس كهرباء',
    'ENSEE': 'génie électrique énergie électrotechnique puissance systèmes électriques وهران كهرباء طاقة',
    'ESSA': 'sciences appliquées multidisciplinaire ingénierie تلمسان علوم تطبيقية',
    'HNSRE': 'énergies renouvelables énergie solaire photovoltaïque éolien hydrogène transition énergétique green energy باتنة طاقة شمسية ريح',
    'AERONAUTIQUE': 'aéronautique aerospace aviation pilote avion moteur espace aérospatial vol البليدة طيران مدني صواريخ',
    'ENSC': 'commerce sciences commerciales marketing finance vente gestion وهران المدرسة الوطنية العليا للتجارة',
    'EHEC': 'hautes études commerciales management économie commerce international entreprise mba تيجلابين المدرسة العليا للتجارة',
    'ESGEN': 'gestion des entreprises entrepreneuriat économie numérique digital business المدرسة العليا للتسيير والاقتصاد الرقمي',
    'ENSSEA': 'statistique économétrie démographie actuariat planification prospective الكوليا إحصاء اقتصاد تطبيقي',
    'ESB': 'banque finance bancaire monnaie crédit islamique المدرسة العليا للبنوك الجزائر العاصمة صيرفة',
    'ENST': 'tourisme hôtellerie restauration guide touristique patrimoine voyage المدرسة الوطنية العليا للسياحة',
    'ESM': 'management gestion leadership entreprise stratégie المدرسة العليا للمانجمينت تلمسان إدارة',
    'ESSAIA': 'agroalimentaire nutrition qualité alimentaire sécurité alimentaire food science industrie alimentaire المدرسة العليا للعلوم الزراعية والصناعات الغذائية',
    'INATAA': 'nutrition alimentation industries agroalimentaires constantine sécurité alimentaire تغذية معهد التغذية والتغذي والصناعات الفلاحية الغذائية قسنطينة صناعات فلاحية غذاء',
    'ENSA': 'agronomie agriculture agronome INA zootechnie horticulture علوم زراعية فلاحة الجزائر',
    'ENS': 'enseignement professeur pédagogie éducation formation des enseignants école normale supérieure مدرسة عليا أساتذة أستاذ ens prof enseignante lycée CEM primaire mathématiques physique langues sciences education تعليم تربية ابتدائي متوسط ثانوي أستاذة أدب رياضيات فيزياء انجليزية فرنسية',
    'military-health': 'صحة عسكرية طب عسكري عين النعجة عسكرية قضي بكير ضابط طبيب صيدلة أسنان شبه طبي عسكري military health medicine',
    'military-media': 'المدرسة العليا العسكرية للإعلام والاتصال سيدي فرج عسكري صحافة إعلام تلفزيون مجلة ضابط صحفي جيش وطني شعبي آداب لغات اقتصاد communication media officer',
    'MEDCINE': 'médecine générale CHU résidanat médecin docteur généraliste spécialiste طبيب دكتور كلية الطب حكيم',
    'MEDCINE-DENTAIRE': 'dentiste chirurgie dentaire orthodontie implant dentaire prothèse carie أسنان دكتور أسنان طب الفم كلية طب الأسنان',
    'PHARMACIE': 'pharmacien médicaments officine pharmacologie biochimie دواء الصيدلة صيدلاني',
    'PARAMEDICAL': 'infirmier kinésithérapie laborantin radiologie soins aide soignant تمريض إسعاف شبه طبي صحة رعاية',
    'Sage-Femme': 'maïeutique accouchement obstétrique gynécologie maternité sage femme قبالة ولادة توليد أمومة',
    'PHARMACIE-INDUSTRIELLE': 'industrie pharmaceutique fabrication médicaments biotechnologie pharmaceutique bioproduction صيدلة صناعية',
    'vetrinaire': 'vétérinaire animaux élevage zoologie équine bovine aviculture بيطري حيوانات طب بيطري',
    'MED-BIO': 'double cursus biologie médicale biochimie microbiologie biologie moléculaire مزدوج تخصص مزدوج',
    'MED-INFO': 'bioinformatique informatique médicale santé numérique health tech double cursus ذكاء اصطناعي طبي',
    'ESSB': 'biologie biotechnologie microbiologie biochimie biologie cellulaire وهران',
    'ENSB': 'biotechnologie biologie moléculaire génie biologique génétique fermentation المدرسة الوطنية العليا للبيوتكنولوجيا',
    'ENSSMAL': 'sciences de la mer biologie marine halieutique pêche oceanographie côtier المدرسة الوطنية العليا للعلوم البحرية بحر',
    'INFORMATIQUE': 'licence informatique génie logiciel réseaux cybersécurité systèmes web développement programmation code python java',
    'ARCHITECTURE': 'architecture urbanisme design urbain habitat logement patrimoine bâtiment paysage هندسة معمارية',
    'MATH': 'mathématiques mathematics statistiques probabilités analyse algèbre mathématiques appliquées رياضيات',
    'ST': 'sciences technologies électronique mécanique chimie génie industriel technologies علوم تكنولوجيا',
    'SM': 'sciences de la matière physique chimie thermodynamique matériaux énergie فيزياء كيمياء',
    'BIOLOGIE': 'biologie écologie environnement génétique microbiologie zoologie botanique بيولوجيا علوم طبيعية',
    'HYDROCARBURES': 'pétrole gaz sonatrach raffinerie exploration géologie pétrolière ingénierie pétrolière نفط غاز بترول محروقات',
    'Optique': 'optique physique photonique instrumentation mécanique de précision lunettes lasers بصريات ضوء ليزر',
    'GP': 'génie des procédés chimie industrielle génie chimique procédés industriels كيمياء صناعية معالجة',
    'GI': 'génie industriel production qualité ergonomie logistique industrielle maintenance صناعة جودة إنتاج',
    'MARINE': 'marine naval navires offshore port mer navigation maritime هندسة بحرية سفن ميناء ملاحة',
    'GT': 'génie des transports logistique ferroviaire aérien portuaire mobilité transports سكك حديدية مطارات موانئ',
    'GM': 'mines minéralurgie géologie minière extraction ressources minérales مناجم معادن تعدين جيولوجيا',
    'GC': 'génie civil structures béton géotechnique VRD routes ponts bâtiment هندسة مدنية بناء جسور سدود',
    'GMEC': 'génie mécanique mécatronique thermodynamique fluides fabrication machines moteurs هندسة ميكانيكية ميكانيك',
    'DROIT': 'droit civil commercial public avocat notaire juriste magistrat tribunal justice loi حقوق محاماة قضاء عدالة',
    'SS': 'psychologie sociologie anthropologie démographie philosophie travail social علم نفس علم اجتماع فلسفة',
    'TRADUCTION': 'traduction interprétation langues linguistique traducteur interprète traduit ترجمة فورية تحريرية',
    'COMMU': 'journalisme médias relations publiques communication digitale réseaux sociaux presse إعلام صحافة اتصال',
    'LANGUES': 'français anglais espagnol allemand arabe langues étrangères littérature linguistique فرنسية إنجليزية إسبانية',
    'CHARIA': 'fiqh hadith coran charia jurisprudence islamique aqida usoul الفقه علوم شرعية إسلامية دين',
    'SCIENCES-PO': 'politique diplomatie relations internationales administration publique gouvernance دبلوماسية سياسة علاقات دولية',
    'SCIENCES-HUM': 'histoire géographie archéologie bibliothéconomie patrimoine civilisations تاريخ جغرافيا آثار تراث',
    'MED-AI': 'intelligence artificielle médicale santé numérique diagnostic algorithmique imagerie médicale ذكاء طبي',
    'MED-GEN': 'génétique médicale génomique maladies héréditaires conseil génétique وراثة طبية جينوم',
    'IT-INT': 'interopérabilité systèmes information cloud architecture SI ingénierie logicielle تشغيل بيني',
    'ADDICT': 'addictologie addiction toxicomanie alcool drogues comportement santé mentale الإدمان مخدرات',
    'NLP': 'traitement du langage naturel nlp ia linguistique computationnelle intelligence artificielle لغة طبيعية',
    'PREC-MED': 'médecine de précision personnalisée thérapie ciblée génomique oncologie طب دقيق شخصي',
    'DENT-HYG': 'hygiène dentaire soins préventifs prophylaxie dentisterie clinique صحة الفم',
    'GEN-COUNS': 'conseil génétique maladies génétiques dépistage prénatal مستشار وراثة',
    'IND-ENTR': 'entrepreneuriat industriel startups innovation industrie management مقاولاتية ريادة الأعمال',
    'SPACE-TECH': 'espace spatial satellites technologie spatiale aérospatial astronomie الفضاء أقمار صناعية',
    'DIGITAL-AGRO': 'agriculture numérique drones capteurs iot agtech smart farming هندسة زراعية رقمية',
    'SMART-CITIES': 'villes intelligentes smart city urbanisme numérique mobilité infrastructure المدن الذكية',
    'MED-INFORMATICS': 'informatique médicale santé numérique télémédecine dossiers médicaux e-santé المعلوماتية الطبية',
    'QUANTUM': 'physique quantique mécanique quantique calcul quantique cryptographie كم كمومي فيزياء كمية',
    'kiné': 'kinésithérapie rééducation physiothérapie masseur kiné rééducateur الكينيزيتيرابيا علاج طبيعي',
    'labo': 'laboratoire analyses médicales biologie médicale examens cliniques laborantin تحاليل مخبرية مختبر',
    'radio': 'radiologie imagerie médicale scanner IRM radiographie rayons X تصوير طبي راديو أشعة',
    'Appareilleur-Orthopédiste': 'appareillage orthopédique prothèse orthèse handicap rééducation أطراف اصطناعية مقوّم أعضاء',
    'Anesthésie-Réanimation': 'anesthésie réanimation urgences bloc opératoire soins intensifs تخدير إنعاش',
    'isp': 'infirmier soins infirmiers santé publique nursing تمريض صحة ممرض',
    'esp': 'ergothérapie occupation thérapie rééducation fonctionnelle مداواة بالعمل',
    'Psychomotricien': 'psychomotricité développement moteur enfant rééducation حركة نفسية طفل',
    'Pédicure-Podologue': 'pédicure podologie soins des pieds قدم أرجل',
    'dental-prosthetist': 'prothèse dentaire prothésiste dentaire laboratoire dentaire céramique أسنان اصطناعية تركيبات',
    'pharma-prep': 'préparateur en pharmacie médicaments ordonnance officine محضر صيدلاني دواء',
    'LAW-POL': 'حقوق علوم سياسية قانون علاقات دولية sciences politiques droit',
    'LAW-FIN': 'حقوق مالية محاسبة قانون تجاري droit finance comptabilité',
    'MATH-ECO': 'رياضيات اقتصاد إحصاء نماذج مالية mathématiques appliquées économie',
    'CS-ECO': 'إعلام آلي اقتصاد تكنولوجيا مالية fintech informatique économie',
    'ARCH-SOC': 'هندسة معمارية علم اجتماع حضري architecture sociologie urbaine',
    'TECH-MEDIA': 'إعلام آلي إعلام رقمي تواصل tech media communication digitale informatique',
    'ENG-POL': 'إنجليزية علوم سياسية دبلوماسية english political science diplomatie',
    'ECO-MEDIA': 'اقتصاد إعلام تسويق صحافة اقتصادية marketing journalisme économique',
    'MEDIA-POL': 'إعلام سياسة علاقات عامة communication politique relations publiques',
    'SPORTS-MEDIA': 'إعلام رياضة تدريب رياضي صحافة رياضية journalisme sportif',
    'DIGITAL-ENG': 'إدارة رقمية إنجليزية مناجمنت digital administration management english',
    'DIP-LAW': 'قانون دبلوماسي تعاون دولي droit diplomatique coopération internationale',
    'SPORTS-PSYCH': 'تدريب رياضي علم نفس رياضي sports psychology high performance',
    'ARCHI-CIVIL': 'هندسة معمارية هندسة مدنية architectural engineering archi civil',
    'ARCHITECTURE-UNI': 'هندسة معمارية نظام LMD جامعة architecture lmd',
    'ENPEI': 'المدرسة الوطنية التحضيرية لدراسات مهندس رويبة enpei rouiba ingénierie militaire',
    'ESSG': 'المدرسة العليا لعلوم التسيير عنابة essg annaba management gestion',
    'ESCF': 'المدرسة العليا للمحاسبة والمالية قسنطينة escf constantine finance comptabilité',
    'ESE': 'المدرسة العليا للاقتصاد وهران ese oran economie',
    'ENSM': 'المدرسة الوطنية العليا للمناجم والمعادن عنابة ensm annaba mines métallurgie',
    'ENSTA': 'المدرسة الوطنية العليا للتكنولوجيات المتقدمة وهران ensta oran technologies avancées',
    'MED-ECO': 'طب واقتصاد اقتصاد صحي médecine économie santé publique management de la santé',
    'INFO-AUTO': 'إعلام آلي وآلية ذكاء اصطناعي سيارات ذاتية القيادة informatique automatique véhicules autonomes',
    'LANG-FIN': 'لغات أجنبية ومالية لغات تطبيقية مالية langues étrangères finance traduction financière',
    'INFO-GEST': 'إعلام آلي وتسيير أنظمة معلومات informatique gestion systèmes d\'information',
    'MGMT-ENG': 'إدارة أعمال وهندسة management ingénierie',
    'DROIT-INFO': 'حقوق وإعلام آلي قانون رقمي droit informatique cyberdroit',
    'MED-PSY': 'طب وعلم نفس الطب النفسي médecine psychologie psychiatrie',
    'GEOLOGIE': 'جيولوجيا géologie علوم الأرض',
    'GEOGRAPHIE': 'جغرافيا géographie',
    'AGRONOMIE': 'علوم زراعية agronomique sciences agronomiques',
    'AGROALIMENTAIRE': 'علوم غذاء تغذية sciences alimentaires',
    'SOCIALES': 'علوم اجتماعية sciences sociales',
    'ARCHEOLOGIE': 'علم الآثار archéologie',
    'LOISIR': 'علم الاجتماع سياحة رفاهية sociologie du loisir',
    'STAPS': 'رياضة علوم تقنيات أنشطة بدنية staps sports',
    'ARTS': 'فنون تشكيلية arts plastiques',
    'CINEMA': 'سينما cinéma arts du spectacle',
    'ARABE': 'لغة وأدب عربي langue littérature arabes',
    'TAMAZIGHT': 'لغة وثقافة أمازيغية tamazight berbère tamazighte',
    '3D-DESIGN': 'تصميم ثلاثي أبعاد رسوم متحركة 3D design animation infographie',
    'AEROPORT': 'مطارات نقل جوي aéroport transport aérien gestion aéroportuaire',
    'AGRO': 'فلاحة زراعة علوم فلاحية agronome ENSA هندسة زراعية تربة نبات حيوان SNV',
    'ALLEMAND': 'لغة ألمانية أدب ألماني langue allemande littérature',
    'ANGLAIS': 'لغة إنجليزية أدب إنجليزي littérature anglaise langue étrangère',
    'AUTO': 'ميكانيك سيارات أتمتة automatique automatisme génie mécanique automobile',
    'CHERCHALL': 'أكاديمية عسكرية شرشال ضابط مهندس جيش académie militaire cherarall officer défense',
    'tafraoui': 'المدرسة العليا للطيران طفراوي وهران عسكري طيار ضابط جو جيش وطني شعبي طائرات مقاتلة قوات جوية طائرات حربية سماء طيران عسكري tafraoui aviation pilote militaire',
    'tamentfoust': 'المدرسة العليا البحرية تمنفوست برج البحري عسكري بحرية ضابط مهندس غواص جيش وطني شعبي سفن ملاحة بحرية غواصات tamentfoust marine navale officier',
    'esdat': 'المدرسة العليا للدفاع الجوي عن الإقليم الرغاية عسكري رادار حرب إلكترونية ضابط مهندس صواريخ جيش سماء الدفاع الجوي عن الإقليم شهيد علي شباطي esdat defense aerienne territoire radar',
    'gendarmerie': 'المدرسة العليا للدرك الوطني زرالدة عسكري أمن قانون ضابط حقوق ليسانس جيش وطني شعبي درك أمني الضبطية القضائية شهيد أحمد بن الشريف gendarmerie nationale sécurité droit officier zeralda',
    'republican-guard': 'المدرسة العليا للحرس الجمهوري برج الكيفان عسكري بروتوكول ضابط رئاسة جمهورية حماية نخبة تشريفات خيالة مواكب رئاسية قامة شهيد علي النمري حرس جمهوري garde républicaine officier protocole sécurité présidence borj elkiffan',
    'signal-corps': 'المدرسة العليا للإشارة القليعة تيبازة عسكري سيبراني أمن سيبراني اتصالات شبكات تشفير ألياف بصرية حرب إلكترونية ضابط مهندس إعلام آلي إلكترونيك جيش وطني شعبي رياضيات تقني هندسة كهربائية بوسعادة عبد الحفيظ signal corps cybersécurité télécommunications chiffrement guerre electronique officier ingénieur',
    'ordnance-corps': 'المدرسة العليا للعتاد الحراش عسكري ميكانيك هندسة ميكانيكية صيانة لوجيستيك أسلحة مدرعات دبابات مركبات تموين تقني ضابط مهندس جيش وطني شعبي رياضيات تقني هندسة كهربائية شهيد بن مختار آمود عتاد corps ordonnance matériel armement maintenance logistique militaire officier ingénieur',
    'commissariat-corps': 'المدرسة العليا لتقنيات المعتمدية البليدة عسكري تسيير مالي محاسبة إدارة لوجيستيك ميزانية ضابط تسيير اقتصاد آداب فلسفة لغات أجنبية قانون جيش وطني شعبي شهيد جيلالي بونعامة مالية تموين وقود مخازن إداري مسير corps commissariat intendance administration militaire officier finance comptabilité logistique gestion budget Blida',
    'CHILDHOOD': 'طفولة مبكرة علم نفس الطفل petite enfance psychologie développement',
    'CHINOIS': 'لغة صينية أدب صيني langue chinoise mandarin littérature',
    'CINEMA-MEDIA': 'سينما إعلام cinéma médias production audiovisuelle',
    'CIRCULAR-ECONOMY': 'اقتصاد دائري بيئة économie circulaire recyclage développement durable',
    'CITY-JOBS': 'وظائف مدنية إدارة بلدية métiers de la ville urbanisme services publics',
    'COMM-IR': 'إعلام علاقات دولية صحافة communication relations internationales journalisme',
    'COMM-TOURISM': 'إعلام سياحة communication tourisme hospitality',
    'COMMERCE': 'تجارة دراسات تجارية sciences commerciales licence commerce',
    'CRIMINOLOGIE': 'علم الإجرام criminologie crime déviance',
    'CSR': 'مسؤولية اجتماعية مؤسسات responsabilité sociale entreprise RSE développement durable',
    'DIGITAL-BIZ': 'أعمال رقمية تجارة إلكترونية digital business e-commerce économie numérique',
    'DIGITAL-PROD': 'إنتاج رقمي production numérique animation digital media',
    'E-BIZ': 'تجارة إلكترونية e-business digital commerce numérique',
    'ECO': 'اقتصاد ليسانس économie LMD sciences économiques',
    'ECO-IR': 'اقتصاد علاقات دولية تجارة خارجية économie relations internationales commerce',
    'ELECTRO': 'إلكترونيك كهرباء électronique électrotechnique génie électrique',
    'ENA': 'مدرسة وطنية إدارة ENA إداريون موظفون عموميون administration publique école nationale',
    'ENMAS': 'متاحف آثار تراث musées archéologie patrimoine conservation',
    'ENSCRBC': 'محاسبة ENSCRBC comptabilité révision comptable bilan',
    'ENSJSI': 'صحافة إعلام journalisme sciences de l information ENSJSI',
    'ENV-SCI': 'علوم بيئة محيط بيئية ecologie environnement pollution sciences de l environnement',
    'ESAA': 'مدرسة عليا جزائرية أعمال إدارة أعمال تسيير مالية تسويق double degree MBA',
    'ESI-KOLEA': 'ضرائب جباية مالية عامة مدرسة عليا ضرائب قليعة fiscalité impôts',
    'ESM-JUSTICE': 'مدرسة عليا قضاء مغنية magistrature justice droit',
    'ESPAGNOL': 'لغة إسبانية أدب إسباني langue espagnole littérature',
    'ESSBO': 'علوم بيولوجية وهران بيوتكنولوجيا biotechnologie biologie oran',
    'ESSP': 'علوم سياسية science politique ESSP',
    'ESSS': 'المدرسة العليا للعلوم الاجتماعية sciences sociales ESSS',
    'FINTECH': 'تقنية مالية fintech finance numérique blockchain',
    'FORENSIQUE': 'أدلة جنائية علم جنائي sciences forensiques criminalistique',
    'FRANCAIS': 'لغة فرنسية أدب فرنسي littérature française langue étrangère',
    'GENOMIC-DATA': 'بيانات جينية وراثة DNA بيولوجيا جزيئية génomique bioinformatique',
    'GESTION': 'تسيير إدارة أعمال gestion management sciences de gestion LMD',
    'HEALTH-COMM': 'تواصل صحي إعلام طبي communication santé éducation thérapeutique',
    'HEALTH-INFO': 'صحة معلوماتية informatique médicale e-santé health informatics',
    'HEALTH-SOC': 'صحة مجتمع علوم اجتماعية santé société sciences sociales',
    'HISTORY-DATA': 'تاريخ بيانات archivar data history sciences historiques',
    'HSE': 'صحة سلامة بيئة hygiène sécurité environnement HSE risques industriels',
    'HYDRO': 'هيدروليك مياه موارد مائية hydraulique ressources en eau irrigation',
    'IDRI': 'العلاقات الدولية الدراسات الدولية IDRI relations internationales',
    'IEDF': 'ديمغرافيا وفيزياء demographie physique IEDF',
    'ITALIEN': 'لغة إيطالية أدب إيطالي langue italienne littérature',
    'LAW-IR': 'حقوق علاقات دولية قانون دولي droit relations internationales',
    'MARKETING-COMM': 'تسويق اتصال marketing communication digitale publicité',
    'MOLECULAR-ENGINEERING': 'هندسة جزيئية كيمياء فيزياء ذكاء اصطناعي ingénierie moléculaire chimie IA',
    'MUSIC-PERF': 'موسيقى أداء موسيقي musique performance musicale',
    'PENAL': 'قانون جنائي قانون عقوبات droit pénal criminel',
    'PETROCHIMIE': 'بتروكيمياء صناعة بترولية pétrochimie chimie industrielle hydrocarbures',
    'PHILO': 'فلسفة philosophie logique éthique épistémologie pensée',
    'PROTEINS-SEEDS': 'بروتينات بذور أمن غذائي قمح بقوليات فلاحة semences protéines sécurité alimentaire',
    'PUBLIC-INNOV': 'ابتكار عام إدارة عامة innovation publique administration',
    'RUSSE': 'لغة روسية أدب روسي langue russe littérature',
    'SCENARIO': 'سيناريو كتابة إبداعية scénario écriture créative cinéma',
    'SOC-LEISURE': 'علم اجتماع وقت الفراغ رفاهية sociologie du loisir loisirs culturels',
    'TELECOM': 'اتصالات شبكات télécommunications réseaux TIC fibre 5g',
    'THEATER': 'مسرح فنون مسرحية théâtre arts du spectacle performance',
    'TRADING': 'تجارة خارجية تجارة دولية commerce international trading import export',
    'TURC': 'لغة تركية أدب تركي langue turque littérature',
    'dieteticien': 'دياتيتيسيان حمية تغذية علاجية diététicien nutritionniste régime alimentation thérapeutique',
    'renouvelables': 'طاقات متجددة طاقة شمسية رياح هيدروجين أخضر انتقال طاقوي عصرنة énergies renouvelables énergie solaire éolien hydrogène vert transition énergétique photovoltaïque',
    'segc': 'اقتصاد تسيير تجارة محاسبة مالية بنوك تسويق sciences économiques gestion commerciales économie comptabilité banque marketing finance',
    'ensta-st': 'علوم تطبيقية هندسة تكنولوجيا متقدمة إلكترونيك آلية أنظمة مدمجة essa تلمسان درقانة sciences appliquées technologies avancées électronique automatique systèmes embarqués',
    'ufc': 'جامعة التكوين المتواصل تعليم عن بعد مختلط حضوري تكوين مستمر université formation continue enseignement à distance blended learning',
    'business-computing': 'حوسبة الأعمال بيزنس معلوماتية تجارة رقمية تسيير رقمي تيبازة business computing informatique des affaires digital business ERP',
    'e-commerce': 'تجارة إلكترونية تسيير عمليات تجارية لوجيستيك رقمي دفع إلكتروني e-commerce e-logistics commerce électronique paiement électronique',
    'mi-social': 'رياضيات إعلام آلي علوم إنسانية اجتماعية إحصاء تحليل بيانات mathématiques informatique sciences sociales statistique data analytics',
    'mi-seg': 'رياضيات إعلام آلي اقتصاد تسيير هندسة مالية تحليل كمي mathématiques informatique économie gestion ingénierie financière quant',
    'gtu': 'تسيير التقنيات الحضرية هندسة حضرية تسيير المدن شبكات طرقات مياه تطهير إنارة عمومية نفايات مساحات خضراء VRD SIG عمران بلديات gestion des techniques urbaines génie urbain gestion des villes urbanisme réseaux voirie assainissement',
};

(function initSpecFilter() {
    var ready = false;

    // ── Synonym expansion map ──────────────────────────────────────────────────
    // Keys are normalized query words; values are space-separated aliases that
    // are injected into the haystack before matching.
    var SEARCH_SYNONYMS = {
        // Arabic common synonyms & dialect words
        'طب': 'طبيب دكتور medicine medecin sante',
        'اصم': 'صم بكم اعاقة سمعية esesm sourd',
        'ابكم': 'بكم صم اعاقة سمعية esesm muet',
        'صم': 'بكم اصم ابكم اعاقة سمعية esesm sourd muet',
        'بكم': 'صم اصم ابكم اعاقة سمعية esesm sourd muet',
        'دكتور': 'طبيب طب medecin doctor docteur',
        'طبيب': 'دكتور طب medecin',
        'مهندس': 'هندسه engineering ingenieur genie',
        'هندسه': 'مهندس engineering ingenieur genie',
        'محامي': 'حقوق avocat droit juriste',
        'حقوق': 'قانون droit legal avocat juriste',
        'قانون': 'حقوق droit legal juridique',
        'اعلام': 'اعلام الي informatique صحافه communication',
        'كمبيوتر': 'اعلام الي informatique computer informatique programmation',
        'كومبيوتر': 'اعلام الي informatique computer programmation',
        'برمجه': 'informatique اعلام الي code developpement software',
        'ذكاء': 'intelligence artificielle ia machine learning deep learning',
        'روبوت': 'robotique systemes autonomes drones',
        'سيبراني': 'cybersecurite securite informatique hacking reseaux',
        'امن': 'securite cybersecurite sante',
        'كهرباء': 'electronique electrotechnique genie electrique',
        'ميكانيك': 'mecanique genie mecanique automobile thermodynamique',
        'بناء': 'genie civil construction btp routes ponts architecture',
        'تعمير': 'architecture urbanisme habitat design',
        'معماريه': 'architecture urbanisme design',
        'ري': 'hydraulique eau irrigation ressources hydrologie',
        'مياه': 'hydraulique eau irrigation ressources hydrologie',
        'طاقه': 'energie renouvelables solaire eolien hydrogene',
        'شمسيه': 'solaire energie renouvelables photovoltaique',
        'نفط': 'petrole gaz sonatrach hydrocarbures',
        'فلاحه': 'agriculture agronomie زراعه agronome',
        'زراعه': 'agriculture agronomie فلاحه agronome',
        'بيولوجيا': 'biologie biotechnologie microbiologie genetique',
        'كيمياء': 'chimie biochimie chimique',
        'فيزياء': 'physique biophysique sciences de la matiere',
        'تغذيه': 'nutrition alimentation dietetique agroalimentaire',
        'اكل': 'nutrition alimentation agroalimentaire غذاء',
        'غذاء': 'nutrition alimentation agroalimentaire',
        'صيدليه': 'pharmacie medicaments drogues',
        'دواء': 'pharmacie medicaments pharmacien',
        'صيدلاني': 'pharmacie pharmacien medicaments',
        'اسنان': 'dentaire dentiste chirurgie dentale',
        'بيطري': 'veterinaire animaux elevage',
        'حيوانات': 'veterinaire zootechnie elevage biologie',
        'ممرض': 'infirmier paramedical soins temoignage',
        'تمريض': 'infirmier paramedical soins nursing',
        'اداره': 'gestion management administration entreprise',
        'تسييير': 'gestion management administration',
        'مانجمنت': 'management gestion administration entreprise',
        'اقتصاد': 'economie commerce finance gestion',
        'تجاره': 'commerce economie marketing finance',
        'محاسبه': 'comptabilite finance audit bilan',
        'ماليه': 'finance comptabilite economie banque',
        'بنك': 'banque finance credit islamique',
        'بنوك': 'banque finance credit islamique',
        'سياحه': 'tourisme hotellerie restauration',
        'فندقه': 'tourisme hotellerie restauration',
        'اعمال': 'business gestion management entrepreneuriat',
        'مقاوله': 'entrepreneuriat startup innovation business',
        'احصاء': 'statistiques econometrie demographie actuariat',
        'جباءه': 'fiscalite impots taxes finances publiques',
        'ضرائب': 'fiscalite impots taxes finances publiques',
        'اجتماع': 'sociologie sciences sociales anthropologie',
        'نفس': 'psychologie sciences humaines comportement',
        'تاريخ': 'histoire geographie archeologie patrimoine',
        'جغرافيا': 'geographie cartographie territoire environnement',
        'اثار': 'archeologie patrimoine histoire civilisations',
        'فن': 'arts plastiques cinema musique theater expression',
        'رياضيات': 'mathematiques statistiques probabilites algebre',
        'رياضيه': 'staps sport sciences activites physiques',
        'رياضه': 'staps sport sciences activites physiques sport education',
        'ادب': 'litterature langue philologie linguistique',
        'عربيه': 'arabe langue litterature arabe linguistique',
        'فرنسيه': 'francais langue litterature francaise',
        'انجليزيه': 'anglais langue litterature anglaise english',
        'ترجمه': 'traduction interpretation langues linguistique',
        'صحافه': 'journalisme medias communication presse information',
        'اعلاميه': 'journalisme communication medias presse',
        'دبلوماسيه': 'diplomatie relations internationales politique',
        'سياسه': 'sciences politiques diplomatie relations internationales',
        'اسلاميه': 'islamique charia fiqh hadith sciences religieuses',
        'دين': 'islamique charia fiqh religion',
        'فلسفه': 'philosophie logique ethique epistemologie',
        'عسكريه': 'militaire armee defense securite nationale',
        'جيش': 'militaire armee defense officier',
        'شرطه': 'securite police justice',
        'فضاء': 'spatial aeronautique aerospace satellites',
        'طيران': 'aeronautique aerospace aviation pilote avion',
        'بيئه': 'environnement ecologie pollution developpement durable',
        'كوكب': 'environnement ecologie geologie sciences de la terre',
        'جيولوجيا': 'geologie mineralogie sciences de la terre geophysique',
        'مناجم': 'mines mineralurgie extraction geologie miniere',
        'نانو': 'nanotechnologie nanosciences materiaux photonique',
        'مختبر': 'laboratoire analyses biologie chimie microbiologie',
        'تحاليل': 'laboratoire analyses medicales biologie biochimie',
        'تصوير': 'radiologie imagerie medicale scanner irm radiographie',
        'اشعه': 'radiologie imagerie medicale rayons x scanner',
        'اشغال': 'travaux publics genie civil btp routes ponts infrastructure',
        'جسور': 'ponts genie civil infrastructure travaux publics',
        'مدن': 'urbanisme villes architecture habitat ville',
        'ذكيه': 'smart city villes intelligentes urbanisme numerique',
        'ataenour': 'ان',  // typo-proof
        // Common abbreviations and short forms
        'ia': 'intelligence artificielle machine learning deep learning',
        'ai': 'intelligence artificielle machine learning deep learning',
        'ml': 'machine learning intelligence artificielle data science',
        'bi': 'business intelligence data analytics',
        'it': 'informatique systemes information reseaux',
        'hr': 'ressources humaines gestion rh management',
        'rh': 'ressources humaines management gestion',
        'btp': 'batiment travaux publics genie civil construction',
        'lmd': 'licence master doctorat universite',
        'ing': 'ingenieur engineering genie grande ecole',
        'esi': 'ecole superieure informatique informatique superieur',
        'enp': 'polytechnique polytech genie',
    };

    function normalize(s) {
        return (s || '').toLowerCase()
            .replace(/[أإآٱ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/[ً-ٰٟ]/g, '')
            .replace(/[،,;:!?]/g, ' ')
            .trim();
    }

    // Expand a single normalized query word with its synonyms
    function expandWord(w) {
        var base = [w];
        if (SEARCH_SYNONYMS[w]) {
            SEARCH_SYNONYMS[w].split(/\s+/).forEach(function (syn) {
                var n = normalize(syn);
                if (n) base.push(n);
            });
        }
        // Also try stripping a leading "ال" prefix (definite article)
        var stripped = w.replace(/^ال/, '');
        if (stripped && stripped !== w) {
            base.push(stripped);
            if (SEARCH_SYNONYMS[stripped]) {
                SEARCH_SYNONYMS[stripped].split(/\s+/).forEach(function (syn) {
                    var n = normalize(syn);
                    if (n) base.push(n);
                });
            }
        }
        return base;
    }

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
        var activeStream = 'all';
        var activeNew = false;
        var searchText = '';

        // Default accepted streams per category (used when card has no data-stream)
        var DEFAULT_STREAMS = {
            engineering: ['math','tech'],
            medical:     ['math','sciences'],
            science:     ['math','sciences'],
            business:    ['gestion','math'],
            law:         ['adab','gestion','langues','math','sciences'],
            humanities:  ['adab','langues','sciences'],
            arts:        ['adab','langues'],
            education:   ['adab','langues','math','sciences','tech','gestion'],
            military:    ['math','tech','sciences']
        };

        function getCardStreams(card) {
            if (card.dataset.stream) return card.dataset.stream.split(',');
            return DEFAULT_STREAMS[card.dataset.category || ''] || ['math','sciences','tech','adab','langues','gestion'];
        }

        function applyFilters() {
            var normQ = normalize(searchText);
            var rawWords = normQ.split(/\s+/).filter(Boolean);
            var visible = 0;
            cards.forEach(function (card) {
                var cat = card.dataset.category || '';
                var isNew = card.dataset.new === 'true';
                var matchCat = activeCategory === 'all' || cat === activeCategory;
                var matchNew = !activeNew || isNew;
                var matchStream = activeStream === 'all' || getCardStreams(card).indexOf(activeStream) !== -1;
                var matchSearch = true;
                if (rawWords.length) {
                    var onclick = card.getAttribute('onclick') || '';
                    // Cards navigate via window.location.href='/university/speciality/<slug>'
                    // (older showSection('ID') pattern kept as a fallback for safety).
                    var m = onclick.match(/speciality\/([a-zA-Z0-9_-]+)/) || onclick.match(/showSection\(['"]([^'"]+)['"]\)/);
                    var sid = m ? m[1] : '';
                    var kw = SPEC_KEYWORDS[sid] || SPEC_KEYWORDS[sid.toLowerCase()] || SPEC_KEYWORDS[sid.toUpperCase()] || '';
                    var haystack = normalize((card.dataset.name || '') + ' ' + kw);
                    // For each query word, check if the haystack contains the word itself
                    // OR any of its synonyms (partial prefix match ≥ 3 chars)
                    matchSearch = rawWords.every(function (w) {
                        var candidates = expandWord(w);
                        return candidates.some(function (cand) {
                            if (cand.length < 2) return false;
                            // substring match (handles partial: "هند" → "هندسه")
                            return haystack.indexOf(cand) !== -1;
                        });
                    });
                }
                var show = matchCat && matchNew && matchStream && matchSearch;
                card.style.display = show ? '' : 'none';
                if (show) visible += parseInt(card.dataset.count || '1', 10);
            });
            if (emptyState) {
                emptyState.style.display = visible === 0 ? 'flex' : 'none';
            }
            if (container) {
                container.style.marginBottom = visible === 0 ? '0' : '';
            }
            var countEl = document.getElementById('spec-visible-count');
            if (countEl) countEl.textContent = visible;
            var clearBtn = document.getElementById('spec-clear-btn');
            if (clearBtn) {
                var isFiltered = activeCategory !== 'all' || activeStream !== 'all' || activeNew || searchText;
                clearBtn.style.display = isFiltered ? 'inline-flex' : 'none';
            }
        }

        window.clearSpecFilters = function () {
            activeCategory = 'all';
            activeStream = 'all';
            activeNew = false;
            searchText = '';
            if (searchInput) searchInput.value = '';
            chips.forEach(function (c) {
                var isAll = c.dataset.filterVal === 'all';
                var isNew = c.dataset.filterType === 'new';
                c.classList.toggle('active', isAll && !isNew);
            });
            applyFilters();
        };

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                var type = chip.dataset.filterType;
                var val = chip.dataset.filterVal;
                if (type === 'new') {
                    var alreadyActive = chip.classList.contains('active');
                    chip.classList.toggle('active');
                    activeNew = !alreadyActive;
                } else {
                    document.querySelectorAll('.filter-chip[data-filter-type="' + type + '"]')
                        .forEach(function (c) { c.classList.remove('active'); });
                    chip.classList.add('active');
                    if (type === 'category') activeCategory = val;
                    if (type === 'stream') activeStream = val;
                }
                applyFilters();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                searchText = searchInput.value.trim();
                if (searchText.length > 0) {
                    activeCategory = 'all';
                    chips.forEach(function (c) {
                        if (c.dataset.filterType === 'category') {
                            if (c.dataset.filterVal === 'all') {
                                c.classList.add('active');
                            } else {
                                c.classList.remove('active');
                            }
                        }
                    });
                }
                applyFilters();
            });
        }

        // initialise counter on load
        applyFilters();
    }

    // Run on page load and also when university-section becomes active
    if (document.readyState !== 'loading') {
        setup();
    } else {
        document.addEventListener('DOMContentLoaded', setup);
    }
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
    intro: ['التعريف ب', 'تعريف التخصص', 'تعريف مختصر', 'ما هو', 'ماهو', 'واش هو', 'هل هو تخصص', 'بمن يعتني', 'إنسانية المهنة', 'لماذا هذا التخصص', 'واش يدير', 'واش تخدم', 'المهام اليومية', 'المهمات والمجالات', 'مهامه', '💻 التعريف', '🩺 الحالات', 'لغة الدراسة', 'لغة التدريس', 'تخصص جديد', 'الجامعات التي', 'الجامعات المتوفرة', 'الكليات المتوفرة', 'المدارس المتوفرة', 'وين تقرا', 'أين يمكن دراسته', 'أين يُدرّس', 'أماكن الدراسة', 'الموقع'],
    admission: ['معدلات القبول', 'معدل القبول', 'شروط القبول', 'شروط الدخول', 'شروط الالتحاق', 'التسجيل والقبول', 'التسجيل', 'الشعب المسموح', 'كيف تلتحق', 'كيفاش تلتحق', 'تسجيلات', 'الولوج إلى', 'كيف يتم التوجيه', 'أين يمكن دراسته', 'أين يُدرّس', 'أماكن الدراسة'],
    curriculum: ['المواد المدروسة', 'المواد الأساسية', 'المواد في', 'المواد والتكوين', 'مواد تقراها', 'البرنامج الدراسي', 'مسار الدراسة', 'المسار الدراسي', 'مدة الدراسة', 'المدة والمعاهد', 'طريقة الدراسة', 'كيفاش تقرا', 'تنظيم الدراسة', 'الدراسة والنظام', 'التربصات', 'التدريب الميداني', 'التطبيق العملي', 'طور الماستر', 'التخصصات في الماستر', 'التخصصات المتوفرة في الماستر', 'التخصصات بعد الليسانس', 'تخصصات الماستر', 'دورات الدراسات العليا', 'المقاييس المدروسة', 'السنة الأولى', 'نظام الدراسة', 'النظام الدراسي', 'نظام الاختبارات', 'نظام التقييم', 'صعوبة الدراسة', 'صعوبات التخصص', 'صعوبة التخصص', 'هل توجد مشاريع', 'مستوى الدكاترة', 'الفرق بينها', 'الفرق بين', 'الفرق مع', 'نظام LMD', 'نظام Ingénieur', 'نظام الإنتقال', 'البحث العلمي', 'بيئة البحث', 'تابع لأي'],
    career: ['فرص العمل', 'آفاق التوظيف', 'آفاق العمل', 'مجالات التوظيف', 'بعد التخرج', 'العمل بعد', 'العمل في', 'الراتب', 'المستقبل المهني', 'وين تخدم', 'وين يخدم', 'وين يقدر يخدم', 'آفاق الترقية', 'الترقيات', 'سلم الترقية', 'سلم الرتب', 'فرص التكوين الإضافي', 'التوظيف', 'مجالات العمل'],
    pros: ['المزايا', 'العيوب', 'الإيجابيات', 'السلبيات', 'مميزات التخصص', 'مميزات المدرسة', 'أهم مميزاته', 'سلبيات التخصص', 'التحديات', 'الامتيازات', 'إيجابيات التخصص', 'الإيجابيات والسلبيات', 'التحديات الحالية', 'الوضع الحالي', 'المميزات', 'السلبيات والتحديات'],
    student: ['النوادي العلمية', 'فائدة النوادي', 'الإقامة', 'آراء الطلبة', 'آراء بعض الطلبة', 'رأي الطلبة', 'شهادة طالب', 'مزايا المدرسة'],
    tips: ['نصائح', 'نصيحة', 'خلاصة', 'كلمة أخيرة', 'في الخلاصة', 'علاش تختار', 'علاه من أفضل', 'واش لازم تعرف', 'واش لازم تدير', 'نقولك', 'وبالنسبة للبنات', 'معلومات إضافية', 'معلومة إضافية', 'ملاحظات مهمة', 'ملاحظة مهمة', 'حقائق لازم', 'حاجات لازم', 'واش يخليك', 'واش تقرا'],
    firstyear: ['البرنامج الدراسي (السنة الأولى)', 'المواد في الطور التحضيري', 'المواد المدروسة في الطور']
};
var TAB_LABELS = {
    intro: 'عن التخصص',
    admission: 'القبول',
    curriculum: 'الدراسة',
    career: 'المسار المهني',
    pros: 'المزايا والعيوب',
    student: 'حياة الطالب',
    tips: 'نصائح',
    firstyear: 'الطور التحضيري'
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

    // Detect optional specialities grid + its header inside this section
    var specGrid = sectionEl.querySelector('.Speciality-container-new');
    var specHeader = sectionEl.querySelector('[id$="-specialities-header"]');
    var hasSpecGrid = !!specGrid;

    if (Object.keys(tabsPresent).length === 0 && !hasSpecGrid) return;

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
    ['intro', 'admission', 'curriculum', 'career', 'pros', 'student', 'tips', 'firstyear'].forEach(function (tab) {
        if (!tabsPresent[tab]) return;
        var btn = document.createElement('button');
        btn.className = 'school-tab-btn';
        btn.dataset.tab = tab;
        btn.textContent = TAB_LABELS[tab];
        tabBar.appendChild(btn);
    });

    // "التخصصات" button — only if a specialities grid exists in this section
    if (hasSpecGrid) {
        var specBtn = document.createElement('button');
        specBtn.className = 'school-tab-btn';
        specBtn.dataset.tab = 'specialities';
        specBtn.textContent = 'التخصصات';
        tabBar.appendChild(specBtn);
    }

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

        var showGrid = activeTab === 'all' || activeTab === 'specialities';
        if (specGrid) specGrid.style.display = showGrid ? '' : 'none';
        if (specHeader) specHeader.style.display = showGrid ? '' : 'none';

        if (activeTab === 'specialities') {
            // Hide all detail cards, show only the specialities grid
            cards.forEach(function (card) { card.classList.add('tab-hidden'); });
            detailsEl.classList.add('tab-hidden');
        } else {
            detailsEl.classList.remove('tab-hidden');
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
        }
    });

    setTimeout(function () {
        var activeBtn = tabBar.querySelector('.school-tab-btn.active');
        if (activeBtn) updateIndicator(activeBtn);
    }, 50);
}

// --- BAC 2026 Toast ---
function showBacToast(message) {
    const existing = document.getElementById('bac-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'bac-toast';
    Object.assign(toast.style, {
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%) translateY(-20px)',
        background: 'linear-gradient(135deg, #1a3a8f 0%, #2c5cc5 55%, #3d6ee0 100%)',
        color: '#fff',
        padding: '14px 22px',
        borderRadius: '14px',
        fontSize: '0.97rem',
        fontFamily: "'Tajawal', sans-serif",
        fontWeight: '600',
        lineHeight: '1.5',
        zIndex: '999999',
        boxShadow: '0 8px 30px rgba(44, 92, 195, 0.45), 0 2px 8px rgba(0,0,0,0.25)',
        border: '1.5px solid rgba(255,255,255,0.15)',
        transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        opacity: '0',
        pointerEvents: 'none',
        textAlign: 'center',
        direction: 'rtl',
        maxWidth: '320px',
        width: 'calc(100% - 40px)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        justifyContent: 'center'
    });

    toast.innerHTML = '<i class="fas fa-clock" style="color:#ff6b35;font-size:1.1rem;flex-shrink:0;"></i><span>' + message + '</span>';
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-10px)';
        setTimeout(() => toast.remove(), 350);
    }, 3200);
}

/* ==========================================================================
   Premium PDF Switcher (for individual pages with multiple files)
   ========================================================================== */
window.switchPdf = function(button, fileId, isInit = false) {
    const iframe = document.querySelector('.responsive-pdf');
    const downloadBtn = document.querySelector('.down-btn');
    
    if (iframe && !isInit) {
        iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
    }
    if (downloadBtn && !isInit) {
        downloadBtn.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    const bar = button.closest('.pdf-switcher-toggle');
    if (!bar) return;
    
    const allBtns = bar.querySelectorAll('.pdf-switcher-tab');
    allBtns.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const pill = bar.querySelector('.pdf-switcher-pill');
    if (pill) {
        // Use offsetLeft to correctly position the pill regardless of scroll position
        pill.style.width = button.offsetWidth + 'px';
        pill.style.left = button.offsetLeft + 'px';
    }

    if (!isInit) {
        button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
};
