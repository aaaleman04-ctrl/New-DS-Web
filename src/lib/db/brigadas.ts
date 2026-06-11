import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../supabase";

export interface Brigada {
  id: string;
  numero: string;
  nombre: string;
  descripcion?: string | null;
  fecha?: string | null;
  lugar?: string | null;
  lat?: number | null;
  lng?: number | null;
  orden?: number | null;
}

export type BrigadaInsert = Omit<Brigada, "id"> & { id?: string };
export type BrigadaUpdate = Partial<Omit<Brigada, "id">>;

export async function getBrigadas(
  client: SupabaseClient = supabase
): Promise<{ data: Brigada[] | null; error: string | null }> {
  const { data, error } = await client
    .from("brigadas")
    .select("*")
    .order("orden", { ascending: true });

  return { data: data ?? null, error: error?.message ?? null };
}

export async function insertBrigada(
  client: SupabaseClient,
  data: BrigadaInsert
): Promise<{ data: Brigada | null; error: string | null }> {
  const { data: inserted, error } = await client
    .from("brigadas")
    .insert([data])
    .select()
    .single();

  return { data: inserted, error: error?.message ?? null };
}

export async function updateBrigada(
  client: SupabaseClient,
  id: string,
  data: BrigadaUpdate
): Promise<{ data: Brigada | null; error: string | null }> {
  const { data: updated, error } = await client
    .from("brigadas")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  return { data: updated, error: error?.message ?? null };
}

export async function deleteBrigada(
  client: SupabaseClient,
  id: string
): Promise<{ error: string | null }> {
  const { error } = await client.from("brigadas").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export function slugifyBrigadaId(nombre: string, numero: string): string {
  const base = `${numero}-${nombre}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  return `Brigada-${base || Date.now()}`;
}
