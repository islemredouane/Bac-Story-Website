/**
 * BAC STORY — Auth Singleton
 * Exposes window.Auth for site-wide authentication management.
 * Handles Email OTP, Telegram OTP, and Google OAuth flows.
 */
(function () {
  'use strict';

  const SESSION_KEY = 'bs_session';
  const GOOGLE_CLIENT_ID = (typeof window !== 'undefined' && window.BS_GOOGLE_CLIENT_ID) || '';

  // ─── Internal state ────────────────────────────────────────────────────────
  let _session = null;       // { token, user }
  let _listeners = [];       // onAuthChange callbacks
  let _modalEl = null;       // injected overlay element
  let _modalOpts = {};       // current openModal options
  let _googleLoaded = false; // GIS SDK loaded flag

  // ─── Algerian wilayas ──────────────────────────────────────────────────────
  const WILAYAS = [
    'أدرار','الشلف','الأغواط','أم البواقي','باتنة','بجاية','بسكرة','بشار',
    'البليدة','البويرة','تمنراست','تبسة','تلمسان','تيارت','تيزي وزو','الجزائر',
    'الجلفة','جيجل','سطيف','سعيدة','سكيكدة','سيدي بلعباس','عنابة','قالمة',
    'قسنطينة','المدية','مستغانم','المسيلة','معسكر','ورقلة','وهران','البيض',
    'إليزي','برج بوعريريج','بومرداس','الطارف','تندوف','تيسمسيلت','الوادي',
    'خنشلة','سوق أهراس','تيبازة','ميلة','عين الدفلى','النعامة','عين تموشنت',
    'غرداية','غليزان','تيميمون','برج باجي مختار','أولاد جلال','بني عباس',
    'عين صالح','عين قزام','تقرت','جانت','المغير','المنيعة'
  ];

  const SPECIALTIES = [
    { value: 'math',        label: 'رياضيات' },
    { value: 'science',     label: 'علوم تجريبية' },
    { value: 'tech',        label: 'تقني رياضي' },
    { value: 'management',  label: 'تسيير واقتصاد' },
    { value: 'literature',  label: 'آداب وفلسفة' },
    { value: 'languages',   label: 'لغات أجنبية' },
  ];

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function _saveSession(data) {
    _session = data;
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function _clearSession() {
    _session = null;
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  function _fireListeners(user) {
    _listeners.forEach(cb => { try { cb(user); } catch (e) {} });
  }

  function _updateNavbar(user) {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.classList.toggle('navbar--authed', !!user);
    }

    // ── Desktop auth zone ──────────────────────────────────────────────────
    const zone = document.getElementById('nav-auth-zone');
    if (zone) {
      if (!user) {
        zone.innerHTML = ''; // Handled by .nav-links-state--out
      } else {
        const firstName = (user.name || '').split(' ')[0] || 'حسابي';
        const initial   = (firstName[0] || 'م').toUpperCase();
        zone.innerHTML = `
          <div class="nav-user-dropdown">
            <button class="nav-user-chip" aria-haspopup="true" aria-expanded="false">
              <span class="nav-user-avatar">${_esc(initial)}</span>
              <span class="nav-user-name">${_esc(firstName)}</span>
              <i class="fas fa-chevron-down nav-user-caret"></i>
            </button>
            <div class="nav-user-menu">
              <a href="/dashboard.html"><i class="fas fa-th-large"></i> الفضاء الخاص</a>
              <div class="nav-user-menu-divider"></div>
              <button onclick="Auth.logout()"><i class="fas fa-sign-out-alt"></i> تسجيل الخروج</button>
            </div>
          </div>`;
      }
    }

    // ── Search visibility ──────────────────────────────────────────────────
    const searchDesktop = document.getElementById('navSearchDesktop');
    const searchMobile = document.getElementById('navSearchMobile');
    if (searchDesktop) searchDesktop.style.display = user ? 'flex' : 'none';
    if (searchMobile) searchMobile.style.display = user ? 'block' : 'none';

    // ── User dropdown toggle ──────────────────────────────────────────────
    if (user) {
      const chip = zone && zone.querySelector('.nav-user-chip');
      const wrap = zone && zone.querySelector('.nav-user-dropdown');
      if (chip && wrap) {
        chip.addEventListener('click', function (e) {
          e.stopPropagation();
          const opening = !wrap.classList.contains('open');
          wrap.classList.toggle('open', opening);
          chip.setAttribute('aria-expanded', String(opening));
        });
        document.addEventListener('click', function (e) {
          if (wrap && !wrap.contains(e.target)) {
            wrap.classList.remove('open');
            chip.setAttribute('aria-expanded', 'false');
          }
        });
      }
    }

    // ── Mobile drawer auth state ───────────────────────────────────────────
    const drawer = document.getElementById('navMobileDrawer');
    if (drawer) drawer.classList.toggle('nmd--authed', !!user);

    // ── Mobile drawer user card ────────────────────────────────────────────
    if (user) {
      const firstName = (user.name || '').split(' ')[0] || 'المستخدم';
      const avatarEl  = document.getElementById('nmdUserAvatar');
      const nameEl    = document.getElementById('nmdUserName');
      if (avatarEl) avatarEl.textContent = firstName[0] || 'م';
      if (nameEl)   nameEl.textContent   = firstName;
    }

    // ── Mobile bottom bar auth state ──────────────────────────────────────
    const bottomBar = document.getElementById('mobileBottomBar');
    if (bottomBar) bottomBar.classList.toggle('is-authed', !!user);
  }

  function _esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _specialtyOptions(selected) {
    return SPECIALTIES.map(s =>
      `<option value="${s.value}"${selected === s.value ? ' selected' : ''}>${s.label}</option>`
    ).join('');
  }

  function _wilayaOptions(selected) {
    return WILAYAS.map(w =>
      `<option value="${w}"${selected === w ? ' selected' : ''}>${w}</option>`
    ).join('');
  }

  // ─── Load Google Identity Services SDK ─────────────────────────────────────
  function _loadGIS() {
    if (_googleLoaded || !GOOGLE_CLIENT_ID) return;
    return new Promise((resolve) => {
      if (typeof google !== 'undefined' && google.accounts) { _googleLoaded = true; resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = () => { _googleLoaded = true; resolve(); };
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }

  // ─── Modal HTML template ───────────────────────────────────────────────────
  function _buildModalHTML(message) {
    const msgHtml = message ? `<div class="bs-auth-header-message">${_esc(message)}</div>` : '';
    const specialtyOpts = `<option value="">اختر شعبتك</option>` + _specialtyOptions('');
    const wilayaOpts = `<option value="">اختر ولايتك</option>` + _wilayaOptions('');

    return `
<div class="bs-auth-overlay" id="bs-auth-overlay" role="dialog" aria-modal="true" aria-label="نافذة تسجيل الدخول">
  <div class="bs-auth-modal" id="bs-auth-modal">

    <!-- ── LEFT PANEL: Atmospheric Branded Side ── -->
    <div class="bs-auth-left" aria-hidden="true">
      <div class="bs-auth-left-content">
        <div class="bs-auth-left-logo">BAC <span>STORY</span></div>
        <div class="bs-auth-left-tagline">رفيقك الذكي لبكالوريا 2026</div>
        
        <div class="bs-auth-left-feats">
          <div class="bs-auth-left-feat"><i class="fas fa-robot"></i><span>إسلام AI — 5 أوضاع مختلفة</span></div>
          <div class="bs-auth-left-feat"><i class="fas fa-book-open"></i><span>آلاف الملخصات والتمارين</span></div>
          <div class="bs-auth-left-feat"><i class="fas fa-university"></i><span>دليل الجامعات 2025</span></div>
          <div class="bs-auth-left-feat"><i class="fas fa-users"></i><span>+15,000 طالب مسجل</span></div>
        </div>

        <div class="bs-auth-left-quote">
          <p>" إسلام شرح لي في 10 دقايق اللي ما فهمتوش في شهور كاملة! "</p>
          <div class="bs-auth-left-qauthor">أمين بن علي — شعبة رياضيات، قسنطينة</div>
        </div>
      </div>
    </div>

    <!-- ── RIGHT PANEL: Clean Modern Form ── -->
    <div class="bs-auth-right">
      <button class="bs-auth-close" id="bs-auth-close" aria-label="إغلاق"><i class="fas fa-times"></i></button>

      <div class="bs-auth-tabs-wrap">
        <div class="bs-auth-tabs" role="tablist">
          <button class="bs-auth-tab active" data-tab="email" role="tab" aria-selected="true">البريد الإلكتروني</button>
          <button class="bs-auth-tab" data-tab="telegram" role="tab" aria-selected="false">تيليجرام</button>
          <button class="bs-auth-tab" data-tab="google" role="tab" aria-selected="false">Google</button>
        </div>
      </div>

      <div class="bs-auth-body">
        <div class="bs-auth-error" id="bs-auth-global-error"></div>
        <div class="bs-auth-success" id="bs-auth-global-success"></div>

        <!-- ── EMAIL panel ── -->
        <div class="bs-auth-panel active" id="bs-panel-email" role="tabpanel">
          <div id="bs-email-step1">
            <div class="bs-auth-group">
              <label class="bs-auth-label">البريد الإلكتروني <span class="req">*</span></label>
              <div class="bs-auth-input-wrap">
                <input class="bs-auth-input" id="bs-email-input" type="email" placeholder="example@gmail.com" autocomplete="email" dir="ltr">
                <i class="fas fa-envelope bs-auth-input-icon"></i>
              </div>
            </div>
            <div class="bs-auth-group">
              <label class="bs-auth-label">الاسم الكامل <span class="req">*</span></label>
              <div class="bs-auth-input-wrap">
                <input class="bs-auth-input" id="bs-email-name" type="text" placeholder="أدخل اسمك الكامل" autocomplete="name">
                <i class="fas fa-user bs-auth-input-icon"></i>
              </div>
            </div>
            <div class="bs-auth-group">
              <label class="bs-auth-label">الشعبة <span class="req">*</span></label>
              <div class="bs-auth-input-wrap">
                <select class="bs-auth-input" id="bs-email-specialty">${specialtyOpts}</select>
                <i class="fas fa-graduation-cap bs-auth-input-icon"></i>
              </div>
            </div>
            <div class="bs-auth-group">
              <label class="bs-auth-label">الولاية <span class="req">*</span></label>
              <div class="bs-auth-input-wrap">
                <select class="bs-auth-input" id="bs-email-wilaya">${wilayaOpts}</select>
                <i class="fas fa-map-marker-alt bs-auth-input-icon"></i>
              </div>
            </div>
            <button class="bs-auth-btn-primary" id="bs-email-send-btn">
              <i class="fas fa-paper-plane"></i> إرسال الكود
            </button>
            <div class="bs-auth-footer-note">سيصلك كود مكوّن من 6 أرقام على بريدك الإلكتروني</div>
          </div>

          <div id="bs-email-step2" style="display:none">
            <button class="bs-auth-back" id="bs-email-back"><i class="fas fa-arrow-right"></i> تغيير البريد الإلكتروني</button>
            <div class="bs-auth-otp-hint">أدخل الكود المرسل إلى <strong id="bs-email-sent-to"></strong></div>
            <div class="bs-auth-otp-row" id="bs-email-otp-row">
              ${[0,1,2,3,4,5].map(i=>`<input class="bs-auth-otp-digit" maxlength="1" data-index="${i}" type="text" inputmode="numeric" pattern="[0-9]">`).join('')}
            </div>
            <div class="bs-auth-resend">
              لم يصلك الكود؟
              <button class="bs-auth-resend-btn" id="bs-email-resend-btn" disabled>إعادة الإرسال (<span id="bs-email-resend-timer">60</span>ث)</button>
            </div>
          </div>
        </div>

        <!-- ── TELEGRAM panel ── -->
        <div class="bs-auth-panel" id="bs-panel-telegram" role="tabpanel">
          <div id="bs-tg-step1">
            <div class="bs-auth-tg-steps">
              <div class="bs-auth-tg-step">
                <div class="bs-auth-tg-step-num">1</div>
                <div>افتح البوت: <a class="bs-auth-tg-bot-link" href="https://t.me/BacStoryVBot" target="_blank">@BacStoryVBot</a></div>
              </div>
              <div class="bs-auth-tg-step">
                <div class="bs-auth-tg-step-num">2</div>
                <div>أرسل الأمر <strong>/start</strong> للبوت</div>
              </div>
              <div class="bs-auth-tg-step">
                <div class="bs-auth-tg-step-num">3</div>
                <div>سيرسل لك الـ ID الخاص بك، قم بنسخه ولصقه أدناه</div>
              </div>
            </div>
            <div class="bs-auth-group">
              <label class="bs-auth-label">Telegram Chat ID <span class="req">*</span></label>
              <div class="bs-auth-input-wrap">
                <input class="bs-auth-input" id="bs-tg-chatid" type="text" placeholder="مثال: 123456789" dir="ltr">
                <i class="fab fa-telegram-plane bs-auth-input-icon"></i>
              </div>
            </div>
            <div class="bs-auth-group">
              <label class="bs-auth-label">الاسم الكامل <span class="req">*</span></label>
              <div class="bs-auth-input-wrap">
                <input class="bs-auth-input" id="bs-tg-name" type="text" placeholder="أدخل اسمك الكامل">
                <i class="fas fa-user bs-auth-input-icon"></i>
              </div>
            </div>
            <div class="bs-auth-group">
              <label class="bs-auth-label">الشعبة <span class="req">*</span></label>
              <div class="bs-auth-input-wrap">
                <select class="bs-auth-input" id="bs-tg-specialty">${specialtyOpts}</select>
                <i class="fas fa-graduation-cap bs-auth-input-icon"></i>
              </div>
            </div>
            <div class="bs-auth-group">
              <label class="bs-auth-label">الولاية <span class="req">*</span></label>
              <div class="bs-auth-input-wrap">
                <select class="bs-auth-input" id="bs-tg-wilaya">${wilayaOpts}</select>
                <i class="fas fa-map-marker-alt bs-auth-input-icon"></i>
              </div>
            </div>
            <button class="bs-auth-btn-primary" id="bs-tg-send-btn">
              <i class="fab fa-telegram-plane"></i> إرسال الكود
            </button>
            <div class="bs-auth-footer-note">سيصلك كود مكوّن من 6 أرقام في التلغرام</div>
          </div>

          <div id="bs-tg-step2" style="display:none">
            <button class="bs-auth-back" id="bs-tg-back"><i class="fas fa-arrow-right"></i> تغيير المعلومات</button>
            <div class="bs-auth-otp-hint">أدخل الكود المرسل إليك عبر تيليجرام</div>
            <div class="bs-auth-otp-row" id="bs-tg-otp-row">
              ${[0,1,2,3,4,5].map(i=>`<input class="bs-auth-otp-digit" maxlength="1" data-index="${i}" type="text" inputmode="numeric" pattern="[0-9]">`).join('')}
            </div>
          </div>
        </div>

        <!-- ── GOOGLE panel ── -->
        <div class="bs-auth-panel" id="bs-panel-google" role="tabpanel">
          <div id="bs-google-step1">
            <div class="bs-auth-google-desc">سجّل دخولك سريعاً وبأمان باستخدام حساب Google</div>
            <button class="bs-auth-google-btn" id="bs-google-sign-btn">
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              المتابعة باستخدام Google
            </button>
          </div>

          <div id="bs-google-step2" style="display:none">
            <div class="bs-auth-profile-section-title"><i class="fas fa-user-circle"></i> أكمل ملفك الشخصي</div>
            <div class="bs-auth-group">
              <label class="bs-auth-label">الاسم الكامل <span class="req">*</span></label>
              <div class="bs-auth-input-wrap">
                <input class="bs-auth-input" id="bs-google-name" type="text" placeholder="أدخل اسمك الكامل">
                <i class="fas fa-user bs-auth-input-icon"></i>
              </div>
            </div>
            <div class="bs-auth-group">
              <label class="bs-auth-label">الشعبة <span class="req">*</span></label>
              <div class="bs-auth-input-wrap">
                <select class="bs-auth-input" id="bs-google-specialty">${specialtyOpts}</select>
                <i class="fas fa-graduation-cap bs-auth-input-icon"></i>
              </div>
            </div>
            <div class="bs-auth-group">
              <label class="bs-auth-label">الولاية <span class="req">*</span></label>
              <div class="bs-auth-input-wrap">
                <select class="bs-auth-input" id="bs-google-wilaya">${wilayaOpts}</select>
                <i class="fas fa-map-marker-alt bs-auth-input-icon"></i>
              </div>
            </div>
            <button class="bs-auth-btn-primary" id="bs-google-complete-btn">
              <i class="fas fa-check"></i> إتمام التسجيل
            </button>
          </div>
        </div>

        <div class="bs-auth-footer-note">بالاستمرار، أنت توافق على <a href="/terms.html">شروط الخدمة</a> و <a href="/privacy.html">سياسة الخصوصية</a></div>

      </div><!-- /body -->

      <div class="bs-auth-loading" id="bs-auth-loading">
        <div class="bs-auth-spinner"></div>
        <div class="bs-auth-loading-text" id="bs-auth-loading-text">جارٍ التحميل...</div>
      </div>

    </div><!-- /right -->

  </div><!-- /modal -->
</div><!-- /overlay -->`;
  }

  // ─── Show/hide helpers ──────────────────────────────────────────────────────
  function _showLoading(text) {
    const el = document.getElementById('bs-auth-loading');
    const tx = document.getElementById('bs-auth-loading-text');
    if (el) { el.classList.add('visible'); }
    if (tx && text) tx.textContent = text;
  }
  function _hideLoading() {
    const el = document.getElementById('bs-auth-loading');
    if (el) el.classList.remove('visible');
  }
  function _showError(msg) {
    const el = document.getElementById('bs-auth-global-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
    const s = document.getElementById('bs-auth-global-success');
    if (s) s.classList.remove('visible');
  }
  function _showSuccess(msg) {
    const el = document.getElementById('bs-auth-global-success');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
    const e = document.getElementById('bs-auth-global-error');
    if (e) e.classList.remove('visible');
  }

  function _initCustomSelects() {
    const selects = document.querySelectorAll('select.bs-auth-input');
    selects.forEach(select => {
      if (select.closest('.bs-custom-select')) return;

      const wrap = document.createElement('div');
      wrap.className = 'bs-custom-select';
      select.parentNode.insertBefore(wrap, select);
      wrap.appendChild(select);

      const trigger = document.createElement('div');
      trigger.className = 'bs-custom-select-trigger';
      trigger.textContent = select.options[select.selectedIndex]?.textContent || 'اختر...';
      wrap.appendChild(trigger);

      const options = document.createElement('div');
      options.className = 'bs-custom-options';
      
      const refreshOptions = () => {
        options.innerHTML = '';
        Array.from(select.options).forEach((opt, idx) => {
          const o = document.createElement('div');
          o.className = 'bs-custom-option' + (opt.selected ? ' selected' : '');
          o.textContent = opt.textContent;
          o.addEventListener('click', (e) => {
            e.stopPropagation();
            select.value = opt.value;
            trigger.textContent = opt.textContent;
            wrap.classList.remove('active');
            select.dispatchEvent(new Event('change', { bubbles: true }));
          });
          options.appendChild(o);
        });
      };

      refreshOptions();
      wrap.appendChild(options);

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasActive = wrap.classList.contains('active');
        document.querySelectorAll('.bs-custom-select').forEach(s => s.classList.remove('active'));
        if (!wasActive) wrap.classList.add('active');
      });

      select.addEventListener('change', () => {
        trigger.textContent = select.options[select.selectedIndex]?.textContent || '';
        refreshOptions();
      });
    });

    // Close on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.bs-custom-select').forEach(s => s.classList.remove('active'));
    });
  }

  function _clearMessages() {
    ['bs-auth-global-error','bs-auth-global-success'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('visible');
    });
  }

  // ─── OTP digit row logic ────────────────────────────────────────────────────
  function _initOtpRow(rowId, onComplete) {
    const row = document.getElementById(rowId);
    if (!row) return;
    const inputs = Array.from(row.querySelectorAll('.bs-auth-otp-digit'));

    inputs.forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        inp.value = val.slice(-1);
        inp.classList.toggle('filled', !!inp.value);
        if (inp.value && idx < inputs.length - 1) {
          inputs[idx + 1].focus();
        }
        if (inputs.every(i => i.value)) {
          const code = inputs.map(i => i.value).join('');
          onComplete(code);
        }
      });

      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !inp.value && idx > 0) {
          inputs[idx - 1].focus();
          inputs[idx - 1].value = '';
          inputs[idx - 1].classList.remove('filled');
        }
        if (e.key === 'ArrowLeft' && idx > 0) inputs[idx - 1].focus();
        if (e.key === 'ArrowRight' && idx < inputs.length - 1) inputs[idx + 1].focus();
      });

      inp.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g,'');
        pasted.split('').slice(0, 6).forEach((ch, i) => {
          if (inputs[i]) { inputs[i].value = ch; inputs[i].classList.add('filled'); }
        });
        if (pasted.length >= 6) {
          const code = inputs.map(i => i.value).join('');
          if (code.length === 6) onComplete(code);
        } else if (inputs[pasted.length]) {
          inputs[pasted.length].focus();
        }
      });
    });
    // focus first on display
    requestAnimationFrame(() => { if (inputs[0]) inputs[0].focus(); });
  }

  function _clearOtpRow(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    row.querySelectorAll('.bs-auth-otp-digit').forEach(i => { i.value = ''; i.classList.remove('filled'); });
  }

  // ─── Resend countdown ───────────────────────────────────────────────────────
  function _startResendTimer(btnId, timerId, seconds, onResend) {
    let remaining = seconds;
    const btn = document.getElementById(btnId);
    const timer = document.getElementById(timerId);
    if (!btn || !timer) return;
    btn.disabled = true;
    const iv = setInterval(() => {
      remaining--;
      timer.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(iv);
        btn.disabled = false;
        btn.textContent = 'إعادة الإرسال';
        btn.onclick = onResend;
      }
    }, 1000);
  }

  // ─── API calls ─────────────────────────────────────────────────────────────
  async function _apiPost(path, body) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'حدث خطأ، حاول مجدداً');
    return data;
  }

  // ─── Handle successful auth ─────────────────────────────────────────────────
  function _onAuthSuccess(token, user, isNewUser) {
    _saveSession({ token, user });
    _hideLoading();
    _closeModal();
    _updateNavbar(user);
    _fireListeners(user);

    // onboarding redirect
    if (user.onboarding_done === false) {
      window.location.href = '/onboarding.html';
      return;
    }

    // redirectAfter
    if (_modalOpts.redirectAfter) {
      window.location.href = _modalOpts.redirectAfter;
      return;
    }

    if (typeof _modalOpts.onSuccess === 'function') {
      _modalOpts.onSuccess(user, isNewUser);
    }
  }

  // ─── Email flow ─────────────────────────────────────────────────────────────
  function _bindEmailFlow() {
    // Step 1 → send OTP
    const sendBtn = document.getElementById('bs-email-send-btn');
    if (sendBtn) sendBtn.addEventListener('click', _emailSendOtp);

    // Enter key on inputs
    ['bs-email-input','bs-email-name'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') _emailSendOtp(); });
    });

    // Back
    const backBtn = document.getElementById('bs-email-back');
    if (backBtn) backBtn.addEventListener('click', () => {
      document.getElementById('bs-email-step1').style.display = '';
      document.getElementById('bs-email-step2').style.display = 'none';
      _clearMessages();
      _clearOtpRow('bs-email-otp-row');
    });

    // Resend
    const resendBtn = document.getElementById('bs-email-resend-btn');
    if (resendBtn) resendBtn.onclick = _emailSendOtp;
  }

  async function _emailSendOtp() {
    _clearMessages();
    const email = document.getElementById('bs-email-input')?.value.trim();
    const name = document.getElementById('bs-email-name')?.value.trim();
    const specialty = document.getElementById('bs-email-specialty')?.value;
    const wilaya = document.getElementById('bs-email-wilaya')?.value;

    if (!email || !name || !specialty || !wilaya) {
      _showError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      _showError('البريد الإلكتروني غير صحيح');
      return;
    }

    _showLoading('جارٍ إرسال الكود...');
    try {
      await _apiPost('/api/auth-send-otp', { identifier: email, type: 'email', name, specialty, wilaya });
      _hideLoading();
      const sentTo = document.getElementById('bs-email-sent-to');
      if (sentTo) sentTo.textContent = email;
      document.getElementById('bs-email-step1').style.display = 'none';
      document.getElementById('bs-email-step2').style.display = '';
      _clearOtpRow('bs-email-otp-row');
      _initOtpRow('bs-email-otp-row', (code) => _emailVerifyOtp(code));
      _startResendTimer('bs-email-resend-btn', 'bs-email-resend-timer', 60, _emailSendOtp);
      _showSuccess('تم إرسال الكود! تحقق من بريدك الإلكتروني');
    } catch (err) {
      _hideLoading();
      _showError(err.message);
    }
  }

  async function _emailVerifyOtp(code) {
    const email = document.getElementById('bs-email-input')?.value.trim();
    const name = document.getElementById('bs-email-name')?.value.trim();
    const specialty = document.getElementById('bs-email-specialty')?.value;
    const wilaya = document.getElementById('bs-email-wilaya')?.value;

    _showLoading('جارٍ التحقق...');
    try {
      const data = await _apiPost('/api/auth-verify-otp', {
        identifier: email, code, type: 'email', name, specialty, wilaya
      });
      _onAuthSuccess(data.token, data.user, data.is_new_user);
    } catch (err) {
      _hideLoading();
      _showError(err.message);
      _clearOtpRow('bs-email-otp-row');
      _initOtpRow('bs-email-otp-row', (c) => _emailVerifyOtp(c));
    }
  }

  // ─── Telegram flow ──────────────────────────────────────────────────────────
  function _bindTelegramFlow() {
    const sendBtn = document.getElementById('bs-tg-send-btn');
    if (sendBtn) sendBtn.addEventListener('click', _tgSendOtp);

    const backBtn = document.getElementById('bs-tg-back');
    if (backBtn) backBtn.addEventListener('click', () => {
      document.getElementById('bs-tg-step1').style.display = '';
      document.getElementById('bs-tg-step2').style.display = 'none';
      _clearMessages();
      _clearOtpRow('bs-tg-otp-row');
    });

    const resendBtn = document.getElementById('bs-tg-resend-btn');
    if (resendBtn) resendBtn.onclick = _tgSendOtp;
  }

  async function _tgSendOtp() {
    _clearMessages();
    const chatId = document.getElementById('bs-tg-chatid')?.value.trim();
    const name = document.getElementById('bs-tg-name')?.value.trim();
    const specialty = document.getElementById('bs-tg-specialty')?.value;
    const wilaya = document.getElementById('bs-tg-wilaya')?.value;

    if (!chatId || !name || !specialty || !wilaya) {
      _showError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (!/^\d+$/.test(chatId)) {
      _showError('Chat ID يجب أن يكون أرقاماً فقط');
      return;
    }

    _showLoading('جارٍ إرسال الكود عبر تيليجرام...');
    try {
      await _apiPost('/api/auth-send-otp', { identifier: chatId, type: 'telegram', name, specialty, wilaya });
      _hideLoading();
      document.getElementById('bs-tg-step1').style.display = 'none';
      document.getElementById('bs-tg-step2').style.display = '';
      _clearOtpRow('bs-tg-otp-row');
      _initOtpRow('bs-tg-otp-row', (code) => _tgVerifyOtp(code));
      _startResendTimer('bs-tg-resend-btn', 'bs-tg-resend-timer', 60, _tgSendOtp);
      _showSuccess('تم إرسال الكود! تحقق من تيليجرام');
    } catch (err) {
      _hideLoading();
      _showError(err.message);
    }
  }

  async function _tgVerifyOtp(code) {
    const chatId = document.getElementById('bs-tg-chatid')?.value.trim();
    const name = document.getElementById('bs-tg-name')?.value.trim();
    const specialty = document.getElementById('bs-tg-specialty')?.value;
    const wilaya = document.getElementById('bs-tg-wilaya')?.value;

    _showLoading('جارٍ التحقق...');
    try {
      const data = await _apiPost('/api/auth-verify-otp', {
        identifier: chatId, code, type: 'telegram', name, specialty, wilaya
      });
      _onAuthSuccess(data.token, data.user, data.is_new_user);
    } catch (err) {
      _hideLoading();
      _showError(err.message);
      _clearOtpRow('bs-tg-otp-row');
      _initOtpRow('bs-tg-otp-row', (c) => _tgVerifyOtp(c));
    }
  }

  // ─── Google flow ────────────────────────────────────────────────────────────
  let _pendingGoogleData = null; // { google_email, google_name, credential }

  function _bindGoogleFlow() {
    const signBtn = document.getElementById('bs-google-sign-btn');
    if (signBtn) signBtn.addEventListener('click', _googleSignIn);

    const completeBtn = document.getElementById('bs-google-complete-btn');
    if (completeBtn) completeBtn.addEventListener('click', _googleCompleteProfile);
  }

  async function _googleSignIn() {
    _clearMessages();
    if (!GOOGLE_CLIENT_ID) {
      _showError('خاصية Google غير متاحة حالياً');
      return;
    }
    _showLoading('جارٍ التحميل...');
    await _loadGIS();
    _hideLoading();

    if (typeof google === 'undefined' || !google.accounts) {
      _showError('تعذّر تحميل خدمة Google، تحقق من اتصالك');
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: _googleCredentialCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: use renderButton approach
          const wrap = document.getElementById('bs-panel-google');
          if (wrap) {
            const tempDiv = document.createElement('div');
            tempDiv.style.display = 'none';
            wrap.appendChild(tempDiv);
            google.accounts.id.renderButton(tempDiv, { theme: 'outline', size: 'large' });
            tempDiv.querySelector('[role="button"]')?.click();
            setTimeout(() => wrap.removeChild(tempDiv), 1000);
          }
        }
      });
    } catch (e) {
      _showError('حدث خطأ أثناء الاتصال بـ Google');
    }
  }

  async function _googleCredentialCallback(response) {
    if (!response || !response.credential) {
      _showError('فشل التحقق من Google');
      return;
    }
    _showLoading('جارٍ التحقق من حساب Google...');
    try {
      const data = await _apiPost('/api/auth-google', { credential: response.credential });
      if (data.needs_profile) {
        _pendingGoogleData = {
          credential: response.credential,
          google_email: data.google_email,
          google_name: data.google_name,
        };
        _hideLoading();
        // Show profile completion step
        document.getElementById('bs-google-step1').style.display = 'none';
        document.getElementById('bs-google-step2').style.display = '';
        const nameInput = document.getElementById('bs-google-name');
        if (nameInput && data.google_name) nameInput.value = data.google_name;
        _showSuccess(`مرحباً! أكمل ملفك الشخصي للمتابعة`);
      } else {
        _onAuthSuccess(data.token, data.user, data.is_new_user);
      }
    } catch (err) {
      _hideLoading();
      _showError(err.message);
    }
  }

  async function _googleCompleteProfile() {
    if (!_pendingGoogleData) return;
    _clearMessages();
    const name = document.getElementById('bs-google-name')?.value.trim();
    const specialty = document.getElementById('bs-google-specialty')?.value;
    const wilaya = document.getElementById('bs-google-wilaya')?.value;

    if (!name || !specialty || !wilaya) {
      _showError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    _showLoading('جارٍ إتمام التسجيل...');
    try {
      const data = await _apiPost('/api/auth-google', {
        credential: _pendingGoogleData.credential,
        name, specialty, wilaya,
      });
      _pendingGoogleData = null;
      _onAuthSuccess(data.token, data.user, data.is_new_user);
    } catch (err) {
      _hideLoading();
      _showError(err.message);
    }
  }

  // ─── Tab switching ──────────────────────────────────────────────────────────
  function _bindTabs() {
    const tabs = document.querySelectorAll('.bs-auth-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const panelId = `bs-panel-${tab.dataset.tab}`;
        document.querySelectorAll('.bs-auth-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(panelId);
        if (panel) panel.classList.add('active');
        _clearMessages();
      });
    });
  }

  // ─── Open / close modal ─────────────────────────────────────────────────────
  function _closeModal() {
    if (!_modalEl) return;
    const overlay = document.getElementById('bs-auth-overlay');
    if (overlay) {
      overlay.classList.remove('bs-auth-visible');
      setTimeout(() => {
        if (_modalEl && _modalEl.parentNode) _modalEl.parentNode.removeChild(_modalEl);
        _modalEl = null;
        _pendingGoogleData = null;
        document.body.style.overflow = '';
      }, 300);
    }
  }

  function _openModal(opts) {
    _modalOpts = opts || {};
    if (_modalEl) return; // already open

    // Inject CSS if not already present
    if (!document.getElementById('bs-auth-css')) {
      const link = document.createElement('link');
      link.id = 'bs-auth-css';
      link.rel = 'stylesheet';
      link.href = '/css/auth.css';
      document.head.appendChild(link);
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = _buildModalHTML(_modalOpts.message || '');
    _modalEl = wrapper.firstElementChild;
    document.body.appendChild(_modalEl);
    document.body.style.overflow = 'hidden';

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const overlay = document.getElementById('bs-auth-overlay');
        if (overlay) overlay.classList.add('bs-auth-visible');
      });
    });

    // Bind events
    document.getElementById('bs-auth-close')?.addEventListener('click', _closeModal);
    document.getElementById('bs-auth-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'bs-auth-overlay') _closeModal();
    });
    document.addEventListener('keydown', function escListener(e) {
      if (e.key === 'Escape') { _closeModal(); document.removeEventListener('keydown', escListener); }
    });

    _bindTabs();
    _bindEmailFlow();
    _bindTelegramFlow();
    _bindGoogleFlow();
    _initCustomSelects();

    // Focus first input
    setTimeout(() => {
      document.getElementById('bs-email-input')?.focus();
    }, 350);
  }

  // ─── Public API ─────────────────────────────────────────────────────────────
  const Auth = {

    async init() {
      // Read session from localStorage
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.token && parsed.user) {
            _session = parsed;
          }
        }
      } catch (e) { _clearSession(); }

      // Populate navbar immediately from cache (no network)
      _updateNavbar(_session ? _session.user : null);

      if (!_session) {
        _fireListeners(null);
        return null;
      }

      // Optionally validate token in background (non-blocking)
      try {
        const res = await fetch('/api/auth-session', {
          headers: { 'Authorization': `Bearer ${_session.token}` }
        });
        if (!res.ok) {
          _clearSession();
          _updateNavbar(null);
          _fireListeners(null);
          return null;
        }
        const data = await res.json();
        if (data.user) {
          _session.user = data.user;
          _saveSession(_session);
          _updateNavbar(data.user);
        }
      } catch (e) {
        // Network error — keep existing cached session
      }

      const user = _session ? _session.user : null;

      // Onboarding check
      if (user && user.onboarding_done === false) {
        if (!window.location.pathname.includes('onboarding')) {
          window.location.href = '/onboarding.html';
          return user;
        }
      }

      _fireListeners(user);
      return user;
    },

    getSessionSync() {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return (parsed && parsed.token && parsed.user) ? parsed : null;
      } catch (e) { return null; }
    },

    getUser() {
      return _session ? _session.user : null;
    },

    openModal(opts) {
      _openModal(opts);
    },

    async logout() {
      const token = _session ? _session.token : null;
      _clearSession();
      _updateNavbar(null);
      _fireListeners(null);
      if (token) {
        try {
          await fetch('/api/auth-session', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (e) {}
      }
    },

    onAuthChange(cb) {
      if (typeof cb === 'function') _listeners.push(cb);
    },

    // Called by shared.js after navbar is injected — fixes timing race
    refreshNavbar() {
      _updateNavbar(_session ? _session.user : null);
    },
  };

  window.Auth = Auth;

})();
