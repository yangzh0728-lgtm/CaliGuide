import dotenv from "dotenv";
import { getGoogleTranslatorConfig, translateForumContentWithGoogle } from "../src/lib/googleTranslator";

dotenv.config({ quiet: true });

const required = ["VITE_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "GOOGLE_TRANSLATE_API_KEY"] as const;
let missing = false;
for (const name of required) {
  const present = Boolean(process.env[name]?.trim());
  console.log(`${name}: ${present ? "SET" : "MISSING"}`);
  if (!present) missing = true;
}
console.log("This checks environment presence only; it does not verify credentials, connectivity, or the translation cache table.");
console.log("Run in the deployed service environment. Restart caliguide.service after changing server settings.");
process.exitCode = missing ? 1 : 0;

if (!missing && process.argv.includes("--live")) {
  console.log("Testing Google with the sample text Hello (a billable five-character request).");
  try {
    const translation = await translateForumContentWithGoogle({
      sourceType: "comment", sourceId: "config-check", targetLanguage: "es", body: ["Hello"],
    }, getGoogleTranslatorConfig(process.env)!);
    if (translation.body[0] === "Hello") throw new Error("Google returned untranslated sample text");
    console.log("Google translation: PASS. This does not test Supabase credentials or the cache table.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Google translation check failed");
    console.error("Check the API key, API enablement, billing, quota, and allowed server IP in Google Cloud.");
    process.exitCode = 1;
  }
}
