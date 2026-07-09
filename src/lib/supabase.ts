import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

declare global {
  var __supabase: SupabaseClient<Database> | undefined;
}

function createSingleton(): SupabaseClient<Database> {
  if (!globalThis.__supabase) {
    if (!url || !key) {
      throw new Error(
        "Faltan variables de Supabase. En la raíz del proyecto, crea o edita `.env.local` con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (sin comillas ni punto y coma al final). Luego reinicia `npm run dev`."
      );
    }
    globalThis.__supabase = createBrowserClient<Database>(url, key);
  }
  return globalThis.__supabase;
}

export const supabase = createSingleton();
