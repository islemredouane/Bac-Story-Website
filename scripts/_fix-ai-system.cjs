const fs = require("fs");

function fixAppJs() {
  let c = fs.readFileSync("tawjihi/app.js", "utf8");
  
  // AI-1: Normalize specId
  c = c.replace(
    /try \{ acc = window\.twAccessibility\(specId, avg, stream\); \} \/\/ AI-1/g,
    "try { acc = window.twAccessibility(specId.toLowerCase(), avg, stream); } // AI-1"
  );
  
  // AI-3: Fix retry duplication
  const retryBug = `const lastUserMsg = conversationMessages.filter(m => m.role === 'user').pop();
      if (lastUserMsg) sendToAI(lastUserMsg.content);`;
  const retryFix = `const lastUserIdx = conversationMessages.map(m => m.role).lastIndexOf('user');
      let lastUserMsg;
      if (lastUserIdx !== -1) lastUserMsg = conversationMessages.splice(lastUserIdx, 1)[0];
      if (lastUserMsg) sendToAI(lastUserMsg.content);`;
  c = c.replace(retryBug, retryFix);
  
  fs.writeFileSync("tawjihi/app.js", c, "utf8");
  console.log("Fixed app.js (AI-1, AI-3)");
}

function fixChatApi() {
  let c = fs.readFileSync("api/tawjihi-chat.js", "utf8");
  
  // AI-2: Wrap CS block
  const csBlock = `## مدارس الإعلام الآلي في الجزائر — الحقيقة الكاملة:
⚠️ معلومة أساسية لا تتجاهلها: هذه المدارس مجانية كلياً (لا رسوم دراسية)، الدخول إليها حسب المعدل الموزون في البكالوريا فقط — لا مسابقة قبول خارجية مطلوبة. الإيواء مضمون في مدينة جامعية. المنحة الحكومية متاحة. المسابقة الوطنية في نهاية السنة الثانية هي تصنيف داخلي بين الطلاب المسجلين أصلاً لاختيار التخصص والمدرسة — ليست مسابقة دخول خارجية.
هذه المدارس الأربع تشترك في نفس نظام الدراسة ونفس الشهادة. القبول بالمعدل الموزون فقط. الفرق في البيئة والتخصصات:
1. **ESTIN** أميزور بجاية (2019) — الأحدث والأفضل من حيث البنية التحتية والإمكانيات المادية وحداثة التخصصات. تدرّس بالإنجليزية. تخصصات حصرية: IoT (يبدأ هذا العام، الوحيدة في الجزائر)، AI، أمن سيبراني. علوم 17.45 / رياضيات 17.79 / تقني 18.15. (id: estin)
2. **ESI الجزائر** (واد سمار) — الأقدم (1969) والأعلى معدل قبول (الأكثر تنافسية). تخصصات: IS، ISI، GL، SID. علوم 18.55 / رياضيات 18.19 / تقني 18.93. (id: esi-alger)
3. **ESI SBA** سيدي بلعباس (2014) — علوم 17.36 / رياضيات 17.70 / تقني 18.06. (id: esi-sba)
4. **ENSTA** الجزائر درقانة (2023) — علوم 17.39 / رياضيات 17.15 / تقني 18.10. (id: ensta)
⚠️ تنبيه مهم: **ESI قليعة** (id: esi-kolea) مدرسة تجارية/اقتصادية — ليست مدرسة إعلام آلي على الإطلاق. لا تذكرها كمدرسة إعلام آلي أبداً.
⚠️ لا توجد مدرسة اسمها "ENST" أو "ESTA" للإعلام الآلي في الجزائر — هذه أسماء غير موجودة، لا تذكرها.
مدارس قطب سيدي عبد الله الجديدة (أعلى المعدلات، مجانية كذلك، قبول بالمعدل فقط): ENSIA ذكاء اصطناعي — علوم تجريبية 18.59 / رياضيات 18.95 / تقني 19.37 | ENSCS أمن سيبراني 18.34 | ENSAS أنظمة مستقلة 18.21.`;
  
  c = c.replace(csBlock, `\${intent.ensia ? \`\n${csBlock}\` : ''}`);

  // AI-5: Handle files from req.body
  const reqBodyDestruct = `const { message, messages = [], sessionId, orientationMode = false, wishlist = [], isLastMessage = false } = req.body;`;
  const reqBodyDestructFix = `const { message, messages = [], sessionId, orientationMode = false, wishlist = [], files = [], isLastMessage = false } = req.body;`;
  c = c.replace(reqBodyDestruct, reqBodyDestructFix);

  const msgPush = `  if (message) {
    geminiMessages.push({ role: 'user', parts: [{ text: message }] });
  }`;
  const msgPushFix = `  if (message || files.length > 0) {
    let combinedMsg = message || '';
    if (files.length > 0) {
      combinedMsg += '\n\n' + files.map(f => f.content).join('\n\n');
    }
    geminiMessages.push({ role: 'user', parts: [{ text: combinedMsg }] });
  }`;
  c = c.replace(msgPush, msgPushFix);

  // AI-4: Inject wishlist into system prompt
  const intentWishlistCheck = `\${intent.wishlist ? \`\\n## ⭐ تنبيه: الطالب يسأل عن بطاقة الرغبات — قدّم نصائح الاستراتيجية الكاملة ومراحل التوجيه. تذكير: الحد الرسمي 6 اختيارات كحد أدنى و10 اختيارات كحد أقصى.\\n\` : ''}`;
  const intentWishlistFix = `\${intent.wishlist ? \`\\n## ⭐ تنبيه: الطالب يسأل عن بطاقة الرغبات — قدّم نصائح الاستراتيجية الكاملة ومراحل التوجيه. تذكير: الحد الرسمي 6 اختيارات كحد أدنى و10 اختيارات كحد أقصى.\\n\` : ''}\${wishlist && wishlist.length > 0 ? \`\\n## قائمة رغبات الطالب الحالية (للتقييم والتوجيه):\\n- \${wishlist.join('\\n- ')}\\n\` : ''}`;
  c = c.replace(intentWishlistCheck, intentWishlistFix);

  fs.writeFileSync("api/tawjihi-chat.js", c, "utf8");
  console.log("Fixed tawjihi-chat.js (AI-2, AI-4, AI-5)");
}

fixAppJs();
fixChatApi();