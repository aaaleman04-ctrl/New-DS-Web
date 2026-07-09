"use client";

import { useState } from "react";
import styles from "@/styles/pages/admin.module.css";
import type { Specialty } from "./EspecialidadesTable";

type EspecialidadFormProps = {
  specialty: Specialty | null;
  onClose: () => void;
  onSave: (nombre: string) => Promise<void>;
};

export default function EspecialidadForm({ specialty, onClose, onSave }: EspecialidadFormProps) {
  const [nombre, setNombre] = useState(specialty?.nombre || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre de la especialidad es requerido.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave(nombre);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>{specialty ? "Editar Especialidad" : "Nueva Especialidad"}</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.adminForm} style={{ padding: "0" }}>
          <div className={styles.formField}>
            <label>Nombre de la Especialidad</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Odontología General"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && <p style={{ color: "var(--danger)", fontSize: "1.4rem", margin: "1rem 0" }}>{error}</p>}

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
