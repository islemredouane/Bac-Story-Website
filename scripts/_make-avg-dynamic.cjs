const fs = require("fs");

function fixSpecialities() {
  let content = fs.readFileSync("tawjihi/specialities.html", "utf8");
  
  // 1. Update buildCard signature
  content = content.replace(
    /function buildCard\(s\) \{/g,
    "function buildCard(s, dynamicAvg) {"
  );
  
  // 2. Update toFixed call inside buildCard
  content = content.replace(
    /s\.avg\.toFixed\(2\)/g,
    "(dynamicAvg !== undefined && dynamicAvg !== null ? dynamicAvg : s.avg).toFixed(2)"
  );
  
  // 3. Calculate dynamicAvg and pass it to buildCard
  const searchFor = "const passNonWilaya = matchCat && matchQ && matchStream && matchLmd && matchAvg;";
  const replacement = `      let effectiveAvg = s.avg;
      const activeStream = state.stream || myStreamCode;
      if (activeStream && hasElig && window.twElig) {
        const eligRec = window.twElig(s.id);
        if (eligRec && eligRec.thresholdsByStream && eligRec.thresholdsByStream[activeStream]) {
          effectiveAvg = eligRec.thresholdsByStream[activeStream];
        }
      }

      const passNonWilaya = matchCat && matchQ && matchStream && matchLmd && matchAvg;`;
      
  content = content.replace(searchFor, replacement);
  
  // 4. Update the call
  content = content.replace(
    /grid\.insertBefore\(buildCard\(s\), noResults\);/g,
    "grid.insertBefore(buildCard(s, effectiveAvg), noResults);"
  );
  
  fs.writeFileSync("tawjihi/specialities.html", content, "utf8");
  console.log("specialities.html updated");
}

fixSpecialities();