"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import type { Brigada, EstadoBrigada } from "@/lib/db/brigadas";
import { generarCodigoBrigada } from "../actions";
import styles from "@/styles/pages/admin.module.css";

// SVG Icons (Sin emojis)
function CpuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="15" x2="23" y2="15" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="15" x2="4" y2="15" />
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

// Lista oficial de Departamentos de Honduras (Prueba 5: Valores válidos)
const DEPARTAMENTOS_HONDURAS = [
  "Atlántida",
  "Choluteca",
  "Colón",
  "Comayagua",
  "Copán",
  "Cortés",
  "El Paraíso",
  "Francisco Morazán",
  "Gracias a Dios",
  "Intibucá",
  "Islas de la Bahía",
  "La Paz",
  "Lempira",
  "Ocotepeque",
  "Olancho",
  "Santa Bárbara",
  "Valle",
  "Yoro",
] as const;

// Esquema Zod de validación estricta (Capítulo 15 - Análisis y Diseño de Datos)
const brigadaSchema = z
  .object({
    codigo: z.string().optional(),
    nombre: z
      .string()
      .trim()
      .min(5, "Prueba de longitud: El nombre de la brigada debe tener al menos 5 caracteres.")
      .max(100, "Prueba de longitud: El nombre no debe exceder 100 caracteres."),
    lugar: z
      .string()
      .trim()
      .min(3, "Prueba de presencia: El lugar o comunidad debe tener al menos 3 caracteres.")
      .max(150, "Prueba de longitud: El lugar no debe exceder 150 caracteres."),
    municipio: z
      .string()
      .trim()
      .min(2, "Prueba de presencia: El municipio es obligatorio.")
      .max(100, "Prueba de longitud: El municipio no debe exceder 100 caracteres."),
    departamento: z
      .string()
      .min(1, "Prueba de valores válidos: Selecciona un departamento oficial de Honduras."),
    fecha_brigada: z
      .string()
      .min(1, "Prueba de presencia: La fecha y hora del evento son obligatorias."),
    fecha_inicio_inscripcion: z
      .string()
      .min(1, "Prueba de presencia: La fecha de inicio de inscripción es obligatoria."),
    fecha_fin_inscripcion: z
      .string()
      .min(1, "Prueba de presencia: La fecha de fin de inscripción es obligatoria."),
    descripcion: z
      .string()
      .max(500, "Prueba de longitud: La descripción no debe exceder 500 caracteres.")
      .optional()
      .or(z.literal("")),
    estado: z.enum(
      ["inscripciones_abiertas", "inscripciones_cerradas", "finalizada", "cancelada"],
      { message: "Prueba de valores válidos: Selecciona un estado válido." }
    ),
    presupuesto_estimado: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
      z
        .number({ message: "Prueba de clase: El presupuesto debe ser numérico." })
        .min(0, "Prueba de sensatez: El presupuesto no puede ser negativo.")
    ),
    capacidad_voluntarios: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
      z
        .number({ message: "Prueba de clase: La capacidad debe ser un número entero." })
        .int("Prueba de composición: La capacidad debe ser un entero.")
        .min(1, "Prueba de sensatez: La capacidad debe ser de al menos 1 voluntario.")
        .nullable()
        .optional()
    ),
    imagen_banner: z
      .string()
      .url("Prueba de composición: Ingresa una URL válida (ej. https://...)")
      .optional()
      .or(z.literal(""))
      .nullable(),
    latitud: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
      z
        .number({ message: "Prueba de clase: La latitud debe ser numérica." })
        .min(-90, "Prueba de sensatez: La latitud mínima es -90°.")
        .max(90, "Prueba de sensatez: La latitud máxima es 90°.")
        .nullable()
        .optional()
    ),
    longitud: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
      z
        .number({ message: "Prueba de clase: La longitud debe ser numérica." })
        .min(-180, "Prueba de sensatez: La longitud mínima es -180°.")
        .max(180, "Prueba de sensatez: La longitud máxima es 180°.")
        .nullable()
        .optional()
    ),
  })
  .refine(
    (data) => {
      if (!data.fecha_inicio_inscripcion || !data.fecha_fin_inscripcion) return true;
      return new Date(data.fecha_inicio_inscripcion) <= new Date(data.fecha_fin_inscripcion);
    },
    {
      message: "Prueba de referencia cruzada: El inicio de inscripción debe ser previo o igual al fin de inscripción.",
      path: ["fecha_inicio_inscripcion"],
    }
  )
  .refine(
    (data) => {
      if (!data.fecha_fin_inscripcion || !data.fecha_brigada) return true;
      return new Date(data.fecha_fin_inscripcion) <= new Date(data.fecha_brigada);
    },
    {
      message: "Prueba de referencia cruzada: El fin de inscripción no puede ser posterior a la fecha del evento.",
      path: ["fecha_fin_inscripcion"],
    }
  );

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
  finalizada: "Finalizada (Solo Lectura)",
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
  // Conversión de formato ISO a datetime-local (YYYY-MM-DDThh:mm)
  const formatDatetimeLocal = (isoString?: string | null) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const [codePreview, setCodePreview] = useState<string>(brigada?.codigo || "");
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);



  const [formData, setFormData] = useState<Partial<BrigadaFormData>>({
    codigo: brigada?.codigo ?? "",
    nombre: brigada?.nombre ?? "",
    lugar: brigada?.lugar ?? "",
    municipio: brigada?.municipio ?? "",
    departamento: brigada?.departamento ?? "Francisco Morazán",
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
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Carga previa del código autogenerado en modo creación y re-calculo dinámico si cambia la fecha
  useEffect(() => {
    if (mode === "create") {
      generarCodigoBrigada(formData.fecha_brigada).then((res) => {
        if (res.codigo) setCodePreview(res.codigo);
      });
    }
  }, [mode, formData.fecha_brigada]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar mensaje de error específico al escribir
    if (formErrors[name as keyof BrigadaFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (generalError) setGeneralError(null);
  };

  const handleRequestClose = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      onClose();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // Validación estricta con Zod
    const result = brigadaSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof BrigadaFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as keyof BrigadaFormData] = issue.message;
        }
      });
      setFormErrors(errors);
      setGeneralError("Existen campos incompletos o con datos inválidos. Revisa el formulario a continuación.");
      return;
    }

    const data = result.data;
    const formattedData = {
      ...data,
      codigo: mode === "edit" ? brigada?.codigo : codePreview,
      fecha_brigada: new Date(data.fecha_brigada).toISOString(),
      fecha_inicio_inscripcion: new Date(data.fecha_inicio_inscripcion).toISOString(),
      fecha_fin_inscripcion: new Date(data.fecha_fin_inscripcion).toISOString(),
    };
    onSubmit(formattedData);
  };

  return (
    <>
      <div className={styles.modalOverlay} onClick={handleRequestClose}>
        <div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          style={{ maxWidth: "640px", width: "95%" }}
        >
          <div className={styles.modalHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "700" }}>
                {mode === "create" ? "Registrar Nueva Brigada Médica" : "Editar Brigada Médica"}
              </h3>
            </div>
            <button
              type="button"
              className={styles.modalClose}
              onClick={handleRequestClose}
              title="Cerrar formulario"
              aria-label="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className={styles.adminFormSingleColumn}>
            {/* Banner de errores de validación (HCI: Error Visible) */}
            {generalError && (
              <div className={styles.formErrorBanner}>
                <AlertCircleIcon />
                <span>{generalError}</span>
              </div>
            )}

            {/* SECCIÓN 1: Autogeneración de Código (Sección 1) */}
            <div className={styles.autoCodeCard}>
              <CpuIcon />
              <div className={styles.autoCodeInfo}>
                <span className={styles.autoCodeTitle}>
                  {mode === "create" ? "Código Asignado Automáticamente" : "Código Identificador de Brigada"}
                </span>
                <span className={styles.autoCodeValue}>
                  {mode === "create" ? codePreview || "Generando..." : brigada?.codigo}
                </span>
              </div>
            </div>

            {/* SECCIÓN 2: Información General */}
            <div className={styles.formSectionTitle}>1. Información General del Evento</div>

            {/* Fecha y Hora del Evento */}
            <label className={styles.formField}>
              <span className={styles.fieldLabel}>
                Fecha y Hora de la Brigada <strong className={styles.requiredStar}>* (Requerido)</strong>
              </span>
              <input
                name="fecha_brigada"
                value={formData.fecha_brigada || ""}
                onChange={handleInputChange}
                type="datetime-local"
                required
              />
              {formErrors.fecha_brigada && (
                <span className={styles.formFieldError}>
                  <AlertCircleIcon /> {formErrors.fecha_brigada}
                </span>
              )}
            </label>

            {/* Nombre de Brigada */}
            <label className={styles.formField}>
              <span className={styles.fieldLabel}>
                Nombre de la Brigada <strong className={styles.requiredStar}>* (Requerido)</strong>
              </span>
              <input
                name="nombre"
                value={formData.nombre || ""}
                onChange={handleInputChange}
                placeholder="Ej. Brigada Médica Comunitaria El Hatillo"
                maxLength={100}
                required
              />
              {formErrors.nombre && (
                <span className={styles.formFieldError}>
                  <AlertCircleIcon /> {formErrors.nombre}
                </span>
              )}
            </label>

            {/* Estado de la Brigada */}
            <label className={styles.formField}>
              <span className={styles.fieldLabel}>
                Estado de la Brigada <strong className={styles.requiredStar}>* (Requerido)</strong>
              </span>
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
              {formErrors.estado && (
                <span className={styles.formFieldError}>
                  <AlertCircleIcon /> {formErrors.estado}
                </span>
              )}
            </label>

            {/* SECCIÓN 3: Ubicación Geográfica */}
            <div className={styles.formSectionTitle}>2. Ubicación Geográfica en Honduras</div>

            {/* Departamento */}
            <label className={styles.formField}>
              <span className={styles.fieldLabel}>
                Departamento <strong className={styles.requiredStar}>* (Requerido)</strong>
              </span>
              <select
                name="departamento"
                value={formData.departamento || ""}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona un departamento...</option>
                {DEPARTAMENTOS_HONDURAS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {formErrors.departamento && (
                <span className={styles.formFieldError}>
                  <AlertCircleIcon /> {formErrors.departamento}
                </span>
              )}
            </label>

            {/* Municipio */}
            <label className={styles.formField}>
              <span className={styles.fieldLabel}>
                Municipio <strong className={styles.requiredStar}>* (Requerido)</strong>
              </span>
              <input
                name="municipio"
                value={formData.municipio || ""}
                onChange={handleInputChange}
                placeholder="Ej. Distrito Central / Tegucigalpa"
                maxLength={100}
                required
              />
              {formErrors.municipio && (
                <span className={styles.formFieldError}>
                  <AlertCircleIcon /> {formErrors.municipio}
                </span>
              )}
            </label>

            {/* Lugar / Comunidad */}
            <label className={styles.formField}>
              <span className={styles.fieldLabel}>
                Comunidad o Centro de Atención <strong className={styles.requiredStar}>* (Requerido)</strong>
              </span>
              <input
                name="lugar"
                value={formData.lugar || ""}
                onChange={handleInputChange}
                placeholder="Ej. Escuela Primaria Lempira, Aldea El Hatillo"
                maxLength={150}
                required
              />
              {formErrors.lugar && (
                <span className={styles.formFieldError}>
                  <AlertCircleIcon /> {formErrors.lugar}
                </span>
              )}
            </label>

            {/* SECCIÓN 4: Programación de Fechas */}
            <div className={styles.formSectionTitle}>3. Programación de Fechas</div>

            {/* Fecha Inicio Inscripción */}
            <label className={styles.formField}>
              <span className={styles.fieldLabel}>
                Apertura de Inscripciones de Voluntarios <strong className={styles.requiredStar}>* (Requerido)</strong>
              </span>
              <input
                name="fecha_inicio_inscripcion"
                value={formData.fecha_inicio_inscripcion || ""}
                onChange={handleInputChange}
                type="datetime-local"
                required
              />
              {formErrors.fecha_inicio_inscripcion && (
                <span className={styles.formFieldError}>
                  <AlertCircleIcon /> {formErrors.fecha_inicio_inscripcion}
                </span>
              )}
            </label>

            {/* Fecha Fin Inscripción */}
            <label className={styles.formField}>
              <span className={styles.fieldLabel}>
                Cierre de Inscripciones de Voluntarios <strong className={styles.requiredStar}>* (Requerido)</strong>
              </span>
              <input
                name="fecha_fin_inscripcion"
                value={formData.fecha_fin_inscripcion || ""}
                onChange={handleInputChange}
                type="datetime-local"
                required
              />
              {formErrors.fecha_fin_inscripcion && (
                <span className={styles.formFieldError}>
                  <AlertCircleIcon /> {formErrors.fecha_fin_inscripcion}
                </span>
              )}
            </label>

            {/* SECCIÓN 5: Presupuesto y Capacidad */}
            <div className={styles.formSectionTitle}>4. Presupuesto y Logística</div>

            {/* Presupuesto Estimado */}
            <label className={styles.formField}>
              <span className={styles.fieldLabel}>
                Presupuesto Estimado (HNL) <strong className={styles.requiredStar}>* (Requerido)</strong>
              </span>
              <input
                name="presupuesto_estimado"
                value={formData.presupuesto_estimado ?? ""}
                onChange={handleInputChange}
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej. 25000.00"
                required
              />
              {formErrors.presupuesto_estimado && (
                <span className={styles.formFieldError}>
                  <AlertCircleIcon /> {formErrors.presupuesto_estimado}
                </span>
              )}
            </label>

            {/* Capacidad de Voluntarios */}
            <label className={styles.formField}>
              <span className={styles.fieldLabel}>
                Cupo Máximo de Voluntarios <span className={styles.optionalTag}>(Opcional)</span>
              </span>
              <input
                name="capacidad_voluntarios"
                value={formData.capacidad_voluntarios ?? ""}
                onChange={handleInputChange}
                type="number"
                min="1"
                placeholder="Ej. 50"
              />
              {formErrors.capacidad_voluntarios && (
                <span className={styles.formFieldError}>
                  <AlertCircleIcon /> {formErrors.capacidad_voluntarios}
                </span>
              )}
            </label>

            {/* SECCIÓN 6: Opciones Adicionales */}
            <div className={styles.formSectionTitle}>5. Multimedia y Geolocalización GPS</div>

            {/* Imagen Banner */}
            <label className={styles.formField}>
              <span className={styles.fieldLabel}>
                Enlace de Imagen Banner <span className={styles.optionalTag}>(Opcional)</span>
              </span>
              <input
                name="imagen_banner"
                value={formData.imagen_banner ?? ""}
                onChange={handleInputChange}
                placeholder="https://ejemplo.org/fotos/banner-brigada.jpg"
              />
              {formErrors.imagen_banner && (
                <span className={styles.formFieldError}>
                  <AlertCircleIcon /> {formErrors.imagen_banner}
                </span>
              )}
            </label>

            {/* Latitud */}
            <label className={styles.formField}>
              <span className={styles.fieldLabel}>
                Latitud GPS <span className={styles.optionalTag}>(Opcional, rango -90 a 90)</span>
              </span>
              <input
                name="latitud"
                value={formData.latitud ?? ""}
                onChange={handleInputChange}
                type="number"
                step="any"
                placeholder="Ej. 14.0818"
              />
              {formErrors.latitud && (
                <span className={styles.formFieldError}>
                  <AlertCircleIcon /> {formErrors.latitud}
                </span>
              )}
            </label>

            {/* Longitud */}
            <label className={styles.formField}>
              <span className={styles.fieldLabel}>
                Longitud GPS <span className={styles.optionalTag}>(Opcional, rango -180 a 180)</span>
              </span>
              <input
                name="longitud"
                value={formData.longitud ?? ""}
                onChange={handleInputChange}
                type="number"
                step="any"
                placeholder="Ej. -87.2068"
              />
              {formErrors.longitud && (
                <span className={styles.formFieldError}>
                  <AlertCircleIcon /> {formErrors.longitud}
                </span>
              )}
            </label>

            {/* Descripción */}
            <label className={styles.formField}>
              <span className={styles.fieldLabel}>
                Descripción de la Brigada y Servicios <span className={styles.optionalTag}>(Opcional, máx. 500 caracteres)</span>
              </span>
              <textarea
                name="descripcion"
                value={formData.descripcion || ""}
                onChange={handleInputChange}
                rows={4}
                maxLength={500}
                placeholder="Describe la logística de atención médica, medicamentos y actividades preparadas..."
              />
              {formErrors.descripcion && (
                <span className={styles.formFieldError}>
                  <AlertCircleIcon /> {formErrors.descripcion}
                </span>
              )}
            </label>

            {/* Acciones de formulario (Regla 9: Sin botón reset) */}
            <div className={styles.modalActions} style={{ marginTop: "1.6rem" }}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={handleRequestClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={isSubmitting}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem" }}
              >
                {isSubmitting && <SpinnerIcon />}
                <span>
                  {isSubmitting
                    ? "Guardando Registros..."
                    : mode === "create"
                      ? "Crear Brigada Médica"
                      : "Guardar Cambios"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Advertencia HCI (Prevención de pérdida de cambios no guardados) */}
      {showDiscardModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDiscardModal(false)}>
          <div
            className={`${styles.modal} ${styles.modalSm}`}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="discard-title"
          >
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#dc2626" }}>
                <AlertTriangleIcon />
                <h3 id="discard-title">¿Descartar Cambios no Guardados?</h3>
              </div>
            </div>
            <p className={styles.confirmText}>
              Has introducido modificaciones en el formulario. Si cierras ahora, todos los cambios no guardados se perderán permanentemente.
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
                  onClose();
                }}
              >
                Sí, Descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
