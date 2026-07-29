"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/pages/reportes.module.css";
import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";
import PrintReportDocument from "./PrintReportDocument";

export interface BrigadaAnualData {
  anio: number;
  total_brigadas: number;
  comunidades_atendidas: number;
  total_pacientes: number;
  promedio_pacientes_por_brigada: number;
}

export default function ResumenBrigadas() {
  const { role } = usePermissions();
  const userRole = role ? ROLE_LABELS[role] : "ADMINISTRADOR";
  const [anio, setAnio] = useState<string>("todos");
  const [brigadasAnuales, setBrigadasAnuales] = useState<BrigadaAnualData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchBrigadasSummary() {
      setLoading(true);
      try {
        // 1. Consultar directamente la View optimizada v_resumen_brigadas_anual
        const { data: viewData, error: viewError } = await supabase
          .from("v_resumen_brigadas_anual")
          .select("*")
          .order("anio", { ascending: false });

        if (!viewError && viewData) {
          const formatted: BrigadaAnualData[] = viewData.map((row: any) => ({
            anio: Number(row.anio || 0),
            total_brigadas: Number(row.total_brigadas || 0),
            comunidades_atendidas: Number(row.comunidades_atendidas || 0),
            total_pacientes: Number(row.total_pacientes || 0),
            promedio_pacientes_por_brigada: Number(row.promedio_pacientes_por_brigada || 0),
          }));
          setBrigadasAnuales(formatted);
          return;
        }

        // Fallback optimizado por si la View aún no ha sido aplicada en la base de datos
        console.warn("View v_resumen_brigadas_anual no disponible, ejecutando fallback:", viewError?.message);

        const [
          { data: brigadasData },
          { data: patientsData },
        ] = await Promise.all([
          supabase.from("brigadas").select("id, fecha_brigada, lugar, municipio"),
          supabase.from("pacientes").select("id, brigada_id"),
        ]);

        const map: Record<number, { brigadas: Set<string>; comunidades: Set<string>; pacientesCount: number }> = {};

        (brigadasData || []).forEach((b: any) => {
          if (!b.fecha_brigada) return;
          const yr = new Date(b.fecha_brigada).getFullYear();
          if (!map[yr]) {
            map[yr] = { brigadas: new Set(), comunidades: new Set(), pacientesCount: 0 };
          }
          map[yr].brigadas.add(b.id);
          const com = (b.municipio || b.lugar || "").trim();
          if (com) map[yr].comunidades.add(com);
        });

        const brigadaYearMap: Record<string, number> = {};
        (brigadasData || []).forEach((b: any) => {
          if (b.fecha_brigada) {
            brigadaYearMap[b.id] = new Date(b.fecha_brigada).getFullYear();
          }
        });

        (patientsData || []).forEach((p: any) => {
          const yr = brigadaYearMap[p.brigada_id];
          if (yr && map[yr]) {
            map[yr].pacientesCount += 1;
          }
        });

        const list: BrigadaAnualData[] = Object.keys(map).map((yrStr) => {
          const yr = Number(yrStr);
          const tBrig = map[yr].brigadas.size;
          const tPac = map[yr].pacientesCount;
          return {
            anio: yr,
            total_brigadas: tBrig,
            comunidades_atendidas: map[yr].comunidades.size,
            total_pacientes: tPac,
            promedio_pacientes_por_brigada: tBrig > 0 ? Number((tPac / tBrig).toFixed(1)) : 0,
          };
        }).sort((a, b) => b.anio - a.anio);

        setBrigadasAnuales(list);
      } catch (err) {
        console.error("Error loading brigadas report:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBrigadasSummary();
  }, []);

  // Extraer años dinámicos disponibles
  const aniosDisponibles = Array.from(
    new Set(brigadasAnuales.map((b) => b.anio.toString()).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a));

  // Filtrar datos según el año seleccionado
  const datosFiltrados = brigadasAnuales.filter((b) => {
    if (anio === "todos") return true;
    return b.anio.toString() === anio;
  });

  // Totales acumulados
  const totalBrigadas = datosFiltrados.reduce((acc, b) => acc + b.total_brigadas, 0);
  const comunidadesAtendidas = datosFiltrados.reduce((acc, b) => acc + b.comunidades_atendidas, 0);
  const totalPacientes = datosFiltrados.reduce((acc, b) => acc + b.total_pacientes, 0);
  const promedioPacientes = totalBrigadas > 0 ? (totalPacientes / totalBrigadas).toFixed(1) : "0";

  const displayPeriodo = anio === "todos" ? "Todos los años" : `Año ${anio}`;

  // Elementos de la gráfica (Brigadas realizadas, Comunidades atendidas, Pacientes registrados)
  const chartItems = [
    {
      id: "brigadas",
      label: "Brigadas Realizadas",
      nombreCorto: "Brigadas",
      valor: totalBrigadas,
      color: "#3498db",
    },
    {
      id: "comunidades",
      label: "Comunidades Atendidas",
      nombreCorto: "Comunidades",
      valor: comunidadesAtendidas,
      color: "#1abc9c",
    },
    {
      id: "pacientes",
      label: "Pacientes Registrados",
      nombreCorto: "Pacientes",
      valor: totalPacientes,
      color: "#2980b9",
    },
  ];

  const maxValorChart = Math.max(...chartItems.map((c) => c.valor), 1);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Resumen de Brigadas Realizadas - ${displayPeriodo}`;

    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };

    window.addEventListener("afterprint", restoreTitle);
    window.print();
    setTimeout(restoreTitle, 1000);
  };

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
                Informe sintetizado anual del impacto y cobertura de las brigadas ejecutadas.
              </p>
            </div>
          </div>
          <div className={styles.reportHeaderActions}>
            <button
              type="button"
              className={styles.btnActionSecondary}
              onClick={handlePrint}
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
              disabled={loading}
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
            Resumen consolidado anual del impacto de brigadas.
          </p>
        </div>

        {/* KPIs */}
        <div className={styles.kpiGrid}>
          <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
            <p className={styles.kpiLabel}>Brigadas Realizadas</p>
            <p className={styles.kpiValue}>{loading ? "..." : totalBrigadas.toLocaleString()}</p>
            <p className={styles.kpiChange}>Eventos de atención completados</p>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiCardTeal}`}>
            <p className={styles.kpiLabel}>Comunidades Atendidas</p>
            <p className={styles.kpiValue}>{loading ? "..." : comunidadesAtendidas.toLocaleString()}</p>
            <p className={styles.kpiChange}>Sectores y municipios cubiertos</p>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
            <p className={styles.kpiLabel}>Total Pacientes Registrados</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : totalPacientes.toLocaleString()}
            </p>
            <p className={`${styles.kpiChange} ${styles.kpiChangePositive}`}>
              Beneficiarios atendidos
            </p>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
            <p className={styles.kpiLabel}>Promedio Pacientes / Brigada</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : promedioPacientes}
            </p>
            <p className={styles.kpiChange}>Pacientes promedio por evento</p>
          </div>
        </div>

        {/* Gráfico y Tabla Resumen Ejecutivo */}
        <div className={styles.financeSection} style={{ padding: "2.4rem" }}>
          <h4
            style={{
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
            }}
          >
            Impacto de Brigadas Realizadas ({displayPeriodo})
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
            ) : totalBrigadas === 0 ? (
              <div style={{ textAlign: "center", paddingTop: "50px", color: "var(--grayLight)" }}>
                No hay brigadas registradas para este periodo.
              </div>
            ) : (
              <div className={styles.barChartGrid}>
                {chartItems.map((item) => {
                  const alturaPorcentaje = Math.max(
                    (item.valor / maxValorChart) * 80,
                    8
                  );
                  return (
                    <div key={item.id} className={styles.barCol}>
                      <div className={styles.barColTooltip}>
                        {item.label}: {item.valor.toLocaleString()}
                      </div>
                      <div
                        className={styles.chartBarElement}
                        style={{
                          height: `${alturaPorcentaje}%`,
                          backgroundColor: item.color,
                          width: "3.6rem",
                        }}
                      />
                      <span className={styles.barLabel}>{item.nombreCorto}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tabla Resumen Ejecutivo */}
          <div style={{ overflowX: "auto" }}>
            <table className={styles.financeTable}>
              <thead>
                <tr>
                  <th>Métrica de Cobertura / Impacto</th>
                  <th style={{ textAlign: "right" }}>Valor Consolidado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                      Cargando resumen de brigadas...
                    </td>
                  </tr>
                ) : totalBrigadas === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                      No se encontraron brigadas para este periodo.
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr>
                      <td style={{ fontWeight: 700 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: "1.2rem",
                            height: "1.2rem",
                            borderRadius: "50%",
                            backgroundColor: "#3498db",
                            marginRight: "0.8rem",
                          }}
                        />
                        Cantidad Total de Brigadas Realizadas
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, fontSize: "1.4rem" }}>
                        {totalBrigadas.toLocaleString()} brigadas
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: "1.2rem",
                            height: "1.2rem",
                            borderRadius: "50%",
                            backgroundColor: "#1abc9c",
                            marginRight: "0.8rem",
                          }}
                        />
                        Cantidad de Comunidades Atendidas
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, fontSize: "1.4rem" }}>
                        {comunidadesAtendidas.toLocaleString()} comunidades
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: "1.2rem",
                            height: "1.2rem",
                            borderRadius: "50%",
                            backgroundColor: "#2980b9",
                            marginRight: "0.8rem",
                          }}
                        />
                        Cantidad Total de Pacientes Registrados
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, fontSize: "1.4rem", color: "var(--primaryDark)" }}>
                        {totalPacientes.toLocaleString()} pacientes
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: "1.2rem",
                            height: "1.2rem",
                            borderRadius: "50%",
                            backgroundColor: "#5dade2",
                            marginRight: "0.8rem",
                          }}
                        />
                        Promedio de Pacientes por Brigada
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, fontSize: "1.4rem" }}>
                        {promedioPacientes} pacientes/brigada
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── VISTA DE IMPRESIÓN REUTILIZABLE INSTITUCIONAL ── */}
      <div className={styles.printView}>
        <PrintReportDocument
          title="Resumen de Brigadas Realizadas"
          userRole={userRole}
          metaItems={[
            { label: "Periodo Anual", value: displayPeriodo },
            { label: "Frecuencia", value: "Anual / Consolidado" },
          ]}
          summaryCards={[
            { label: "Brigadas Realizadas", value: totalBrigadas.toLocaleString() },
            { label: "Comunidades Atendidas", value: comunidadesAtendidas.toLocaleString() },
            { label: "Pacientes Registrados", value: totalPacientes.toLocaleString() },
            { label: "Promedio Pacientes/Brigada", value: promedioPacientes },
          ]}
          footerNote="Reporte de impacto y cobertura — Fundación Dibujando Sonrisas"
        >
          {/* Gráfico de Barras en Impresión */}
          <div
            style={{
              pageBreakInside: "avoid",
              breakInside: "avoid",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              padding: "1rem 1.2rem",
              marginBottom: "1.5rem",
              background: "#ffffff",
            }}
          >
            <h3
              style={{
                fontSize: "10.5pt",
                fontWeight: "bold",
                color: "#000000",
                margin: "0 0 0.8rem 0",
                textTransform: "uppercase",
                borderBottom: "1px solid #cbd5e1",
                paddingBottom: "0.4rem",
                textAlign: "center",
              }}
            >
              Impacto de Brigadas Realizadas
            </h3>

            <div style={{ height: "180px", width: "100%", maxWidth: "680px", margin: "0 auto" }}>
              {loading ? (
                <div style={{ textAlign: "center", paddingTop: "40px", fontSize: "9pt" }}>
                  Cargando gráfico...
                </div>
              ) : totalBrigadas === 0 ? (
                <div style={{ textAlign: "center", paddingTop: "40px", fontSize: "9pt" }}>
                  No hay brigadas registradas para este periodo.
                </div>
              ) : (
                <div
                  className={styles.barChartGrid}
                  style={{
                    height: "100%",
                    borderBottom: "2px solid #000000",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-around",
                    paddingBottom: "4px",
                  }}
                >
                  {chartItems.map((item) => {
                    const alturaPorcentaje = Math.max(
                      (item.valor / maxValorChart) * 75,
                      10
                    );
                    return (
                      <div
                        key={item.id}
                        className={styles.barCol}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          height: "100%",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "8.5pt",
                            fontWeight: "bold",
                            color: "#1e293b",
                            marginBottom: "2px",
                          }}
                        >
                          {item.valor.toLocaleString()}
                        </span>
                        <div
                          style={{
                            height: `${alturaPorcentaje}%`,
                            backgroundColor: item.color,
                            width: "2.8rem",
                            borderRadius: "3px 3px 0 0",
                            WebkitPrintColorAdjust: "exact",
                            printColorAdjust: "exact",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "8.5pt",
                            color: "#000000",
                            fontWeight: 600,
                            marginTop: "4px",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.nombreCorto}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <table className={styles.printTable}>
            <thead>
              <tr>
                <th style={{ width: "8%", textAlign: "center" }}>#</th>
                <th style={{ width: "62%" }}>Métrica de Cobertura / Impacto</th>
                <th style={{ width: "30%", textAlign: "right" }}>Valor Consolidado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "1.5rem" }}>
                    Cargando resumen de brigadas...
                  </td>
                </tr>
              ) : totalBrigadas === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "1.5rem" }}>
                    No hay brigadas registradas para el periodo seleccionado.
                  </td>
                </tr>
              ) : (
                <>
                  <tr>
                    <td style={{ textAlign: "center" }}>1</td>
                    <td style={{ fontWeight: "bold" }}>Cantidad Total de Brigadas Realizadas</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      {totalBrigadas.toLocaleString()} brigadas
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "center" }}>2</td>
                    <td style={{ fontWeight: "bold" }}>Cantidad de Comunidades Atendidas</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      {comunidadesAtendidas.toLocaleString()} comunidades
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "center" }}>3</td>
                    <td style={{ fontWeight: "bold" }}>Cantidad Total de Pacientes Registrados</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      {totalPacientes.toLocaleString()} pacientes
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "center" }}>4</td>
                    <td style={{ fontWeight: "bold" }}>Promedio de Pacientes por Brigada</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      {promedioPacientes} pacientes/brigada
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </PrintReportDocument>
      </div>
    </div>
  );
}
