"use client";

import React, { useState, useTransition } from "react";
import { z } from "zod";
import styles from "@/styles/pages/admin.module.css";

// SVG Icons (Sin emojis)
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinIcon}>
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2 a 10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

export type GastoRow = {
  id: string;
  brigada_id: string;
  categoria: "medicamentos" | "alimentacion" | "publicidad" | "otros";
  descripcion: string;
  monto: number;
  fecha_gasto: string; // ISO String YYYY-MM-DD
  created_at?: string;
  updated_at?: string;
};

type GastosTableProps = {
  brigadaId: string;
  gastos: GastoRow[];
  onSaveGasto: (gasto: Omit<GastoRow, "id"> & { id?: string }, isDelete?: boolean) => Promise<void>;
  isReadOnly?: boolean;
};

// Esquema Zod 4 de Validación Estricta (Capítulo 15 - Análisis y Diseño de Datos)
const gastoSchema = z.object({
  categoria: z.enum(["medicamentos", "alimentacion", "publicidad", "otros"], {
    message: "Prueba de valores válidos: Selecciona una categoría válida.",
  }),
  descripcion: z
    .string()
    .trim()
    .min(3, "Prueba de presencia: El concepto o descripción debe tener al menos 3 caracteres.")
    .max(200, "Prueba de longitud: La descripción no debe exceder 200 caracteres."),
  monto: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z
      .number({ message: "Prueba de clase: El monto del gasto debe ser numérico." })
      .min(0.01, "Prueba de sensatez: El monto del gasto debe ser un valor positivo mayor a L 0.00.")
  ),
  fecha_gasto: z
    .string()
    .min(1, "Prueba de presencia: La fecha de registro del gasto es obligatoria."),
});

type GastoFormData = z.infer<typeof gastoSchema>;

const CATEGORIA_LABELS: Record<string, string> = {
  medicamentos: "Medicamentos / Clínica",
  alimentacion: "Alimentación / Viáticos",
  publicidad: "Publicidad / Impresión",
  otros: "Otros / Varios",
};

export default function GastosTable({
  brigadaId,
  gastos,
  onSaveGasto,
  isReadOnly = false,
}: GastosTableProps) {
  const [isPending, startTransition] = useTransition();
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingGasto, setEditingGasto] = useState<GastoRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GastoRow | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);

  const [formData, setFormData] = useState<Partial<GastoFormData>>({
    categoria: "otros",
    descripcion: "",
    monto: 0,
    fecha_gasto: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof GastoFormData, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name as keyof GastoFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (generalError) setGeneralError(null);
  };

  const openCreate = () => {
    setFormData({
      categoria: "otros",
      descripcion: "",
      monto: 0,
      fecha_gasto: new Date().toISOString().split("T")[0],
    });
    setFormErrors({});
    setGeneralError(null);
    setIsDirty(false);
    setEditingGasto(null);
    setModalMode("create");
  };

  const openEdit = (gasto: GastoRow) => {
    setFormData({
      categoria: gasto.categoria,
      descripcion: gasto.descripcion,
      monto: gasto.monto,
      fecha_gasto: gasto.fecha_gasto.split("T")[0],
    });
    setFormErrors({});
    setGeneralError(null);
    setIsDirty(false);
    setEditingGasto(gasto);
    setModalMode("edit");
  };

  const handleRequestClose = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      setModalMode(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-HN", {
      style: "currency",
      currency: "HNL",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const utcDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return utcDate.toLocaleDateString("es-HN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // Validación estricta con Zod 4
    const result = gastoSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof GastoFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as keyof GastoFormData] = issue.message;
        }
      });
      setFormErrors(errors);
      setGeneralError("Existen errores en los datos del gasto. Por favor revísalos a continuación.");
      return;
    }

    const data = result.data;
    startTransition(async () => {
      const payload: Omit<GastoRow, "id"> & { id?: string } = {
        brigada_id: brigadaId,
        categoria: data.categoria,
        descripcion: data.descripcion,
        monto: data.monto,
        fecha_gasto: new Date(data.fecha_gasto).toISOString(),
      };
      if (editingGasto) {
        payload.id = editingGasto.id;
      }
      await onSaveGasto(payload);
      setIsDirty(false);
      setModalMode(null);
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await onSaveGasto(deleteTarget, true);
      setDeleteTarget(null);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ fontSize: "1.6rem", fontWeight: "700" }}>Gastos Registrados ({gastos.length})</h3>
        {!isReadOnly && (
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={openCreate}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}
          >
            <PlusIcon /> Registrar Nuevo Gasto
          </button>
        )}
      </div>

      <div className={styles.tableContainer}>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Descripción / Concepto</th>
                <th>Monto (HNL)</th>
                <th>Fecha de Registro</th>
                {!isReadOnly && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {gastos.length === 0 ? (
                <tr>
                  <td colSpan={isReadOnly ? 4 : 5} className={styles.emptyCell}>
                    Aún no se han registrado gastos presupuestarios para esta brigada médica.
                  </td>
                </tr>
              ) : (
                gastos.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <span
                        style={{
                          background: "var(--bg-light)",
                          border: "1px solid var(--border-color)",
                          padding: "0.3rem 0.8rem",
                          borderRadius: "12px",
                          fontSize: "1.1rem",
                          fontWeight: "700",
                        }}
                      >
                        {CATEGORIA_LABELS[g.categoria] || g.categoria}
                      </span>
                    </td>
                    <td>{g.descripcion}</td>
                    <td style={{ fontWeight: "700", color: "#dc2626" }}>{formatCurrency(g.monto)}</td>
                    <td>{formatDate(g.fecha_gasto)}</td>
                    {!isReadOnly && (
                      <td>
                        <div className={styles.tableActions}>
                          <button
                            type="button"
                            className={styles.linkBtn}
                            onClick={() => openEdit(g)}
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                          >
                            <EditIcon /> Editar
                          </button>
                          <button
                            type="button"
                            className={styles.linkBtnDanger}
                            onClick={() => setDeleteTarget(g)}
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                          >
                            <TrashIcon /> Eliminar
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro / Edición de Gasto (Diseño de Columna Única Vertical) */}
      {modalMode && (
        <div className={styles.modalOverlay} onClick={handleRequestClose}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{ maxWidth: "520px", width: "95%" }}
          >
            <div className={styles.modalHeader}>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "700" }}>
                {modalMode === "create" ? "Registrar Nuevo Gasto" : "Editar Registro de Gasto"}
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={handleRequestClose}
                title="Cerrar modal"
                aria-label="Cerrar"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className={styles.adminFormSingleColumn}>
              {/* Banner de errores de validación */}
              {generalError && (
                <div className={styles.formErrorBanner}>
                  <AlertCircleIcon />
                  <span>{generalError}</span>
                </div>
              )}

              {/* Categoría del Gasto */}
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>
                  Categoría del Gasto <strong className={styles.requiredStar}>* (Requerido)</strong>
                </span>
                <select name="categoria" value={formData.categoria} onChange={handleInputChange} disabled={isPending} required>
                  <option value="medicamentos">{CATEGORIA_LABELS.medicamentos}</option>
                  <option value="alimentacion">{CATEGORIA_LABELS.alimentacion}</option>
                  <option value="publicidad">{CATEGORIA_LABELS.publicidad}</option>
                  <option value="otros">{CATEGORIA_LABELS.otros}</option>
                </select>
                {formErrors.categoria && (
                  <span className={styles.formFieldError}>
                    <AlertCircleIcon /> {formErrors.categoria}
                  </span>
                )}
              </label>

              {/* Descripción / Concepto del Gasto */}
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>
                  Descripción / Concepto del Gasto <strong className={styles.requiredStar}>* (Requerido)</strong>
                </span>
                <input
                  name="descripcion"
                  value={formData.descripcion || ""}
                  onChange={handleInputChange}
                  placeholder="Ej. Adquisición de analgésicos y material de curación"
                  maxLength={200}
                  disabled={isPending}
                  required
                />
                {formErrors.descripcion && (
                  <span className={styles.formFieldError}>
                    <AlertCircleIcon /> {formErrors.descripcion}
                  </span>
                )}
              </label>

              {/* Monto en Lempiras */}
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>
                  Monto Ejecutado (HNL) <strong className={styles.requiredStar}>* (Requerido)</strong>
                </span>
                <input
                  name="monto"
                  value={formData.monto ?? ""}
                  onChange={handleInputChange}
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ej. 3500.00"
                  disabled={isPending}
                  required
                />
                {formErrors.monto && (
                  <span className={styles.formFieldError}>
                    <AlertCircleIcon /> {formErrors.monto}
                  </span>
                )}
              </label>

              {/* Fecha de Ejecución del Gasto */}
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>
                  Fecha de Ejecución del Gasto <strong className={styles.requiredStar}>* (Requerido)</strong>
                </span>
                <input
                  name="fecha_gasto"
                  value={formData.fecha_gasto || ""}
                  onChange={handleInputChange}
                  type="date"
                  disabled={isPending}
                  required
                />
                {formErrors.fecha_gasto && (
                  <span className={styles.formFieldError}>
                    <AlertCircleIcon /> {formErrors.fecha_gasto}
                  </span>
                )}
              </label>

              {/* Botones de acción */}
              <div className={styles.modalActions} style={{ marginTop: "1.6rem" }}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={handleRequestClose}
                  disabled={isPending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={isPending}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem" }}
                >
                  {isPending && <SpinnerIcon />}
                  <span>{isPending ? "Guardando Registro..." : "Guardar Gasto"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Advertencia HCI (Descarte de Cambios) */}
      {showDiscardModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDiscardModal(false)}>
          <div
            className={`${styles.modal} ${styles.modalSm}`}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="discard-gasto-title"
          >
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#dc2626" }}>
                <AlertTriangleIcon />
                <h3 id="discard-gasto-title">¿Descartar Cambios no Guardados?</h3>
              </div>
            </div>
            <p className={styles.confirmText}>
              Has modificado información del gasto. Si cierras la ventana ahora, los datos introducidos se perderán.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowDiscardModal(false)}
              >
                Continuar Editando
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={() => {
                  setShowDiscardModal(false);
                  setIsDirty(false);
                  setModalMode(null);
                }}
              >
                Sí, Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación HCI para Eliminación */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => !isPending && setDeleteTarget(null)}>
          <div
            className={`${styles.modal} ${styles.modalSm}`}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="delete-gasto-title"
          >
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#dc2626" }}>
                <AlertTriangleIcon />
                <h3 id="delete-gasto-title">¿Eliminar Registro de Gasto?</h3>
              </div>
            </div>
            <p className={styles.confirmText}>
              ¿Estás seguro de que deseas eliminar permanentemente el gasto por{" "}
              <strong>{formatCurrency(deleteTarget.monto)}</strong> (Concepto: {deleteTarget.descripcion})? Esta acción recalculará automáticamente el presupuesto restante de la brigada.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={confirmDelete}
                disabled={isPending}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem" }}
              >
                {isPending && <SpinnerIcon />}
                <span>{isPending ? "Eliminando..." : "Sí, Eliminar Gasto"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
