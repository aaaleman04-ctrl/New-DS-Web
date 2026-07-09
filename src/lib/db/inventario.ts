import { supabase } from "../supabase";
import { Database } from "../database.types";

export type LoteMedicamento = Database["public"]["Tables"]["lotes_medicamentos"]["Row"];
export type InsertLoteMedicamento = Database["public"]["Tables"]["lotes_medicamentos"]["Insert"];
export type UpdateLoteMedicamento = Database["public"]["Tables"]["lotes_medicamentos"]["Update"];

export async function getLotesByMedicamento(medicamentoId: string) {
  const { data, error } = await supabase
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

export async function getMedicamentos() {
  const { data, error } = await supabase
    .from("stock_actual")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error al obtener medicamentos:", error);
    throw new Error("No se pudieron cargar los medicamentos.");
  }
  return data;
}

export async function createLote(lote: InsertLoteMedicamento) {
  const { data, error } = await supabase
    .from("lotes_medicamentos")
    .insert([{ ...lote, cantidad_inicial: lote.cantidad_actual }])
    .select()
    .single();

  if (error) {
    console.error("Error al crear lote:", error);
    throw new Error("No se pudo crear el lote.");
  }
  return data;
}

export async function updateLote(id: string, lote: UpdateLoteMedicamento) {
  const { data, error } = await supabase
    .from("lotes_medicamentos")
    .update(lote)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar lote:", error);
    throw new Error("No se pudo actualizar el lote.");
  }
  return data;
}

export async function deleteLote(id: string) {
  const { error } = await supabase
    .from("lotes_medicamentos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar lote:", error);
    throw new Error("No se pudo eliminar el lote.");
  }
}

export type InsertMedicamento = Database["public"]["Tables"]["medicamentos"]["Insert"];
export type UpdateMedicamento = Database["public"]["Tables"]["medicamentos"]["Update"];

export async function createMedicamento(medicamento: InsertMedicamento) {
  const { data, error } = await supabase
    .from("medicamentos")
    .insert(medicamento)
    .select()
    .single();

  if (error) {
    console.error("Error al crear medicamento:", error);
    throw new Error(error.message || "No se pudo crear el medicamento.");
  }
  return data;
}

export async function updateMedicamento(id: string, medicamento: UpdateMedicamento) {
  const { data, error } = await supabase
    .from("medicamentos")
    .update(medicamento)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar medicamento:", error);
    throw new Error(error.message || "No se pudo actualizar el medicamento.");
  }
  return data;
}

export async function deleteMedicamento(id: string) {
  const { error } = await supabase
    .from("medicamentos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar medicamento:", error);
    throw new Error(error.message || "No se pudo eliminar el medicamento.");
  }
}
