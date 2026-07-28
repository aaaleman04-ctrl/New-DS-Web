import React, { useState } from "react";
import { InsertMedicamento } from "@/lib/db/inventario";
import styles from "@/styles/pages/admin.module.css";

interface MedicamentoFormProps {
  initialData?: any;
  onSubmit: (data: InsertMedicamento) => Promise<void>;
  isLoading: boolean;
}

export function MedicamentoForm({ initialData, onSubmit, isLoading }: MedicamentoFormProps) {
  const [formData, setFormData] = useState<InsertMedicamento>({
    nombre: initialData?.nombre || "",
    descripcion: initialData?.descripcion || "",
    unidad_medida: initialData?.unidad_medida || "",
    stock_minimo: initialData?.stock_minimo || 0,
    categoria_id: initialData?.categoria_id || "75c602aa-0c58-450f-aa9d-fb7d0abcc7f9", // Placeholder UUID or null
    codigo: initialData?.codigo || "",
  } as any);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: InsertMedicamento) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      stock_minimo: Number(formData.stock_minimo),
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.adminFormSingleColumn}>
      <div className={styles.formSectionTitle}>1. Información del Medicamentos e Insumos</div>

      <label className={styles.formField}>
        <span className={styles.fieldLabel}>
          Nombre del Medicamento / Insumo <strong className={styles.requiredStar}>* (Requerido)</strong>
        </span>
        <input 
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej. Paracetamol 500mg"
          required
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

      <div className={styles.modalActions} style={{ marginTop: "1.6rem" }}>
        <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
          {isLoading ? "Guardando Medicamento..." : "Guardar Medicamento"}
        </button>
      </div>
    </form>
  );
}
