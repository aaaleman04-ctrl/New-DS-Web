"use client";

import { useState } from "react";
import styles from "@/styles/pages/admin.module.css";
import { registrarParticipacion, actualizarParticipacion } from "../actions";

type ParticipacionRow = {
  id?: string; // Si no tiene ID, es que no se ha registrado participación aún (solo asignación)
  brigada_id: string;
  perfil_id: string;
  brigada?: {
    id: string;
    nombre: string;
    fecha_brigada: string;
  };
  hora_llegada?: string | null;
  hora_salida?: string | null;
  asistencia?: boolean;
  observaciones?: string | null;
};

type ParticipacionesTableProps = {
  perfilId: string;
  participaciones: ParticipacionRow[];
};

export default function ParticipacionesTable({ perfilId, participaciones }: ParticipacionesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [horaLlegada, setHoraLlegada] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [asistencia, setAsistencia] = useState(false);
  const [observaciones, setObservaciones] = useState("");

  const handleEdit = (p: ParticipacionRow) => {
    setEditingId(p.brigada_id);
    setHoraLlegada(p.hora_llegada || "");
    setHoraSalida(p.hora_salida || "");
    setAsistencia(p.asistencia ?? false);
    setObservaciones(p.observaciones || "");
    setError(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setError(null);
  };

  const handleSave = async (p: ParticipacionRow) => {
    setLoading(true);
    setError(null);
    try {
      const data = {
        hora_llegada: horaLlegada || null,
        hora_salida: horaSalida || null,
        asistencia,
        observaciones: observaciones || null,
      };

      if (p.id) {
        // Update existing participation
        const res = await actualizarParticipacion(p.id, data, perfilId);
        if (res.error) throw new Error(res.error);
      } else {
        // Insert new participation
        const res = await registrarParticipacion({
          brigada_id: p.brigada_id,
          perfil_id: perfilId,
          ...data,
        });
        if (res.error) throw new Error(res.error);
      }
      setEditingId(null);
    } catch (e: any) {
      setError(e.message || "Error al guardar participación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.tableContainer}>
      <h3 style={{ padding: "1.5rem 1.5rem 0", margin: 0 }}>Historial y Participaciones</h3>
      
      {error && (
        <div style={{ padding: "0 1.5rem", color: "var(--red-dark)", marginTop: "1rem" }}>
          <strong>Error: </strong> {error}
        </div>
      )}

      <table className={styles.adminTable} style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Brigada</th>
            <th>Fecha</th>
            <th>Área Asignada</th>
            <th>Llegada</th>
            <th>Salida</th>
            <th>Asistencia</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {participaciones.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                No se registran participaciones ni asignaciones a brigadas.
              </td>
            </tr>
          ) : (
            participaciones.map(p => {
              const isEditing = editingId === p.brigada_id;

              return (
                <tr key={p.brigada_id}>
                  <td style={{ fontWeight: 500 }}>
                    {p.brigada?.nombre || `ID: ${p.brigada_id.substring(0,8)}...`}
                  </td>
                  <td>
                    {p.brigada?.fecha_brigada ? new Date(p.brigada.fecha_brigada).toLocaleDateString() : "N/A"}
                  </td>
                  <td>
                    {/* El área asignada viene de la tarjeta de asignaciones pero la mostraremos si la pasamos */}
                    {(p as any).area_asignada || <span style={{ color: "var(--gray)" }}>Sin asignar</span>}
                  </td>
                  <td>
                    {isEditing ? (
                      <input 
                        type="time" 
                        value={horaLlegada} 
                        onChange={e => setHoraLlegada(e.target.value)} 
                        style={{ padding: "0.8rem", borderRadius: "4px", border: "1px solid var(--border-color)", width: "100%" }}
                      />
                    ) : (
                      p.hora_llegada || "--:--"
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input 
                        type="time" 
                        value={horaSalida} 
                        onChange={e => setHoraSalida(e.target.value)} 
                        style={{ padding: "0.8rem", borderRadius: "4px", border: "1px solid var(--border-color)", width: "100%" }}
                      />
                    ) : (
                      p.hora_salida || "--:--"
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                        <input 
                          type="checkbox" 
                          checked={asistencia}
                          onChange={e => setAsistencia(e.target.checked)}
                          style={{ width: "16px", height: "16px" }}
                        />
                        Asistió
                      </label>
                    ) : (
                      <span style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "1rem",
                        fontSize: "0.85rem",
                        backgroundColor: p.asistencia ? "var(--green-light, #d1fae5)" : "var(--red-light, #fee2e2)",
                        color: p.asistencia ? "var(--green-dark, #065f46)" : "var(--red-dark, #991b1b)",
                        fontWeight: 500,
                      }}>
                        {p.asistencia ? "Sí" : (p.id ? "No" : "Pendiente")}
                      </span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button 
                          className={styles.btnPrimary} 
                          onClick={() => handleSave(p)}
                          disabled={loading}
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                        >
                          {loading ? "..." : "Guardar"}
                        </button>
                        <button 
                          className={styles.btnSecondary} 
                          onClick={handleCancel}
                          disabled={loading}
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button 
                        className={styles.btnSecondary} 
                        onClick={() => handleEdit(p)}
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                      >
                        Editar Participación
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
