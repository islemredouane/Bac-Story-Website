/* ============================================================
   TAWJIHI — Settings / Profile Edit page
   Loads profile from localStorage, pre-fills all fields,
   saves back to localStorage and syncs to Supabase.
   ============================================================ */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  /* ---- Load profile ---- */
  const STORE_KEY = 'tw-profile';
  const profile = Object.assign(
    { name: '', stream: '', average: 12, wilaya: '', interests: [], ambition: '', ambition_text: '' },
    JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
  );

  /* ---- Hydrate: pre-fill all fields from profile ---- */
  function hydrate() {
    // Name
    const nameInput = $('#nameInput');
    if (nameInput && profile.name) nameInput.value = profile.name;

    // Stream: mark the matching choice card
    $$('#streamChoices .ob-choice').forEach(btn => {
      btn.classList.toggle('is-selected', btn.dataset.value === profile.stream);
    });

    // Average slider
    const range = $('#avgRange');
    const avgDisplay = $('#avgValue');
    if (range) {
      range.value = profile.average != null ? profile.average : 12;
      if (avgDisplay) avgDisplay.textContent = Number(range.value).toFixed(2);
    }

    // Wilaya
    const sel = $('#wilayaSelect');
    if (sel && profile.wilaya) sel.value = profile.wilaya;

    // Interests chips
    const interests = Array.isArray(profile.interests) ? profile.interests : [];
    $$('#interestChips .ob-chip').forEach(btn => {
      btn.classList.toggle('is-selected', interests.includes(btn.dataset.value));
    });

    // Ambition text
    const ambText = $('#ambitionText');
    if (ambText) {
      ambText.value = profile.ambition_text || profile.ambitionText || '';
    }
  }

  hydrate();

  /* ---- Change Tracking Logic ---- */
  let initialState = {};
  function recordInitialState() {
    initialState = {
      name: $('#nameInput')?.value.trim() || '',
      stream: $('#streamChoices .ob-choice.is-selected')?.dataset.value || '',
      average: parseFloat($('#avgRange')?.value ?? 12),
      wilaya: $('#wilayaSelect')?.value || '',
      interests: $$('#interestChips .ob-chip.is-selected').map(c => c.dataset.value).sort().join(','),
      ambition_text: $('#ambitionText')?.value.trim() || ''
    };
  }

  function checkForChanges() {
    const currentState = {
      name: $('#nameInput')?.value.trim() || '',
      stream: $('#streamChoices .ob-choice.is-selected')?.dataset.value || '',
      average: parseFloat($('#avgRange')?.value ?? 12),
      wilaya: $('#wilayaSelect')?.value || '',
      interests: $$('#interestChips .ob-chip.is-selected').map(c => c.dataset.value).sort().join(','),
      ambition_text: $('#ambitionText')?.value.trim() || ''
    };
    const hasChanges = Object.keys(initialState).some(k => initialState[k] !== currentState[k]);
    $('.settings-save-wrap')?.classList.toggle('is-visible', hasChanges);
  }

  // Record original state right after hydration
  recordInitialState();

  // Watch text inputs
  $('#nameInput')?.addEventListener('input', checkForChanges);
  $('#ambitionText')?.addEventListener('input', checkForChanges);
  $('#wilayaSelect')?.addEventListener('change', checkForChanges);

  /* ---- Stream choice cards ---- */
  $$('#streamChoices .ob-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#streamChoices .ob-choice').forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      checkForChanges();
    });
  });

  /* ---- Average slider live update ---- */
  const range = $('#avgRange');
  const avgDisplay = $('#avgValue');
  if (range && avgDisplay) {
    range.addEventListener('input', () => {
      avgDisplay.textContent = Number(range.value).toFixed(2);
      checkForChanges();
    });
  }

  /* ---- Interests chips (multi, with exclusive "ما نعرفش" logic) ---- */
  const chipGroup = $('#interestChips');
  const unsureBtn = chipGroup ? chipGroup.querySelector('[data-unsure]') : null;
  const UNSURE_VAL = unsureBtn ? unsureBtn.dataset.value : null;

  if (chipGroup) {
    chipGroup.querySelectorAll('.ob-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.value;
        const isUnsure = btn.hasAttribute('data-unsure');
        const selecting = !btn.classList.contains('is-selected');

        if (isUnsure && selecting) {
          // Picking "ما نعرفش" clears everything else
          chipGroup.querySelectorAll('.ob-chip').forEach(b => b.classList.toggle('is-selected', b === btn));
        } else if (!isUnsure && selecting && UNSURE_VAL) {
          // Picking a real interest drops "ما نعرفش"
          if (unsureBtn) unsureBtn.classList.remove('is-selected');
          btn.classList.add('is-selected');
        } else {
          // Plain toggle
          btn.classList.toggle('is-selected');
        }
        checkForChanges();
      });
    });
  }

  /* ---- Save handler ---- */
  const saveBtn = $('#saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ…';

      /* Read all fields */
      const nameVal = $('#nameInput')?.value.trim();
      if (nameVal) profile.name = nameVal;

      const selectedStream = $('#streamChoices .ob-choice.is-selected');
      if (selectedStream) profile.stream = selectedStream.dataset.value;

      profile.average = parseFloat($('#avgRange')?.value ?? profile.average);

      const wilayaVal = $('#wilayaSelect')?.value;
      if (wilayaVal) profile.wilaya = wilayaVal;

      profile.interests = $$('#interestChips .ob-chip.is-selected').map(c => c.dataset.value);

      const ambVal = $('#ambitionText')?.value.trim();
      profile.ambition_text = ambVal;
      profile.ambitionText = ambVal; // keep legacy key in sync

      /* Save to localStorage */
      localStorage.setItem(STORE_KEY, JSON.stringify(profile));

      /* Sync to Supabase */
      try {
        if (typeof tw_supabase !== 'undefined') {
          const { data: { session } } = await tw_supabase.auth.getSession();
          if (session) {
            await fetch('/api/tawjihi-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                stream: profile.stream,
                average: profile.average,
                wilaya: profile.wilaya,
                interests: profile.interests,
                ambition_text: profile.ambition_text,
                completed: true
              })
            });
          }
        }
      } catch (e) {
        console.warn('Settings sync failed:', e);
      }

      /* Success feedback */
      saveBtn.innerHTML = '<i class="fas fa-check"></i> تم الحفظ';
      saveBtn.style.background = 'var(--success, #22c55e)';
      recordInitialState();
      checkForChanges();
      setTimeout(() => {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-floppy-disk"></i> حفظ التغييرات';
        saveBtn.style.background = '';
      }, 2000);
    });
  }
})();
