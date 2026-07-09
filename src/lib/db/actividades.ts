import { supabase } from "../supabase";

export async function getDashboardActividades() {
  const { data, error } = await supabase
    .from("dashboard_actividades")
    .select("*")
    .single();

  if (error) {
    console.error("Error dashboard actividades:", error);
    return null;
  }
  return data;
}

export async function getActividades() {
  // Query actividades and calculate the sum of niños from participantes_actividad
  const { data, error } = await supabase
    .from("actividades_infantiles")
    .select(`
      id,
      nombre,
      descripcion,
      cantidad_regalos,
      created_at,
      brigadas (nombre),
      perfiles (nombre_completo),
      participantes_actividad (cantidad_ninos)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error getActividades:", error);
    return [];
  }

  // Calculate sum in memory for each activity
  return data.map((act: any) => {
    const totalNinos = act.participantes_actividad?.reduce((sum: number, p: any) => sum + p.cantidad_ninos, 0) || 0;
    return {
      ...act,
      total_ninos: totalNinos
    };
  });
}

export async function createActividad(actividad: { brigada_id: string, nombre: string, descripcion: string, cantidad_regalos: number, responsable_id: string }) {
  const { data, error } = await supabase
    .from("actividades_infantiles")
    .insert([actividad])
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear actividad: ${error.message}`);
  }
  return data;
}

export async function addParticipantesActividad(actividadId: string, cantidadNinos: number) {
  if (cantidadNinos <= 0) {
    throw new Error("La cantidad de niños debe ser mayor a 0");
  }

  const { data, error } = await supabase
    .from("participantes_actividad")
    .insert([{ actividad_id: actividadId, cantidad_ninos: cantidadNinos }])
    .select()
    .single();

  if (error) {
    throw new Error(`Error al agregar participantes: ${error.message}`);
  }
  return data;
}
