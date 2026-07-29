"use client";

import React, { useState, useEffect } from "react";
import {
  getMedicamentosAction as getMedicamentos,
  getCategoriasInventarioAction as getCategoriasInventario,
  createMedicamentoAction as createMedicamento,
  updateMedicamentoAction as updateMedicamento,
} from "./actions";
import { LotesModal } from "./components/LotesModal";
import { MedicamentoForm } from "./components/MedicamentoForm";
import styles from "@/styles/pages/admin.module.css";

import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { PERMISSIONS } from "@/lib/auth/permissions";

import { generateCleanToken } from "@/lib/coding/codingUtils";

/**
 * Algoritmo generador de código de recurso que garantiza un formato estructurado
 * y limpio sin caracteres ambiguos (evita 0/O, 1/I, 2/Z).
 */
function generarCodigoRecurso(nombre: string, tipo: string): string {
  const prefijo = tipo === "insumo_medico" ? "INS" : (tipo === "material_brigada" ? "MAT" : "MED");
  const nombreSanitizado = nombre.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 8);
  const tokenLimpio = generateCleanToken(4);
  return `${prefijo}-${nombreSanitizado}-${tokenLimpio}`.substring(0, 20);
}

export function InventarioClient() {
  const { can } = usePermissions();
  const [medicamentos, setMedicamentos] = useState<Record<string, unknown>[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedLotes, setSelectedMedLotes] = useState<{ id: string; nombre: string } | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "medicamento" | "insumo_medico" | "material_brigada">("todos");

  // States for Medicamento Form
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [selectedMedForEdit, setSelectedMedForEdit] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMedicamentos = async () => {
    try {
      setIsLoading(true);
      console.log("fetchMedicamentos ejecutado, refrescando lista desde stock_actual");
      const data = await getMedicamentos(filtroTipo);
      setMedicamentos(data);
    } catch (_error) {
      console.error("Error al cargar el inventario");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const data = await getCategoriasInventario();
      setCategorias(data);
    } catch (_error) {
      console.error("Error al cargar categorías");
    }
  };

  useEffect(() => {
    fetchMedicamentos();
    fetchCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipo]);

  const handleOpenMedForm = (med: any = null) => {
    console.log("Medicamento seleccionado:", med);
    setSelectedMedForEdit(med);
    setIsMedModalOpen(true);
  };

  const handleCloseMedForm = () => {
    setIsMedModalOpen(false);
    setSelectedMedForEdit(null);
  };

  const handleSubmitMed = async (data: any, cantidadInicial: number = 0) => {
    try {
      setIsSubmitting(true);
      
      const payload = { ...data };

      if (selectedMedForEdit) {
        // EDICIÓN: Conservar el código almacenado o el ingresado por el usuario. NO REGENERAR.
        payload.codigo = data.codigo || selectedMedForEdit.codigo || generarCodigoRecurso(payload.nombre, payload.tipo_recurso);
      } else {
        // CREACIÓN: Generar únicamente cuando es un nuevo recurso y no se ingresó código manual
        if (!payload.codigo || payload.codigo.trim() === "") {
          payload.codigo = generarCodigoRecurso(payload.nombre, payload.tipo_recurso);
        }
      }

      // Garantizar que la longitud final no exceda los 20 caracteres del campo varchar(20)
      if (payload.codigo && payload.codigo.length > 20) {
        payload.codigo = payload.codigo.substring(0, 20);
      }

      const targetId = selectedMedForEdit ? (selectedMedForEdit.medicamento_id || selectedMedForEdit.id) : null;

      // Depuración temporal requerida por las instrucciones
      console.log("Payload enviado:", payload);
      console.log("ID utilizado:", targetId);
      console.log("Medicamento seleccionado:", selectedMedForEdit);

      if (selectedMedForEdit && targetId) {
        await updateMedicamento(targetId, payload);
      } else {
        await createMedicamento(payload, cantidadInicial);
      }

      handleCloseMedForm();
      fetchMedicamentos();
    } catch (error: any) {
      alert(error.message || "Error al guardar el recurso.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTipoBadge = (tipo?: string) => {
    switch (tipo) {
      case "insumo_medico":
        return <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "0.2rem 0.8rem", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "bold" }}>Insumo Médico</span>;
      case "material_brigada":
        return <span style={{ background: "#f3e8ff", color: "#6b21a8", padding: "0.2rem 0.8rem", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "bold" }}>Material Brigada</span>;
      default:
        return <span style={{ background: "#dcfce7", color: "#166534", padding: "0.2rem 0.8rem", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "bold" }}>Medicamento</span>;
    }
  };

  const getStockBadge = (estado: string) => {
    let bgColor = "var(--bg-light)";
    let color = "var(--text)";
    
    if (estado === "Sin Existencias") {
      bgColor = "var(--danger)";
      color = "white";
    } else if (estado === "Stock Bajo" || estado === "Stock Crítico") {
      bgColor = "#fef08a"; // yellow-200
      color = "#854d0e"; // yellow-800
    } else {
      bgColor = "#dcfce7"; // green-100
      color = "#166534"; // green-800
    }

    return (
      <span
        style={{
          background: bgColor,
          color: color,
          padding: "0.4rem 0.8rem",
          borderRadius: "4px",
          fontWeight: "bold",
          fontSize: "1.2rem",
          display: "inline-block",
        }}
      >
        {estado}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>
      <div className={styles.adminCard}>
        <div className={styles.adminCardHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 className={styles.adminCardTitle}>Gestión Global de Inventario</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1.3rem", marginTop: "0.4rem" }}>
              Control unificado de medicamentos, insumos médicos y material de brigadas
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div style={{ display: "flex", background: "var(--bg-light)", padding: "0.4rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <button 
                className={`${styles.btnSecondary} ${filtroTipo === "todos" ? styles.btnActive : ""}`}
                style={{ padding: "0.6rem 1.2rem", fontSize: "1.2rem", border: "none", background: filtroTipo === "todos" ? "var(--primaryColor)" : "transparent", color: filtroTipo === "todos" ? "white" : "inherit" }}
                onClick={() => setFiltroTipo("todos")}
              >
                Todos
              </button>
              <button 
                className={`${styles.btnSecondary} ${filtroTipo === "medicamento" ? styles.btnActive : ""}`}
                style={{ padding: "0.6rem 1.2rem", fontSize: "1.2rem", border: "none", background: filtroTipo === "medicamento" ? "var(--primaryColor)" : "transparent", color: filtroTipo === "medicamento" ? "white" : "inherit" }}
                onClick={() => setFiltroTipo("medicamento")}
              >
                Fármacos
              </button>
              <button 
                className={`${styles.btnSecondary} ${filtroTipo === "insumo_medico" ? styles.btnActive : ""}`}
                style={{ padding: "0.6rem 1.2rem", fontSize: "1.2rem", border: "none", background: filtroTipo === "insumo_medico" ? "var(--primaryColor)" : "transparent", color: filtroTipo === "insumo_medico" ? "white" : "inherit" }}
                onClick={() => setFiltroTipo("insumo_medico")}
              >
                Insumos
              </button>
              <button 
                className={`${styles.btnSecondary} ${filtroTipo === "material_brigada" ? styles.btnActive : ""}`}
                style={{ padding: "0.6rem 1.2rem", fontSize: "1.2rem", border: "none", background: filtroTipo === "material_brigada" ? "var(--primaryColor)" : "transparent", color: filtroTipo === "material_brigada" ? "white" : "inherit" }}
                onClick={() => setFiltroTipo("material_brigada")}
              >
                Material Brigada
              </button>
            </div>

            {can(PERMISSIONS.INVENTARIO_CREATE) ? (
              <button className={styles.btnPrimary} onClick={() => handleOpenMedForm()}>
                + Nuevo Recurso
              </button>
            ) : (
              <span style={{ fontSize: "1.2rem", padding: "0.4rem 1rem", borderRadius: "1rem", background: "#e2e8f0", color: "#475569", fontWeight: 600 }}>
                Modo Solo Lectura
              </span>
            )}
          </div>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Nombre del Recurso</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Stock Mínimo</th>
                <th>Stock Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>
                    Cargando inventario...
                  </td>
                </tr>
              ) : medicamentos.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No hay recursos registrados en esta categoría de inventario.
                  </td>
                </tr>
              ) : (
                medicamentos.map((med: any) => (
                  <tr key={med.medicamento_id || med.id}>
                    <td>{getTipoBadge(med.tipo_recurso)}</td>
                    <td style={{ fontWeight: "bold", color: "var(--primaryColor)" }}>{med.nombre}</td>
                    <td style={{ maxWidth: "200px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={med.descripcion}>{med.descripcion || "-"}</td>
                    <td>{med.unidad_medida || "-"}</td>
                    <td>{med.stock_minimo}</td>
                    <td style={{ fontWeight: "bold", fontSize: "1.4rem" }}>{med.stock_total || 0}</td>
                    <td>{getStockBadge(med.estado_stock || "Sin Existencias")}</td>
                    <td>
                        <div className={styles.tableActions}>
                          {can(PERMISSIONS.INVENTARIO_UPDATE) && (
                            <button 
                              className={styles.btnSecondary}
                              style={{ fontSize: "1.3rem" }}
                              onClick={() => handleOpenMedForm(med)}
                            >
                              Editar
                            </button>
                          )}
                          <button 
                            className={styles.btnSecondary}
                            onClick={() => setSelectedMedLotes({ id: med.medicamento_id || med.id, nombre: med.nombre })}
                          >
                            Ver Lotes
                          </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMedLotes && (
        <LotesModal
          isOpen={true}
          onClose={() => setSelectedMedLotes(null)}
          medicamentoId={selectedMedLotes.id}
          medicamentoNombre={selectedMedLotes.nombre}
          onLotesChanged={fetchMedicamentos}
        />
      )}

      {isMedModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseMedForm}>
          <div 
            className={styles.modal} 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "640px", width: "95%" }}
          >
            <div className={styles.modalHeader}>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "700" }}>
                {selectedMedForEdit ? "Editar medicamento" : "Nuevo Medicamento o Insumo"}
              </h3>
              <button className={styles.modalClose} onClick={handleCloseMedForm} title="Cerrar" aria-label="Cerrar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div style={{ padding: "2.4rem" }}>
              <MedicamentoForm 
                initialData={selectedMedForEdit} 
                categorias={categorias}
                onSubmit={handleSubmitMed}
                onCancel={handleCloseMedForm}
                isLoading={isSubmitting} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
