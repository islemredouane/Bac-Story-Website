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
    }
};

let calculatorState = 'fieldSelection';

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navOverlay = document.querySelector('.nav-overlay');
const dropdowns = document.querySelectorAll('.dropdown');
const menuClose = document.querySelector('.menu-close');

// Toggle mobile menu
hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    navOverlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu function
function closeMobileMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';

    // Close all dropdowns
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
    });
}

// Close menu with close button
if (menuClose) {
    menuClose.addEventListener('click', closeMobileMenu);
}

// Close menu when clicking on overlay
navOverlay.addEventListener('click', closeMobileMenu);

// Close menu when clicking on a link (mobile), but ignore dropdown buttons
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function (e) {
        if (window.innerWidth <= 900 && !this.classList.contains('dropdown-btn')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// Mobile dropdown functionality
dropdowns.forEach(dropdown => {
    const dropdownBtn = dropdown.querySelector('.dropdown-btn');

    dropdownBtn.addEventListener('click', function (e) {
        if (window.innerWidth <= 900) {
            e.preventDefault();
            e.stopPropagation();

            // Close other dropdowns
            dropdowns.forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.classList.remove('active');
                }
            });

            // Toggle current dropdown
            dropdown.classList.toggle('active');
        }
    });
});

// Close dropdowns when clicking outside (mobile)
document.addEventListener('click', function (e) {
    if (window.innerWidth <= 900 && !e.target.closest('.dropdown')) {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
});

// ESC key to close mobile menu
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMobileMenu();
    }
});

function showSection(id, push = true) {
    if (id === 'fieldSelection' || id === 'mathSubjects' ||
        id === 'scienceSubjects' || id === 'techSubjects') {

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

    document.querySelectorAll('.resource-content')
        .forEach(sec => sec.classList.remove('active'));

    const section = document.getElementById(id);
    if (section) {
        section.classList.add('active');
        if (push) {
            history.pushState({ section: id, calculatorState }, '', `#${id}`);
        }
    }

    // Auto-close mobile menu on navigation
    if (window.innerWidth <= 900) {
        if (typeof closeMobileMenu === 'function') {
            closeMobileMenu();
        }
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

document.addEventListener('DOMContentLoaded', () => {
    const initial = location.hash.slice(1) || 'home';
    const savedState = localStorage.getItem('calculatorState') || 'fieldSelection';

    if (initial === 'calculator') {
        calculatorState = savedState;
        showSection(savedState, false);
        history.replaceState({ section: 'calculator', calculatorState: savedState }, '', '#calculator');
    } else {
        showSection(initial, false);
        history.replaceState({ section: initial }, '', `#${initial}`);
    }

    updateTimer();
    setInterval(updateTimer, 1000);
    initSampleData();

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                // Only show section if it's one of your managed sections
                if (['home', 'about', 'contact', 'calculator', 'calculator-section', 'field-selection ', 'subject-container', 'fieldSelection',
                    'mathSubjects', 'scienceSubjects', 'techSubjects',
                    'resources'].includes(targetId)) {
                    showSection(targetId);
                } else {
                    // Just scroll to the section (for static parts like about, contact)
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

function updateTimer() {
    const examDate = new Date(2026, 5, 15, 8, 30, 0);
    const now = new Date();
    const diff = examDate - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

function getFieldName(field) {
    if (field === 'math') return 'شعبة رياضيات';
    if (field === 'science') return 'شعبة علوم تجريبية';
    if (field === 'tech') return 'شعبة تقني رياضي';
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
}
// Handle form submission with AJAX 
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const submitButton = this.querySelector('button[type="submit"]');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Hide both first
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

            // Auto-hide after 5s
            setTimeout(() => {
                successMessage.style.display = 'none';
                errorMessage.style.display = 'none';
            }, 5000);
        });
});

// Fullscreen toggler for multiple PDF viewers
function toggleFullScreen(event) {
    // Get the clicked button element (fullscreen button)
    const btn = event.currentTarget;

    // Find the iframe inside this wrapper
    const iframe = btn.closest('.pdf-wrapper').querySelector('iframe');

    if (document.fullscreenElement === iframe) {
        // Exit fullscreen if this iframe is already fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Safari
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE11
            document.msExitFullscreen();
        }
    } else {
        // Enter fullscreen only for the iframe
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) { // Safari
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) { // IE11
            iframe.msRequestFullscreen();
        }
    }
}

// Optional: ESC exits fullscreen for better UX
document.addEventListener('keydown', function (e) {
    if (e.key === "Escape" && document.fullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Safari
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE11
            document.msExitFullscreen();
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.resource-content').forEach(resource => {
        const galleryImages = Array.from(resource.querySelectorAll('.gallery-images img'));
        const centerImg = resource.querySelector('.center-photo-img');
        const leftImg = resource.querySelector('.left-photo');
        const rightImg = resource.querySelector('.right-photo');
        const counter = resource.querySelector('.photo-counter');
        const leftNav = resource.querySelector('.left-nav');
        const rightNav = resource.querySelector('.right-nav');

        // Only initialize if the section is intended to be a gallery
        if (!galleryImages.length) return;

        // Log a warning only if it's meant to be a gallery but is missing UI components
        if (!centerImg || !leftImg || !rightImg || !leftNav || !rightNav || !counter) {
            console.warn("Missing one or more gallery UI elements in:", resource);
            return;
        }

        let currentIndex = 0;

        function updateGallery() {
            const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            const nextIndex = (currentIndex + 1) % galleryImages.length;

            // Update the main and peek images
            centerImg.src = galleryImages[currentIndex].src;
            centerImg.alt = galleryImages[currentIndex].alt;

            leftImg.src = galleryImages[prevIndex].src;
            leftImg.alt = galleryImages[prevIndex].alt;

            rightImg.src = galleryImages[nextIndex].src;
            rightImg.alt = galleryImages[nextIndex].alt;

            // Update counter
            counter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
        }

        // Navigation buttons
        leftNav.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            updateGallery();
        });

        rightNav.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % galleryImages.length;
            updateGallery();
        });

        // Initial setup
        updateGallery();
    });
});

// JavaScript SDK
// Generated by Sublyzer SDK Customizer
// Black and gray theme, auto-initialization enabled
// TestingAI headless browser (Playwright + Chromium) runs on the Sublyzer backend — no extra browser libs are required in this project.
(function(){
  const SublyzerSDK = (function(){
    function SublyzerSDK(cfg){
      this.config = Object.assign({
        integrationCode: cfg.integrationCode,
        apiUrl: cfg.apiUrl || 'https://sublyzer-backend-production.up.railway.app',
        appName: cfg.appName || 'My Application',
        version: cfg.version || '1.0.0',
        debug: !!cfg.debug,
        batchSize: 20,
        flushInterval: 30000,
        enableVulnerabilityScan: true,
        enableUserTracking: true,
        enableCookieAnalysis: true,
        enableDownloadTracking: true,
        enableDeviceTracking: true,
        enableSourceMaps: false,
        gdprCompliant: true
      }, cfg);
      this.isInitialized = false;
      this.sessionId = 'session_'+Math.random().toString(36).slice(2,11)+'_'+Date.now();
      this.userId = (function(){ try{const k='sublyzer_user_id';let v=localStorage.getItem(k);if(!v){v='user_'+Math.random().toString(36).slice(2,11)+'_'+Date.now();localStorage.setItem(k,v);}return v;}catch(e){return 'user_'+Date.now();}})();
      this.eventQueue = [];
      this.downloadCache = new Set();
      // Aggregated metrics (sent as user_metric on flush)
      this.metrics = { pageViews:0, userActions:0, clickCount:0, formSubmitCount:0, errors:[], performance:{}, downloads:[] };
      this._autoFlushTimer = null;
      this._autoMetricsTimer = null;
      this._startedAt = Date.now();
    }
    SublyzerSDK.prototype.initialize = async function(){
      if (!this.config.integrationCode || this.config.integrationCode.length !== 24){
        this._log('Invalid integration code', null, 'error');
        return false;
      }
      if (true){
        // Validate in background without blocking initialization
        this._validate().catch(function(){/* silently ignore */});
        this._setupPerformance();
        this._setupErrors();
        this._setupUserTracking();
        this._setupCookieAnalysis && this._setupCookieAnalysis();
        this._setupDownloadTracking && this._setupDownloadTracking();
        this._setupDeviceInfo && this._setupDeviceInfo();
        this._scanForVulnerabilities && this._scanForVulnerabilities();
        this._startAutoCollection();
        this._setupAutoFlush();
        this.isInitialized = true;
        this.trackEvent('sdk_initialized', { 
          appName: this.config.appName, 
          version: this.config.version, 
          userAgent: navigator.userAgent, 
          ts: new Date().toISOString(),
          flags: {
            autoloader: true,
            autoTracking: true,
            cookieAnalysis: true,
            downloadTracking: true,
            clickTracking: true,
            formSubmissions: true,
            pageViews: true,
            debug: false,
            templateVersion: 2,
          }
        });
        return true;
      }
      return false;
    };
    SublyzerSDK.prototype._validate = async function(){
      try {
        const r = await fetch(this.config.apiUrl + '/data-collection/integration/'+this.config.integrationCode+'/validate');
        if (!r.ok) return;
        const j = await r.json();
        if (!j.valid) return;
      } catch(e){ 
        // Silently ignore network/fetch errors to avoid polluting the console
        // Do not log or propagate the error
        return;
      }
    };
    SublyzerSDK.prototype._setupPerformance = function(){
      if (!('PerformanceObserver' in window)) return;
      try{
        // Performance metrics buffer to reduce queue overhead
        this._perfBuffer = [];
        this._perfFlushScheduled = false;
        const flushPerfBuffer = () => {
          try {
            const buf = this._perfBuffer || [];
            if (!buf.length) return;
            const items = buf.slice();
            this._perfBuffer.length = 0;
            for (const metric of items) this._queue('performance', metric);
          } catch(_){}
        };
        const schedulePerfFlush = () => {
          if (this._perfFlushScheduled) return;
          this._perfFlushScheduled = true;
          const done = () => { this._perfFlushScheduled = false; flushPerfBuffer(); };
          if (window.requestIdleCallback) {
            window.requestIdleCallback(done, { timeout: 2000 });
          } else {
            setTimeout(done, 2000);
          }
        };
        const obs = new PerformanceObserver((list)=>{
          for(const entry of list.getEntries()){
            const metric = { type: 'performance', name: entry.name, entryType: entry.entryType, startTime: entry.startTime, duration: entry.duration, ts: new Date().toISOString() };
            this._perfBuffer.push(metric);
            if (this._perfBuffer.length >= 25) flushPerfBuffer();
            else schedulePerfFlush();
          }
        });
        obs.observe({ entryTypes: ['navigation','paint','largest-contentful-paint','first-input','layout-shift'] });
        const nav = performance.getEntriesByType('navigation')[0];
        if (nav){
          this.metrics.performance = {
            loadTime: nav.loadEventEnd - nav.loadEventStart,
            domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
            firstByte: nav.responseStart - nav.requestStart
          };
          // Queue a performance summary with fields expected by the backend
          this._queue('performance_summary', {
            loadTime: Math.max(0, this.metrics.performance.loadTime || 0),
            domContentLoaded: Math.max(0, this.metrics.performance.domContentLoaded || 0),
            firstContentfulPaint: (performance.getEntriesByName('first-contentful-paint')[0] && performance.getEntriesByName('first-contentful-paint')[0].startTime) || 0,
            largestContentfulPaint: (window.__lcp || 0),
            cumulativeLayoutShift: (window.__cls || 0),
            firstInputDelay: (window.__fid || 0),
            timeToInteractive: 0,
            ts: new Date().toISOString()
          });
        }
      }catch(e){ this._log('Performance monitoring error', e, 'error'); }
    };
    SublyzerSDK.prototype._setupErrors = function(){
      if (typeof window === 'undefined') return;

      // --- Breadcrumbs (lightweight) ---
      try{
        if (!this._breadcrumbs) this._breadcrumbs = [];
        if (!this._breadcrumbsSetup) {
          this._breadcrumbsSetup = true;
          const pushCrumb = (crumb)=>{
            try{
              const c = Object.assign({ ts: new Date().toISOString() }, crumb||{});
              this._breadcrumbs.push(c);
              if (this._breadcrumbs.length > 40) this._breadcrumbs.splice(0, this._breadcrumbs.length - 40);
            }catch(_){}
          };
          this._pushCrumb = pushCrumb;
          try{
            const wrap = (level)=>{
              const orig = console[level];
              if (!orig || orig.__sublyzerWrapped) return;
              const fn = function(){
                try{
                  const args = Array.prototype.slice.call(arguments).map(a=>{
                    if (a==null) return String(a);
                    if (typeof a === 'string') return a;
                    try{ return JSON.stringify(a); }catch(_){ return String(a); }
                  }).join(' ').slice(0, 400);
                  pushCrumb({ type:'console', level, message: args });
                }catch(_){}
                return orig.apply(console, arguments);
              };
              fn.__sublyzerWrapped = true;
              console[level] = fn;
            };
            ['log','info','warn','error'].forEach(wrap);
          }catch(_){}
          try{
            const origFetch = window.fetch;
            if (origFetch && !origFetch.__sublyzerWrapped) {
              const f = function(input, init){
                const start = Date.now();
                let url = '';
                try{ url = (typeof input === 'string') ? input : (input && input.url) || ''; }catch(_){}
                pushCrumb({ type:'fetch', phase:'start', url: String(url).slice(0,300), method: (init && init.method) || 'GET' });
                return origFetch.apply(window, arguments).then((res)=>{
                  pushCrumb({ type:'fetch', phase:'end', url: String(url).slice(0,300), status: res && res.status, ms: Date.now()-start });
                  return res;
                }).catch((err)=>{
                  pushCrumb({ type:'fetch', phase:'error', url: String(url).slice(0,300), ms: Date.now()-start, message: String(err && err.message || err || 'fetch error').slice(0,300) });
                  throw err;
                });
              };
              f.__sublyzerWrapped = true;
              window.fetch = f;
            }
          }catch(_){}
          try{
            document.addEventListener('click', (e)=>{
              try{
                const el = e && e.target;
                pushCrumb({ type:'ui', action:'click', tag: el && el.tagName, id: el && el.id, cls: String(el && el.className || '').slice(0,120) });
              }catch(_){}
            }, true);
          }catch(_){}
        }
      }catch(_){}

      const normalizeFile = (f)=>{
        try{
          let s = String(f||'').trim();
          if (!s) return '';
          // Evitar regex com escapes dentro do template do customizer (pode gerar JS inválido)
          if (s.indexOf('webpack-internal:///./') === 0) s = s.slice('webpack-internal:///./'.length);
          else if (s.indexOf('webpack-internal://') === 0) s = s.slice('webpack-internal://'.length);
          if (s.indexOf('http://') === 0 || s.indexOf('https://') === 0) {
            const p = s.indexOf('/', s.indexOf('//') + 2);
            if (p >= 0) s = s.slice(p);
          }
          s = s.split('#')[0].split('?')[0];
          return s;
        }catch(_){ return ''; }
      };

      const parseStack = (stack)=>{
        try{
          const out = [];
          // IMPORTANTE: este código está dentro de um template string TSX.
          // Se usarmos '
' aqui, ele vira newline real e quebra o JS gerado.
          const lines = String(stack||'').split('\n').slice(0, 40);
          for (const line of lines){
            const l = String(line||'').trim();
            if (!l) continue;
            let m = l.match(/^\s*at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)\s*$/);
            if (m){ out.push({ function: m[1], file: normalizeFile(m[2]), line: Number(m[3]||0), col: Number(m[4]||0), raw: l }); continue; }
            m = l.match(/^\s*at\s+(.*?):(\d+):(\d+)\s*$/);
            if (m){ out.push({ function: '', file: normalizeFile(m[1]), line: Number(m[2]||0), col: Number(m[3]||0), raw: l }); continue; }
            m = l.match(/^(.*?)@(.*?):(\d+):(\d+)\s*$/);
            if (m){ out.push({ function: m[1], file: normalizeFile(m[2]), line: Number(m[3]||0), col: Number(m[4]||0), raw: l }); continue; }
          }
          return out;
        }catch(_){ return []; }
      };

      // --- SourceMap v3 mini-consumer (VLQ) ---
      const _b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      const _b64rev = (function(){ const m = {}; for (let i=0;i<_b64.length;i++) m[_b64.charAt(i)] = i; return m; })();
      const _smCache = (typeof Map !== 'undefined') ? new Map() : null;
      const _smPending = (typeof Map !== 'undefined') ? new Map() : null;
      const _withTimeout = (p, ms)=> new Promise((resolve, reject)=>{ let done=false; const t=setTimeout(()=>{ if(done) return; done=true; reject(new Error('timeout')); }, ms); Promise.resolve(p).then(v=>{ if(done) return; done=true; clearTimeout(t); resolve(v); }).catch(e=>{ if(done) return; done=true; clearTimeout(t); reject(e); }); });
      const _toAbs = (file)=>{ try{ let s=String(file||'').trim(); if(!s) return ''; if(s.indexOf('http://')===0 || s.indexOf('https://')===0) return s; if(typeof location==='undefined') return ''; if(s.startsWith('/')) return location.origin + s; return new URL(s, location.href).toString(); }catch(_){ return ''; } };
      const _fetchJson = async (url)=>{ try{ const r=await fetch(url,{cache:'no-store'}); if(!r||!r.ok) return null; const len=Number(r.headers && r.headers.get && r.headers.get('content-length') || '0') || 0; if(len && len>3000000) return null; return await r.json(); }catch(_){ return null; } };
      const _decodeVlq = (str, idx)=>{ let res=0, shift=0, cont=true; while(cont && idx<str.length){ const ch=str.charAt(idx++); const v=_b64rev[ch]; if(v==null) return [0, idx]; cont=!!(v&32); const digit=v&31; res |= (digit<<shift); shift+=5; } const neg=(res&1)===1; res = res>>1; return [neg?-res:res, idx]; };
      const _parseMappings = (m)=>{ try{ const lines=[]; let genLine=0, i=0; let source=0, origLine=0, origCol=0, name=0; let genCol=0; lines[0]=[]; while(i<m.length){ const ch=m.charAt(i); if(ch===';'){ genLine++; i++; genCol=0; lines[genLine]=[]; continue; } if(ch===','){ i++; continue; } let v; [v,i]=_decodeVlq(m,i); genCol+=v; const seg=[genCol]; if(i>=m.length){ lines[genLine].push(seg); continue; } const next=m.charAt(i); if(next===','||next===';'){ lines[genLine].push(seg); continue; } [v,i]=_decodeVlq(m,i); source+=v; [v,i]=_decodeVlq(m,i); origLine+=v; [v,i]=_decodeVlq(m,i); origCol+=v; seg.push(source, origLine, origCol); if(i<m.length){ const n=m.charAt(i); if(n!==','&&n!==';'){ [v,i]=_decodeVlq(m,i); name+=v; seg.push(name); } } lines[genLine].push(seg); } return lines; }catch(_){ return null; } };
      const _origFor = (sm, genLine1, genCol0)=>{ try{ if(!sm||!sm.lines) return null; const li=Math.max(0,(Number(genLine1||0)||1)-1); const col=Math.max(0,Number(genCol0||0)||0); const segs=sm.lines[li]; if(!segs||!segs.length) return null; let best=null; for(let k=0;k<segs.length;k++){ const s=segs[k]; if(!s||s.length<4) continue; if(s[0]<=col) best=s; else break; } best=best||segs[0]; if(!best||best.length<4) return null; const si=best[1]; const ol0=best[2]; const oc0=best[3]; const nameIdx=(best.length>=5?best[4]:null); const src=(sm.map && sm.map.sources && sm.map.sources[si]) || ''; const nm=(nameIdx!=null && sm.map && sm.map.names && sm.map.names[nameIdx]) || ''; return { source: src, line: ol0+1, col: oc0, name: nm }; }catch(_){ return null; } };
      const _normSource = (p, sourceRoot)=>{ try{
        let s=String(p||'').trim(); if(!s) return '';
        if (s.indexOf('webpack:///')===0) s=s.slice('webpack:///'.length);
        if (s.indexOf('webpack://')===0) s=s.slice('webpack://'.length);
        if (s.indexOf('_N_E/')===0) s=s.slice('_N_E/'.length);
        while (s.indexOf('./')===0) s=s.slice(2);
        while (s.indexOf('/')===0) s=s.slice(1);
        s = s.split('/./').join('/');
        const root=String(sourceRoot||'').trim();
        if(root && !(s.indexOf('http://')===0 || s.indexOf('https://')===0) && s.indexOf(root)!==0){
          const aa=String(root||'').replace(//+$/,'');
          const bb=String(s||'').replace(/^/+/,'');
          s = (aa ? (aa + '/' + bb) : bb);
        }
        const keys = ['src/','app/','pages/','components/'];
        let best = -1;
        for (const k of keys){
          const i1 = s.indexOf('/'+k);
          const i2 = s.indexOf(k);
          const idx = (i1>=0 ? i1+1 : i2);
          if (idx>=0 && (best<0 || idx<best)) best = idx;
        }
        if (best>=0) s = s.slice(best);
        return s;
      }catch(_){ return ''; } };
      const _getSm = async (absJs)=>{ try{
        if (!(this && this.config && this.config.enableSourceMaps)) return null;
        if(!absJs||typeof location==='undefined') return null;
        if(!absJs.startsWith(location.origin)) return null;
        if(_smCache && _smCache.has(absJs)) return _smCache.get(absJs);
        if(_smPending && _smPending.has(absJs)) return await _smPending.get(absJs);
        const job=(async()=>{
          const candidates=[absJs+'.map'];
          const qIdx = absJs.indexOf('?');
          const base = (qIdx>=0 ? absJs.slice(0,qIdx) : absJs);
          const query = (qIdx>=0 ? absJs.slice(qIdx) : '');
          if (base.endsWith('.js')) candidates.push(base + '.map' + query); // .js.map
          let map=null;
          for(const u of candidates){ map = await _fetchJson(u); if(map && map.mappings && map.sources) break; }
          if(!map || typeof map.mappings!=='string') return null;
          if(map.mappings.length>3000000) return null;
          const lines=_parseMappings(map.mappings); if(!lines) return null;
          const out={ map, lines }; if(_smCache) _smCache.set(absJs,out); return out;
        })();
        if(_smPending) _smPending.set(absJs,job);
        const res=await job; if(_smPending) _smPending.delete(absJs);
        return res;
      }catch(_){ return null; } };
      const _resolveFrames = async (frames)=>{ try{
        if(!Array.isArray(frames)||!frames.length||typeof location==='undefined') return frames;
        const out=[];
        for(const fr of frames){
          const file=String(fr && fr.file || '');
          const line=Number(fr && fr.line || 0) || 0;
          const col=Number(fr && fr.col || 0) || 0;
          if(!file || file.indexOf('.js')<0) { out.push(fr); continue; }
          const abs=_toAbs(file);
          if(!abs || !abs.startsWith(location.origin)) { out.push(fr); continue; }
          const sm = await _getSm(abs);
          if(!sm) { out.push(fr); continue; }
          const pos = _origFor(sm, line, col);
          if(!pos || !pos.source) { out.push(fr); continue; }
          const repoPath = _normSource(pos.source, sm.map && sm.map.sourceRoot);
          if(!repoPath) { out.push(fr); continue; }
          out.push(Object.assign({}, fr, { generatedFile: fr.file, generatedLine: fr.line, generatedCol: fr.col, file: repoPath, line: pos.line || fr.line, col: (typeof pos.col==='number'?pos.col:fr.col), function: fr.function || pos.name || '', mapped: true }));
        }
        return out;
      }catch(_){ return frames; } };

      const pickCulprit = (frames)=>{
        try{
          const frs = (frames||[]);
          const preferred = frs.find(f=>{
            const file = String(f && f.file || '');
            return file.indexOf('src/') === 0 || file.indexOf('app/') === 0 || file.indexOf('pages/') === 0 || file.indexOf('components/') === 0;
          });
          const cand = preferred || frs[0] || null;
          if (!cand) return null;
          const file = String(cand.file||'');
          return { file: file, line: cand.line||0, col: cand.col||0, function: cand.function||'' };
        }catch(_){ return null; }
      };

      const hash32 = (str)=>{
        let h = 0x811c9dc5;
        for (let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = (h + ((h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24))) >>> 0; }
        return ('0000000' + (h>>>0).toString(16)).slice(-8);
      };
      const makeFingerprint = (msg, frames)=>{
        const top = (frames||[]).slice(0, 6).map(f=> String((f && f.file) || '') + ':' + String((f && f.line) || 0) + ':' + String((f && f.col) || 0)).join('|');
        return hash32(String(msg||'').slice(0,220) + '|' + top);
      };

      window.addEventListener('error', async (event)=>{
        try{
          const stack = (event && event.error && event.error.stack) || '';
          const frames0 = parseStack(stack);
          let frames = frames0;
          try{ frames = await _withTimeout(_resolveFrames(frames0), 220); if(!Array.isArray(frames)||!frames.length) frames = frames0; }catch(_){ frames = frames0; }
          const culprit = pickCulprit(frames);
          const message = (event && event.message) || 'Unknown error';
          const fp = makeFingerprint(message, frames);
          this._queue('error', {
            type:'javascript_error',
            name: (event && event.error && event.error.name) || '',
            message: message,
            filename: event && event.filename,
            lineno: event && event.lineno,
            colno: event && event.colno,
            stack: stack,
            frames: frames,
            culprit: culprit,
            breadcrumbs: (this._breadcrumbs || []).slice(-30),
            pageUrl: (typeof location!=='undefined' ? location.href : ''),
            referrer: (typeof document!=='undefined' ? (document.referrer || '') : ''),
            release: (this.config && this.config.version) || '',
            environment: (this.config && this.config.environment) || '',
            sdk: { name:'sublyzer_js', version:'2.0' },
            fingerprint: fp,
            severity:'high',
            ts: new Date().toISOString()
          });
        }catch(_){
          this._queue('error', { type:'javascript_error', message: event && event.message, filename: event && event.filename, lineno: event && event.lineno, colno: event && event.colno, stack: event && event.error && event.error.stack, severity:'high', ts: new Date().toISOString() });
        }
      });
      window.addEventListener('unhandledrejection', async (event)=>{
        try{
          const reason = event && event.reason;
          const message = (reason && reason.message) || 'Unhandled promise rejection';
          const stack = (reason && reason.stack) || '';
          const frames0 = parseStack(stack);
          let frames = frames0;
          try{ frames = await _withTimeout(_resolveFrames(frames0), 220); if(!Array.isArray(frames)||!frames.length) frames = frames0; }catch(_){ frames = frames0; }
          const culprit = pickCulprit(frames);
          const fp = makeFingerprint(message, frames);
          this._queue('error', {
            type:'unhandled_promise_rejection',
            name: (reason && reason.name) || '',
            message: message,
            stack: stack,
            frames: frames,
            culprit: culprit,
            breadcrumbs: (this._breadcrumbs || []).slice(-30),
            pageUrl: (typeof location!=='undefined' ? location.href : ''),
            referrer: (typeof document!=='undefined' ? (document.referrer || '') : ''),
            release: (this.config && this.config.version) || '',
            environment: (this.config && this.config.environment) || '',
            sdk: { name:'sublyzer_js', version:'2.0' },
            fingerprint: fp,
            severity:'high',
            ts: new Date().toISOString()
          });
        }catch(_){
          this._queue('error', { type:'unhandled_promise_rejection', message: event && event.reason && event.reason.message || 'Unhandled promise rejection', stack: event && event.reason && event.reason.stack, severity:'high', ts: new Date().toISOString() });
        }
      });
    };
    // Cookie collection (improved heuristic)
    SublyzerSDK.prototype._setupCookieAnalysis = function(){
      try{
        const raw = document.cookie || '';
        const parts = raw ? raw.split(';') : [];
        const total = parts.filter(Boolean).length;
        
        let firstParty = 0;
        let thirdParty = 0;
        let secure = 0;
        let httpOnly = 0;
        
        for (const cookie of parts) {
          const name = cookie.split('=')[0]?.trim() || '';
          if (!name) continue;
          
          // Detect secure cookies
          if (name.toLowerCase().includes('secure') || name.toLowerCase().includes('session')) {
            secure++;
          }
          
          // Detect httpOnly cookies
          if (name.toLowerCase().includes('token') || name.toLowerCase().includes('auth')) {
            httpOnly++;
          }
          
          // Detect 1st vs 3rd party
          const isFirstParty = name.length < 15 && 
                             !name.includes('_') && 
                             !name.includes('-') && 
                             !name.includes('.') &&
                             !name.toLowerCase().includes('google') &&
                             !name.toLowerCase().includes('facebook') &&
                             !name.toLowerCase().includes('analytics');
          
          if (isFirstParty) {
            firstParty++;
          } else {
            thirdParty++;
          }
        }
        
        // Ensure consistency
        if (firstParty + thirdParty !== total) {
          firstParty = total;
          thirdParty = 0;
        }
        
        const summary = { 
          total: Math.max(total, 1), 
          firstParty: Math.max(firstParty, 1), 
          thirdParty: Math.max(thirdParty, 0), 
          secure: Math.max(secure, 0), 
          httpOnly: Math.max(httpOnly, 0), 
          sameSite: 'none', 
          ts: new Date().toISOString() 
        };
        
        this._queue('cookie', summary);
      }catch(_){/* ignore */}
    };

    // Download tracking (common extensions)
    SublyzerSDK.prototype._setupDownloadTracking = function(){
      try{
        document.addEventListener('click', (e)=>{
          try{
            const a = e.target && (e.target.closest ? e.target.closest('a[href]') : null);
            if (!a) return;
            const href = a.getAttribute('href') || '';
            if (!href) return;
            const exts = ['.zip','.pdf','.doc','.docx','.xls','.xlsx','.ppt','.pptx','.mp3','.mp4','.mov','.avi','.png','.jpg','.jpeg','.gif'];
            const lower = href.toLowerCase();
            if (!exts.some(ext => lower.endsWith(ext))) return;
            const url = (new URL(href, location.href)).toString();
            const type = lower.split('.').pop() || 'file';
            this._queue('download', { filename: href.split('/').pop() || href, size: 0, type, url, userAgent: navigator.userAgent, ts: new Date().toISOString() });
          }catch(_){/* ignore */}
        }, true);
      }catch(_){/* ignore */}
    };

    // Detailed device information collection
    SublyzerSDK.prototype._setupDeviceInfo = function(){
      try{
        const collectDeviceInfo = () => {
          const deviceInfo = {};
          
          // CPU Architecture
          try {
            const ua = navigator.userAgent.toLowerCase();
            if (navigator.userAgentData && navigator.userAgentData.architecture) {
              deviceInfo.cpu_arch = navigator.userAgentData.architecture;
            } else if (/arm|aarch64|apple silicon|m1|m2/.test(ua)) {
              deviceInfo.cpu_arch = 'ARM64';
            } else if (/x64|x86_64|win64|amd64/.test(ua)) {
              deviceInfo.cpu_arch = 'x86_64';
            } else if (/x86|i386|i686/.test(ua)) {
              deviceInfo.cpu_arch = 'x86';
            } else {
              deviceInfo.cpu_arch = 'unknown';
            }
          } catch(_) { deviceInfo.cpu_arch = 'unknown'; }
          
          // RAM Size
          try {
            if (navigator.deviceMemory) {
              deviceInfo.ram_gb = String(navigator.deviceMemory) + ' GB';
            } else {
              deviceInfo.ram_gb = 'unknown';
            }
          } catch(_) { deviceInfo.ram_gb = 'unknown'; }
          
          // GPU Information
          try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
              const dbg = gl.getExtension('WEBGL_debug_renderer_info');
              if (dbg) {
                const vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL);
                const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
                deviceInfo.gpu = vendor && renderer ? vendor + ' ' + renderer : (renderer || vendor || 'unknown');
              } else {
                deviceInfo.gpu = 'unknown';
              }
            } else {
              deviceInfo.gpu = 'unknown';
            }
          } catch(_) { deviceInfo.gpu = 'unknown'; }
          
          // Platform & OS
          try {
            deviceInfo.platform = navigator.platform || 'unknown';
            if (navigator.userAgentData && navigator.userAgentData.platform) {
              deviceInfo.os = navigator.userAgentData.platform;
            } else {
              const ua = navigator.userAgent;
              // Detect mobile OSes before Linux (Android UAs include "Linux")
              if (/Windows/.test(ua)) deviceInfo.os = 'Windows';
              else if (/Mac OS X|Macintosh/.test(ua)) deviceInfo.os = 'macOS';
              else if (/Android/.test(ua)) deviceInfo.os = 'Android';
              else if (/iPhone|iPad|iPod/.test(ua)) deviceInfo.os = 'iOS';
              else if (/CrOS/.test(ua)) deviceInfo.os = 'ChromeOS';
              else if (/Linux/.test(ua)) deviceInfo.os = 'Linux';
              else deviceInfo.os = 'unknown';
            }
          } catch(_) { 
            deviceInfo.platform = 'unknown';
            deviceInfo.os = 'unknown';
          }
          
          // Screen Resolution
          try {
            deviceInfo.screen_width = screen.width || 0;
            deviceInfo.screen_height = screen.height || 0;
            deviceInfo.screen_resolution = (screen.width || 0) + 'x' + (screen.height || 0);
          } catch(_) {
            deviceInfo.screen_width = 0;
            deviceInfo.screen_height = 0;
            deviceInfo.screen_resolution = 'unknown';
          }
          
          // Viewport Size
          try {
            deviceInfo.viewport_width = window.innerWidth || 0;
            deviceInfo.viewport_height = window.innerHeight || 0;
            deviceInfo.viewport_size = (window.innerWidth || 0) + 'x' + (window.innerHeight || 0);
          } catch(_) {
            deviceInfo.viewport_width = 0;
            deviceInfo.viewport_height = 0;
            deviceInfo.viewport_size = 'unknown';
          }
          
          // Color Depth
          try {
            deviceInfo.color_depth = screen.colorDepth || 0;
          } catch(_) { deviceInfo.color_depth = 0; }
          
          // Pixel Ratio
          try {
            deviceInfo.pixel_ratio = window.devicePixelRatio || 1;
          } catch(_) { deviceInfo.pixel_ratio = 1; }
          
          // Language
          try {
            deviceInfo.language = navigator.language || 'unknown';
            deviceInfo.languages = navigator.languages ? navigator.languages.join(', ') : navigator.language || 'unknown';
          } catch(_) {
            deviceInfo.language = 'unknown';
            deviceInfo.languages = 'unknown';
          }
          
          // Connection Info (if available)
          try {
            if (navigator.connection) {
              const conn = navigator.connection;
              deviceInfo.connection_type = conn.effectiveType || 'unknown';
              deviceInfo.connection_downlink = conn.downlink || 0;
              deviceInfo.connection_rtt = conn.rtt || 0;
            }
          } catch(_) {}
          
          // Hardware Concurrency (CPU cores)
          try {
            deviceInfo.hardware_concurrency = navigator.hardwareConcurrency || 0;
          } catch(_) { deviceInfo.hardware_concurrency = 0; }
          
          deviceInfo.ts = new Date().toISOString();
          
          this._queue('device_info', deviceInfo);
        };
        
        // Collect information immediately
        collectDeviceInfo();
        
        // Re-collect when viewport changes (orientation, resize)
        var resizeTimer;
        window.addEventListener('resize', function(){
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(function(){
            collectDeviceInfo();
          }, 500);
        });
        
      } catch(_) { /* ignore */ }
    };

    // Simple vulnerability scan (heuristic)
    SublyzerSDK.prototype._scanForVulnerabilities = async function(){
      if (!this.config.enableVulnerabilityScan) return;
      // Run scan only when the browser is idle to avoid impacting performance
      const runScan = async () => {
        try{
          const push = (f) => this._queue('vulnerability', {
            type: f.type,
            description: f.description,
            severity: f.severity,
            resource: f.resource,
            snippet: f.snippet,
            kind: f.kind,
            ruleId: f.ruleId,
            scriptUrl: f.scriptUrl,
            matchIndex: (typeof f.matchIndex === 'number' ? f.matchIndex : undefined),
            sources: f.sources,
            sourceRoot: f.sourceRoot,
            sourceHints: f.sourceHints,
            ts: new Date().toISOString()
          });
        
        // Missing CSP
        try{
          const hasCsp = !!document.querySelector('meta[http-equiv="Content-Security-Policy"], meta[content*="Content-Security-Policy"]');
          if (!hasCsp) push({ type: 'CSP Missing', severity: 'medium', description: 'Missing CSP meta tag', resource: location.href, snippet: '<meta ...>' });
        }catch(_){ }
        
        // Inline handlers
        try{
          const attrs = ['onerror','onclick','onload','onmouseover','onmouseout','onfocus','onblur','onsubmit'];
          for (const attr of attrs){
            document.querySelectorAll('[' + attr + ']').forEach((el) => {
              const code = (el.getAttribute && el.getAttribute(attr)) || '';
              if (code) push({ type: 'Inline Handler', severity: 'medium', description: 'Inline handler ' + attr + ' detected', resource: location.href, snippet: String(code).slice(0,140) });
            });
          }
        }catch(_){ }
        
        // Inline / same-origin scripts
        const pats = [
          { type: 'RCE', ruleId: 'js.eval', re: /(eval\s*\(|new Function\s*\()/g, severity: 'critical', description: 'eval/new Function detected' },
          { type: 'XSS', ruleId: 'js.document_write', re: /document\.write\s*\(/g, severity: 'high', description: 'document.write detected' },
          { type: 'XSS', ruleId: 'js.innerHTML', re: /\.innerHTML\s*=\s*/g, severity: 'medium', description: 'innerHTML= detected' },
          { type: 'Open Redirect', ruleId: 'js.location_redirect', re: /(location\.(assign|replace)\s*\(|window\.location\s*=)/g, severity: 'low', description: 'Possible open redirect' },
        ];
        const scripts = Array.from(document.scripts || []);
        for (const s of scripts){
          try{
            const src = s.src || '';
            const abs = src ? new URL(src, location.href).toString() : '';
            let code = '';
            if (s.text && s.text.length) {
              code = s.text.substring(0, 200000);
            } else if (src) {
              try{
                if (abs.startsWith(location.origin)) {
                  const r = await fetch(abs);
                  if (r.ok) code = (await r.text()).substring(0, 200000);
                }
              }catch(_){ }
            }
            if (!code) continue;
            for (const p of pats){
              const idx = code.search(p.re);
              if (idx >= 0) {
                const snippet = code.substr(Math.max(0, idx - 60), 160).replace(/
/g,' ');
                let sources = undefined;
                let sourceRoot = undefined;
                try{
                  if (abs && abs.startsWith(location.origin)) {
                    const candidates = [];
                    candidates.push(abs + '.map');
                    if (/\.js($|\?)/.test(abs)) candidates.push(abs.replace(/\.js(\?.*)?$/,'\.js.map$1'));
                    // Only fetch sourcemaps if enabled (avoids 404 noise for /_next/static/*.map in production)
                    if (!(this && this.config && this.config.enableSourceMaps)) { /* skip */ }
                    else for (const u of candidates) {
                      try{
                        const r = await fetch(u, { cache: 'no-store' });
                        if (!r.ok) continue;
                        const len = Number(r.headers.get('content-length') || '0') || 0;
                        if (len && len > 2000000) break;
                        const j = await r.json();
                        if (j && Array.isArray(j.sources)) {
                          sourceRoot = j.sourceRoot || '';
                          sources = j.sources
                            .map(x => String(x || ''))
                            .filter(x => x.includes('src/') || x.includes('app/') || x.includes('pages/') || x.includes('components/'))
                            .slice(0, 25);
                          break;
                        }
                      }catch(_){}
                    }
                  }
                }catch(_){}
                push({ type: p.type, ruleId: p.ruleId, kind: 'js_scan', severity: p.severity, description: p.description, resource: src || 'inline-script', scriptUrl: abs || src || '', matchIndex: idx, sources, sourceRoot, snippet });
              }
            }
          }catch(_){ }
        }
        
        // Insecure http:// resources
        try{
          const nodes = Array.from(document.querySelectorAll('a[href], img[src], script[src], link[href]'));
          for (const n of nodes){
            const url = (n.getAttribute('href') || n.getAttribute('src') || '').trim();
            if (url && /^http:///i.test(url)) {
              push({ type: 'Insecure Transport', severity: 'medium', description: 'Insecure HTTP resource', resource: url, snippet: (n.outerHTML || '').slice(0,140) });
            }
          }
        }catch(_){ }
        
        // Check security headers (actual response headers, not meta tags)
        try{
          const securityHeaders = [
            'content-security-policy',
            'x-frame-options',
            'x-content-type-options',
            'strict-transport-security',
            'referrer-policy'
          ];
          let resp = null;
          try{ resp = await fetch(location.href, { method: 'HEAD', cache: 'no-store', credentials: 'same-origin' }); }catch(_){}
          if (!resp) { try{ resp = await fetch(location.href, { method: 'GET', cache: 'no-store', credentials: 'same-origin' }); }catch(_){ } }
          if (resp && resp.headers) {
            for (const h of securityHeaders) {
              const val = resp.headers.get(h);
              if (!val) {
                push({ type: 'Missing Security Header', kind: 'response_header', ruleId: 'headers.missing', severity: (h === 'content-security-policy' ? 'medium' : 'low'), description: 'Missing response header: ' + h, resource: location.href, snippet: h, sourceHints: ['next.config.js', 'middleware.ts', 'hosting/CDN headers'] });
              }
            }
          }
        }catch(_){ }
        
        try{ this.flush(); }catch(_){ }
        }catch(_){ }
      };
      // Run scan in idle to avoid blocking render
      if (window.requestIdleCallback) {
        window.requestIdleCallback(runScan, { timeout: 5000 });
      } else {
        setTimeout(runScan, 2000);
      }
    };

    SublyzerSDK.prototype._setupUserTracking = function(){
      this.trackPageView && this.trackPageView();
      document.addEventListener('click',(e)=>{try{if(e.__sublyzerHandled)return;(e).__sublyzerHandled=true;}catch(_){ }this.metrics.userActions = (Number(this.metrics.userActions)||0) + 1; this.metrics.clickCount = (Number(this.metrics.clickCount)||0) + 1; this._queue('user_action',{type:'click', tag:e.target && e.target.tagName, id:e.target && e.target.id, cls:e.target && e.target.className, ts:new Date().toISOString()});}, true);
      
      // Capture form submissions and identify emails
      document.addEventListener('submit',(e)=>{
        try{
          const form = e.target;
          if (!form || !form.querySelectorAll) return;
          const inputs = Array.from(form.querySelectorAll('input, textarea'));
          // Look for email via input[type=email] or any value matching email pattern
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
          let foundEmail = null;
          let nameVal = null;
          let userIdVal = null;
          for (const el of inputs){
            const val = (el && el.value || '').trim();
            const nameAttr = (el && el.name || '').toLowerCase();
            if (!foundEmail && el && el.type === 'email' && emailRegex.test(val)) { foundEmail = val; }
            if (!foundEmail && emailRegex.test(val)) { foundEmail = val; }
            if (!nameVal && /(name|full.?name|first.?name|last.?name)/i.test(nameAttr)) { nameVal = val; }
            if (!userIdVal && /(user.?id|userid)/i.test(nameAttr)) { userIdVal = val; }
          }
          if (foundEmail) {
            try { this.trackEvent && this.trackEvent('identify', { email: foundEmail, name: nameVal || undefined, userId: userIdVal || undefined }); } catch(_){}
          }
        }catch(_){}
        this.metrics.userActions = (Number(this.metrics.userActions)||0) + 1;
        this.metrics.formSubmitCount = (Number(this.metrics.formSubmitCount)||0) + 1;
        this._queue('user_action',{type:'form_submit', id:(e && e.target && e.target.id) || '', cls:(e && e.target && e.target.className) || '', ts:new Date().toISOString()});
      });
      if (!this._sessionActive) { this._sessionActive = true; this._sessionStartAt = Date.now(); this._queue('user_metric', { sessions: 1, ts: new Date().toISOString() }); }
    };
    SublyzerSDK.prototype.trackPageView = function(){
      this.metrics.pageViews++;
      this._queue('page_view', { url: location.href, title: document.title, referrer: document.referrer, ts: new Date().toISOString() });
    };
    SublyzerSDK.prototype.trackEvent = function(eventType, data){
      
      // Map to types accepted by the backend when applicable
      if (eventType === 'cookie_analysis') { this._queue('cookie', { ...(data||{}), ts: new Date().toISOString() }); return; }
      if (eventType === 'download_tracking') { this._queue('download', { ...(data||{}), ts: new Date().toISOString() }); return; }
      this._queue('custom_event', { eventType, data, ts: new Date().toISOString() });
    };
    // Convenience methods for advanced analytics
    SublyzerSDK.prototype.trackConversionStep = function(step){
      try { this.trackEvent && this.trackEvent('conversion_step', { step: String(step||'unknown') }); } catch(_){}
    };
    SublyzerSDK.prototype.trackAbExposure = function(experiment, variant){
      try { this.trackEvent && this.trackEvent('ab_exposure', { experiment: String(experiment||'EXPERIMENT'), variant: String(variant||'A') }); } catch(_){}
    };
    SublyzerSDK.prototype.trackConversion = function(experiment, amount){
      try { this.trackEvent && this.trackEvent('conversion', { experiment: experiment||undefined, amount: Number(amount||0) }); } catch(_){}
    };

    SublyzerSDK.prototype._startAutoCollection = function(){
      this._queue('initial_metrics', { userAgent: navigator.userAgent, lang: navigator.language, platform: navigator.platform, screen: screen.width+'x'+screen.height, viewport: innerWidth+'x'+innerHeight, ts: new Date().toISOString() });
      // Reduce periodic metrics frequency to save resources (5 min instead of 1)
      this._autoMetricsTimer = setInterval(()=>{
        this._queue('periodic_metrics', { uptime: Date.now()-this._startedAt, ts: new Date().toISOString() });
      }, 300000);
    };
    SublyzerSDK.prototype._setupAutoFlush = function(){
      // Use requestIdleCallback for automatic flush when possible
      const doFlush = () => {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => this.flush(), { timeout: this.config.flushInterval });
        } else {
          this.flush();
        }
      };
      this._autoFlushTimer = setInterval(doFlush, this.config.flushInterval);
      window.addEventListener('beforeunload', ()=>{ try{ this.flush(true); }catch(_){} });
    };
    SublyzerSDK.prototype._queue = function(type, data){
      const ev = { type, data, sessionId: this.sessionId, userId: this.userId, integrationCode: this.config.integrationCode, ts: new Date().toISOString() };
      this.eventQueue.push(ev);
      // Increase batch size to reduce flush frequency
      if (this.eventQueue.length >= 20) {
        // Use requestIdleCallback if available to avoid blocking UI
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => this.flush(), { timeout: 2000 });
        } else {
          setTimeout(() => this.flush(), 0);
        }
      }
    };
    SublyzerSDK.prototype.flush = async function(sync){
      // Skip if no events and no usage metrics to send
      if (!this.eventQueue.length && this.metrics.pageViews === 0 && this.metrics.userActions === 0) return;
      const events = this.eventQueue.slice(); this.eventQueue.length = 0;

      // Convert events to the format expected by the backend (/data-collection/collect-batch)
      const items = [];

      // Aggregate usage metrics into a single user_metric item
      try {
        const sessionDuration = Math.max(0, Math.round((Date.now() - this._startedAt) / 1000));
        items.push({
          dataType: 'user_metric',
          data: {
            pageViews: this.metrics.pageViews || 0,
            uniqueVisitors: 1,
            sessions: this._sessionActive ? 1 : 0,
            sessionDuration,
            bounceRate: 0,
            conversionRate: 0,
            userActions: this.metrics.userActions || 0,
            clickCount: this.metrics.clickCount || 0,
            formSubmitCount: this.metrics.formSubmitCount || 0,
            userId: this.userId
          },
          severity: 'low',
          source: 'browser',
          userAgent: navigator.userAgent,
          sessionId: this.sessionId
        });
      } catch(_) {}

      for (const ev of events){
        try {
          if (ev.type === 'error') {
            items.push({
              dataType: 'error',
              data: {
                message: (ev.data && ev.data.message),
                stack: (ev.data && ev.data.stack),
                filename: (ev.data && ev.data.filename),
                lineno: (ev.data && ev.data.lineno),
                colno: (ev.data && ev.data.colno),
                type: (ev.data && ev.data.type) || 'error',
                userId: this.userId
              },
              severity: (ev.data && ev.data.severity) || 'high',
              source: 'browser',
              userAgent: navigator.userAgent,
              sessionId: this.sessionId
            });
          } else if (ev.type === 'performance' || ev.type === 'performance_summary') {
            items.push({
              dataType: 'performance',
              data: {
                loadTime: (ev.data && ev.data.loadTime) || (this.metrics && this.metrics.performance && this.metrics.performance.loadTime) || 0,
                domContentLoaded: (ev.data && ev.data.domContentLoaded) || (this.metrics && this.metrics.performance && this.metrics.performance.domContentLoaded) || 0,
                firstContentfulPaint: (ev.data && ev.data.firstContentfulPaint) || 0,
                largestContentfulPaint: (ev.data && ev.data.largestContentfulPaint) || 0,
                cumulativeLayoutShift: (ev.data && ev.data.cumulativeLayoutShift) || 0,
                firstInputDelay: (ev.data && ev.data.firstInputDelay) || 0,
                timeToInteractive: (ev.data && ev.data.timeToInteractive) || 0,
                userId: this.userId
              },
              source: 'browser',
              userAgent: navigator.userAgent,
              sessionId: this.sessionId
            });
          } else if (ev.type === 'cookie') {
            items.push({
              dataType: 'cookie',
              data: { ...(ev.data || {}), userId: this.userId },
              source: 'browser',
              userAgent: navigator.userAgent,
              sessionId: this.sessionId
            });
          } else if (ev.type === 'download') {
            items.push({
              dataType: 'download',
              data: { ...(ev.data || {}), userId: this.userId },
              source: 'browser',
              userAgent: navigator.userAgent,
              sessionId: this.sessionId
            });
          } else if (ev.type === 'device_info') {
            items.push({
              dataType: 'device_info',
              data: { ...(ev.data || {}), userId: this.userId },
              source: 'browser',
              userAgent: navigator.userAgent,
              sessionId: this.sessionId
            });
          } else if (ev.type === 'custom_event') {
            const et = (ev.data && ev.data.eventType);
            const payload = (ev.data && ev.data.data) || {};
            if (et === 'cookie_analysis') {
              items.push({ dataType: 'cookie', data: { ...payload, userId: this.userId }, source: 'browser', userAgent: navigator.userAgent, sessionId: this.sessionId });
            } else if (et === 'download_tracking') {
              items.push({ dataType: 'download', data: { ...payload, userId: this.userId }, source: 'browser', userAgent: navigator.userAgent, sessionId: this.sessionId });
            } else if (et === 'identify') {
              // Map identify to custom_event with schema { event: { eventType, payload } }
              items.push({ dataType: 'custom_event', data: { userId: this.userId, event: { eventType: 'identify', payload } }, source: 'browser', userAgent: navigator.userAgent, sessionId: this.sessionId });
            } else {
              // Preserve other custom_events in the same schema for future analysis
              items.push({ dataType: 'custom_event', data: { userId: this.userId, event: { eventType: et, payload } }, source: 'browser', userAgent: navigator.userAgent, sessionId: this.sessionId });
            }
          } else if (ev.type === 'vulnerability') {
            const sev = (ev.data && ev.data.severity) || 'medium';
            items.push({ dataType: 'vulnerability', data: { ...(ev.data || {}), userId: this.userId }, severity: sev, source: 'browser', userAgent: navigator.userAgent, sessionId: this.sessionId });
          }
          // page_view and user_action are already aggregated in user_metric and omitted individually
        } catch(_) {}
      }

      if (!items.length) return;

      const payload = { integrationCode: this.config.integrationCode, data: items };
      try{
        if (sync && navigator.sendBeacon){
          const ok = navigator.sendBeacon(this.config.apiUrl+'/data-collection/collect-batch', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
          if(!ok) return; // Silent failure for beacon
        } else {
          const response = await fetch(this.config.apiUrl+'/data-collection/collect-batch', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
          if (!response.ok) return; // Silent failure if response is not OK
        }
      }catch(e){ 
        // Silently ignore network/fetch errors to avoid polluting the console
        // Do not log or propagate the error
        return;
      }
    };
    SublyzerSDK.prototype._log = function(msg, data, level){ if(!this.config.debug) return; const ts=new Date().toISOString(); const m='[Sublyzer '+ts+'] '+msg; (level==='error'?console.error:console.log)(m, data||''); };
    return SublyzerSDK;
  })();

  
  // Resolve configuration dynamically at runtime
  const _scriptEl = document.currentScript || document.querySelector('script[src*="sublyzer"]');
  const _ds = (_scriptEl && _scriptEl.dataset) || {};
  const _g = (typeof window !== 'undefined' && window.SublyzerConfig) || {};
  const _code = (_g.integrationCode || _ds.integrationCode || (function(){ try{return localStorage.getItem('integration_code')||'';}catch(_){return '';} })() || 'JHS7M0USDYUC68YF6NRBG8W5').trim().toUpperCase();
  const _isLocal = (typeof window !== 'undefined') && (/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname));
  const _isSublyzerHost = (typeof window !== 'undefined') && (/(^|\.)sublyzer\.com$/i.test(window.location.hostname));
  const _apiDefault = _isLocal ? 'http://localhost:3001' : (_isSublyzerHost ? '/api/accelerate' : 'https://sublyzer-backend-production.up.railway.app');
  const _api = (_g.apiUrl || _ds.apiUrl || _apiDefault).trim();
  const _name = (_g.appName || _ds.appName || 'My Application').trim();
  const _ver  = (_g.version || _ds.version || '1.0.0').trim();
  const _dbg  = (typeof _g.debug === 'boolean' ? _g.debug : (_ds.debug === 'true' || false));

  const sdk = new SublyzerSDK({
    integrationCode: _code,
    apiUrl: _api,
    appName: _name,
    version: _ver,
    debug: _dbg
  });
  sdk.initialize();
  sdk.trackPageView && sdk.trackPageView();
  try{ sdk.trackEvent('hello_world', { message: 'Sublyzer active' }); }catch(_){}
  if (typeof window !== 'undefined') { window.Sublyzer = sdk; }
  
})();
