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
  let isSending = false;
  const autosize = () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 160) + 'px'; };
  input.addEventListener('input', () => { autosize(); sendBtn.disabled = !input.value.trim(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!isSending) form.requestSubmit(); }
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
  const BLOCK_RE = /```(spec-cards|compare|verdict|question|followups)[ \t]*\n([\s\S]*?)\n?```/g;

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
          const cat = TW_CATALOG.find(c => c.id === (item.id?.toLowerCase()));
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

  /* AI-9: Pick the right weighted average based on speciality type */
  function getRelevantAvg(profile, specId) {
    const id = specId?.toLowerCase() || '';
    const wa = profile?.weightedAverages || {};
    // Medical fields use bio weighted average
    if (['med','pharm','dent','vet','med-bio','med-info'].includes(id)) {
      return parseFloat(wa.bio || profile?.average || 0);
    }
    // Computer science / math schools use math-physics or math
    if (['esi','estin','esi-sba','ensia','nhsm','enscs','ensta','enssn','ensas'].includes(id)) {
      return parseFloat(wa['math-physics'] || wa.math || profile?.average || 0);
    }
    // Engineering schools
    if (['essa','igee','enstp','ensttic','polytech'].includes(id)) {
      return parseFloat(wa['math-tech'] || wa['math-physics'] || profile?.average || 0);
    }
    // Language/translation
    if (['traduction','langues'].includes(id)) {
      return parseFloat(wa.lang || wa.translation || profile?.average || 0);
    }
    // Default: general average
    return parseFloat(profile?.average || 0);
  }

  function renderVerdictBlock(data) {
    const id = data?.id;
    if (!id || typeof window.twAccessibility !== 'function') return null;

    const specId = id?.toLowerCase(); // AI-1: normalize to lowercase

    const profile = getProfile();
    const avg = getRelevantAvg(profile, specId); // AI-9: use correct weighted average
    const stream = profile.stream || '';

    // DATA-10: Handle aspirational/future programs before calling twAccessibility
    const aspirational = ['med-ai','it-int','space-tech','quantum','digital-agro'];
    if (aspirational.includes(specId)) {
      const box = document.createElement('div');
      box.className = 'tw-verdict';
      box.dataset.status = 'unknown';
      box.innerHTML = `<div class="tw-verdict-icon"><i class="fas fa-flask"></i></div>
        <div class="tw-verdict-body">
          <div class="tw-verdict-label"><strong>برنامج مستقبلي</strong> — هذا التخصص لم يُفتح بعد للتسجيل، لا تتوفر بيانات قبول رسمية.</div>
        </div>`;
      return box;
    }

    let acc;
    try { acc = window.twAccessibility(specId, avg, stream); } // AI-1: normalized id
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

    // AI-6: Check wilaya eligibility if wilaya is set and function exists
    const userWilayaNum = parseInt(profile?.wilaya?.num || profile?.wilaya || 0);
    let wilayaEligible = true;
    if (userWilayaNum > 0 && typeof window.twWilayaEligible === 'function') {
      wilayaEligible = window.twWilayaEligible(specId, userWilayaNum);
    }
    if (!wilayaEligible) {
      const wilayaWarn = document.createElement('div');
      wilayaWarn.className = 'tw-verdict-wilaya-warn';
      wilayaWarn.innerHTML = `<i class="fas fa-map-marker-alt"></i> هذا التخصص غير متاح لولايتك (برنامج جهوي)`;
      body.appendChild(wilayaWarn);
    }

    box.appendChild(iconEl);
    box.appendChild(body);
    return box;
  }

  /* ---- Orientation mode state ---- */
  let orientationMode = false;

  /* ============================================================
     QUESTION DIRECTIVE RENDERER (output contract §3d)
     Renders a Claude-style chip question with optional free-text input.
     Clicking a chip sends it as a chat message automatically.
     ============================================================ */
  function renderQuestionBlock(data) {
    if (!data) return null;

    const options = data.options || [];
    const card = document.createElement('div');
    card.className = 'tw-question';

    if (data.text) {
      const qText = document.createElement('div');
      qText.className = 'tw-question-text';
      qText.textContent = data.text;
      card.appendChild(qText);
    }

    const chips = document.createElement('div');
    chips.className = 'tw-question-chips';

    const lockCard = () => {
      card.querySelectorAll('.tw-q-chip').forEach(b => { b.disabled = true; });
      const ci = card.querySelector('.tw-q-custom-input');
      const cb = card.querySelector('.tw-q-custom-btn');
      if (ci) ci.disabled = true;
      if (cb) cb.disabled = true;
    };

    const sendAnswer = (text) => {
      lockCard();
      input.value = text;
      autosize();
      sendBtn.disabled = false;
      form.requestSubmit();
    };

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'tw-q-chip';
      btn.type = 'button';
      btn.textContent = typeof opt === 'string' ? opt : (opt.label || String(opt));
      btn.addEventListener('click', () => {
        btn.classList.add('selected');
        sendAnswer(btn.textContent);
      });
      chips.appendChild(btn);
    });
    card.appendChild(chips);

    if (data.allowCustom !== false) {
      const customWrap = document.createElement('div');
      customWrap.className = 'tw-question-custom';
      const customInput = document.createElement('input');
      customInput.type = 'text';
      customInput.className = 'tw-q-custom-input';
      customInput.placeholder = 'اكتب إجابتك...';
      customInput.setAttribute('dir', 'rtl');
      const customBtn = document.createElement('button');
      customBtn.type = 'button';
      customBtn.className = 'tw-q-custom-btn';
      customBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
      customBtn.addEventListener('click', () => {
        const val = customInput.value.trim();
        if (!val) return;
        sendAnswer(val);
      });
      customInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); customBtn.click(); }
      });
      customWrap.appendChild(customInput);
      customWrap.appendChild(customBtn);
      card.appendChild(customWrap);
    }

    return card;
  }

  /* Render a complete AI message (markdown + components) into a textEl container.
     Returns an array of follow-up question strings if the AI provided them, else null. */
  function renderAiMessage(textEl, fullText) {
    const { clean, blocks } = parseDirectives(fullText);
    textEl.innerHTML = '';
    textEl.appendChild(twMd(clean));
    let hasSpecCards = false;
    let followups = null;
    for (const blk of blocks) {
      if (blk.type === 'spec-cards' && Array.isArray(blk.data)) {
        textEl.appendChild(specCards(blk.data));
        hasSpecCards = true;
      } else if (blk.type === 'compare') {
        textEl.appendChild(renderCompareBlock(blk.data));
      } else if (blk.type === 'verdict') {
        const v = renderVerdictBlock(blk.data);
        if (v) textEl.appendChild(v);
      } else if (blk.type === 'question') {
        const q = renderQuestionBlock(blk.data);
        if (q) textEl.appendChild(q);
      } else if (blk.type === 'followups' && Array.isArray(blk.data)) {
        followups = blk.data.filter(q => typeof q === 'string' && q.trim());
      }
    }
    if (hasSpecCards && orientationMode) orientationMode = false;
    return followups;
  }

  /* ============================================================
     CHAT RENDERING HELPERS
     ============================================================ */
  const inner = $('#chatInner'), scroll = $('#chatScroll'), hero = $('#chatHero');
  const mainEl = document.querySelector('.main');
  let currentChatId = null;
  let conversationMessages = [];

  /* ---- History panel: localStorage-backed ---- */
  function relativeTime(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} د`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} س`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'أمس';
    if (days < 7) return `منذ ${days} أيام`;
    return new Date(ts).toLocaleDateString('ar-DZ', { month: 'short', day: 'numeric' });
  }

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
      a.className = 'hist-item' + (h.id === currentChatId ? ' active' : '');
      a.href = '#';
      a.dataset.histId = h.id;
      a.innerHTML = `
        <i class="fas fa-message"></i>
        <div class="hist-item-body">
          <span class="hist-item-title">${esc(h.title)}</span>
          <span class="hist-item-time">${relativeTime(h.ts)}</span>
        </div>`;
      a.addEventListener('click', e => {
        e.preventDefault();
        listEl.querySelectorAll('.hist-item').forEach(el => el.classList.remove('active'));
        a.classList.add('active');
        loadChatSession(h.id);
      });
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
    if (history.length > 20) {
      const removed = history.shift();
      localStorage.removeItem(`tw-sess-${removed.id}`);
    }
    localStorage.setItem('tw-history', JSON.stringify(history));
    localStorage.setItem(`tw-sess-${currentChatId}`, JSON.stringify([]));
    renderHistory();
  }

  function saveMessageToSession(role, content) {
    if (!currentChatId) return;
    const key = `tw-sess-${currentChatId}`;
    const msgs = JSON.parse(localStorage.getItem(key) || '[]');
    msgs.push({ role, content, ts: Date.now() });
    localStorage.setItem(key, JSON.stringify(msgs));
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

  function liveRender(text) {
    const lines = text.split('\n');
    let html = '';
    let inCode = false;
    let codeBuffer = '';

    for (const line of lines) {
        if (line.startsWith('```')) {
            if (!inCode) {
                inCode = true; codeBuffer = '';
            } else {
                html += `<pre><code>${esc(codeBuffer.trimEnd())}</code></pre>`;
                inCode = false; codeBuffer = '';
            }
            continue;
        }
        if (inCode) { codeBuffer += line + '\n'; continue; }

        const e = esc(line); // HTML-escape the line
        const inline = s => s
            .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*\n]+)\*/g,   '<em>$1</em>')
            .replace(/`([^`\n]+)`/g,     '<code>$1</code>');

        if (line.startsWith('### '))     { html += `<h3>${inline(esc(line.slice(4)))}</h3>`; continue; }
        if (line.startsWith('## '))      { html += `<h2>${inline(esc(line.slice(3)))}</h2>`; continue; }
        if (line.startsWith('# '))       { html += `<h1>${inline(esc(line.slice(2)))}</h1>`; continue; }
        if (line.match(/^[-*]\s/))       { html += `<li>${inline(esc(line.slice(2)))}</li>`; continue; }
        if (line.match(/^\d+\.\s/))      { html += `<li>${inline(esc(line.replace(/^\d+\.\s/, '')))}</li>`; continue; }
        if (!line.trim())                { html += '<br>'; continue; }
        html += `<p>${inline(e)}</p>`;
    }
    if (inCode) html += `<pre><code>${esc(codeBuffer)}</code></pre>`;
    return html || '<p></p>';
  }

  const aiShell = (userMessage = '') => {
    // Context-aware first thinking label
    const q = (userMessage || '').toLowerCase();
    const firstState = (() => {
        if (/طب|صيدل|دكتور|دنتست|بيطر/.test(q))        return '🔬 البحث في تخصصات الطب...';
        if (/هندس|إعلام آلي|معلوماتية|مهندس/.test(q))    return '⚙️ البحث في تخصصات الهندسة...';
        if (/قانون|حقوق|قضاء/.test(q))                    return '⚖️ البحث في تخصصات الحقوق...';
        if (/اقتصاد|تسيير|تجارة|مالية/.test(q))           return '📊 البحث في الاقتصاد والتسيير...';
        if (/أدب|فلسف|لغ/.test(q))                        return '📚 البحث في الآداب والفلسفة...';
        if (/معدل|قبول|سنة|نقطة|12|13|14|15/.test(q))    return '📈 مراجعة معدلات القبول...';
        if (/بطاقة|رغب|ترتيب/.test(q))                    return '📋 تحليل بطاقة الرغبات...';
        if (/ولاية|دائرة|منطقة|جهة/.test(q))              return '🗺️ البحث في البيانات الجغرافية...';
        if (/مدرسة|معهد|جامعة|مؤسسة/.test(q))            return '🏛️ البحث في قائمة المؤسسات...';
        if (/شبه طبي|تمريض|مساعد طبي/.test(q))            return '🩺 البحث في الشبه طبي...';
        if (/رياضيات|فيزياء|كيمياء/.test(q))              return '🧪 البحث في العلوم...';
        return '🤔 تحليل سؤالك...';
    })();

    const el = document.createElement('div');
    el.className = 'msg ai';
    el.innerHTML = `<div class="msg-avatar">ت</div>
      <div class="msg-body">
        <div class="msg-name">مرشد توجيهي</div>
        <div class="msg-text">
          <div class="tw-thinking">
            <div class="tw-thinking-pill">
              <span class="tw-thinking-glyph">ت</span>
              <span class="tw-thinking-label">${firstState}</span>
              <div class="tw-thinking-eq"><span></span><span></span><span></span><span></span><span></span></div>
            </div>
          </div>
        </div>
      </div>`;
    inner.appendChild(el);
    scrollDown();

    const ROTATION = [
        'البحث في قاعدة البيانات...',
        'مراجعة دليل الوزارة...',
        'التحقق من شروط الأهلية...',
        'فحص معدلات هذا العام...',
        'تجميع المعلومات المناسبة...',
        'مقارنة الخيارات المتاحة...',
        'تحليل البيانات الإحصائية...',
        'مراجعة التغييرات الجديدة لـ2025...',
        'إعداد إجابة مخصصة لك...',
        'التدقيق في التفاصيل...',
    ];
    const shuffled = [...ROTATION];
    for (let k = shuffled.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [shuffled[k], shuffled[j]] = [shuffled[j], shuffled[k]];
    }
    const STATES = [firstState, ...shuffled];
    let stateIdx = 0;
    el._thinkingInterval = setInterval(() => {
        const label = el.querySelector('.tw-thinking-label');
        if (!label) return clearInterval(el._thinkingInterval);
        label.classList.add('is-cycling');
        setTimeout(() => {
            stateIdx = (stateIdx + 1) % STATES.length;
            label.textContent = STATES[stateIdx];
            label.classList.remove('is-cycling');
        }, 140);
    }, 2000);

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

    // Copy button
    bar.querySelector('[title="نسخ"]').addEventListener('click', e => {
      const btn = e.currentTarget;
      navigator.clipboard?.writeText(btn.closest('.msg-body').querySelector('.msg-text').innerText);
      btn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i>'; }, 1800);
    });

    // AI-3: Retry button — remove last AI message and re-send last user message
    const retryBtn = bar.querySelector('[title="إعادة"]');
    retryBtn.addEventListener('click', () => {
      // Find and remove the AI message that contains this actions bar
      const lastAiMsg = retryBtn.closest('.msg');
      if (lastAiMsg) lastAiMsg.remove();
      // Remove last assistant message from conversation history
      const lastAssistantIdx = conversationMessages.map(m => m.role).lastIndexOf('assistant');
      if (lastAssistantIdx !== -1) conversationMessages.splice(lastAssistantIdx, 1);
      // Re-send the last user message
      const lastUserMsg = conversationMessages.filter(m => m.role === 'user').pop();
      if (lastUserMsg) sendToAI(lastUserMsg.content);
    });

    // AI-13: Feedback buttons — toggle + send to Supabase
    bar.querySelectorAll('[title="مفيد"],[title="غير مفيد"]').forEach(b =>
      b.addEventListener('click', async () => {
        b.classList.toggle('liked');
        const isLiked = b.classList.contains('liked');
        try {
          const profile = getProfile();
          const sessionInfo = JSON.parse(localStorage.getItem('tw-auth') || '{}');
          await fetch('/api/tawjihi-feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionInfo.token || ''}`
            },
            body: JSON.stringify({
              messageId: b.closest('.msg')?.dataset?.msgId || Date.now().toString(),
              rating: isLiked ? 1 : -1,
              sessionId: currentChatId
            })
          });
        } catch {} // Non-critical — don't show error to user
      }));

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
    let firstToken = true;

    let renderScheduled = false;
    const updateLive = () => {
        if (renderScheduled) return;
        renderScheduled = true;
        requestAnimationFrame(() => {
            textEl.innerHTML = liveRender(fullText);
            const cursor = document.createElement('span');
            cursor.className = 'stream-cursor';
            (textEl.lastElementChild || textEl).appendChild(cursor);
            renderScheduled = false;
        });
    };

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
          done && done(fullText);
          return;
        }
        try {
          const parsed = JSON.parse(raw);
          if (parsed.error) {
            const msg = parsed.error === 'all_providers_exhausted'
              ? 'المساعد الذكي غير متاح حالياً — حاول مرة أخرى بعد دقيقة.'
              : 'حدث خطأ في المعالجة — حاول مرة أخرى.';
            textEl.innerHTML = `<p style="color:var(--danger,#e33)">${msg}</p>`;
            console.error('[tawjihi-chat] provider error:', parsed.error);
            done && done('');
            return;
          }
          const { content } = parsed;
          if (content) {
            if (firstToken) {
              firstToken = false;
              const shell = textEl.closest('.msg');
              if (shell?._thinkingInterval) {
                clearInterval(shell._thinkingInterval);
                delete shell._thinkingInterval;
              }
              textEl.innerHTML = '';
            }
            fullText += content;
            updateLive();
            onToken && onToken();
          }
        } catch {}
      }
    }
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
    const shell = aiShell(q);
    isSending = true;
    sendBtn.disabled = true;
    const textEl = shell.querySelector('.msg-text');

    const token = await getAuthToken();
    const profile = getProfile();

    conversationMessages.push({ role: 'user', content: q });

    try {
      // AI-4: Include wishlist in request
      const wishlist = JSON.parse(localStorage.getItem('tw-wishlist') || '[]');

      // AI-5: Read file contents before sending
      const fileContents = await Promise.all(
        (files || []).map(async f => ({
          name: f.name,
          type: f.type,
          content: f.type.startsWith('text/')
            ? await f.text()
            : `[ملف مرفق: ${f.name}]`
        }))
      );

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
          orientationMode,
          wishlist,        // AI-4
          files: fileContents, // AI-5
        }),
      });

      if (response.status === 402) {
        textEl.innerHTML = '';
        showNoCredits();
        conversationMessages.pop();
        isSending = false;
        return;
      }

      if (!response.ok) throw new Error('API error ' + response.status);

      await streamFromSSE(textEl, response,
        () => scrollDown(),
        (fullText) => {
          conversationMessages.push({ role: 'assistant', content: fullText });
          if (conversationMessages.length > 20) conversationMessages.splice(0, 2);
          saveMessageToSession('assistant', fullText);

          /* Replace streaming raw text with properly rendered markdown + components */
          const followups = renderAiMessage(textEl, fullText);

          /* Disclaimer */
          const note = document.createElement('p');
          note.className = 'tw-disclaimer';
          note.textContent = 'المعلومات مبنية على بيانات الدليل الوزاري 2025 — أكّد دائماً اختيارك على البوابة الرسمية.';
          textEl.appendChild(note);

          shell.querySelector('.msg-body').appendChild(actionsBar());
          /* Only show follow-up chips when the AI explicitly provided them */
          if (followups && followups.length > 0) {
            shell.querySelector('.msg-body').appendChild(followupChips(followups));
          }
          scrollDown();
          isSending = false;
        }
      );
    } catch (err) {
      textEl.innerHTML = '<p style="color:var(--danger)">حدث خطأ في الاتصال — حاول مرة أخرى.</p>';
      conversationMessages.pop();
      isSending = false;
      console.error('Chat error:', err);
    }
  }

  /* ---- Discover button (orientation mode trigger) ---- */
  $('#discoverBtn')?.addEventListener('click', () => {
    orientationMode = true;
    input.value = 'نحب نعرف التخصص المناسب ليا، ساعدني نكتشف مجالي';
    autosize();
    sendBtn.disabled = false;
    form.requestSubmit();
  });

  /* ---- Form submit ---- */
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (isSending) return;
    const q = input.value.trim(); if (!q) return;
    if (hero && mainEl && !mainEl.classList.contains('chat-started')) {
      mainEl.classList.add('chat-started');
      setTimeout(() => { hero.style.display = 'none'; }, 420);
    }
    if (!currentChatId) saveToHistory(q);
    const files = [...attachedFiles];
    attachedFiles = []; renderAttachChips();
    userMsg(q, files);
    saveMessageToSession('user', q);
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
    orientationMode = false;
    closeHist();
    renderHistory();
    input.focus();
  };
  $('#newChatBtn')?.addEventListener('click', resetChat);
  $('#histNewChat')?.addEventListener('click', resetChat);

  /* ---- Pre-fill from cross-page "Ask AI" navigation ---- */
  const pendingQ = sessionStorage.getItem('tw-pending-q');
  if (pendingQ) {
    sessionStorage.removeItem('tw-pending-q');
    // Pre-fill without sending — user can edit first
    input.value = pendingQ;
    input.dispatchEvent(new Event('input')); // triggers autosize + enables sendBtn
    input.focus();
    setTimeout(() => input.setSelectionRange(0, 0), 50); // cursor at start (RTL)
  }

  /* ---- Render a list of {role,content} messages into the chat ---- */
  function renderSessionMessages(messages) {
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
    if (conversationMessages.length > 20) conversationMessages = conversationMessages.slice(-20);
    scroll.scrollTo({ top: scroll.scrollHeight });
  }

  /* Small centered notice shown inside the chat when a session has no content. */
  function showChatNotice(text) {
    const note = document.createElement('div');
    note.className = 'chat-notice';
    note.textContent = text;
    inner.appendChild(note);
  }

  /* ---- Load a past chat session (localStorage first, Supabase fallback) ---- */
  async function loadChatSession(sessionId) {
    /* Tear the overlay down and reset the view FIRST — before any branch below
       can return early. Otherwise the history scrim stays up and blocks the
       whole window ("cannot access"). resetChat() also closes the panel,
       clears messages and resets currentChatId. */
    resetChat();
    closeHist();
    currentChatId = sessionId;
    renderHistory(); // highlight the now-active item

    /* Fast path: messages cached locally.
       Defer rendering one rAF so the browser paints the closed overlay first. */
    const saved = JSON.parse(localStorage.getItem(`tw-sess-${sessionId}`) || '[]');
    if (saved.length > 0) {
      requestAnimationFrame(() => renderSessionMessages(saved));
      return;
    }

    /* No local copy (session predates local persistence). Try Supabase. */
    if (typeof tw_supabase === 'undefined') {
      showChatNotice('ما لقيناش محتوى هذه المحادثة. ابدأ محادثة جديدة.');
      return;
    }

    const loadEl = document.createElement('div');
    loadEl.className = 'msg ai';
    loadEl.innerHTML = `<div class="msg-avatar">ت</div>
      <div class="msg-body"><div class="msg-text">
        <span class="typing"><span></span><span></span><span></span></span>
      </div></div>`;
    inner.appendChild(loadEl);

    try {
      const { data: { session } } = await tw_supabase.auth.getSession();
      if (!session) { loadEl.remove(); showChatNotice('ما لقيناش محتوى هذه المحادثة. ابدأ محادثة جديدة.'); return; }

      const { data: messages, error } = await tw_supabase
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      loadEl.remove();
      if (error || !messages || messages.length === 0) {
        showChatNotice('ما لقيناش محتوى هذه المحادثة. ابدأ محادثة جديدة.');
        return;
      }

      renderSessionMessages(messages);
      /* Back-fill localStorage so future loads are instant */
      localStorage.setItem(`tw-sess-${sessionId}`, JSON.stringify(
        messages.map(m => ({ role: m.role, content: m.content, ts: new Date(m.created_at).getTime() }))
      ));
    } catch (err) {
      loadEl.remove();
      console.error('Failed to load chat session:', err);
      showChatNotice('تعذّر تحميل المحادثة — حاول مرة أخرى.');
    }
  }
})();
