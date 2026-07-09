import { supabase } from "../supabase";

export async function getDashboardRopa() {
  const { data, error } = await supabase
    .from("dashboard_ropa")
    .select("*")
    .single();

  if (error) {
    console.error("Error dashboard ropa:", error);
    return null;
  }
  return data;
}

export async function getResumenRopa() {
  const { data, error } = await supabase
    .from("v_resumen_ropa")
    .select("*")
    .single();

  if (error) {
    console.error("Error resumen ropa:", error);
    return null;
  }
  return data;
}

export async function getDonacionesRopa() {
  const { data, error } = await supabase
    .from("donaciones_ropa")
    .select("*")
    .order("fecha_donacion", { ascending: false });

  if (error) {
    console.error("Error getDonacionesRopa:", error);
    return [];
  }
  return data;
}

export async function createDonacionRopa(donacion: any) {
  // Generate Kendall code: DON-XXXX-XXXX
  const codigo = `DON-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
  const { data, error } = await supabase
    .from("donaciones_ropa")
    .insert([{ ...donacion, codigo }])
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear donación: ${error.message}`);
  }
  return data;
}

export async function getEntregasRopa() {
  const { data, error } = await supabase
    .from("entregas_ropa")
    .select(`
      id,
      cantidad_prendas,
      fecha_entrega,
      observaciones,
      pacientes (nombres, apellidos),
      brigadas (nombre),
      perfiles (nombre_completo)
    `)
    .order("fecha_entrega", { ascending: false });

  if (error) {
    console.error("Error getEntregasRopa:", error);
    return [];
  }
  return data;
}

export async function getPacientesBrigadaParaRopa(brigadaId: string) {
  // Fetch pacientes of the brigada
  const { data: pacientes, error: errPacientes } = await supabase
    .from("pacientes")
    .select("id, nombres, apellidos, codigo")
    .eq("brigada_id", brigadaId);

  if (errPacientes) throw new Error(errPacientes.message);

  // Fetch already delivered clothes for these patients
  const { data: entregas, error: errEntregas } = await supabase
    .from("entregas_ropa")
    .select("paciente_id, cantidad_prendas")
    .eq("brigada_id", brigadaId);

  if (errEntregas) throw new Error(errEntregas.message);

  // Calculate remaining allowed for each patient (max 2)
  const consumos: Record<string, number> = {};
  for (const e of entregas) {
    consumos[e.paciente_id] = (consumos[e.paciente_id] || 0) + e.cantidad_prendas;
  }

  // Filter patients that can still receive clothes
  return pacientes.map(p => ({
    ...p,
    prendasRecibidas: consumos[p.id] || 0,
    prendasDisponibles: 2 - (consumos[p.id] || 0)
  })).filter(p => p.prendasDisponibles > 0);
}

export async function createEntregaRopa(entrega: any) {
  if (entrega.cantidad_prendas <= 0 || entrega.cantidad_prendas > 2) {
    throw new Error("La cantidad debe ser 1 o 2.");
  }
  const { data, error } = await supabase
    .from("entregas_ropa")
    .insert([entrega])
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear entrega de ropa: ${error.message}`);
  }
  return data;
}
