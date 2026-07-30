import { supabase } from "../supabase";
import { Database } from "../database.types";
import { assertPermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";

export type LoteMedicamento = Database["public"]["Tables"]["lotes_medicamentos"]["Row"];
export type InsertLoteMedicamento = Database["public"]["Tables"]["lotes_medicamentos"]["Insert"];
export type UpdateLoteMedicamento = Database["public"]["Tables"]["lotes_medicamentos"]["Update"];

export type InsertMedicamento = Database["public"]["Tables"]["medicamentos"]["Insert"];
export type UpdateMedicamento = Database["public"]["Tables"]["medicamentos"]["Update"];
export type TipoRecurso = "medicamento" | "insumo_medico" | "material_brigada";

function sanitizeMedicamentoPayload(payload: any) {
  const cleanPayload: Record<string, any> = {};
  
  if (payload.nombre !== undefined) cleanPayload.nombre = payload.nombre;
  if (payload.codigo !== undefined) cleanPayload.codigo = payload.codigo;
  if (payload.descripcion !== undefined) cleanPayload.descripcion = payload.descripcion;
  if (payload.unidad_medida !== undefined) cleanPayload.unidad_medida = payload.unidad_medida;
  if (payload.stock_minimo !== undefined) cleanPayload.stock_minimo = Number(payload.stock_minimo);
  if (payload.stock_actual !== undefined) cleanPayload.stock_actual = Number(payload.stock_actual);
  if (payload.tipo_recurso !== undefined) cleanPayload.tipo_recurso = payload.tipo_recurso;
  if (payload.categoria_id !== undefined && payload.categoria_id !== "") cleanPayload.categoria_id = payload.categoria_id;
  
  return cleanPayload;
}

export async function getMedicamentos(tipoRecurso?: TipoRecurso | "todos", client: any = supabase) {
  let query = client.from("stock_actual").select("*").order("nombre", { ascending: true });

  if (tipoRecurso && tipoRecurso !== "todos") {
    query = query.eq("tipo_recurso", tipoRecurso);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error al obtener medicamentos:", error);
    throw new Error("No se pudieron cargar los medicamentos.");
  }
  return data;
}

export async function getLotesByMedicamento(medicamentoId: string, client: any = supabase) {
  const { data, error } = await client
    .from("lotes_medicamentos")
    .select("*")
    .eq("medicamento_id", medicamentoId)
    .order("fecha_vencimiento", { ascending: true });

  if (error) {
    console.error("Error al obtener lotes:", error);
    throw new Error("No se pudieron cargar los lotes del medicamento.");
  }
  return data;
}

export async function createLote(lote: InsertLoteMedicamento, client: any = supabase) {
  await assertPermission(PERMISSIONS.INVENTARIO_CREATE);
  const { data, error } = await client
    .from("lotes_medicamentos")
    .insert([{ ...lote, cantidad_inicial: lote.cantidad_actual }])
    .select()
    .single();

  if (error) {
    console.error("Error al crear lote:", error);
    throw new Error(`Error al crear el lote: ${error.message}`);
  }

  // Registrar movimiento de entrada usando el CHECK tipo = 'E' de PostgreSQL
  if (data?.medicamento_id && data?.cantidad_actual) {
    await client.from("movimientos_inventario").insert({
      medicamento_id: data.medicamento_id,
      cantidad: data.cantidad_actual,
      tipo: "E",
      motivo: "Nuevo Lote de Inventario",
      observaciones: `Lote ${data.numero_lote}`,
    } as any);
  }

  return data;
}

export async function updateLote(id: string, lote: UpdateLoteMedicamento, client: any = supabase) {
  await assertPermission(PERMISSIONS.INVENTARIO_UPDATE);
  const { data, error } = await client
    .from("lotes_medicamentos")
    .update(lote)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar lote:", error);
    throw new Error(`Error al actualizar el lote: ${error.message}`);
  }
  return data;
}

export async function deleteLote(id: string, client: any = supabase) {
  await assertPermission(PERMISSIONS.INVENTARIO_DELETE);
  const { error } = await client
    .from("lotes_medicamentos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar lote:", error);
    throw new Error(`Error al eliminar el lote: ${error.message}`);
  }
}

export async function getCategoriasInventario(client: any = supabase) {
  const { data, error } = await client
    .from("categorias_inventario")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error al obtener categorias_inventario:", error);
    return [];
  }

  return data || [];
}

export async function createMedicamento(medicamento: InsertMedicamento, cantidadInicial: number = 0, client: any = supabase) {
  await assertPermission(PERMISSIONS.INVENTARIO_CREATE);
  
  const cleanData = sanitizeMedicamentoPayload(medicamento);
  cleanData.stock_actual = cantidadInicial;

  // Validación de duplicado (mismo nombre exacto)
  const { data: exist, error: errExist } = await client
    .from("medicamentos")
    .select("id, nombre")
    .ilike("nombre", cleanData.nombre.trim())
    .maybeSingle();

  if (exist) {
    throw new Error(`Ya existe un recurso registrado con el nombre "${exist.nombre}". Si deseas incrementar la cantidad, por favor utiliza la opción "Ver Lotes" y agrega un nuevo lote a ese recurso en lugar de duplicarlo.`);
  }

  const { data: newMed, error } = await client
    .from("medicamentos")
    .insert([cleanData as any])
    .select()
    .single();

  if (error) {
    console.error("Error al crear medicamento en PostgreSQL:", error);
    throw new Error(error.message || "No se pudo crear el medicamento.");
  }

  if (cantidadInicial > 0 && newMed?.id) {
    const loteInicial: InsertLoteMedicamento = {
      medicamento_id: newMed.id,
      numero_lote: `LOTE-INI-${newMed.nombre.trim().substring(0, 3).toUpperCase()}`,
      cantidad_inicial: cantidadInicial,
      cantidad_actual: cantidadInicial,
      fecha_vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      fabricante: "Fundación DB",
    };
    await createLote(loteInicial, client);
  }

  return newMed;
}

export async function updateMedicamento(id: string, medicamento: UpdateMedicamento, client: any = supabase) {
  await assertPermission(PERMISSIONS.INVENTARIO_UPDATE);
  
  const cleanData = sanitizeMedicamentoPayload(medicamento);

  const { data, error } = await client
    .from("medicamentos")
    .update(cleanData as any)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error al actualizar medicamento en PostgreSQL:", error);
    throw new Error(error.message || "No se pudo actualizar el medicamento.");
  }

  if (!data || data.length === 0) {
    throw new Error("No se encontró el registro del medicamento a actualizar.");
  }

  return data[0];
}

export async function deleteMedicamento(id: string, client: any = supabase) {
  await assertPermission(PERMISSIONS.INVENTARIO_DELETE);
  const { error } = await client
    .from("medicamentos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar medicamento:", error);
    throw new Error(error.message || "No se pudo eliminar el medicamento.");
  }
}
