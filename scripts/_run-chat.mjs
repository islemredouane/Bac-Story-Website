import handler from "../api/tawjihi-chat.js";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const questions = [
  // Averages
  { category: "Averages", text: "قداش معدل قبول الطب في 2025؟", assert: res => res.includes("16") || res.includes("2025") || res.includes("16.03") },
  // Wilaya rule
  { category: "Wilaya rule", text: "واش نقدر نقرا إعلام آلي في ولايتي؟", assert: res => res.includes("سطيف") || res.includes("دائرة") },
  // Military
  { category: "Military", text: "كيفاش نسجل في مدرسة الطيران؟", assert: res => res.includes("preinscription.mdn.dz") || res.includes("التسجيل") },
  // Weighted avg
  { category: "Weighted avg", text: "معدلي الموزون في الرياضيات 16، واش يخدملي؟", assert: res => res.includes("الموزون") || res.includes("16") },
  // Verdict
  { category: "Verdict", text: "واش نقدر ندخل ESI؟", assert: res => res.includes("```verdict") || res.includes("esi") },
  // Comparison
  { category: "Comparison", text: "قارنلي بين ESI و ENSIA", assert: res => res.includes("```compare") || res.includes("ensia") },
  // Orientation
  { category: "Orientation", text: "حاب نكتشف تخصصات مليحة", assert: res => res.includes("```question") && res.includes("أمين") },
  // Dialect (negative check)
  { category: "Dialect", text: "أعطيني تخصصات مليحة", assert: res => !res.match(/(شنو|شو|إيش|وش|شلون|ليش|فين|ديال|بغيت|عافاك|مزيان|إزاي|عايز|هسة|كتير)/) },
  // Out of scope
  { category: "Out of scope", text: "احسبلي visa كندا", assert: res => !res.includes("كندا") && (res.includes("توجيهي") || res.includes("البكالوريا") || res.includes("عذرا") || res.includes("نعتذر")) },
  // French
  { category: "French", text: "C'est quoi la moyenne de médecine?", assert: res => res.includes("médecine") || res.includes("moyenne") || res.includes("16") },
  // Unknown spec
  { category: "Unknown spec", text: "معدل القبول في تخصص هندسة الفضاء الخارجي", assert: res => res.includes("web-search") || res.includes("غير متوفر") || res.includes("فضاء") }
];

async function run() {
  console.log("Running Part C: AI Behavior Battery...\n");
  let passed = 0;
  const failures = [];

  for (const q of questions) {
    let output = "";
    const req = {
      method: "POST",
      headers: { authorization: "Bearer TEST_QA" },
      body: { message: q.text, messages: [{ role: "user", content: q.text }], chatId: "qa-test" }
    };
    
    const res = {
      status: (c) => ({ json: (d) => { output += JSON.stringify(d); } }),
      setHeader: () => {},
      write: (c) => { output += c; },
      end: () => {}
    };

    try {
      await handler(req, res);
      // Clean up chunk output if it was streaming
      output = output.replace(/0\n\n/g, '').replace(/[0-9a-fA-F]+\r\n/g, '').trim();
      
      if (q.assert(output)) {
        console.log(`✅ [${q.category}] PASSED`);
        passed++;
      } else {
        console.error(`❌ [${q.category}] FAILED assertion.`);
        failures.push({ category: q.category, question: q.text, response: output });
      }
    } catch (e) {
      console.error(`❌ [${q.category}] ERROR:`, e.message);
      failures.push({ category: q.category, question: q.text, error: e.message });
    }
  }

  const report = `# QA AI Behavior Report\n\n- Passed: ${passed}/${questions.length}\n- Pass Rate: ${Math.round((passed/questions.length)*100)}%\n\n## Failures\n${failures.map(f => `### ${f.category}\n**Q:** ${f.question}\n**Res/Err:**\n\`\`\`\n${f.response || f.error}\n\`\`\``).join('\n')}`;
  fs.writeFileSync('tawjihi/data/_staging/_QA-AI-REPORT.md', report, 'utf8');

  console.log(`\nAI Battery: ${passed}/${questions.length} passed.`);
  console.log(failures.length === 0 ? "✅ Part C PASSED" : "❌ Part C FAILED");
}
run();