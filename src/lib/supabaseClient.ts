import { createClient } from "@supabase/supabase-js";

export interface SupabaseBrowserConfig {
  url: string;
  anonKey: string;
}

type SupabaseEnv = Partial<{
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}>;

export function getSupabaseBrowserConfig(env: SupabaseEnv): SupabaseBrowserConfig {
  const url = env.VITE_SUPABASE_URL?.trim();
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  }

  return { url, anonKey };
}

export function createSupabaseBrowserClient(config: SupabaseBrowserConfig) {
  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = createSupabaseBrowserClient(
  getSupabaseBrowserConfig(import.meta.env),
);
