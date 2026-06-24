// calculatorState is kept here because showSection() and the popstate handler reference it.
// All calculator logic (coefficients, selectField, calculateAverage, reveals, etc.)
// lives in components/calculator.js Ã¢â‚¬â€ loaded only on tools.html.
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
                `Ã˜Â­Ã˜Â³Ã˜Â§Ã˜Â¨ Ã™â€¦Ã˜Â¹Ã˜Â¯Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â¨Ã™Æ’Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â±Ã™Å Ã˜Â§ - ${fieldName}`;
            document.querySelector('.calculator-header p').textContent = 'Ã˜Â£Ã˜Â¯Ã˜Â®Ã™â€ž Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€¦Ã˜Â§Ã˜ÂªÃ™Æ’';
        } else {
            document.querySelector('.calculator-header h2').textContent = 'Ã˜Â­Ã˜Â³Ã˜Â§Ã˜Â¨ Ã™â€¦Ã˜Â¹Ã˜Â¯Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â¨Ã™Æ’Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â±Ã™Å Ã˜Â§';
            document.querySelector('.calculator-header p').textContent = 'Ã˜Â§Ã˜Â®Ã˜ÂªÃ˜Â± Ã˜Â´Ã˜Â¹Ã˜Â¨Ã˜ÂªÃ™Æ’ Ã™â€žÃ˜Â­Ã˜Â³Ã˜Â§Ã˜Â¨ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¹Ã˜Â¯Ã™â€ž';
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
    { suffix: '2', target: new Date(2026, 6, 14, 8, 0, 0) },  // July 14 - النتائج
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

// Timer with Page Visibility API Ã¢â‚¬â€ pauses when tab is hidden
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

// Ã¢â€â‚¬Ã¢â€â‚¬ Share Card Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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
            /* Ã¢â€â‚¬Ã¢â€â‚¬ Gradient hero header Ã¢â€â‚¬Ã¢â€â‚¬ */
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
        : 'Ã™â€¦Ã™Ë†Ã˜Â§Ã˜Â¶Ã™Å Ã˜Â¹ Ã˜Â¨Ã™Æ’Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â±Ã™Å Ã˜Â§ 2026';

    // Read the section ID directly from the DOM Ã¢â‚¬â€ always accurate, no window.location dependency
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
        submitButton.textContent = 'Ã˜Â¬Ã˜Â§Ã˜Â±Ã™Å  Ã˜Â§Ã™â€žÃ˜Â¥Ã˜Â±Ã˜Â³Ã˜Â§Ã™â€ž...';

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
                errorMessage.textContent = 'Ã˜Â­Ã˜Â¯Ã˜Â« Ã˜Â®Ã˜Â·Ã˜Â£ Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â¨Ã™Æ’Ã˜Â©. Ã™Å Ã˜Â±Ã˜Â¬Ã™â€° Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â­Ã˜Â§Ã™Ë†Ã™â€žÃ˜Â© Ã™â€žÃ˜Â§Ã˜Â­Ã™â€šÃ˜Â§Ã™â€¹.';
                errorMessage.style.display = 'block';
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Ã˜Â¥Ã˜Â±Ã˜Â³Ã˜Â§Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â±Ã˜Â³Ã˜Â§Ã™â€žÃ˜Â©';

                setTimeout(() => {
                    successMessage.style.display = 'none';
                    errorMessage.style.display = 'none';
                }, 5000);
            });
    });
}

// Fullscreen toggler for multiple PDF viewers
// Strategy: try native Fullscreen API (desktop) Ã¢â€ â€™ catch failure Ã¢â€ â€™ CSS overlay (mobile/iOS)
function toggleFullScreen(event) {
    const btn     = event.currentTarget;
    const wrapper = btn.closest('.pdf-wrapper');
    const iframe  = wrapper.querySelector('iframe');

    const ICON_EXPAND  = '<i class="fa-solid fa-expand"></i> Ã˜ÂªÃ™Æ’Ã˜Â¨Ã™Å Ã˜Â± Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™Â';
    const ICON_COMPRESS = '<i class="fa-solid fa-compress"></i> Ã˜ÂªÃ˜ÂµÃ˜ÂºÃ™Å Ã˜Â± Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™Â';

    // Ã¢â€â‚¬Ã¢â€â‚¬ CSS overlay helpers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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

    // Ã¢â€â‚¬Ã¢â€â‚¬ Already in CSS fullscreen? Ã¢â€ â€™ exit Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    if (wrapper.classList.contains('pdf-fullscreen')) {
        exitCSSFullscreen();
        return;
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Already in native fullscreen? Ã¢â€ â€™ exit Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (fsEl === iframe) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        return;
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Try native fullscreen; fall back to CSS on rejection (Android) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    const reqFS = iframe.requestFullscreen
               || iframe.webkitRequestFullscreen
               || iframe.msRequestFullscreen;

    if (reqFS) {
        reqFS.call(iframe).catch(() => enterCSSFullscreen());
    } else {
        // iOS Safari Ã¢â‚¬â€ requestFullscreen not available on iframes
        enterCSSFullscreen();
    }
}

// Sync button icons when native fullscreen exits via ESC or browser chrome
function _syncFSButtons() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        document.querySelectorAll('.full-btn').forEach(function (b) {
            b.innerHTML = '<i class="fa-solid fa-expand"></i> Ã˜ÂªÃ™Æ’Ã˜Â¨Ã™Å Ã˜Â± Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™Â';
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
            if (b) b.innerHTML = '<i class="fa-solid fa-expand"></i> Ã˜ÂªÃ™Æ’Ã˜Â¨Ã™Å Ã˜Â± Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™Â';
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Section Loading Ã¢â‚¬â€ replaceState stamps the initial entry so
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

    // 2. Timer Setup Ã¢â‚¬â€ start immediately if timer elements exist on this page
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


/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
   UNIVERSITY PAGE Ã¢â‚¬â€ FILTER, TABS & SCROLL-TO-TOP
Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */

// Ã¢â€â‚¬Ã¢â€â‚¬ Speciality Filter Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

// Rich keyword aliases keyed by section ID Ã¢â‚¬â€ searched in addition to data-name
var SPEC_KEYWORDS = {
    'ESTIN': 'Ã˜Â°Ã™Æ’Ã˜Â§Ã˜Â¡ Ã˜Â§Ã˜ÂµÃ˜Â·Ã™â€ Ã˜Â§Ã˜Â¹Ã™Å  Ã˜Â£Ã™â€¦Ã™â€  Ã˜Â³Ã™Å Ã˜Â¨Ã˜Â±Ã˜Â§Ã™â€ Ã™Å  Ã˜Â§Ã™â€ Ã˜ÂªÃ˜Â±Ã™â€ Ã˜Âª Ã˜Â§Ã™â€žÃ˜Â£Ã˜Â´Ã™Å Ã˜Â§Ã˜Â¡ intelligence artificielle cybersÃƒÂ©curitÃƒÂ© iot internet des objets gÃƒÂ©nie informatique logiciel rÃƒÂ©seaux machine learning deep learning numÃƒÂ©rique digital Ã˜Â¨Ã˜Â¬Ã˜Â§Ã™Å Ã˜Â© Ã™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã˜Â±Ã™â€šÃ™â€¦Ã™â€ Ã˜Â©',
    'ESI-ALGER': 'Ã™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã˜Â¥Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€¦ Ã˜Â¢Ã™â€žÃ™Å  isi siw irs hcd gÃƒÂ©nie logiciel systÃƒÂ¨mes informatiques rÃƒÂ©seaux cybersÃƒÂ©curitÃƒÂ© grande ÃƒÂ©cole informatique Ã˜Â§Ã™â€žÃ˜Â¬Ã˜Â²Ã˜Â§Ã˜Â¦Ã˜Â± Ã˜Â§Ã™â€žÃ˜Â¹Ã˜Â§Ã˜ÂµÃ™â€¦Ã˜Â© Ã˜Â¨Ã™â€  Ã˜Â¹Ã™Æ’Ã™â€ Ã™Ë†Ã™â€ ',
    'ESI-SBA': 'isi siw iasd cys gÃƒÂ©nie informatique intelligence artificielle sciences des donnÃƒÂ©es data science Ã˜Â³Ã™Å Ã˜Â¯Ã™Å  Ã˜Â¨Ã™â€žÃ˜Â¹Ã˜Â¨Ã˜Â§Ã˜Â³ Ã™Ë†Ã™â€¡Ã˜Â±Ã˜Â§Ã™â€  ingÃƒÂ©nierie systÃƒÂ¨mes information computer architecture data structures algorithms linux assembly language digital electronics linear algebra information systems digital economy ai literacy quantum computing Ã˜Â­Ã™Ë†Ã˜Â³Ã˜Â¨Ã˜Â© Ã™Æ’Ã™â€¦Ã™Ë†Ã™â€¦Ã™Å Ã˜Â© AI and Quantum Community Alphabet Ingeniums Ã˜Â£Ã™â€¦Ã™â€  Ã˜Â³Ã™Å Ã˜Â¨Ã˜Â±Ã˜Â§Ã™â€ Ã™Å ',
    'ENSIA': 'ia intelligence artificielle artificial intelligence machine learning deep learning neural networks data science big data Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â·Ã™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜Â°Ã™Æ’Ã˜Â§Ã˜Â¡ Ã˜Â§Ã™â€žÃ˜Â§Ã˜ÂµÃ˜Â·Ã™â€ Ã˜Â§Ã˜Â¹Ã™Å  Ã˜Â§Ã™â€žÃ˜Â¬Ã˜Â²Ã˜Â§Ã˜Â¦Ã˜Â±',
    'ENSCS': 'cybersÃƒÂ©curitÃƒÂ© cybersecurity sÃƒÂ©curitÃƒÂ© informatique Ã˜Â³Ã™Å Ã˜Â¨Ã˜Â±Ã˜Â§Ã™â€ Ã™Å  Ã˜Â³Ã™Å Ã˜Â¨Ã˜Â±Ã˜Â§Ã™â€ Ã™Å Ã˜Â§ Ã˜Â£Ã™â€¦Ã™â€  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦Ã˜Â§Ã˜Âª Ã˜Â£Ã™â€¦Ã™â€  Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â¨Ã™Æ’Ã˜Â§Ã˜Âª pentest ethical hacking Ã™â€¡Ã˜Â¬Ã™â€¦Ã˜Â§Ã˜Âª Ã˜Â­Ã™â€¦Ã˜Â§Ã™Å Ã˜Â© Ã˜Â£Ã™â€ Ã˜Â¸Ã™â€¦Ã˜Â© Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â·Ã™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜Â£Ã™â€¦Ã™â€  Ã˜Â§Ã™â€žÃ˜Â³Ã™Å Ã˜Â¨Ã˜Â±Ã˜Â§Ã™â€ Ã™Å ',
    'ENSTTIC': 'tÃƒÂ©lÃƒÂ©communications telecom rÃƒÂ©seaux TIC technologies information communication Ã˜Â³Ã˜ÂªÃ™Å Ã™Æ’ Ã˜Â¨Ã™Ë†Ã˜Â²Ã˜Â±Ã™Å Ã˜Â¹Ã˜Â© haut dÃƒÂ©bit fibre optique 5g',
    'NHSM': 'mathÃƒÂ©matiques mathematics statistiques probabilitÃƒÂ©s analyse algÃƒÂ¨bre analyse numÃƒÂ©rique Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â·Ã™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜Â±Ã™Å Ã˜Â§Ã˜Â¶Ã™Å Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ™Æ’Ã™Ë†Ã™â€žÃ™Å Ã˜Â§',
    'POLYTECH': 'polytechnique gÃƒÂ©nie civil mÃƒÂ©canique ÃƒÂ©lectrique chimique matÃƒÂ©riaux multidisciplinaire complexe polytechnique Ã˜Â§Ã™â€žÃ˜Â¬Ã˜Â²Ã˜Â§Ã˜Â¦Ã˜Â±',
    'EPAU': 'architecture urbanisme design urbain habitat logement patrimoine paysage Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¨Ã™Ë†Ã™â€žÃ™Å Ã˜ÂªÃ™Æ’Ã™â€ Ã™Å Ã™Æ’Ã™Å Ã˜Â© Ã™â€¡Ã™â€ Ã˜Â¯Ã˜Â³Ã˜Â© Ã˜ÂªÃ˜Â¹Ã™â€¦Ã™Å Ã˜Â±',
    'ENSSN': 'nanotechnologie nanosciences matÃƒÂ©riaux optique photonique microÃƒÂ©lectronique nanostructures Ã™â€ Ã˜Â§Ã™â€ Ã™Ë†',
    'ENSAS': 'robotique robotics systÃƒÂ¨mes autonomes drones vÃƒÂ©hicules autonomes automation Ã˜Â±Ã™Ë†Ã˜Â¨Ã™Ë†Ã˜Âª Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â·Ã™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜Â£Ã™â€ Ã˜Â¸Ã™â€¦Ã˜Â© Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â³Ã˜ÂªÃ™â€šÃ™â€žÃ˜Â©',
    'ENSTP': 'travaux publics gÃƒÂ©nie civil voirie VRD btp routes ponts barrages infrastructure Ã˜Â£Ã˜Â´Ã˜ÂºÃ˜Â§Ã™â€ž Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â·Ã™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜Â£Ã˜Â´Ã˜ÂºÃ˜Â§Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€¦Ã™Ë†Ã™â€¦Ã™Å Ã˜Â©',
    'ENSH': 'hydraulique ressources en eau irrigation eau potable traitement des eaux barrage Ã˜Â§Ã™â€žÃ˜Â¨Ã™â€žÃ™Å Ã˜Â¯Ã˜Â© Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â·Ã™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ™â€¡Ã™Å Ã˜Â¯Ã˜Â±Ã™Ë†Ã™â€žÃ™Å Ã™Æ’',
    'IGEE': 'gÃƒÂ©nie ÃƒÂ©lectrique ÃƒÂ©lectronique ÃƒÂ©lectrotechnique automatique systÃƒÂ¨mes ÃƒÂ©lectriques ÃƒÂ©nergÃƒÂ©tique Ã˜Â¨Ã™Ë†Ã™â€¦Ã˜Â±Ã˜Â¯Ã˜Â§Ã˜Â³ Ã™Æ’Ã™â€¡Ã˜Â±Ã˜Â¨Ã˜Â§Ã˜Â¡',
    'ENSEE': 'gÃƒÂ©nie ÃƒÂ©lectrique ÃƒÂ©nergie ÃƒÂ©lectrotechnique puissance systÃƒÂ¨mes ÃƒÂ©lectriques Ã™Ë†Ã™â€¡Ã˜Â±Ã˜Â§Ã™â€  Ã™Æ’Ã™â€¡Ã˜Â±Ã˜Â¨Ã˜Â§Ã˜Â¡ Ã˜Â·Ã˜Â§Ã™â€šÃ˜Â©',
    'ESSA': 'sciences appliquÃƒÂ©es multidisciplinaire ingÃƒÂ©nierie Ã˜ÂªÃ™â€žÃ™â€¦Ã˜Â³Ã˜Â§Ã™â€  Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜ÂªÃ˜Â·Ã˜Â¨Ã™Å Ã™â€šÃ™Å Ã˜Â©',
    'HNSRE': 'ÃƒÂ©nergies renouvelables ÃƒÂ©nergie solaire photovoltaÃƒÂ¯que ÃƒÂ©olien hydrogÃƒÂ¨ne transition ÃƒÂ©nergÃƒÂ©tique green energy Ã˜Â¨Ã˜Â§Ã˜ÂªÃ™â€ Ã˜Â© Ã˜Â·Ã˜Â§Ã™â€šÃ˜Â© Ã˜Â´Ã™â€¦Ã˜Â³Ã™Å Ã˜Â© Ã˜Â±Ã™Å Ã˜Â­',
    'AERONAUTIQUE': 'aÃƒÂ©ronautique aerospace aviation pilote avion moteur espace aÃƒÂ©rospatial vol Ã˜Â§Ã™â€žÃ˜Â¨Ã™â€žÃ™Å Ã˜Â¯Ã˜Â© Ã˜Â·Ã™Å Ã˜Â±Ã˜Â§Ã™â€  Ã™â€¦Ã˜Â¯Ã™â€ Ã™Å  Ã˜ÂµÃ™Ë†Ã˜Â§Ã˜Â±Ã™Å Ã˜Â®',
    'ENSC': 'commerce sciences commerciales marketing finance vente gestion Ã™Ë†Ã™â€¡Ã˜Â±Ã˜Â§Ã™â€  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â·Ã™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜ÂªÃ˜Â¬Ã˜Â§Ã˜Â±Ã˜Â©',
    'EHEC': 'hautes ÃƒÂ©tudes commerciales management ÃƒÂ©conomie commerce international entreprise mba Ã˜ÂªÃ™Å Ã˜Â¬Ã™â€žÃ˜Â§Ã˜Â¨Ã™Å Ã™â€  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜ÂªÃ˜Â¬Ã˜Â§Ã˜Â±Ã˜Â©',
    'ESGEN': 'gestion des entreprises entrepreneuriat ÃƒÂ©conomie numÃƒÂ©rique digital business Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜ÂªÃ˜Â³Ã™Å Ã™Å Ã˜Â± Ã™Ë†Ã˜Â§Ã™â€žÃ˜Â§Ã™â€šÃ˜ÂªÃ˜ÂµÃ˜Â§Ã˜Â¯ Ã˜Â§Ã™â€žÃ˜Â±Ã™â€šÃ™â€¦Ã™Å ',
    'ENSSEA': 'statistique ÃƒÂ©conomÃƒÂ©trie dÃƒÂ©mographie actuariat planification prospective Ã˜Â§Ã™â€žÃ™Æ’Ã™Ë†Ã™â€žÃ™Å Ã˜Â§ Ã˜Â¥Ã˜Â­Ã˜ÂµÃ˜Â§Ã˜Â¡ Ã˜Â§Ã™â€šÃ˜ÂªÃ˜ÂµÃ˜Â§Ã˜Â¯ Ã˜ÂªÃ˜Â·Ã˜Â¨Ã™Å Ã™â€šÃ™Å ',
    'ESB': 'banque finance bancaire monnaie crÃƒÂ©dit islamique Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜Â¨Ã™â€ Ã™Ë†Ã™Æ’ Ã˜Â§Ã™â€žÃ˜Â¬Ã˜Â²Ã˜Â§Ã˜Â¦Ã˜Â± Ã˜Â§Ã™â€žÃ˜Â¹Ã˜Â§Ã˜ÂµÃ™â€¦Ã˜Â© Ã˜ÂµÃ™Å Ã˜Â±Ã™ÂÃ˜Â©',
    'ENST': 'tourisme hÃƒÂ´tellerie restauration guide touristique patrimoine voyage Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â·Ã™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜Â³Ã™Å Ã˜Â§Ã˜Â­Ã˜Â©',
    'ESM': 'management gestion leadership entreprise stratÃƒÂ©gie Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ™â€¦Ã˜Â§Ã™â€ Ã˜Â¬Ã™â€¦Ã™Å Ã™â€ Ã˜Âª Ã˜ÂªÃ™â€žÃ™â€¦Ã˜Â³Ã˜Â§Ã™â€  Ã˜Â¥Ã˜Â¯Ã˜Â§Ã˜Â±Ã˜Â©',
    'ESSAIA': 'agroalimentaire nutrition qualitÃƒÂ© alimentaire sÃƒÂ©curitÃƒÂ© alimentaire food science industrie alimentaire Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜Â§Ã™â€žÃ˜Â²Ã˜Â±Ã˜Â§Ã˜Â¹Ã™Å Ã˜Â© Ã™Ë†Ã˜Â§Ã™â€žÃ˜ÂµÃ™â€ Ã˜Â§Ã˜Â¹Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜ÂºÃ˜Â°Ã˜Â§Ã˜Â¦Ã™Å Ã˜Â©',
    'ENSA': 'agronomie agriculture agronome INA zootechnie horticulture Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜Â²Ã˜Â±Ã˜Â§Ã˜Â¹Ã™Å Ã˜Â© Ã™ÂÃ™â€žÃ˜Â§Ã˜Â­Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¬Ã˜Â²Ã˜Â§Ã˜Â¦Ã˜Â±',
    'ENS': 'enseignement professeur pÃƒÂ©dagogie ÃƒÂ©ducation formation des enseignants ÃƒÂ©cole normale supÃƒÂ©rieure Ã™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã˜Â£Ã˜Â³Ã˜Â§Ã˜ÂªÃ˜Â°Ã˜Â© Ã˜Â£Ã˜Â³Ã˜ÂªÃ˜Â§Ã˜Â°',
    'MEDCINE': 'mÃƒÂ©decine gÃƒÂ©nÃƒÂ©rale CHU rÃƒÂ©sidanat mÃƒÂ©decin docteur gÃƒÂ©nÃƒÂ©raliste spÃƒÂ©cialiste Ã˜Â·Ã˜Â¨Ã™Å Ã˜Â¨ Ã˜Â¯Ã™Æ’Ã˜ÂªÃ™Ë†Ã˜Â± Ã™Æ’Ã™â€žÃ™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â·Ã˜Â¨ Ã˜Â­Ã™Æ’Ã™Å Ã™â€¦',
    'MEDCINE-DENTAIRE': 'dentiste chirurgie dentaire orthodontie implant dentaire prothÃƒÂ¨se carie Ã˜Â£Ã˜Â³Ã™â€ Ã˜Â§Ã™â€  Ã˜Â¯Ã™Æ’Ã˜ÂªÃ™Ë†Ã˜Â± Ã˜Â£Ã˜Â³Ã™â€ Ã˜Â§Ã™â€  Ã˜Â·Ã˜Â¨ Ã˜Â§Ã™â€žÃ™ÂÃ™â€¦ Ã™Æ’Ã™â€žÃ™Å Ã˜Â© Ã˜Â·Ã˜Â¨ Ã˜Â§Ã™â€žÃ˜Â£Ã˜Â³Ã™â€ Ã˜Â§Ã™â€ ',
    'PHARMACIE': 'pharmacien mÃƒÂ©dicaments officine pharmacologie biochimie Ã˜Â¯Ã™Ë†Ã˜Â§Ã˜Â¡ Ã˜Â§Ã™â€žÃ˜ÂµÃ™Å Ã˜Â¯Ã™â€žÃ˜Â© Ã˜ÂµÃ™Å Ã˜Â¯Ã™â€žÃ˜Â§Ã™â€ Ã™Å ',
    'PARAMEDICAL': 'infirmier kinÃƒÂ©sithÃƒÂ©rapie laborantin radiologie soins aide soignant Ã˜ÂªÃ™â€¦Ã˜Â±Ã™Å Ã˜Â¶ Ã˜Â¥Ã˜Â³Ã˜Â¹Ã˜Â§Ã™Â Ã˜Â´Ã˜Â¨Ã™â€¡ Ã˜Â·Ã˜Â¨Ã™Å  Ã˜ÂµÃ˜Â­Ã˜Â© Ã˜Â±Ã˜Â¹Ã˜Â§Ã™Å Ã˜Â©',
    'Sage-Femme': 'maÃƒÂ¯eutique accouchement obstÃƒÂ©trique gynÃƒÂ©cologie maternitÃƒÂ© sage femme Ã™â€šÃ˜Â¨Ã˜Â§Ã™â€žÃ˜Â© Ã™Ë†Ã™â€žÃ˜Â§Ã˜Â¯Ã˜Â© Ã˜ÂªÃ™Ë†Ã™â€žÃ™Å Ã˜Â¯ Ã˜Â£Ã™â€¦Ã™Ë†Ã™â€¦Ã˜Â©',
    'PHARMACIE-INDUSTRIELLE': 'industrie pharmaceutique fabrication mÃƒÂ©dicaments biotechnologie pharmaceutique bioproduction Ã˜ÂµÃ™Å Ã˜Â¯Ã™â€žÃ˜Â© Ã˜ÂµÃ™â€ Ã˜Â§Ã˜Â¹Ã™Å Ã˜Â©',
    'vetrinaire': 'vÃƒÂ©tÃƒÂ©rinaire animaux ÃƒÂ©levage zoologie ÃƒÂ©quine bovine aviculture Ã˜Â¨Ã™Å Ã˜Â·Ã˜Â±Ã™Å  Ã˜Â­Ã™Å Ã™Ë†Ã˜Â§Ã™â€ Ã˜Â§Ã˜Âª Ã˜Â·Ã˜Â¨ Ã˜Â¨Ã™Å Ã˜Â·Ã˜Â±Ã™Å ',
    'MED-BIO': 'double cursus biologie mÃƒÂ©dicale biochimie microbiologie biologie molÃƒÂ©culaire Ã™â€¦Ã˜Â²Ã˜Â¯Ã™Ë†Ã˜Â¬ Ã˜ÂªÃ˜Â®Ã˜ÂµÃ˜Âµ Ã™â€¦Ã˜Â²Ã˜Â¯Ã™Ë†Ã˜Â¬',
    'MED-INFO': 'bioinformatique informatique mÃƒÂ©dicale santÃƒÂ© numÃƒÂ©rique health tech double cursus Ã˜Â°Ã™Æ’Ã˜Â§Ã˜Â¡ Ã˜Â§Ã˜ÂµÃ˜Â·Ã™â€ Ã˜Â§Ã˜Â¹Ã™Å  Ã˜Â·Ã˜Â¨Ã™Å ',
    'ESSB': 'biologie biotechnologie microbiologie biochimie biologie cellulaire Ã™Ë†Ã™â€¡Ã˜Â±Ã˜Â§Ã™â€ ',
    'ENSB': 'biotechnologie biologie molÃƒÂ©culaire gÃƒÂ©nie biologique gÃƒÂ©nÃƒÂ©tique fermentation Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â·Ã™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜Â¨Ã™Å Ã™Ë†Ã˜ÂªÃ™Æ’Ã™â€ Ã™Ë†Ã™â€žÃ™Ë†Ã˜Â¬Ã™Å Ã˜Â§',
    'ENSSMAL': 'sciences de la mer biologie marine halieutique pÃƒÂªche oceanographie cÃƒÂ´tier Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â·Ã™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜Â§Ã™â€žÃ˜Â¨Ã˜Â­Ã˜Â±Ã™Å Ã˜Â© Ã˜Â¨Ã˜Â­Ã˜Â±',
    'INFORMATIQUE': 'licence informatique gÃƒÂ©nie logiciel rÃƒÂ©seaux cybersÃƒÂ©curitÃƒÂ© systÃƒÂ¨mes web dÃƒÂ©veloppement programmation code python java',
    'ARCHITECTURE': 'architecture urbanisme design urbain habitat logement patrimoine bÃƒÂ¢timent paysage Ã™â€¡Ã™â€ Ã˜Â¯Ã˜Â³Ã˜Â© Ã™â€¦Ã˜Â¹Ã™â€¦Ã˜Â§Ã˜Â±Ã™Å Ã˜Â©',
    'MATH': 'mathÃƒÂ©matiques mathematics statistiques probabilitÃƒÂ©s analyse algÃƒÂ¨bre mathÃƒÂ©matiques appliquÃƒÂ©es Ã˜Â±Ã™Å Ã˜Â§Ã˜Â¶Ã™Å Ã˜Â§Ã˜Âª',
    'ST': 'sciences technologies ÃƒÂ©lectronique mÃƒÂ©canique chimie gÃƒÂ©nie industriel technologies Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜ÂªÃ™Æ’Ã™â€ Ã™Ë†Ã™â€žÃ™Ë†Ã˜Â¬Ã™Å Ã˜Â§',
    'SM': 'sciences de la matiÃƒÂ¨re physique chimie thermodynamique matÃƒÂ©riaux ÃƒÂ©nergie Ã™ÂÃ™Å Ã˜Â²Ã™Å Ã˜Â§Ã˜Â¡ Ã™Æ’Ã™Å Ã™â€¦Ã™Å Ã˜Â§Ã˜Â¡',
    'BIOLOGIE': 'biologie ÃƒÂ©cologie environnement gÃƒÂ©nÃƒÂ©tique microbiologie zoologie botanique Ã˜Â¨Ã™Å Ã™Ë†Ã™â€žÃ™Ë†Ã˜Â¬Ã™Å Ã˜Â§ Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜Â·Ã˜Â¨Ã™Å Ã˜Â¹Ã™Å Ã˜Â©',
    'HYDROCARBURES': 'pÃƒÂ©trole gaz sonatrach raffinerie exploration gÃƒÂ©ologie pÃƒÂ©troliÃƒÂ¨re ingÃƒÂ©nierie pÃƒÂ©troliÃƒÂ¨re Ã™â€ Ã™ÂÃ˜Â· Ã˜ÂºÃ˜Â§Ã˜Â² Ã˜Â¨Ã˜ÂªÃ˜Â±Ã™Ë†Ã™â€ž Ã™â€¦Ã˜Â­Ã˜Â±Ã™Ë†Ã™â€šÃ˜Â§Ã˜Âª',
    'Optique': 'optique physique photonique instrumentation mÃƒÂ©canique de prÃƒÂ©cision lunettes lasers Ã˜Â¨Ã˜ÂµÃ˜Â±Ã™Å Ã˜Â§Ã˜Âª Ã˜Â¶Ã™Ë†Ã˜Â¡ Ã™â€žÃ™Å Ã˜Â²Ã˜Â±',
    'GP': 'gÃƒÂ©nie des procÃƒÂ©dÃƒÂ©s chimie industrielle gÃƒÂ©nie chimique procÃƒÂ©dÃƒÂ©s industriels Ã™Æ’Ã™Å Ã™â€¦Ã™Å Ã˜Â§Ã˜Â¡ Ã˜ÂµÃ™â€ Ã˜Â§Ã˜Â¹Ã™Å Ã˜Â© Ã™â€¦Ã˜Â¹Ã˜Â§Ã™â€žÃ˜Â¬Ã˜Â©',
    'GI': 'gÃƒÂ©nie industriel production qualitÃƒÂ© ergonomie logistique industrielle maintenance Ã˜ÂµÃ™â€ Ã˜Â§Ã˜Â¹Ã˜Â© Ã˜Â¬Ã™Ë†Ã˜Â¯Ã˜Â© Ã˜Â¥Ã™â€ Ã˜ÂªÃ˜Â§Ã˜Â¬',
    'MARINE': 'marine naval navires offshore port mer navigation maritime Ã™â€¡Ã™â€ Ã˜Â¯Ã˜Â³Ã˜Â© Ã˜Â¨Ã˜Â­Ã˜Â±Ã™Å Ã˜Â© Ã˜Â³Ã™ÂÃ™â€  Ã™â€¦Ã™Å Ã™â€ Ã˜Â§Ã˜Â¡ Ã™â€¦Ã™â€žÃ˜Â§Ã˜Â­Ã˜Â©',
    'GT': 'gÃƒÂ©nie des transports logistique ferroviaire aÃƒÂ©rien portuaire mobilitÃƒÂ© transports Ã˜Â³Ã™Æ’Ã™Æ’ Ã˜Â­Ã˜Â¯Ã™Å Ã˜Â¯Ã™Å Ã˜Â© Ã™â€¦Ã˜Â·Ã˜Â§Ã˜Â±Ã˜Â§Ã˜Âª Ã™â€¦Ã™Ë†Ã˜Â§Ã™â€ Ã˜Â¦',
    'GM': 'mines minÃƒÂ©ralurgie gÃƒÂ©ologie miniÃƒÂ¨re extraction ressources minÃƒÂ©rales Ã™â€¦Ã™â€ Ã˜Â§Ã˜Â¬Ã™â€¦ Ã™â€¦Ã˜Â¹Ã˜Â§Ã˜Â¯Ã™â€  Ã˜ÂªÃ˜Â¹Ã˜Â¯Ã™Å Ã™â€  Ã˜Â¬Ã™Å Ã™Ë†Ã™â€žÃ™Ë†Ã˜Â¬Ã™Å Ã˜Â§',
    'GC': 'gÃƒÂ©nie civil structures bÃƒÂ©ton gÃƒÂ©otechnique VRD routes ponts bÃƒÂ¢timent Ã™â€¡Ã™â€ Ã˜Â¯Ã˜Â³Ã˜Â© Ã™â€¦Ã˜Â¯Ã™â€ Ã™Å Ã˜Â© Ã˜Â¨Ã™â€ Ã˜Â§Ã˜Â¡ Ã˜Â¬Ã˜Â³Ã™Ë†Ã˜Â± Ã˜Â³Ã˜Â¯Ã™Ë†Ã˜Â¯',
    'GMEC': 'gÃƒÂ©nie mÃƒÂ©canique mÃƒÂ©catronique thermodynamique fluides fabrication machines moteurs Ã™â€¡Ã™â€ Ã˜Â¯Ã˜Â³Ã˜Â© Ã™â€¦Ã™Å Ã™Æ’Ã˜Â§Ã™â€ Ã™Å Ã™Æ’Ã™Å Ã˜Â© Ã™â€¦Ã™Å Ã™Æ’Ã˜Â§Ã™â€ Ã™Å Ã™Æ’',
    'DROIT': 'droit civil commercial public avocat notaire juriste magistrat tribunal justice loi Ã˜Â­Ã™â€šÃ™Ë†Ã™â€š Ã™â€¦Ã˜Â­Ã˜Â§Ã™â€¦Ã˜Â§Ã˜Â© Ã™â€šÃ˜Â¶Ã˜Â§Ã˜Â¡ Ã˜Â¹Ã˜Â¯Ã˜Â§Ã™â€žÃ˜Â©',
    'SS': 'psychologie sociologie anthropologie dÃƒÂ©mographie philosophie travail social Ã˜Â¹Ã™â€žÃ™â€¦ Ã™â€ Ã™ÂÃ˜Â³ Ã˜Â¹Ã™â€žÃ™â€¦ Ã˜Â§Ã˜Â¬Ã˜ÂªÃ™â€¦Ã˜Â§Ã˜Â¹ Ã™ÂÃ™â€žÃ˜Â³Ã™ÂÃ˜Â©',
    'TRADUCTION': 'traduction interprÃƒÂ©tation langues linguistique traducteur interprÃƒÂ¨te traduit Ã˜ÂªÃ˜Â±Ã˜Â¬Ã™â€¦Ã˜Â© Ã™ÂÃ™Ë†Ã˜Â±Ã™Å Ã˜Â© Ã˜ÂªÃ˜Â­Ã˜Â±Ã™Å Ã˜Â±Ã™Å Ã˜Â©',
    'COMMU': 'journalisme mÃƒÂ©dias relations publiques communication digitale rÃƒÂ©seaux sociaux presse Ã˜Â¥Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€¦ Ã˜ÂµÃ˜Â­Ã˜Â§Ã™ÂÃ˜Â© Ã˜Â§Ã˜ÂªÃ˜ÂµÃ˜Â§Ã™â€ž',
    'LANGUES': 'franÃƒÂ§ais anglais espagnol allemand arabe langues ÃƒÂ©trangÃƒÂ¨res littÃƒÂ©rature linguistique Ã™ÂÃ˜Â±Ã™â€ Ã˜Â³Ã™Å Ã˜Â© Ã˜Â¥Ã™â€ Ã˜Â¬Ã™â€žÃ™Å Ã˜Â²Ã™Å Ã˜Â© Ã˜Â¥Ã˜Â³Ã˜Â¨Ã˜Â§Ã™â€ Ã™Å Ã˜Â©',
    'CHARIA': 'fiqh hadith coran charia jurisprudence islamique aqida usoul Ã˜Â§Ã™â€žÃ™ÂÃ™â€šÃ™â€¡ Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜Â´Ã˜Â±Ã˜Â¹Ã™Å Ã˜Â© Ã˜Â¥Ã˜Â³Ã™â€žÃ˜Â§Ã™â€¦Ã™Å Ã˜Â© Ã˜Â¯Ã™Å Ã™â€ ',
    'SCIENCES-PO': 'politique diplomatie relations internationales administration publique gouvernance Ã˜Â¯Ã˜Â¨Ã™â€žÃ™Ë†Ã™â€¦Ã˜Â§Ã˜Â³Ã™Å Ã˜Â© Ã˜Â³Ã™Å Ã˜Â§Ã˜Â³Ã˜Â© Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€šÃ˜Â§Ã˜Âª Ã˜Â¯Ã™Ë†Ã™â€žÃ™Å Ã˜Â©',
    'SCIENCES-HUM': 'histoire gÃƒÂ©ographie archÃƒÂ©ologie bibliothÃƒÂ©conomie patrimoine civilisations Ã˜ÂªÃ˜Â§Ã˜Â±Ã™Å Ã˜Â® Ã˜Â¬Ã˜ÂºÃ˜Â±Ã˜Â§Ã™ÂÃ™Å Ã˜Â§ Ã˜Â¢Ã˜Â«Ã˜Â§Ã˜Â± Ã˜ÂªÃ˜Â±Ã˜Â§Ã˜Â«',
    'MED-AI': 'intelligence artificielle mÃƒÂ©dicale santÃƒÂ© numÃƒÂ©rique diagnostic algorithmique imagerie mÃƒÂ©dicale Ã˜Â°Ã™Æ’Ã˜Â§Ã˜Â¡ Ã˜Â·Ã˜Â¨Ã™Å ',
    'MED-GEN': 'gÃƒÂ©nÃƒÂ©tique mÃƒÂ©dicale gÃƒÂ©nomique maladies hÃƒÂ©rÃƒÂ©ditaires conseil gÃƒÂ©nÃƒÂ©tique Ã™Ë†Ã˜Â±Ã˜Â§Ã˜Â«Ã˜Â© Ã˜Â·Ã˜Â¨Ã™Å Ã˜Â© Ã˜Â¬Ã™Å Ã™â€ Ã™Ë†Ã™â€¦',
    'IT-INT': 'interopÃƒÂ©rabilitÃƒÂ© systÃƒÂ¨mes information cloud architecture SI ingÃƒÂ©nierie logicielle Ã˜ÂªÃ˜Â´Ã˜ÂºÃ™Å Ã™â€ž Ã˜Â¨Ã™Å Ã™â€ Ã™Å ',
    'ADDICT': 'addictologie addiction toxicomanie alcool drogues comportement santÃƒÂ© mentale Ã˜Â§Ã™â€žÃ˜Â¥Ã˜Â¯Ã™â€¦Ã˜Â§Ã™â€  Ã™â€¦Ã˜Â®Ã˜Â¯Ã˜Â±Ã˜Â§Ã˜Âª',
    'NLP': 'traitement du langage naturel nlp ia linguistique computationnelle intelligence artificielle Ã™â€žÃ˜ÂºÃ˜Â© Ã˜Â·Ã˜Â¨Ã™Å Ã˜Â¹Ã™Å Ã˜Â©',
    'PREC-MED': 'mÃƒÂ©decine de prÃƒÂ©cision personnalisÃƒÂ©e thÃƒÂ©rapie ciblÃƒÂ©e gÃƒÂ©nomique oncologie Ã˜Â·Ã˜Â¨ Ã˜Â¯Ã™â€šÃ™Å Ã™â€š Ã˜Â´Ã˜Â®Ã˜ÂµÃ™Å ',
    'DENT-HYG': 'hygiÃƒÂ¨ne dentaire soins prÃƒÂ©ventifs prophylaxie dentisterie clinique Ã˜ÂµÃ˜Â­Ã˜Â© Ã˜Â§Ã™â€žÃ™ÂÃ™â€¦',
    'GEN-COUNS': 'conseil gÃƒÂ©nÃƒÂ©tique maladies gÃƒÂ©nÃƒÂ©tiques dÃƒÂ©pistage prÃƒÂ©natal Ã™â€¦Ã˜Â³Ã˜ÂªÃ˜Â´Ã˜Â§Ã˜Â± Ã™Ë†Ã˜Â±Ã˜Â§Ã˜Â«Ã˜Â©',
    'IND-ENTR': 'entrepreneuriat industriel startups innovation industrie management Ã™â€¦Ã™â€šÃ˜Â§Ã™Ë†Ã™â€žÃ˜Â§Ã˜ÂªÃ™Å Ã˜Â© Ã˜Â±Ã™Å Ã˜Â§Ã˜Â¯Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â£Ã˜Â¹Ã™â€¦Ã˜Â§Ã™â€ž',
    'SPACE-TECH': 'espace spatial satellites technologie spatiale aÃƒÂ©rospatial astronomie Ã˜Â§Ã™â€žÃ™ÂÃ˜Â¶Ã˜Â§Ã˜Â¡ Ã˜Â£Ã™â€šÃ™â€¦Ã˜Â§Ã˜Â± Ã˜ÂµÃ™â€ Ã˜Â§Ã˜Â¹Ã™Å Ã˜Â©',
    'DIGITAL-AGRO': 'agriculture numÃƒÂ©rique drones capteurs iot agtech smart farming Ã™â€¡Ã™â€ Ã˜Â¯Ã˜Â³Ã˜Â© Ã˜Â²Ã˜Â±Ã˜Â§Ã˜Â¹Ã™Å Ã˜Â© Ã˜Â±Ã™â€šÃ™â€¦Ã™Å Ã˜Â©',
    'SMART-CITIES': 'villes intelligentes smart city urbanisme numÃƒÂ©rique mobilitÃƒÂ© infrastructure Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã™â€  Ã˜Â§Ã™â€žÃ˜Â°Ã™Æ’Ã™Å Ã˜Â©',
    'MED-INFORMATICS': 'informatique mÃƒÂ©dicale santÃƒÂ© numÃƒÂ©rique tÃƒÂ©lÃƒÂ©mÃƒÂ©decine dossiers mÃƒÂ©dicaux e-santÃƒÂ© Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦Ã˜Â§Ã˜ÂªÃ™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â·Ã˜Â¨Ã™Å Ã˜Â©',
    'QUANTUM': 'physique quantique mÃƒÂ©canique quantique calcul quantique cryptographie Ã™Æ’Ã™â€¦ Ã™Æ’Ã™â€¦Ã™Ë†Ã™â€¦Ã™Å  Ã™ÂÃ™Å Ã˜Â²Ã™Å Ã˜Â§Ã˜Â¡ Ã™Æ’Ã™â€¦Ã™Å Ã˜Â©',
    'kinÃƒÂ©': 'kinÃƒÂ©sithÃƒÂ©rapie rÃƒÂ©ÃƒÂ©ducation physiothÃƒÂ©rapie masseur kinÃƒÂ© rÃƒÂ©ÃƒÂ©ducateur Ã˜Â§Ã™â€žÃ™Æ’Ã™Å Ã™â€ Ã™Å Ã˜Â²Ã™Å Ã˜ÂªÃ™Å Ã˜Â±Ã˜Â§Ã˜Â¨Ã™Å Ã˜Â§ Ã˜Â¹Ã™â€žÃ˜Â§Ã˜Â¬ Ã˜Â·Ã˜Â¨Ã™Å Ã˜Â¹Ã™Å ',
    'labo': 'laboratoire analyses mÃƒÂ©dicales biologie mÃƒÂ©dicale examens cliniques laborantin Ã˜ÂªÃ˜Â­Ã˜Â§Ã™â€žÃ™Å Ã™â€ž Ã™â€¦Ã˜Â®Ã˜Â¨Ã˜Â±Ã™Å Ã˜Â© Ã™â€¦Ã˜Â®Ã˜ÂªÃ˜Â¨Ã˜Â±',
    'radio': 'radiologie imagerie mÃƒÂ©dicale scanner IRM radiographie rayons X Ã˜ÂªÃ˜ÂµÃ™Ë†Ã™Å Ã˜Â± Ã˜Â·Ã˜Â¨Ã™Å  Ã˜Â±Ã˜Â§Ã˜Â¯Ã™Å Ã™Ë† Ã˜Â£Ã˜Â´Ã˜Â¹Ã˜Â©',
    'Appareilleur-OrthopÃƒÂ©diste': 'appareillage orthopÃƒÂ©dique prothÃƒÂ¨se orthÃƒÂ¨se handicap rÃƒÂ©ÃƒÂ©ducation Ã˜Â£Ã˜Â·Ã˜Â±Ã˜Â§Ã™Â Ã˜Â§Ã˜ÂµÃ˜Â·Ã™â€ Ã˜Â§Ã˜Â¹Ã™Å Ã˜Â© Ã™â€¦Ã™â€šÃ™Ë†Ã™â€˜Ã™â€¦ Ã˜Â£Ã˜Â¹Ã˜Â¶Ã˜Â§Ã˜Â¡',
    'AnesthÃƒÂ©sie-RÃƒÂ©animation': 'anesthÃƒÂ©sie rÃƒÂ©animation urgences bloc opÃƒÂ©ratoire soins intensifs Ã˜ÂªÃ˜Â®Ã˜Â¯Ã™Å Ã˜Â± Ã˜Â¥Ã™â€ Ã˜Â¹Ã˜Â§Ã˜Â´',
    'isp': 'infirmier soins infirmiers santÃƒÂ© publique nursing Ã˜ÂªÃ™â€¦Ã˜Â±Ã™Å Ã˜Â¶ Ã˜ÂµÃ˜Â­Ã˜Â© Ã™â€¦Ã™â€¦Ã˜Â±Ã˜Â¶',
    'esp': 'ergothÃƒÂ©rapie occupation thÃƒÂ©rapie rÃƒÂ©ÃƒÂ©ducation fonctionnelle Ã™â€¦Ã˜Â¯Ã˜Â§Ã™Ë†Ã˜Â§Ã˜Â© Ã˜Â¨Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€¦Ã™â€ž',
    'Psychomotricien': 'psychomotricitÃƒÂ© dÃƒÂ©veloppement moteur enfant rÃƒÂ©ÃƒÂ©ducation Ã˜Â­Ã˜Â±Ã™Æ’Ã˜Â© Ã™â€ Ã™ÂÃ˜Â³Ã™Å Ã˜Â© Ã˜Â·Ã™ÂÃ™â€ž',
    'PÃƒÂ©dicure-Podologue': 'pÃƒÂ©dicure podologie soins des pieds Ã™â€šÃ˜Â¯Ã™â€¦ Ã˜Â£Ã˜Â±Ã˜Â¬Ã™â€ž',
    'dental-prosthetist': 'prothÃƒÂ¨se dentaire prothÃƒÂ©siste dentaire laboratoire dentaire cÃƒÂ©ramique Ã˜Â£Ã˜Â³Ã™â€ Ã˜Â§Ã™â€  Ã˜Â§Ã˜ÂµÃ˜Â·Ã™â€ Ã˜Â§Ã˜Â¹Ã™Å Ã˜Â© Ã˜ÂªÃ˜Â±Ã™Æ’Ã™Å Ã˜Â¨Ã˜Â§Ã˜Âª',
    'pharma-prep': 'prÃƒÂ©parateur en pharmacie mÃƒÂ©dicaments ordonnance officine Ã™â€¦Ã˜Â­Ã˜Â¶Ã˜Â± Ã˜ÂµÃ™Å Ã˜Â¯Ã™â€žÃ˜Â§Ã™â€ Ã™Å  Ã˜Â¯Ã™Ë†Ã˜Â§Ã˜Â¡',
    'LAW-POL': 'Ã˜Â­Ã™â€šÃ™Ë†Ã™â€š Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜Â³Ã™Å Ã˜Â§Ã˜Â³Ã™Å Ã˜Â© Ã™â€šÃ˜Â§Ã™â€ Ã™Ë†Ã™â€  Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€šÃ˜Â§Ã˜Âª Ã˜Â¯Ã™Ë†Ã™â€žÃ™Å Ã˜Â© sciences politiques droit',
    'LAW-FIN': 'Ã˜Â­Ã™â€šÃ™Ë†Ã™â€š Ã™â€¦Ã˜Â§Ã™â€žÃ™Å Ã˜Â© Ã™â€¦Ã˜Â­Ã˜Â§Ã˜Â³Ã˜Â¨Ã˜Â© Ã™â€šÃ˜Â§Ã™â€ Ã™Ë†Ã™â€  Ã˜ÂªÃ˜Â¬Ã˜Â§Ã˜Â±Ã™Å  droit finance comptabilitÃƒÂ©',
    'MATH-ECO': 'Ã˜Â±Ã™Å Ã˜Â§Ã˜Â¶Ã™Å Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€šÃ˜ÂªÃ˜ÂµÃ˜Â§Ã˜Â¯ Ã˜Â¥Ã˜Â­Ã˜ÂµÃ˜Â§Ã˜Â¡ Ã™â€ Ã™â€¦Ã˜Â§Ã˜Â°Ã˜Â¬ Ã™â€¦Ã˜Â§Ã™â€žÃ™Å Ã˜Â© mathÃƒÂ©matiques appliquÃƒÂ©es ÃƒÂ©conomie',
    'CS-ECO': 'Ã˜Â¥Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€¦ Ã˜Â¢Ã™â€žÃ™Å  Ã˜Â§Ã™â€šÃ˜ÂªÃ˜ÂµÃ˜Â§Ã˜Â¯ Ã˜ÂªÃ™Æ’Ã™â€ Ã™Ë†Ã™â€žÃ™Ë†Ã˜Â¬Ã™Å Ã˜Â§ Ã™â€¦Ã˜Â§Ã™â€žÃ™Å Ã˜Â© fintech informatique ÃƒÂ©conomie',
    'ARCH-SOC': 'Ã™â€¡Ã™â€ Ã˜Â¯Ã˜Â³Ã˜Â© Ã™â€¦Ã˜Â¹Ã™â€¦Ã˜Â§Ã˜Â±Ã™Å Ã˜Â© Ã˜Â¹Ã™â€žÃ™â€¦ Ã˜Â§Ã˜Â¬Ã˜ÂªÃ™â€¦Ã˜Â§Ã˜Â¹ Ã˜Â­Ã˜Â¶Ã˜Â±Ã™Å  architecture sociologie urbaine',
    'TECH-MEDIA': 'Ã˜Â¥Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€¦ Ã˜Â¢Ã™â€žÃ™Å  Ã˜Â¥Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€¦ Ã˜Â±Ã™â€šÃ™â€¦Ã™Å  Ã˜ÂªÃ™Ë†Ã˜Â§Ã˜ÂµÃ™â€ž tech media communication digitale informatique',
    'ENG-POL': 'Ã˜Â¥Ã™â€ Ã˜Â¬Ã™â€žÃ™Å Ã˜Â²Ã™Å Ã˜Â© Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜Â³Ã™Å Ã˜Â§Ã˜Â³Ã™Å Ã˜Â© Ã˜Â¯Ã˜Â¨Ã™â€žÃ™Ë†Ã™â€¦Ã˜Â§Ã˜Â³Ã™Å Ã˜Â© english political science diplomatie',
    'ECO-MEDIA': 'Ã˜Â§Ã™â€šÃ˜ÂªÃ˜ÂµÃ˜Â§Ã˜Â¯ Ã˜Â¥Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€¦ Ã˜ÂªÃ˜Â³Ã™Ë†Ã™Å Ã™â€š Ã˜ÂµÃ˜Â­Ã˜Â§Ã™ÂÃ˜Â© Ã˜Â§Ã™â€šÃ˜ÂªÃ˜ÂµÃ˜Â§Ã˜Â¯Ã™Å Ã˜Â© marketing journalisme ÃƒÂ©conomique',
    'MEDIA-POL': 'Ã˜Â¥Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€¦ Ã˜Â³Ã™Å Ã˜Â§Ã˜Â³Ã˜Â© Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€šÃ˜Â§Ã˜Âª Ã˜Â¹Ã˜Â§Ã™â€¦Ã˜Â© communication politique relations publiques',
    'SPORTS-MEDIA': 'Ã˜Â¥Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€¦ Ã˜Â±Ã™Å Ã˜Â§Ã˜Â¶Ã˜Â© Ã˜ÂªÃ˜Â¯Ã˜Â±Ã™Å Ã˜Â¨ Ã˜Â±Ã™Å Ã˜Â§Ã˜Â¶Ã™Å  Ã˜ÂµÃ˜Â­Ã˜Â§Ã™ÂÃ˜Â© Ã˜Â±Ã™Å Ã˜Â§Ã˜Â¶Ã™Å Ã˜Â© journalisme sportif',
    'DIGITAL-ENG': 'Ã˜Â¥Ã˜Â¯Ã˜Â§Ã˜Â±Ã˜Â© Ã˜Â±Ã™â€šÃ™â€¦Ã™Å Ã˜Â© Ã˜Â¥Ã™â€ Ã˜Â¬Ã™â€žÃ™Å Ã˜Â²Ã™Å Ã˜Â© Ã™â€¦Ã™â€ Ã˜Â§Ã˜Â¬Ã™â€¦Ã™â€ Ã˜Âª digital administration management english',
    'DIP-LAW': 'Ã™â€šÃ˜Â§Ã™â€ Ã™Ë†Ã™â€  Ã˜Â¯Ã˜Â¨Ã™â€žÃ™Ë†Ã™â€¦Ã˜Â§Ã˜Â³Ã™Å  Ã˜ÂªÃ˜Â¹Ã˜Â§Ã™Ë†Ã™â€  Ã˜Â¯Ã™Ë†Ã™â€žÃ™Å  droit diplomatique coopÃƒÂ©ration internationale',
    'SPORTS-PSYCH': 'Ã˜ÂªÃ˜Â¯Ã˜Â±Ã™Å Ã˜Â¨ Ã˜Â±Ã™Å Ã˜Â§Ã˜Â¶Ã™Å  Ã˜Â¹Ã™â€žÃ™â€¦ Ã™â€ Ã™ÂÃ˜Â³ Ã˜Â±Ã™Å Ã˜Â§Ã˜Â¶Ã™Å  sports psychology high performance',
    'ARCHI-CIVIL': 'Ã™â€¡Ã™â€ Ã˜Â¯Ã˜Â³Ã˜Â© Ã™â€¦Ã˜Â¹Ã™â€¦Ã˜Â§Ã˜Â±Ã™Å Ã˜Â© Ã™â€¡Ã™â€ Ã˜Â¯Ã˜Â³Ã˜Â© Ã™â€¦Ã˜Â¯Ã™â€ Ã™Å Ã˜Â© architectural engineering archi civil',
    'ARCHITECTURE-UNI': 'Ã™â€¡Ã™â€ Ã˜Â¯Ã˜Â³Ã˜Â© Ã™â€¦Ã˜Â¹Ã™â€¦Ã˜Â§Ã˜Â±Ã™Å Ã˜Â© Ã™â€ Ã˜Â¸Ã˜Â§Ã™â€¦ LMD Ã˜Â¬Ã˜Â§Ã™â€¦Ã˜Â¹Ã˜Â© architecture lmd',
    'ENPEI': 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â·Ã™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â­Ã˜Â¶Ã™Å Ã˜Â±Ã™Å Ã˜Â© Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜Â§Ã˜Âª Ã™â€¦Ã™â€¡Ã™â€ Ã˜Â¯Ã˜Â³ Ã˜Â±Ã™Ë†Ã™Å Ã˜Â¨Ã˜Â© enpei rouiba ingÃƒÂ©nierie militaire',
    'ESSG': 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â³Ã™Å Ã™Å Ã˜Â± Ã˜Â¹Ã™â€ Ã˜Â§Ã˜Â¨Ã˜Â© essg annaba management gestion',
    'ESCF': 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ™â€¦Ã˜Â­Ã˜Â§Ã˜Â³Ã˜Â¨Ã˜Â© Ã™Ë†Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Å Ã˜Â© Ã™â€šÃ˜Â³Ã™â€ Ã˜Â·Ã™Å Ã™â€ Ã˜Â© escf constantine finance comptabilitÃƒÂ©',
    'ESE': 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜Â§Ã™â€šÃ˜ÂªÃ˜ÂµÃ˜Â§Ã˜Â¯ Ã™Ë†Ã™â€¡Ã˜Â±Ã˜Â§Ã™â€  ese oran economie',
    'ENSM': 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â·Ã™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ™â€¦Ã™â€ Ã˜Â§Ã˜Â¬Ã™â€¦ Ã™Ë†Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¹Ã˜Â§Ã˜Â¯Ã™â€  Ã˜Â¹Ã™â€ Ã˜Â§Ã˜Â¨Ã˜Â© ensm annaba mines mÃƒÂ©tallurgie',
    'ENSTA': 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â·Ã™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§ Ã™â€žÃ™â€žÃ˜ÂªÃ™Æ’Ã™â€ Ã™Ë†Ã™â€žÃ™Ë†Ã˜Â¬Ã™Å Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ™â€¦Ã˜ÂªÃ™â€šÃ˜Â¯Ã™â€¦Ã˜Â© Ã™Ë†Ã™â€¡Ã˜Â±Ã˜Â§Ã™â€  ensta oran technologies avancÃƒÂ©es',
    'MED-ECO': 'Ã˜Â·Ã˜Â¨ Ã™Ë†Ã˜Â§Ã™â€šÃ˜ÂªÃ˜ÂµÃ˜Â§Ã˜Â¯ Ã˜Â§Ã™â€šÃ˜ÂªÃ˜ÂµÃ˜Â§Ã˜Â¯ Ã˜ÂµÃ˜Â­Ã™Å  mÃƒÂ©decine ÃƒÂ©conomie santÃƒÂ© publique management de la santÃƒÂ©',
    'INFO-AUTO': 'Ã˜Â¥Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€¦ Ã˜Â¢Ã™â€žÃ™Å  Ã™Ë†Ã˜Â¢Ã™â€žÃ™Å Ã˜Â© Ã˜Â°Ã™Æ’Ã˜Â§Ã˜Â¡ Ã˜Â§Ã˜ÂµÃ˜Â·Ã™â€ Ã˜Â§Ã˜Â¹Ã™Å  Ã˜Â³Ã™Å Ã˜Â§Ã˜Â±Ã˜Â§Ã˜Âª Ã˜Â°Ã˜Â§Ã˜ÂªÃ™Å Ã˜Â© Ã˜Â§Ã™â€žÃ™â€šÃ™Å Ã˜Â§Ã˜Â¯Ã˜Â© informatique automatique vÃƒÂ©hicules autonomes',
    'LANG-FIN': 'Ã™â€žÃ˜ÂºÃ˜Â§Ã˜Âª Ã˜Â£Ã˜Â¬Ã™â€ Ã˜Â¨Ã™Å Ã˜Â© Ã™Ë†Ã™â€¦Ã˜Â§Ã™â€žÃ™Å Ã˜Â© Ã™â€žÃ˜ÂºÃ˜Â§Ã˜Âª Ã˜ÂªÃ˜Â·Ã˜Â¨Ã™Å Ã™â€šÃ™Å Ã˜Â© Ã™â€¦Ã˜Â§Ã™â€žÃ™Å Ã˜Â© langues ÃƒÂ©trangÃƒÂ¨res finance traduction financiÃƒÂ¨re',
    'INFO-GEST': 'Ã˜Â¥Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€¦ Ã˜Â¢Ã™â€žÃ™Å  Ã™Ë†Ã˜ÂªÃ˜Â³Ã™Å Ã™Å Ã˜Â± Ã˜Â£Ã™â€ Ã˜Â¸Ã™â€¦Ã˜Â© Ã™â€¦Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦Ã˜Â§Ã˜Âª informatique gestion systÃƒÂ¨mes d\'information',
    'MGMT-ENG': 'Ã˜Â¥Ã˜Â¯Ã˜Â§Ã˜Â±Ã˜Â© Ã˜Â£Ã˜Â¹Ã™â€¦Ã˜Â§Ã™â€ž Ã™Ë†Ã™â€¡Ã™â€ Ã˜Â¯Ã˜Â³Ã˜Â© management ingÃƒÂ©nierie',
    'DROIT-INFO': 'Ã˜Â­Ã™â€šÃ™Ë†Ã™â€š Ã™Ë†Ã˜Â¥Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€¦ Ã˜Â¢Ã™â€žÃ™Å  Ã™â€šÃ˜Â§Ã™â€ Ã™Ë†Ã™â€  Ã˜Â±Ã™â€šÃ™â€¦Ã™Å  droit informatique cyberdroit',
    'MED-PSY': 'Ã˜Â·Ã˜Â¨ Ã™Ë†Ã˜Â¹Ã™â€žÃ™â€¦ Ã™â€ Ã™ÂÃ˜Â³ Ã˜Â§Ã™â€žÃ˜Â·Ã˜Â¨ Ã˜Â§Ã™â€žÃ™â€ Ã™ÂÃ˜Â³Ã™Å  mÃƒÂ©decine psychologie psychiatrie',
    'GEOLOGIE': 'Ã˜Â¬Ã™Å Ã™Ë†Ã™â€žÃ™Ë†Ã˜Â¬Ã™Å Ã˜Â§ gÃƒÂ©ologie Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜Â§Ã™â€žÃ˜Â£Ã˜Â±Ã˜Â¶',
    'GEOGRAPHIE': 'Ã˜Â¬Ã˜ÂºÃ˜Â±Ã˜Â§Ã™ÂÃ™Å Ã˜Â§ gÃƒÂ©ographie',
    'AGRONOMIE': 'Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜Â²Ã˜Â±Ã˜Â§Ã˜Â¹Ã™Å Ã˜Â© agronomique sciences agronomiques',
    'AGROALIMENTAIRE': 'Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜ÂºÃ˜Â°Ã˜Â§Ã˜Â¡ Ã˜ÂªÃ˜ÂºÃ˜Â°Ã™Å Ã˜Â© sciences alimentaires',
    'SOCIALES': 'Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜Â§Ã˜Â¬Ã˜ÂªÃ™â€¦Ã˜Â§Ã˜Â¹Ã™Å Ã˜Â© sciences sociales',
    'ARCHEOLOGIE': 'Ã˜Â¹Ã™â€žÃ™â€¦ Ã˜Â§Ã™â€žÃ˜Â¢Ã˜Â«Ã˜Â§Ã˜Â± archÃƒÂ©ologie',
    'LOISIR': 'Ã˜Â¹Ã™â€žÃ™â€¦ Ã˜Â§Ã™â€žÃ˜Â§Ã˜Â¬Ã˜ÂªÃ™â€¦Ã˜Â§Ã˜Â¹ Ã˜Â³Ã™Å Ã˜Â§Ã˜Â­Ã˜Â© Ã˜Â±Ã™ÂÃ˜Â§Ã™â€¡Ã™Å Ã˜Â© sociologie du loisir',
    'STAPS': 'Ã˜Â±Ã™Å Ã˜Â§Ã˜Â¶Ã˜Â© Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦ Ã˜ÂªÃ™â€šÃ™â€ Ã™Å Ã˜Â§Ã˜Âª Ã˜Â£Ã™â€ Ã˜Â´Ã˜Â·Ã˜Â© Ã˜Â¨Ã˜Â¯Ã™â€ Ã™Å Ã˜Â© staps sports',
    'ARTS': 'Ã™ÂÃ™â€ Ã™Ë†Ã™â€  Ã˜ÂªÃ˜Â´Ã™Æ’Ã™Å Ã™â€žÃ™Å Ã˜Â© arts plastiques',
    'CINEMA': 'Ã˜Â³Ã™Å Ã™â€ Ã™â€¦Ã˜Â§ cinÃƒÂ©ma arts du spectacle',
    'ARABE': 'Ã™â€žÃ˜ÂºÃ˜Â© Ã™Ë†Ã˜Â£Ã˜Â¯Ã˜Â¨ Ã˜Â¹Ã˜Â±Ã˜Â¨Ã™Å  langue littÃƒÂ©rature arabes',
    'TAMAZIGHT': 'Ã™â€žÃ˜ÂºÃ˜Â© Ã™Ë†Ã˜Â«Ã™â€šÃ˜Â§Ã™ÂÃ˜Â© Ã˜Â£Ã™â€¦Ã˜Â§Ã˜Â²Ã™Å Ã˜ÂºÃ™Å Ã˜Â© tamazight berbÃƒÂ¨re tamazighte',
};

(function initSpecFilter() {
    var ready = false;

    function normalize(s) {
        return (s || '').toLowerCase()
            .replace(/[Ã˜Â£Ã˜Â¥Ã˜Â¢Ã™Â±]/g, 'Ã˜Â§')
            .replace(/Ã˜Â©/g, 'Ã™â€¡')
            .replace(/Ã™â€°/g, 'Ã™Å ')
            .replace(/[Ã™â€¹-Ã™Å¸Ã™Â°]/g, '')
            .trim();
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
        var activeNew = false;
        var searchText = '';

        function applyFilters() {
            var normQ = normalize(searchText);
            var words = normQ.split(/\s+/).filter(Boolean);
            var visible = 0;
            cards.forEach(function (card) {
                var cat = card.dataset.category || '';
                var isNew = card.dataset.new === 'true';
                var matchCat = activeCategory === 'all' || cat === activeCategory;
                var matchNew = !activeNew || isNew;
                var matchSearch = true;
                if (words.length) {
                    var onclick = card.getAttribute('onclick') || '';
                    var m = onclick.match(/showSection\(['"]([^'"]+)['"]\)/);
                    var sid = m ? m[1] : '';
                    var haystack = normalize((card.dataset.name || '') + ' ' + (SPEC_KEYWORDS[sid] || ''));
                    matchSearch = words.every(function (w) { return haystack.indexOf(w) !== -1; });
                }
                card.style.display = (matchCat && matchNew && matchSearch) ? '' : 'none';
                if (matchCat && matchNew && matchSearch) visible++;
            });
            if (emptyState) {
                emptyState.style.display = visible === 0 ? 'block' : 'none';
            }
        }

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
                }
                applyFilters();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                searchText = searchInput.value.trim();
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

// Ã¢â€â‚¬Ã¢â€â‚¬ School Detail Tabs Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
var TAB_KEYWORDS = {
    intro: ['Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â¹Ã˜Â±Ã™Å Ã™Â Ã˜Â¨', 'Ã˜ÂªÃ˜Â¹Ã˜Â±Ã™Å Ã™Â Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â®Ã˜ÂµÃ˜Âµ', 'Ã˜ÂªÃ˜Â¹Ã˜Â±Ã™Å Ã™Â Ã™â€¦Ã˜Â®Ã˜ÂªÃ˜ÂµÃ˜Â±', 'Ã™â€¦Ã˜Â§ Ã™â€¡Ã™Ë†', 'Ã™â€¦Ã˜Â§Ã™â€¡Ã™Ë†', 'Ã™Ë†Ã˜Â§Ã˜Â´ Ã™â€¡Ã™Ë†', 'Ã™â€¡Ã™â€ž Ã™â€¡Ã™Ë† Ã˜ÂªÃ˜Â®Ã˜ÂµÃ˜Âµ', 'Ã˜Â¨Ã™â€¦Ã™â€  Ã™Å Ã˜Â¹Ã˜ÂªÃ™â€ Ã™Å ', 'Ã˜Â¥Ã™â€ Ã˜Â³Ã˜Â§Ã™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ™â€¦Ã™â€¡Ã™â€ Ã˜Â©', 'Ã™â€žÃ™â€¦Ã˜Â§Ã˜Â°Ã˜Â§ Ã™â€¡Ã˜Â°Ã˜Â§ Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â®Ã˜ÂµÃ˜Âµ', 'Ã™Ë†Ã˜Â§Ã˜Â´ Ã™Å Ã˜Â¯Ã™Å Ã˜Â±', 'Ã™Ë†Ã˜Â§Ã˜Â´ Ã˜ÂªÃ˜Â®Ã˜Â¯Ã™â€¦', 'Ã˜Â§Ã™â€žÃ™â€¦Ã™â€¡Ã˜Â§Ã™â€¦ Ã˜Â§Ã™â€žÃ™Å Ã™Ë†Ã™â€¦Ã™Å Ã˜Â©', 'Ã˜Â§Ã™â€žÃ™â€¦Ã™â€¡Ã™â€¦Ã˜Â§Ã˜Âª Ã™Ë†Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¬Ã˜Â§Ã™â€žÃ˜Â§Ã˜Âª', 'Ã™â€¦Ã™â€¡Ã˜Â§Ã™â€¦Ã™â€¡', 'Ã°Å¸â€™Â» Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â¹Ã˜Â±Ã™Å Ã™Â', 'Ã°Å¸Â©Âº Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â§Ã™â€žÃ˜Â§Ã˜Âª', 'Ã™â€žÃ˜ÂºÃ˜Â© Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜Â©', 'Ã™â€žÃ˜ÂºÃ˜Â© Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â¯Ã˜Â±Ã™Å Ã˜Â³', 'Ã˜ÂªÃ˜Â®Ã˜ÂµÃ˜Âµ Ã˜Â¬Ã˜Â¯Ã™Å Ã˜Â¯', 'Ã˜Â§Ã™â€žÃ˜Â¬Ã˜Â§Ã™â€¦Ã˜Â¹Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜ÂªÃ™Å ', 'Ã˜Â§Ã™â€žÃ˜Â¬Ã˜Â§Ã™â€¦Ã˜Â¹Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ™â€¦Ã˜ÂªÃ™Ë†Ã™ÂÃ˜Â±Ã˜Â©', 'Ã˜Â§Ã™â€žÃ™Æ’Ã™â€žÃ™Å Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ™â€¦Ã˜ÂªÃ™Ë†Ã™ÂÃ˜Â±Ã˜Â©', 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â§Ã˜Â±Ã˜Â³ Ã˜Â§Ã™â€žÃ™â€¦Ã˜ÂªÃ™Ë†Ã™ÂÃ˜Â±Ã˜Â©', 'Ã™Ë†Ã™Å Ã™â€  Ã˜ÂªÃ™â€šÃ˜Â±Ã˜Â§', 'Ã˜Â£Ã™Å Ã™â€  Ã™Å Ã™â€¦Ã™Æ’Ã™â€  Ã˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜ÂªÃ™â€¡', 'Ã˜Â£Ã™Å Ã™â€  Ã™Å Ã™ÂÃ˜Â¯Ã˜Â±Ã™â€˜Ã˜Â³', 'Ã˜Â£Ã™â€¦Ã˜Â§Ã™Æ’Ã™â€  Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜Â©', 'Ã˜Â§Ã™â€žÃ™â€¦Ã™Ë†Ã™â€šÃ˜Â¹'],
    admission: ['Ã™â€¦Ã˜Â¹Ã˜Â¯Ã™â€žÃ˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ™â€šÃ˜Â¨Ã™Ë†Ã™â€ž', 'Ã™â€¦Ã˜Â¹Ã˜Â¯Ã™â€ž Ã˜Â§Ã™â€žÃ™â€šÃ˜Â¨Ã™Ë†Ã™â€ž', 'Ã˜Â´Ã˜Â±Ã™Ë†Ã˜Â· Ã˜Â§Ã™â€žÃ™â€šÃ˜Â¨Ã™Ë†Ã™â€ž', 'Ã˜Â´Ã˜Â±Ã™Ë†Ã˜Â· Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â®Ã™Ë†Ã™â€ž', 'Ã˜Â´Ã˜Â±Ã™Ë†Ã˜Â· Ã˜Â§Ã™â€žÃ˜Â§Ã™â€žÃ˜ÂªÃ˜Â­Ã˜Â§Ã™â€š', 'Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â³Ã˜Â¬Ã™Å Ã™â€ž Ã™Ë†Ã˜Â§Ã™â€žÃ™â€šÃ˜Â¨Ã™Ë†Ã™â€ž', 'Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â³Ã˜Â¬Ã™Å Ã™â€ž', 'Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â¹Ã˜Â¨ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â³Ã™â€¦Ã™Ë†Ã˜Â­', 'Ã™Æ’Ã™Å Ã™Â Ã˜ÂªÃ™â€žÃ˜ÂªÃ˜Â­Ã™â€š', 'Ã™Æ’Ã™Å Ã™ÂÃ˜Â§Ã˜Â´ Ã˜ÂªÃ™â€žÃ˜ÂªÃ˜Â­Ã™â€š', 'Ã˜ÂªÃ˜Â³Ã˜Â¬Ã™Å Ã™â€žÃ˜Â§Ã˜Âª', 'Ã˜Â§Ã™â€žÃ™Ë†Ã™â€žÃ™Ë†Ã˜Â¬ Ã˜Â¥Ã™â€žÃ™â€°', 'Ã™Æ’Ã™Å Ã™Â Ã™Å Ã˜ÂªÃ™â€¦ Ã˜Â§Ã™â€žÃ˜ÂªÃ™Ë†Ã˜Â¬Ã™Å Ã™â€¡', 'Ã˜Â£Ã™Å Ã™â€  Ã™Å Ã™â€¦Ã™Æ’Ã™â€  Ã˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜ÂªÃ™â€¡', 'Ã˜Â£Ã™Å Ã™â€  Ã™Å Ã™ÂÃ˜Â¯Ã˜Â±Ã™â€˜Ã˜Â³', 'Ã˜Â£Ã™â€¦Ã˜Â§Ã™Æ’Ã™â€  Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜Â©'],
    curriculum: ['Ã˜Â§Ã™â€žÃ™â€¦Ã™Ë†Ã˜Â§Ã˜Â¯ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã™Ë†Ã˜Â³Ã˜Â©', 'Ã˜Â§Ã™â€žÃ™â€¦Ã™Ë†Ã˜Â§Ã˜Â¯ Ã˜Â§Ã™â€žÃ˜Â£Ã˜Â³Ã˜Â§Ã˜Â³Ã™Å Ã˜Â©', 'Ã˜Â§Ã™â€žÃ™â€¦Ã™Ë†Ã˜Â§Ã˜Â¯ Ã™ÂÃ™Å ', 'Ã˜Â§Ã™â€žÃ™â€¦Ã™Ë†Ã˜Â§Ã˜Â¯ Ã™Ë†Ã˜Â§Ã™â€žÃ˜ÂªÃ™Æ’Ã™Ë†Ã™Å Ã™â€ ', 'Ã™â€¦Ã™Ë†Ã˜Â§Ã˜Â¯ Ã˜ÂªÃ™â€šÃ˜Â±Ã˜Â§Ã™â€¡Ã˜Â§', 'Ã˜Â§Ã™â€žÃ˜Â¨Ã˜Â±Ã™â€ Ã˜Â§Ã™â€¦Ã˜Â¬ Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã™Å ', 'Ã™â€¦Ã˜Â³Ã˜Â§Ã˜Â± Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜Â©', 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â³Ã˜Â§Ã˜Â± Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã™Å ', 'Ã™â€¦Ã˜Â¯Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜Â©', 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â© Ã™Ë†Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¹Ã˜Â§Ã™â€¡Ã˜Â¯', 'Ã˜Â·Ã˜Â±Ã™Å Ã™â€šÃ˜Â© Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜Â©', 'Ã™Æ’Ã™Å Ã™ÂÃ˜Â§Ã˜Â´ Ã˜ÂªÃ™â€šÃ˜Â±Ã˜Â§', 'Ã˜ÂªÃ™â€ Ã˜Â¸Ã™Å Ã™â€¦ Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜Â©', 'Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜Â© Ã™Ë†Ã˜Â§Ã™â€žÃ™â€ Ã˜Â¸Ã˜Â§Ã™â€¦', 'Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â±Ã˜Â¨Ã˜ÂµÃ˜Â§Ã˜Âª', 'Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â¯Ã˜Â±Ã™Å Ã˜Â¨ Ã˜Â§Ã™â€žÃ™â€¦Ã™Å Ã˜Â¯Ã˜Â§Ã™â€ Ã™Å ', 'Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â·Ã˜Â¨Ã™Å Ã™â€š Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€¦Ã™â€žÃ™Å ', 'Ã˜Â·Ã™Ë†Ã˜Â± Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã˜Â³Ã˜ÂªÃ˜Â±', 'Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â®Ã˜ÂµÃ˜ÂµÃ˜Â§Ã˜Âª Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã˜Â³Ã˜ÂªÃ˜Â±', 'Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â®Ã˜ÂµÃ˜ÂµÃ˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ™â€¦Ã˜ÂªÃ™Ë†Ã™ÂÃ˜Â±Ã˜Â© Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã˜Â³Ã˜ÂªÃ˜Â±', 'Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â®Ã˜ÂµÃ˜ÂµÃ˜Â§Ã˜Âª Ã˜Â¨Ã˜Â¹Ã˜Â¯ Ã˜Â§Ã™â€žÃ™â€žÃ™Å Ã˜Â³Ã˜Â§Ã™â€ Ã˜Â³', 'Ã˜ÂªÃ˜Â®Ã˜ÂµÃ˜ÂµÃ˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã˜Â³Ã˜ÂªÃ˜Â±', 'Ã˜Â¯Ã™Ë†Ã˜Â±Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™Å Ã˜Â§', 'Ã˜Â§Ã™â€žÃ™â€¦Ã™â€šÃ˜Â§Ã™Å Ã™Å Ã˜Â³ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã™Ë†Ã˜Â³Ã˜Â©', 'Ã˜Â§Ã™â€žÃ˜Â³Ã™â€ Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â£Ã™Ë†Ã™â€žÃ™â€°', 'Ã™â€ Ã˜Â¸Ã˜Â§Ã™â€¦ Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜Â©', 'Ã˜Â§Ã™â€žÃ™â€ Ã˜Â¸Ã˜Â§Ã™â€¦ Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã™Å ', 'Ã™â€ Ã˜Â¸Ã˜Â§Ã™â€¦ Ã˜Â§Ã™â€žÃ˜Â§Ã˜Â®Ã˜ÂªÃ˜Â¨Ã˜Â§Ã˜Â±Ã˜Â§Ã˜Âª', 'Ã™â€ Ã˜Â¸Ã˜Â§Ã™â€¦ Ã˜Â§Ã™â€žÃ˜ÂªÃ™â€šÃ™Å Ã™Å Ã™â€¦', 'Ã˜ÂµÃ˜Â¹Ã™Ë†Ã˜Â¨Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜Â©', 'Ã˜ÂµÃ˜Â¹Ã™Ë†Ã˜Â¨Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â®Ã˜ÂµÃ˜Âµ', 'Ã˜ÂµÃ˜Â¹Ã™Ë†Ã˜Â¨Ã˜Â© Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â®Ã˜ÂµÃ˜Âµ', 'Ã™â€¡Ã™â€ž Ã˜ÂªÃ™Ë†Ã˜Â¬Ã˜Â¯ Ã™â€¦Ã˜Â´Ã˜Â§Ã˜Â±Ã™Å Ã˜Â¹', 'Ã™â€¦Ã˜Â³Ã˜ÂªÃ™Ë†Ã™â€° Ã˜Â§Ã™â€žÃ˜Â¯Ã™Æ’Ã˜Â§Ã˜ÂªÃ˜Â±Ã˜Â©', 'Ã˜Â§Ã™â€žÃ™ÂÃ˜Â±Ã™â€š Ã˜Â¨Ã™Å Ã™â€ Ã™â€¡Ã˜Â§', 'Ã˜Â§Ã™â€žÃ™ÂÃ˜Â±Ã™â€š Ã˜Â¨Ã™Å Ã™â€ ', 'Ã˜Â§Ã™â€žÃ™ÂÃ˜Â±Ã™â€š Ã™â€¦Ã˜Â¹', 'Ã™â€ Ã˜Â¸Ã˜Â§Ã™â€¦ LMD', 'Ã™â€ Ã˜Â¸Ã˜Â§Ã™â€¦ IngÃƒÂ©nieur', 'Ã™â€ Ã˜Â¸Ã˜Â§Ã™â€¦ Ã˜Â§Ã™â€žÃ˜Â¥Ã™â€ Ã˜ÂªÃ™â€šÃ˜Â§Ã™â€ž', 'Ã˜Â§Ã™â€žÃ˜Â¨Ã˜Â­Ã˜Â« Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™â€¦Ã™Å ', 'Ã˜Â¨Ã™Å Ã˜Â¦Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¨Ã˜Â­Ã˜Â«', 'Ã˜ÂªÃ˜Â§Ã˜Â¨Ã˜Â¹ Ã™â€žÃ˜Â£Ã™Å '],
    career: ['Ã™ÂÃ˜Â±Ã˜Âµ Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€¦Ã™â€ž', 'Ã˜Â¢Ã™ÂÃ˜Â§Ã™â€š Ã˜Â§Ã™â€žÃ˜ÂªÃ™Ë†Ã˜Â¸Ã™Å Ã™Â', 'Ã˜Â¢Ã™ÂÃ˜Â§Ã™â€š Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€¦Ã™â€ž', 'Ã™â€¦Ã˜Â¬Ã˜Â§Ã™â€žÃ˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜ÂªÃ™Ë†Ã˜Â¸Ã™Å Ã™Â', 'Ã˜Â¨Ã˜Â¹Ã˜Â¯ Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â®Ã˜Â±Ã˜Â¬', 'Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€¦Ã™â€ž Ã˜Â¨Ã˜Â¹Ã˜Â¯', 'Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€¦Ã™â€ž Ã™ÂÃ™Å ', 'Ã˜Â§Ã™â€žÃ˜Â±Ã˜Â§Ã˜ÂªÃ˜Â¨', 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â³Ã˜ÂªÃ™â€šÃ˜Â¨Ã™â€ž Ã˜Â§Ã™â€žÃ™â€¦Ã™â€¡Ã™â€ Ã™Å ', 'Ã™Ë†Ã™Å Ã™â€  Ã˜ÂªÃ˜Â®Ã˜Â¯Ã™â€¦', 'Ã™Ë†Ã™Å Ã™â€  Ã™Å Ã˜Â®Ã˜Â¯Ã™â€¦', 'Ã™Ë†Ã™Å Ã™â€  Ã™Å Ã™â€šÃ˜Â¯Ã˜Â± Ã™Å Ã˜Â®Ã˜Â¯Ã™â€¦', 'Ã˜Â¢Ã™ÂÃ˜Â§Ã™â€š Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â±Ã™â€šÃ™Å Ã˜Â©', 'Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â±Ã™â€šÃ™Å Ã˜Â§Ã˜Âª', 'Ã˜Â³Ã™â€žÃ™â€¦ Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â±Ã™â€šÃ™Å Ã˜Â©', 'Ã˜Â³Ã™â€žÃ™â€¦ Ã˜Â§Ã™â€žÃ˜Â±Ã˜ÂªÃ˜Â¨', 'Ã™ÂÃ˜Â±Ã˜Âµ Ã˜Â§Ã™â€žÃ˜ÂªÃ™Æ’Ã™Ë†Ã™Å Ã™â€  Ã˜Â§Ã™â€žÃ˜Â¥Ã˜Â¶Ã˜Â§Ã™ÂÃ™Å ', 'Ã˜Â§Ã™â€žÃ˜ÂªÃ™Ë†Ã˜Â¸Ã™Å Ã™Â', 'Ã™â€¦Ã˜Â¬Ã˜Â§Ã™â€žÃ˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€¦Ã™â€ž'],
    pros: ['Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â²Ã˜Â§Ã™Å Ã˜Â§', 'Ã˜Â§Ã™â€žÃ˜Â¹Ã™Å Ã™Ë†Ã˜Â¨', 'Ã˜Â§Ã™â€žÃ˜Â¥Ã™Å Ã˜Â¬Ã˜Â§Ã˜Â¨Ã™Å Ã˜Â§Ã˜Âª', 'Ã˜Â§Ã™â€žÃ˜Â³Ã™â€žÃ˜Â¨Ã™Å Ã˜Â§Ã˜Âª', 'Ã™â€¦Ã™â€¦Ã™Å Ã˜Â²Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â®Ã˜ÂµÃ˜Âµ', 'Ã™â€¦Ã™â€¦Ã™Å Ã˜Â²Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â©', 'Ã˜Â£Ã™â€¡Ã™â€¦ Ã™â€¦Ã™â€¦Ã™Å Ã˜Â²Ã˜Â§Ã˜ÂªÃ™â€¡', 'Ã˜Â³Ã™â€žÃ˜Â¨Ã™Å Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â®Ã˜ÂµÃ˜Âµ', 'Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â§Ã˜Âª', 'Ã˜Â§Ã™â€žÃ˜Â§Ã™â€¦Ã˜ÂªÃ™Å Ã˜Â§Ã˜Â²Ã˜Â§Ã˜Âª', 'Ã˜Â¥Ã™Å Ã˜Â¬Ã˜Â§Ã˜Â¨Ã™Å Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â®Ã˜ÂµÃ˜Âµ', 'Ã˜Â§Ã™â€žÃ˜Â¥Ã™Å Ã˜Â¬Ã˜Â§Ã˜Â¨Ã™Å Ã˜Â§Ã˜Âª Ã™Ë†Ã˜Â§Ã™â€žÃ˜Â³Ã™â€žÃ˜Â¨Ã™Å Ã˜Â§Ã˜Âª', 'Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â§Ã™â€žÃ™Å Ã˜Â©', 'Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â¶Ã˜Â¹ Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â§Ã™â€žÃ™Å ', 'Ã˜Â§Ã™â€žÃ™â€¦Ã™â€¦Ã™Å Ã˜Â²Ã˜Â§Ã˜Âª', 'Ã˜Â§Ã™â€žÃ˜Â³Ã™â€žÃ˜Â¨Ã™Å Ã˜Â§Ã˜Âª Ã™Ë†Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â§Ã˜Âª'],
    student: ['Ã˜Â§Ã™â€žÃ™â€ Ã™Ë†Ã˜Â§Ã˜Â¯Ã™Å  Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€žÃ™â€¦Ã™Å Ã˜Â©', 'Ã™ÂÃ˜Â§Ã˜Â¦Ã˜Â¯Ã˜Â© Ã˜Â§Ã™â€žÃ™â€ Ã™Ë†Ã˜Â§Ã˜Â¯Ã™Å ', 'Ã˜Â§Ã™â€žÃ˜Â¥Ã™â€šÃ˜Â§Ã™â€¦Ã˜Â©', 'Ã˜Â¢Ã˜Â±Ã˜Â§Ã˜Â¡ Ã˜Â§Ã™â€žÃ˜Â·Ã™â€žÃ˜Â¨Ã˜Â©', 'Ã˜Â¢Ã˜Â±Ã˜Â§Ã˜Â¡ Ã˜Â¨Ã˜Â¹Ã˜Â¶ Ã˜Â§Ã™â€žÃ˜Â·Ã™â€žÃ˜Â¨Ã˜Â©', 'Ã˜Â±Ã˜Â£Ã™Å  Ã˜Â§Ã™â€žÃ˜Â·Ã™â€žÃ˜Â¨Ã˜Â©', 'Ã˜Â´Ã™â€¡Ã˜Â§Ã˜Â¯Ã˜Â© Ã˜Â·Ã˜Â§Ã™â€žÃ˜Â¨', 'Ã™â€¦Ã˜Â²Ã˜Â§Ã™Å Ã˜Â§ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã˜Â³Ã˜Â©'],
    tips: ['Ã™â€ Ã˜ÂµÃ˜Â§Ã˜Â¦Ã˜Â­', 'Ã™â€ Ã˜ÂµÃ™Å Ã˜Â­Ã˜Â©', 'Ã˜Â®Ã™â€žÃ˜Â§Ã˜ÂµÃ˜Â©', 'Ã™Æ’Ã™â€žÃ™â€¦Ã˜Â© Ã˜Â£Ã˜Â®Ã™Å Ã˜Â±Ã˜Â©', 'Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ˜Â®Ã™â€žÃ˜Â§Ã˜ÂµÃ˜Â©', 'Ã˜Â¹Ã™â€žÃ˜Â§Ã˜Â´ Ã˜ÂªÃ˜Â®Ã˜ÂªÃ˜Â§Ã˜Â±', 'Ã˜Â¹Ã™â€žÃ˜Â§Ã™â€¡ Ã™â€¦Ã™â€  Ã˜Â£Ã™ÂÃ˜Â¶Ã™â€ž', 'Ã™Ë†Ã˜Â§Ã˜Â´ Ã™â€žÃ˜Â§Ã˜Â²Ã™â€¦ Ã˜ÂªÃ˜Â¹Ã˜Â±Ã™Â', 'Ã™Ë†Ã˜Â§Ã˜Â´ Ã™â€žÃ˜Â§Ã˜Â²Ã™â€¦ Ã˜ÂªÃ˜Â¯Ã™Å Ã˜Â±', 'Ã™â€ Ã™â€šÃ™Ë†Ã™â€žÃ™Æ’', 'Ã™Ë†Ã˜Â¨Ã˜Â§Ã™â€žÃ™â€ Ã˜Â³Ã˜Â¨Ã˜Â© Ã™â€žÃ™â€žÃ˜Â¨Ã™â€ Ã˜Â§Ã˜Âª', 'Ã™â€¦Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦Ã˜Â§Ã˜Âª Ã˜Â¥Ã˜Â¶Ã˜Â§Ã™ÂÃ™Å Ã˜Â©', 'Ã™â€¦Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦Ã˜Â© Ã˜Â¥Ã˜Â¶Ã˜Â§Ã™ÂÃ™Å Ã˜Â©', 'Ã™â€¦Ã™â€žÃ˜Â§Ã˜Â­Ã˜Â¸Ã˜Â§Ã˜Âª Ã™â€¦Ã™â€¡Ã™â€¦Ã˜Â©', 'Ã™â€¦Ã™â€žÃ˜Â§Ã˜Â­Ã˜Â¸Ã˜Â© Ã™â€¦Ã™â€¡Ã™â€¦Ã˜Â©', 'Ã˜Â­Ã™â€šÃ˜Â§Ã˜Â¦Ã™â€š Ã™â€žÃ˜Â§Ã˜Â²Ã™â€¦', 'Ã˜Â­Ã˜Â§Ã˜Â¬Ã˜Â§Ã˜Âª Ã™â€žÃ˜Â§Ã˜Â²Ã™â€¦', 'Ã™Ë†Ã˜Â§Ã˜Â´ Ã™Å Ã˜Â®Ã™â€žÃ™Å Ã™Æ’', 'Ã™Ë†Ã˜Â§Ã˜Â´ Ã˜ÂªÃ™â€šÃ˜Â±Ã˜Â§'],
    firstyear: ['Ã˜Â§Ã™â€žÃ˜Â¨Ã˜Â±Ã™â€ Ã˜Â§Ã™â€¦Ã˜Â¬ Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã™Å  (Ã˜Â§Ã™â€žÃ˜Â³Ã™â€ Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â£Ã™Ë†Ã™â€žÃ™â€°)', 'Ã˜Â§Ã™â€žÃ™â€¦Ã™Ë†Ã˜Â§Ã˜Â¯ Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ˜Â·Ã™Ë†Ã˜Â± Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â­Ã˜Â¶Ã™Å Ã˜Â±Ã™Å ', 'Ã˜Â§Ã™â€žÃ™â€¦Ã™Ë†Ã˜Â§Ã˜Â¯ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¯Ã˜Â±Ã™Ë†Ã˜Â³Ã˜Â© Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ˜Â·Ã™Ë†Ã˜Â±']
};
var TAB_LABELS = {
    intro: 'Ã˜Â¹Ã™â€  Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â®Ã˜ÂµÃ˜Âµ',
    admission: 'Ã˜Â§Ã™â€žÃ™â€šÃ˜Â¨Ã™Ë†Ã™â€ž',
    curriculum: 'Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â§Ã˜Â³Ã˜Â©',
    career: 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â³Ã˜Â§Ã˜Â± Ã˜Â§Ã™â€žÃ™â€¦Ã™â€¡Ã™â€ Ã™Å ',
    pros: 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â²Ã˜Â§Ã™Å Ã˜Â§ Ã™Ë†Ã˜Â§Ã™â€žÃ˜Â¹Ã™Å Ã™Ë†Ã˜Â¨',
    student: 'Ã˜Â­Ã™Å Ã˜Â§Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â·Ã˜Â§Ã™â€žÃ˜Â¨',
    tips: 'Ã™â€ Ã˜ÂµÃ˜Â§Ã˜Â¦Ã˜Â­',
    firstyear: 'Ã˜Â§Ã™â€žÃ˜Â·Ã™Ë†Ã˜Â± Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â­Ã˜Â¶Ã™Å Ã˜Â±Ã™Å '
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
    allBtn.textContent = 'Ã˜Â§Ã™â€žÃ™Æ’Ã™â€ž';
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

    // "Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â®Ã˜ÂµÃ˜ÂµÃ˜Â§Ã˜Âª" button Ã¢â‚¬â€ only if a specialities grid exists in this section
    if (hasSpecGrid) {
        var specBtn = document.createElement('button');
        specBtn.className = 'school-tab-btn';
        specBtn.dataset.tab = 'specialities';
        specBtn.textContent = 'Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â®Ã˜ÂµÃ˜ÂµÃ˜Â§Ã˜Âª';
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
