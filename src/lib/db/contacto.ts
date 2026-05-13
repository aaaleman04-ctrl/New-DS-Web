import { supabase } from "../supabase";

export interface ContactoInsert {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  asunto: string;
  mensaje: string;
}

export async function insertContacto(
  data: ContactoInsert
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("contacto").insert([data]);
  return { error: error?.message ?? null };
}
