import React, { useState, useEffect } from "react";
import type { InsertMedicamento } from "@/lib/db/inventario";
import styles from "@/styles/pages/admin.module.css";

interface MedicamentoFormProps {
  initialData?: any;
  categorias?: any[];
  onSubmit: (data: InsertMedicamento, cantidadInicial?: number) => Promise<void>;
  onCancel?: () => void;
  isLoading: boolean;
}

export function MedicamentoForm({ initialData, categorias = [], onSubmit, onCancel, isLoading }: MedicamentoFormProps) {
  const isEditing = Boolean(initialData?.id || initialData?.medicamento_id);

  console.log("MedicamentoForm - categorias prop:", categorias);

  const [cantidadInicial, setCantidadInicial] = useState<number>(0);
  const [formData, setFormData] = useState<InsertMedicamento>({
    nombre: initialData?.nombre || "",
    tipo_recurso: initialData?.tipo_recurso || "medicamento",
    descripcion: initialData?.descripcion || "",
    unidad_medida: initialData?.unidad_medida || "",
    stock_minimo: initialData?.stock_minimo !== undefined ? Number(initialData.stock_minimo) : 10,
    categoria_id: initialData?.categoria_id || (categorias[0]?.id || ""),
    codigo: initialData?.codigo || "",
  } as any);

  useEffect(() => {
    if (categorias && categorias.length > 0) {
      const exists = categorias.some((c) => c.id === formData.categoria_id);
      if (!exists || !formData.categoria_id) {
        setFormData((prev: any) => ({ ...prev, categoria_id: categorias[0].id }));
      }
    }
  }, [categorias, formData.categoria_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: InsertMedicamento) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategoriaId = formData.categoria_id || (categorias[0]?.id || "");
    await onSubmit({
      ...formData,
      categoria_id: finalCategoriaId,
      stock_minimo: Number(formData.stock_minimo),
    }, cantidadInicial);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.adminFormSingleColumn}>
      <div className={styles.formSectionTitle}>1. Clasificación e Información General</div>

      <label className={styles.formField}>
        <span className={styles.fieldLabel}>
          Tipo de Recurso <strong className={styles.requiredStar}>* (Requerido)</strong>
        </span>
        <select
          name="tipo_recurso"
          value={formData.tipo_recurso || "medicamento"}
          onChange={handleChange}
          required
        >
          <option value="medicamento">💊 Medicamento (Fármacos)</option>
          <option value="insumo_medico">🩹 Insumo Médico (Gasas, Jeringas, Guantes)</option>
          <option value="material_brigada">⛺ Material de Brigada (Toldos, Sillas, Básculas)</option>
        </select>
      </label>

      <label className={styles.formField}>
        <span className={styles.fieldLabel}>
          Categoría de Inventario <strong className={styles.requiredStar}>* (Requerido)</strong>
        </span>
        <select
          name="categoria_id"
          value={formData.categoria_id || (categorias[0]?.id || "")}
          onChange={handleChange}
          required
        >
          {categorias && categorias.length > 0 ? (
            categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))
          ) : (
            <option value="">Cargando categorías...</option>
          )}
        </select>
      </label>

      <label className={styles.formField}>
        <span className={styles.fieldLabel}>
          Nombre del Recurso <strong className={styles.requiredStar}>* (Requerido)</strong>
        </span>
        <input 
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej. Paracetamol 500mg, Jeringas 5ml o Toldo Plegable 3x3m"
          required
        />
      </label>

      <label className={styles.formField}>
        <span className={styles.fieldLabel}>
          Código / Referencia <span className={styles.optionalTag}>(Máximo 20 caracteres)</span>
        </span>
        <input 
          name="codigo"
          maxLength={20}
          value={formData.codigo || ""}
          onChange={handleChange}
          placeholder="Ej. MED_AMOX_500"
        />
      </label>
      
      <label className={styles.formField}>
        <span className={styles.fieldLabel}>
          Descripción de Fármacos / Insumos <span className={styles.optionalTag}>(Opcional)</span>
        </span>
        <textarea 
          name="descripcion"
          value={formData.descripcion || ""}
          onChange={handleChange}
          placeholder="Descripción detallada de posología, concentración o tipo de insumo..."
          rows={3}
        />
      </label>

      <div className={styles.formSectionTitle}>2. Control de Existencias y Presentación</div>

      <label className={styles.formField}>
        <span className={styles.fieldLabel}>
          Unidad de Medida / Presentación <span className={styles.optionalTag}>(Opcional)</span>
        </span>
        <input 
          name="unidad_medida"
          value={formData.unidad_medida || ""}
          onChange={handleChange}
          placeholder="Ej. Cajas, Frascos, Blíster, Tabletas, Unidades"
        />
      </label>

      <label className={styles.formField}>
        <span className={styles.fieldLabel}>
          Stock Mínimo (Umbral de Alerta) <strong className={styles.requiredStar}>* (Requerido)</strong>
        </span>
        <input 
          type="number"
          min="0"
          name="stock_minimo"
          value={formData.stock_minimo ?? 0}
          onChange={handleChange}
          required
        />
      </label>

      {!isEditing && (
        <label className={styles.formField}>
          <span className={styles.fieldLabel}>
            Cantidad Inicial en Stock (Lote Inicial Automático) <span className={styles.optionalTag}>(Opcional)</span>
          </span>
          <input 
            type="number"
            min="0"
            name="cantidadInicial"
            value={cantidadInicial}
            onChange={(e) => setCantidadInicial(Number(e.target.value))}
            placeholder="Ingrese la cantidad inicial para crear su primer lote..."
          />
        </label>
      )}

      <div className={styles.modalActions} style={{ marginTop: "1.6rem" }}>
        {onCancel && (
          <button type="button" className={styles.btnSecondary} onClick={onCancel} disabled={isLoading}>
            Cancelar
          </button>
        )}
        <button type="submit" className={styles.btnPrimary} disabled={isLoading}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem" }}
        >
          {isLoading && (
            <svg style={{ width: "1.6rem", height: "1.6rem", animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
            </svg>
          )}
          <span>{isLoading ? "Guardando Cambios..." : (isEditing ? "Guardar cambios" : "Crear Recurso")}</span>
        </button>
      </div>
    </form>
  );
}
