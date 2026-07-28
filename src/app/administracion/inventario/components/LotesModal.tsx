"use client";

import React, { useState, useEffect } from "react";
import { LoteMedicamento, getLotesByMedicamento, createLote, updateLote, deleteLote } from "@/lib/db/inventario";
import { LoteForm, LoteFormValues } from "./LoteForm";
import styles from "@/styles/pages/admin.module.css";

interface LotesModalProps {
  medicamentoId: string;
  medicamentoNombre: string;
  isOpen: boolean;
  onClose: () => void;
  onLotesChanged?: () => void;
}

export function LotesModal({ medicamentoId, medicamentoNombre, isOpen, onClose, onLotesChanged }: LotesModalProps) {
  const [lotes, setLotes] = useState<LoteMedicamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLote, setSelectedLote] = useState<LoteMedicamento | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLotes = async () => {
    try {
      setIsLoading(true);
      const data = await getLotesByMedicamento(medicamentoId);
      setLotes(data);
    } catch (_error) {
      console.error("Error al cargar lotes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (isOpen && medicamentoId && mounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchLotes();
    }
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, medicamentoId]);

  if (!isOpen) return null;

  const handleOpenForm = (lote?: LoteMedicamento) => {
    setSelectedLote(lote || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedLote(null);
    setIsFormOpen(false);
  };

  const onSubmitForm = async (data: LoteFormValues) => {
    try {
      setIsSubmitting(true);
      if (selectedLote) {
        await updateLote(selectedLote.id, {
          numero_lote: data.numero_lote,
          fabricante: data.fabricante,
          fecha_vencimiento: data.fecha_vencimiento,
          cantidad_actual: data.cantidad_actual,
        });
        alert("Lote actualizado exitosamente");
      } else {
        await createLote({
          medicamento_id: medicamentoId,
          numero_lote: data.numero_lote,
          fabricante: data.fabricante,
          fecha_vencimiento: data.fecha_vencimiento,
          cantidad_actual: data.cantidad_actual,
          cantidad_inicial: data.cantidad_actual,
        });
        alert("Lote creado exitosamente");
      }
      handleCloseForm();
      fetchLotes();
      if (onLotesChanged) onLotesChanged();
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error al guardar el lote");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<LoteMedicamento | null>(null);

  const handleDelete = (lote: LoteMedicamento) => {
    if (lote.cantidad_actual !== lote.cantidad_inicial) {
      alert("No se puede eliminar un lote que ya ha sido utilizado (cantidad actual difiere de inicial).");
      return;
    }
    setDeleteTarget(lote);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLote(deleteTarget.id);
      setDeleteTarget(null);
      fetchLotes();
      if (onLotesChanged) onLotesChanged();
    } catch (_error) {
      alert("Error al eliminar el lote");
    }
  };

  const getStatusBadge = (lote: LoteMedicamento) => {
    if (lote.cantidad_actual === 0) {
      return <span style={{ background: "#e0f2fe", color: "#075985", padding: "0.2rem 0.6rem", borderRadius: "8px", fontSize: "0.9em" }}>🔵 Sin existencias</span>;
    }
    
    const hoy = new Date();
    const vencimiento = new Date(lote.fecha_vencimiento);
    const diasVencimiento = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
    
    if (diasVencimiento < 0) {
      return <span style={{ background: "var(--danger)", color: "white", padding: "0.2rem 0.6rem", borderRadius: "8px", fontSize: "0.9em" }}>🔴 Vencido</span>;
    }
    if (diasVencimiento <= 30) {
      return <span style={{ background: "#fef08a", color: "#854d0e", padding: "0.2rem 0.6rem", borderRadius: "8px", fontSize: "0.9em" }}>🟡 Próximo a vencer</span>;
    }
    return <span style={{ background: "#dcfce7", color: "#166534", padding: "0.2rem 0.6rem", borderRadius: "8px", fontSize: "0.9em" }}>🟢 Normal</span>;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('es-ES').format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={() => onClose()}>
      <div 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "800px", width: "90%", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className={styles.modalHeader}>
          <h3>Lotes - {medicamentoNombre}</h3>
          <button className={styles.modalClose} onClick={onClose}>&times;</button>
        </div>

        <div style={{ padding: "2rem" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "1.4rem" }}>
            Gestiona los lotes para este medicamento. Política FEFO.
          </p>

          {!isFormOpen ? (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.6rem" }}>
                <button className={styles.btnPrimary} onClick={() => handleOpenForm()}>
                  + Agregar Lote
                </button>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Lote</th>
                      <th>Fabricante</th>
                      <th>Vencimiento</th>
                      <th>Cantidad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                          Cargando lotes...
                        </td>
                      </tr>
                    ) : lotes.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                          No hay lotes registrados para este medicamento.
                        </td>
                      </tr>
                    ) : (
                      lotes.map((lote) => (
                        <tr key={lote.id}>
                          <td style={{ fontWeight: "bold" }}>{lote.numero_lote}</td>
                          <td>{lote.fabricante || "-"}</td>
                          <td>{formatDate(lote.fecha_vencimiento)}</td>
                          <td style={{ fontWeight: "bold", fontSize: "1.4rem" }}>{lote.cantidad_actual}</td>
                          <td>{getStatusBadge(lote)}</td>
                          <td>
                            <div className={styles.tableActions}>
                              <button className={styles.linkBtn} onClick={() => handleOpenForm(lote)}>
                                Editar
                              </button>
                              <button className={styles.linkBtnDanger} onClick={() => handleDelete(lote)}>
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ marginTop: "1rem", padding: "2rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.6rem" }}>{selectedLote ? "Editar Lote" : "Nuevo Lote"}</h3>
                <button className={styles.btnSecondary} onClick={handleCloseForm}>Volver a Lotes</button>
              </div>
              <LoteForm 
                initialData={selectedLote} 
                onSubmit={onSubmitForm} 
                isLoading={isSubmitting} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal Confirmación de Eliminación de Lote */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => setDeleteTarget(null)}>
          <div className={`${styles.modal} ${styles.modalSm}`} onClick={(e) => e.stopPropagation()} role="alertdialog">
            <div className={styles.modalHeader}>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#dc2626" }}>¿Eliminar Lote?</h3>
            </div>
            <p style={{ padding: "1.6rem 0", color: "var(--text-color)", fontSize: "1.4rem", lineHeight: "1.6" }}>
              ¿Estás seguro de que deseas eliminar el lote <strong>{deleteTarget.numero_lote}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnSecondary} onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button type="button" className={styles.btnDanger} onClick={confirmDelete}>
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

