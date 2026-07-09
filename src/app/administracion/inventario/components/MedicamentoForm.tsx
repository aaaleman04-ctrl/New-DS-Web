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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
      <div className={styles.formField}>
        <label>Nombre del Medicamento/Insumo *</label>
        <input 
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej. Paracetamol 500mg"
          required
        />
      </div>
      
      <div className={styles.formField}>
        <label>Descripción</label>
        <textarea 
          name="descripcion"
          value={formData.descripcion || ""}
          onChange={handleChange}
          placeholder="Descripción detallada..."
          rows={3}
          style={{ padding: "1.2rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}
        />
      </div>

      <div className={styles.formField}>
        <label>Unidad de Medida</label>
        <input 
          name="unidad_medida"
          value={formData.unidad_medida || ""}
          onChange={handleChange}
          placeholder="Ej. Cajas, Frascos, Blíster, Tabletas"
        />
      </div>

      <div className={styles.formField}>
        <label>Stock Mínimo (Alerta) *</label>
        <input 
          type="number"
          min="0"
          name="stock_minimo"
          value={formData.stock_minimo ?? 0}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar Medicamento"}
        </button>
      </div>
    </form>
  );
}
