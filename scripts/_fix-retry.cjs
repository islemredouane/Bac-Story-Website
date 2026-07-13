const fs = require("fs");
let c = fs.readFileSync("tawjihi/app.js", "utf8");
const searchFor = /const lastUserMsg = conversationMessages\.filter\(m => m\.role === 'user'\)\.pop\(\);\s*if \(lastUserMsg\) sendToAI\(lastUserMsg\.content\);/;
const replaceWith = `const lastUserIdx = conversationMessages.map(m => m.role).lastIndexOf('user');
      let lastUserMsg;
      if (lastUserIdx !== -1) lastUserMsg = conversationMessages.splice(lastUserIdx, 1)[0];
      if (lastUserMsg) sendToAI(lastUserMsg.content);`;
if(c.match(searchFor)) {
  c = c.replace(searchFor, replaceWith);
  fs.writeFileSync("tawjihi/app.js", c, "utf8");
  console.log("Fixed retry button");
} else {
  console.log("Regex did not match");
}