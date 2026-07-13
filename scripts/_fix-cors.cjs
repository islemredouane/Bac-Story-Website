const fs = require("fs");
const files = fs.readdirSync("api").filter(f => f.endsWith(".js"));

const corsBlock = `
  const origin = req.headers.origin;
  const allowedDomains = ["https://tawjihi-bacstory.vercel.app", "https://bacstory.com", "http://localhost"];
  if (origin && (allowedDomains.includes(origin) || origin.endsWith("-bac-story.vercel.app"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
`;

files.forEach(f => {
  let c = fs.readFileSync("api/" + f, "utf8");
  if (c.includes("res.setHeader('Access-Control-Allow-Origin', '*')")) {
    c = c.replace(/res\.setHeader\('Access-Control-Allow-Origin', '\*'\);/g, corsBlock.trim());
    fs.writeFileSync("api/" + f, c, "utf8");
    console.log("Fixed CORS in " + f);
  }
});