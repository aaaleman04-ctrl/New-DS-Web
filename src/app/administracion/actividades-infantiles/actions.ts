"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { assertPermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  getDashboardActividades as getDashboardActividadesDB,
  getActividades as getActividadesDB,
  createActividad as createActividadDB,
  addParticipantesActividad as addParticipantesActividadDB,
} from "@/lib/db/actividades";

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

export async function getDashboardActividadesAction() {
  const supabase = await getAuthedSupabase();
  return await getDashboardActividadesDB(supabase);
}

export async function getActividadesInfantilesAction() {
  const supabase = await getAuthedSupabase();
  return await getActividadesDB(supabase);
}

export async function crearActividadInfantilAction(actividad: {
  brigada_id: string;
  nombre: string;
  descripcion: string;
  cantidad_regalos: number;
  responsable_id: string;
}) {
  await assertPermission(PERMISSIONS.ACTIVIDADES_CREATE);
  const supabase = await getAuthedSupabase();
  const result = await createActividadDB(actividad, supabase);
  revalidatePath("/administracion/actividades-infantiles");
  return result;
}

export async function registrarParticipacionNinosAction(
  actividadId: string,
  cantidadNinos: number
) {
  await assertPermission(PERMISSIONS.ACTIVIDADES_UPDATE);
  const supabase = await getAuthedSupabase();
  const result = await addParticipantesActividadDB(
    actividadId,
    cantidadNinos,
    supabase
  );
  revalidatePath("/administracion/actividades-infantiles");
  return result;
}
