"use client";

import { useState } from "react";
import styles from "@/styles/pages/admin.module.css";
import { actualizarAsignacion } from "../actions";

type AsignacionRow = {
  id: string;
  brigada_id: string;
  area_asignada: string | null;
  brigada?: {
    id: string;
    nombre: string;
  };
};

type AsignacionesCardProps = {
  perfilId: string;
  asignaciones: AsignacionRow[];
};

export default function AsignacionesCard({ perfilId, asignaciones }: AsignacionesCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (asig: AsignacionRow) => {
    setEditingId(asig.id);
    setArea(asig.area_asignada || "");
    setError(null);
  };

  const handleSave = async (asigId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actualizarAsignacion(asigId, area, perfilId);
      if (res.error) throw new Error(res.error);
      setEditingId(null);
    } catch (e: any) {
      setError(e.message || "Error al actualizar asignación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.tableContainer} style={{ padding: "1.5rem" }}>
      <h3 style={{ margin: "0 0 1rem 0" }}>Áreas Asignadas</h3>
      
      {error && (
        <div style={{ color: "var(--red-dark)", marginBottom: "1rem" }}>
          <strong>Error: </strong> {error}
        </div>
      )}

      {asignaciones.length === 0 ? (
        <p style={{ color: "var(--gray)", textAlign: "center", margin: "1rem 0" }}>
          No tiene asignaciones en brigadas pendientes.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {asignaciones.map(asig => {
            const isEditing = editingId === asig.id;
            return (
              <div key={asig.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", backgroundColor: "var(--bg-default)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                <div>
                  <h4 style={{ margin: "0 0 0.2rem 0" }}>{asig.brigada?.nombre || `Brigada ID: ${asig.brigada_id.substring(0,8)}...`}</h4>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={area}
                      onChange={e => setArea(e.target.value)}
                      style={{ padding: "0.8rem", borderRadius: "4px", border: "1px solid var(--border-color)", marginTop: "0.5rem", width: "100%", fontSize: "1.4rem" }}
                      placeholder="Ej. Triage, Farmacia..."
                    />
                  ) : (
                    <p style={{ margin: 0, color: "var(--gray)", fontSize: "0.9rem" }}>
                      <strong>Área:</strong> {asig.area_asignada || "Sin área específica"}
                    </p>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button 
                        className={styles.btnPrimary} 
                        onClick={() => handleSave(asig.id)}
                        disabled={loading}
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                      >
                        {loading ? "..." : "Guardar"}
                      </button>
                      <button 
                        className={styles.btnSecondary} 
                        onClick={() => setEditingId(null)}
                        disabled={loading}
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button 
                      className={styles.btnSecondary} 
                      onClick={() => handleEdit(asig)}
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    >
                      Cambiar Área
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
