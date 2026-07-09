"use client";

import React, { useState, useEffect } from "react";
import { getPacientesAtendidos, getPacientesDashboard } from "@/lib/db/pacientes";
import { getBrigadas } from "@/lib/db/brigadas";
import styles from "@/styles/pages/admin.module.css";
import { useRouter } from "next/navigation";

export function PacientesClient() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [todasLasBrigadas, setTodasLasBrigadas] = useState<any[]>([]);
  const [filtroBrigada, setFiltroBrigada] = useState<string>("todas");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [pacs, dash, brigs] = await Promise.all([
        getPacientesAtendidos(),
        getPacientesDashboard(),
        getBrigadas()
      ]);
      setPacientes(pacs);
      setDashboard(dash);
      setTodasLasBrigadas(brigs.data || []);
    } catch (error) {
      console.error("Error al cargar pacientes", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (mounted) fetchData();
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>
      
      {/* Dashboard Top */}
      {dashboard && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Total Pacientes</h3>
            </div>
            <p className={styles.statValue}>{dashboard.pacientes}</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Hombres Atendidos</h3>
            </div>
            <p className={styles.statValue}>{dashboard.hombres}</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>Mujeres Atendidas</h3>
            </div>
            <p className={styles.statValue}>{dashboard.mujeres}</p>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div>
            <h3>Listado de Atenciones</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "1.4rem", marginTop: "0.4rem" }}>
              Historial de expedientes digitados por brigada.
            </p>
          </div>
          <div>
            <button 
              className={styles.btnPrimary} 
              onClick={() => router.push("/administracion/pacientes/nuevo")}
            >
              + Nuevo Expediente
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.6rem", padding: "0 2.4rem" }}>
          <label style={{ fontSize: "1.4rem", fontWeight: "600", color: "var(--text-color)" }}>Filtrar por Brigada:</label>
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
                <th>Código</th>
                <th>Paciente</th>
                <th>Brigada</th>
                <th>Consulta</th>
                <th>Médico Atendió</th>
                <th>Fecha Digitado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                    Cargando expedientes...
                  </td>
                </tr>
              ) : (() => {
                const filtered = filtroBrigada === "todas"
                  ? pacientes
                  : pacientes.filter(p => p.brigada_id === filtroBrigada);
                return filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                      No hay expedientes registrados en esta brigada.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: "bold" }}>{p.codigo}</td>
                      <td>{p.paciente}</td>
                      <td>{p.brigada}</td>
                      <td>
                        <span className={`${styles.badge} ${p.tipo_consulta === 'Odontologica' ? styles.badgeInfo : styles.badgeSuccess}`}>
                          {p.tipo_consulta}
                        </span>
                      </td>
                      <td>{p.medico || "-"}</td>
                      <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
