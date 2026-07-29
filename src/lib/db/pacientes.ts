import { supabase } from "../supabase";
import { Database } from "../database.types";
import { assertPermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";

export type Paciente = Database["public"]["Tables"]["pacientes"]["Row"];
export type InsertPaciente = Database["public"]["Tables"]["pacientes"]["Insert"];
export type UpdatePaciente = Database["public"]["Tables"]["pacientes"]["Update"];

export type SignosVitales = Database["public"]["Tables"]["signos_vitales"]["Row"];
export type InsertSignosVitales = Database["public"]["Tables"]["signos_vitales"]["Insert"];

export type Consulta = Database["public"]["Tables"]["consultas"]["Row"];
export type InsertConsulta = Database["public"]["Tables"]["consultas"]["Insert"];

export type Diagnostico = Database["public"]["Tables"]["diagnosticos_consulta"]["Row"];
export type InsertDiagnostico = Database["public"]["Tables"]["diagnosticos_consulta"]["Insert"];

export type MedicamentoConsulta = Database["public"]["Tables"]["medicamentos_consulta"]["Row"];
export type InsertMedicamentoConsulta = Database["public"]["Tables"]["medicamentos_consulta"]["Insert"];

export async function getPacientesDashboard(client: any = supabase) {
  const { data, error } = await client
    .from("dashboard_pacientes")
    .select("*")
    .single();

  if (error) {
    console.error("Error al obtener dashboard de pacientes:", error);
    return null;
  }
  return data;
}

export async function getPacientesAtendidos(client: any = supabase) {
  const { data, error } = await client
    .from("v_pacientes_atendidos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener pacientes atendidos:", error);
    return [];
  }
  return data;
}

export async function getPacienteDetalle(id: string, client: any = supabase) {
  const { data: paciente, error: errorPaciente } = await client
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .single();

  if (errorPaciente) throw errorPaciente;

  const { data: signos } = await client
    .from("signos_vitales")
    .select("*")
    .eq("paciente_id", id)
    .single();

  const { data: consultas } = await client
    .from("consultas")
    .select(`
      *,
      diagnosticos_consulta (*),
      medicamentos_consulta (*)
    `)
    .eq("paciente_id", id)
    .order("created_at", { ascending: false });

  return { paciente, signos, consultas: consultas || [] };
}

export async function createExpedienteCompleto(
  paciente: InsertPaciente,
  signos: Partial<InsertSignosVitales> | null,
  consulta: Partial<InsertConsulta> | null,
  diagnosticos: string[],
  medicamentos: Partial<InsertMedicamentoConsulta>[],
  client: any = supabase
) {
  await assertPermission(PERMISSIONS.PACIENTES_CREATE);
  if (paciente.brigada_id) {
    const { data: brigada } = await client
      .from("brigadas")
      .select("codigo")
      .eq("id", paciente.brigada_id)
      .single();
    
    const parsedNum = brigada?.codigo?.replace(/\D/g, "") || "1";
    const numInt = parseInt(parsedNum, 10) || 1;

    const { count } = await client
      .from("pacientes")
      .select("*", { count: "exact", head: true })
      .eq("brigada_id", paciente.brigada_id);

    const correlativo = (count || 0) + 1;
    paciente.codigo = `PAC-B${numInt}${String(correlativo).padStart(3, "0")}`;
  }

  const { data: newPaciente, error: errPac } = await client
    .from("pacientes")
    .insert(paciente)
    .select()
    .single();

  if (errPac) throw new Error(`Error paciente: ${errPac.message}`);

  const pacienteId = newPaciente.id;

  if (signos && Object.keys(signos).length > 0) {
    const { error: errSig } = await client
      .from("signos_vitales")
      .insert({ ...signos, paciente_id: pacienteId } as InsertSignosVitales);
    
    if (errSig) console.error("Error signos:", errSig);
  }

  if (consulta && consulta.tipo_consulta && consulta.brigada_id && consulta.medico_id) {
    const { data: newConsulta, error: errCons } = await client
      .from("consultas")
      .insert({ ...consulta, paciente_id: pacienteId } as InsertConsulta)
      .select()
      .single();

    if (errCons) throw new Error(`Error consulta: ${errCons.message}`);

    const consultaId = newConsulta.id;

    if (diagnosticos.length > 0) {
      const diagInserts = diagnosticos.map(d => ({
        consulta_id: consultaId,
        diagnostico: d
      }));
      await client.from("diagnosticos_consulta").insert(diagInserts);
    }

    if (medicamentos.length > 0) {
      const medInserts = medicamentos.map(m => ({
        ...m,
        consulta_id: consultaId
      })) as InsertMedicamentoConsulta[];
      await client.from("medicamentos_consulta").insert(medInserts);
    }
  }

  return newPaciente;
}

export async function deletePaciente(id: string, client: any = supabase) {
  await assertPermission(PERMISSIONS.PACIENTES_DELETE);
  const { error } = await client
    .from("pacientes")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
