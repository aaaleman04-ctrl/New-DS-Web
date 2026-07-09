import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "./database.types";

/**
 * Crea un cliente de Supabase para usar en Server Components,
 * Server Actions y Route Handlers.
 * Lee y escribe cookies para mantener la sesión del usuario.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // En Server Components read-only esto puede fallar; el middleware
            // se encarga de refrescar las cookies en esos casos.
          }
        },
      },
    }
  );
}
