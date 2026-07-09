"use client";

import React, { useState, useEffect } from "react";
import { getActividades, getDashboardActividades, createActividad, addParticipantesActividad } from "@/lib/db/actividades";
import { getBrigadas } from "@/lib/db/brigadas";
import styles from "@/styles/pages/admin.module.css";

export function ActividadesClient({ userId }: { userId: string }) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [actividades, setActividades] = useState<any[]>([]);
  const [brigadas, setBrigadas] = useState<any[]>([]);
  const [todasLasBrigadas, setTodasLasBrigadas] = useState<any[]>([]);
  const [filtroBrigada, setFiltroBrigada] = useState<string>("todas");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroBrigada]);

  // Modals
  const [isActividadModalOpen, setIsActividadModalOpen] = useState(false);
  const [isParticipantesModalOpen, setIsParticipantesModalOpen] = useState(false);

  // Forms
  const [actividadForm, setActividadForm] = useState({ brigada_id: "", nombre: "", descripcion: "", cantidad_regalos: 0 });
  const [participantesForm, setParticipantesForm] = useState({ actividad_id: "", cantidad_ninos: 1 });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dash, acts, brigs] = await Promise.all([
        getDashboardActividades(),
        getActividades(),
        getBrigadas()
      ]);
      setDashboard(dash);
      setActividades(acts);
      setTodasLasBrigadas(brigs.data || []);
      setBrigadas(brigs.data?.filter(b => b.estado !== "finalizada" && b.estado !== "cancelada") || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const submitActividad = async () => {
    if (!actividadForm.brigada_id || !actividadForm.nombre) return alert("Completa los campos requeridos");
    try {
      await createActividad({ ...actividadForm, responsable_id: userId });
      setIsActividadModalOpen(false);
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const openParticipantesModal = (actividadId: string) => {
    setParticipantesForm({ actividad_id: actividadId, cantidad_ninos: 1 });
    setIsParticipantesModalOpen(true);
  };

  const submitParticipantes = async () => {
    if (participantesForm.cantidad_ninos <= 0) return alert("Cantidad inválida");
    try {
      await addParticipantesActividad(participantesForm.actividad_id, participantesForm.cantidad_ninos);
      setIsParticipantesModalOpen(false);
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3>Total Actividades</h3>
          </div>
          <p className={styles.statValue}>{dashboard?.actividades || 0}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3>Niños Beneficiados</h3>
          </div>
          <p className={styles.statValue}>{dashboard?.ninos_beneficiados || 0}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3>Regalos Entregados</h3>
          </div>
          <p className={styles.statValue}>{actividades.reduce((sum, act) => sum + (act.cantidad_regalos || 0), 0)}</p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>Historial de Actividades</h3>
          <button className={styles.btnPrimary} onClick={() => {
            setActividadForm({ brigada_id: "", nombre: "", descripcion: "", cantidad_regalos: 0 });
            setIsActividadModalOpen(true);
          }}>
            + Nueva Actividad
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.6rem", padding: "0 2.4rem" }}>
          <label style={{ fontSize: "1.4rem", fontWeight: "600", color: "var(--text-color)" }}>Filtrar Historial por Brigada:</label>
          <select
            value={filtroBrigada}
            onChange={e => setFiltroBrigada(e.target.value)}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border-color)",
              background: "var(--white)",
              color: "var(--text-color)",
              fontSize: "1.4rem"
            }}
          >
            <option value="todas">Todas las Brigadas</option>
            {todasLasBrigadas.map(b => (
              <option key={b.id} value={b.id}>{b.nombre}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Actividad</th>
                <th>Brigada</th>
                <th>Regalos Entregados</th>
                <th>Niños Registrados</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (<tr><td colSpan={6} style={{ textAlign: "center" }}>Cargando...</td></tr>) :
               (() => {
                  const filtered = filtroBrigada === "todas"
                    ? actividades
                    : actividades.filter(act => act.brigada_id === filtroBrigada);
                  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                  return filtered.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--gray)" }}>No hay actividades registradas en esta brigada.</td></tr>
                  ) : (
                    paginated.map(act => (
                      <tr key={act.id}>
                        <td>{new Date(act.created_at).toLocaleDateString()}</td>
                        <td style={{ fontWeight: "bold" }}>
                          {act.nombre}
                          {act.descripcion && <div style={{ fontSize: "1.2rem", color: "var(--gray)", fontWeight: "normal" }}>{act.descripcion}</div>}
                        </td>
                        <td>{act.brigadas?.nombre}</td>
                        <td style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{act.cantidad_regalos}</td>
                        <td style={{ fontWeight: "bold", fontSize: "1.2rem", color: "var(--primaryColor)" }}>{act.total_ninos}</td>
                        <td>
                          <button className={styles.btnSecondary} onClick={() => openParticipantesModal(act.id)}>
                            + Sumar Niños
                          </button>
                        </td>
                      </tr>
                    ))
                  );
                })()
              }
            </tbody>
          </table>
        </div>

        {(() => {
          const filtered = filtroBrigada === "todas"
            ? actividades
            : actividades.filter(act => act.brigada_id === filtroBrigada);
          const totalPages = Math.ceil(filtered.length / itemsPerPage);
          if (totalPages <= 1) return null;
          return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "2rem", padding: "1.5rem" }}>
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={styles.btnSecondary}
                style={{ padding: "0.6rem 1.2rem", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Anterior
              </button>
              <span style={{ fontSize: "1.3rem", fontWeight: "600" }}>Página {currentPage} de {totalPages}</span>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={styles.btnSecondary}
                style={{ padding: "0.6rem 1.2rem", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Siguiente
              </button>
            </div>
          );
        })()}
      </div>

      {/* Modal Nueva Actividad */}
      {isActividadModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.modalSm}`}>
            <div className={styles.modalHeader}>
              <h3>Crear Actividad Infantil</h3>
              <button className={styles.modalClose} onClick={() => setIsActividadModalOpen(false)}>&times;</button>
            </div>
            <div style={{ padding: "2.4rem" }}>
              <form className={styles.adminForm} onSubmit={(e) => { e.preventDefault(); submitActividad(); }}>
                <div className={styles.formField}>
                  <label>Brigada *</label>
                  <select value={actividadForm.brigada_id} onChange={e => setActividadForm({ ...actividadForm, brigada_id: e.target.value })} required>
                    <option value="">-- Seleccionar Brigada --</option>
                    {brigadas.map(b => (
                      <option key={b.id} value={b.id}>{b.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formField}>
                  <label>Nombre de la Actividad *</label>
                  <input value={actividadForm.nombre} onChange={e => setActividadForm({ ...actividadForm, nombre: e.target.value })} placeholder="Ej. Piñata y dinámicas" required />
                </div>
                <div className={styles.formField}>
                  <label>Descripción</label>
                  <textarea rows={2} value={actividadForm.descripcion} onChange={e => setActividadForm({ ...actividadForm, descripcion: e.target.value })} />
                </div>
                <div className={styles.formField}>
                  <label>Regalos Entregados</label>
                  <input type="number" min="0" value={actividadForm.cantidad_regalos} onChange={e => setActividadForm({ ...actividadForm, cantidad_regalos: Number(e.target.value) })} />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setIsActividadModalOpen(false)}>Cancelar</button>
                  <button type="submit" className={styles.btnPrimary}>Crear Actividad</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sumar Niños */}
      {isParticipantesModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.modalSm}`}>
            <div className={styles.modalHeader}>
              <h3>Registrar Niños</h3>
              <button className={styles.modalClose} onClick={() => setIsParticipantesModalOpen(false)}>&times;</button>
            </div>
            <div style={{ padding: "2.4rem" }}>
              <p style={{ marginBottom: "1.6rem", color: "var(--gray)" }}>Suma participantes a la actividad sin registrar datos personales.</p>
              <form className={styles.adminForm} onSubmit={(e) => { e.preventDefault(); submitParticipantes(); }}>
                <div className={styles.formField}>
                  <label>Cantidad de niños nuevos a sumar *</label>
                  <input type="number" min="1" value={participantesForm.cantidad_ninos} onChange={e => setParticipantesForm({ ...participantesForm, cantidad_ninos: Number(e.target.value) })} required />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setIsParticipantesModalOpen(false)}>Cancelar</button>
                  <button type="submit" className={styles.btnPrimary} style={{ background: "var(--success)" }}>Sumar a la Actividad</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
