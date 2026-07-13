const fs = require("fs");
let c = fs.readFileSync("api/tawjihi-chat.js", "utf8");

const sec10Old = `  // SEC-5: Check (and auto-refill if 24 h elapsed) credit balance BEFORE Groq call.
  // ensure_daily_credits() atomically resets balance to 30 when due, then returns it.
  const { data: currentBalance, error: credErr } = await adminSupabase
    .rpc('ensure_daily_credits', { uid: user.id });
  if (credErr || currentBalance == null || currentBalance <= 0) {
    return res.status(402).json({ error: 'insufficient_credits' });
  }`;
  
const sec10New = `  // SEC-10: Fast read path. Only call RPC (which upserts and locks) if refill is needed.
  let { data: credInfo, error: credFetchErr } = await adminSupabase
    .from('credits')
    .select('balance, updated_at')
    .eq('user_id', user.id)
    .single();

  let currentBalance = credInfo ? credInfo.balance : null;
  const now = new Date();
  const needsRefill = !credInfo || (new Date(credInfo.updated_at).setHours(0,0,0,0) < now.setHours(0,0,0,0));

  if (needsRefill || credFetchErr?.code === 'PGRST116') {
    // SEC-5: Check (and auto-refill if 24 h elapsed) credit balance BEFORE API call.
    const { data: rpcBalance, error: credErr } = await adminSupabase
      .rpc('ensure_daily_credits', { uid: user.id });
    if (credErr) {
      return res.status(402).json({ error: 'insufficient_credits' });
    }
    currentBalance = rpcBalance;
  }

  if (currentBalance == null || currentBalance <= 0) {
    return res.status(402).json({ error: 'insufficient_credits' });
  }`;

if (c.includes("ensure_daily_credits")) {
  c = c.replace(sec10Old, sec10New);
  fs.writeFileSync("api/tawjihi-chat.js", c, "utf8");
  console.log("Fixed SEC-10 in tawjihi-chat.js");
}