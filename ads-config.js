/* ============================================================
   BAC STORY — Ads Config
   Edit ONLY this file to add / remove / pause advertisers.
   Bump stripDismissKey suffix (v1 → v2) to re-show strip in testing.
   If you rename stripDismissKey or change stripHideDurationMs, update the same values in the inline
   loader snippet at the top of every page's <body> (it reads them before the first paint).
   ============================================================ */

window.BAC_ADS = {

  /* ── GLOBAL SETTINGS ─────────────────────────────────────── */
  stripDismissKey:    'bs_adstrip_v1',
  stripHideDurationMs: 86400000,          // 24 hours
  bacExamDate:        '2027-06-13',       // DZ bac date (estimated) — update each year

  /* ── AD STRIP ────────────────────────────────────────────── */
  // Rotates every 6 s. Set active: false to pause without deleting.
  strip: [
    {
      id:           'strip-sample-1',
      active:       true,
      sponsorLabel: 'إعلان مموّل',
      emoji:        '📚',
      headline:     'عندك دورة أو خدمة موجّهة لتلاميذ البكالوريا؟',
      subline:      'أكثر من 100,000 طالب يزورون المنصة واختبارات الفصل الأول على الأبواب، اعرض خدماتك أمامهم الآن',
      ctaText:      'أعلن معنا',
      ctaHref:      '/advertise',
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
  // Optional per card: stat: { value, label } shows one persuasive figure in the card's side rail
  // (tokens {days}, {days_text}, {days_unit} count down to bacExamDate each day). No stat = slim icon rail.
  cardRotationMs: 7000,

  rotatingCards: [
    {
      id:           'card-orientation',
      active:       true,
      priority:     2,
      type:         'courses',
      sponsorLabel: 'محتوى مدعوم',
      avatarIcon:   'fas fa-chalkboard-teacher',
      avatarColor:  '#2c5cc5',
      name:         'دورات الدعم والمراجعة المكثفة',
      subject:      'جميع الشعب والمواد',
      specialty:    null,
      stat:         { value: 'ديسمبر', label: 'اختبارات الفصل الأول' },
      pitch:        'اختبارات الفصل الأول على الأبواب وعطلة الشتاء بعدها، وتلاميذ بكالوريا 2027 يبحثون عن أساتذة ودورات مراجعة. كن أول خيار أمامهم.',
      ctaText:      'احجز إعلانك',
      ctaHref:      '/advertise',
      ctaTarget:    '_self'
    },
    {
      id:           'card-bac2027',
      active:       true,
      priority:     2,
      type:         'courses',
      sponsorLabel: 'محتوى مدعوم',
      avatarIcon:   'fas fa-graduation-cap',
      avatarColor:  '#2c5cc5',
      name:         'بكالوريا 2027: بقي {days_text}',
      subject:      'جميع المواد والشعب',
      specialty:    null,
      stat:         { value: '{days}', label: '{days_unit} للبكالوريا' },
      pitch:        'تلاميذ البكالوريا يبحثون يومياً عن الملخصات والدورات. استهدفهم عبر المنصة وقناة التلغرام (+19 ألف متابع).',
      ctaText:      'أعلن معنا',
      ctaHref:      '/advertise',
      ctaTarget:    '_self'
    },
    {
      id:           'card-languages',
      active:       true,
      priority:     2,
      type:         'training',
      sponsorLabel: 'محتوى مدعوم',
      avatarIcon:   'fas fa-language',
      avatarColor:  '#2c5cc5',
      name:         'مدارس اللغات والتطوير الأكاديمي',
      subject:      'لغات ودورات تدريبية',
      specialty:    null,
      stat:         { value: 'الشتاء', label: 'وقت تعلّم جديد' },
      pitch:        'عطلة الشتاء فرصة لتقوية اللغات الأجنبية قبل الفصل الثاني. اعرض برامجك أمام تلاميذ البكالوريا.',
      ctaText:      'تعرف على الباقات',
      ctaHref:      '/advertise',
      ctaTarget:    '_self'
    },
    {
      id:           'card-platform',
      active:       true,
      priority:     2,
      type:         'platform',
      sponsorLabel: 'محتوى مدعوم',
      avatarIcon:   'fas fa-laptop-code',
      avatarColor:  '#2c5cc5',
      name:         'منصة تعليمية أو تطبيق دراسي؟',
      subject:      'جميع المستويات والشعب',
      specialty:    null,
      stat:         { value: '+100K', label: 'طالب على المنصة' },
      pitch:        'اعرض تطبيقك أو منصتك أو محتواك الرقمي أمام أكثر من 100,000 طالب يستعدون للبكالوريا.',
      ctaText:      'تعرف على الباقات',
      ctaHref:      '/advertise',
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
    return days + ' أيام متبقية للبكالوريا';
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

  // Arabic day count with correct grammar (1 يوم واحد، 2 يومان، 3-10 أيام، 11+ يوماً)
  getDaysText: function () {
    var n = this.getCountdownDays();
    if (n === 0)  return 'أقل من يوم';
    if (n === 1)  return 'يوم واحد';
    if (n === 2)  return 'يومان';
    if (n <= 10)  return n + ' أيام';
    return n + ' يوماً';
  },

  // Unit word for the day count (1 يوم، 2 يومان، 3-10 أيام، 11+ يوماً)
  getDaysUnit: function () {
    var n = this.getCountdownDays();
    if (n === 1) return 'يوم';
    if (n === 2) return 'يومان';
    if (n <= 10) return 'أيام';
    return 'يوماً';
  },

  // Replaces {days}, {days_text} and {days_unit} tokens in headline/subline/name/pitch at render time
  fillTokens: function (item) {
    var self = this, out = {};
    Object.keys(item).forEach(function (k) {
      var v = item[k];
      if (typeof v === 'string') {
        out[k] = v.replace(/\{days_text\}/g, self.getDaysText())
                  .replace(/\{days_unit\}/g, self.getDaysUnit())
                  .replace(/\{days\}/g, self.getCountdownDays());
      } else if (v && typeof v === 'object' && !Array.isArray(v)) {
        out[k] = self.fillTokens(v);   // nested objects such as `stat`
      } else {
        out[k] = v;
      }
    });
    return out;
  },

  getActiveStripAds: function () {
    var self = this;
    return this.strip.filter(function (a) { return a.active; }).map(function (a) { return self.fillTokens(a); });
  },

  getActiveRotatingCards: function () {
    var self = this;
    return this._rawRotatingCards().map(function (c) { return self.fillTokens(c); });
  },

  _rawRotatingCards: function () {
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
