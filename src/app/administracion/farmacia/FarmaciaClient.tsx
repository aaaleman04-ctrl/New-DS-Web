"use client";

import React, { useState, useEffect } from "react";
import { getDashboardFarmacia, getEntregasFarmacia, getRecetasPendientes, getFefoSuggestions, registrarEntregaManual } from "@/lib/db/farmacia";
import { getBrigadas } from "@/lib/db/brigadas";
import styles from "@/styles/pages/admin.module.css";

export function FarmaciaClient({ userId }: { userId: string }) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [entregas, setEntregas] = useState<any[]>([]);
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [todasLasBrigadas, setTodasLasBrigadas] = useState<any[]>([]);
  const [filtroBrigada, setFiltroBrigada] = useState<string>("todas");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pendientes" | "historial">("pendientes");
  const [currentPagePendientes, setCurrentPagePendientes] = useState(1);
  const [currentPageHistorial, setCurrentPageHistorial] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPagePendientes(1);
    setCurrentPageHistorial(1);
  }, [filtroBrigada, activeTab]);
  
  const entregadoPorId = userId;

  // Modal State
  const [selectedConsulta, setSelectedConsulta] = useState<any>(null);
  const [fefoSuggestions, setFefoSuggestions] = useState<any[]>([]);
  const [observaciones, setObservaciones] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dash, hist, pend, brigs] = await Promise.all([
        getDashboardFarmacia(),
        getEntregasFarmacia(),
        getRecetasPendientes(),
        getBrigadas()
      ]);
      setDashboard(dash);
      setEntregas(hist);
      setPendientes(pend);
      setTodasLasBrigadas(brigs.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const openEntregaModal = async (receta: any) => {
    setSelectedConsulta(receta);
    setObservaciones("");
    setIsModalOpen(true);
    setIsSubmitting(true);
    try {
      const suggestions = await getFefoSuggestions(receta.id);
      setFefoSuggestions(suggestions);
    } catch (e: any) {
      alert("Error al calcular FEFO: " + e.message);
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCantidadChange = (idx: number, newCantidad: number) => {
    const updated = [...fefoSuggestions];
    updated[idx].cantidad_sugerida = newCantidad;
    setFefoSuggestions(updated);
  };

  const handleConfirmarEntrega = async () => {
    if (fefoSuggestions.some(s => s.error)) {
      alert("No se puede entregar. Hay medicamentos agotados. Ajusta las cantidades.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registrarEntregaManual(fefoSuggestions, observaciones, selectedConsulta.id, entregadoPorId);
      alert("Entrega registrada exitosamente. Inventario actualizado.");
      setIsModalOpen(false);
      fetchData();
    } catch (e: any) {
      alert("Error al procesar la entrega: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem", position: "relative" }}>
      
      {/* Modal */}
      {isModalOpen && selectedConsulta && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", width: "95%" }}>
            <div className={styles.modalHeader}>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "700" }}>Registrar Entrega a Paciente</h3>
              <button className={styles.modalClose} onClick={() => setIsModalOpen(false)} title="Cerrar" aria-label="Cerrar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ padding: "2.4rem" }}>
              <div className={styles.formSectionTitle}>1. Información del Paciente y Receta</div>
              <div style={{ marginBottom: "2rem", color: "var(--gray)", fontSize: "1.4rem", background: "var(--bg-secondary)", padding: "1.2rem", borderRadius: "var(--radius-sm)" }}>
                <strong>Paciente:</strong> {selectedConsulta.pacientes?.nombres} {selectedConsulta.pacientes?.apellidos} <br />
                <strong>Fecha Receta:</strong> {new Date(selectedConsulta.created_at).toLocaleDateString()}
              </div>

              <div className={styles.formSectionTitle}>2. Asignación de Lotes (Automático FEFO)</div>
              <table className={styles.adminTable} style={{ marginBottom: "2rem" }}>
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Lote</th>
                    <th>Stock Lote</th>
                    <th>Cant. Solicitada</th>
                    <th>Cant. a Entregar</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {isSubmitting && fefoSuggestions.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center" }}>Calculando lotes FEFO...</td></tr>
                  ) : fefoSuggestions.map((s, idx) => (
                    <tr key={idx} style={{ background: s.error ? "rgba(255,0,0,0.05)" : s.warning ? "rgba(255,200,0,0.05)" : "transparent" }}>
                      <td style={{ fontWeight: "bold" }}>{s.medicamento_nombre}</td>
                      <td>{s.lote_numero}</td>
                      <td>{s.stock_disponible}</td>
                      <td>{s.cantidad_requerida}</td>
                      <td>
                        <input 
                          type="number" 
                          min="0" 
                          max={s.stock_disponible} 
                          value={s.cantidad_sugerida} 
                          onChange={(e) => handleCantidadChange(idx, Number(e.target.value))}
                          style={{ width: "70px", padding: "0.4rem" }}
                          disabled={!!s.error}
                        />
                      </td>
                      <td style={{ color: s.error ? "red" : s.warning ? "orange" : "green" }}>
                        {s.error || s.warning || "Stock suficiente"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <form className={styles.adminFormSingleColumn} onSubmit={(e) => { e.preventDefault(); handleConfirmarEntrega(); }}>
                <div className={styles.formSectionTitle}>3. Observaciones y Confirmación</div>
                <label className={styles.formField} style={{ marginBottom: "2rem" }}>
                  <span className={styles.fieldLabel}>
                    Observaciones de Entrega <span className={styles.optionalTag}>(Opcional)</span>
                  </span>
                  <textarea 
                    rows={2} 
                    value={observaciones} 
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Opcional: Ej. Paciente rechazó un medicamento..."
                  />
                </label>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" className={styles.btnPrimary} disabled={isSubmitting || fefoSuggestions.length === 0}>
                    {isSubmitting ? "Procesando Entrega..." : "Confirmar Entrega de Medicamentos"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* Dashboard Top */}
      {dashboard && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Pacientes Atendidos</h3>
            </div>
            <p className={styles.statValue}>{dashboard.pacientes_atendidos || 0}</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Líneas de Entrega</h3>
            </div>
            <p className={styles.statValue}>{dashboard.total_entregas || 0}</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Unidades Entregadas</h3>
            </div>
            <p className={styles.statValue}>{dashboard.total_unidades_entregadas || 0}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("pendientes")}
          style={{
            padding: "0.8rem 1.6rem",
            borderRadius: "var(--radius-sm)",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            background: activeTab === "pendientes" ? "var(--primaryColor)" : "transparent",
            color: activeTab === "pendientes" ? "white" : "var(--gray)"
          }}
        >
          Recetas Pendientes ({pendientes.length})
        </button>
        <button
          onClick={() => setActiveTab("historial")}
          style={{
            padding: "0.8rem 1.6rem",
            borderRadius: "var(--radius-sm)",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            background: activeTab === "historial" ? "var(--primaryColor)" : "transparent",
            color: activeTab === "historial" ? "white" : "var(--gray)"
          }}
        >
          Historial de Entregas
        </button>
      </div>

      {/* Main Table Container */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>{activeTab === "pendientes" ? "Recetas Pendientes de Entrega" : "Historial de Medicamentos Entregados"}</h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.6rem", padding: "0 2.4rem" }}>
          <label style={{ fontSize: "1.4rem", fontWeight: "600", color: "var(--text-color)" }}>
            {activeTab === "pendientes" ? "Filtrar por Brigada Activa:" : "Filtrar por Brigada:"}
          </label>
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
            {todasLasBrigadas
              .filter(b => activeTab !== "pendientes" || (b.estado !== "finalizada" && b.estado !== "cancelada"))
              .map(b => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          {activeTab === "pendientes" ? (
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Fecha Consulta</th>
                  <th>Paciente</th>
                  <th>Medicamentos Recetados</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>Cargando...</td>
                  </tr>
              ) : (() => {
                  const filtered = filtroBrigada === "todas"
                    ? pendientes
                    : pendientes.filter(p => p.brigada_id === filtroBrigada);
                  const paginated = filtered.slice((currentPagePendientes - 1) * itemsPerPage, currentPagePendientes * itemsPerPage);
                  return filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                        No hay recetas pendientes en esta brigada.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((p) => (
                      <tr key={p.id}>
                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                        <td style={{ fontWeight: "bold" }}>{p.pacientes?.nombres} {p.pacientes?.apellidos}</td>
                        <td>
                          <ul style={{ paddingLeft: "2rem", margin: 0 }}>
                            {p.medicamentos_consulta?.map((m: any, idx: number) => (
                              <li key={idx}>
                                {m.cantidad}x {m.medicamentos?.nombre} 
                                {m.indicaciones && <span style={{ color: "var(--gray)", fontSize: "0.9em" }}> ({m.indicaciones})</span>}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td>
                          <button 
                            className={styles.btnPrimary}
                            onClick={() => openEntregaModal(p)}
                          >
                            Realizar Entrega
                          </button>
                        </td>
                      </tr>
                    ))
                  );
                })()}
              </tbody>
            </table>
          ) : (
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Fecha Entrega</th>
                  <th>Paciente</th>
                  <th>Medicamento</th>
                  <th>Cantidad</th>
                  <th>Lote</th>
                  <th>Vencimiento</th>
                  <th>Entregado Por</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>Cargando...</td>
                  </tr>
              ) : (() => {
                  const filtered = filtroBrigada === "todas"
                    ? entregas
                    : entregas.filter(e => e.brigada_id === filtroBrigada);
                  const paginated = filtered.slice((currentPageHistorial - 1) * itemsPerPage, currentPageHistorial * itemsPerPage);
                  return filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                        No hay historial de entregas para esta brigada.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((e) => (
                      <tr key={e.id}>
                        <td>{new Date(e.fecha_entrega).toLocaleDateString()}</td>
                        <td style={{ fontWeight: "bold" }}>{e.paciente}</td>
                        <td>{e.medicamento}</td>
                        <td style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{e.cantidad}</td>
                        <td><span className={`${styles.badge} ${styles.badgeWarning}`}>{e.numero_lote}</span></td>
                        <td>{new Date(e.fecha_vencimiento).toLocaleDateString()}</td>
                        <td style={{ color: "var(--gray)" }}>{e.entregado_por}</td>
                      </tr>
                    ))
                  );
                })()}
              </tbody>
            </table>
          )}
        </div>
        
        {(() => {
          const list = activeTab === "pendientes" ? pendientes : entregas;
          const filtered = filtroBrigada === "todas"
            ? list
            : list.filter(item => item.brigada_id === filtroBrigada);
          const totalPages = Math.ceil(filtered.length / itemsPerPage);
          if (totalPages <= 1) return null;
          const curPage = activeTab === "pendientes" ? currentPagePendientes : currentPageHistorial;
          const setCurPage = activeTab === "pendientes" ? setCurrentPagePendientes : setCurrentPageHistorial;

          return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "2rem", padding: "1.5rem" }}>
              <button 
                disabled={curPage === 1} 
                onClick={() => setCurPage(prev => Math.max(prev - 1, 1))}
                className={styles.btnSecondary}
                style={{ padding: "0.6rem 1.2rem", cursor: curPage === 1 ? "not-allowed" : "pointer", opacity: curPage === 1 ? 0.5 : 1 }}
              >
                Anterior
              </button>
              <span style={{ fontSize: "1.3rem", fontWeight: "600" }}>Página {curPage} de {totalPages}</span>
              <button 
                disabled={curPage === totalPages} 
                onClick={() => setCurPage(prev => Math.min(prev + 1, totalPages))}
                className={styles.btnSecondary}
                style={{ padding: "0.6rem 1.2rem", cursor: curPage === totalPages ? "not-allowed" : "pointer", opacity: curPage === totalPages ? 0.5 : 1 }}
              >
                Siguiente
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
