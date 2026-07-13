import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const TOKEN = process.argv[2];
if (!TOKEN) {
  console.error("Usage: node qa-ai.mjs <SUPABASE_AUTH_TOKEN>");
  process.exit(1);
}

const ENDPOINT = "http://localhost:3000/api/tawjihi-chat";

const questions = [
  // Averages
  { category: "Averages", text: "قداش معدل قبول الطب في 2025؟", assert: res => res.includes("16") || res.includes("2025") },
  // Wilaya rule
  { category: "Wilaya rule", text: "واش نقدر نقرا إعلام آلي في ولايتي؟", assert: res => res.includes("سطيف") || res.includes("دائرة") },
  // Military
  { category: "Military", text: "كيفاش نسجل في مدرسة الطيران؟", assert: res => res.includes("preinscription.mdn.dz") },
  // Weighted avg
  { category: "Weighted avg", text: "معدلي الموزون في الرياضيات 16، واش يخدملي؟", assert: res => res.includes("الموزون") },
  // Verdict
  { category: "Verdict", text: "واش نقدر ندخل ESI؟", assert: res => res.includes("```verdict") },
  // Comparison
  { category: "Comparison", text: "قارنلي بين ESI و ENSIA", assert: res => res.includes("```compare") },
  // Orientation
  { category: "Orientation", text: "حاب نكتشف تخصصات مليحة", assert: res => res.includes("```question") && res.includes("أمين") },
  // Dialect (negative check)
  { category: "Dialect", text: "أعطيني تخصصات مليحة", assert: res => !res.match(/(شنو|شو|إيش|وش|شلون|ليش|فين|ديال|بغيت|عافاك|مزيان|إزاي|عايز|هسة|كتير)/) },
  // Out of scope
  { category: "Out of scope", text: "احسبلي visa كندا", assert: res => !res.includes("كندا") && (res.includes("توجيهي") || res.includes("البكالوريا") || res.includes("عذرا")) },
  // French
  { category: "French", text: "C'est quoi la moyenne de médecine?", assert: res => res.includes("médecine") || res.includes("moyenne") },
  // Unknown spec
  { category: "Unknown spec", text: "معدل القبول في تخصص هندسة الفضاء الخارجي", assert: res => res.includes("web-search") || res.includes("غير متوفر") }
];

async function run() {
  console.log("Running Part C: AI Behavior Battery...\n");
  let passed = 0;
  const failures = [];

  for (const q of questions) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: q.text }],
          chatId: "qa-test-" + Date.now()
        })
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }
      
      const text = await res.text();
      
      if (q.assert(text)) {
        console.log(`✅ [${q.category}] PASSED`);
        passed++;
      } else {
        console.error(`❌ [${q.category}] FAILED assertion. Response length: ${text.length}`);
        failures.push({ category: q.category, question: q.text, response: text });
      }

    } catch (e) {
      console.error(`❌ [${q.category}] ERROR:`, e.message);
      failures.push({ category: q.category, question: q.text, error: e.message });
    }
  }

  // Write report
  const report = `# QA AI Behavior Report\n\n- Passed: ${passed}/${questions.length}\n- Pass Rate: ${Math.round((passed/questions.length)*100)}%\n\n## Failures\n${failures.map(f => `### ${f.category}\n**Q:** ${f.question}\n**Res/Err:**\n\`\`\`\n${f.response || f.error}\n\`\`\``).join('\n')}`;
  fs.writeFileSync('tawjihi/data/_staging/_QA-AI-REPORT.md', report, 'utf8');

  console.log(`\nAI Battery: ${passed}/${questions.length} passed.`);
  console.log(failures.length === 0 ? "✅ Part C PASSED" : "❌ Part C FAILED");
}
run();