const fs = require("fs");
let c = fs.readFileSync("api/tawjihi-search.js", "utf8");

const rateLimitBlock = `
// Simple in-memory rate limiting (per serverless instance)
const rateLimits = new Map();
function checkRateLimit(uid) {
  const now = Date.now();
  const userWindow = rateLimits.get(uid) || { count: 0, startTime: now };
  if (now - userWindow.startTime > 60000) {
    userWindow.count = 1;
    userWindow.startTime = now;
  } else {
    userWindow.count++;
  }
  rateLimits.set(uid, userWindow);
  return userWindow.count <= 30; // 30 requests per minute
}
`;

c = c.replace("// TODO: Add rate limiting (e.g., 60 req/min per user) using Upstash Redis or Vercel rate limiter", rateLimitBlock.trim());

const authCheckEnd = `  if (authError || !user) {
    return res.status(401).json({ error: 'جلسة منتهية — سجّل دخولك مجدداً' });
  }`;
  
const authCheckFix = `  if (authError || !user) {
    return res.status(401).json({ error: 'جلسة منتهية — سجّل دخولك مجدداً' });
  }

  // SEC-6: Enforce rate limiting
  if (!checkRateLimit(user.id)) {
    return res.status(429).json({ error: 'لقد تجاوزت الحد المسموح به من عمليات البحث. يرجى المحاولة بعد دقيقة.' });
  }`;

c = c.replace(authCheckEnd, authCheckFix);

fs.writeFileSync("api/tawjihi-search.js", c, "utf8");
console.log("Fixed SEC-6 in tawjihi-search.js");