"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/pages/reportes.module.css";
import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";
import PrintReportDocument from "./PrintReportDocument";

function formatHNL(value: number) {
  return `L. ${value.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface FinancialPeriodData {
  anio: number;
  mes: number;
  total_ventas: number;
  total_donaciones: number;
  cantidad_ventas: number;
  cantidad_donaciones: number;
  total_general: number;
}

const MESES_NOMBRES: Record<number, string> = {
  1: "Enero",
  2: "Febrero",
  3: "Marzo",
  4: "Abril",
  5: "Mayo",
  6: "Junio",
  7: "Julio",
  8: "Agosto",
  9: "Septiembre",
  10: "Octubre",
  11: "Noviembre",
  12: "Diciembre",
};

export default function ResumenFinanciero() {
  const { role } = usePermissions();
  const userRole = role ? ROLE_LABELS[role] : "ADMINISTRADOR";

  const [periodosData, setPeriodosData] = useState<FinancialPeriodData[]>([]);
  const [anioFiltro, setAnioFiltro] = useState<string>("todos");
  const [mesFiltro, setMesFiltro] = useState<string>("todos");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchFinancialData() {
      setLoading(true);
      try {
        // 1. Consultar la View optimizada v_resumen_financiero_mensual
        const { data: viewData, error: viewError } = await supabase
          .from("v_resumen_financiero_mensual")
          .select("*")
          .order("anio", { ascending: false })
          .order("mes", { ascending: false });

        if (!viewError && viewData) {
          const formatted: FinancialPeriodData[] = viewData.map((row: any) => ({
            anio: Number(row.anio || 0),
            mes: Number(row.mes || 0),
            total_ventas: Number(row.total_ventas || 0),
            total_donaciones: Number(row.total_donaciones || 0),
            cantidad_ventas: Number(row.cantidad_ventas || 0),
            cantidad_donaciones: Number(row.cantidad_donaciones || 0),
            total_general: Number(row.total_general || 0),
          }));
          setPeriodosData(formatted);
          return;
        }

        // Fallback optimizado por si la View aún no está creada en la base de datos
        console.warn("View v_resumen_financiero_mensual no disponible, ejecutando fallback:", viewError?.message);

        const [{ data: salesData }, { data: donationsData }] = await Promise.all([
          supabase.from("ventas").select("id, total, fecha"),
          supabase.from("donaciones_ropa").select("id, cantidad_prendas, fecha_donacion"),
        ]);

        const map: Record<string, FinancialPeriodData> = {};

        (salesData || []).forEach((s: any) => {
          if (!s.fecha) return;
          const d = new Date(s.fecha);
          const a = d.getFullYear();
          const m = d.getMonth() + 1;
          const key = `${a}-${m}`;
          if (!map[key]) {
            map[key] = {
              anio: a,
              mes: m,
              total_ventas: 0,
              total_donaciones: 0,
              cantidad_ventas: 0,
              cantidad_donaciones: 0,
              total_general: 0,
            };
          }
          map[key].total_ventas += Number(s.total || 0);
          map[key].cantidad_ventas += 1;
        });

        (donationsData || []).forEach((d: any) => {
          if (!d.fecha_donacion) return;
          const dt = new Date(d.fecha_donacion);
          const a = dt.getFullYear();
          const m = dt.getMonth() + 1;
          const key = `${a}-${m}`;
          if (!map[key]) {
            map[key] = {
              anio: a,
              mes: m,
              total_ventas: 0,
              total_donaciones: 0,
              cantidad_ventas: 0,
              cantidad_donaciones: 0,
              total_general: 0,
            };
          }
          const val = Number(d.cantidad_prendas || 0) * 100;
          map[key].total_donaciones += val;
          map[key].cantidad_donaciones += 1;
        });

        const list = Object.values(map).map((item) => ({
          ...item,
          total_general: item.total_ventas + item.total_donaciones,
        }));

        setPeriodosData(list);
      } catch (err) {
        console.error("Error al cargar datos financieros sintetizados:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFinancialData();
  }, []);

  // Extraer años dinámicos disponibles
  const aniosDisponibles = Array.from(
    new Set(periodosData.map((p) => p.anio.toString()).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a));

  // Filtrado por Año y Mes
  const periodosFiltrados = periodosData.filter((p) => {
    if (anioFiltro !== "todos" && p.anio.toString() !== anioFiltro) return false;
    if (mesFiltro !== "todos" && p.mes.toString() !== mesFiltro) return false;
    return true;
  });

  // Totales acumulados según el filtro aplicado
  const totalVentas = periodosFiltrados.reduce((acc, p) => acc + p.total_ventas, 0);
  const totalDonaciones = periodosFiltrados.reduce((acc, p) => acc + p.total_donaciones, 0);
  const cantidadVentas = periodosFiltrados.reduce((acc, p) => acc + p.cantidad_ventas, 0);
  const cantidadDonaciones = periodosFiltrados.reduce((acc, p) => acc + p.cantidad_donaciones, 0);
  const totalGeneral = totalVentas + totalDonaciones;

  // Etiqueta del período seleccionado
  const displayPeriodo =
    anioFiltro === "todos" && mesFiltro === "todos"
      ? "Consolidado Histórico Total"
      : `${mesFiltro !== "todos" ? MESES_NOMBRES[Number(mesFiltro)] || "" : "Todos los meses"} ${anioFiltro !== "todos" ? anioFiltro : "(Todos los años)"}`.trim();

  // Datos para la gráfica sintetizada (Ventas, Donaciones, Total General)
  const chartItems = [
    {
      id: "ventas",
      label: "Ventas",
      fullLabel: "Ventas de Apoyo",
      monto: totalVentas,
      color: "#1abc9c",
    },
    {
      id: "donaciones",
      label: "Donaciones",
      fullLabel: "Donaciones Recibidas",
      monto: totalDonaciones,
      color: "#3498db",
    },
    {
      id: "total",
      label: "Total General",
      fullLabel: "Total General de Ingresos",
      monto: totalGeneral,
      color: "#2980b9",
    },
  ];

  const maxMontoChart = Math.max(...chartItems.map((c) => c.monto), 1);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Resumen Financiero - ${displayPeriodo}`;

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
      {/* ── VISTA WEB (PAGINADA) ── */}
      <div className={styles.screenView}>
        {/* Encabezado */}
        <div className={styles.reportHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div className={styles.reportHeaderText}>
              <h3>Resumen Financiero por Período</h3>
              <p>
                Consolidado ejecutivo mensual de ingresos por ventas de apoyo y donaciones recibidas.
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

        {/* Filtros por Mes y Año */}
        <div className={styles.reportFilters}>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div className={styles.filterGroup}>
              <label htmlFor="filtro-mes">Mes</label>
              <select
                id="filtro-mes"
                value={mesFiltro}
                onChange={(e) => setMesFiltro(e.target.value)}
                disabled={loading}
              >
                <option value="todos">Todos los meses</option>
                {Object.entries(MESES_NOMBRES).map(([num, name]) => (
                  <option key={num} value={num}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="filtro-anio">Año</label>
              <select
                id="filtro-anio"
                value={anioFiltro}
                onChange={(e) => setAnioFiltro(e.target.value)}
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
          </div>

          <p
            style={{
              margin: "auto 0 0",
              fontSize: "1.35rem",
              color: "var(--gray)",
            }}
          >
            Moneda:{" "}
            <strong style={{ color: "var(--dark)" }}>
              Lempira Hondureño (HNL)
            </strong>
          </p>
        </div>

        {/* KPIs Financieros */}
        <div className={styles.kpiGrid}>
          <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
            <p className={styles.kpiLabel}>Total Recaudado por Ventas</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : formatHNL(totalVentas)}
            </p>
            <p className={`${styles.kpiChange} ${styles.kpiChangePositive}`}>
              {loading ? "..." : `${cantidadVentas.toLocaleString()} ventas realizadas`}
            </p>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiCardTeal}`}>
            <p className={styles.kpiLabel}>Total Recibido por Donaciones</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : formatHNL(totalDonaciones)}
            </p>
            <p className={`${styles.kpiChange} ${styles.kpiChangePositive}`}>
              {loading ? "..." : `${cantidadDonaciones.toLocaleString()} donaciones registradas`}
            </p>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
            <p className={styles.kpiLabel}>Total General de Ingresos</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : formatHNL(totalGeneral)}
            </p>
            <p className={`${styles.kpiChange} ${styles.kpiChangePositive}`}>
              Período: {displayPeriodo}
            </p>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
            <p className={styles.kpiLabel}>Registros Financieros</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : (cantidadVentas + cantidadDonaciones).toLocaleString()}
            </p>
            <p className={styles.kpiChange}>Transacciones en el período</p>
          </div>
        </div>

        {/* Sección de Gráfico (Ventas, Donaciones, Total General) */}
        <div className={styles.financeSection} style={{ padding: "2.4rem" }}>
          <h4 style={{ marginBottom: "2rem" }}>
            Comparativo de Ingresos Financieros ({displayPeriodo})
          </h4>
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
            ) : totalGeneral === 0 ? (
              <div style={{ textAlign: "center", paddingTop: "50px", color: "var(--grayLight)" }}>
                No hay ingresos registrados en el período seleccionado.
              </div>
            ) : (
              <div className={styles.barChartGrid}>
                {chartItems.map((item) => {
                  const alturaPorcentaje = Math.max(
                    (item.monto / maxMontoChart) * 80,
                    8
                  );
                  return (
                    <div key={item.id} className={styles.barCol}>
                      <div className={styles.barColTooltip}>
                        {item.fullLabel}: {formatHNL(item.monto)}
                      </div>
                      <div
                        className={styles.chartBarElement}
                        style={{
                          height: `${alturaPorcentaje}%`,
                          backgroundColor: item.color,
                          width: "3.6rem",
                        }}
                      />
                      <span className={styles.barLabel}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tabla Resumen Ejecutivo */}
        <div className={styles.financeSection}>
          <div className={styles.financeSectionTitle}>
            <h4>
              Resumen Ejecutivo Financiero
            </h4>
            <span>{displayPeriodo}</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className={styles.financeTable}>
              <thead>
                <tr>
                  <th>Concepto / Fuente de Ingreso</th>
                  <th style={{ textAlign: "right" }}>Cantidad de Registros</th>
                  <th className={styles.colAmount}>Total Recaudado (HNL)</th>
                  <th style={{ textAlign: "right" }}>Porcentaje del Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                      Cargando resumen ejecutivo...
                    </td>
                  </tr>
                ) : totalGeneral === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                      No se encontraron registros de ingresos para este período.
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
                            backgroundColor: "#1abc9c",
                            marginRight: "0.8rem",
                          }}
                        />
                        Ventas de Apoyo
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {cantidadVentas.toLocaleString()} ventas
                      </td>
                      <td className={styles.colAmount} style={{ fontWeight: 700, color: "var(--accentColor)" }}>
                        {formatHNL(totalVentas)}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {totalGeneral > 0 ? ((totalVentas / totalGeneral) * 100).toFixed(1) : "0.0"}%
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
                            backgroundColor: "#3498db",
                            marginRight: "0.8rem",
                          }}
                        />
                        Donaciones Recibidas
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {cantidadDonaciones.toLocaleString()} donaciones
                      </td>
                      <td className={styles.colAmount} style={{ fontWeight: 700, color: "var(--primaryColor)" }}>
                        {formatHNL(totalDonaciones)}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {totalGeneral > 0 ? ((totalDonaciones / totalGeneral) * 100).toFixed(1) : "0.0"}%
                      </td>
                    </tr>
                  </>
                )}
                {!loading && totalGeneral > 0 && (
                  <tr className={styles.financeTotalsRow}>
                    <td>TOTAL GENERAL DE INGRESOS</td>
                    <td style={{ textAlign: "right" }}>
                      {(cantidadVentas + cantidadDonaciones).toLocaleString()} registros
                    </td>
                    <td className={styles.colAmount} style={{ textAlign: "right" }}>
                      {formatHNL(totalGeneral)}
                    </td>
                    <td style={{ textAlign: "right" }}>100%</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── VISTA DE IMPRESIÓN REUTILIZABLE INSTITUCIONAL ── */}
      <div className={styles.printView}>
        <PrintReportDocument
          title="Resumen Financiero por Período"
          userRole={userRole}
          metaItems={[
            { label: "Período", value: displayPeriodo },
            { label: "Frecuencia", value: "Mensual / Consolidado" },
          ]}
          summaryCards={[
            { label: "Total General de Ingresos", value: formatHNL(totalGeneral) },
            { label: "Total Recaudado por Ventas", value: formatHNL(totalVentas) },
            { label: "Total Recibido por Donaciones", value: formatHNL(totalDonaciones) },
            { label: "Total Transacciones", value: (cantidadVentas + cantidadDonaciones).toString() },
          ]}
          footerNote="Consolidado de ingresos financieros — Fundación Dibujando Sonrisas"
        >
          {/* Gráfico en Impresión */}
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
              Comparativo de Ingresos Financieros
            </h3>
            <div style={{ height: "180px", width: "100%", maxWidth: "680px", margin: "0 auto" }}>
              {loading ? (
                <div style={{ textAlign: "center", paddingTop: "40px", fontSize: "9pt" }}>
                  Cargando gráfico...
                </div>
              ) : totalGeneral === 0 ? (
                <div style={{ textAlign: "center", paddingTop: "40px", fontSize: "9pt" }}>
                  No hay ingresos registrados en el período.
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
                      (item.monto / maxMontoChart) * 75,
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
                          {formatHNL(item.monto)}
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
                          {item.label}
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
                <th style={{ width: "42%" }}>Fuente de Ingreso</th>
                <th style={{ width: "22%", textAlign: "right" }}>Cantidad de Registros</th>
                <th style={{ width: "28%", textAlign: "right" }}>Monto Recaudado (HNL)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "1.5rem" }}>
                    Cargando resumen...
                  </td>
                </tr>
              ) : totalGeneral === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "1.5rem" }}>
                    No hay ingresos registrados en este período.
                  </td>
                </tr>
              ) : (
                <>
                  <tr>
                    <td style={{ textAlign: "center" }}>1</td>
                    <td style={{ fontWeight: "bold" }}>Ventas de Apoyo</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      {cantidadVentas.toLocaleString()} ventas
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      {formatHNL(totalVentas)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "center" }}>2</td>
                    <td style={{ fontWeight: "bold" }}>Donaciones Recibidas</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      {cantidadDonaciones.toLocaleString()} donaciones
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      {formatHNL(totalDonaciones)}
                    </td>
                  </tr>
                </>
              )}
              {!loading && totalGeneral > 0 && (
                <tr style={{ fontWeight: "bold", background: "#f1f5f9" }}>
                  <td colSpan={2}>TOTAL GENERAL DE INGRESOS DEL PERÍODO</td>
                  <td style={{ textAlign: "right" }}>
                    {(cantidadVentas + cantidadDonaciones).toLocaleString()} registros
                  </td>
                  <td style={{ textAlign: "right" }}>{formatHNL(totalGeneral)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </PrintReportDocument>
      </div>
    </div>
  );
}
