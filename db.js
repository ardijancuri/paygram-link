const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseApiKey =
  process.env.SUPABASE_API_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseApiKey) {
  supabase = createClient(supabaseUrl, supabaseApiKey);

  // Test the connection against a real PayGram Link table.
  supabase
    .from("users")
    .select("*")
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error("Supabase connection error:", error);
      } else {
        console.log("Supabase connected:", data);
      }
    });
} else {
  console.warn("Supabase URL/API key are not configured.");
}

module.exports = supabase;
