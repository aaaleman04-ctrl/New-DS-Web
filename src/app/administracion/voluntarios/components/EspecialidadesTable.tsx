"use client";

import { useState } from "react";
import styles from "@/styles/pages/admin.module.css";
import { 
  crearEspecialidad, 
  editarEspecialidad, 
  activarEspecialidad, 
  desactivarEspecialidad 
} from "../actions";
import EspecialidadForm from "./EspecialidadForm";

export type Specialty = {
  id: string;
  nombre: string;
  activo?: boolean;
  activa?: boolean;
};

export default function EspecialidadesTable({
  initialSpecialties,
}: {
  initialSpecialties: Specialty[];
}) {
  const [specialties, setSpecialties] = useState(initialSpecialties);
  const [showModal, setShowModal] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isActiva = (sp: Specialty) => sp.activo ?? sp.activa ?? true;

  const handleCreate = () => {
    setEditingSpecialty(null);
    setShowModal(true);
  };

  const handleEdit = (sp: Specialty) => {
    setEditingSpecialty(sp);
    setShowModal(true);
  };

  const handleToggleStatus = async (sp: Specialty) => {
    setLoadingId(sp.id);
    setError(null);
    try {
      const active = isActiva(sp);
      const res = active 
        ? await desactivarEspecialidad(sp.id)
        : await activarEspecialidad(sp.id);
      
      if (res.error) throw new Error(res.error);
      
      // Update local state to reflect change immediately
      setSpecialties(prev => prev.map(s => s.id === sp.id ? { ...s, activo: !active, activa: !active } : s));
    } catch (e: any) {
      setError(e.message || "Ocurrió un error.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSave = async (nombre: string) => {
    setError(null);
    try {
      if (editingSpecialty) {
        const res = await editarEspecialidad(editingSpecialty.id, nombre);
        if (res.error) throw new Error(res.error);
        
        setSpecialties(prev => prev.map(s => 
          s.id === editingSpecialty.id ? { ...s, nombre } : s
        ));
      } else {
        const res = await crearEspecialidad(nombre);
        if (res.error) throw new Error(res.error);
        
        // Since we don't have the new ID immediately, we should ideally refresh the route
        // But for UI optimism, we just force a page reload or we can fetch them again.
        // The server action revalidatePath handles it, so we can just reload.
        window.location.reload();
      }
      setShowModal(false);
    } catch (e: any) {
      setError(e.message || "Ocurrió un error al guardar.");
      throw e; // Pass to form
    }
  };

  return (
    <div className={styles.tableContainer}>
      <div style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Listado de Especialidades</h3>
        <button className={styles.btnPrimary} onClick={handleCreate}>
          + Nueva Especialidad
        </button>
      </div>

      {error && (
        <div style={{ color: "red", padding: "1rem" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <table className={styles.adminTable}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {specialties.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: "center", padding: "2rem" }}>
                No hay especialidades registradas.
              </td>
            </tr>
          ) : (
            specialties.map((sp) => {
              const active = isActiva(sp);
              return (
                <tr key={sp.id}>
                  <td>{sp.nombre}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "1rem",
                        fontSize: "0.85rem",
                        backgroundColor: active ? "var(--green-light, #d1fae5)" : "var(--red-light, #fee2e2)",
                        color: active ? "var(--green-dark, #065f46)" : "var(--red-dark, #991b1b)",
                        fontWeight: 500,
                      }}
                    >
                      {active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className={styles.btnSecondary}
                        onClick={() => handleEdit(sp)}
                        disabled={loadingId === sp.id}
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
                      >
                        Editar
                      </button>
                      <button
                        className={active ? styles.btnDanger : styles.btnSuccess}
                        onClick={() => handleToggleStatus(sp)}
                        disabled={loadingId === sp.id}
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
                      >
                        {loadingId === sp.id
                          ? "Procesando..."
                          : active
                          ? "Desactivar"
                          : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {showModal && (
        <EspecialidadForm
          specialty={editingSpecialty}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
