/* ============================================================
   TAWJIHI — App shell + chat interactions
   Credits managed server-side; streaming via real SSE API.
   Output contract v2: markdown prose + spec-cards / compare / verdict directives.
   ============================================================ */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const app = $('#app');

  /* ---- Theme (persisted) ---- */
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('tw-theme') || 'light';
  root.setAttribute('data-theme', savedTheme);
  const syncThemeIcon = () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    $('#themeBtn').innerHTML = `<i class="fas fa-${dark ? 'sun' : 'moon'}"></i>`;
  };
  syncThemeIcon();
  $('#themeBtn').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('tw-theme', next);
    syncThemeIcon();
  });

  /* ---- Sidebar collapse (desktop) + drawer (mobile) ---- */
  $('#sidebarToggle').addEventListener('click', () => {
    if (window.innerWidth <= 900) app.classList.remove('drawer-open');
    else app.classList.toggle('sidebar-collapsed');
  });
  $('#drawerBtn').addEventListener('click', () => app.classList.add('drawer-open'));
  $('#scrim').addEventListener('click', () => app.classList.remove('drawer-open'));

  /* ---- Composer: autosize + enable/disable + Enter to send ---- */
  const input = $('#input'), sendBtn = $('#sendBtn'), form = $('#composer');
  const autosize = () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 160) + 'px'; };
  input.addEventListener('input', () => { autosize(); sendBtn.disabled = !input.value.trim(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });

  /* ---- Suggestion cards ---- */
  document.querySelectorAll('[data-q]').forEach(el =>
    el.addEventListener('click', () => { input.value = el.dataset.q; autosize(); sendBtn.disabled = false; form.requestSubmit(); }));

  /* ---- File attach ---- */
  const attachBtn = $('#attachBtn'), fileInput = $('#fileInput'), attachPreview = $('#attachPreview');
  let attachedFiles = [];
  attachBtn?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => {
    [...fileInput.files].forEach(f => { if (!attachedFiles.find(x => x.name === f.name)) attachedFiles.push(f); });
    fileInput.value = '';
    renderAttachChips();
  });
  function fileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'fa-file-pdf';
    if (['doc','docx'].includes(ext)) return 'fa-file-word';
    if (['png','jpg','jpeg','webp'].includes(ext)) return 'fa-file-image';
    return 'fa-file';
  }
  function renderAttachChips() {
    if (!attachPreview) return;
    attachPreview.innerHTML = attachedFiles.map((f, i) => `
      <div class="attach-chip">
        <i class="fas ${fileIcon(f.name)}"></i>
        <span class="attach-chip-name">${f.name}</span>
        <button class="attach-chip-remove" data-i="${i}" aria-label="حذف"><i class="fas fa-xmark"></i></button>
      </div>`).join('');
    attachPreview.querySelectorAll('.attach-chip-remove').forEach(b =>
      b.addEventListener('click', () => { attachedFiles.splice(+b.dataset.i, 1); renderAttachChips(); }));
    if (attachBtn) attachBtn.classList.toggle('active', attachedFiles.length > 0);
  }

  /* ============================================================
     MARKDOWN RENDERER (output contract v2 §2)
     Converts AI response text to styled DOM nodes.
     ============================================================ */

  /* Escape HTML in text so we can safely use innerHTML for inline markup. */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Render bold, italic, code, and internal links inside a line of text. */
  function inlineHtml(text) {
    let s = esc(text);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    s = s.replace(/`([^`]+)`/g, '<code class="tw-code">$1</code>');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => {
      if (/^(speciality|\/tawjihi\/speciality)/.test(u)) {
        return `<a href="${esc(u)}" class="tw-link">${t}</a>`;
      }
      return t;
    });
    return s;
  }

  /* Convert a markdown string into a <div class="tw-md"> DOM node. */
  function twMd(text) {
    const container = document.createElement('div');
    container.className = 'tw-md';
    const lines = (text || '').split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) { i++; continue; }

      if (/^## /.test(line)) {
        const h = document.createElement('h2');
        h.className = 'tw-md-h2';
        h.innerHTML = inlineHtml(line.slice(3).trim());
        container.appendChild(h); i++; continue;
      }

      if (/^### /.test(line)) {
        const h = document.createElement('h3');
        h.className = 'tw-md-h3';
        h.innerHTML = inlineHtml(line.slice(4).trim());
        container.appendChild(h); i++; continue;
      }

      if (/^---+$/.test(line.trim())) {
        container.appendChild(document.createElement('hr'));
        i++; continue;
      }

      if (/^> ?/.test(line)) {
        const bq = document.createElement('blockquote');
        bq.className = 'tw-callout';
        const bqLines = [];
        while (i < lines.length && /^> ?/.test(lines[i])) {
          bqLines.push(lines[i].replace(/^> ?/, '')); i++;
        }
        bq.innerHTML = inlineHtml(bqLines.join('\n'));
        container.appendChild(bq); continue;
      }

      if (/^[-*] /.test(line)) {
        const ul = document.createElement('ul');
        ul.className = 'tw-md-ul';
        while (i < lines.length && /^[-*] /.test(lines[i])) {
          const li = document.createElement('li');
          li.innerHTML = inlineHtml(lines[i].replace(/^[-*] /, ''));
          ul.appendChild(li); i++;
        }
        container.appendChild(ul); continue;
      }

      if (/^\d+\. /.test(line)) {
        const ol = document.createElement('ol');
        ol.className = 'tw-md-ol';
        while (i < lines.length && /^\d+\. /.test(lines[i])) {
          const li = document.createElement('li');
          li.innerHTML = inlineHtml(lines[i].replace(/^\d+\. /, ''));
          ol.appendChild(li); i++;
        }
        container.appendChild(ol); continue;
      }

      /* Regular paragraph — collect until block boundary or empty line. */
      const pLines = [];
      while (i < lines.length) {
        const l = lines[i];
        if (!l.trim() || /^(##|> ?|[-*] |\d+\. |---+)/.test(l)) break;
        pLines.push(l); i++;
      }
      if (pLines.length) {
        const p = document.createElement('p');
        p.innerHTML = inlineHtml(pLines.join(' '));
        container.appendChild(p);
      }
    }
    return container;
  }

  /* ============================================================
     DIRECTIVE BLOCK PARSER (output contract v2 §5)
     Extracts fenced directive blocks and removes them from prose.
     ============================================================ */
  const BLOCK_RE = /```(spec-cards|compare|verdict)[ \t]*\n([\s\S]*?)\n?```/g;

  function parseDirectives(text) {
    const blocks = [];
    const clean = (text || '').replace(BLOCK_RE, (_, type, json) => {
      try { blocks.push({ type, data: JSON.parse(json.trim()) }); } catch {}
      return '';
    }).trim();
    return { clean, blocks };
  }

  /* ============================================================
     DIRECTIVE RENDERERS
     ============================================================ */

  /* spec-cards — horizontally scrollable card row */
  function specCards(list) {
    const row = document.createElement('div');
    row.className = 'chat-spec-row';
    row.innerHTML = list.map(s => `
      <a class="chat-spec-card" href="speciality.html?id=${esc(s.id)}" target="_self" style="--cat:${esc(s.color)}">
        <div class="csc-name">${esc(s.name)}</div>
        <div class="csc-meta">${esc(s.meta)}</div>
        <div class="csc-avg">معدل القبول ~ ${esc(String(s.avg))}</div>
        <div class="csc-link">عرض التفاصيل <i class="fas fa-arrow-left"></i></div>
      </a>`).join('');
    return row;
  }

  /* compare — RTL comparison table (output contract v2 §3b)
     Defensive avg override: if id is in TW_CATALOG, use catalog avg. */
  function renderCompareBlock(data) {
    if (!data || !data.items || !data.fields) return document.createTextNode('');
    const wrap = document.createElement('div');
    wrap.className = 'tw-compare';

    if (data.title) {
      const title = document.createElement('div');
      title.className = 'tw-compare-title';
      title.textContent = data.title;
      wrap.appendChild(title);
    }

    const scroll = document.createElement('div');
    scroll.className = 'tw-compare-scroll';
    const table = document.createElement('table');
    table.className = 'tw-compare-table';

    /* Header row: item names */
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    const th0 = document.createElement('th'); th0.textContent = '';
    hr.appendChild(th0);
    data.items.forEach(item => {
      const th = document.createElement('th');
      th.textContent = item.name;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    /* Body rows: one per field */
    const tbody = document.createElement('tbody');
    data.fields.forEach(field => {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.className = 'tw-compare-label';
      tdLabel.textContent = field.label;
      tr.appendChild(tdLabel);
      data.items.forEach(item => {
        const td = document.createElement('td');
        /* Defensive override for avg from authoritative catalog */
        if (field.key === 'avg' && typeof TW_CATALOG !== 'undefined') {
          const cat = TW_CATALOG.find(c => c.id === item.id);
          td.textContent = cat ? String(cat.avg) : String(item[field.key] || '—');
        } else {
          td.textContent = String(item[field.key] || '—');
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    wrap.appendChild(scroll);
    return wrap;
  }

  /* verdict — personalized eligibility box (output contract v2 §3c) */
  const ACC_VERDICT = {
    safe:    { icon: 'fa-circle-check',        ar: 'في المتناول' },
    likely:  { icon: 'fa-circle-check',        ar: 'على الحدّ' },
    risk:    { icon: 'fa-triangle-exclamation',ar: 'طموح' },
    inelig:  { icon: 'fa-circle-xmark',        ar: 'غير متاح لشعبتك' },
    unknown: { icon: 'fa-circle-question',     ar: 'بيانات غير متوفرة' },
  };

  function renderVerdictBlock(data) {
    const id = data?.id;
    if (!id || typeof window.twAccessibility !== 'function') return null;

    const profile = getProfile();
    const avg = parseFloat(profile.weightedAverage || profile.average) || 0;
    const stream = profile.stream || '';

    let acc;
    try { acc = window.twAccessibility(id, avg, stream); }
    catch { return null; }

    const lbl = ACC_VERDICT[acc.status] || ACC_VERDICT.unknown;
    const box = document.createElement('div');
    box.className = 'tw-verdict';
    box.dataset.status = acc.status || 'unknown';

    const iconEl = document.createElement('div');
    iconEl.className = 'tw-verdict-icon';
    iconEl.innerHTML = `<i class="fas ${lbl.icon}"></i>`;

    const body = document.createElement('div');
    body.className = 'tw-verdict-body';

    const labelEl = document.createElement('div');
    labelEl.className = 'tw-verdict-label';
    labelEl.textContent = lbl.ar;
    body.appendChild(labelEl);

    if (acc.threshold) {
      const th = document.createElement('div');
      th.className = 'tw-verdict-threshold';
      th.textContent = `العتبة: ${Number(acc.threshold).toFixed(2)}`;
      body.appendChild(th);
    }
    if (avg) {
      const av = document.createElement('div');
      av.className = 'tw-verdict-avg';
      av.textContent = `معدلك: ${avg.toFixed(2)}`;
      body.appendChild(av);
    }
    if (acc.note) {
      const note = document.createElement('div');
      note.className = 'tw-verdict-note';
      note.textContent = acc.note;
      body.appendChild(note);
    }

    box.appendChild(iconEl);
    box.appendChild(body);
    return box;
  }

  /* Render a complete AI message (markdown + components) into a textEl container. */
  function renderAiMessage(textEl, fullText) {
    const { clean, blocks } = parseDirectives(fullText);
    textEl.innerHTML = '';
    textEl.appendChild(twMd(clean));
    for (const blk of blocks) {
      if (blk.type === 'spec-cards' && Array.isArray(blk.data)) {
        textEl.appendChild(specCards(blk.data));
      } else if (blk.type === 'compare') {
        textEl.appendChild(renderCompareBlock(blk.data));
      } else if (blk.type === 'verdict') {
        const v = renderVerdictBlock(blk.data);
        if (v) textEl.appendChild(v);
      }
    }
  }

  /* ============================================================
     CHAT RENDERING HELPERS
     ============================================================ */
  const inner = $('#chatInner'), scroll = $('#chatScroll'), hero = $('#chatHero');
  const mainEl = document.querySelector('.main');
  let currentChatId = null;
  let conversationMessages = [];

  /* ---- History panel: localStorage-backed ---- */
  function renderHistory() {
    const listEl = document.getElementById('histList');
    if (!listEl) return;
    const history = JSON.parse(localStorage.getItem('tw-history') || '[]');
    if (!history.length) {
      listEl.innerHTML = '<p class="hist-empty">ما عندك محادثات بعد — ابدأ واحدة الآن.</p>';
      return;
    }
    listEl.innerHTML = '';
    history.slice().reverse().forEach(h => {
      const a = document.createElement('a');
      a.className = 'hist-item';
      a.href = '#';
      a.dataset.histId = h.id;
      const icon = document.createElement('i');
      icon.className = 'fas fa-message';
      const span = document.createElement('span');
      span.textContent = h.title;
      a.appendChild(icon);
      a.appendChild(span);
      a.addEventListener('click', e => { e.preventDefault(); closeHist(); loadChatSession(h.id); });
      listEl.appendChild(a);
    });
  }

  function saveToHistory(title) {
    currentChatId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const history = JSON.parse(localStorage.getItem('tw-history') || '[]');
    history.push({
      id: currentChatId,
      title: title.length > 46 ? title.slice(0, 46) + '…' : title,
      ts: Date.now(),
    });
    if (history.length > 20) history.shift();
    localStorage.setItem('tw-history', JSON.stringify(history));
    renderHistory();
  }

  /* Smart scroll: don't hijack if user scrolled up to read */
  let userScrolledUp = false;
  scroll.addEventListener('scroll', () => {
    const nearBottom = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 120;
    if (nearBottom) userScrolledUp = false;
  }, { passive: true });
  const scrollDown = () => {
    if (!userScrolledUp) scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
  };

  const userMsg = (text, files = []) => {
    userScrolledUp = false;
    const el = document.createElement('div');
    el.className = 'msg user';
    const filesHtml = files.map(f => `
      <div class="msg-attachment">
        <i class="fas ${fileIcon(f.name)}"></i>
        <span class="msg-attachment-name">${esc(f.name)}</span>
      </div>`).join('');
    el.innerHTML = `<div class="msg-avatar"><i class="fas fa-user"></i></div>
      <div class="msg-body"><div class="msg-text">${filesHtml}<p></p></div></div>`;
    el.querySelector('p').textContent = text;
    inner.appendChild(el); scrollDown();
  };

  const aiShell = () => {
    const el = document.createElement('div');
    el.className = 'msg ai';
    el.innerHTML = `<div class="msg-avatar">ت</div>
      <div class="msg-body"><div class="msg-name">مرشد توجيهي</div>
      <div class="msg-text"><span class="typing"><span></span><span></span><span></span></span></div></div>`;
    inner.appendChild(el); scrollDown();
    return el;
  };

  const actionsBar = () => {
    const bar = document.createElement('div');
    bar.className = 'msg-actions';
    bar.innerHTML = `
      <button class="msg-action" title="نسخ"><i class="fas fa-copy"></i></button>
      <button class="msg-action" title="إعادة"><i class="fas fa-rotate-right"></i></button>
      <button class="msg-action" title="مفيد"><i class="fas fa-thumbs-up"></i></button>
      <button class="msg-action" title="غير مفيد"><i class="fas fa-thumbs-down"></i></button>`;
    bar.querySelector('[title="نسخ"]').addEventListener('click', e => {
      const btn = e.currentTarget;
      navigator.clipboard?.writeText(btn.closest('.msg-body').querySelector('.msg-text').innerText);
      btn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i>'; }, 1800);
    });
    bar.querySelectorAll('[title="مفيد"],[title="غير مفيد"]').forEach(b =>
      b.addEventListener('click', () => b.classList.toggle('liked')));
    return bar;
  };

  function followupChips(questions) {
    const div = document.createElement('div');
    div.className = 'chat-followups';
    div.innerHTML = questions.map(q =>
      `<button class="followup-chip" data-q="${esc(q)}">${esc(q)}</button>`).join('');
    div.querySelectorAll('[data-q]').forEach(b =>
      b.addEventListener('click', () => { input.value = b.dataset.q; autosize(); sendBtn.disabled = false; form.requestSubmit(); }));
    return div;
  }

  /* ---- SSE streaming from real API ---- */
  async function streamFromSSE(textEl, response, onToken, done) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    const p = document.createElement('p');
    const cursor = document.createElement('span');
    cursor.className = 'stream-cursor';
    textEl.innerHTML = '';
    textEl.appendChild(p);
    p.appendChild(cursor);

    while (true) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') {
          cursor.remove();
          done && done(fullText);
          return;
        }
        try {
          const { content } = JSON.parse(raw);
          if (content) {
            fullText += content;
            p.insertBefore(document.createTextNode(content), cursor);
            onToken && onToken();
          }
        } catch {}
      }
    }
    cursor.remove();
    done && done(fullText);
  }

  /* ---- Auth + profile helpers ---- */
  async function getAuthToken() {
    if (typeof tw_supabase === 'undefined') return null;
    const { data: { session } } = await tw_supabase.auth.getSession();
    return session?.access_token || null;
  }

  function getProfile() {
    try { return JSON.parse(localStorage.getItem('tw-profile') || '{}'); } catch { return {}; }
  }

  /* ---- No-credits UI ---- */
  function showNoCredits() {
    const shell = aiShell();
    const textEl = shell.querySelector('.msg-text');
    textEl.innerHTML = `
      <p>نفد رصيدك من الرسائل المجانية 😔</p>
      <p style="font-size:var(--fs-sm);color:var(--text-muted);margin-top:8px">
        شارك توجيهي مع أصدقائك واكسب +30 رسالة لكلاكما — الإحالة مجانية تماماً!
      </p>
      <a href="referral.html" style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;
        background:var(--primary);color:#fff;padding:8px 18px;border-radius:10px;font-weight:800;
        font-size:var(--fs-sm);text-decoration:none;">
        <i class="fas fa-gift"></i> اكسب رسائل مجانية
      </a>`;
  }

  /* ---- Send message to real AI API ---- */
  async function sendToAI(q, files = []) {
    const shell = aiShell();
    const textEl = shell.querySelector('.msg-text');

    const token = await getAuthToken();
    const profile = getProfile();

    conversationMessages.push({ role: 'user', content: q });

    try {
      const response = await fetch('/api/tawjihi-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: q,
          messages: conversationMessages.slice(-12),
          profile,
          sessionId: currentChatId,
        }),
      });

      if (response.status === 402) {
        textEl.innerHTML = '';
        showNoCredits();
        conversationMessages.pop();
        return;
      }

      if (!response.ok) throw new Error('API error ' + response.status);

      await streamFromSSE(textEl, response,
        () => scrollDown(),
        (fullText) => {
          conversationMessages.push({ role: 'assistant', content: fullText });
          if (conversationMessages.length > 20) conversationMessages.splice(0, 2);

          /* Replace streaming raw text with properly rendered markdown + components */
          renderAiMessage(textEl, fullText);

          /* Disclaimer */
          const note = document.createElement('p');
          note.className = 'tw-disclaimer';
          note.textContent = 'المعلومات مبنية على بيانات الدليل الوزاري 2025 — أكّد دائماً اختيارك على البوابة الرسمية.';
          textEl.appendChild(note);

          shell.querySelector('.msg-body').appendChild(actionsBar());
          shell.querySelector('.msg-body').appendChild(followupChips([
            'شنو معدل القبول لهاذا التخصص؟',
            'قارن بين تخصصين',
            'كيفاش نرتّب بطاقة الرغبات؟',
          ]));
          scrollDown();
        }
      );
    } catch (err) {
      textEl.innerHTML = '<p style="color:var(--danger)">حدث خطأ في الاتصال — حاول مرة أخرى.</p>';
      conversationMessages.pop();
      console.error('Chat error:', err);
    }
  }

  /* ---- Form submit ---- */
  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim(); if (!q) return;
    if (hero && mainEl && !mainEl.classList.contains('chat-started')) {
      mainEl.classList.add('chat-started');
      setTimeout(() => { hero.style.display = 'none'; }, 420);
    }
    if (!currentChatId) saveToHistory(q);
    const files = [...attachedFiles];
    attachedFiles = []; renderAttachChips();
    userMsg(q, files);
    input.value = ''; autosize(); sendBtn.disabled = true;
    sendToAI(q, files);
  });

  /* ---- Chat history overlay ---- */
  const histPanel = $('#histPanel'), histScrim = $('#histScrim');
  const openHist = () => { histPanel.classList.add('open'); histScrim.classList.add('open'); };
  const closeHist = () => { histPanel.classList.remove('open'); histScrim.classList.remove('open'); };
  $('#historyBtn')?.addEventListener('click', openHist);
  $('#histClose')?.addEventListener('click', closeHist);
  histScrim?.addEventListener('click', closeHist);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeHist(); });

  renderHistory();

  /* ---- New chat ---- */
  const resetChat = () => {
    inner.querySelectorAll('.msg').forEach(m => m.remove());
    if (hero) { hero.style.display = ''; }
    if (mainEl) mainEl.classList.remove('chat-started');
    attachedFiles = []; renderAttachChips();
    input.value = ''; autosize(); sendBtn.disabled = true;
    currentChatId = null;
    conversationMessages = [];
    closeHist();
    renderHistory();
    input.focus();
  };
  $('#newChatBtn')?.addEventListener('click', resetChat);
  $('#histNewChat')?.addEventListener('click', resetChat);

  /* ---- Load a past chat session from Supabase ---- */
  async function loadChatSession(sessionId) {
    if (typeof tw_supabase === 'undefined') return;
    resetChat();
    currentChatId = sessionId;

    const loadEl = document.createElement('div');
    loadEl.className = 'msg ai';
    loadEl.innerHTML = `<div class="msg-avatar">ت</div>
      <div class="msg-body"><div class="msg-text">
        <span class="typing"><span></span><span></span><span></span></span>
      </div></div>`;
    inner.appendChild(loadEl);

    try {
      const { data: { session } } = await tw_supabase.auth.getSession();
      if (!session) { loadEl.remove(); return; }

      const { data: messages, error } = await tw_supabase
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      loadEl.remove();
      if (error || !messages || messages.length === 0) return;

      if (hero && mainEl && !mainEl.classList.contains('chat-started')) {
        mainEl.classList.add('chat-started');
        setTimeout(() => { if (hero) hero.style.display = 'none'; }, 420);
      }

      conversationMessages = [];
      messages.forEach(msg => {
        if (msg.role === 'user') {
          userMsg(msg.content);
        } else if (msg.role === 'assistant') {
          const shell = document.createElement('div');
          shell.className = 'msg ai';

          const textEl = document.createElement('div');
          textEl.className = 'msg-text';
          renderAiMessage(textEl, msg.content);

          shell.innerHTML = `<div class="msg-avatar">ت</div>`;
          const body = document.createElement('div');
          body.className = 'msg-body';
          const nameEl = document.createElement('div');
          nameEl.className = 'msg-name';
          nameEl.textContent = 'مرشد توجيهي';
          body.appendChild(nameEl);
          body.appendChild(textEl);
          body.appendChild(actionsBar());
          shell.appendChild(body);
          inner.appendChild(shell);
        }
        conversationMessages.push({ role: msg.role, content: msg.content });
      });

      if (conversationMessages.length > 20) {
        conversationMessages = conversationMessages.slice(-20);
      }
      scroll.scrollTo({ top: scroll.scrollHeight });
    } catch (err) {
      loadEl.remove();
      console.error('Failed to load chat session:', err);
    }
  }
})();
