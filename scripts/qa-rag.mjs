import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getEmbedding(text) {
  const embedRes = await fetch("https://api.jina.ai/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.JINA_API_KEY}`
    },
    body: JSON.stringify({
      model: "jina-embeddings-v3",
      task: "retrieval.query",
      dimensions: 768,
      late_chunking: false,
      embedding_type: "float",
      input: [text]
    })
  });
  if (!embedRes.ok) throw new Error("Jina API error: " + embedRes.statusText);
  const data = await embedRes.json();
  return data.data[0].embedding;
}

async function run() {
  console.log("Running Part B: RAG Retrieval QA...\n");
  let pass = true;
  let testCount = 0;
  let successCount = 0;

  // 1. Check chunks count
  const { count, error: countErr } = await adminSupabase
    .from("kb_embeddings")
    .select("*", { count: "exact", head: true });
    
  if (countErr) {
    console.error("Failed to fetch chunk count:", countErr);
    pass = false;
  } else {
    console.log(`Embeddings Count: ${count} chunks (Expected > 100)`);
    if (count < 100) pass = false;
  }

  // 2. Test search_kb RPC
  const tests = [
    { query: "الإعلام العسكري", assertHasId: "military-media" },
    { query: "المدرسة العليا للطيران", assertHasId: "esa" },
    { query: "معدل الطب", assertHasId: "med-national" },
    { query: "التسجيل في المدارس العسكرية", assertContentIncludes: "preinscription.mdn.dz" }
  ];

  for (const t of tests) {
    testCount++;
    try {
      const vec = await getEmbedding(t.query);
      const { data, error } = await adminSupabase.rpc('search_kb', {
        query_embedding: vec,
        match_threshold: 0.2,
        match_count: 5
      });

      if (error) throw error;
      
      let matched = false;
      if (t.assertHasId) {
        matched = data.some(doc => doc.metadata && doc.metadata.id === t.assertHasId);
        if (!matched) {
          console.error(`❌ [${t.query}] FAILED: expected doc with ID ${t.assertHasId}. Got: ${data.map(d=>d.metadata?.id || d.metadata?.code).join(', ')}`);
          pass = false;
        }
      }
      
      if (t.assertContentIncludes) {
        matched = data.some(doc => doc.content.includes(t.assertContentIncludes));
        if (!matched) {
          console.error(`❌ [${t.query}] FAILED: expected content to include '${t.assertContentIncludes}'`);
          pass = false;
        }
      }

      if (matched) {
        console.log(`✅ [${t.query}] PASSED`);
        successCount++;
      }
    } catch(e) {
      console.error(`❌ [${t.query}] ERROR:`, e.message);
      pass = false;
    }
  }

  console.log(`\nRAG Tests: ${successCount}/${testCount} passed.`);
  console.log(pass ? "\n✅ Part B PASSED" : "\n❌ Part B FAILED");
}
run();