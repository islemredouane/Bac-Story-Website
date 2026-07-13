const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: users, error } = await adminSupabase.auth.admin.listUsers();
  if (error) {
    console.error(error);
    return;
  }
  const u = users.users.find(u => u.email === "redouanemohamedislem@gmail.com");
  if (u) {
    console.log("User ID:", u.id);
  } else {
    console.log("User not found!");
  }
}
run();