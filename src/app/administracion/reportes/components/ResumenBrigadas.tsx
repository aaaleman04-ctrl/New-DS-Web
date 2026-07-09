"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "@/styles/pages/reportes.module.css";
import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";

export interface BrigadaResumenData {
  id: string;
  nombre: string;
  fecha: string;
  comunidad: string;
  departamento: string;
  pacientesAtendidos: number;
  medicosParticipantes: number;
  odontologosParticipantes: number;
  recetasEntregadas: number;
}

export default function ResumenBrigadas() {
  const { role } = usePermissions();
  const userRole = role ? ROLE_LABELS[role] : "ADMINISTRADOR";
  const [anio, setAnio] = useState<string>("todos");
  const [brigadasList, setBrigadasList] = useState<BrigadaResumenData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchBrigadasSummary() {
      setLoading(true);
      try {
        // 1. Fetch all brigadas
        const { data: brigadasData, error: brigadasError } = await supabase
          .from("brigadas")
          .select("id, codigo, nombre, fecha_brigada, municipio, departamento, lugar");
        if (brigadasError) throw brigadasError;

        // 2. Fetch all patients to calculate counts
        const { data: patientsData, error: patientsError } = await supabase
          .from("pacientes")
          .select("id, brigada_id");
        if (patientsError) throw patientsError;

        const patientCounts: Record<string, number> = {};
        (patientsData || []).forEach((p) => {
          if (p.brigada_id) {
            patientCounts[p.brigada_id] = (patientCounts[p.brigada_id] || 0) + 1;
          }
        });

        // 3. Fetch assignments to calculate medical / dental counts
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from("asignaciones_voluntarios")
          .select("id, brigada_id, area_asignada");
        if (assignmentsError) throw assignmentsError;

        const medicoCounts: Record<string, number> = {};
        const odontologoCounts: Record<string, number> = {};
        (assignmentsData || []).forEach((a) => {
          if (a.brigada_id) {
            if (a.area_asignada === "consulta_medica") {
              medicoCounts[a.brigada_id] = (medicoCounts[a.brigada_id] || 0) + 1;
            } else if (a.area_asignada === "consulta_odontologica") {
              odontologoCounts[a.brigada_id] = (odontologoCounts[a.brigada_id] || 0) + 1;
            }
          }
        });

        // 4. Fetch deliveries to calculate prescriptions
        const { data: deliveriesData, error: deliveriesError } = await supabase
          .from("entregas_farmacia")
          .select("id, consultas (brigada_id)");
        if (deliveriesError) throw deliveriesError;

        const deliveryCounts: Record<string, number> = {};
        (deliveriesData || []).forEach((d: { id: string; consultas: { brigada_id: string | null } | null }) => {
          const bId = d.consultas?.brigada_id;
          if (bId) {
            deliveryCounts[bId] = (deliveryCounts[bId] || 0) + 1;
          }
        });

        const formatted: BrigadaResumenData[] = (brigadasData || []).map((b) => {
          return {
            id: b.codigo || b.id.slice(0, 8).toUpperCase(),
            nombre: b.nombre || "Brigada sin Nombre",
            fecha: b.fecha_brigada,
            comunidad: b.municipio || b.lugar || "Comunidad N/A",
            departamento: b.departamento || "N/A",
            pacientesAtendidos: patientCounts[b.id] || 0,
            medicosParticipantes: medicoCounts[b.id] || 0,
            odontologosParticipantes: odontologoCounts[b.id] || 0,
            recetasEntregadas: deliveryCounts[b.id] || 0,
          };
        });

        setBrigadasList(formatted);
      } catch (err) {
        console.error("Error loading brigadas report:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBrigadasSummary();
  }, []);

  // Dynamically extract unique years
  const aniosDisponibles = Array.from(
    new Set(
      brigadasList
        .map((b) => {
          try {
            return new Date(b.fecha).getFullYear().toString();
          } catch {
            return null;
          }
        })
        .filter(Boolean)
    )
  ).sort() as string[];

  const datos = [...brigadasList]
    .filter((b) => {
      if (anio === "todos") return true;
      try {
        return new Date(b.fecha).getFullYear().toString() === anio;
      } catch {
        return false;
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  // Totales
  const totalPacientes = datos.reduce((acc, b) => acc + b.pacientesAtendidos, 0);
  const totalRecetas = datos.reduce((acc, b) => acc + b.recetasEntregadas, 0);
  const totalMedicos = datos.reduce((acc, b) => acc + b.medicosParticipantes, 0);
  const totalOdontologos = datos.reduce((acc, b) => acc + b.odontologosParticipantes, 0);

  // Max value for visual bar chart
  const maxPacientes = Math.max(...datos.map((b) => b.pacientesAtendidos), 1);

  const [fechaActualCompleta, setFechaActualCompleta] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFechaActualCompleta(
      new Date().toLocaleDateString("es-HN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

  // Prepare sorted data for print view (chronologically by date ascending)
  const printData = [...datos].sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <div>
      {/* ── VISTA WEB (INTERACTIVA) ── */}
      <div className={styles.screenView}>
        {/* Encabezado */}
        <div className={styles.reportHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div className={styles.reportHeaderText}>
              <h3>Resumen de Brigadas Realizadas</h3>
              <p>
                Informe consolidado de brigadas médicas de atención, especialistas
                en campo e impacto social.
              </p>
            </div>
          </div>
          <div className={styles.reportHeaderActions}>
            <button
              type="button"
              className={styles.btnActionSecondary}
              onClick={() => window.print()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
                />
              </svg>
              Imprimir
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className={styles.reportFilters}>
          <div className={styles.filterGroup}>
            <label htmlFor="brigadas-anio">Periodo Anual</label>
            <select
              id="brigadas-anio"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            >
              <option value="todos">Todos los años</option>
              {aniosDisponibles.map((a) => (
                <option key={a} value={a}>
                  Año {a}
                </option>
              ))}
            </select>
          </div>
          <p
            style={{
              margin: "auto 0 0",
              fontSize: "1.35rem",
              color: "var(--gray)",
              fontStyle: "italic",
            }}
          >
            Datos de atención acumulados de la base de datos de brigadas.
          </p>
        </div>

        {/* KPIs */}
        <div className={styles.kpiGrid}>
          <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
            <p className={styles.kpiLabel}>Brigadas Realizadas</p>
            <p className={styles.kpiValue}>{loading ? "..." : datos.length}</p>
            <p className={styles.kpiChange}>Eventos de atención completados</p>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
            <p className={styles.kpiLabel}>Total Pacientes Atendidos</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : totalPacientes.toLocaleString()}
            </p>
            <p className={`${styles.kpiChange} ${styles.kpiChangePositive}`}>
              Atenciones clínicas & odontológicas
            </p>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiCardTeal}`}>
            <p className={styles.kpiLabel}>Especialistas Aportados</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : totalMedicos + totalOdontologos}
            </p>
            <p className={styles.kpiChange}>
              {totalMedicos} Médicos | {totalOdontologos} Odontólogos
            </p>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
            <p className={styles.kpiLabel}>Recetas Surtidas</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : totalRecetas.toLocaleString()}
            </p>
            <p className={styles.kpiChange}>Medicamentos entregados sin costo</p>
          </div>
        </div>

        {/* Gráfico y Tabla */}
        <div className={styles.financeSection} style={{ padding: "2.4rem" }}>
          <h4
            style={{
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
            }}
          >
            Pacientes Atendidos por Brigada
          </h4>

          {/* Gráfico SVG de Barras Interactivo */}
          <div
            style={{
              height: "240px",
              width: "100%",
              maxWidth: "800px",
              margin: "0 auto 3.2rem",
            }}
          >
            {loading ? (
              <div style={{ textAlign: "center", paddingTop: "50px", color: "var(--grayLight)" }}>
                Cargando gráfico...
              </div>
          ) : datos.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: "50px", color: "var(--grayLight)" }}>
              No hay brigadas registradas para este periodo.
            </div>
          ) : (
            <div className={styles.barChartGrid}>
              {datos.map((b) => {
                const alturaPorcentaje = Math.max(
                  (b.pacientesAtendidos / maxPacientes) * 80,
                  10
                );
                return (
                  <div key={b.id} className={styles.barCol}>
                    <div className={styles.barColTooltip}>
                      {b.pacientesAtendidos} pacientes ({b.recetasEntregadas}{" "}
                      recetas)
                    </div>
                    <div
                      className={styles.chartBarElement}
                      style={{
                        height: `${alturaPorcentaje}%`,
                        backgroundColor: "var(--primaryColor)",
                        width: "4.8rem",
                      }}
                    />
                    <span
                      className={styles.barLabel}
                      style={{ fontSize: "1rem" }}
                    >
                      {b.nombre.replace("Brigada", "").trim()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tabla desglosada */}
        <div style={{ overflowX: "auto" }}>
          <table className={styles.financeTable}>
            <thead>
              <tr>
                <th style={{ width: "3rem" }}>#</th>
                <th>Código</th>
                <th>Nombre de la Brigada</th>
                <th>Fecha de Ejecución</th>
                <th>Ubicación</th>
                <th>Pacientes Atendidos</th>
                <th>Médicos</th>
                <th>Odontólogos</th>
                <th>Recetas Entregadas</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                    Cargando listado de brigadas...
                  </td>
                </tr>
              ) : datos.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                    No se encontraron brigadas registradas.
                  </td>
                </tr>
              ) : (
                datos.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ color: "var(--grayLight)", fontWeight: 600 }}>
                      {idx + 1}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--gray)" }}>
                      {item.id}
                    </td>
                    <td style={{ fontWeight: 700 }}>{item.nombre}</td>
                    <td>
                      {new Date(item.fecha).toLocaleDateString("es-HN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      {item.comunidad} ({item.departamento})
                    </td>
                    <td
                      style={{
                        fontWeight: 700,
                        color: "var(--primaryDark)",
                        textAlign: "center",
                      }}
                    >
                      {item.pacientesAtendidos}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {item.medicosParticipantes}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {item.odontologosParticipantes}
                    </td>
                    <td style={{ fontWeight: 600, textAlign: "center" }}>
                      {item.recetasEntregadas}
                    </td>
                  </tr>
                ))
              )}
              {!loading && datos.length > 0 && (
                <tr className={styles.financeTotalsRow}>
                  <td colSpan={5}>TOTAL ACUMULADO</td>
                  <td style={{ textAlign: "center" }}>{totalPacientes}</td>
                  <td style={{ textAlign: "center" }}>{totalMedicos}</td>
                  <td style={{ textAlign: "center" }}>{totalOdontologos}</td>
                  <td style={{ textAlign: "center" }}>{totalRecetas}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* ── VISTA DE IMPRESIÓN (SIN PAGINAR, CONTINUA) ── */}
      <div className={styles.printView}>
        {/* Encabezado Oficial Institucional */}
        <div style={{ borderBottom: "3px double #000000", paddingBottom: "1rem", marginBottom: "2rem", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <Image
              src="/DS-LOGO.png"
              alt="Logo Dibujando Sonrisas"
              width={35}
              height={35}
              style={{ objectFit: "contain" }}
            />
            <h1 style={{ fontSize: "18pt", fontWeight: "bold", margin: 0, color: "#000000", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Fundación Dibujando Sonrisas
            </h1>
          </div>
          <h2 style={{ fontSize: "13pt", fontWeight: "bold", margin: "0.5rem 0", color: "#000000", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            RESUMEN DE BRIGADAS REALIZADAS
          </h2>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt", color: "#000000", borderTop: "1px solid #000000", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
            <span><strong>Solicitado por:</strong> {userRole}</span>
            <span><strong>Periodo Anual:</strong> {anio === "todos" ? "Todos los años" : anio}</span>
            <span><strong>Ordenamiento:</strong> Cronológico Ascendente</span>
            <span><strong>Fecha de Generación:</strong> {fechaActualCompleta}</span>
          </div>
        </div>

        {/* Resumen de totales para impresión */}
        <div style={{ display: "flex", justifyContent: "space-around", border: "1px solid #000000", padding: "1rem", marginBottom: "1.5rem", fontSize: "10pt", background: "#f8fafc" }}>
          <span><strong>Total Brigadas:</strong> {printData.length}</span>
          <span><strong>Total Atenciones:</strong> {totalPacientes}</span>
          <span><strong>Total Médicos:</strong> {totalMedicos}</span>
          <span><strong>Total Odontólogos:</strong> {totalOdontologos}</span>
          <span><strong>Total Recetas:</strong> {totalRecetas}</span>
        </div>

        <table className={styles.printTable}>
          <thead>
            <tr>
              <th style={{ width: "30px" }}>#</th>
              <th style={{ width: "80px" }}>Código</th>
              <th>Nombre de la Brigada</th>
              <th>Fecha de Ejecución</th>
              <th>Ubicación / Comunidad</th>
              <th style={{ textAlign: "center" }}>Pacientes</th>
              <th style={{ textAlign: "center" }}>Médicos</th>
              <th style={{ textAlign: "center" }}>Odontólogos</th>
              <th style={{ textAlign: "center" }}>Recetas</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "1.5rem", color: "#000000" }}>
                  Cargando listado de brigadas...
                </td>
              </tr>
            ) : printData.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "1.5rem", color: "#000000" }}>
                  No se encontraron brigadas registradas para el periodo seleccionado.
                </td>
              </tr>
            ) : (
              printData.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: "bold" }}>{item.id}</td>
                  <td style={{ fontWeight: "bold" }}>{item.nombre}</td>
                  <td>
                    {new Date(item.fecha).toLocaleDateString("es-HN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td>{item.comunidad} ({item.departamento})</td>
                  <td style={{ textAlign: "center", fontWeight: "bold" }}>{item.pacientesAtendidos}</td>
                  <td style={{ textAlign: "center" }}>{item.medicosParticipantes}</td>
                  <td style={{ textAlign: "center" }}>{item.odontologosParticipantes}</td>
                  <td style={{ textAlign: "center", fontWeight: "bold" }}>{item.recetasEntregadas}</td>
                </tr>
              ))
            )}
            {!loading && printData.length > 0 && (
              <tr style={{ fontWeight: "bold", borderTop: "2px solid #000000", background: "#f1f5f9" }}>
                <td colSpan={5}>TOTAL ACUMULADO</td>
                <td style={{ textAlign: "center" }}>{totalPacientes}</td>
                <td style={{ textAlign: "center" }}>{totalMedicos}</td>
                <td style={{ textAlign: "center" }}>{totalOdontologos}</td>
                <td style={{ textAlign: "center" }}>{totalRecetas}</td>
              </tr>
            )}
          </tbody>
        </table>


        <div style={{ marginTop: "3rem", borderTop: "1px solid #000000", paddingTop: "1rem", fontSize: "8pt", color: "#555555", display: "flex", justifyContent: "space-between" }}>
          <span>Reporte de impacto y cobertura — Fundación Dibujando Sonrisas</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
}
