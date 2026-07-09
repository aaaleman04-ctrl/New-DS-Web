"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "@/styles/pages/reportes.module.css";
import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";

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
        setDonacionesEspecie(totalPrendas * 100); // Valuation: L. 100 per clothing item
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
      monto: v.total || 0,
    }))
    .sort((a, b) => a.codigo.localeCompare(b.codigo));

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
      monto: g.monto || 0,
    }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

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

  return (
    <div>
      {/* Encabezado Oficial para Impresión */}
      <div className={styles.headerPrint}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          <Image
            src="/DS-LOGO.png"
            alt="Logo Dibujando Sonrisas"
            width={40}
            height={40}
            priority
          />
          <h1 className={styles.headerPrintTitle} style={{ margin: 0 }}>
            Fundación Dibujando Sonrisas
          </h1>
        </div>
        <h2 className={styles.headerPrintSubtitle}>
          RESUMEN FINANCIERO GENERAL
        </h2>
        <div className={styles.headerPrintMeta}>
          <span>
            <strong>Generado por:</strong> {userRole}
          </span>
          <span>
            <strong>Fecha:</strong> {fechaActualCompleta}
          </span>
        </div>
      </div>

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
        {/* Ingresos */}
        <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
          <p className={styles.kpiLabel}>Ingresos por Ventas</p>
          <p className={styles.kpiValue}>
            {loading ? "..." : formatHNL(totalIngresos)}
          </p>
          <p className={`${styles.kpiChange} ${styles.kpiChangeNeutral}`}>
            Actividades bazar y eventos
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className={styles.kpiIcon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>

        {/* Egresos */}
        <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
          <p className={styles.kpiLabel}>Egresos / Gastos Brigada</p>
          <p className={styles.kpiValue}>
            {loading ? "..." : formatHNL(totalEgresos)}
          </p>
          <p className={`${styles.kpiChange} ${styles.kpiChangeNeutral}`}>
            Medicinas y logística de brigada
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className={styles.kpiIcon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.007m0-.007a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM3.75 12h.007m-.007 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 5.25h.007m-.007 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm2.25-11.25h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </div>

        {/* Saldo Neto */}
        <div className={`${styles.kpiCard} ${styles.kpiCardTeal}`}>
          <p className={styles.kpiLabel}>Diferencia Bazar vs Gastos</p>
          <p className={styles.kpiValue}>
            {loading ? "..." : formatHNL(saldoNeto)}
          </p>
          <p className={`${styles.kpiChange} ${styles.kpiChangeNeutral}`}>
            Saldo operativo neto
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className={styles.kpiIcon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
            />
          </svg>
        </div>

        {/* Donaciones en Especie */}
        <div className={`${styles.kpiCard} ${styles.kpiCardTeal}`}>
          <p className={styles.kpiLabel}>Donaciones en Especie (Ropa)</p>
          <p className={styles.kpiValue}>
            {loading ? "..." : formatHNL(donacionesEspecie)}
          </p>
          <p className={`${styles.kpiChange} ${styles.kpiChangeNeutral}`}>
            Valor estimado de ayuda colectada
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className={styles.kpiIcon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
            />
          </svg>
        </div>
      </div>

      {/* Gráfico comparativo de Ingresos vs Egresos */}
      <div className={styles.financeSection} style={{ padding: "2.4rem" }}>
        <h4
          style={{
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          Comparativa Mensual (Bazar vs. Gastos)
        </h4>

        {/* Gráfico SVG interactivo */}
        <div
          style={{
            height: "240px",
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto 2rem",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", paddingTop: "50px", color: "var(--grayLight)" }}>
              Cargando gráfico financiero...
            </div>
          ) : (
            <div className={styles.barChartGrid}>
              {mensual.map((m) => {
                const alturaIngresos = maxMensual > 0 ? (m.ingresos / maxMensual) * 80 : 0;
                const alturaEgresos = maxMensual > 0 ? (m.egresos / maxMensual) * 80 : 0;

                return (
                  <div
                    key={m.mes}
                    className={styles.barCol}
                    style={{ gap: "0.4rem" }}
                  >
                    <div className={styles.barColTooltip}>
                      🟢 Bazar: L. {m.ingresos.toLocaleString()} | 🔵 Gastos:
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
                          backgroundColor: "#1abc9c", // teal (Ingresos/Bazar)
                          width: "1.6rem",
                        }}
                      />
                      <div
                        className={styles.chartBarElement}
                        style={{
                          height: `${alturaEgresos}%`,
                          backgroundColor: "#3498db", // azul (Gastos)
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

        {/* Leyenda del gráfico */}
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
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th className={styles.colAmount}>Monto (HNL)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                    Cargando ventas...
                  </td>
                </tr>
              ) : ingresosOrdenados.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                    No se encontraron ingresos por ventas.
                  </td>
                </tr>
              ) : (
                ingresosOrdenados.map((item, idx) => (
                  <tr key={idx}>
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
                ))
              )}
            </tbody>
          </table>
        </div>
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
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th className={styles.colAmount}>Monto (HNL)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                    Cargando gastos...
                  </td>
                </tr>
              ) : egresosOrdenados.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                    No se encontraron gastos registrados.
                  </td>
                </tr>
              ) : (
                egresosOrdenados.map((item, idx) => (
                  <tr key={idx}>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
