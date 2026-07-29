"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { assertPermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  getPacientesDashboard as getPacientesDashboardDB,
  getPacientesAtendidos as getPacientesAtendidosDB,
  getPacienteDetalle as getPacienteDetalleDB,
  createExpedienteCompleto as createExpedienteCompletoDB,
  deletePaciente as deletePacienteDB,
  type InsertPaciente,
  type InsertSignosVitales,
  type InsertConsulta,
  type InsertMedicamentoConsulta,
} from "@/lib/db/pacientes";

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

export async function getPacientesDashboardAction() {
  const supabase = await getAuthedSupabase();
  return await getPacientesDashboardDB(supabase);
}

export async function getPacientesAtendidosAction() {
  const supabase = await getAuthedSupabase();
  return await getPacientesAtendidosDB(supabase);
}

export async function getPacienteDetalleAction(id: string) {
  const supabase = await getAuthedSupabase();
  return await getPacienteDetalleDB(id, supabase);
}

export async function createExpedienteCompletoAction(
  paciente: InsertPaciente,
  signos: Partial<InsertSignosVitales> | null,
  consulta: Partial<InsertConsulta> | null,
  diagnosticos: string[],
  medicamentos: Partial<InsertMedicamentoConsulta>[]
) {
  await assertPermission(PERMISSIONS.PACIENTES_CREATE);
  const supabase = await getAuthedSupabase();
  const result = await createExpedienteCompletoDB(
    paciente,
    signos,
    consulta,
    diagnosticos,
    medicamentos,
    supabase
  );
  revalidatePath("/administracion/pacientes");
  return result;
}

export async function deletePacienteAction(id: string) {
  await assertPermission(PERMISSIONS.PACIENTES_DELETE);
  const supabase = await getAuthedSupabase();
  const result = await deletePacienteDB(id, supabase);
  revalidatePath("/administracion/pacientes");
  return result;
}
