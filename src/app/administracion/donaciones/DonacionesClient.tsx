"use client";

import React, { useState, useEffect } from "react";
import { getDonacionesRopa, getEntregasRopa, getResumenRopa, getDashboardRopa, createDonacionRopa, createEntregaRopa, getPacientesBrigadaParaRopa } from "@/lib/db/ropa";
import { getBrigadas } from "@/lib/db/brigadas";
import styles from "@/styles/pages/admin.module.css";

export function DonacionesClient({ userId }: { userId: string }) {
  const [resumen, setResumen] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [donaciones, setDonaciones] = useState<any[]>([]);
  const [entregas, setEntregas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"donaciones" | "entregas">("donaciones");
  const [filtroBrigada, setFiltroBrigada] = useState<string>("todas");
  const [brigadasActivas, setBrigadasActivas] = useState<any[]>([]);
  const [todasLasBrigadas, setTodasLasBrigadas] = useState<any[]>([]);
  const [currentPageDonaciones, setCurrentPageDonaciones] = useState(1);
  const [currentPageEntregas, setCurrentPageEntregas] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPageDonaciones(1);
    setCurrentPageEntregas(1);
  }, [filtroBrigada, activeTab]);

  // Donacion Modal
  const [isDonacionModalOpen, setIsDonacionModalOpen] = useState(false);
  const [donacionForm, setDonacionForm] = useState({ fecha_donacion: new Date().toISOString().split('T')[0], nombre_donante: "", cantidad_prendas: 1, observaciones: "" });

  // Entrega Modal
  const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);
  const [pacientesElegibles, setPacientesElegibles] = useState<any[]>([]);
  const [entregaForm, setEntregaForm] = useState({ brigada_id: "", paciente_id: "", cantidad_prendas: 1, observaciones: "" });
  const [isFetchingPacientes, setIsFetchingPacientes] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [res, dash, d, e, b] = await Promise.all([
        getResumenRopa(),
        getDashboardRopa(),
        getDonacionesRopa(),
        getEntregasRopa(),
        getBrigadas()
      ]);
      setResumen(res);
      setDashboard(dash);
      setDonaciones(d);
      setEntregas(e);
      setTodasLasBrigadas(b.data || []);
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

  const openDonacionModal = () => {
    setDonacionForm({ fecha_donacion: new Date().toISOString().split('T')[0], nombre_donante: "", cantidad_prendas: 1, observaciones: "" });
    setIsDonacionModalOpen(true);
  };

  const submitDonacion = async () => {
    if (donacionForm.cantidad_prendas <= 0) return alert("Cantidad inválida");
    try {
      await createDonacionRopa(donacionForm);
      setIsDonacionModalOpen(false);
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const openEntregaModal = async () => {
    setIsEntregaModalOpen(true);
    setEntregaForm({ brigada_id: "", paciente_id: "", cantidad_prendas: 1, observaciones: "" });
    setPacientesElegibles([]);
    try {
      const bRes = await getBrigadas();
      const activas = bRes.data?.filter(b => b.estado !== 'finalizada' && b.estado !== 'cancelada') || [];
      setBrigadasActivas(activas);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBrigadaChange = async (brigadaId: string) => {
    setEntregaForm(prev => ({ ...prev, brigada_id: brigadaId, paciente_id: "" }));
    setPacientesElegibles([]);
    if (!brigadaId) return;
    
    setIsFetchingPacientes(true);
    try {
      const pacs = await getPacientesBrigadaParaRopa(brigadaId);
      setPacientesElegibles(pacs);
    } catch (e: any) {
      alert("Error cargando pacientes: " + e.message);
    } finally {
      setIsFetchingPacientes(false);
    }
  };

  const submitEntrega = async () => {
    if (!entregaForm.brigada_id || !entregaForm.paciente_id) return alert("Seleccione brigada y paciente");
    if (entregaForm.cantidad_prendas < 1 || entregaForm.cantidad_prendas > 2) return alert("Máximo 2 prendas por paciente");
    
    // Check if patient selected has enough availability
    const pac = pacientesElegibles.find(p => p.id === entregaForm.paciente_id);
    if (!pac || entregaForm.cantidad_prendas > pac.prendasDisponibles) {
      return alert("El paciente no puede recibir esa cantidad de prendas. Límite: 2 por paciente.");
    }

    try {
      await createEntregaRopa({
        ...entregaForm,
        entregado_por: userId
      });
      setIsEntregaModalOpen(false);
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
            <h3>Prendas Donadas</h3>
          </div>
          <p className={styles.statValue}>{resumen?.prendas_donadas || 0}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3>Prendas Entregadas</h3>
          </div>
          <p className={styles.statValue}>{dashboard?.prendas_entregadas || 0}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3>Pacientes Beneficiados</h3>
          </div>
          <p className={styles.statValue}>{dashboard?.pacientes_beneficiados || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("donaciones")}
          style={{
            padding: "0.8rem 1.6rem", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", fontWeight: "bold",
            background: activeTab === "donaciones" ? "var(--primaryColor)" : "transparent",
            color: activeTab === "donaciones" ? "white" : "var(--gray)"
          }}
        >
          Donaciones Recibidas ({donaciones.length})
        </button>
        <button
          onClick={() => setActiveTab("entregas")}
          style={{
            padding: "0.8rem 1.6rem", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", fontWeight: "bold",
            background: activeTab === "entregas" ? "var(--primaryColor)" : "transparent",
            color: activeTab === "entregas" ? "white" : "var(--gray)"
          }}
        >
          Ropa Entregada ({entregas.length})
        </button>
      </div>

      {/* Tables */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>{activeTab === "donaciones" ? "Historial de Donaciones" : "Ropa Entregada en Brigadas"}</h3>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className={styles.btnSecondary} onClick={openDonacionModal}>
              + Nueva Donación
            </button>
            <button className={styles.btnPrimary} onClick={openEntregaModal}>
              + Registrar Entrega
            </button>
          </div>
        </div>

        {activeTab === "entregas" && (
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
        )}

        <div style={{ overflowX: "auto" }}>
          {activeTab === "donaciones" ? (
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Donante</th>
                  <th>Cant. Prendas</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (<tr><td colSpan={5} style={{textAlign: "center"}}>Cargando...</td></tr>) :
                 donaciones.length === 0 ? (<tr><td colSpan={5} style={{textAlign: "center", color:"var(--gray)"}}>No hay donaciones registradas</td></tr>) :
                 donaciones.slice((currentPageDonaciones - 1) * itemsPerPage, currentPageDonaciones * itemsPerPage).map(d => (
                  <tr key={d.id}>
                    <td style={{fontWeight: "bold"}}>{d.codigo}</td>
                    <td>{new Date(d.fecha_donacion).toLocaleDateString()}</td>
                    <td>{d.nombre_donante || "-"}</td>
                    <td style={{fontWeight: "bold", fontSize: "1.2rem"}}>{d.cantidad_prendas}</td>
                    <td>{d.observaciones || "-"}</td>
                  </tr>
                 ))
                }
              </tbody>
            </table>
          ) : (
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Brigada</th>
                  <th>Paciente</th>
                  <th>Prendas</th>
                  <th>Entregado Por</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (<tr><td colSpan={6} style={{textAlign: "center"}}>Cargando...</td></tr>) :
                 (() => {
                   const filtered = filtroBrigada === "todas"
                     ? entregas
                     : entregas.filter(e => e.brigada_id === filtroBrigada);
                   const paginated = filtered.slice((currentPageEntregas - 1) * itemsPerPage, currentPageEntregas * itemsPerPage);
                   return filtered.length === 0 ? (
                     <tr><td colSpan={6} style={{textAlign: "center", color:"var(--gray)"}}>No hay entregas registradas en esta brigada</td></tr>
                   ) : (
                     paginated.map(e => (
                       <tr key={e.id}>
                         <td>{new Date(e.fecha_entrega).toLocaleDateString()}</td>
                         <td>{e.brigadas?.nombre}</td>
                         <td style={{fontWeight: "bold"}}>{e.pacientes?.nombres} {e.pacientes?.apellidos}</td>
                         <td style={{fontWeight: "bold", fontSize: "1.2rem"}}>{e.cantidad_prendas}</td>
                         <td>{e.perfiles?.nombre_completo}</td>
                         <td>{e.observaciones || "-"}</td>
                       </tr>
                     ))
                   );
                 })()
                }
              </tbody>
            </table>
          )}
        </div>

        {(() => {
          const list = activeTab === "donaciones" ? donaciones : entregas;
          const filtered = activeTab === "donaciones"
            ? list
            : list.filter(item => filtroBrigada === "todas" || item.brigada_id === filtroBrigada);
          const totalPages = Math.ceil(filtered.length / itemsPerPage);
          if (totalPages <= 1) return null;
          const curPage = activeTab === "donaciones" ? currentPageDonaciones : currentPageEntregas;
          const setCurPage = activeTab === "donaciones" ? setCurrentPageDonaciones : setCurrentPageEntregas;

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

      {/* Modal Donacion */}
      {isDonacionModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.modalSm}`}>
            <div className={styles.modalHeader}>
              <h3>Registrar Donación de Ropa</h3>
              <button className={styles.modalClose} onClick={() => setIsDonacionModalOpen(false)}>&times;</button>
            </div>
            <div style={{ padding: "2.4rem" }}>
              <form className={styles.adminForm} onSubmit={(e) => { e.preventDefault(); submitDonacion(); }}>
                <div className={styles.formField}>
                  <label>Fecha de Donación *</label>
                  <input type="date" value={donacionForm.fecha_donacion} onChange={e => setDonacionForm({...donacionForm, fecha_donacion: e.target.value})} required />
                </div>
                <div className={styles.formField}>
                  <label>Donante</label>
                  <input value={donacionForm.nombre_donante} onChange={e => setDonacionForm({...donacionForm, nombre_donante: e.target.value})} placeholder="Nombre de la persona o institución" />
                </div>
                <div className={styles.formField}>
                  <label>Cantidad de Prendas *</label>
                  <input type="number" min="1" value={donacionForm.cantidad_prendas} onChange={e => setDonacionForm({...donacionForm, cantidad_prendas: Number(e.target.value)})} required />
                </div>
                <div className={styles.formField}>
                  <label>Observaciones</label>
                  <textarea rows={2} value={donacionForm.observaciones} onChange={e => setDonacionForm({...donacionForm, observaciones: e.target.value})} />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setIsDonacionModalOpen(false)}>Cancelar</button>
                  <button type="submit" className={styles.btnPrimary}>Guardar Donación</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Entrega */}
      {isEntregaModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.modalSm}`}>
            <div className={styles.modalHeader}>
              <h3>Registrar Entrega a Paciente</h3>
              <button className={styles.modalClose} onClick={() => setIsEntregaModalOpen(false)}>&times;</button>
            </div>
            <div style={{ padding: "2.4rem" }}>
              <form className={styles.adminForm} onSubmit={(e) => { e.preventDefault(); submitEntrega(); }}>
                <div className={styles.formField}>
                  <label>Brigada Activa *</label>
                  <select value={entregaForm.brigada_id} onChange={e => handleBrigadaChange(e.target.value)} required>
                    <option value="">-- Seleccionar Brigada --</option>
                    {brigadasActivas.map(b => (
                      <option key={b.id} value={b.id}>{b.nombre}</option>
                    ))}
                  </select>
                </div>

                {isFetchingPacientes && <p style={{color: "var(--gray)", marginBottom: "1.6rem"}}>Cargando pacientes de la brigada...</p>}

                {entregaForm.brigada_id && !isFetchingPacientes && (
                  <div className={styles.formField}>
                    <label>Paciente (Elegibles para Ropa) *</label>
                    <select value={entregaForm.paciente_id} onChange={e => setEntregaForm({...entregaForm, paciente_id: e.target.value})} required>
                      <option value="">-- Seleccionar Paciente --</option>
                      {pacientesElegibles.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombres} {p.apellidos} (Max. disp: {p.prendasDisponibles})
                        </option>
                      ))}
                    </select>
                    {pacientesElegibles.length === 0 && <span style={{fontSize: "1.2rem", color: "var(--danger)", marginTop: "0.4rem", display: "block"}}>No hay pacientes elegibles en esta brigada (o todos ya recibieron sus 2 prendas).</span>}
                  </div>
                )}

                <div className={styles.formField}>
                  <label>Cantidad (Máx 2 por paciente) *</label>
                  <select value={entregaForm.cantidad_prendas} onChange={e => setEntregaForm({...entregaForm, cantidad_prendas: Number(e.target.value)})} required>
                    <option value={1}>1 Prenda</option>
                    <option value={2}>2 Prendas</option>
                  </select>
                </div>

                <div className={styles.formField}>
                  <label>Observaciones</label>
                  <textarea rows={2} value={entregaForm.observaciones} onChange={e => setEntregaForm({...entregaForm, observaciones: e.target.value})} />
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setIsEntregaModalOpen(false)}>Cancelar</button>
                  <button type="submit" className={styles.btnPrimary} disabled={!entregaForm.paciente_id}>Registrar Entrega</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
