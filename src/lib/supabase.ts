import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

declare global {
  var __supabase: SupabaseClient | undefined;
}

function createSingleton(): SupabaseClient {
  if (!globalThis.__supabase) {
    globalThis.__supabase = createClient(url, key);
  }
  return globalThis.__supabase;
}

export const supabase: SupabaseClient = createSingleton();
