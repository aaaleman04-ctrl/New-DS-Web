"use client";

import React, { useState, useTransition } from "react";
import { z } from "zod";
import styles from "@/styles/pages/admin.module.css";

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

// Form schema using Zod
const gastoSchema = z.object({
  categoria: z.enum(["medicamentos", "alimentacion", "publicidad", "otros"]),
  descripcion: z
    .string()
    .min(3, "La descripción debe tener al menos 3 caracteres")
    .max(200, "La descripción no debe exceder 200 caracteres"),
  monto: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().min(0.01, "El monto debe ser mayor a 0")
  ),
  fecha_gasto: z.string().min(1, "La fecha es obligatoria"),
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

  // State-based form fields
  const [formData, setFormData] = useState<Partial<GastoFormData>>({
    categoria: "otros",
    descripcion: "",
    monto: 0,
    fecha_gasto: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof GastoFormData, string>>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error
    if (formErrors[name as keyof GastoFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const openCreate = () => {
    setFormData({
      categoria: "otros",
      descripcion: "",
      monto: 0,
      fecha_gasto: new Date().toISOString().split("T")[0],
    });
    setFormErrors({});
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
    setEditingGasto(gasto);
    setModalMode("edit");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-HN", {
      style: "currency",
      currency: "HNL",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    // Avoid timezone offset shift
    const utcDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return utcDate.toLocaleDateString("es-HN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Zod validation check
    const result = gastoSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof GastoFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as keyof GastoFormData] = issue.message;
        }
      });
      setFormErrors(errors);
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
        <h3 style={{ fontSize: "1.6rem", fontWeight: "bold" }}>Gastos Registrados ({gastos.length})</h3>
        {!isReadOnly && (
          <button type="button" className={styles.btnPrimary} onClick={openCreate}>
            + Registrar Gasto
          </button>
        )}
      </div>

      <div className={styles.tableContainer}>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Fecha</th>
                {!isReadOnly && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {gastos.length === 0 ? (
                <tr>
                  <td colSpan={isReadOnly ? 4 : 5} className={styles.emptyCell}>
                    Aún no se han registrado gastos para esta brigada.
                  </td>
                </tr>
              ) : (
                gastos.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <span
                        style={{
                          background: "var(--bg-light)",
                          padding: "0.2rem 0.8rem",
                          borderRadius: "12px",
                          fontSize: "1.1rem",
                          fontWeight: "bold",
                        }}
                      >
                        {CATEGORIA_LABELS[g.categoria] || g.categoria}
                      </span>
                    </td>
                    <td>{g.descripcion}</td>
                    <td style={{ fontWeight: "bold", color: "var(--danger)" }}>{formatCurrency(g.monto)}</td>
                    <td>{formatDate(g.fecha_gasto)}</td>
                    {!isReadOnly && (
                      <td>
                        <div className={styles.tableActions}>
                          <button type="button" className={styles.linkBtn} onClick={() => openEdit(g)}>
                            Editar
                          </button>
                          <button
                            type="button"
                            className={styles.linkBtnDanger}
                            onClick={() => setDeleteTarget(g)}
                          >
                            Eliminar
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

      {/* Form modal */}
      {modalMode && (
        <div className={styles.modalOverlay} onClick={() => !isPending && setModalMode(null)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{ maxWidth: "450px", width: "90%" }}
          >
            <div className={styles.modalHeader}>
              <h3>{modalMode === "create" ? "Registrar Gasto" : "Editar Gasto"}</h3>
              <button type="button" className={styles.modalClose} onClick={() => setModalMode(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className={styles.adminForm}>
              {/* Categoría */}
              <label className={styles.formField}>
                <span>Categoría *</span>
                <select name="categoria" value={formData.categoria} onChange={handleInputChange} disabled={isPending}>
                  <option value="medicamentos">{CATEGORIA_LABELS.medicamentos}</option>
                  <option value="alimentacion">{CATEGORIA_LABELS.alimentacion}</option>
                  <option value="publicidad">{CATEGORIA_LABELS.publicidad}</option>
                  <option value="otros">{CATEGORIA_LABELS.otros}</option>
                </select>
                {formErrors.categoria && <span className={styles.formFieldError}>{formErrors.categoria}</span>}
              </label>

              {/* Descripción */}
              <label className={styles.formField}>
                <span>Descripción / Concepto *</span>
                <input
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Ej: Compra de amoxicilina"
                  disabled={isPending}
                  required
                />
                {formErrors.descripcion && <span className={styles.formFieldError}>{formErrors.descripcion}</span>}
              </label>

              <div className={styles.formRow}>
                {/* Monto */}
                <label className={styles.formField}>
                  <span>Monto (HNL) *</span>
                  <input
                    name="monto"
                    value={formData.monto ?? ""}
                    onChange={handleInputChange}
                    type="number"
                    step="0.01"
                    placeholder="Ej: 1500"
                    disabled={isPending}
                    required
                  />
                  {formErrors.monto && <span className={styles.formFieldError}>{formErrors.monto}</span>}
                </label>

                {/* Fecha */}
                <label className={styles.formField}>
                  <span>Fecha de Gasto *</span>
                  <input
                    name="fecha_gasto"
                    value={formData.fecha_gasto}
                    onChange={handleInputChange}
                    type="date"
                    disabled={isPending}
                    required
                  />
                  {formErrors.fecha_gasto && <span className={styles.formFieldError}>{formErrors.fecha_gasto}</span>}
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setModalMode(null)}
                  disabled={isPending}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={isPending}>
                  {isPending ? "Guardando..." : "Guardar Gasto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => !isPending && setDeleteTarget(null)}>
          <div
            className={`${styles.modal} ${styles.modalSm}`}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="delete-gasto-title"
          >
            <div className={styles.modalHeader}>
              <h3 id="delete-gasto-title">¿Eliminar gasto?</h3>
            </div>
            <p className={styles.confirmText}>
              ¿Estás seguro de que deseas eliminar el gasto por{" "}
              <strong>{formatCurrency(deleteTarget.monto)}</strong> (Concepto: {deleteTarget.descripcion})? Esta
              acción no se puede deshacer.
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
              >
                {isPending ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
