import dotenv from "dotenv";

dotenv.config({ quiet: true });

const required = ["VITE_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "AZURE_TRANSLATOR_KEY"] as const;
let missing = false;
for (const name of required) {
  const present = Boolean(process.env[name]?.trim());
  console.log(`${name}: ${present ? "SET" : "MISSING"}`);
  if (!present) missing = true;
}
console.log(`AZURE_TRANSLATOR_ENDPOINT: ${process.env.AZURE_TRANSLATOR_ENDPOINT?.trim() ? "SET" : "DEFAULT"}`);
console.log(`AZURE_TRANSLATOR_REGION: ${process.env.AZURE_TRANSLATOR_REGION?.trim() ? "SET" : "NOT SET (required for regional Azure resources)"}`);
console.log("This checks environment presence only; it does not verify credentials, connectivity, or the translation cache table.");
console.log("Run in the deployed service environment. Restart caliguide.service after changing server settings.");
process.exitCode = missing ? 1 : 0;
