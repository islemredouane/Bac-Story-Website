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
      subline:      'فترة التوجيه الجامعي وتحضيرات 2027 بدأت — احجز مساحتك الإعلانية الآن',
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
      id:           'card-techfocus-oran',
      active:       false,
      priority:     1,
      type:         'tech-shop',
      layout:       'rich-bg',       // rich card: background image + HTML overlay
      bgImage:      'https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/pub.png',
      subline:      'جودة عالية · ضمان رسمي · أسعار منافسة',
      chips: [
        { icon: 'fas fa-shield-halved', text: 'منتجات أصلية' },
        { icon: 'fas fa-truck-fast',    text: 'توصيل 58 ولاية' }
      ],
      dealLabel:    'تخفيض حصري',
      dealAmount:   '3000',
      dealUnit:     'دج',
      dealCode:     'كود: BACSTORY',
      sponsorLabel: 'إعلان مموّل',
      avatarIcon:   'fas fa-laptop',
      avatarColor:  '#2c5cc5',
      logoUrl:      'https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/focustech%20logo.jpg',
      name:         'Tech Focus - أجهزة كمبيوتر ولابتوب',
      subject:      'PC & Laptop',
      specialty:    'توصيل لـ 58 ولاية',
      pitch:        'تخفيض حصري 3000 دج بكود BACSTORY على أجهزة الكمبيوتر واللابتوب — توصيل لجميع الولايات.',
      ctaText:      'فعّل الخصم الآن',
      ctaIcon:      'fab fa-whatsapp',
      ctaHref:      'https://wa.me/213662945059?text=' + encodeURIComponent('مرحباً 👋، شفت إعلان BAC STORY وحاب نستافد من كود الخصم BACSTORY'),
      ctaTarget:    '_blank',
      secondaryIcon: 'fab fa-instagram',
      secondaryHref: 'https://www.instagram.com/tech_focus31/',
      secondaryLabel: 'تابعنا على انستغرام'
    },
    {
      id:           'card-orientation',
      active:       true,
      priority:     2,
      type:         'orientation',
      sponsorLabel: 'محتوى مدعوم',
      avatarIcon:   'fas fa-university',
      avatarColor:  '#2c5cc5',
      name:         'التوجيه الجامعي واختيار التخصص؟',
      subject:      'جميع الشعب',
      specialty:    null,
      pitch:        'نتائج البكالوريا ظهرت! آلاف الطلاب يبحثون عن التوجيه الجامعي المناسب. أعلن عن مؤسستك وخدماتك الآن.',
      ctaText:      'احجز إعلانك',
      ctaHref:      '/advertise.html',
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
      name:         'تحضيرات بكالوريا 2027 بدأت',
      subject:      'جميع المواد',
      specialty:    null,
      pitch:        'طلاب بكالوريا 2027 بدأوا التحضير! اعرض دوراتك، دروسك الدعم، أو منصتك التعليمية أمامهم.',
      ctaText:      'أعلن معنا',
      ctaHref:      '/advertise.html',
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
      name:         'مدارس اللغات والتكوين',
      subject:      'لغات وتطوير مهارات',
      specialty:    null,
      pitch:        'مرحلة ما بعد البكالوريا هي الأهم. استهدف الطلاب الناجحين ببرامجك التكوينية ومدارسك الصيفية.',
      ctaText:      'تعرف على الباقات',
      ctaHref:      '/advertise.html',
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
      name:         'منصة تعليمية أو تطبيق؟',
      subject:      'جميع المستويات',
      specialty:    null,
      pitch:        'اعرض منصتك، تطبيقك التعليمي، أو محتواك المتميز لآلاف الطلاب الجدد المستهدفين.',
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
