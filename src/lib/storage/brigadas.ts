import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../supabase";

export const BRIGADAS_STORAGE_BUCKET = "brigadas";

export interface UploadedPhotoResult {
  fileName: string;
  storagePath: string;
  publicUrl: string;
}

/**
 * Sube fotos al storage de Supabase dentro de la carpeta de la brigada (brigadas/CODIGO-BRIGADA/timestamp-filename).
 * Retorna las URLs públicas de cada archivo cargado.
 */
export async function uploadBrigadaPhotos(
  client: SupabaseClient = supabase,
  brigadaCodigo: string,
  files: File[]
): Promise<{ uploaded: UploadedPhotoResult[]; errors: string[] }> {
  const errors: string[] = [];
  const uploaded: UploadedPhotoResult[] = [];

  for (const file of files) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${Date.now()}-${sanitizedName}`;
      const storagePath = `${brigadaCodigo}/${fileName}`;

      const { error: uploadError } = await client.storage
        .from(BRIGADAS_STORAGE_BUCKET)
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        errors.push(`Error al subir ${file.name}: ${uploadError.message}`);
        continue;
      }

      const { data } = client.storage
        .from(BRIGADAS_STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      uploaded.push({
        fileName,
        storagePath,
        publicUrl: data.publicUrl,
      });
    } catch (err) {
      errors.push(`Error al procesar ${file.name}: ${err instanceof Error ? err.message : "Error desconocido"}`);
    }
  }

  return { uploaded, errors };
}

/**
 * Elimina una foto física de Supabase Storage.
 */
export async function deleteBrigadaPhotoFromStorage(
  client: SupabaseClient = supabase,
  brigadaCodigo: string,
  fileName: string
): Promise<{ error: string | null }> {
  const path = `${brigadaCodigo}/${fileName}`;
  const { error } = await client.storage.from(BRIGADAS_STORAGE_BUCKET).remove([path]);
  return { error: error?.message ?? null };
}

/**
 * Obtiene la URL pública de una foto guardada en Supabase Storage.
 */
export function getBrigadaPhotoPublicUrl(
  client: SupabaseClient = supabase,
  brigadaCodigo: string,
  fileName: string
): string {
  const path = `${brigadaCodigo}/${fileName}`;
  const { data } = client.storage.from(BRIGADAS_STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
