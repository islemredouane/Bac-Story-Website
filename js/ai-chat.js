// js/ai-chat.js — BAC STORY AI Chat Application
// Handles: auth, SSE streaming, message rendering, file uploads, mode switching, history
'use strict';

(() => {

// ══════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════
const MODES = {
  advisor:    { label: 'المستشار',    icon: 'fa-hands',          premium: false },
  solver:     { label: 'حل التمارين', icon: 'fa-calculator',     premium: false },
  corrector:  { label: 'التصحيح',     icon: 'fa-circle-check',   premium: false },
  summarizer: { label: 'الملخصات',    icon: 'fa-file-lines',     premium: false },
  quiz:       { label: 'الكويز',      icon: 'fa-circle-question',premium: false },
  planner:    { label: 'المخطط',      icon: 'fa-crown',          premium: true  },
};

window.copyToClipboard = (btn) => {
  const text = btn.closest('.ai-msg-footer').dataset.text;
  navigator.clipboard.writeText(text).then(() => {
    const span = btn.querySelector('span');
    const icon = btn.querySelector('i');
    const oldText = span.textContent;
    span.textContent = 'تم النسخ';
    icon.className = 'fas fa-check';
    setTimeout(() => {
      span.textContent = oldText;
      icon.className = 'far fa-copy';
    }, 2000);
  });
};

const TOOL_PROMPTS = {
  mindmap:    'ابني لي خريطة ذهنية لهذا الدرس',
  quiz:       'تحداني بكويز من هذا الدرس',
  flashcards: 'اصنع لي بطاقات حفظ من هذا الدرس',
};

const MODE_ICONS_MAP = {
  advisor:    'fa-hands',
  solver:     'fa-calculator',
  corrector:  'fa-circle-check',
  summarizer: 'fa-file-lines',
  quiz:       'fa-circle-question',
  planner:    'fa-crown',
};

const STARTERS_BY_MODE = {
  advisor: [
    { icon: 'fa-calendar-check', text: 'كيفاش نخطط دراستي؟' },
    { icon: 'fa-fire',           text: 'ما عندي دافع نقرا — ساعدني' },
    { icon: 'fa-clock',          text: 'واش نبدأ بيه اليوم؟' },
  ],
  solver: [
    { icon: 'fa-calculator',  text: 'حل معايا هذا التمرين' },
    { icon: 'fa-lightbulb',   text: 'شرح لي هذه القاعدة بمثال' },
    { icon: 'fa-question',    text: 'ما فهمتش هذا المفهوم' },
  ],
  quiz: [
    { icon: 'fa-star',       text: 'تحداني في مادتي' },
    { icon: 'fa-list-check', text: 'أسئلة كيما الباك' },
  ],
  summarizer: [
    { icon: 'fa-compress',     text: 'لخص لي هذا الدرس' },
    { icon: 'fa-bolt',         text: 'أهم النقاط للمراجعة' },
  ],
};

const FREE_LIMIT = 5;

// ══════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════
let State = {
  user:            null,
  token:           null,
  mode:            'advisor',
  sessionId:       null,
  sessions:        [],
  files:           [],       // [{ id, name, size, type, text, enabled }]
  isStreaming:     false,
  history:         [],       // Gemini conversation history (last 10 turns)
  todayCount:      0,
};

// ══════════════════════════════════════════════════════════
// DOM
// ══════════════════════════════════════════════════════════
const $  = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);

const DOM = {
  app:             $('aiApp'),
  messages:        qs('#messages .ai-messages-inner'),
  scrollContainer: $('messages'),
  welcomeState:    $('welcomeState'),
  welcomeSub:      $('welcomeSub'),
  starters:        $('starters'),
  chatTitle:       $('chatTitle'),
  userInput:       $('userInput'),
  sendBtn:         $('sendBtn'),
  inputRow:        $('inputRow'),
  modeChip:        $('modeChip'),
  modeIcon:        $('modeIcon'),
  modeLabel:       $('modeLabel'),
  modeDropdown:    $('modeDropdown'),
  limitBanner:     $('limitBanner'),
  fileInput:       $('fileInput'),
  uploadBtn:       $('uploadBtn'),
  sourcesList:     $('sourcesList'),
  sourcesEmpty:    $('sourcesEmpty'),
  sourcesLimit:    $('sourcesLimit'),
  sourcesPanel:    $('sourcesPanel'),
  toolsPanel:      $('toolsPanel'),
  historyPanel:    $('historyPanel'),
  historyToggle:   $('historyToggle'),
  historyClose:    $('historyClose'),
  historyList:     $('historyList'),
  toolsHistoryList:$('toolsHistoryList'),
  newChatBtn:      $('newChatBtn'),
  topbarAvatar:    $('topbarAvatar'),
  topbarName:      $('topbarName'),
  topbarTier:      $('topbarTier'),
  footerName:      $('footerName'),
  footerTier:      $('footerTier'),
  toggleSources:   $('toggleSources'),
  toggleTools:     $('toggleTools'),
  mobileOverlay:   $('mobileOverlay'),
};

// ══════════════════════════════════════════════════════════
// BOOT
// ══════════════════════════════════════════════════════════
async function boot() {
  try {
    // Wait for Auth to validate session (also handles onboarding redirect internally)
    await Auth.init();

    // If navigation was triggered by Auth.init(), stop here
    if (location.pathname.includes('onboarding')) return;

    const session = Auth.getSessionSync();
    
    // Hide splash screen
    const splash = document.getElementById('aiSplash');
    if (splash) splash.style.display = 'none';

    // Show app to give background context for the modal
    DOM.app.style.display = 'grid';

    if (!session) {
      // Blur the app when opening modal
      DOM.app.style.filter = 'blur(4px)';
      Auth.openModal({ onSuccess: () => location.reload() });
      return;
    }
    
    DOM.app.style.filter = 'none';
    State.user  = session.user;
    State.token = session.token;

    // Check onboarding (belt-and-suspenders)
    if (State.user.onboarding_done === false) {
      location.replace('/onboarding');
      return;
    }

    // Render user info
    renderUserInfo();

    // Build mode dropdown
    buildModeDropdown();

    // Load usage count
    loadUsage();

    // Load history
    await loadHistory();

    // Check URL for pre-selected session
    const urlParams = new URLSearchParams(location.search);
    const urlSession = urlParams.get('session');
    if (urlSession) {
      await loadSession(urlSession);
    } else {
      renderStarters();
    }

    // Focus textarea
    DOM.userInput.focus();

  } catch (err) {
    console.error('Boot error:', err);
  }
}

// ══════════════════════════════════════════════════════════
// USER INFO
// ══════════════════════════════════════════════════════════
const SPECIALTY_NAMES = { math:'رياضيات', science:'علوم تجريبية', tech:'تقني رياضي', management:'تسيير واقتصاد', literature:'آداب وفلسفة', languages:'لغات أجنبية' };

// Safe DOM helpers — never crash on null elements
const _setText = (id, v) => { const el = typeof id === 'string' ? document.getElementById(id) : id; if (el) el.textContent = v; };
const _setClass = (id, v) => { const el = typeof id === 'string' ? document.getElementById(id) : id; if (el) el.className = v; };

function renderUserInfo() {
  const { user } = State;
  const firstLetter = (user.name || 'ط')[0].toUpperCase();

  // Avatar (sidebar footer)
  _setText(DOM.topbarAvatar, firstLetter);

  // User name / tier in sidebar footer
  _setText(DOM.footerName, user.name || 'طالب');

  // Subject pill in topbar — show specialty
  const subjectEl = document.getElementById('currentSubject');
  if (subjectEl && user.specialty) {
    subjectEl.textContent = SPECIALTY_NAMES[user.specialty] || 'الشعبة';
  }

  // Topbar name/tier (may not exist in all HTML versions)
  if (DOM.topbarName) DOM.topbarName.textContent = user.name ? user.name.split(' ')[0] : 'طالب';

  if (user.is_premium) {
    if (DOM.topbarTier) { DOM.topbarTier.className = 'ai-tier-badge ai-tier-badge--premium'; DOM.topbarTier.textContent = '👑 Premium'; }
    _setText(DOM.footerTier, 'Premium 👑 — رسائل غير محدودة');
  } else {
    if (DOM.topbarTier) { DOM.topbarTier.className = 'ai-tier-badge ai-tier-badge--free'; DOM.topbarTier.textContent = 'مجاني'; }
    _setText(DOM.footerTier, `مجاني — ${FREE_LIMIT} رسائل/يوم`);
  }

  // Welcome sub text
  if (DOM.welcomeSub) {
    if (user.onboarding_data?.weak_subjects?.length) {
      const weak = user.onboarding_data.weak_subjects.slice(0, 2).join(' و');
      DOM.welcomeSub.textContent = `إسلام جاهز يساعدك — خاصة في ${weak} 🎯`;
    } else {
      const hour = new Date().getHours();
      DOM.welcomeSub.textContent = hour < 12
        ? 'صباح الخير — بدّل الوضع وابدأ المحادثة 👇'
        : 'أهلاً — اختر الوضع المناسب وابدأ 👇';
    }
  }
}

// ══════════════════════════════════════════════════════════
// USAGE
// ══════════════════════════════════════════════════════════
async function loadUsage() {
  if (State.user.is_premium) return;
  try {
    const r = await apiGet('/api/profile');
    State.todayCount = r.today_messages || 0;
    updateLimitUI();
  } catch { /* non-critical */ }
}

function updateLimitUI() {
  if (State.user.is_premium) return;
  if (State.todayCount >= FREE_LIMIT) {
    DOM.limitBanner.classList.remove('hidden');
    DOM.sendBtn.disabled = true;
    DOM.userInput.placeholder = 'وصلت للحد اليومي — اشترك في Premium';
    DOM.userInput.disabled = true;
  }
}

// ══════════════════════════════════════════════════════════
// MODE SWITCHER
// ══════════════════════════════════════════════════════════
function buildModeDropdown() {
  DOM.modeDropdown.innerHTML = Object.entries(MODES).map(([key, m]) => {
    const locked   = m.premium && !State.user.is_premium;
    const premCls  = m.premium ? 'ai-mode-opt--premium' : '';
    const lockCls  = locked    ? 'ai-mode-opt--locked'  : '';
    const lockIcon = locked    ? ' <i class="fas fa-lock" style="font-size:.65rem;margin-right:auto"></i>' : '';
    return `
      <button class="ai-mode-opt ${premCls} ${lockCls}" data-mode="${key}" ${locked ? 'disabled' : ''}>
        <i class="fas ${m.icon}"></i>
        ${m.label}${lockIcon}
      </button>`;
  }).join('');

  DOM.modeDropdown.querySelectorAll('.ai-mode-opt:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      setMode(btn.dataset.mode);
      DOM.modeDropdown.classList.remove('open');
    });
  });

  // Highlight current
  highlightModeOpt();
}

function setMode(mode) {
  State.mode = mode;
  const m = MODES[mode];
  // Guard: modeIcon/modeLabel may not exist in the current HTML (simple + button layout)
  if (DOM.modeIcon) DOM.modeIcon.className = `fas ${m.icon}`;
  if (DOM.modeLabel) DOM.modeLabel.textContent = m.label;
  // Update mode chip title tooltip for accessibility
  if (DOM.modeChip) DOM.modeChip.title = m.label;
  highlightModeOpt();
  renderStarters();
}

function highlightModeOpt() {
  DOM.modeDropdown.querySelectorAll('.ai-mode-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === State.mode);
  });
}

DOM.modeChip.addEventListener('click', (e) => {
  e.stopPropagation();
  DOM.modeDropdown.classList.toggle('open');
});
document.addEventListener('click', () => DOM.modeDropdown.classList.remove('open'));

// ══════════════════════════════════════════════════════════
// STARTERS
// ══════════════════════════════════════════════════════════
function renderStarters() {
  const starters = STARTERS_BY_MODE[State.mode] || STARTERS_BY_MODE.advisor;
  DOM.starters.innerHTML = starters.map(s => `
    <button class="ai-starter-btn" data-text="${escHtml(s.text)}">
      <i class="fas ${s.icon}"></i>
      ${escHtml(s.text)}
    </button>
  `).join('');
  DOM.starters.querySelectorAll('.ai-starter-btn').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.text));
  });
}

// ══════════════════════════════════════════════════════════
// TEXTAREA AUTO-RESIZE
// ══════════════════════════════════════════════════════════
DOM.userInput.addEventListener('input', () => {
  DOM.userInput.style.height = 'auto';
  DOM.userInput.style.height = Math.min(DOM.userInput.scrollHeight, 140) + 'px';
  DOM.sendBtn.disabled = !DOM.userInput.value.trim() || State.isStreaming;
});

DOM.userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!DOM.sendBtn.disabled) sendMessage();
  }
});

DOM.sendBtn.addEventListener('click', () => sendMessage());

// ══════════════════════════════════════════════════════════
// SEND MESSAGE
// ══════════════════════════════════════════════════════════
async function sendMessage(text) {
  const message = (text || DOM.userInput.value).trim();
  if (!message || State.isStreaming) return;

  // Limit check (client-side guard)
  if (!State.user.is_premium && State.todayCount >= FREE_LIMIT) return;

  // Hide welcome
  DOM.welcomeState.style.display = 'none';

  // Clear input
  DOM.userInput.value = '';
  DOM.userInput.style.height = 'auto';
  DOM.sendBtn.disabled = true;

  // Append user message
  appendMessage('user', message);

  // Start streaming
  State.isStreaming = true;
  setStreamingUI(true);

  // Build file context
  const fileContext = getActiveFileContext();

  // Streaming placeholder
  const assistantEl = appendStreamingBubble();

  try {
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${State.token}`,
      },
      body: JSON.stringify({
        message,
        mode:         State.mode,
        session_id:   State.sessionId,
        file_context: fileContext,
        history:      State.history,
      }),
    });

    if (res.status === 429) {
      const data = await res.json();
      removeStreamingBubble(assistantEl);
      if (data.upgrade_required) {
        DOM.limitBanner.classList.remove('hidden');
        DOM.sendBtn.disabled = true;
        DOM.userInput.disabled = true;
        DOM.userInput.placeholder = 'وصلت للحد اليومي — اشترك في Premium';
      }
      State.isStreaming = false;
      setStreamingUI(false);
      return;
    }

    if (res.status === 403) {
      removeStreamingBubble(assistantEl);
      appendErrorMsg('هذا الوضع متاح لمشتركي Premium فقط 👑');
      State.isStreaming = false;
      setStreamingUI(false);
      return;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    // SSE read
    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = '';
    let   rawText = '';

    const bubbleText = assistantEl.querySelector('.ai-bubble-streaming');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const evt = JSON.parse(jsonStr);

          if (evt.type === 'session') {
            State.sessionId = evt.session_id;
            DOM.chatTitle.textContent = message.slice(0, 50);
          }

          if (evt.type === 'chunk') {
            rawText += evt.text;
            // Show raw text during streaming (safe, no partial tag rendering)
            bubbleText.textContent = rawText;
            scrollToBottom();
          }

          if (evt.type === 'done') {
            // Replace streaming bubble with rendered HTML
            finalizeMessage(assistantEl, rawText);
            // Update conversation history
            State.history.push(
              { role: 'user',  parts: [{ text: message }] },
              { role: 'model', parts: [{ text: rawText  }] },
            );
            // Keep last 10 turns
            if (State.history.length > 20) State.history = State.history.slice(-20);
            State.todayCount++;
            updateLimitUI();
            await loadHistory();
          }

          if (evt.type === 'error') {
            removeStreamingBubble(assistantEl);
            appendErrorMsg(evt.message || 'حدث خطأ');
          }

        } catch { /* skip */ }
      }
    }

  } catch (err) {
    console.error('Send error:', err);
    removeStreamingBubble(assistantEl);
    appendErrorMsg('انقطع الاتصال — حاول مرة أخرى');
  } finally {
    State.isStreaming = false;
    setStreamingUI(false);
    DOM.sendBtn.disabled = !DOM.userInput.value.trim();
  }
}

function setStreamingUI(on) {
  DOM.sendBtn.classList.toggle('loading', on);
  DOM.sendBtn.disabled = on;
  DOM.userInput.disabled = on;
  if (!on) DOM.userInput.focus();
}

// ══════════════════════════════════════════════════════════
// MESSAGE RENDERING
// ══════════════════════════════════════════════════════════
function appendMessage(role, text) {
  const div  = document.createElement('div');
  div.className = `ai-msg ai-msg--${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'ai-msg-avatar';
  avatar.innerHTML = role === 'user'
    ? '<i class="fas fa-user"></i>'
    : '<i class="fas fa-robot"></i>';

  const body = document.createElement('div');
  body.className = 'ai-msg-body';

  const bubble = document.createElement('div');
  bubble.className = 'ai-msg-bubble';

  if (role === 'user') {
    bubble.textContent = text;
  } else {
    bubble.innerHTML = renderTags(text);
    // Mount interactive components
    mountComponents(bubble);
  }

  const time = document.createElement('div');
  time.className = 'ai-msg-time';
  time.textContent = new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

  body.appendChild(bubble);
  
  if (role === 'model') {
    const footer = document.createElement('div');
    footer.className = 'ai-msg-footer';
    footer.innerHTML = `
      <button class="ai-copy-btn" onclick="window.copyToClipboard(this)">
        <i class="far fa-copy"></i>
        <span>نسخ</span>
      </button>
    `;
    body.appendChild(footer);
    
    // Store text for copying
    footer.dataset.text = text;
  }

  body.appendChild(time);

  // Both avatars on the right (RTL layout)
  div.appendChild(avatar);
  div.appendChild(body);

  DOM.messages.appendChild(div);
  scrollToBottom();
  return div;
}

function appendStreamingBubble() {
  const div  = document.createElement('div');
  div.className = 'ai-msg ai-msg--model';
  div.innerHTML = `
    <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
    <div class="ai-msg-body">
      <div class="ai-msg-bubble">
        <span class="ai-bubble-streaming"></span><span class="ai-cursor"></span>
      </div>
    </div>`;
  DOM.messages.appendChild(div);
  scrollToBottom();
  return div;
}

function finalizeMessage(el, rawText) {
  const bubble = el.querySelector('.ai-msg-bubble');
  bubble.innerHTML = renderTags(rawText);
  // Remove cursor
  const cursor = bubble.querySelector('.ai-cursor');
  if (cursor) cursor.remove();

  const body = el.querySelector('.ai-msg-body');

  // Add copy button (model messages only)
  const footer = document.createElement('div');
  footer.className = 'ai-msg-footer';
  footer.dataset.text = rawText;
  footer.innerHTML = `
    <button class="ai-copy-btn" onclick="window.copyToClipboard(this)">
      <i class="far fa-copy"></i>
      <span>نسخ</span>
    </button>
  `;
  body.appendChild(footer);

  // Add timestamp
  const time = document.createElement('div');
  time.className = 'ai-msg-time';
  time.textContent = new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });
  body.appendChild(time);

  mountComponents(bubble);
  scrollToBottom();
}

function removeStreamingBubble(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

function appendErrorMsg(text) {
  const div = document.createElement('div');
  div.className = 'ai-error-msg';
  div.textContent = '⚠️ ' + text;
  DOM.messages.appendChild(div);
  scrollToBottom();
}

function scrollToBottom() {
  if (DOM.scrollContainer) {
    DOM.scrollContainer.scrollTop = DOM.scrollContainer.scrollHeight;
  }
}

// ══════════════════════════════════════════════════════════
// TAG RENDERER
// ══════════════════════════════════════════════════════════
function renderTags(raw) {
  if (!raw) return '';
  let html = escHtml(raw);

  // [TITLE]...[/TITLE]
  html = html.replace(/\[TITLE\]([\s\S]*?)\[\/TITLE\]/g,
    (_, c) => `<div class="ai-tag-title">${c.trim()}</div>`);

  // [!gold]...[/gold] or [/!gold]
  html = html.replace(/\[!gold\]([\s\S]*?)\[\/?!?gold\]/g,
    (_, c) => `<div class="ai-tag-gold">${c.trim()}</div>`);
  html = html.replace(/\[!green\]([\s\S]*?)\[\/?!?green\]/g,
    (_, c) => `<div class="ai-tag-green">${c.trim()}</div>`);
  html = html.replace(/\[!red\]([\s\S]*?)\[\/?!?red\]/g,
    (_, c) => `<div class="ai-tag-red">${c.trim()}</div>`);
  html = html.replace(/\[!blue\]([\s\S]*?)\[\/?!?blue\]/g,
    (_, c) => `<div class="ai-tag-blue">${c.trim()}</div>`);
  html = html.replace(/\[!gray\]([\s\S]*?)\[\/?!?gray\]/g,
    (_, c) => `<div class="ai-tag-gray">${c.trim()}</div>`);
  html = html.replace(/\[!formula\]([\s\S]*?)\[\/?!?formula\]/g,
    (_, c) => `<div class="ai-tag-formula">${c.trim()}</div>`);

  // [STEPS]...[/STEPS]  — items separated by lines starting with \d+-
  html = html.replace(/\[STEPS\]([\s\S]*?)\[\/STEPS\]/g, (_, content) => {
    const items = content.trim().split(/\n(?=\d+[-.])/);
    const lis = items.map(item => {
      const text = item.replace(/^\d+[-.]?\s*/, '').trim();
      return `<li>${text}</li>`;
    }).join('');
    return `<ol class="ai-tag-steps">${lis}</ol>`;
  });

  // [QUIZ]...[/QUIZ] — placeholder for interactive quiz
  html = html.replace(/\[QUIZ\]([\s\S]*?)\[\/QUIZ\]/g,
    (_, content) => `<div class="ai-quiz-placeholder" data-quiz="${escAttr(content)}"></div>`);

  // [QUIZ_SCORE]...[/QUIZ_SCORE]
  html = html.replace(/\[QUIZ_SCORE\]([\s\S]*?)\[\/QUIZ_SCORE\]/g,
    (_, content) => `<div class="ai-score-placeholder" data-score="${escAttr(content)}"></div>`);

  // [FLASHCARDS]...[/FLASHCARDS]
  html = html.replace(/\[FLASHCARDS\]([\s\S]*?)\[\/FLASHCARDS\]/g,
    (_, content) => `<div class="ai-flashcards-placeholder" data-cards="${escAttr(content)}"></div>`);

  // [MINDMAP]...[/MINDMAP]
  html = html.replace(/\[MINDMAP\]([\s\S]*?)\[\/MINDMAP\]/g,
    (_, content) => `<div class="ai-mindmap-placeholder" data-map="${escAttr(content)}"></div>`);

  // [EXPORT ...]...[/EXPORT] — show as downloadable-style block
  html = html.replace(/\[EXPORT[^\]]*\]([\s\S]*?)\[\/EXPORT\]/g,
    (_, content) => `<div class="ai-tag-blue" style="white-space:pre-line">${content.trim()}</div>`);

  // Newlines → <br> (for text outside tags)
  html = html.replace(/\n/g, '<br>');

  return html;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ══════════════════════════════════════════════════════════
// INTERACTIVE COMPONENT MOUNTING
// ══════════════════════════════════════════════════════════
function mountComponents(container) {
  // Quiz
  container.querySelectorAll('.ai-quiz-placeholder').forEach(el => {
    if (typeof Quiz !== 'undefined') {
      try { Quiz.init(el, el.dataset.quiz, { token: State.token }); } catch(e) { console.warn(e); }
    }
  });

  // Quiz score
  container.querySelectorAll('.ai-score-placeholder').forEach(el => {
    if (typeof Quiz !== 'undefined') {
      try { Quiz.renderScore(el, el.dataset.score); } catch(e) { console.warn(e); }
    }
  });

  // Flashcards
  container.querySelectorAll('.ai-flashcards-placeholder').forEach(el => {
    if (typeof Flashcards !== 'undefined') {
      try { Flashcards.init(el, el.dataset.cards, { token: State.token }); } catch(e) { console.warn(e); }
    }
  });

  // Mindmap
  container.querySelectorAll('.ai-mindmap-placeholder').forEach(el => {
    if (typeof Mindmap !== 'undefined') {
      try { Mindmap.init(el, el.dataset.map); } catch(e) { console.warn(e); }
    }
  });
}

// ══════════════════════════════════════════════════════════
// FILE UPLOADS
// ══════════════════════════════════════════════════════════
const MAX_FILES = 10;
const MAX_PREMIUM_FILES = 50;

DOM.uploadBtn.addEventListener('click', () => DOM.fileInput.click());
DOM.fileInput.addEventListener('change', handleFiles);

async function handleFiles(e) {
  const maxFiles = State.user.is_premium ? MAX_PREMIUM_FILES : MAX_FILES;
  const remaining = maxFiles - State.files.length;
  if (remaining <= 0) { alert(`حد الملفات ${maxFiles}`); return; }

  const toProcess = Array.from(e.target.files).slice(0, remaining);
  DOM.fileInput.value = '';

  for (const file of toProcess) {
    await addFile(file);
  }
}

async function addFile(file) {
  const id   = `f_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const type = getFileType(file);
  let   text = '';

  try {
    if (type === 'txt') {
      text = await file.text();
    } else if (type === 'pdf') {
      text = await extractPdfText(file);
    } else if (type === 'img') {
      text = `[صورة: ${file.name}] — سيتم إرسالها للتحليل`;
      // For images we encode as base64 and include in prompt
      text = await encodeImageToBase64(file);
    }
  } catch (err) {
    console.warn('File extract error:', err);
    text = `[ملف: ${file.name}]`;
  }

  const fileObj = { id, name: file.name, size: file.size, type, text, enabled: true };
  State.files.push(fileObj);
  renderFileList();
}

async function extractPdfText(file) {
  // Simple: read as text (works for text-based PDFs)
  // For real PDF.js extraction, would need the library
  try {
    const text = await file.text();
    return text.slice(0, 5000);
  } catch {
    return `[PDF: ${file.name}]`;
  }
}

async function encodeImageToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result.split(',')[1];
      resolve(`[IMAGE_BASE64:${file.name}:${b64.slice(0, 100)}...]`);
    };
    reader.onerror = () => resolve(`[صورة: ${file.name}]`);
    reader.readAsDataURL(file);
  });
}

function getFileType(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (/\.(png|jpg|jpeg|webp|gif)$/.test(name)) return 'img';
  return 'txt';
}

function getFileIcon(type) {
  if (type === 'pdf') return 'fa-file-pdf';
  if (type === 'img') return 'fa-image';
  return 'fa-file-lines';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function renderFileList() {
  const maxFiles = State.user.is_premium ? MAX_PREMIUM_FILES : MAX_FILES;
  DOM.sourcesLimit.textContent = `${State.files.length} / ${maxFiles} ملفات`;
  DOM.sourcesEmpty.style.display = State.files.length ? 'none' : '';

  // Remove existing file items (keep empty state)
  DOM.sourcesList.querySelectorAll('.ai-source-item').forEach(el => el.remove());

  State.files.forEach(f => {
    const item = document.createElement('div');
    item.className = 'ai-source-item';
    item.dataset.id = f.id;

    item.innerHTML = `
      <div class="ai-source-icon ${f.type}">
        <i class="fas ${getFileIcon(f.type)}"></i>
      </div>
      <div class="ai-source-info">
        <div class="ai-source-name">${escHtml(f.name)}</div>
        <div class="ai-source-size">${formatSize(f.size)}</div>
      </div>
      <label class="ai-source-toggle" title="${f.enabled ? 'مفعّل' : 'معطّل'}">
        <input type="checkbox" ${f.enabled ? 'checked' : ''} />
        <span class="ai-source-toggle-track"></span>
      </label>
      <button class="ai-source-delete" title="حذف"><i class="fas fa-times"></i></button>
    `;

    // Toggle
    item.querySelector('input[type="checkbox"]').addEventListener('change', e => {
      const file = State.files.find(x => x.id === f.id);
      if (file) file.enabled = e.target.checked;
    });

    // Delete
    item.querySelector('.ai-source-delete').addEventListener('click', () => {
      State.files = State.files.filter(x => x.id !== f.id);
      renderFileList();
    });

    DOM.sourcesList.appendChild(item);
  });
}

function getActiveFileContext() {
  const active = State.files.filter(f => f.enabled && f.text);
  if (!active.length) return null;
  return active.map(f => `=== ${f.name} ===\n${f.text}`).join('\n\n');
}

// ══════════════════════════════════════════════════════════
// HISTORY
// ══════════════════════════════════════════════════════════
async function loadHistory() {
  try {
    const data = await apiGet('/api/ai-history?limit=10');
    State.sessions = data.sessions || [];
    renderHistoryList();
    renderToolsHistory();
  } catch { /* non-critical */ }
}

function renderHistoryList() {
  if (!State.sessions.length) {
    DOM.historyList.innerHTML = '<div style="text-align:center;padding:2rem 1rem;color:#94a3b8;font-size:.85rem">لا توجد محادثات سابقة</div>';
    return;
  }
  DOM.historyList.innerHTML = State.sessions.map(s => `
    <div class="ai-history-session${s.id === State.sessionId ? ' active' : ''}" data-id="${s.id}">
      <div class="ai-history-session-title">${escHtml(s.title || 'محادثة')}</div>
      <div class="ai-history-session-meta">
        <span>${s.mode ? (MODES[s.mode]?.label || s.mode) : '—'}</span>
        <button class="ai-history-del" data-id="${s.id}" title="حذف"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');

  DOM.historyList.querySelectorAll('.ai-history-session').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.ai-history-del')) return;
      loadSession(el.dataset.id);
      DOM.historyPanel.classList.remove('open');
    });
  });
  DOM.historyList.querySelectorAll('.ai-history-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSession(btn.dataset.id);
    });
  });
}

function renderToolsHistory() {
  if (!State.sessions.length) {
    DOM.toolsHistoryList.innerHTML = '<div style="font-size:.78rem;color:#94a3b8;padding:.25rem">لا توجد محادثات</div>';
    return;
  }
  DOM.toolsHistoryList.innerHTML = State.sessions.slice(0, 5).map(s => {
    const icon = MODE_ICONS_MAP[s.mode] || 'fa-comments';
    return `
      <div class="ai-history-item" data-id="${s.id}">
        <div class="ai-history-item-icon"><i class="fas ${icon}"></i></div>
        <div class="ai-history-item-text">
          <div class="ai-history-item-title">${escHtml(s.title || 'محادثة')}</div>
          <div class="ai-history-item-meta">${MODES[s.mode]?.label || s.mode || '—'}</div>
        </div>
      </div>`;
  }).join('');

  DOM.toolsHistoryList.querySelectorAll('.ai-history-item').forEach(el => {
    el.addEventListener('click', () => loadSession(el.dataset.id));
  });
}

async function loadSession(sessionId) {
  try {
    const data = await apiGet(`/api/ai-history?session=${sessionId}`);
    State.sessionId = sessionId;
    State.history   = [];

    // Clear messages
    DOM.messages.innerHTML = '';
    DOM.chatTitle.textContent = data.session?.title || 'محادثة';

    // Set mode
    if (data.session?.mode && MODES[data.session.mode]) {
      setMode(data.session.mode);
    }

    // Render messages
    (data.messages || []).forEach(m => {
      appendMessage(m.role === 'user' ? 'user' : 'model', m.content);
      // Rebuild history
      State.history.push({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] });
    });

    if (!data.messages?.length) {
      DOM.messages.innerHTML = '';
      DOM.welcomeState.style.display = '';
      DOM.welcomeState.style.display = 'flex';
    }

    scrollToBottom();
    DOM.historyPanel.classList.remove('open');
  } catch (err) {
    console.error('Load session error:', err);
  }
}

async function deleteSession(sessionId) {
  if (!confirm('حذف هذه المحادثة؟')) return;
  try {
    await fetch(`/api/ai-history?session=${sessionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${State.token}` },
    });
    if (State.sessionId === sessionId) {
      startNewChat();
    }
    await loadHistory();
  } catch (err) {
    console.error('Delete error:', err);
  }
}

// ══════════════════════════════════════════════════════════
// NEW CHAT
// ══════════════════════════════════════════════════════════
DOM.newChatBtn.addEventListener('click', startNewChat);

function startNewChat() {
  State.sessionId = null;
  State.history   = [];
  DOM.messages.innerHTML = '';
  DOM.chatTitle.textContent = 'محادثة جديدة';

  // Re-show welcome
  const welcome = document.createElement('div');
  welcome.id = 'welcomeState';
  welcome.className = 'ai-welcome';
  welcome.innerHTML = `
    <div class="ai-welcome-glow"></div>
    <div class="ai-welcome-logo">إسلام <span>AI</span></div>
    <h1 class="ai-welcome-title">مرحباً! كيفاش نقدر نساعدك اليوم؟</h1>
    <div class="ai-welcome-sub" id="welcomeSub">اختر الوضع المناسب وابدأ المحادثة</div>
    <div class="ai-welcome-starters" id="starters"></div>
  `;
  DOM.messages.appendChild(welcome);
  DOM.welcomeState = welcome;
  DOM.welcomeSub   = welcome.querySelector('#welcomeSub');
  DOM.starters     = welcome.querySelector('#starters');
  renderStarters();
  DOM.historyPanel.classList.remove('open');
}

// ══════════════════════════════════════════════════════════
// TOOL CARDS
// ══════════════════════════════════════════════════════════
document.querySelectorAll('.ai-tool-card').forEach(card => {
  card.addEventListener('click', () => {
    const tool = card.dataset.tool;
    const prompt = TOOL_PROMPTS[tool];
    if (!prompt) return;
    // Auto-switch to relevant mode
    const modeMap = { quiz: 'quiz', flashcards: 'summarizer', mindmap: 'summarizer' };
    if (modeMap[tool]) setMode(modeMap[tool]);
    DOM.userInput.value = prompt;
    DOM.userInput.dispatchEvent(new Event('input'));
    DOM.userInput.focus();
  });
});

// ══════════════════════════════════════════════════════════
// PANELS — HISTORY TOGGLE
// ══════════════════════════════════════════════════════════
DOM.historyToggle.addEventListener('click', () => {
  DOM.historyPanel.classList.toggle('open');
});
DOM.historyClose.addEventListener('click', () => {
  DOM.historyPanel.classList.remove('open');
});

// ══════════════════════════════════════════════════════════
// MOBILE — SIDEBAR TOGGLE
// ══════════════════════════════════════════════════════════
function closeMobileSidebar() {
  DOM.sourcesPanel.classList.remove('mobile-open');
  DOM.mobileOverlay.classList.remove('active');
}

DOM.toggleSources?.addEventListener('click', () => {
  const isOpen = DOM.sourcesPanel.classList.contains('mobile-open');
  if (isOpen) {
    closeMobileSidebar();
  } else {
    DOM.sourcesPanel.classList.add('mobile-open');
    DOM.mobileOverlay.classList.add('active');
  }
});

DOM.mobileOverlay.addEventListener('click', closeMobileSidebar);

// ══════════════════════════════════════════════════════════
// API HELPERS
// ══════════════════════════════════════════════════════════
async function apiGet(url) {
  const r = await fetch(url, {
    headers: { 'Authorization': `Bearer ${State.token}` },
  });
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}

// ══════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', boot);

})();
