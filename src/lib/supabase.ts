import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

declare global {
  var __supabase: SupabaseClient | undefined;
}

function createSingleton(): SupabaseClient {
  if (!globalThis.__supabase) {
    if (!url || !key) {
      throw new Error(
        "Faltan variables de Supabase. En la raíz del proyecto, crea o edita `.env.local` con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (sin comillas ni punto y coma al final). Luego reinicia `npm run dev`."
      );
    }
    globalThis.__supabase = createClient(url, key);
  }
  return globalThis.__supabase;
}

export const supabase: SupabaseClient = createSingleton();
