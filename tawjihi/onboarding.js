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
    stream: '', average: 12, wilaya: '',
    interests: [], ambition: '', ambitionText: ''
  }, JSON.parse(localStorage.getItem(STORE_KEY) || '{}'));

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
      group.querySelectorAll('.ob-choice').forEach(btn => {
        btn.classList.toggle('is-selected', btn.dataset.value === profile[field]);
      });
    });
    // multi chips
    const chipGroup = $('[data-mode="multi"]');
    if (chipGroup) {
      chipGroup.querySelectorAll('.ob-chip').forEach(btn => {
        btn.classList.toggle('is-selected', profile.interests.includes(btn.dataset.value));
      });
    }
    // range
    const range = $('#avgRange');
    range.value = profile.average;
    $('#avgValue').textContent = Number(profile.average).toFixed(2);
    // select
    $('#wilayaSelect').value = profile.wilaya;
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
        profile[field] = btn.dataset.value;
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

  /* ---- Range ---- */
  const range = $('#avgRange'), avgValue = $('#avgValue');
  range.addEventListener('input', () => {
    profile.average = parseFloat(range.value);
    avgValue.textContent = profile.average.toFixed(2);
    save();
  });

  /* ---- Select ---- */
  const wilayaSelect = $('#wilayaSelect');
  wilayaSelect.addEventListener('change', () => {
    profile.wilaya = wilayaSelect.value;
    clearError(steps[2]);
    save();
  });

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
      case 2: return !!profile.wilaya;
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
      stream: profile.stream || '—',
      average: Number(profile.average).toFixed(2) + ' / 20',
      wilaya: profile.wilaya || '—',
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
              stream: profile.stream,
              average: profile.average,
              wilaya: profile.wilaya,
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
    window.location.href = 'app.html';
  });

  hydrate();
  render();
})();
