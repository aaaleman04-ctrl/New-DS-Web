"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "@/styles/pages/reportes.module.css";
import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";
import PrintReportDocument from "./PrintReportDocument";

function formatHNL(value: number) {
  return `L. ${value.toLocaleString("es-HN", { minimumFractionDigits: 2 })}`;
}

export default function ResumenFinanciero() {
  interface VentaItem {
    id: string;
    codigo: string;
    total: number | null;
    fecha: string | null;
    observaciones: string | null;
  }

  interface GastoItem {
    id: string;
    categoria: string;
    monto: number;
    fecha_gasto: string;
    descripcion: string | null;
  }

  const { role } = usePermissions();
  const userRole = role ? ROLE_LABELS[role] : "ADMINISTRADOR";
  const [anioFiltro, setAnioFiltro] = useState<string>("todos");
  const [ventas, setVentas] = useState<VentaItem[]>([]);
  const [gastos, setGastos] = useState<GastoItem[]>([]);
  const [donacionesEspecie, setDonacionesEspecie] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPageIngresos, setCurrentPageIngresos] = useState(1);
  const [currentPageEgresos, setCurrentPageEgresos] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPageIngresos(1);
    setCurrentPageEgresos(1);
  }, [anioFiltro]);

  useEffect(() => {
    async function fetchFinancialData() {
      setLoading(true);
      try {
        // 1. Fetch sales
        const { data: salesData, error: salesError } = await supabase
          .from("ventas")
          .select("id, codigo, total, fecha, observaciones");
        if (salesError) throw salesError;

        // 2. Fetch expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from("gastos_brigada")
          .select("id, categoria, monto, fecha_gasto, descripcion");
        if (expensesError) throw expensesError;

        // 3. Fetch clothing donations for especie valuation
        const { data: donationsData, error: donationsError } = await supabase
          .from("donaciones_ropa")
          .select("cantidad_prendas");
        if (donationsError) throw donationsError;

        setVentas(salesData || []);
        setGastos(expensesData || []);

        const totalPrendas = (donationsData || []).reduce(
          (acc: number, curr: { cantidad_prendas: number | null }) => acc + (curr.cantidad_prendas || 0),
          0
        );
        setDonacionesEspecie(totalPrendas * 100);
      } catch (err) {
        console.error("Error fetching financial data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFinancialData();
  }, []);

  // Extract years dynamically from both sales and expenses dates
  const aniosDisponibles = Array.from(
    new Set([
      ...ventas.map((v) => v.fecha ? new Date(v.fecha).getFullYear().toString() : ""),
      ...gastos.map((g) => g.fecha_gasto ? new Date(g.fecha_gasto).getFullYear().toString() : ""),
    ].filter(Boolean))
  ).sort() as string[];

  // Filter records by selected year
  const filteredVentas = ventas.filter((v) => {
    if (anioFiltro === "todos") return true;
    return v.fecha ? new Date(v.fecha).getFullYear().toString() === anioFiltro : false;
  });

  const filteredGastos = gastos.filter((g) => {
    if (anioFiltro === "todos") return true;
    return g.fecha_gasto ? new Date(g.fecha_gasto).getFullYear().toString() === anioFiltro : false;
  });

  const totalIngresos = filteredVentas.reduce((s, r) => s + (r.total || 0), 0);
  const totalEgresos = filteredGastos.reduce((s, r) => s + (r.monto || 0), 0);
  const saldoNeto = totalIngresos - totalEgresos;

  // Monthly breakdown for SVG bar chart
  const mesesNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const mensual = mesesNames.map((mes, idx) => {
    const ingresos = filteredVentas.reduce((acc, v) => {
      const d = new Date(v.fecha || "");
      return d.getMonth() === idx ? acc + (v.total || 0) : acc;
    }, 0);

    const egresos = filteredGastos.reduce((acc, g) => {
      const d = new Date(g.fecha_gasto || "");
      return d.getMonth() === idx ? acc + (g.monto || 0) : acc;
    }, 0);

    return { mes, ingresos, egresos };
  });

  const maxMensual = Math.max(
    ...mensual.map((m) => Math.max(m.ingresos, m.egresos)),
    1
  );

  const ingresosOrdenados = [...filteredVentas]
    .map((v) => ({
      codigo: v.codigo || "",
      categoria: "Venta de Apoyo",
      tipo: "catIngreso",
      descripcion: v.observaciones || `Venta registrada #${v.codigo}`,
      fecha: v.fecha ? new Date(v.fecha).toLocaleDateString("es-HN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) : "N/A",
      rawFecha: v.fecha || "",
      monto: v.total || 0,
    }))
    .sort((a, b) => a.rawFecha.localeCompare(b.rawFecha)); // Ascending chronological sort

  const egresosOrdenados = [...filteredGastos]
    .map((g) => ({
      categoria: g.categoria ? g.categoria.charAt(0).toUpperCase() + g.categoria.slice(1) : "Otros",
      tipo: "catOperativo",
      descripcion: g.descripcion || "Gasto sin descripción",
      fecha: g.fecha_gasto ? new Date(g.fecha_gasto).toLocaleDateString("es-HN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) : "N/A",
      rawFecha: g.fecha_gasto || "",
      monto: g.monto || 0,
    }))
    .sort((a, b) => a.rawFecha.localeCompare(b.rawFecha)); // Ascending chronological sort


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
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = "Reporte Financiero";

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
              <h3>Resumen Financiero General</h3>
              <p>
                Balance gerencial para la Junta Directiva — Estado financiero
                sintetizado de ingresos y egresos.
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

        {/* Selector de periodo */}
        <div className={styles.reportFilters}>
          <div className={styles.filterGroup}>
            <label htmlFor="periodo-select">Filtrar por Año</label>
            <select
              id="periodo-select"
              value={anioFiltro}
              onChange={(e) => setAnioFiltro(e.target.value)}
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
            }}
          >
            Moneda:{" "}
            <strong style={{ color: "var(--dark)" }}>
              Lempira Hondureño (HNL)
            </strong>
          </p>
        </div>

        {/* KPI Cards */}
        <div className={styles.kpiGrid}>
          <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
            <p className={styles.kpiLabel}>Ingresos por Ventas</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : formatHNL(totalIngresos)}
            </p>
            <p className={`${styles.kpiChange} ${styles.kpiChangeNeutral}`}>
              Actividades bazar y eventos
            </p>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
            <p className={styles.kpiLabel}>Egresos por Operación</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : formatHNL(totalEgresos)}
            </p>
            <p className={`${styles.kpiChange} ${styles.kpiChangeNeutral}`}>
              Gastos logísticos de brigadas
            </p>
          </div>

          <div className={`${styles.kpiCard} ${saldoNeto >= 0 ? styles.kpiCardGreen : styles.kpiCardRed}`}>
            <p className={styles.kpiLabel}>Saldo Neto del Periodo</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : formatHNL(saldoNeto)}
            </p>
            <p className={`${styles.kpiChange}`}>
              {saldoNeto >= 0 ? " Superávit Financiero" : " Déficit Financiero"}
            </p>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiCardTeal}`}>
            <p className={styles.kpiLabel}>Valoración Donaciones Especie</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : formatHNL(donacionesEspecie)}
            </p>
            <p className={`${styles.kpiChange}`}>
              Ropa e insumos recibidos (L.100 c/u)
            </p>
          </div>
        </div>

        {/* Sección de Gráficos */}
        <div className={styles.financeSection} style={{ padding: "2.4rem" }}>
          <h4 style={{ marginBottom: "2rem" }}>Histórico Mensual Comparativo (Bazar vs Gastos)</h4>
          <div style={{ height: "240px", width: "100%", margin: "0 auto 3.2rem" }}>
            {loading ? (
              <div style={{ textAlign: "center", paddingTop: "50px", color: "var(--grayLight)" }}>
                Cargando datos...
              </div>
            ) : (
              <div className={styles.barChartGrid}>
                {mensual.map((m, idx) => {
                  const alturaIngresos = maxMensual > 0 ? (m.ingresos / maxMensual) * 80 : 0;
                  const alturaEgresos = maxMensual > 0 ? (m.egresos / maxMensual) * 80 : 0;
                  return (
                    <div
                      key={idx}
                      className={styles.barCol}
                      style={{ gap: "0.4rem" }}
                    >
                      <div className={styles.barColTooltip}>
                         Bazar: L. {m.ingresos.toLocaleString()} |  Gastos:
                        L. {m.egresos.toLocaleString()}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: "4px",
                          height: "100%",
                        }}
                      >
                        <div
                          className={styles.chartBarElement}
                          style={{
                            height: `${alturaIngresos}%`,
                            backgroundColor: "#1abc9c",
                            width: "1.6rem",
                          }}
                        />
                        <div
                          className={styles.chartBarElement}
                          style={{
                            height: `${alturaEgresos}%`,
                            backgroundColor: "#3498db",
                            width: "1.6rem",
                          }}
                        />
                      </div>
                      <span className={styles.barLabel}>{m.mes}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.chartLegend}>
            <div className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: "#1abc9c" }}
              />
              <span>Bazar / Ventas (HNL)</span>
            </div>
            <div className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: "#3498db" }}
              />
              <span>Gastos Brigada (HNL)</span>
            </div>
          </div>
        </div>

        {/* Tabla de Ingresos */}
        <div className={styles.financeSection}>
          <div className={styles.financeSectionTitle}>
            <h4>
              <span style={{ color: "#1abc9c", marginRight: "0.6rem" }}>▲</span>
              Detalle de Ventas Bazar (Ingresos)
            </h4>
            <span>{anioFiltro === "todos" ? "Todos los años" : `Año ${anioFiltro}`}</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className={styles.financeTable}>
              <thead>
                <tr>
                  <th style={{ width: "3rem" }}>#</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th className={styles.colAmount}>Monto (HNL)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                      Cargando ventas...
                    </td>
                  </tr>
                ) : ingresosOrdenados.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                      No se encontraron ingresos por ventas.
                    </td>
                  </tr>
                ) : (
                  ingresosOrdenados
                    .slice((currentPageIngresos - 1) * itemsPerPage, currentPageIngresos * itemsPerPage)
                    .map((item, relativeIdx) => {
                      const absoluteIdx = (currentPageIngresos - 1) * itemsPerPage + relativeIdx;
                      return (
                        <tr key={relativeIdx}>
                          <td style={{ color: "var(--grayLight)", fontWeight: 600 }}>
                            {absoluteIdx + 1}
                          </td>
                          <td style={{ fontWeight: 700 }}>
                            <span className={`${styles.tagLabel} ${styles.tagIngreso}`}>
                              {item.categoria}
                            </span>
                          </td>
                          <td>{item.descripcion}</td>
                          <td style={{ color: "var(--gray)" }}>{item.fecha}</td>
                          <td className={styles.colAmount} style={{ fontWeight: 700, color: "var(--accentColor)" }}>
                            {formatHNL(item.monto)}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
          {Math.ceil(ingresosOrdenados.length / itemsPerPage) > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "1rem", padding: "1rem" }} className="no-print">
              <button 
                disabled={currentPageIngresos === 1} 
                onClick={() => setCurrentPageIngresos(prev => Math.max(prev - 1, 1))}
                className={styles.btnActionSecondary}
                style={{ padding: "0.5rem 1rem", cursor: currentPageIngresos === 1 ? "not-allowed" : "pointer", opacity: currentPageIngresos === 1 ? 0.5 : 1 }}
              >
                Anterior
              </button>
              <span style={{ fontSize: "1.2rem", fontWeight: "600" }}>Página {currentPageIngresos} de {Math.ceil(ingresosOrdenados.length / itemsPerPage)}</span>
              <button 
                disabled={currentPageIngresos === Math.ceil(ingresosOrdenados.length / itemsPerPage)} 
                onClick={() => setCurrentPageIngresos(prev => Math.min(prev + 1, Math.ceil(ingresosOrdenados.length / itemsPerPage)))}
                className={styles.btnActionSecondary}
                style={{ padding: "0.5rem 1rem", cursor: currentPageIngresos === Math.ceil(ingresosOrdenados.length / itemsPerPage) ? "not-allowed" : "pointer", opacity: currentPageIngresos === Math.ceil(ingresosOrdenados.length / itemsPerPage) ? 0.5 : 1 }}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Tabla de Egresos */}
        <div className={styles.financeSection}>
          <div className={styles.financeSectionTitle}>
            <h4>
              <span style={{ color: "#3498db", marginRight: "0.6rem" }}>▼</span>
              Detalle de Gastos Brigada (Egresos)
            </h4>
            <span>{anioFiltro === "todos" ? "Todos los años" : `Año ${anioFiltro}`}</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className={styles.financeTable}>
              <thead>
                <tr>
                  <th style={{ width: "3rem" }}>#</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th className={styles.colAmount}>Monto (HNL)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                      Cargando gastos...
                    </td>
                  </tr>
                ) : egresosOrdenados.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                      No se encontraron gastos registrados.
                    </td>
                  </tr>
                ) : (
                  egresosOrdenados
                    .slice((currentPageEgresos - 1) * itemsPerPage, currentPageEgresos * itemsPerPage)
                    .map((item, relativeIdx) => {
                      const absoluteIdx = (currentPageEgresos - 1) * itemsPerPage + relativeIdx;
                      return (
                        <tr key={relativeIdx}>
                          <td style={{ color: "var(--grayLight)", fontWeight: 600 }}>
                            {absoluteIdx + 1}
                          </td>
                          <td style={{ fontWeight: 700 }}>
                            <span className={`${styles.tagLabel} ${styles.tagEgreso}`}>
                              {item.categoria}
                            </span>
                          </td>
                          <td>{item.descripcion}</td>
                          <td style={{ color: "var(--gray)" }}>{item.fecha}</td>
                          <td className={styles.colAmount} style={{ fontWeight: 700, color: "var(--primaryColor)" }}>
                            {formatHNL(item.monto)}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
          {Math.ceil(egresosOrdenados.length / itemsPerPage) > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "1rem", padding: "1rem" }} className="no-print">
              <button 
                disabled={currentPageEgresos === 1} 
                onClick={() => setCurrentPageEgresos(prev => Math.max(prev - 1, 1))}
                className={styles.btnActionSecondary}
                style={{ padding: "0.5rem 1rem", cursor: currentPageEgresos === 1 ? "not-allowed" : "pointer", opacity: currentPageEgresos === 1 ? 0.5 : 1 }}
              >
                Anterior
              </button>
              <span style={{ fontSize: "1.2rem", fontWeight: "600" }}>Página {currentPageEgresos} de {Math.ceil(egresosOrdenados.length / itemsPerPage)}</span>
              <button 
                disabled={currentPageEgresos === Math.ceil(egresosOrdenados.length / itemsPerPage)} 
                onClick={() => setCurrentPageEgresos(prev => Math.min(prev + 1, Math.ceil(egresosOrdenados.length / itemsPerPage)))}
                className={styles.btnActionSecondary}
                style={{ padding: "0.5rem 1rem", cursor: currentPageEgresos === Math.ceil(egresosOrdenados.length / itemsPerPage) ? "not-allowed" : "pointer", opacity: currentPageEgresos === Math.ceil(egresosOrdenados.length / itemsPerPage) ? 0.5 : 1 }}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── VISTA DE IMPRESIÓN REUTILIZABLE INSTITUCIONAL ── */}
      <div className={styles.printView}>
        <PrintReportDocument
          title="Resumen Financiero General"
          userRole={userRole}
          metaItems={[
            { label: "Año Fiscal", value: anioFiltro === "todos" ? "Todos los Años" : `Año ${anioFiltro}` },
            { label: "Estado Financiero", value: saldoNeto >= 0 ? "Superávit" : "Déficit" },
          ]}
          summaryCards={[
            { label: "Total Ingresos (Bazar)", value: formatHNL(totalIngresos) },
            { label: "Total Egresos (Gastos)", value: formatHNL(totalEgresos) },
            { label: "Saldo Neto", value: formatHNL(saldoNeto) },
            { label: "Donaciones Especie", value: formatHNL(donacionesEspecie) },
          ]}
          footerNote="Reporte de balance contable gerencial — Fundación Dibujando Sonrisas"
        >
          {/* Gráfico en Impresión sin cortes */}
          <div style={{ pageBreakInside: "avoid", breakInside: "avoid", border: "1px solid #94a3b8", borderRadius: "4px", padding: "1.2rem", marginBottom: "2rem", background: "#ffffff" }}>
            <h3 style={{ fontSize: "10.5pt", fontWeight: "bold", color: "#000000", margin: "0 0 1rem 0", textTransform: "uppercase", borderBottom: "1px solid #cbd5e1", paddingBottom: "0.4rem", textAlign: "center" }}>
              Histórico Mensual Comparativo (Bazar vs Gastos)
            </h3>
            <div style={{ height: "170px", width: "100%", maxWidth: "600px", margin: "0 auto 1rem" }}>
              {loading ? (
                <div style={{ textAlign: "center", paddingTop: "30px", fontSize: "9.5pt" }}>Cargando gráfico...</div>
              ) : (
                <div className={styles.barChartGrid} style={{ height: "100%", borderBottom: "2px solid #000000" }}>
                  {mensual.map((m, idx) => {
                    const alturaIngresos = maxMensual > 0 ? (m.ingresos / maxMensual) * 80 : 0;
                    const alturaEgresos = maxMensual > 0 ? (m.egresos / maxMensual) * 80 : 0;
                    return (
                      <div key={idx} className={styles.barCol} style={{ gap: "4px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: "4px",
                            height: "100%",
                          }}
                        >
                          <div
                            className={styles.chartBarElement}
                            style={{
                              height: `${alturaIngresos}%`,
                              backgroundColor: "#1abc9c",
                              width: "1.4rem",
                            }}
                          />
                          <div
                            className={styles.chartBarElement}
                            style={{
                              height: `${alturaEgresos}%`,
                              backgroundColor: "#3498db",
                              width: "1.4rem",
                            }}
                          />
                        </div>
                        <span className={styles.barLabel} style={{ fontSize: "8.5pt", color: "#000000", fontWeight: "bold" }}>{m.mes}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", fontSize: "9pt", marginTop: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: "#1abc9c", borderRadius: "2px" }} />
                <span>Bazar / Ventas (HNL)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: "#3498db", borderRadius: "2px" }} />
                <span>Gastos Brigada (HNL)</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "10.5pt", fontWeight: "bold", color: "#000000", borderBottom: "1px solid #000000", paddingBottom: "0.4rem", textTransform: "uppercase" }}>
              Detalle de Ventas Bazar (Ingresos)
            </h3>
            <table className={styles.printTable} style={{ marginTop: "0.5rem" }}>
              <thead>
                <tr>
                  <th style={{ width: "4%" }}>#</th>
                  <th style={{ width: "26%" }}>Categoría</th>
                  <th style={{ width: "40%" }}>Descripción de la Venta</th>
                  <th style={{ width: "15%" }}>Fecha</th>
                  <th style={{ width: "15%", textAlign: "right" }}>Monto (HNL)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "1.5rem" }}>Cargando ventas...</td>
                  </tr>
                ) : ingresosOrdenados.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "1.5rem" }}>No se encontraron ingresos.</td>
                  </tr>
                ) : (
                  ingresosOrdenados.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: "center" }}>{idx + 1}</td>
                      <td style={{ fontWeight: "bold" }}>{item.categoria}</td>
                      <td>{item.descripcion}</td>
                      <td>{item.fecha}</td>
                      <td style={{ textAlign: "right", fontWeight: "bold" }}>{formatHNL(item.monto)}</td>
                    </tr>
                  ))
                )}
                {!loading && ingresosOrdenados.length > 0 && (
                  <tr style={{ fontWeight: "bold", background: "#f1f5f9" }}>
                    <td colSpan={4}>TOTAL INGRESOS</td>
                    <td style={{ textAlign: "right" }}>{formatHNL(totalIngresos)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "10.5pt", fontWeight: "bold", color: "#000000", borderBottom: "1px solid #000000", paddingBottom: "0.4rem", textTransform: "uppercase" }}>
              Detalle de Gastos Brigada (Egresos)
            </h3>
            <table className={styles.printTable} style={{ marginTop: "0.5rem" }}>
              <thead>
                <tr>
                  <th style={{ width: "4%" }}>#</th>
                  <th style={{ width: "26%" }}>Categoría</th>
                  <th style={{ width: "40%" }}>Descripción del Gasto</th>
                  <th style={{ width: "15%" }}>Fecha</th>
                  <th style={{ width: "15%", textAlign: "right" }}>Monto (HNL)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "1.5rem" }}>Cargando gastos...</td>
                  </tr>
                ) : egresosOrdenados.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "1.5rem" }}>No se encontraron egresos.</td>
                  </tr>
                ) : (
                  egresosOrdenados.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: "center" }}>{idx + 1}</td>
                      <td style={{ fontWeight: "bold" }}>{item.categoria}</td>
                      <td>{item.descripcion}</td>
                      <td>{item.fecha}</td>
                      <td style={{ textAlign: "right", fontWeight: "bold" }}>{formatHNL(item.monto)}</td>
                    </tr>
                  ))
                )}
                {!loading && egresosOrdenados.length > 0 && (
                  <tr style={{ fontWeight: "bold", background: "#f1f5f9" }}>
                    <td colSpan={4}>TOTAL EGRESOS</td>
                    <td style={{ textAlign: "right" }}>{formatHNL(totalEgresos)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </PrintReportDocument>
      </div>
    </div>
  );
}
