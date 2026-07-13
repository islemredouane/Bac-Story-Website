/* ============================================================
   TAWJIHI — Fiche-de-vœux simulator (UI prototype)
   Uses catalog.js (TW_CATALOG) as single source of truth.
   Constraints: min 6 wishes, max 10, at least 2 from LMD.
   Risk vs the student's average:
     avg >= specAvg + 1  → safe   (مضمون)
     within ±1           → likely (على الحدّ)
     avg <  specAvg - 1  → risk   (طموح/خطر)
   Wishlist persisted to localStorage['tw-wishlist'].
   ============================================================ */
(() => {
  const $ = (s, r = document) => r.querySelector(s);

  const MAX_WISH = 10, MIN_WISH = 6, MIN_LMD = 2;

  /* ---- profile ---- */
  const profile = JSON.parse(localStorage.getItem('tw-profile') || 'null');
  let myAvg = profile && +profile.average ? +profile.average : 13.50;

  const STREAM_MAP = {
    'علوم تجريبية': 'sciexp', 'رياضيات': 'math', 'تقني رياضي': 'techmath',
    'تسيير واقتصاد': 'gestion', 'آداب وفلسفة': 'lettres', 'لغات أجنبية': 'langues',
  };
  const myStreamCode = profile && profile.stream ? STREAM_MAP[profile.stream] : null;

  const avgSlider = $('#avgSlider');
  if (avgSlider) avgSlider.value = myAvg.toFixed(2);

  const streamDisplay = $('#streamDisplay');
  if (streamDisplay) streamDisplay.textContent = (profile && profile.stream) || 'غير محدد';

  /* ---- state ---- */
  let wish = [];

  /* null avg = concours-based admission → treat as ambitious/unknown (never "safe") */
  const riskOf  = (specAvg) => specAvg == null ? 'risk' : (myAvg >= specAvg + 1 ? 'safe' : (myAvg >= specAvg - 1 ? 'likely' : 'risk'));
  const LABEL   = { safe: 'مضمون', likely: 'على الحدّ', risk: 'طموح / خطر' };
  const byId    = (id) => TW_CATALOG.find(c => c.id === id);
  const lmdCount = () => wish.filter(id => (byId(id) || {}).lmd).length;

  /* ---- persist wishlist ---- */
  function saveWishlist() {
    localStorage.setItem('tw-wishlist', JSON.stringify(wish));
  }

  /* ---- toast ---- */
  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'sim-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 3000);
  }

  /* ---- render catalog (filtered by user's stream + search query) ---- */
  function renderCatalog() {
    const q = $('#catSearch').value.trim().toLowerCase();
    const box = $('#catalog');
    const atMax = wish.length >= MAX_WISH;
    const list = TW_CATALOG.filter(c => {
      // If searching, show all matching regardless of stream
      if (q) return (c.name + ' ' + c.streams.join(' ')).toLowerCase().includes(q);
      // Otherwise, filter by user's stream (show all if stream unknown)
      if (myStreamCode && !c.streamCodes.includes(myStreamCode)) return false;
      return true;
    });
    box.innerHTML = list.map(c => {
      const added = wish.includes(c.id);
      const disabled = added || atMax;
      const lmdTag = c.lmd ? '<span class="cat-lmd">LMD</span>' : '';
      const metaText = c.streams.slice(0, 2).join(' / ');
      return `<button class="cat-item" data-add="${c.id}" ${disabled ? 'disabled' : ''}>
        <span class="cat-dot" style="background:${c.catVar}"></span>
        <span class="cat-info">
          <span class="cat-name">${c.name}${lmdTag}</span>
          <span class="cat-meta">${c.avg != null ? `معدل ~ ${c.avg.toFixed(2)}` : 'قبول بمسابقة'} · ${metaText}</span>
        </span>
        <span class="cat-add"><i class="fas fa-${added ? 'check' : atMax ? 'lock' : 'plus'}"></i></span>
      </button>`;
    }).join('') || `<p class="risk-tip">ما لقينا والو يطابق شعبتك أو بحثك.</p>`;

    box.querySelectorAll('[data-add]:not(:disabled)').forEach(b =>
      b.addEventListener('click', () => {
        if (wish.length >= MAX_WISH) { showToast('وصلت للحد الأقصى — احذف رغبة باش تزيد أخرى (الحد 10).'); return; }
        const newId = b.dataset.add;
        wish.push(newId);
        window._newWishId = newId;
        renderAll();
      })
    );
  }

  /* ---- requirements bar ---- */
  function renderRequirements() {
    const reqEl = $('#simRequirements');
    if (!reqEl) return;
    const lmd = lmdCount();
    const countOk = wish.length >= MIN_WISH;
    const lmdOk   = lmd >= MIN_LMD;
    reqEl.innerHTML = `
      <span class="sim-req ${countOk ? 'met' : wish.length > 0 ? 'partial' : 'unmet'}">
        <i class="fas fa-${countOk ? 'circle-check' : 'list-check'}"></i>
        ${wish.length} / ${MIN_WISH}+ رغبات
      </span>
      <span class="sim-req ${lmdOk ? 'met' : 'unmet'}">
        <i class="fas fa-${lmdOk ? 'circle-check' : 'building-columns'}"></i>
        ${lmd} / ${MIN_LMD} جامعة LMD
      </span>
      <span class="sim-req neutral">
        <i class="fas fa-gauge-simple-high"></i>
        ${wish.length} / ${MAX_WISH} حد أقصى
      </span>`;
  }

  /* ---- render wishlist ---- */
  function renderWish() {
    const ol = $('#wishlist'), empty = $('#wishEmpty');
    $('#wishCount').textContent = `${wish.length} / ${MAX_WISH}`;
    empty.style.display = wish.length ? 'none' : 'block';
    ol.innerHTML = wish.map((id, i) => {
      const c = byId(id); if (!c) return '';
      const r = riskOf(c.avg);
      const lmdTag = c.lmd ? '<span class="wish-lmd">LMD</span>' : '';
      return `<li class="wish-item" data-id="${id}" style="--cat:${c.catVar}">
        <span class="wish-rank">${i + 1}</span>
        <span class="wish-info">
          <span class="wish-name">${c.name}${lmdTag}</span>
          <span class="wish-meta">${c.avg != null ? `معدل القبول ~ ${c.avg.toFixed(2)}` : 'قبول بمسابقة خاصة'} · معدلك ${myAvg.toFixed(2)}</span>
        </span>
        <span class="wish-badge ${r}">${LABEL[r]}</span>
        <span class="wish-ctrls">
          <button class="wish-ctrl" data-up="${i}"   ${i === 0             ? 'disabled' : ''} aria-label="فوق"><i class="fas fa-chevron-up"></i></button>
          <button class="wish-ctrl" data-down="${i}" ${i === wish.length-1 ? 'disabled' : ''} aria-label="تحت"><i class="fas fa-chevron-down"></i></button>
          <button class="wish-ctrl del" data-del="${i}" aria-label="حذف"><i class="fas fa-trash"></i></button>
        </span>
      </li>`;
    }).join('');

    ol.querySelectorAll('[data-up]').forEach(b   => b.addEventListener('click', () => { const i=+b.dataset.up;   [wish[i-1],wish[i]]=[wish[i],wish[i-1]]; renderAll(); }));
    ol.querySelectorAll('[data-down]').forEach(b => b.addEventListener('click', () => { const i=+b.dataset.down; [wish[i+1],wish[i]]=[wish[i],wish[i+1]]; renderAll(); }));
    ol.querySelectorAll('[data-del]').forEach(b  => b.addEventListener('click', () => { wish.splice(+b.dataset.del, 1); renderAll(); }));

    /* MOT-8: spring entrance for newly added item */
    if (window._newWishId) {
      const newEl = ol.querySelector(`[data-id="${window._newWishId}"]`);
      if (newEl) newEl.classList.add('wish-item--new');
      window._newWishId = null;
    }

    renderRequirements();
  }

  /* ---- risk distribution + AI analysis ---- */
  function renderInsights() {
    const counts = { safe: 0, likely: 0, risk: 0 };
    wish.forEach(id => { const c = byId(id); if (c) counts[riskOf(c.avg)]++; });
    const n = wish.length || 1;
    const bar = $('#riskBar');
    bar.innerHTML = ['safe','likely','risk'].map(k =>
      counts[k] ? `<span class="${k}" style="width:${counts[k]/n*100}%"></span>` : ''
    ).join('');
    $('#riskTip').textContent = wish.length
      ? `${counts.safe} مضمون · ${counts.likely} على الحدّ · ${counts.risk} طموح`
      : 'زيد رغباتك باش نوريّك التوزيع.';

    const box = $('#analysis');
    if (!wish.length) { box.innerHTML = ''; return; }
    const items = [];

    const remaining = MIN_WISH - wish.length;
    if (remaining > 0) items.push(['warn', 'list-ul',
      `زيد ${remaining} رغبة${remaining > 1 ? 'ات' : ''} على الأقل باش تكتمل بطاقتك — الحد الأدنى المطلوب 6.`]);

    const lmd = lmdCount();
    if (lmd < MIN_LMD) {
      const need = MIN_LMD - lmd;
      items.push(['bad', 'building-columns',
        `يجب تزيد ${need} تخصص من الجامعات LMD — ابحث "LMD" في خانة البحث لإيجادهم.`]);
    } else {
      items.push(['good', 'building-columns',
        `عندك ${lmd} تخصص من الجامعات LMD — البطاقة متوازنة بين الكبريات والجامعات.`]);
    }

    const topRisk = wish.slice(0, Math.min(3, wish.length)).every(id => { const c = byId(id); return c && riskOf(c.avg) === 'risk'; });
    if (topRisk) items.push(['bad', 'triangle-exclamation',
      'رغباتك الأولى كامل طموحة — يوصى تبدا بواحد أو زوج اللي عندك فرصة قبول أكبر فيهم.']);

    if (!counts.safe) items.push(['warn', 'shield-halved',
      'ما عندك حتى رغبة مضمونة — زيد تخصص معدل قبولو أقل من معدلك بنقطة على الأقل كـ"أمان".']);
    else if (wish.length >= MIN_WISH) items.push(['good', 'circle-check',
      `عندك ${counts.safe} رغبة مضمونة — حطّهم في الأسفل كشبكة أمان.`]);

    for (let i = 0; i < wish.length - 1; i++) {
      const c1 = byId(wish[i]), c2 = byId(wish[i+1]);
      if (c1 && c2 && riskOf(c1.avg) === 'safe' && riskOf(c2.avg) === 'risk') {
        items.push(['warn', 'arrows-up-down',
          'رتّبت رغبة مضمونة فوق وحدة طموحة — الترتيب الأمثل: الطموحة أولاً، المضمونة في الأسفل.']);
        break;
      }
    }

    box.innerHTML = `<h3><i class="fas fa-robot"></i> تحليل المرشد</h3><ul>${
      items.map(([cls, ic, txt]) => `<li class="${cls}"><i class="fas fa-${ic}"></i><span>${txt}</span></li>`).join('')
    }</ul>`;
  }

  function renderAll() {
    renderWish();
    renderCatalog();
    renderInsights();
    saveWishlist();
  }

  /* ---- events ---- */
  avgSlider.addEventListener('input', () => {
    myAvg = parseFloat(avgSlider.value) || 10;
    debounceRecompute();
  });
  $('#catSearch').addEventListener('input', renderCatalog);

  /* ---- save button ---- */
  const saveBtn = document.querySelector('#saveBtn');
  if (saveBtn) {
    saveBtn.removeAttribute('onclick');
    saveBtn.addEventListener('click', () => {
      if (wish.length < MIN_WISH) {
        showToast(`زيد ${MIN_WISH - wish.length} رغبات — الحد الأدنى ${MIN_WISH} رغبات.`);
        return;
      }
      if (lmdCount() < MIN_LMD) {
        showToast(`زيد ${MIN_LMD - lmdCount()} تخصص من الجامعات LMD على الأقل.`);
        return;
      }
      saveWishlist();
      showToast('✓ بطاقتك محفوظة');
      // Sync wishlist to Supabase (fire and forget, fallback is localStorage)
      (async () => {
        if (typeof tw_supabase === 'undefined') return;
        try {
          const { data: { session } } = await tw_supabase.auth.getSession();
          if (!session) return;
          await fetch('/api/tawjihi-wishlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ specIds: wish })
          });
        } catch (e) {
          console.warn('Wishlist sync failed, saved to localStorage only:', e);
        }
      })();
    });
  }

  /* ---- init: load saved wishlist or seed default ---- */
  function getDefaultSeed(avg) {
    // Only seed from specialties the student can actually apply to
    const eligible = myStreamCode
      ? TW_CATALOG.filter(s => s.streamCodes.includes(myStreamCode))
      : TW_CATALOG;

    const byProximity = (a, b) => Math.abs(a.avg - avg) - Math.abs(b.avg - avg);

    // Candidates within ±3 points of the student's average
    const nearAvg = [...eligible]
      .filter(s => s.avg != null && s.avg >= avg - 3 && s.avg <= avg + 3)
      .sort(byProximity);

    // Separate LMD from grandes écoles in the near-avg pool
    const lmdNear = nearAvg.filter(s => s.lmd);
    const nonLmdNear = nearAvg.filter(s => !s.lmd);

    // Build picks: guarantee at least MIN_LMD=2 LMD entries
    const picks = [];
    // Add up to 2 LMD picks (or fall back to any LMD if not enough near avg)
    const lmdPool = lmdNear.length >= MIN_LMD ? lmdNear : [...eligible].filter(s => s.lmd).sort(byProximity);
    lmdPool.slice(0, MIN_LMD).forEach(s => picks.push(s.id));

    // Fill remaining 4 slots from non-LMD near-avg (then any non-LMD)
    const nonLmdPool = nonLmdNear.length ? nonLmdNear : [...eligible].filter(s => !s.lmd).sort(byProximity);
    nonLmdPool.forEach(s => { if (picks.length < 6 && !picks.includes(s.id)) picks.push(s.id); });

    // If still under 6 (edge case: very limited catalog for stream), fill with anything
    eligible.slice().sort(byProximity).forEach(s => { if (picks.length < 6 && !picks.includes(s.id)) picks.push(s.id); });

    return picks.slice(0, 6);
  }

  const savedWish = JSON.parse(localStorage.getItem('tw-wishlist') || 'null');
  wish = (savedWish && savedWish.length) ? savedWish : [];
  renderAll();

  // Try to load wishlist from Supabase
  async function loadWishlist() {
    if (typeof tw_supabase === 'undefined') return;
    try {
      const { data: { session } } = await tw_supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/tawjihi-wishlist', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const { specIds } = await res.json();
        if (specIds && specIds.length > 0) {
          wish = specIds;
          localStorage.setItem('tw-wishlist', JSON.stringify(wish));
          renderAll();
        }
      }
    } catch {}
  }
  loadWishlist(); // non-blocking, will re-render if data comes back

  /* ---- "Ask AI" cross-link: pre-fill chat with current wishlist ---- */
  document.getElementById('askAiBtn')?.addEventListener('click', e => {
    e.preventDefault();
    const names = wish.map(id => {
      const s = TW_CATALOG.find(c => c.id === id);
      return s ? s.name : id;
    }).join('، ');
    const q = `ساعدني في تحليل وتحسين بطاقة رغباتي. رغباتي الحالية هي: ${names}`;
    sessionStorage.setItem('tw-pending-q', q);
    location.href = 'app';
  });

  /* ---- Export wishlist as plain-text file ---- */
  document.getElementById('exportBtn')?.addEventListener('click', () => {
    const lines = wish.map((id, i) => {
      const s = TW_CATALOG.find(c => c.id === id);
      return s ? `${i+1}. ${s.name} — ${s.avg != null ? `معدل القبول ~ ${s.avg}` : 'قبول بمسابقة خاصة'}` : `${i+1}. ${id}`;
    });
    const text = `بطاقة رغباتي (توجيهي)\n\n${lines.join('\n')}\n\nتم التصدير من تطبيق توجيهي`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'بطاقة-رغباتي.txt';
    a.click(); URL.revokeObjectURL(url);
  });
})();
