const fs = require('fs');
let d = fs.readFileSync('tawjihi/catalog.js', 'utf8');

const privateUnis = `  ,
  {
    id: "mdi-alger",
    name: "المعهد العالي للتسيير — MDI Alger (جامعة خاصة)",
    nameEn: "Management - MDI Algiers",
    subtitle: "إدارة وأعمال",
    subtitleIcon: "fa-briefcase",
    cat: "business",
    catVar: "var(--cat-business)",
    lmd: true,
    avg: 10.00,
    minAvg: 10.00,
    streamCodes: ["gestion","math","techmath","sciexp","lettres","langues","arts"],
    streams: ["كل الشعب"],
    duration: "3 - 5 سنوات",
    language: "فرنسية + إنجليزية",
    degree: "ليسانس / ماستر في التسيير",
    demand: "متوسط",
    img: "images/placeholder.webp",
    location: "MDI · الجزائر",
    description: ["المعهد العالي للتسيير MDI Alger مؤسسة تعليم عالي خاصة معتمدة من وزارة التعليم العالي.","تُكوّن إطارات في الإدارة، التسويق، والمالية بمناهج حديثة وشراكات دولية."],
    avgHistory: [{"uni":"MDI Alger","y2024":10,"y2025":10}],
    unis: [{"abbr":"MDI","name":"المعهد العالي للتسيير","location":"الجزائر","avg":10}],
    conditions: ["معدل بكالوريا ≥ 10.00", "إجراء مقابلة شفوية للقبول.", "الدراسة في هذه المؤسسة مدفوعة التكاليف."],
    careers: [{"icon":"fa-chart-pie","label":"تسويق"},{"icon":"fa-coins","label":"مالية"},{"icon":"fa-briefcase","label":"إدارة أعمال"}],
  },
  {
    id: "esaa",
    name: "المدرسة العليا الجزائرية للأعمال — ESAA (مؤسسة مختلطة)",
    nameEn: "Business - ESAA",
    subtitle: "إدارة وأعمال",
    subtitleIcon: "fa-chart-line",
    cat: "business",
    catVar: "var(--cat-business)",
    lmd: true,
    avg: 10.00,
    minAvg: 10.00,
    streamCodes: ["gestion","math","techmath","sciexp"],
    streams: ["تسيير واقتصاد", "رياضيات", "تقني رياضي", "علوم تجريبية"],
    duration: "3 - 5 سنوات",
    language: "فرنسية",
    degree: "ليسانس / ماستر",
    demand: "مرتفع",
    img: "images/placeholder.webp",
    location: "ESAA · الجزائر",
    description: ["المدرسة العليا الجزائرية للأعمال ESAA هي ثمرة تعاون جزائري فرنسي، تعتبر من بين أفضل مدارس الأعمال في الجزائر.","تقدم برامج تعليمية بمعايير دولية وشهادات مزدوجة."],
    avgHistory: [{"uni":"ESAA","y2024":10,"y2025":10}],
    unis: [{"abbr":"ESAA","name":"المدرسة العليا الجزائرية للأعمال","location":"الجزائر","avg":10}],
    conditions: ["القبول عبر مسابقة كتابية وشفوية بعد دراسة الملف.", "تكاليف الدراسة مدفوعة."],
    careers: [{"icon":"fa-building","label":"إدارة مؤسسات"},{"icon":"fa-globe","label":"تجارة دولية"}],
  }
];`;

d = d.replace(/\}\s*\];\s*\/\*\s*helpers\s*\*\//, "}" + privateUnis + "\n/* helpers */");
fs.writeFileSync('tawjihi/catalog.js', d);
console.log('Added private unis.');
