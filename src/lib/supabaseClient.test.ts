import { describe, expect, it } from "bun:test";
import { createSupabaseBrowserClient, getSupabaseBrowserConfig } from "./supabaseClient";

describe("supabaseClient", () => {
  it("reads the public Supabase browser config from env values", () => {
    const config = getSupabaseBrowserConfig({
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "sb_publishable_example",
    });

    expect(config).toEqual({
      url: "https://example.supabase.co",
      anonKey: "sb_publishable_example",
    });
  });

  it("throws a helpful error when public Supabase env values are missing", () => {
    expect(() => getSupabaseBrowserConfig({})).toThrow(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY",
    );
  });

  it("creates a browser Supabase client", () => {
    const client = createSupabaseBrowserClient({
      url: "https://example.supabase.co",
      anonKey: "sb_publishable_example",
    });

    expect(client.auth.signInWithPassword).toBeTypeOf("function");
    expect(client.from).toBeTypeOf("function");
  });
});
