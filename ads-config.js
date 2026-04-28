/* ============================================================
   BAC STORY — Ads Config
   Edit ONLY this file to add / remove / pause advertisers.
   Bump stripDismissKey suffix (v1 → v2) to re-show strip in testing.
   ============================================================ */

window.BAC_ADS = {

  /* ── GLOBAL SETTINGS ─────────────────────────────────────── */
  stripDismissKey:    'bs_adstrip_v1',
  stripHideDurationMs: 86400000,          // 24 hours
  bacExamDate:        '2026-06-07',       // DZ bac date — update each year

  /* ── AD STRIP ────────────────────────────────────────────── */
  // Rotates every 6 s. Set active: false to pause without deleting.
  strip: [
    {
      id:           'strip-sample-1',
      active:       true,
      sponsorLabel: 'إعلان مموّل',
      emoji:        '📚',
      headline:     'هل تريد الإعلان على المنصة؟',
      subline:      'وصول مباشر لآلاف الطلاب — تواصل معنا الآن',
      ctaText:      'أعلن معنا',
      ctaHref:      '/advertise.html',
      ctaTarget:    '_self',
      badge:        null
    }
  ],

  /* ── ROTATING INLINE AD CARDS ───────────────────────────── */
  // Cards rotate globally across all placeholders on every page.
  // priority: 1 = highest (shown first & more often if 2 advertisers).
  //   Plan tiers → الظهور الكامل = 1 | بطاقة مميزة = 2 | شريط فقط = 3
  // If 2 advertisers: higher-plan card repeats once in the rotation array.
  // Set active: false to pause without deleting.
  cardRotationMs: 7000,

  rotatingCards: [
    {
      id:           'card-courses',
      active:       true,
      priority:     2,
      type:         'courses',
      sponsorLabel: 'محتوى مدعوم',
      avatarIcon:   'fas fa-chalkboard-teacher',
      avatarColor:  '#2c5cc5',
      name:         'أستاذ أو مدرّب؟ وسّع انتشارك',
      subject:      'جميع المواد',
      specialty:    null,
      pitch:        'آلاف الطلاب يبحثون عن أساتذة الآن. اعرض كورساتك ودروسك الخاصة أمامهم.',
      ctaText:      'أعلن معنا',
      ctaHref:      '/advertise.html',
      ctaTarget:    '_self'
    },
    {
      id:           'card-exams',
      active:       true,
      priority:     2,
      type:         'exams',
      sponsorLabel: 'محتوى مدعوم',
      avatarIcon:   'fas fa-file-alt',
      avatarColor:  '#ff6b35',
      name:         'مراجعة المواضيع والتصحيح؟',
      subject:      'جميع الشعب',
      specialty:    null,
      pitch:        'أعلن عن دروسك في المراجعة والمواضيع — الطلاب في أوج تحضيرهم للباك.',
      ctaText:      'احجز إعلانك',
      ctaHref:      '/advertise.html',
      ctaTarget:    '_self'
    },
    {
      id:           'card-planning',
      active:       true,
      priority:     2,
      type:         'planning',
      sponsorLabel: 'محتوى مدعوم',
      avatarIcon:   'fas fa-calendar-check',
      avatarColor:  '#2c5cc5',
      name:         'خطط ومنهجية الامتحان',
      subject:      'جميع المواد',
      specialty:    null,
      pitch:        'قدّم منهجيتك وخططك الدراسية لطلاب يبحثون عن التميز في الأيام الأخيرة.',
      ctaText:      'تعرف على الباقات',
      ctaHref:      '/advertise.html',
      ctaTarget:    '_self'
    }
  ],

  /* ── HELPERS ─────────────────────────────────────────────── */

  getCountdownDays: function () {
    var examDate = new Date(this.bacExamDate);
    var today    = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    var diff = Math.ceil((examDate - today) / 86400000);
    return diff > 0 ? diff : 0;
  },

  getCountdownText: function () {
    var days = this.getCountdownDays();
    if (days === 0) return 'يوم البكالوريا اليوم!';
    return days + ' يومًا متبقية للبكالوريا';
  },

  isStripDismissed: function () {
    try {
      var raw = localStorage.getItem(this.stripDismissKey);
      if (!raw) return false;
      var data = JSON.parse(raw);
      return (Date.now() - data.ts) < this.stripHideDurationMs;
    } catch (e) { return false; }
  },

  dismissStrip: function () {
    try {
      localStorage.setItem(this.stripDismissKey, JSON.stringify({ ts: Date.now() }));
    } catch (e) {}
  },

  getActiveStripAds: function () {
    return this.strip.filter(function (a) { return a.active; });
  },

  getActiveRotatingCards: function () {
    // Sort by priority (1 = highest). For 2 real advertisers:
    // the higher-plan card (lower priority number) appears twice in rotation.
    var active = this.rotatingCards
      .filter(function (c) { return c.active; })
      .sort(function (a, b) { return (a.priority || 9) - (b.priority || 9); });

    if (active.length < 2) return active;

    // If priorities differ, double up the highest-priority card
    var best = active[0];
    var rest = active.slice(1);
    if (best.priority < rest[0].priority) {
      // interleave: best, rest[0], best, rest[1], ...
      var weighted = [];
      for (var i = 0; i < rest.length; i++) {
        weighted.push(best);
        weighted.push(rest[i]);
      }
      return weighted;
    }
    return active;
  }
};
