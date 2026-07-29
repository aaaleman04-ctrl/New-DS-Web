import { supabase } from "../supabase";
import { assertPermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { generateCleanToken } from "../coding/codingUtils";

export async function getDashboardRopa(client: any = supabase) {
  const { data, error } = await client
    .from("dashboard_ropa")
    .select("*")
    .single();

  if (error) {
    console.error("Error dashboard ropa:", error);
    return null;
  }
  return data;
}

export async function getResumenRopa(client: any = supabase) {
  const { data, error } = await client
    .from("v_resumen_ropa")
    .select("*")
    .single();

  if (error) {
    console.error("Error resumen ropa:", error);
    return null;
  }
  return data;
}

export async function getDonacionesRopa(client: any = supabase) {
  const { data, error } = await client
    .from("donaciones_ropa")
    .select("*")
    .order("fecha_donacion", { ascending: false });

  if (error) {
    console.error("Error getDonacionesRopa:", error);
    return [];
  }
  return data;
}

export async function createDonacionRopa(donacion: any, client: any = supabase) {
  await assertPermission(PERMISSIONS.DONACIONES_CREATE);
  const anio = new Date().getFullYear();
  const codigo = `DON-ROP-${anio}-${generateCleanToken(5)}`;
  const { data, error } = await client
    .from("donaciones_ropa")
    .insert([{ ...donacion, codigo }])
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear donación: ${error.message}`);
  }
  return data;
}

export async function getEntregasRopa(client: any = supabase) {
  const { data, error } = await client
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

export async function getPacientesBrigadaParaRopa(brigadaId: string, client: any = supabase) {
  const { data: pacientes, error: errPacientes } = await client
    .from("pacientes")
    .select("id, nombres, apellidos, codigo")
    .eq("brigada_id", brigadaId);

  if (errPacientes) throw new Error(errPacientes.message);

  const { data: entregas, error: errEntregas } = await client
    .from("entregas_ropa")
    .select("paciente_id, cantidad_prendas")
    .eq("brigada_id", brigadaId);

  if (errEntregas) throw new Error(errEntregas.message);

  const consumos: Record<string, number> = {};
  for (const e of entregas) {
    consumos[e.paciente_id] = (consumos[e.paciente_id] || 0) + e.cantidad_prendas;
  }

  return pacientes.map((p: any) => ({
    ...p,
    prendasRecibidas: consumos[p.id] || 0,
    prendasDisponibles: 2 - (consumos[p.id] || 0)
  })).filter((p: any) => p.prendasDisponibles > 0);
}

export async function createEntregaRopa(entrega: any, client: any = supabase) {
  await assertPermission(PERMISSIONS.DONACIONES_CREATE);
  if (entrega.cantidad_prendas <= 0 || entrega.cantidad_prendas > 2) {
    throw new Error("La cantidad debe ser 1 o 2.");
  }
  const { data, error } = await client
    .from("entregas_ropa")
    .insert([entrega])
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear entrega de ropa: ${error.message}`);
  }
  return data;
}
