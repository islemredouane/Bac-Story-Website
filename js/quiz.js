// js/quiz.js — BAC STORY Inline Quiz Component
// Parses [QUIZ]...[/QUIZ] tag data and renders interactive MCQ cards
'use strict';

window.Quiz = (() => {

  // ── Parse QUIZ block ─────────────────────────────────────
  function parseQuiz(raw) {
    // raw is the content between [QUIZ] and [/QUIZ]
    const lines  = (raw || '').trim().split('\n');
    const result = {};
    lines.forEach(line => {
      const idx = line.indexOf(':');
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      result[key] = val;
    });
    return result;
  }

  // ── Parse SCORE block ────────────────────────────────────
  function parseScore(raw) {
    return parseQuiz(raw); // Same format
  }

  // ── Render QUIZ card ─────────────────────────────────────
  function init(container, rawData, opts = {}) {
    let data;
    try {
      // rawData may be HTML-encoded
      const decoded = rawData
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      data = parseQuiz(decoded);
    } catch {
      container.innerHTML = '<div style="color:#ef4444;font-size:.8rem">خطأ في قراءة السؤال</div>';
      return;
    }

    if (!data.question) { container.style.display = 'none'; return; }

    const isOpen   = data.open === 'true';
    const correct  = (data.correct || 'a').toLowerCase();
    const KEYS     = ['a', 'b', 'c'];
    const AR_KEYS  = { a: 'أ', b: 'ب', c: 'ج' };

    const card = document.createElement('div');
    card.className = 'quiz-card';

    // Header
    card.innerHTML = `
      <div class="quiz-card-header">
        <span style="color:rgba(255,255,255,.9);font-size:.85rem">🎯</span>
        <span class="quiz-card-label">سؤال</span>
      </div>
      <div class="quiz-card-q">${escHtml(data.question)}</div>
    `;

    // Options
    const optContainer = document.createElement('div');
    optContainer.className = 'quiz-options';

    let answered = false;

    KEYS.forEach(key => {
      if (!data[key]) return;
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.dataset.key = key;
      btn.innerHTML = `
        <span class="quiz-option-key">${AR_KEYS[key]}</span>
        <span>${escHtml(data[key])}</span>
      `;
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const isCorrect = key === correct;
        btn.classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect) {
          const correctBtn = optContainer.querySelector(`[data-key="${correct}"]`);
          if (correctBtn) correctBtn.classList.add('correct');
        }
        // Disable all
        optContainer.querySelectorAll('.quiz-option').forEach(b => { b.style.cursor = 'default'; });
        // Show explanation
        showExplanation(isCorrect);
      });
      optContainer.appendChild(btn);
    });

    // Open input
    if (isOpen) {
      const input = document.createElement('input');
      input.className = 'quiz-open-input';
      input.placeholder = 'اكتب جوابك...';
      input.type = 'text';
      card.appendChild(input);

      const submitBtn = document.createElement('button');
      submitBtn.className = 'quiz-submit-btn';
      submitBtn.textContent = 'تحقق';
      submitBtn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        showExplanation(null); // Open answer = always show explanation
      });
      card.appendChild(optContainer);
      card.appendChild(submitBtn);
    } else {
      card.appendChild(optContainer);
    }

    // Explanation div
    const expDiv = document.createElement('div');
    expDiv.className = 'quiz-explanation';
    card.appendChild(expDiv);

    function showExplanation(isCorrect) {
      if (data.explanation) {
        expDiv.textContent = data.explanation;
        expDiv.className = `quiz-explanation ${isCorrect === false ? 'wrong-exp' : 'correct-exp'}`;
      }
    }

    container.replaceWith(card);
  }

  // ── Render SCORE card ────────────────────────────────────
  function renderScore(container, rawData) {
    let data;
    try {
      const decoded = rawData
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      data = parseScore(decoded);
    } catch {
      return;
    }

    const correct = parseInt(data.correct) || 0;
    const total   = parseInt(data.total)   || 5;
    const ratio   = correct / total;
    const cls     = ratio >= 0.8 ? 'great' : ratio >= 0.5 ? 'good' : 'poor';
    const emoji   = ratio >= 0.8 ? '🏆' : ratio >= 0.5 ? '👍' : '📚';

    const card = document.createElement('div');
    card.className = 'quiz-score-card';
    card.innerHTML = `
      <div class="quiz-score-ring ${cls}">${emoji}</div>
      <div style="font-size:1.5rem;font-weight:900;color:var(--dark-color);margin-bottom:.35rem">
        ${correct} / ${total}
      </div>
      <div class="quiz-score-msg">${escHtml(data.message || '')}</div>
      ${data.action === 'review'
        ? `<button class="quiz-score-action"><i class="fas fa-book-open"></i> راجع الدرس في الملخصات</button>`
        : `<button class="quiz-score-action"><i class="fas fa-forward"></i> كمّل التحدي</button>`
      }
    `;
    container.replaceWith(card);
  }

  function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  return { init, renderScore };
})();
