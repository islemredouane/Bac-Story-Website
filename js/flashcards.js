// js/flashcards.js — BAC STORY Inline Flashcards Component
'use strict';

window.Flashcards = (() => {

  function parseCards(raw) {
    // Decode HTML entities
    const decoded = (raw || '')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    try {
      return JSON.parse(decoded); // Expect array of {front, back, subject?}
    } catch {
      // Fallback: try line-based format "FRONT|BACK"
      return decoded.trim().split('\n')
        .filter(l => l.includes('|'))
        .map(l => {
          const [front, back] = l.split('|');
          return { front: front?.trim(), back: back?.trim() };
        })
        .filter(c => c.front && c.back);
    }
  }

  function init(container, rawData, opts = {}) {
    const cards = parseCards(rawData);
    if (!cards.length) { container.style.display = 'none'; return; }

    let current = 0;
    let flipped  = false;
    const ratings = new Array(cards.length).fill(null);

    const wrap = document.createElement('div');
    wrap.className = 'flash-container';

    wrap.innerHTML = `
      <div class="flash-header">
        <div class="flash-header-label"><span>🃏</span> بطاقات الحفظ</div>
        <div class="flash-counter" id="fc-counter">1 / ${cards.length}</div>
      </div>
      <div class="flash-stage" id="fc-stage">
        <div class="flash-card-inner" id="fc-inner">
          <div class="flash-card-front">
            <div class="flash-card-side-label">السؤال</div>
            <div class="flash-card-text" id="fc-front-text"></div>
            <div class="flash-card-hint">اضغط للقلب 👆</div>
          </div>
          <div class="flash-card-back">
            <div class="flash-card-side-label">الجواب</div>
            <div class="flash-card-text" id="fc-back-text"></div>
          </div>
        </div>
      </div>
      <div class="flash-ratings" id="fc-ratings">
        <button class="flash-rating-btn flash-rating-btn--hard" data-rating="hard">😓 صعب</button>
        <button class="flash-rating-btn flash-rating-btn--medium" data-rating="medium">🤔 متوسط</button>
        <button class="flash-rating-btn flash-rating-btn--easy" data-rating="easy">😎 سهل</button>
      </div>
      <div class="flash-footer">
        <button class="flash-nav-btn" id="fc-prev" disabled><i class="fas fa-arrow-right"></i></button>
        <div class="flash-progress"><div class="flash-progress-fill" id="fc-bar" style="width:${100/cards.length}%"></div></div>
        <button class="flash-nav-btn" id="fc-next"><i class="fas fa-arrow-left"></i></button>
        <button class="flash-save-btn" id="fc-save"><i class="fas fa-download"></i> احفظ</button>
      </div>
    `;

    const inner   = wrap.querySelector('#fc-inner');
    const counter = wrap.querySelector('#fc-counter');
    const bar     = wrap.querySelector('#fc-bar');
    const ratDiv  = wrap.querySelector('#fc-ratings');
    const prevBtn = wrap.querySelector('#fc-prev');
    const nextBtn = wrap.querySelector('#fc-next');
    const saveBtn = wrap.querySelector('#fc-save');

    function renderCard(i) {
      current = i;
      flipped = false;
      inner.classList.remove('flipped');
      wrap.querySelector('#fc-front-text').textContent = cards[i].front || '';
      wrap.querySelector('#fc-back-text').textContent  = cards[i].back  || '';
      counter.textContent  = `${i + 1} / ${cards.length}`;
      bar.style.width      = `${((i + 1) / cards.length) * 100}%`;
      prevBtn.disabled     = i === 0;
      nextBtn.disabled     = i === cards.length - 1;
      ratDiv.classList.remove('visible');
    }

    // Flip on click
    inner.addEventListener('click', () => {
      flipped = !flipped;
      inner.classList.toggle('flipped', flipped);
      if (flipped) ratDiv.classList.add('visible');
    });

    // Rating buttons
    ratDiv.querySelectorAll('.flash-rating-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        ratings[current] = btn.dataset.rating;
        if (current < cards.length - 1) {
          renderCard(current + 1);
        } else {
          showFinished();
        }
      });
    });

    prevBtn.addEventListener('click', () => { if (current > 0) renderCard(current - 1); });
    nextBtn.addEventListener('click', () => { if (current < cards.length - 1) renderCard(current + 1); });

    saveBtn.addEventListener('click', async () => {
      if (opts.token) {
        try {
          await fetch('/api/profile', {
            method: 'POST',
            headers: {
              'Content-Type':  'application/json',
              'Authorization': `Bearer ${opts.token}`,
            },
            body: JSON.stringify({
              action: 'save_deck',
              title:  `بطاقات — ${new Date().toLocaleDateString('ar-DZ')}`,
              subject: cards[0]?.subject || '',
              cards_json: JSON.stringify(cards),
            }),
          });
          saveBtn.textContent = '✅ تم الحفظ';
          saveBtn.disabled = true;
        } catch { saveBtn.textContent = 'خطأ في الحفظ'; }
      }
    });

    function showFinished() {
      const easy   = ratings.filter(r => r === 'easy').length;
      const hard   = ratings.filter(r => r === 'hard').length;
      const stage  = wrap.querySelector('#fc-stage');
      stage.innerHTML = `
        <div style="text-align:center;padding:1.5rem">
          <div style="font-size:2rem;margin-bottom:.5rem">🎉</div>
          <div style="font-size:1rem;font-weight:800;color:var(--dark-color);margin-bottom:.35rem">انتهيت من البطاقات!</div>
          <div style="font-size:.85rem;color:#64748b">
            سهل: ${easy} | صعب: ${hard}
            ${hard > 0 ? `<br/>راجع البطاقات الصعبة مرة أخرى` : ''}
          </div>
        </div>`;
      ratDiv.classList.remove('visible');
    }

    renderCard(0);
    container.replaceWith(wrap);
  }

  return { init };
})();
