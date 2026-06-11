import { supabase } from "../supabase";

const BUCKET = "brigadas";

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
