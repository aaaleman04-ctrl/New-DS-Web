"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { assertPermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  deleteBrigada,
  insertBrigada,
  slugifyBrigadaId,
  updateBrigada,
} from "@/lib/db/brigadas";
import { uploadBrigadaPhotos } from "@/lib/storage/brigadas";

export type BrigadaActionState = {
  success?: boolean;
  error?: string;
  message?: string;
} | null;

async function getAuthedSupabase() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Debes iniciar sesión para realizar esta acción.");
  }

  return supabase;
}

function parseBrigadaForm(formData: FormData) {
  const numero = (formData.get("numero") as string)?.trim();
  const nombre = (formData.get("nombre") as string)?.trim();
  const descripcion = (formData.get("descripcion") as string)?.trim() || null;
  const fecha = (formData.get("fecha") as string)?.trim() || null;
  const lugar = (formData.get("lugar") as string)?.trim() || null;
  const latRaw = (formData.get("lat") as string)?.trim();
  const lngRaw = (formData.get("lng") as string)?.trim();
  const ordenRaw = (formData.get("orden") as string)?.trim();

  if (!numero || !nombre) {
    return { error: "El número y el nombre de la brigada son obligatorios." };
  }

  const lat = latRaw ? Number(latRaw) : null;
  const lng = lngRaw ? Number(lngRaw) : null;
  const orden = ordenRaw ? Number(ordenRaw) : null;

  if (latRaw && Number.isNaN(lat)) {
    return { error: "La latitud debe ser un número válido." };
  }
  if (lngRaw && Number.isNaN(lng)) {
    return { error: "La longitud debe ser un número válido." };
  }
  if (ordenRaw && Number.isNaN(orden)) {
    return { error: "El orden debe ser un número válido." };
  }

  return {
    data: { numero, nombre, descripcion, fecha, lugar, lat, lng, orden },
  };
}

function revalidateBrigadas() {
  revalidatePath("/administracion/brigadas");
  revalidatePath("/brigadas");
}

export async function createBrigadaAction(
  _prevState: BrigadaActionState,
  formData: FormData
): Promise<BrigadaActionState> {
  try {
    await assertPermission(PERMISSIONS.BRIGADAS_CREATE);
    const supabase = await getAuthedSupabase();
    const parsed = parseBrigadaForm(formData);

    if ("error" in parsed && parsed.error) {
      return { error: parsed.error };
    }

    const { data } = parsed;
    if (!data) return { error: "Datos inválidos." };

    const id = slugifyBrigadaId(data.numero);

    const { error } = await insertBrigada(supabase, { id, ...data });

    if (error) {
      if (error.includes("duplicate") || error.includes("unique")) {
        return {
          error:
            "Ya existe una brigada con ese identificador. Cambia el número o el nombre.",
        };
      }
      return { error: `No se pudo crear la brigada: ${error}` };
    }

    // Subir fotos si se adjuntaron
    const files = formData.getAll("photos") as File[];
    const validFiles = files.filter((f) => f.size > 0);
    let photoMsg = "";

    if (validFiles.length > 0) {
      const { uploaded, errors: photoErrors } = await uploadBrigadaPhotos(
        supabase,
        id,
        validFiles
      );
      if (photoErrors.length > 0) {
        photoMsg = ` Se subieron ${uploaded} de ${validFiles.length} fotos.`;
      } else {
        photoMsg = ` Se subieron ${uploaded} fotos.`;
      }
    }

    revalidateBrigadas();
    return {
      success: true,
      message: `La brigada se creó exitosamente.${photoMsg}`,
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error al crear la brigada.",
    };
  }
}

export async function updateBrigadaAction(
  _prevState: BrigadaActionState,
  formData: FormData
): Promise<BrigadaActionState> {
  try {
    await assertPermission(PERMISSIONS.BRIGADAS_UPDATE);
    const supabase = await getAuthedSupabase();
    const id = (formData.get("id") as string)?.trim();

    if (!id) {
      return { error: "No se encontró la brigada a editar." };
    }

    const parsed = parseBrigadaForm(formData);

    if ("error" in parsed && parsed.error) {
      return { error: parsed.error };
    }

    const { data } = parsed;
    if (!data) return { error: "Datos inválidos." };

    const { error } = await updateBrigada(supabase, id, data);

    if (error) {
      return { error: `No se pudo actualizar la brigada: ${error}` };
    }

    // Subir fotos si se adjuntaron
    const files = formData.getAll("photos") as File[];
    const validFiles = files.filter((f) => f.size > 0);
    let photoMsg = "";

    if (validFiles.length > 0) {
      const { uploaded, errors: photoErrors } = await uploadBrigadaPhotos(
        supabase,
        id,
        validFiles
      );
      if (photoErrors.length > 0) {
        photoMsg = ` Se subieron ${uploaded} de ${validFiles.length} fotos.`;
      } else {
        photoMsg = ` Se subieron ${uploaded} fotos.`;
      }
    }

    revalidateBrigadas();
    return {
      success: true,
      message: `La brigada se actualizó exitosamente.${photoMsg}`,
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error al actualizar la brigada.",
    };
  }
}

export async function deleteBrigadaAction(
  id: string
): Promise<BrigadaActionState> {
  try {
    await assertPermission(PERMISSIONS.BRIGADAS_DELETE);
    const supabase = await getAuthedSupabase();

    if (!id) {
      return { error: "No se encontró la brigada a eliminar." };
    }

    const { error } = await deleteBrigada(supabase, id);

    if (error) {
      return { error: `No se pudo eliminar la brigada: ${error}` };
    }

    revalidateBrigadas();
    return {
      success: true,
      message: "La brigada se eliminó exitosamente.",
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error al eliminar la brigada.",
    };
  }
}
