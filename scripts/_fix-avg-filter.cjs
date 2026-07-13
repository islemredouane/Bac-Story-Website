const fs = require("fs");

function fixFilter() {
  let content = fs.readFileSync("tawjihi/specialities.html", "utf8");
  
  const searchFor = `      const matchAvg    = s.avg >= state.avgMin && s.avg <= state.avgMax;

      /* ----- شعبة filtering -----`;

  const replaceWith = `      /* ----- شعبة filtering -----`;
  
  content = content.replace(searchFor, replaceWith);
  
  const searchFor2 = `      const passNonWilaya = matchCat && matchQ && matchStream && matchLmd && matchAvg;`;
  
  const replaceWith2 = `      const matchAvg = effectiveAvg >= state.avgMin && effectiveAvg <= state.avgMax;
      const passNonWilaya = matchCat && matchQ && matchStream && matchLmd && matchAvg;`;
      
  content = content.replace(searchFor2, replaceWith2);
  
  fs.writeFileSync("tawjihi/specialities.html", content, "utf8");
  console.log("specialities.html filter fixed");
}

fixFilter();