// Field coefficients (weights for each subject)
const coefficients = {
    math: {
        'math-math-grade': 7,
        'math-physics-grade': 6,
        'math-arabic-grade': 3,
        'math-science-grade': 2,
        'math-islamics-grade': 2,
        'math-history-geo-grade': 2,
        'math-english-grade': 2,
        'math-french-grade': 2,
        'math-philo-grade': 2,
        'math-tamazight-grade': 2,
        'math-sport-grade': 1
    },
    science: {
        'science-science-grade': 6,
        'science-math-grade': 5,
        'science-physics-grade': 5,
        'science-arabic-grade': 3,
        'science-islamics-grade': 2,
        'science-history-geo-grade': 2,
        'science-english-grade': 2,
        'science-french-grade': 2,
        'science-philo-grade': 2,
        'science-tamazight-grade': 2,
        'science-sport-grade': 1
    },
    tech: {
        'tech-tech-grade': 7,
        'tech-math-grade': 6,
        'tech-physics-grade': 6,
        'tech-arabic-grade': 3,
        'tech-islamics-grade': 2,
        'tech-history-geo-grade': 2,
        'tech-english-grade': 2,
        'tech-french-grade': 2,
        'tech-philo-grade': 2,
        'tech-tamazight-grade': 2,
        'tech-sport-grade': 1
    },
    management: {
        'management-accounting-grade': 6,
        'management-math-grade': 5,
        'management-economics-grade': 5,
        'management-arabic-grade': 3,
        'management-history-geo-grade': 4,
        'management-french-grade': 2,
        'management-english-grade': 2,
        'management-islamics-grade': 2,
        'management-law-grade': 2,
        'management-philo-grade': 2,
        'management-sport-grade': 1,
        'management-tamazight-grade': 1
    },
    literature: {
        'literature-arabic-grade': 6,
        'literature-philo-grade': 6,
        'literature-history-geo-grade': 4,
        'literature-french-grade': 3,
        'literature-english-grade': 3,
        'literature-islamics-grade': 2,
        'literature-math-grade': 2,
        'literature-sport-grade': 1,
        'literature-tamazight-grade': 2
    },
    languages: {
        'languages-arabic-grade': 5,
        'languages-french-grade': 5,
        'languages-english-grade': 5,
        'languages-lang3-grade': 4,
        'languages-islamics-grade': 2,
        'languages-history-geo-grade': 2,
        'languages-philo-grade': 2,
        'languages-math-grade': 2,
        'languages-sport-grade': 1,
        'languages-tamazight-grade': 2
    }
};

let calculatorState = 'fieldSelection';

function showSection(id, push = true) {
    if (id === 'fieldSelection' || id === 'mathSubjects' ||
        id === 'scienceSubjects' || id === 'techSubjects' || id === 'managementSubjects' ||
        id === 'literatureSubjects' || id === 'languagesSubjects') {

        document.getElementById('fieldSelection').style.display =
            (id === 'fieldSelection') ? 'grid' : 'none';

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

function updateTimer() {
    const examDate = new Date(2026, 5, 7, 8, 30, 0);
    const now = new Date();
    const diff = examDate - now;

    if (diff <= 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
}

// Timer with Page Visibility API — pauses when tab is hidden
let timerInterval = null;
function startTimer() {
    if (timerInterval) return;
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}
document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTimer();
    else startTimer();
}, { passive: true });


function getFieldName(field) {
    if (field === 'math') return 'شعبة رياضيات';
    if (field === 'science') return 'شعبة علوم تجريبية';
    if (field === 'tech') return 'شعبة تقني رياضي';
    if (field === 'management') return 'شعبة تسيير وإقتصاد';
    if (field === 'literature') return 'شعبة آداب وفلسفة';
    if (field === 'languages') return 'شعبة لغات أجنبية';
    return '';
}

function selectField(field) {
    document.getElementById('fieldSelection').style.display = 'none';
    if (field === 'math') {
        document.getElementById('mathSubjects').style.display = 'block';
    } else if (field === 'science') {
        document.getElementById('scienceSubjects').style.display = 'block';
    } else if (field === 'tech') {
        document.getElementById('techSubjects').style.display = 'block';
    } else if (field === 'management') {
        document.getElementById('managementSubjects').style.display = 'block';
    } else if (field === 'literature') {
        document.getElementById('literatureSubjects').style.display = 'block';
    } else if (field === 'languages') {
        document.getElementById('languagesSubjects').style.display = 'block';
    }
    document.querySelector('.calculator-header h2').textContent = `حساب معدل البكالوريا - ${getFieldName(field)}`;
    document.querySelector('.calculator-header p').textContent = 'أدخل علاماتك';
    document.getElementById('resultSection').style.display = 'none';
}

function showFieldSelection() {
    document.querySelectorAll('.subject-container').forEach(container => {
        container.style.display = 'none';
    });
    document.getElementById('fieldSelection').style.display = 'grid';
    document.querySelector('.calculator-header h2').textContent = 'حساب معدل البكالوريا';
    document.querySelector('.calculator-header p').textContent = 'اختر شعبتك لحساب المعدل';
    document.getElementById('resultSection').style.display = 'none';
}

function calculateAverage(field) {
    let totalScore = 0;
    let totalCoefficient = 0;
    let hasError = false;
    let subjectCount = 0;
    let firstErrorInput = null;

    const fieldCoefficients = coefficients[field];

    for (const [inputId, coefficient] of Object.entries(fieldCoefficients)) {
        const input = document.getElementById(inputId);
        const value = parseFloat(input.value);
        const isOptional = input.closest('.subject-card.optional') !== null;

        const errorSpan = input.parentElement.querySelector('.error-message');
        errorSpan.style.display = 'none';
        errorSpan.textContent = '';

        input.classList.remove('input-error');
        input.closest('.subject-card')?.classList.remove('card-error');


        if (isOptional && (isNaN(value) || input.value.trim() === '')) {
            continue;
        }

        if (isNaN(value)) {
            errorSpan.textContent = 'الرجاء إدخال علامة صحيحة';
            errorSpan.style.display = 'block';
            input.classList.add('input-error');
            input.closest('.subject-card')?.classList.add('card-error');
            if (!firstErrorInput) firstErrorInput = input;
            hasError = true;
        } else if (value < 0 || value > 20) {
            errorSpan.textContent = 'يجب أن تكون العلامة بين 0 و 20';
            errorSpan.style.display = 'block';
            input.classList.add('input-error');
            input.closest('.subject-card')?.classList.add('card-error');
            if (!firstErrorInput) firstErrorInput = input;
            hasError = true;
        } else {
            totalScore += value * coefficient;
            totalCoefficient += coefficient;
            subjectCount++;
        }
    }

    if (hasError) {
        if (firstErrorInput) {
            firstErrorInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorInput.focus();
        }
        return;
    }

    const average = totalScore / totalCoefficient;

    document.getElementById('calculatedAverage').textContent = average.toFixed(2);
    document.getElementById('totalPoints').textContent = totalScore.toFixed(2);
    document.getElementById('totalCoeffs').textContent = totalCoefficient;
    document.getElementById('subjectCount').textContent = subjectCount;

    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });

    localStorage.setItem('calculatorState', field + 'Subjects');
}

function resetForm() {
    document.querySelectorAll('.grade-input').forEach(input => {
        input.value = '';
        const errorSpan = input.parentElement.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.style.display = 'none';
            errorSpan.textContent = '';
        }
    });

    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('calculatedAverage').textContent = '0.00';
    document.getElementById('totalPoints').textContent = '0';
    document.getElementById('totalCoeffs').textContent = '0';
    document.getElementById('subjectCount').textContent = '0';
}

function initSampleData() {
    if (!document.getElementById('math-math-grade')) return;
    document.getElementById('math-math-grade').value = '18.0';
    document.getElementById('math-physics-grade').value = '16.5';
    document.getElementById('math-arabic-grade').value = '14.5';
    document.getElementById('math-science-grade').value = '17.5';
    document.getElementById('math-islamics-grade').value = '15.5';
    document.getElementById('math-history-geo-grade').value = '19.0';
    document.getElementById('math-english-grade').value = '16.0';
    document.getElementById('math-french-grade').value = '16.5';
    document.getElementById('math-philo-grade').value = '19.5';
    document.getElementById('math-tamazight-grade').value = '19.0';
    document.getElementById('math-sport-grade').value = '18.33';

    document.getElementById('science-science-grade').value = '17.5';
    document.getElementById('science-math-grade').value = '18.0';
    document.getElementById('science-physics-grade').value = '16.5';
    document.getElementById('science-arabic-grade').value = '14.5';
    document.getElementById('science-islamics-grade').value = '15.5';
    document.getElementById('science-history-geo-grade').value = '19.0';
    document.getElementById('science-english-grade').value = '16.0';
    document.getElementById('science-french-grade').value = '16.5';
    document.getElementById('science-philo-grade').value = '19.5';
    document.getElementById('science-tamazight-grade').value = '19.0';
    document.getElementById('science-sport-grade').value = '18.33';

    document.getElementById('tech-tech-grade').value = '18.0';
    document.getElementById('tech-math-grade').value = '18.0';
    document.getElementById('tech-physics-grade').value = '16.5';
    document.getElementById('tech-arabic-grade').value = '14.5';
    document.getElementById('tech-islamics-grade').value = '15.5';
    document.getElementById('tech-history-geo-grade').value = '19.0';
    document.getElementById('tech-english-grade').value = '16.0';
    document.getElementById('tech-french-grade').value = '16.5';
    document.getElementById('tech-philo-grade').value = '19.5';
    document.getElementById('tech-tamazight-grade').value = '19.0';
    document.getElementById('tech-sport-grade').value = '18.33';

    document.getElementById('management-accounting-grade').value = '17.5';
    document.getElementById('management-math-grade').value = '16.0';
    document.getElementById('management-economics-grade').value = '18.0';
    document.getElementById('management-arabic-grade').value = '14.5';
    document.getElementById('management-history-geo-grade').value = '15.0';
    document.getElementById('management-french-grade').value = '14.0';
    document.getElementById('management-english-grade').value = '15.5';
    document.getElementById('management-islamics-grade').value = '16.0';
    document.getElementById('management-law-grade').value = '17.0';
    document.getElementById('management-philo-grade').value = '15.0';
}

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

let lastScrollY = window.scrollY;
const navbar = document.querySelector('.navbar');
const navBrand = document.querySelector('.nav-brand');

window.addEventListener('scroll', () => {
    const nav = navbar || document.querySelector('.navbar');
    const brand = navBrand || document.querySelector('.nav-brand');
    if (!nav || !brand) return;

    if (window.innerWidth > 768) {
        nav.classList.remove('hidden');
        brand.classList.remove('fixed');
        return;
    }

    if (window.scrollY === 0) {
        nav.classList.remove('hidden');
        brand.classList.remove('fixed');
    } else if (window.scrollY > lastScrollY) {
        nav.classList.add('hidden');
        brand.classList.add('fixed');
    } else {
        nav.classList.remove('hidden');
        brand.classList.remove('fixed');
    }

    lastScrollY = window.scrollY;
});

// Fullscreen toggler for multiple PDF viewers
function toggleFullScreen(event) {
    const btn = event.currentTarget;
    const iframe = btn.closest('.pdf-wrapper').querySelector('iframe');

    if (document.fullscreenElement === iframe) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    } else {
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) {
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) {
            iframe.msRequestFullscreen();
        }
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === "Escape" && document.fullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Section Loading
    const initial = location.hash.slice(1) || 'home';
    const savedState = localStorage.getItem('calculatorState') || 'fieldSelection';

    if (initial === 'calculator') {
        calculatorState = savedState;
        showSection(savedState, false);
    } else {
        showSection(initial, false);
    }

    // 2. Timer Setup — only start if timer elements exist on this page
    if (document.getElementById('days')) {
        startTimer();
    }

    initSampleData();

    // 3. Anchor Link Smooth Scrolling & Section Management
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

    // 4. Gallery / Slider logic
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

// ── Scroll-to-top Button ──────────────────────────
(function () {
    var btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', function () {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });
})();
