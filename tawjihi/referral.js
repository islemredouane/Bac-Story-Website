/* ============================================================
   TAWJIHI — Referral & Credits page (UI prototype)
   localStorage keys:
     tw-referral : { code, refs }
     tw-credits  : { balance, totalEarned, totalSpent }
   ============================================================ */
(() => {
  /* ---- credits helpers (shared logic, also used by app.js) ---- */
  const INITIAL_BALANCE = 30;
  const REF_REWARD      = 30;

  function getCredits() {
    return JSON.parse(localStorage.getItem('tw-credits') || 'null') ||
      { balance: INITIAL_BALANCE, totalEarned: INITIAL_BALANCE, totalSpent: 0 };
  }
  function saveCredits(c) { localStorage.setItem('tw-credits', JSON.stringify(c)); }

  function getReferral() {
    let ref = JSON.parse(localStorage.getItem('tw-referral') || 'null');
    if (!ref) {
      const auth = JSON.parse(localStorage.getItem('tw-auth') || '{}');
      const seed = ((auth.ts || Date.now()).toString(36).slice(-5) + 'AAAAA').slice(0, 5).toUpperCase();
      ref = { code: 'TW-' + seed, refs: 0 };
      localStorage.setItem('tw-referral', JSON.stringify(ref));
    }
    return ref;
  }

  /* ---- toast ---- */
  function showToast(msg, color) {
    const t = document.createElement('div');
    t.className = 'ref-toast';
    t.textContent = msg;
    if (color) t.style.background = color;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 500);
    }, 2800);
  }

  /* ---- API loader ---- */
  async function loadReferralFromAPI() {
    if (typeof tw_supabase === 'undefined') return null;
    try {
      const { data: { session } } = await tw_supabase.auth.getSession();
      if (!session) return null;
      const res = await fetch('/api/tawjihi-referral', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!res.ok) return null;
      return await res.json(); // { code, refs, earnedCredits, balance }
    } catch { return null; }
  }

  /* ---- render UI with data ---- */
  function renderUI(ref, credits, refLink) {
    const refEarned = ref.refs * REF_REWARD;

    document.getElementById('statBalance').textContent   = credits.balance;
    document.getElementById('statRefs').textContent      = ref.refs;
    document.getElementById('statRefEarned').textContent = refEarned;
    document.getElementById('statSpent').textContent     = credits.totalSpent;

    /* balance bar (0–100 scale) */
    const barPct = Math.min(credits.balance / 100 * 100, 100);
    document.getElementById('balanceBar').style.width = barPct + '%';

    /* ---- code + link display ---- */
    document.getElementById('refCodeDisplay').textContent = ref.code;
    document.getElementById('refLinkInput').value = refLink;

    /* ---- usage bar ---- */
    document.getElementById('usageBalance').textContent = credits.balance;
    const usagePct = credits.totalEarned > 0
      ? Math.max(credits.balance / credits.totalEarned * 100, 0)
      : 0;
    const usageBar = document.getElementById('usageBar');
    usageBar.style.width = Math.min(usagePct, 100) + '%';
    if (usagePct < 20) usageBar.classList.add('low');
    else if (usagePct < 50) usageBar.classList.add('warn');

    /* ---- elite circles ---- */
    document.getElementById('eliteCount').textContent = ref.refs;
    document.getElementById('eliteRem').textContent = Math.max(0, 10 - ref.refs);
    for (let i = 1; i <= 10; i++) {
      if (i <= ref.refs) document.getElementById('ec-' + i)?.classList.add('checked');
    }
  }

  /* ---- init: try API first, fall back to localStorage ---- */
  (async () => {
    const apiData = await loadReferralFromAPI();

    let ref, credits, refLink;

    if (apiData) {
      // Use real data from Supabase
      ref = { code: apiData.code, refs: apiData.refs };
      credits = {
        balance: apiData.balance,
        totalEarned: (apiData.earnedCredits || 0) + INITIAL_BALANCE,
        totalSpent: 0,
      };
      // Sync to localStorage for offline use
      localStorage.setItem('tw-referral', JSON.stringify({ code: apiData.code, refs: apiData.refs }));
      localStorage.setItem('tw-credits', JSON.stringify(credits));
    } else {
      // Fall back to localStorage
      const localCredits = getCredits();
      saveCredits(localCredits); // persist if freshly initialised
      ref = getReferral();
      credits = localCredits;
    }

    refLink = `https://tawjihi.dz/signup?ref=${ref.code}`;

    renderUI(ref, credits, refLink);

    /* ---- copy button ---- */
    const copyBtn = document.getElementById('copyBtn');
    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(refLink);
      } catch {
        const inp = document.getElementById('refLinkInput');
        inp.select(); document.execCommand('copy');
      }
      copyBtn.classList.add('done');
      copyBtn.innerHTML = '<i class="fas fa-check"></i> تم!';
      showToast('تم نسخ رابط الإحالة 📋');
      setTimeout(() => {
        copyBtn.classList.remove('done');
        copyBtn.innerHTML = '<i class="far fa-copy"></i> نسخ';
      }, 2500);
    });

    /* ---- WhatsApp share ---- */
    document.getElementById('waBtn')?.addEventListener('click', () => {
      const msg = `انضم لتوجيهي 🎓 — المرشد الذكي للتوجيه الجامعي في الجزائر!\nسجّل عبر رابطي وكلينا نكسب 30 رسالة مجانية 🎁\n${refLink}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
    });

    /* ---- Telegram share ---- */
    document.getElementById('tgBtn')?.addEventListener('click', () => {
      const msg = `انضم لتوجيهي — مرشدك الذكي للتوجيه الجامعي 🎓\nكلينا نكسب 30 رسالة مجانية فور تسجيلك! 👇`;
      window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(msg)}`, '_blank');
    });
  })();
})();
