// ── BAC CALCULATOR — tools.html only ────────────────────────────────────────
// This file is loaded exclusively on tools.html.
// It holds all calculator/reveal/gazette/weighted-calc code so that other
// pages (resources, university, plans, …) don't pay the download cost.

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
    const nameRow = document.getElementById('calcNameRow');
    if (nameRow) nameRow.style.display = 'grid';
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
    localStorage.setItem('calculatorState', field + 'Subjects');
}

function showFieldSelection() {
    document.querySelectorAll('.subject-container').forEach(container => {
        container.style.display = 'none';
    });
    document.getElementById('fieldSelection').style.display = 'grid';
    const nameRow = document.getElementById('calcNameRow');
    if (nameRow) nameRow.style.display = 'none';
    document.querySelector('.calculator-header h2').textContent = 'حساب معدل البكالوريا';
    document.querySelector('.calculator-header p').textContent = 'اختر شعبتك لحساب المعدل';
    document.getElementById('resultSection').style.display = 'none';
    localStorage.setItem('calculatorState', 'fieldSelection');
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
        errorSpan.classList.remove('visible');
        errorSpan.innerHTML = '';

        input.classList.remove('input-error');
        input.closest('.subject-card')?.classList.remove('card-error');


        if (isOptional && (isNaN(value) || input.value.trim() === '')) {
            continue;
        }

        if (isNaN(value)) {
            errorSpan.innerHTML = '<i class="fas fa-circle-exclamation"></i> الرجاء إدخال علامة صحيحة';
            errorSpan.classList.add('visible');
            input.classList.add('input-error');
            input.closest('.subject-card')?.classList.add('card-error');
            if (!firstErrorInput) firstErrorInput = input;
            hasError = true;
        } else if (value < 0 || value > 20) {
            errorSpan.innerHTML = '<i class="fas fa-circle-exclamation"></i> يجب أن تكون العلامة بين 0 و 20';
            errorSpan.classList.add('visible');
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

    // Store reveal data
    bsRevealData.firstName = (document.getElementById('calcFirstName') || {}).value?.trim() || '';
    bsRevealData.lastName  = (document.getElementById('calcLastName')  || {}).value?.trim() || '';
    bsRevealData.average   = average;
    bsRevealData.mention   = bsGetMention(average);
    bsRevealData.specialty = getFieldName(field);

    document.getElementById('resultSection').style.display = 'none';
    showReveal();

    localStorage.setItem('calculatorState', field + 'Subjects');
}

/* ═══════════════════════════════════════════════════
   RESULT REVEALS
═══════════════════════════════════════════════════ */
const bsRevealData = { firstName:'', lastName:'', average:0, mention:null, specialty:'' };

function bsGetMention(avg) {
    if (avg >= 18) return 'ممتاز';
    if (avg >= 16) return 'جيد جدا';
    if (avg >= 14) return 'جيد';
    if (avg >= 12) return 'حسن';
    if (avg >= 10) return 'مقبول';
    return null;
}

function bsCloseReveal(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; document.body.style.overflow = ''; }
}

/* ── UNIFIED REVEAL ───────────────────────────── */
function showReveal() {
    _buildOEBContent();
    // Reset gazette so it builds fresh on first switch
    document.getElementById('bsGazetteInner').innerHTML = '';
    // Always start on OEB tab
    document.getElementById('bsOebWrapper').style.display = 'flex';
    document.getElementById('bsGazetteWrapper').style.display = 'none';
    document.getElementById('bsTabOeb').classList.add('active');
    document.getElementById('bsTabGazette').classList.remove('active');

    const overlay = document.getElementById('bs-reveal-overlay');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    overlay.scrollTo({ top: 0, behavior: 'instant' });

    // Position pill on OEB after layout paint
    requestAnimationFrame(() => bsUpdatePill('oeb'));

    if (bsRevealData.mention) setTimeout(bsConfetti, 700);
    bsCountUp('bsOebAvg', bsRevealData.average, 1400);
}

function bsSwitchTab(tab) {
    const isOeb = tab === 'oeb';
    document.getElementById('bsTabOeb').classList.toggle('active', isOeb);
    document.getElementById('bsTabGazette').classList.toggle('active', !isOeb);

    if (!isOeb && !document.getElementById('bsGazetteInner').innerHTML) {
        _buildGazetteContent();
    }

    // Animate content swap
    const showEl = document.getElementById(isOeb ? 'bsOebWrapper' : 'bsGazetteWrapper');
    const hideEl = document.getElementById(isOeb ? 'bsGazetteWrapper' : 'bsOebWrapper');
    hideEl.style.opacity = '0';
    hideEl.style.transform = 'translateY(8px)';
    setTimeout(() => {
        hideEl.style.display = 'none';
        hideEl.style.opacity = '';
        hideEl.style.transform = '';
        showEl.style.display = 'flex';
        showEl.style.opacity = '0';
        showEl.style.transform = 'translateY(8px)';
        requestAnimationFrame(() => {
            showEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            showEl.style.opacity = '1';
            showEl.style.transform = 'translateY(0)';
        });
        document.getElementById('bs-reveal-overlay').scrollTo({ top: 0, behavior: 'smooth' });
    }, 120);

    bsUpdatePill(tab);
}

function bsUpdatePill(tab) {
    const pill = document.getElementById('bsTabPill');
    const btn = document.getElementById(tab === 'oeb' ? 'bsTabOeb' : 'bsTabGazette');
    const bar = btn.parentElement;
    if (!pill || !btn) return;
    const barRect = bar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    pill.style.width = btnRect.width + 'px';
    pill.style.left = (btnRect.left - barRect.left) + 'px';
}

/* ── BUILD OEB CONTENT ────────────────────────── */
function _buildOEBContent() {
    const d = bsRevealData;
    const passed = d.mention !== null;
    const reg = "2026" + String(Math.floor(1000 + Math.random() * 9000));
    const fields = [
        { lbl: 'رقم التسجيل', val: reg },
        { lbl: 'اللقب',        val: d.lastName  || '---' },
        { lbl: 'الاسم',        val: d.firstName || '---' },
        { lbl: 'الشعبة',       val: d.specialty },
        { lbl: 'المعدل',       val: '0.00', id: 'bsOebAvg', big: true, highlight: true },
        { lbl: 'الملاحظة',     val: d.mention || 'راسب', pass: passed },
    ];
    document.getElementById('bsOebCongrats').textContent = passed ? 'ألف مبروك' : 'للأسف...';
    document.getElementById('bsOebCongrats').className = 'bs-oeb-congrats ' + (passed ? 'pass' : 'fail');
    document.getElementById('bsOebFields').innerHTML = fields.map(f => `
        <div class="bs-oeb-field${f.highlight ? ' highlight' : ''}">
            <span class="bs-oeb-field-lbl${f.highlight ? '" style="color:#1a3a8f;font-weight:900' : ''}">${f.lbl}</span>
            <span class="bs-oeb-field-sep">:</span>
            <span class="${f.big ? 'bs-oeb-field-val big' : 'bs-oeb-field-val'}"
                  ${f.id ? `id="${f.id}"` : ''}
                  ${f.pass !== undefined ? `style="color:${f.pass ? '#27ae60' : '#7f8c8d'};font-weight:900"` : ''}
            >${f.val}</span>
        </div>`).join('');
}

/* ── BUILD GAZETTE CONTENT ────────────────────── */
function _buildGazetteContent() {
    const d = bsRevealData;
    const passed = d.mention !== null;
    const fullName = [d.lastName, d.firstName].filter(Boolean).join(' ') || '---';
    const avgDisplay = d.average.toFixed(2);
    const mentionText = d.mention || 'غير ناجح';
    const year = new Date().getFullYear();
    const wishText = passed ? 'متمنيين له دوام التفوق و النجاح' : 'متمنيين له التوفيق والنجاح في الفرص القادمة';
    document.getElementById('bsGazetteInner').innerHTML = `
        <div class="bs-gz-top">
            <div class="bs-gz-orn"><span class="bs-gz-ornline"></span><span class="bs-gz-ornsym">✦</span><span class="bs-gz-ornline"></span></div>
            <div class="bs-gz-title">مجلة BAC STORY لنتائج البكالوريا</div>
            <div class="bs-gz-orn"><span class="bs-gz-ornline"></span><span class="bs-gz-ornsym">✦</span><span class="bs-gz-ornline"></span></div>
            <div class="bs-gz-issue">سنة ${year}م &nbsp;|&nbsp; عدد خاص — نتائج البكالوريا</div>
        </div>
        <div class="bs-gz-decree">
            <div class="bs-gz-text">
                <span class="bs-gz-intro">بناءً على نتائج الحاسبة التقديرية لامتحان شهادة البكالوريا ${year}</span>
                <span class="bs-gz-intro">يُسعدنا الإعلان عن ${passed ? 'نجاح' : 'نتيجة'} الطالب/ة:</span>
                <span class="bs-gz-name">${fullName}</span>
                <span class="bs-gz-detail">بمعدل: <strong>${avgDisplay} / 20</strong> &nbsp;—&nbsp; الملاحظة: <strong style="color:${passed ? '#1a3a8f' : '#c0392b'}">${mentionText}</strong></span>
                <span class="bs-gz-spec">وذلك في ${d.specialty}</span>
                <span class="bs-gz-wish">${wishText}</span>
            </div>
        </div>
        <div class="bs-gz-seal">
            <div style="position:relative;display:inline-block;width:110px;height:110px;">
                <svg width="110" height="110" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                    <circle cx="60" cy="60" r="56" fill="none" stroke="#1a3a8f" stroke-width="2.5"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#1a3a8f" stroke-width="1"/>
                    <circle cx="60" cy="60" r="49" fill="rgba(26,58,143,0.05)"/>
                    <defs>
                        <path id="bsTopArc" d="M 22,60 A 38,38 0 0,1 98,60"/>
                        <path id="bsBotArc" d="M 14,60 A 46,46 0 0,0 106,60"/>
                    </defs>
                    <text font-family="'Cairo','Tajawal',sans-serif" font-size="5.5" fill="#1a3a8f" font-weight="700" text-anchor="middle">
                        <textPath href="#bsTopArc" startOffset="50%" dy="14">BAC STORY - منصة التميز في البكالوريا</textPath>
                    </text>
                    <text font-family="'Cairo',sans-serif" font-size="7" fill="#1a3a8f" text-anchor="middle">
                        <textPath href="#bsBotArc" startOffset="50%" dy="-5">bacstory.vercel.app</textPath>
                    </text>
                    <circle cx="32" cy="60" r="2" fill="#1a3a8f" opacity="0.4"/>
                    <circle cx="88" cy="60" r="2" fill="#1a3a8f" opacity="0.4"/>
                </svg>
                <img src="/logo-seal.png"
                     style="position:absolute;top:27px;left:27px;width:56px;height:56px;object-fit:contain;"
                     onerror="this.style.display='none'"/>
            </div>
        </div>`;
    if (passed) setTimeout(bsConfetti, 300);
}

/* keep old names as aliases for any external calls */
function showOEBReveal() { showReveal(); }
function showGazetteReveal() { showReveal(); bsSwitchTab('gazette'); }

/* ── CAPTURE HELPER ──────────────────────────── */
async function _bsCapture(elementId) {
    // For gazette, capture the full card (background, border rings) not just the inner div
    const targetId = elementId === 'bsGazetteInner' ? 'bsGazetteCard' : elementId;
    const el = document.getElementById(targetId);
    if (!el) throw new Error('element not found');

    const isGazette = elementId === 'bsGazetteInner';
    const bg = isGazette ? '#f5f0e8' : '#ffffff';
    const pad = isGazette ? 16 : 28;

    // Freeze animations so html2canvas captures the settled state
    const prevAnimation = el.style.animation;
    const prevTransform = el.style.transform;
    el.style.animation = 'none';
    el.style.transform = 'none';

    // Wait for all webfonts to be ready
    await document.fonts.ready;

    try {
        const raw = await html2canvas(el, {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false,
            x: -pad,
            y: -pad,
            width: el.offsetWidth + pad * 2,
            height: el.offsetHeight + pad * 2,
        });

        if (isGazette) return raw;

        // For OEB: composite card onto white background with professional drop shadow
        const sp = 60; // shadow padding (px at 3x scale)
        const out = document.createElement('canvas');
        out.width  = raw.width  + sp * 2;
        out.height = raw.height + sp * 2;
        const ctx = out.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.shadowColor    = 'rgba(0,0,0,0.22)';
        ctx.shadowBlur     = 80;
        ctx.shadowOffsetX  = 0;
        ctx.shadowOffsetY  = 20;
        ctx.drawImage(raw, sp, sp);
        ctx.shadowColor = 'transparent';
        return out;
    } finally {
        el.style.animation = prevAnimation;
        el.style.transform = prevTransform;
    }
}

/* ── WEIGHTED AVERAGE CALCULATOR ────────────── */
const wcConfig = {
    'math': {
        title: 'بالرياضيات',
        fields: [
            { id: 'wc-bac',  label: 'معدل البكالوريا' },
            { id: 'wc-math', label: 'نقطة الرياضيات' }
        ],
        formula: v => (v['wc-bac'] * 2 + v['wc-math']) / 3
    },
    'math-physics': {
        title: 'بالرياضيات والفيزياء',
        fields: [
            { id: 'wc-bac',     label: 'معدل البكالوريا' },
            { id: 'wc-math',    label: 'نقطة الرياضيات' },
            { id: 'wc-physics', label: 'نقطة الفيزياء' }
        ],
        formula: v => (v['wc-bac'] * 2 + (v['wc-math'] + v['wc-physics']) / 2) / 3
    },
    'math-tech': {
        title: 'بالرياضيات والتكنولوجيا',
        fields: [
            { id: 'wc-bac',  label: 'معدل البكالوريا' },
            { id: 'wc-math', label: 'نقطة الرياضيات' },
            { id: 'wc-tech', label: 'نقطة التكنولوجيا' }
        ],
        formula: v => (v['wc-bac'] * 2 + (v['wc-math'] + v['wc-tech']) / 2) / 3
    },
    'bio': {
        title: 'بالعلوم الطبيعية',
        fields: [
            { id: 'wc-bac', label: 'معدل البكالوريا' },
            { id: 'wc-bio', label: 'نقطة العلوم الطبيعية' }
        ],
        formula: v => (v['wc-bac'] * 2 + v['wc-bio']) / 3
    },
    'lang': {
        title: 'ميدان آداب ولغات',
        fields: [
            { id: 'wc-bac',  label: 'معدل البكالوريا' },
            { id: 'wc-lang', label: 'نقطة اللغة الأجنبية المطلوبة' }
        ],
        formula: v => (v['wc-bac'] * 2 + v['wc-lang']) / 3
    },
    'translation': {
        title: 'ميدان الترجمة',
        fields: [
            { id: 'wc-bac',   label: 'معدل البكالوريا' },
            { id: 'wc-lang1', label: 'اللغة الأجنبية الأولى' },
            { id: 'wc-lang2', label: 'اللغة الأجنبية الثانية' },
            { id: 'wc-lang3', label: 'اللغة الأجنبية الثالثة' }
        ],
        formula: v => (v['wc-bac'] * 2 + (v['wc-lang1'] + v['wc-lang2'] + v['wc-lang3']) / 3) / 3
    }
};

let wcCurrentType = null;

function wcSelectType(type) {
    wcCurrentType = type;
    const cfg = wcConfig[type];
    document.getElementById('wc-type-selection').style.display = 'none';
    document.getElementById('wc-header-title').textContent = 'المعدل الموزون — ' + cfg.title;
    document.getElementById('wc-header-sub').textContent = 'أدخل نقاطك لحساب المعدل الموزون';

    document.getElementById('wc-fields-grid').innerHTML = cfg.fields.map(f => `
        <div class="subject-card">
            <div class="subject-header">
                <div class="subject-name">${f.label}</div>
            </div>
            <div class="grade-input-container">
                <input type="number" id="${f.id}" class="grade-input"
                    min="0" max="20" step="0.01" placeholder="أدخل العلامة"
                    oninput="wcValidate(this)">
                <span class="error-message" id="err-${f.id}"></span>
            </div>
        </div>
    `).join('');

    document.getElementById('wc-inputs').style.display = 'block';
    document.getElementById('wc-result').classList.remove('visible');
}

function wcValidate(input) {
    const val = parseFloat(input.value);
    const err = document.getElementById('err-' + input.id);
    const invalid = input.value !== '' && (isNaN(val) || val < 0 || val > 20);
    input.classList.toggle('input-error', invalid);
    if (err) {
        err.innerHTML = invalid ? '<i class="fas fa-circle-exclamation"></i> القيمة يجب أن تكون بين 0 و 20' : '';
        err.classList.toggle('visible', invalid);
    }
}

function wcAutoCalc() {
    const cfg = wcConfig[wcCurrentType];
    const v = {};
    for (const f of cfg.fields) {
        const el = document.getElementById(f.id);
        const val = parseFloat(el?.value);
        if (isNaN(val) || val < 0 || val > 20) {
            document.getElementById('wc-result').classList.remove('visible');
            return;
        }
        v[f.id] = val;
    }
    const avg = cfg.formula(v);
    const rounded = (Math.round(avg * 100) / 100).toFixed(2);
    document.getElementById('wc-result-value').textContent = rounded;
    document.getElementById('wc-result-note').textContent = '';
    document.getElementById('wc-result').classList.add('visible');
}

function wcFormulaText(type) {
    const map = {
        'math':         '(معدل الباك × 2 + الرياضيات) ÷ 3',
        'math-physics': '(معدل الباك × 2 + (رياضيات + فيزياء) ÷ 2) ÷ 3',
        'math-tech':    '(معدل الباك × 2 + (رياضيات + تكنولوجيا) ÷ 2) ÷ 3',
        'bio':          '(معدل الباك × 2 + علوم طبيعية) ÷ 3',
        'lang':         '(معدل الباك × 2 + اللغة الأجنبية) ÷ 3',
        'translation':  '(معدل الباك × 2 + معدل 3 لغات) ÷ 3'
    };
    return map[type] || '';
}

function wcValidateStrict(input) {
    const val = parseFloat(input.value);
    const err = document.getElementById('err-' + input.id);
    const empty = input.value.trim() === '';
    const outOfRange = !isNaN(val) && (val < 0 || val > 20);
    const invalid = empty || isNaN(val) || outOfRange;
    input.classList.toggle('input-error', invalid);
    if (err) {
        err.innerHTML = invalid
            ? '<i class="fas fa-circle-exclamation"></i> ' + (empty ? 'هذا الحقل مطلوب' : 'القيمة يجب أن تكون بين 0 و 20')
            : '';
        err.classList.toggle('visible', invalid);
    }
    return !invalid;
}

function wcCalculate() {
    const cfg = wcConfig[wcCurrentType];
    if (!cfg) return;
    let allValid = true;
    for (const f of cfg.fields) {
        const el = document.getElementById(f.id);
        if (el && !wcValidateStrict(el)) allValid = false;
    }
    if (!allValid) return;
    wcAutoCalc();
    const result = document.getElementById('wc-result');
    if (result.classList.contains('visible')) {
        result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function wcReset() {
    wcCurrentType = null;
    document.getElementById('wc-header-title').textContent = 'حساب المعدل الموزون';
    document.getElementById('wc-header-sub').textContent = 'اختر الميدان لحساب معدلك الموزون للقبول في التخصصات الجامعية';
    document.getElementById('wc-type-selection').style.display = '';
    document.getElementById('wc-inputs').style.display = 'none';
    document.getElementById('wc-result').classList.remove('visible');
}

/* ── DOWNLOAD AS IMAGE ───────────────────────── */
function bsDownloadImage(elementId, filename) {
    if (typeof html2canvas === 'undefined') return;
    const btn = event.currentTarget;
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

    const fullName = [bsRevealData.firstName, bsRevealData.lastName].filter(Boolean).join('-') || '';
    const finalFilename = (fullName ? `${filename}-${fullName}` : filename) + '-bacstory.png';

    _bsCapture(elementId).then(canvas => {
        const link = document.createElement('a');
        link.download = finalFilename;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
    }).catch(() => {}).finally(() => {
        btn.classList.remove('loading');
        btn.innerHTML = '<i class="fas fa-download"></i> حفظ';
    });
}

/* ── SHARE IMAGE ─────────────────────────────── */
function bsShareImage(elementId, filename) {
    if (typeof html2canvas === 'undefined') return;
    const btn = event.currentTarget;
    const origHTML = btn.innerHTML;
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحضير...';

    const fullName = [bsRevealData.firstName, bsRevealData.lastName].filter(Boolean).join('-') || '';
    const finalFilename = (fullName ? `${filename}-${fullName}` : filename) + '-bacstory.png';

    _bsCapture(elementId).then(canvas => {
        return new Promise((resolve) => {
            canvas.toBlob(async (blob) => {
                const file = new File([blob], finalFilename, { type: 'image/png' });
                const shareData = { files: [file], title: 'نتيجتي في البكالوريا', text: 'شوف نتيجتي في البكالوريا على BAC STORY' };
                if (navigator.canShare && navigator.canShare(shareData)) {
                    try { await navigator.share(shareData); } catch (e) {}
                } else {
                    const link = document.createElement('a');
                    link.download = finalFilename;
                    link.href = canvas.toDataURL('image/png', 1.0);
                    link.click();
                }
                resolve();
            }, 'image/png');
        });
    }).catch(() => {}).finally(() => {
        btn.classList.remove('loading');
        btn.innerHTML = origHTML;
    });
}

/* ── COUNT UP ────────────────────────────────── */
function bsCountUp(elId, target, duration) {
    const el = document.getElementById(elId);
    if (!el) return;
    const start = performance.now();
    (function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = (e * target).toFixed(2);
        if (p < 1) requestAnimationFrame(tick);
    })(start);
}

/* ── CONFETTI ────────────────────────────────── */
function bsConfetti() {
    const colors = ['#ffd54f','#2c5cc5','#27ae60','#e53e3e','#9b59b6','#f39c12'];
    let c = document.getElementById('bs-confetti-container');
    if (!c) {
        c = document.createElement('div');
        c.id = 'bs-confetti-container';
        c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:10000;overflow:hidden';
        document.body.appendChild(c);
    }
    c.innerHTML = '';
    for (let i = 0; i < 80; i++) {
        const p = document.createElement('div');
        const sz = 6 + Math.random() * 8;
        p.style.cssText = `position:absolute;top:-12px;left:${Math.random()*100}%;`+
            `background:${colors[Math.floor(Math.random()*colors.length)]};`+
            `width:${sz}px;height:${sz*1.6}px;`+
            `border-radius:${Math.random()>.5?'50%':'2px'};`+
            `animation:bsConfettiFall ${2+Math.random()*2}s ${Math.random()*1.2}s linear forwards;`+
            `transform:rotate(${Math.random()*360}deg);opacity:.9`;
        c.appendChild(p);
    }
    setTimeout(() => { if (c) c.innerHTML = ''; }, 5000);
}

if (!document.getElementById('bs-confetti-style')) {
    const s = document.createElement('style');
    s.id = 'bs-confetti-style';
    s.textContent = '@keyframes bsConfettiFall{from{transform:translateY(0) rotate(0deg);opacity:1}to{transform:translateY(110vh) rotate(720deg);opacity:0}}';
    document.head.appendChild(s);
}

function resetForm() {
    document.querySelectorAll('.grade-input').forEach(input => {
        input.value = '';
        const errorSpan = input.parentElement.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.classList.remove('visible');
            errorSpan.innerHTML = '';
        }
    });

    const fnInput = document.getElementById('calcFirstName');
    if (fnInput) fnInput.value = '';
    const lnInput = document.getElementById('calcLastName');
    if (lnInput) lnInput.value = '';

    localStorage.removeItem('calculatorGrades');

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

    document.getElementById('science-science-grade').value = '18.5';
    document.getElementById('science-math-grade').value = '19.0';
    document.getElementById('science-physics-grade').value = '19.0';
    document.getElementById('science-arabic-grade').value = '16.5';
    document.getElementById('science-islamics-grade').value = '16.5';
    document.getElementById('science-history-geo-grade').value = '18.5';
    document.getElementById('science-english-grade').value = '18.5';
    document.getElementById('science-french-grade').value = '18.0';
    document.getElementById('science-philo-grade').value = '17.5';
    document.getElementById('science-tamazight-grade').value = '';
    document.getElementById('science-sport-grade').value = '19.83';

    document.getElementById('tech-tech-grade').value = '20';
    document.getElementById('tech-math-grade').value = '20';
    document.getElementById('tech-physics-grade').value = '19';
    document.getElementById('tech-arabic-grade').value = '18.5';
    document.getElementById('tech-islamics-grade').value = '20';
    document.getElementById('tech-history-geo-grade').value = '18';
    document.getElementById('tech-english-grade').value = '19.5';
    document.getElementById('tech-french-grade').value = '18';
    document.getElementById('tech-philo-grade').value = '16';
    document.getElementById('tech-tamazight-grade').value = '';
    document.getElementById('tech-sport-grade').value = '19';

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

function saveCalculatorData() {
    const grades = {};
    document.querySelectorAll('.grade-input').forEach(input => {
        if (input.value.trim() !== '') {
            grades[input.id] = input.value;
        }
    });
    const firstName = document.getElementById('calcFirstName')?.value || '';
    const lastName = document.getElementById('calcLastName')?.value || '';
    localStorage.setItem('calculatorGrades', JSON.stringify({ grades, firstName, lastName }));
}

function loadCalculatorData() {
    const saved = localStorage.getItem('calculatorGrades');
    if (!saved) {
        initSampleData();
        return;
    }
    try {
        const { grades, firstName, lastName } = JSON.parse(saved);
        if (grades) {
            for (const [id, val] of Object.entries(grades)) {
                const el = document.getElementById(id);
                if (el) el.value = val;
            }
        }
        const fnInput = document.getElementById('calcFirstName');
        if (fnInput && firstName !== undefined) fnInput.value = firstName;
        const lnInput = document.getElementById('calcLastName');
        if (lnInput && lastName !== undefined) lnInput.value = lastName;
    } catch (e) {
        initSampleData();
    }
}

function validateGradeInput(input) {
    const val = parseFloat(input.value);
    const isOptional = input.closest('.subject-card.optional') !== null;
    const errorSpan = input.parentElement.querySelector('.error-message');
    const card = input.closest('.subject-card');

    if (!errorSpan) return;

    const empty = input.value.trim() === '' || isNaN(val);
    const outOfRange = !isNaN(val) && (val < 0 || val > 20);

    if (isOptional && empty) {
        errorSpan.classList.remove('visible');
        errorSpan.innerHTML = '';
        input.classList.remove('input-error');
        card?.classList.remove('card-error');
    } else if (empty) {
        errorSpan.classList.remove('visible');
        errorSpan.innerHTML = '';
        input.classList.remove('input-error');
        card?.classList.remove('card-error');
    } else if (outOfRange) {
        errorSpan.innerHTML = '<i class="fas fa-circle-exclamation"></i> يجب أن تكون العلامة بين 0 و 20';
        errorSpan.classList.add('visible');
        input.classList.add('input-error');
        card?.classList.add('card-error');
    } else {
        errorSpan.classList.remove('visible');
        errorSpan.innerHTML = '';
        input.classList.remove('input-error');
        card?.classList.remove('card-error');
    }
}

// Calculator-specific DOMContentLoaded setup
document.addEventListener('DOMContentLoaded', function () {
    // Real-time validation + auto-save for all grade inputs
    document.addEventListener('input', function (e) {
        if (e.target.classList.contains('grade-input')) {
            validateGradeInput(e.target);
            saveCalculatorData();
        }
        if (e.target.id === 'calcFirstName' || e.target.id === 'calcLastName') {
            saveCalculatorData();
        }
    });

    // Restore saved grades (or fill sample data on first visit)
    loadCalculatorData();
});
