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
      subline:      'الموسم الدراسي لبكالوريا 2027 انطلق — اعرض خدماتك ودوراتك أمام آلاف الطلاب يومياً',
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
      id:           'card-bacmath-bma',
      active:       true,
      priority:     1,
      type:         'courses',
      layout:       'rich-bg',       // rich card: background image + HTML overlay
      bgImage:      '/images/bma-bg.jpg',
      subline:      'دورة الرياضيات 2027 · ع.تجريبية · رياضيات · ت.رياضي · أولمبياد',
      chips: [
        { icon: 'fas fa-layer-group', text: '🥉🥈🥇 نظام المستويات' },
        { icon: 'fas fa-gift',        text: '🎁 ملخصات وحصص مجانية دورية' }
      ],
      dealLabel:    'اشتراك شهر أكتوبر',
      dealAmount:   '1500',
      dealUnit:     'دج',
      dealCode:     '4 حصص مباشرة للشهر',
      sponsorLabel: 'إعلان مموّل',
      avatarIcon:   'fas fa-square-root-variable',
      avatarColor:  '#1a3a8f',
      logoUrl:      '/images/bma-logo.jpg',
      name:         'BAC MATH WITH BMA — بكالوريا 2027',
      subject:      'شعب علمية + مسار أولمبياد',
      specialty:    '1500 دج/شهر',
      pitch:        'مسار تدريبي متكامل طوال السنة في الرياضيات (تثبيت، تطبيق، تحدي ومسائل أجنبية). 💡 ملخصات، سلاسل تمارين وحصص مجانية دورية بالقناة!',
      ctaText:      'سجّل في الدورة الآن',
      ctaIcon:      'fab fa-telegram-plane',
      ctaHref:      'https://t.me/math_with_bma',
      ctaTarget:    '_blank',
      secondaryIcon: 'fab fa-instagram',
      secondaryHref: 'https://www.instagram.com/bacmathwithbma?stkn=MTE0amc1NnJlOXR5bg==',
      secondaryLabel: 'تابعنا على انستغرام'
    },
    {
      id:           'card-orientation',
      active:       false,
      priority:     2,
      type:         'courses',
      sponsorLabel: 'محتوى مدعوم',
      avatarIcon:   'fas fa-chalkboard-teacher',
      avatarColor:  '#2c5cc5',
      name:         'دورات الدعم والمرافقة الدراسية',
      subject:      'جميع الشعب والمواد',
      specialty:    null,
      pitch:        'الموسم الدراسي انطلق! آلاف طلاب بكالوريا 2027 يبحثون عن أساتذة متميزين ودورات دعم. اعرض خدماتك الآن.',
      ctaText:      'احجز إعلانك',
      ctaHref:      '/advertise.html',
      ctaTarget:    '_self'
    },
    {
      id:           'card-bac2027',
      active:       false,
      priority:     2,
      type:         'courses',
      sponsorLabel: 'محتوى مدعوم',
      avatarIcon:   'fas fa-graduation-cap',
      avatarColor:  '#2c5cc5',
      name:         'موسم بكالوريا 2027 في أوجه',
      subject:      'جميع المواد والشعب',
      specialty:    null,
      pitch:        'الطلاب في ذروة البحث عن المصادر والدورات والملخصات. استهدفهم مباشرة عبر المنصة وقناة التلغرام.',
      ctaText:      'أعلن معنا',
      ctaHref:      '/advertise.html',
      ctaTarget:    '_self'
    },
    {
      id:           'card-languages',
      active:       false,
      priority:     2,
      type:         'training',
      sponsorLabel: 'محتوى مدعوم',
      avatarIcon:   'fas fa-language',
      avatarColor:  '#2c5cc5',
      name:         'مدارس اللغات والتطوير الأكاديمي',
      subject:      'لغات ودورات تدريبية',
      specialty:    null,
      pitch:        'استهدف طلاب البكالوريا والجامعيين ببرامجك لتعلم اللغات، الدورات التطبيقية، والتطوير الأكاديمي.',
      ctaText:      'تعرف على الباقات',
      ctaHref:      '/advertise.html',
      ctaTarget:    '_self'
    },
    {
      id:           'card-platform',
      active:       false,
      priority:     2,
      type:         'platform',
      sponsorLabel: 'محتوى مدعوم',
      avatarIcon:   'fas fa-laptop-code',
      avatarColor:  '#2c5cc5',
      name:         'منصة تعليمية أو تطبيق دراسي؟',
      subject:      'جميع المستويات والشعب',
      specialty:    null,
      pitch:        'اعرض تطبيقك، منصتك أو محتواك الرقمي أمام أكثر من 60,000 طالب نشط يستعدون للباك.',
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
