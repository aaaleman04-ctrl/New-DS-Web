import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../supabase";

const BUCKET = "brigadas";

/**
 * Sube fotos al storage de Supabase dentro de la carpeta de la brigada.
 * Genera nombres únicos para evitar colisiones.
 */
export async function uploadBrigadaPhotos(
  client: SupabaseClient,
  brigadaId: string,
  files: File[]
): Promise<{ uploaded: number; errors: string[] }> {
  const errors: string[] = [];
  let uploaded = 0;

  for (const file of files) {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `${brigadaId}/${fileName}`;

    const { error } = await client.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false });

    if (error) {
      errors.push(`${file.name}: ${error.message}`);
    } else {
      uploaded++;
    }
  }

  return { uploaded, errors };
}

export async function listBrigadaPhotos(brigadaId: string): Promise<{
  urls: string[];
  error: string | null;
}> {
  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list(brigadaId, { sortBy: { column: "name", order: "asc" } });

  if (error || !files) {
    return { urls: [], error: error?.message ?? "Error al listar archivos" };
  }

  const images = files.filter(
    (f) => f.name && /\.(jpg|jpeg|png|webp|avif|JPG)$/i.test(f.name)
  );

  if (images.length === 0) {
    return { urls: [], error: null };
  }

  const urls = images.map((f) => {
    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(`${brigadaId}/${f.name}`);
    return data.publicUrl;
  });

  return { urls, error: null };
}
