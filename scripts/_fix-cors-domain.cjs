const fs = require("fs");
const files = fs.readdirSync("api").filter(f => f.endsWith(".js"));

files.forEach(f => {
  let c = fs.readFileSync("api/" + f, "utf8");
  if (c.includes("https://bacstory.com")) {
    c = c.replace(/"https:\/\/bacstory\.com"/g, `"https://bacstory.vercel.app"`);
    fs.writeFileSync("api/" + f, c, "utf8");
    console.log("Updated CORS domain in " + f);
  }
});