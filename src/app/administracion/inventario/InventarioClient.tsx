"use client";

import React, { useState, useEffect } from "react";
import { getMedicamentos, createMedicamento, updateMedicamento } from "@/lib/db/inventario";
import { LotesModal } from "./components/LotesModal";
import { MedicamentoForm } from "./components/MedicamentoForm";
import styles from "@/styles/pages/admin.module.css";

export function InventarioClient() {
  const [medicamentos, setMedicamentos] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedLotes, setSelectedMedLotes] = useState<{ id: string; nombre: string } | null>(null);
  
  // States for Medicamento Form
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [selectedMedForEdit, setSelectedMedForEdit] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMedicamentos = async () => {
    try {
      setIsLoading(true);
      const data = await getMedicamentos();
      setMedicamentos(data);
    } catch (_error) {
      console.error("Error al cargar el inventario");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (mounted) fetchMedicamentos();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenMedForm = (med: any = null) => {
    setSelectedMedForEdit(med);
    setIsMedModalOpen(true);
  };

  const handleCloseMedForm = () => {
    setIsMedModalOpen(false);
    setSelectedMedForEdit(null);
  };

  const handleSubmitMed = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const payload = { ...data };
      if (!payload.codigo) {
        payload.codigo = payload.nombre.trim().toUpperCase().replace(/\s+/g, "_") + "_" + Math.floor(Math.random() * 1000);
      }

      if (selectedMedForEdit) {
        await updateMedicamento(selectedMedForEdit.medicamento_id || selectedMedForEdit.id, payload);
      } else {
        await createMedicamento(payload);
      }
      handleCloseMedForm();
      fetchMedicamentos();
    } catch (error: any) {
      alert(error.message || "Error al guardar el medicamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockBadge = (estado: string) => {
    let bgColor = "var(--bg-light)";
    let color = "var(--text)";
    
    if (estado === "Sin Existencias") {
      bgColor = "var(--danger)";
      color = "white";
    } else if (estado === "Stock Bajo") {
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
          padding: "0.2rem 0.8rem",
          borderRadius: "12px",
          fontSize: "1.1rem",
          fontWeight: "bold",
        }}
      >
        {estado}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div>
            <h3>Listado de Medicamentos</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "1.4rem", marginTop: "0.4rem" }}>
              Inventario general consolidado. Administra los lotes de cada medicamento para actualizar el stock real.
            </p>
          </div>
          <div>
            <button className={styles.btnPrimary} onClick={() => handleOpenMedForm()}>
              + Nuevo Medicamento
            </button>
          </div>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Medicamento</th>
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
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                    Cargando inventario...
                  </td>
                </tr>
              ) : medicamentos.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No hay medicamentos registrados en el inventario.
                  </td>
                </tr>
              ) : (
                medicamentos.map((med: any) => (
                  <tr key={med.medicamento_id || med.id}>
                    <td style={{ fontWeight: "bold", color: "var(--primaryColor)" }}>{med.nombre}</td>
                    <td style={{ maxWidth: "200px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={med.descripcion}>{med.descripcion || "-"}</td>
                    <td>{med.unidad_medida || "-"}</td>
                    <td>{med.stock_minimo}</td>
                    <td style={{ fontWeight: "bold", fontSize: "1.4rem" }}>{med.stock_total || 0}</td>
                    <td>{getStockBadge(med.estado_stock || "Sin Existencias")}</td>
                    <td>
                        <div className={styles.tableActions}>
                          <button 
                            className={styles.btnSecondary}
                            style={{ fontSize: "1.3rem" }}
                            onClick={() => handleOpenMedForm(med)}
                          >
                            Editar
                          </button>
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
                {selectedMedForEdit ? "Editar Medicamento o Insumo" : "Nuevo Medicamento o Insumo"}
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
