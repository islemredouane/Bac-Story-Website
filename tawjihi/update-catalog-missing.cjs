const fs = require('fs');

// 1. Update catalog.js
let catalog = fs.readFileSync('tawjihi/catalog.js', 'utf8');

const newCatalogItems = `  ,
  {
    id: "arabic-lit",
    name: "لغة وأدب عربي",
    nameEn: "Arabic Language & Literature",
    subtitle: "آداب ولغات",
    subtitleIcon: "fa-book-open",
    cat: "letters",
    catVar: "var(--cat-letters)",
    lmd: true,
    avg: 10.00,
    minAvg: 10.00,
    streamCodes: ["lettres","langues","arts","sciexp","math","techmath","gestion"],
    streams: ["آداب وفلسفة","لغات أجنبية","فنون","علوم تجريبية","رياضيات","تقني رياضي","تسيير واقتصاد"],
    duration: "3 سنوات",
    language: "عربية",
    degree: "ليسانس أكاديمي",
    demand: "متوسط",
    img: "images/placeholder.webp",
    location: "جامعات وطنية متعددة",
    description: ["تخصص يهتم بدراسة اللغة العربية وآدابها عبر العصور، مع التركيز على النحو، الصرف، البلاغة والنقد.","يُعتبر تخصصاً أساسياً في كليات الآداب واللغات ويُكوّن أساتذة وباحثين في المجال."],
    avgHistory: [{"uni":"معدل القبول","y2024":10,"y2025":10}],
    unis: [{"abbr":"UNIV","name":"جامعات وطنية","location":"الوطن","avg":10}],
    conditions: ["معدل بكالوريا ≥ 10.00", "أولوية لشعبتي الآداب والفلسفة واللغات الأجنبية."],
    careers: [{"icon":"fa-chalkboard-user","label":"تعليم"},{"icon":"fa-pen-nib","label":"كتابة وتدقيق لغوي"},{"icon":"fa-newspaper","label":"صحافة وإعلام"}],
  },
  {
    id: "earth-sci",
    name: "علوم الأرض والكون",
    nameEn: "Earth & Universe Sciences",
    subtitle: "علوم الأرض",
    subtitleIcon: "fa-globe",
    cat: "science",
    catVar: "var(--cat-science)",
    lmd: true,
    avg: 10.00,
    minAvg: 10.00,
    streamCodes: ["sciexp","math","techmath"],
    streams: ["علوم تجريبية","رياضيات","تقني رياضي"],
    duration: "3 سنوات",
    language: "فرنسية",
    degree: "ليسانس أكاديمي / مهني",
    demand: "متوسط",
    img: "images/placeholder.webp",
    location: "جامعات وطنية متعددة",
    description: ["تخصص يدرس الجيولوجيا، الجيوفيزياء، والموارد المائية.","يُعد الطلاب لفهم باطن الأرض والظواهر الطبيعية واستغلال الثروات الباطنية كالمحروقات والمناجم."],
    avgHistory: [{"uni":"معدل القبول","y2024":10,"y2025":10}],
    unis: [{"abbr":"UNIV","name":"جامعات وطنية","location":"الوطن","avg":10}],
    conditions: ["معدل بكالوريا ≥ 10.00", "أولوية لشعب العلوم الدقيقة."],
    careers: [{"icon":"fa-mountain","label":"جيولوجيا ومناجم"},{"icon":"fa-water","label":"ري وموارد مائية"},{"icon":"fa-oil-well","label":"محروقات"}],
  },
  {
    id: "geography",
    name: "جغرافيا وتهيئة الإقليم",
    nameEn: "Geography & Territorial Planning",
    subtitle: "علوم الأرض",
    subtitleIcon: "fa-map",
    cat: "science",
    catVar: "var(--cat-science)",
    lmd: true,
    avg: 10.00,
    minAvg: 10.00,
    streamCodes: ["lettres","langues","arts","sciexp","math","techmath","gestion"],
    streams: ["كل الشعب"],
    duration: "3 سنوات",
    language: "عربية + فرنسية",
    degree: "ليسانس",
    demand: "متوسط",
    img: "images/placeholder.webp",
    location: "جامعات وطنية متعددة",
    description: ["تخصص يهتم بالتخطيط العمراني، الخرائط ونظم المعلومات الجغرافية (GIS)، ودراسة التضاريس والمناخ.","يُكوّن إطارات في مديريات التعمير والتهيئة العمرانية."],
    avgHistory: [{"uni":"معدل القبول","y2024":10,"y2025":10}],
    unis: [{"abbr":"UNIV","name":"جامعات وطنية","location":"الوطن","avg":10}],
    conditions: ["معدل بكالوريا ≥ 10.00"],
    careers: [{"icon":"fa-map-location-dot","label":"أنظمة GIS"},{"icon":"fa-city","label":"تخطيط عمراني"},{"icon":"fa-cloud-sun","label":"علم المناخ"}],
  },
  {
    id: "staps",
    name: "علوم وتقنيات النشاطات البدنية والرياضية",
    nameEn: "Sports & Physical Education (STAPS)",
    subtitle: "رياضة وتربية بدنية",
    subtitleIcon: "fa-running",
    cat: "paramedical",
    catVar: "var(--cat-paramedical)",
    lmd: true,
    avg: 10.00,
    minAvg: 10.00,
    streamCodes: ["lettres","langues","arts","sciexp","math","techmath","gestion"],
    streams: ["كل الشعب"],
    duration: "3 سنوات",
    language: "عربية",
    degree: "ليسانس أكاديمي",
    demand: "متوسط",
    img: "images/placeholder.webp",
    location: "معاهد التربية البدنية والرياضية (ISTAPS)",
    description: ["تخصص يُكوّن أساتذة التربية البدنية، والمدربين الرياضيين، ومسيري المنشآت الرياضية.","يتطلب التخصص لياقة بدنية عالية وقدرة على الممارسة العملية المكثفة."],
    avgHistory: [{"uni":"معدل القبول","y2024":10,"y2025":10}],
    unis: [{"abbr":"ISTAPS","name":"معاهد الرياضة","location":"الوطن","avg":10}],
    conditions: ["معدل بكالوريا ≥ 10.00", "تخضع لنتائج الفحص الطبي والاختبار البدني."],
    careers: [{"icon":"fa-person-running","label":"أستاذ رياضة"},{"icon":"fa-medal","label":"تدريب رياضي"},{"icon":"fa-stopwatch","label":"إدارة رياضية"}],
  }
];`;

catalog = catalog.replace(/\}\s*\];\s*\/\*\s*helpers\s*\*\//, "}" + newCatalogItems + "\n/* helpers */");
fs.writeFileSync('tawjihi/catalog.js', catalog);
console.log('Added 4 new catalog items.');

// 2. Update eligibility.js
let eligibility = fs.readFileSync('tawjihi/eligibility.js', 'utf8');

const newEligibilityItems = `  ,
  "arabic-lit": {
    "linkedProgramCodes": [],
    "allowedStreams": ["lettres","langues","arts","sciexp","math","techmath","gestion"],
    "scope": "regional",
    "circleWilayaNums": [],
    "rankingBasis": "general",
    "thresholdsByStream": {},
    "sourceConfidence": "high",
    "_note": "Added via NEW-4",
    "_method": "manual"
  },
  "earth-sci": {
    "linkedProgramCodes": [],
    "allowedStreams": ["sciexp","math","techmath"],
    "scope": "regional",
    "circleWilayaNums": [],
    "rankingBasis": "general",
    "thresholdsByStream": {},
    "sourceConfidence": "high",
    "_note": "Added via NEW-4",
    "_method": "manual"
  },
  "geography": {
    "linkedProgramCodes": [],
    "allowedStreams": ["lettres","langues","arts","sciexp","math","techmath","gestion"],
    "scope": "regional",
    "circleWilayaNums": [],
    "rankingBasis": "general",
    "thresholdsByStream": {},
    "sourceConfidence": "high",
    "_note": "Added via NEW-4",
    "_method": "manual"
  },
  "staps": {
    "linkedProgramCodes": [],
    "allowedStreams": ["lettres","langues","arts","sciexp","math","techmath","gestion"],
    "scope": "national",
    "circleWilayaNums": [],
    "rankingBasis": "general",
    "thresholdsByStream": {},
    "sourceConfidence": "high",
    "_note": "Added via NEW-4",
    "_method": "manual"
  }
};`;

eligibility = eligibility.replace(/\}\s*};\s*$/m, "}" + newEligibilityItems);
fs.writeFileSync('tawjihi/eligibility.js', eligibility);
console.log('Added 4 new eligibility items.');
