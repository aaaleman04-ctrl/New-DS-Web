import { supabase } from "../supabase";

export async function getDashboardFarmacia() {
  const { data, error } = await supabase
    .from("dashboard_farmacia")
    .select("*")
    .single();

  if (error) {
    console.error("Error dashboard farmacia:", error);
    return null;
  }
  return data;
}

export async function getEntregasFarmacia() {
  const { data, error } = await supabase
    .from("v_entregas_farmacia")
    .select("*")
    .order("fecha_entrega", { ascending: false });

  if (error) {
    console.error("Error entregas farmacia:", error);
    return [];
  }
  return data;
}

export async function getRecetasPendientes() {
  const { data: consultas, error: errorConsultas } = await supabase
    .from("consultas")
    .select(`
      id, created_at, tipo_consulta, brigada_id,
      pacientes (codigo, nombres, apellidos, comunidad),
      medicamentos_consulta ( medicamento_id, cantidad, indicaciones, medicamentos (nombre) )
    `)
    .order("created_at", { ascending: false });

  if (errorConsultas) {
    console.error("Error fetching consultas:", errorConsultas);
    return [];
  }

  const { data: entregas, error: errorEntregas } = await supabase
    .from("entregas_farmacia")
    .select("consulta_id");

  if (errorEntregas) {
    console.error("Error fetching entregas:", errorEntregas);
    return [];
  }

  const entregadasSet = new Set(entregas.map(e => e.consulta_id));

  const pendientes = consultas.filter(c => {
    return c.medicamentos_consulta && c.medicamentos_consulta.length > 0 && !entregadasSet.has(c.id);
  });

  return pendientes;
}

export async function getFefoSuggestions(consultaId: string) {
  const { data: medsReq, error: errMeds } = await supabase
    .from("medicamentos_consulta")
    .select("medicamento_id, cantidad, indicaciones, medicamentos(nombre)")
    .eq("consulta_id", consultaId);

  if (errMeds || !medsReq || medsReq.length === 0) {
    throw new Error("No se encontraron medicamentos para esta receta.");
  }

  const suggestions: any[] = [];

  for (const req of medsReq) {
    let requiredQty = req.cantidad;
    const medId = req.medicamento_id;
    const medNombre = (req.medicamentos as any)?.nombre || "Medicamento Desconocido";

    const { data: lotes, error: errLotes } = await supabase
      .from("lotes_medicamentos")
      .select("id, numero_lote, cantidad_actual, fecha_vencimiento")
      .eq("medicamento_id", medId)
      .gt("cantidad_actual", 0)
      .order("fecha_vencimiento", { ascending: true });

    if (errLotes || !lotes) {
      throw new Error(`Error al obtener lotes para el medicamento ${medNombre}`);
    }

    const totalStock = lotes.reduce((acc, l) => acc + l.cantidad_actual, 0);
    
    if (totalStock === 0) {
      suggestions.push({
        medicamento_id: medId,
        medicamento_nombre: medNombre,
        lote_id: "",
        lote_numero: "AGOTADO",
        cantidad_requerida: requiredQty,
        cantidad_sugerida: 0,
        stock_disponible: 0,
        error: "Agotado en inventario"
      });
      continue;
    }

    if (totalStock < requiredQty) {
      // Partially fulfill
      let remainingToSuggest = totalStock;
      for (const lote of lotes) {
        if (remainingToSuggest <= 0) break;
        const takeFromLote = Math.min(lote.cantidad_actual, remainingToSuggest);
        remainingToSuggest -= takeFromLote;

        suggestions.push({
          medicamento_id: medId,
          medicamento_nombre: medNombre,
          lote_id: lote.id,
          lote_numero: lote.numero_lote,
          cantidad_requerida: requiredQty,
          cantidad_sugerida: takeFromLote,
          stock_disponible: lote.cantidad_actual,
          warning: "Entrega parcial por stock insuficiente"
        });
      }
      continue;
    }

    // Fully fulfill
    for (const lote of lotes) {
      if (requiredQty <= 0) break;
      const takeFromLote = Math.min(lote.cantidad_actual, requiredQty);
      requiredQty -= takeFromLote;

      suggestions.push({
        medicamento_id: medId,
        medicamento_nombre: medNombre,
        lote_id: lote.id,
        lote_numero: lote.numero_lote,
        cantidad_requerida: req.cantidad,
        cantidad_sugerida: takeFromLote,
        stock_disponible: lote.cantidad_actual
      });
    }
  }

  return suggestions;
}

export async function registrarEntregaManual(entregas: any[], observaciones: string, consultaId: string, entregadoPor: string) {
  const inserts = entregas.filter(e => e.cantidad_sugerida > 0).map(e => ({
    consulta_id: consultaId,
    medicamento_id: e.medicamento_id,
    lote_id: e.lote_id,
    cantidad: e.cantidad_sugerida,
    entregado_por: entregadoPor,
    observaciones: observaciones || "Entregado en farmacia",
  }));

  if (inserts.length === 0) {
    throw new Error("No hay cantidades válidas para entregar.");
  }

  const { error } = await supabase.from("entregas_farmacia").insert(inserts);

  if (error) {
    throw new Error(`Error al registrar la entrega: ${error.message}`);
  }

  return { success: true, count: inserts.length };
}
