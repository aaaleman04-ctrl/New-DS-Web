"use client";

import React, { useState, useEffect } from "react";
import type { LoteMedicamento } from "@/lib/db/inventario";
import styles from "@/styles/pages/admin.module.css";

export interface LoteFormValues {
  numero_lote: string;
  fabricante?: string;
  fecha_vencimiento: string;
  cantidad_actual: number;
}

interface LoteFormProps {
  initialData?: Partial<LoteMedicamento> | null;
  onSubmit: (data: LoteFormValues) => void;
  isLoading?: boolean;
}

export function LoteForm({ initialData, onSubmit, isLoading }: LoteFormProps) {
  const [formData, setFormData] = useState<LoteFormValues>({
    numero_lote: "",
    fabricante: "",
    fecha_vencimiento: "",
    cantidad_actual: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        numero_lote: initialData.numero_lote || "",
        fabricante: initialData.fabricante || "",
        fecha_vencimiento: initialData.fecha_vencimiento || "",
        cantidad_actual: initialData.cantidad_actual || 0,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cantidad_actual" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numero_lote || !formData.fecha_vencimiento || formData.cantidad_actual < 0) {
      alert("Por favor completa los campos requeridos correctamente.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
      <div className={styles.formField}>
        <label>Número de Lote *</label>
        <input 
          name="numero_lote"
          value={formData.numero_lote}
          onChange={handleChange}
          placeholder="Ej. L-2023-001"
          required
        />
      </div>
      
      <div className={styles.formField}>
        <label>Fabricante (Opcional)</label>
        <input 
          name="fabricante"
          value={formData.fabricante}
          onChange={handleChange}
          placeholder="Ej. Bayer"
        />
      </div>

      <div className={styles.formField}>
        <label>Fecha de Vencimiento *</label>
        <input 
          type="date"
          name="fecha_vencimiento"
          value={formData.fecha_vencimiento}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formField}>
        <label>Cantidad Actual *</label>
        <input 
          type="number"
          min="0"
          name="cantidad_actual"
          value={formData.cantidad_actual}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar Lote"}
        </button>
      </div>
    </form>
  );
}
