/* ============================================================
   TAWJIHI — Onboarding wizard (UI prototype)
   Pure JS step navigation + validation + localStorage.
   Answers persisted under `tw-profile`; theme under `tw-theme`.
   ============================================================ */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---- Theme (same key as app.js: tw-theme) ---- */
  const root = document.documentElement;
  root.setAttribute('data-theme', localStorage.getItem('tw-theme') || 'light');
  const themeBtn = $('#themeBtn');
  const syncThemeIcon = () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    themeBtn.innerHTML = `<i class="fas fa-${dark ? 'sun' : 'moon'}"></i>`;
  };
  syncThemeIcon();
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('tw-theme', next);
    syncThemeIcon();
  });

  /* ---- State ---- */
  const STORE_KEY = 'tw-profile';
  const profile = Object.assign({
    stream: '', average: 12, wilaya: null,
    interests: [], ambition: '', ambitionText: ''
  }, JSON.parse(localStorage.getItem(STORE_KEY) || '{}'));

  /* ---- Stream code <-> Arabic label maps ----
     The wizard's stream buttons carry Arabic labels (data-value), but
     `tw-profile.stream` MUST be a canonical code (sciexp/math/…).
     `normalizeStream` (from averages-transport.js) converts label → code;
     STREAM_LABELS converts code → label for hydration + the profiles API. */
  const STREAM_LABELS = {
    sciexp: 'علوم تجريبية', math: 'رياضيات', techmath: 'تقني رياضي',
    gestion: 'تسيير واقتصاد', lettres: 'آداب وفلسفة', langues: 'لغات أجنبية', arts: 'فنون'
  };
  const normalizeStream = (s) =>
    (window.twAvg && window.twAvg.normalizeStream) ? window.twAvg.normalizeStream(s) : (s || '');
  // Migrate any legacy label stored in profile.stream → canonical code
  if (profile.stream && STREAM_LABELS[profile.stream] === undefined) {
    profile.stream = normalizeStream(profile.stream) || profile.stream;
  }

  const steps = $$('.ob-step');
  const total = steps.length;
  let current = 0;

  const progressBar = $('#progressBar');
  const stepCount = $('#stepCount');
  const backBtn = $('#backBtn');
  const nextBtn = $('#nextBtn');
  const finishBtn = $('#finishBtn');

  const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(profile));

  /* ---- Pre-fill from saved profile ---- */
  function hydrate() {
    // single-choice groups
    $$('[data-mode="single"]').forEach(group => {
      const field = group.dataset.field;
      const isStream = field === 'stream';
      group.querySelectorAll('.ob-choice').forEach(btn => {
        // stream stores a canonical code; buttons carry Arabic labels
        const btnVal = isStream ? normalizeStream(btn.dataset.value) : btn.dataset.value;
        btn.classList.toggle('is-selected', btnVal === profile[field]);
      });
    });
    // multi chips
    const chipGroup = $('[data-mode="multi"]');
    if (chipGroup) {
      chipGroup.querySelectorAll('.ob-chip').forEach(btn => {
        btn.classList.toggle('is-selected', profile.interests.includes(btn.dataset.value));
      });
    }
    // average input
    const avgInput = $('#avgInput');
    if (avgInput) avgInput.value = Number(profile.average).toFixed(2);
    // select (wilaya stored as {num, ar})
    const wVal = profile.wilaya && profile.wilaya.num != null ? String(profile.wilaya.num) : '';
    $('#wilayaSelect').value = wVal;
    const wTriggerText = $('.custom-select-trigger .trigger-text');
    if (wTriggerText) {
      const activeOpt = $$('.custom-option').find(o => o.dataset.value === wVal);
      wTriggerText.textContent = activeOpt ? activeOpt.textContent : 'اختر ولايتك…';
    }
    $$('.custom-option').forEach(o => {
      o.classList.toggle('selected', o.dataset.value === wVal);
    });
    // text
    $('#ambitionText').value = profile.ambitionText || '';
  }

  /* ---- Single-choice cards ---- */
  $$('[data-mode="single"]').forEach(group => {
    const field = group.dataset.field;
    group.querySelectorAll('.ob-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.ob-choice').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        // stream is stored as a canonical code; other groups store raw value
        profile[field] = field === 'stream'
          ? (normalizeStream(btn.dataset.value) || btn.dataset.value)
          : btn.dataset.value;
        clearError(group.closest('.ob-step'));
        save();
      });
    });
  });

  /* ---- Multi chips (with mutually-exclusive "ما نعرفش" helper) ---- */
  const chipGroup = $('[data-mode="multi"]');
  const unsureBtn = chipGroup.querySelector('[data-unsure]');
  const UNSURE = unsureBtn ? unsureBtn.dataset.value : null;
  chipGroup.querySelectorAll('.ob-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.value;
      const isUnsure = btn.hasAttribute('data-unsure');
      const selecting = !btn.classList.contains('is-selected');

      if (isUnsure && selecting) {
        // "ما نعرفش" picked → it's the only answer; clear the rest
        profile.interests = [v];
        chipGroup.querySelectorAll('.ob-chip').forEach(b => b.classList.toggle('is-selected', b === btn));
      } else if (!isUnsure && selecting && UNSURE) {
        // a real interest picked → drop the "ما نعرفش" flag
        profile.interests = profile.interests.filter(x => x !== UNSURE).concat(v);
        if (unsureBtn) unsureBtn.classList.remove('is-selected');
        btn.classList.add('is-selected');
      } else {
        // plain toggle (deselect, or select with no conflict)
        const i = profile.interests.indexOf(v);
        if (i === -1) profile.interests.push(v); else profile.interests.splice(i, 1);
        btn.classList.toggle('is-selected');
      }
      clearError(chipGroup.closest('.ob-step'));
      save();
    });
  });

  /* ---- Average Input ---- */
  const avgInput = $('#avgInput');
  if (avgInput) {
    avgInput.addEventListener('input', () => {
      profile.average = parseFloat(avgInput.value) || 10;
      save();
    });
  }

  /* ---- Select (wilaya) — populated from the clean 58-wilaya master list ---- */
  const wilayaSelect = $('#wilayaSelect');
  const wilayaOptions = $('#wilayaOptions');
  const wilayaTrigger = $('#wilayaTrigger');
  const customSelect = $('.custom-select-container');

  // Populate options from eligibility.js (window.twWilayaList) when available.
  (function populateWilayas() {
    const list = (window.twWilayaList ? window.twWilayaList() : []) || [];
    if (!list.length) return; // keep static fallback if list unavailable
    
    const frag = document.createDocumentFragment();
    const customFrag = document.createDocumentFragment();

    list.forEach(w => {
      // 1. Native Select Option
      const opt = document.createElement('option');
      opt.value = String(w.num);
      opt.textContent = w.ar;
      frag.appendChild(opt);

      // 2. Custom Option Div
      const div = document.createElement('div');
      div.className = 'custom-option';
      div.dataset.value = String(w.num);
      div.textContent = w.ar;
      customFrag.appendChild(div);
    });
    
    wilayaSelect.appendChild(frag);
    if (wilayaOptions) wilayaOptions.appendChild(customFrag);
  })();

  const wilayaName = (num) =>
    window.twWilayaName ? window.twWilayaName(num) : (wilayaSelect.querySelector(`option[value="${num}"]`)?.textContent || '');

  wilayaSelect.addEventListener('change', () => {
    const num = parseInt(wilayaSelect.value, 10);
    profile.wilaya = isNaN(num) ? null : { num, ar: wilayaName(num) };
    clearError(steps[2]);
    save();
  });

  // Custom dropdown event handling
  if (wilayaTrigger && wilayaOptions && wilayaSelect) {
    wilayaTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      customSelect?.classList.toggle('open');
      wilayaOptions.classList.toggle('open');
    });

    // Delegate option clicks
    wilayaOptions.addEventListener('click', (e) => {
      const opt = e.target.closest('.custom-option');
      if (!opt) return;
      e.stopPropagation();

      const val = opt.dataset.value;
      
      // Update native select
      wilayaSelect.value = val;
      
      // Update trigger text
      const triggerText = wilayaTrigger.querySelector('.trigger-text');
      if (triggerText) triggerText.textContent = opt.textContent;

      // Update selected class
      wilayaOptions.querySelectorAll('.custom-option').forEach(o => {
        o.classList.toggle('selected', o === opt);
      });

      // Close dropdown
      customSelect?.classList.remove('open');
      wilayaOptions.classList.remove('open');

      // Trigger change event and validation
      wilayaSelect.dispatchEvent(new Event('change'));
    });

    // Close on click outside
    document.addEventListener('click', () => {
      customSelect?.classList.remove('open');
      wilayaOptions.classList.remove('open');
    });
  }

  /* ---- Free text (ambition) ---- */
  const ambitionText = $('#ambitionText');
  ambitionText.addEventListener('input', () => {
    profile.ambitionText = ambitionText.value.trim();
    if (profile.ambitionText) clearError(steps[4]);
    save();
  });

  /* ---- Validation per step (returns true if ok) ---- */
  function validate(step) {
    switch (step) {
      case 0: return !!profile.stream;
      case 2: return !!(profile.wilaya && profile.wilaya.num != null);
      case 3: return profile.interests.length > 0;
      case 4: return !!profile.ambition || !!profile.ambitionText;
      default: return true; // step 1 (range) + step 5 (summary) always valid
    }
  }
  function showError(stepEl) {
    const err = stepEl.querySelector('[data-error]');
    if (err) err.classList.add('is-shown');
  }
  function clearError(stepEl) {
    if (!stepEl) return;
    const err = stepEl.querySelector('[data-error]');
    if (err) err.classList.remove('is-shown');
  }

  /* ---- Summary render ---- */
  function renderSummary() {
    const map = {
      stream: (profile.stream && STREAM_LABELS[profile.stream]) || profile.stream || '—',
      average: Number(profile.average).toFixed(2) + ' / 20',
      wilaya: (profile.wilaya && profile.wilaya.ar) || '—',
      interests: profile.interests.length ? profile.interests.join('، ') : '—',
      ambition: profile.ambitionText || profile.ambition || '—'
    };
    Object.entries(map).forEach(([k, v]) => {
      const el = $(`[data-sum="${k}"]`);
      if (el) el.textContent = v;
    });
  }

  /* ---- Render current step ---- */
  function render() {
    steps.forEach((s, i) => s.classList.toggle('is-active', i === current));
    progressBar.style.width = ((current + 1) / total * 100) + '%';
    stepCount.textContent = `الخطوة ${current + 1} من ${total}`;

    backBtn.style.visibility = current === 0 ? 'hidden' : 'visible';
    const isLast = current === total - 1;
    nextBtn.style.display = isLast ? 'none' : 'inline-flex';
    finishBtn.style.display = isLast ? 'inline-flex' : 'none';

    if (isLast) renderSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---- Nav ---- */
  nextBtn.addEventListener('click', () => {
    if (!validate(current)) { showError(steps[current]); return; }
    if (current < total - 1) { current++; render(); }
  });
  backBtn.addEventListener('click', () => {
    if (current > 0) { current--; render(); }
  });
  finishBtn.addEventListener('click', async () => {
    finishBtn.disabled = true;
    finishBtn.textContent = 'جاري الحفظ…';
    profile.completed = true;
    save();
    try {
      if (typeof tw_supabase !== 'undefined') {
        const { data: { session } } = await tw_supabase.auth.getSession();
        if (session) {
          const token = session.access_token;
          await fetch('/api/tawjihi-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              // The profiles API/table store Arabic labels (not canonical codes)
              // and wilaya as a string — convert from the local canonical shape.
              stream: STREAM_LABELS[profile.stream] || profile.stream,
              average: profile.average,
              wilaya: (profile.wilaya && profile.wilaya.ar) || '',
              interests: profile.interests,
              ambition: profile.ambition,
              ambition_text: profile.ambitionText,
              completed: true
            })
          });
          // Also get user's name from Google profile and update tw-profile name
          const user = session.user;
          if (user.user_metadata?.full_name || user.user_metadata?.name) {
            profile.name = user.user_metadata.full_name || user.user_metadata.name;
            save();
          }
          // Redeem pending referral code if any
          const pendingRef = sessionStorage.getItem('tw-pending-ref');
          if (pendingRef) {
            sessionStorage.removeItem('tw-pending-ref');
            fetch('/api/tawjihi-referral', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ action: 'redeem', code: pendingRef })
            }).catch(() => {}); // fire and forget
          }
        }
      }
    } catch (e) {
      console.warn('Profile sync failed, using local data:', e);
    }
    // Show completion overlay
    const overlay = document.getElementById('obCompleteOverlay');
    if (overlay) {
      overlay.classList.add('is-visible');
      await new Promise(r => setTimeout(r, 1600));
    }
    window.location.href = 'app.html';
  });

  /* ---- Import averages from BAC Story (paste code or file) ---- */
  const importCode = $('#obImportCode');
  const importBtn = $('#obImportBtn');
  const importFile = $('#obImportFile');
  const importMsg = $('#obImportMsg');

  function showImportMsg(text, kind) {
    if (!importMsg) return;
    importMsg.textContent = text;
    importMsg.className = 'ob-import-msg is-shown ' + (kind === 'ok' ? 'is-ok' : 'is-err');
  }

  function applyImport(code) {
    if (!window.twAvg) { showImportMsg('تعذّر تحميل أداة الاستيراد.', 'err'); return; }
    const res = window.twAvg.decode(code);
    if (!res.ok) { showImportMsg(res.error || 'الرمز غير صالح.', 'err'); return; }
    window.twAvg.mergeIntoProfile(profile, res.payload);
    save();
    hydrate(); // reflect new average + stream selection in the UI
    const parts = [];
    if (res.payload.generalAverage !== undefined) parts.push('المعدل العام');
    const wCount = Object.keys(res.payload.weightedAverages || {}).length;
    if (wCount) parts.push(wCount + ' معدلات موزونة');
    showImportMsg('تم الاستيراد بنجاح ✓ (' + (parts.join(' و ') || 'المعطيات') + ').', 'ok');
  }

  if (importBtn) {
    importBtn.addEventListener('click', () => applyImport((importCode && importCode.value) || ''));
  }
  if (importFile) {
    importFile.addEventListener('change', () => {
      const f = importFile.files && importFile.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        const raw = String(reader.result || '').trim();
        // File may hold raw JSON OR the base64 code; twAvg.decode expects the
        // code, so if it looks like JSON, re-encode it to a code first.
        if (raw.charAt(0) === '{') {
          try {
            const code = btoa(unescape(encodeURIComponent(raw))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            if (importCode) importCode.value = code;
            applyImport(code);
            return;
          } catch (e) { /* fall through */ }
        }
        if (importCode) importCode.value = raw;
        applyImport(raw);
      };
      reader.onerror = () => showImportMsg('تعذّر قراءة الملف.', 'err');
      reader.readAsText(f);
    });
  }

  // Auto-import from URL parameter ?import=CODE
  const params = new URLSearchParams(window.location.search);
  const urlImportCode = params.get('import');
  if (urlImportCode) {
    if (importCode) importCode.value = urlImportCode;
    applyImport(urlImportCode);
    const newUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', newUrl);
  }

  /* ──────────────────────────────────────────────────────────
     REFERRAL CODE CARD — summary step
     Fixes: normalizeCode edge cases, toast on apply, status
     visibility in collapsed state, input auto-format robustness
     ────────────────────────────────────────────────────────── */
  (function initRefCard() {
    const card      = document.getElementById('obRefCard');
    const toggle    = document.getElementById('obRefToggle');
    const body      = document.getElementById('obRefBody');
    const input     = document.getElementById('obRefInput');
    const applyBtn  = document.getElementById('obRefApplyBtn');
    const status    = document.getElementById('obRefStatus');

    if (!card) return;

    /* ---- Toast ---- */
    function showToast(msg, type) {
      // Remove any existing toast first
      const old = document.querySelector('.ob-toast');
      if (old) old.remove();

      const t = document.createElement('div');
      t.className = 'ob-toast ob-toast-' + (type || 'success');
      t.textContent = msg;
      document.body.appendChild(t);
      // Trigger animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => t.classList.add('is-visible'));
      });
      setTimeout(() => {
        t.classList.remove('is-visible');
        setTimeout(() => t.remove(), 400);
      }, 3200);
    }

    /* ---- Normalize code: strips whitespace, uppercases, ensures TW- prefix ---- */
    function normalizeCode(raw) {
      // Remove everything except alphanumeric and dashes
      let v = raw.trim().toUpperCase().replace(/[^A-Z0-9\-]/g, '');
      // Strip any existing TW- or TW prefix to avoid double-prefixing
      v = v.replace(/^TW-?/, '');
      // Always prepend TW- if there's something left
      return v.length > 0 ? 'TW-' + v : '';
    }

    /* ---- Status helpers ---- */
    function showStatus(msg, type) {
      status.textContent = msg;
      status.className = 'ob-ref-status is-shown ' + (type === 'ok' ? 'is-ok' : 'is-err');
    }
    function hideStatus() {
      status.className = 'ob-ref-status';
      status.textContent = '';
    }

    /* ---- Mark card as applied (collapse + green state) ---- */
    function setApplied(code, silent) {
      card.classList.add('is-applied');
      card.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.setAttribute('aria-hidden', 'true');
      input.value = code;
      applyBtn.classList.add('is-done');
      applyBtn.innerHTML = '<i class="fas fa-check"></i> تم';
      // Inline status in body (visible if body was open)
      showStatus('✓ تم تطبيق الكود', 'ok');
      // Toast notification — skip on silent pre-fill (URL/session restore)
      if (!silent) {
        showToast('🎉 تم! كلاكما تكسبوا 30 رسالة مجانية', 'success');
      }
    }

    /* ---- Pre-fill if code already set (via ?ref= URL or prior session) ---- */
    const pending = sessionStorage.getItem('tw-pending-ref');
    if (pending) {
      setApplied(pending, true /* silent */);
    }

    /* ---- Toggle open/close ---- */
    toggle.addEventListener('click', function () {
      if (card.classList.contains('is-applied')) return; // locked after applied
      const isOpen = card.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      body.setAttribute('aria-hidden', String(!isOpen));
      if (isOpen) setTimeout(() => input.focus(), 60);
    });

    /* ---- Auto-format input: strip non-alphanum, uppercase, insert TW- prefix ---- */
    input.addEventListener('input', function () {
      hideStatus();
      applyBtn.classList.remove('is-done');
      applyBtn.innerHTML = '<i class="fas fa-check"></i> تطبيق';

      // Strip everything except alpha/digits, uppercase
      let raw = input.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      // Remove any TW prefix so we control it
      raw = raw.replace(/^TW/g, '');
      // Rebuild: TW- + up to 5 alphanum chars
      const suffix = raw.slice(0, 5);
      input.value = suffix.length > 0 ? 'TW-' + suffix : '';
    });

    /* ---- Apply button ---- */
    applyBtn.addEventListener('click', function () {
      const code = normalizeCode(input.value);
      const valid = /^TW-[A-Z0-9]{5}$/.test(code);
      if (!valid) {
        showStatus('الكود غير صحيح — الصيغة الصحيحة: TW-ABC12', 'err');
        input.focus();
        return;
      }
      sessionStorage.setItem('tw-pending-ref', code);
      setApplied(code, false /* show toast */);
    });

    /* ---- Enter key submits ---- */
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); applyBtn.click(); }
    });
  })();

  hydrate();
  render();
})();
