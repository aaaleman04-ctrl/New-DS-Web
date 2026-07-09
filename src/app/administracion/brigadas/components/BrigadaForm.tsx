"use client";

import React, { useState } from "react";
import { z } from "zod";
import type { Brigada, EstadoBrigada } from "@/lib/db/brigadas";
import styles from "@/styles/pages/admin.module.css";

// Define Zod schema matching database validation requirements
const brigadaSchema = z.object({
  codigo: z
    .string()
    .min(3, "El código debe tener al menos 3 caracteres")
    .max(20, "El código no debe exceder 20 caracteres")
    .regex(/^[A-Za-z0-9-]+$/, "El código solo puede contener letras, números y guiones"),
  nombre: z
    .string()
    .min(5, "El nombre debe tener al menos 5 caracteres")
    .max(100, "El nombre no debe exceder 100 caracteres"),
  lugar: z
    .string()
    .min(1, "El lugar es obligatorio")
    .max(150, "El lugar no debe exceder 150 caracteres"),
  municipio: z.string().min(1, "El municipio es obligatorio").max(100, "Máximo 100 caracteres"),
  departamento: z.string().min(1, "El departamento es obligatorio").max(100, "Máximo 100 caracteres"),
  fecha_brigada: z.string().min(1, "La fecha y hora son obligatorias"),
  fecha_inicio_inscripcion: z.string().min(1, "La fecha de inicio de inscripción es obligatoria"),
  fecha_fin_inscripcion: z.string().min(1, "La fecha de fin de inscripción es obligatoria"),
  descripcion: z
    .string()
    .max(500, "La descripción no debe exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
  estado: z.enum([
    "inscripciones_abiertas",
    "inscripciones_cerradas",
    "finalizada",
    "cancelada",
  ]),
  presupuesto_estimado: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().min(0, "El presupuesto debe ser mayor o igual a 0")
  ),
  capacidad_voluntarios: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().min(1, "La capacidad debe ser mayor a 0").nullable().optional()
  ),
  imagen_banner: z.string().optional().nullable(),
  latitud: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().nullable().optional()
  ),
  longitud: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().nullable().optional()
  ),
});

type BrigadaFormData = z.infer<typeof brigadaSchema>;

type BrigadaFormProps = {
  mode: "create" | "edit";
  brigada?: Brigada;
  initialBudget?: number;
  onClose: () => void;
  onSubmit: (data: BrigadaFormData) => Promise<void>;
  isSubmitting?: boolean;
};

const ESTADO_LABELS: Record<EstadoBrigada, string> = {
  inscripciones_abiertas: "Inscripciones Abiertas",
  inscripciones_cerradas: "Inscripciones Cerradas",
  finalizada: "Finalizada (Lectura)",
  cancelada: "Cancelada",
};

export default function BrigadaForm({
  mode,
  brigada,
  initialBudget = 0,
  onClose,
  onSubmit,
  isSubmitting = false,
}: BrigadaFormProps) {
  // Map datetime-local value (YYYY-MM-DDThh:mm)
  const formatDatetimeLocal = (isoString?: string | null) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const [formData, setFormData] = useState<Partial<BrigadaFormData>>({
    codigo: brigada?.codigo ?? "",
    nombre: brigada?.nombre ?? "",
    lugar: brigada?.lugar ?? "",
    municipio: brigada?.municipio ?? "",
    departamento: brigada?.departamento ?? "",
    fecha_brigada: formatDatetimeLocal(brigada?.fecha_brigada),
    fecha_inicio_inscripcion: formatDatetimeLocal(brigada?.fecha_inicio_inscripcion),
    fecha_fin_inscripcion: formatDatetimeLocal(brigada?.fecha_fin_inscripcion),
    descripcion: brigada?.descripcion ?? "",
    estado: brigada?.estado ?? "inscripciones_cerradas",
    presupuesto_estimado: initialBudget,
    capacidad_voluntarios: brigada?.capacidad_voluntarios ?? null,
    imagen_banner: brigada?.imagen_banner ?? "",
    latitud: brigada?.latitud ?? null,
    longitud: brigada?.longitud ?? null,
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof BrigadaFormData, string>>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error
    if (formErrors[name as keyof BrigadaFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Zod validation
    const result = brigadaSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof BrigadaFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as keyof BrigadaFormData] = issue.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    const data = result.data;
    const formattedData = {
      ...data,
      fecha_brigada: new Date(data.fecha_brigada).toISOString(),
      fecha_inicio_inscripcion: new Date(data.fecha_inicio_inscripcion).toISOString(),
      fecha_fin_inscripcion: new Date(data.fecha_fin_inscripcion).toISOString(),
    };
    onSubmit(formattedData);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: "600px", width: "90%" }}
      >
        <div className={styles.modalHeader}>
          <h3>{mode === "create" ? "Nueva Brigada" : "Editar Brigada"}</h3>
          <button type="button" className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className={styles.adminForm}>
          <div className={styles.formRow}>
            {/* Código (Deshabilitado en modo edición) */}
            <label className={styles.formField}>
              <span>Código de Brigada *</span>
              <input
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                placeholder="Ej: B-024"
                disabled={mode === "edit"}
                style={mode === "edit" ? { backgroundColor: "var(--bg-light)", cursor: "not-allowed" } : {}}
                required
              />
              {formErrors.codigo && <span className={styles.formFieldError}>{formErrors.codigo}</span>}
            </label>

            {/* Nombre */}
            <label className={styles.formField}>
              <span>Nombre de Brigada *</span>
              <input
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Brigada El Hatillo"
                required
              />
              {formErrors.nombre && <span className={styles.formFieldError}>{formErrors.nombre}</span>}
            </label>
          </div>

          <div className={styles.formRow}>
            {/* Lugar */}
            <label className={styles.formField}>
              <span>Lugar / Comunidad</span>
              <input
                name="lugar"
                value={formData.lugar}
                onChange={handleInputChange}
                placeholder="Ej: Escuela Lempira"
              />
              {formErrors.lugar && <span className={styles.formFieldError}>{formErrors.lugar}</span>}
            </label>

            {/* Fecha y Hora */}
            <label className={styles.formField}>
              <span>Fecha y Hora de Inicio *</span>
              <input
                name="fecha_brigada"
                value={formData.fecha_brigada}
                onChange={handleInputChange}
                type="datetime-local"
                required
              />
              {formErrors.fecha_brigada && (
                <span className={styles.formFieldError}>{formErrors.fecha_brigada}</span>
              )}
            </label>
          </div>

          <div className={styles.formRow}>
            {/* Estado */}
            <label className={styles.formField}>
              <span>Estado *</span>
              <select name="estado" value={formData.estado} onChange={handleInputChange} required>
                <option value="inscripciones_cerradas">
                  {ESTADO_LABELS.inscripciones_cerradas}
                </option>
                <option value="inscripciones_abiertas">
                  {ESTADO_LABELS.inscripciones_abiertas}
                </option>
                <option value="finalizada">{ESTADO_LABELS.finalizada}</option>
                <option value="cancelada">{ESTADO_LABELS.cancelada}</option>
              </select>
              {formErrors.estado && <span className={styles.formFieldError}>{formErrors.estado}</span>}
            </label>

            {/* Presupuesto Estimado */}
            <label className={styles.formField}>
              <span>Presupuesto Estimado (HNL) *</span>
              <input
                name="presupuesto_estimado"
                value={formData.presupuesto_estimado ?? ""}
                onChange={handleInputChange}
                type="number"
                step="0.01"
                placeholder="Ej: 25000"
                required
              />
              {formErrors.presupuesto_estimado && (
                <span className={styles.formFieldError}>{formErrors.presupuesto_estimado}</span>
              )}
            </label>
          </div>

          <div className={styles.formRow}>
            {/* Municipio */}
            <label className={styles.formField}>
              <span>Municipio *</span>
              <input
                name="municipio"
                value={formData.municipio}
                onChange={handleInputChange}
                placeholder="Ej: Tegucigalpa"
                required
              />
              {formErrors.municipio && <span className={styles.formFieldError}>{formErrors.municipio}</span>}
            </label>

            {/* Departamento */}
            <label className={styles.formField}>
              <span>Departamento *</span>
              <input
                name="departamento"
                value={formData.departamento}
                onChange={handleInputChange}
                placeholder="Ej: Francisco Morazán"
                required
              />
              {formErrors.departamento && <span className={styles.formFieldError}>{formErrors.departamento}</span>}
            </label>
          </div>

          <div className={styles.formRow}>
            {/* Fecha Inicio Inscripción */}
            <label className={styles.formField}>
              <span>Inicio Inscripción *</span>
              <input
                name="fecha_inicio_inscripcion"
                value={formData.fecha_inicio_inscripcion}
                onChange={handleInputChange}
                type="datetime-local"
                required
              />
              {formErrors.fecha_inicio_inscripcion && (
                <span className={styles.formFieldError}>{formErrors.fecha_inicio_inscripcion}</span>
              )}
            </label>

            {/* Fecha Fin Inscripción */}
            <label className={styles.formField}>
              <span>Fin Inscripción *</span>
              <input
                name="fecha_fin_inscripcion"
                value={formData.fecha_fin_inscripcion}
                onChange={handleInputChange}
                type="datetime-local"
                required
              />
              {formErrors.fecha_fin_inscripcion && (
                <span className={styles.formFieldError}>{formErrors.fecha_fin_inscripcion}</span>
              )}
            </label>
          </div>

          <div className={styles.formRow}>
            {/* Capacidad Voluntarios */}
            <label className={styles.formField}>
              <span>Capacidad de Voluntarios</span>
              <input
                name="capacidad_voluntarios"
                value={formData.capacidad_voluntarios ?? ""}
                onChange={handleInputChange}
                type="number"
                placeholder="Ej: 50"
              />
              {formErrors.capacidad_voluntarios && (
                <span className={styles.formFieldError}>{formErrors.capacidad_voluntarios}</span>
              )}
            </label>

            {/* Imagen Banner */}
            <label className={styles.formField}>
              <span>Imagen Banner (URL)</span>
              <input
                name="imagen_banner"
                value={formData.imagen_banner ?? ""}
                onChange={handleInputChange}
                placeholder="Ej: https://..."
              />
              {formErrors.imagen_banner && (
                <span className={styles.formFieldError}>{formErrors.imagen_banner}</span>
              )}
            </label>
          </div>

          <div className={styles.formRow}>
            {/* Latitud */}
            <label className={styles.formField}>
              <span>Latitud</span>
              <input
                name="latitud"
                value={formData.latitud ?? ""}
                onChange={handleInputChange}
                type="number"
                step="any"
                placeholder="Ej: 14.0818"
              />
              {formErrors.latitud && <span className={styles.formFieldError}>{formErrors.latitud}</span>}
            </label>

            {/* Longitud */}
            <label className={styles.formField}>
              <span>Longitud</span>
              <input
                name="longitud"
                value={formData.longitud ?? ""}
                onChange={handleInputChange}
                type="number"
                step="any"
                placeholder="Ej: -87.2068"
              />
              {formErrors.longitud && <span className={styles.formFieldError}>{formErrors.longitud}</span>}
            </label>
          </div>

          {/* Descripción */}
          <label className={styles.formField}>
            <span>Descripción</span>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={3}
              placeholder="Escribe detalles sobre la brigada y los servicios que ofrecerá..."
            />
            {formErrors.descripcion && <span className={styles.formFieldError}>{formErrors.descripcion}</span>}
          </label>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Guardando..."
                : mode === "create"
                  ? "Crear Brigada"
                  : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
