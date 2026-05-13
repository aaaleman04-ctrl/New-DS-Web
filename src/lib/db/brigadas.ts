import { supabase } from "../supabase";

export interface Brigada {
  id: string;
  numero: string;
  nombre: string;
  descripcion?: string;
  fecha?: string;
  lugar?: string;
  lat?: number;
  lng?: number;
  orden?: number;
}

export async function getBrigadas(): Promise<{
  data: Brigada[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("brigadas")
    .select("*")
    .order("orden", { ascending: true });

  return { data: data ?? null, error: error?.message ?? null };
}
