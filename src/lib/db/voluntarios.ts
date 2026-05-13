import { supabase } from "../supabase";

export interface VoluntarioInsert {
  nombre: string;
  apellido: string;
  rol: string;
  telefono: string;
  mensaje?: string | null;
}

export async function insertVoluntario(
  data: VoluntarioInsert
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("voluntarios").insert([data]);
  return { error: error?.message ?? null };
}
