"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "@/styles/pages/reportes.module.css";
import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";

export interface InsumoConsumoData {
  categoria: string;
  totalEntregado: number;
  unidad: string;
  valorEstimadoHNL: number;
  topItem: string;
  fecha: string; // ISO date string to filter by period
}

export default function ResumenInsumos() {
  const { role } = usePermissions();
  const userRole = role ? ROLE_LABELS[role] : "ADMINISTRADOR";
  const [anioFiltro, setAnioFiltro] = useState<string>("todos");
  const [rawInsumos, setRawInsumos] = useState<InsumoConsumoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchInsumos() {
      setLoading(true);
      try {
        // 1. Fetch pharmacy deliveries
        const { data: farmaciaData, error: farmaciaError } = await supabase
          .from("entregas_farmacia")
          .select(`
            cantidad,
            fecha_entrega,
            medicamentos (
              nombre,
              unidad_medida,
              categorias_inventario (
                nombre
              )
            )
          `);
        if (farmaciaError) throw farmaciaError;

        // 2. Fetch clothing deliveries
        const { data: ropaData, error: ropaError } = await supabase
          .from("entregas_ropa")
          .select("cantidad_prendas, fecha_entrega");
        if (ropaError) throw ropaError;

        const list: InsumoConsumoData[] = [];

        // Process pharmacy deliveries
        const catMap: Record<string, { total: number; unit: string; topItem: string; topCount: number; itemCounts: Record<string, number>; dates: string[] }> = {};
        (farmaciaData || []).forEach((f: {
          cantidad: number | null;
          fecha_entrega: string | null;
          medicamentos: {
            nombre: string;
            unidad_medida: string | null;
            categorias_inventario: { nombre: string } | null;
          } | null;
        }) => {
          const quantity = f.cantidad || 0;
          const medName = f.medicamentos?.nombre || "Otros";
          const catName = f.medicamentos?.categorias_inventario?.nombre || "Otros";
          const unit = f.medicamentos?.unidad_medida || "tabletas";
          const dateStr = f.fecha_entrega || new Date().toISOString();

          if (!catMap[catName]) {
            catMap[catName] = {
              total: 0,
              unit: unit,
              topItem: "",
              topCount: 0,
              itemCounts: {},
              dates: [],
            };
          }

          catMap[catName].total += quantity;
          catMap[catName].itemCounts[medName] = (catMap[catName].itemCounts[medName] || 0) + quantity;
          catMap[catName].dates.push(dateStr);
          if (catMap[catName].itemCounts[medName] > catMap[catName].topCount) {
            catMap[catName].topCount = catMap[catName].itemCounts[medName];
            catMap[catName].topItem = medName;
          }
        });

        Object.keys(catMap).forEach((catName) => {
          const dates = catMap[catName].dates;
          const avgDate = dates.length > 0 ? dates[0] : new Date().toISOString();
          list.push({
            categoria: catName,
            totalEntregado: catMap[catName].total,
            unidad: catMap[catName].unit,
            valorEstimadoHNL: catMap[catName].total * 25, // Mock valuation L. 25 per dose
            topItem: catMap[catName].topItem,
            fecha: avgDate,
          });
        });

        // Process clothing deliveries
        (ropaData || []).forEach((r: {
          cantidad_prendas: number | null;
          fecha_entrega: string | null;
          observaciones?: string | null;
        }) => {
          const quantity = r.cantidad_prendas || 0;
          const dateStr = r.fecha_entrega || new Date().toISOString();
          list.push({
            categoria: "Ropa & Calzado",
            totalEntregado: quantity,
            unidad: "piezas",
            valorEstimadoHNL: quantity * 100, // Mock valuation L. 100 per piece
            topItem: "Ropa de Niño",
            fecha: dateStr,
          });
        });

        // Group final list if there are multiple dates, but here we can just consolidate clothing into a single row per year if filtered, or keep them.
        // To be safe and clean, let's group all by category for the selected year!
        // We will store all raw entries with their exact dates, and then aggregate them dynamically in `procesarDatos`!
        // Yes, this is much better! Let's store raw records.
        const rawList: InsumoConsumoData[] = [];
        (farmaciaData || []).forEach((f: {
          cantidad: number | null;
          fecha_entrega: string | null;
          medicamentos: {
            nombre: string;
            unidad_medida: string | null;
            categorias_inventario: { nombre: string } | null;
          } | null;
        }) => {
          const catName = f.medicamentos?.categorias_inventario?.nombre || "Otros";
          rawList.push({
            categoria: catName,
            totalEntregado: f.cantidad || 0,
            unidad: f.medicamentos?.unidad_medida || "tabletas",
            valorEstimadoHNL: (f.cantidad || 0) * 25,
            topItem: f.medicamentos?.nombre || "N/A",
            fecha: f.fecha_entrega || new Date().toISOString(),
          });
        });

        (ropaData || []).forEach((r: {
          cantidad_prendas: number | null;
          fecha_entrega: string | null;
          observaciones?: string | null;
        }) => {
          rawList.push({
            categoria: "Ropa & Calzado",
            totalEntregado: r.cantidad_prendas || 0,
            unidad: "piezas",
            valorEstimadoHNL: (r.cantidad_prendas || 0) * 100,
            topItem: r.observaciones || "Ropa Infantil",
            fecha: r.fecha_entrega || new Date().toISOString(),
          });
        });

        setRawInsumos(rawList);
      } catch (err) {
        console.error("Error fetching insumos data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsumos();
  }, []);

  // Dynamically extract unique years from data
  const aniosDisponibles = Array.from(
    new Set(
      rawInsumos.map((item) => {
        try {
          return new Date(item.fecha).getFullYear().toString();
        } catch {
          return null;
        }
      }).filter(Boolean)
    )
  ).sort() as string[];

  const procesarDatos = () => {
    // 1. Filter by year
    const filtered = rawInsumos.filter((item) => {
      if (anioFiltro === "todos") return true;
      try {
        const itemYear = new Date(item.fecha).getFullYear().toString();
        return itemYear === anioFiltro;
      } catch {
        return false;
      }
    });

    // 2. Aggregate by Category
    const agg: Record<string, { total: number; unit: string; topItem: string; topCount: number; itemCounts: Record<string, number>; valor: number }> = {};
    filtered.forEach((item) => {
      const cat = item.categoria;
      if (!agg[cat]) {
        agg[cat] = {
          total: 0,
          unit: item.unidad,
          topItem: "",
          topCount: 0,
          itemCounts: {},
          valor: 0,
        };
      }
      agg[cat].total += item.totalEntregado;
      agg[cat].valor += item.valorEstimadoHNL;
      agg[cat].itemCounts[item.topItem] = (agg[cat].itemCounts[item.topItem] || 0) + item.totalEntregado;

      if (agg[cat].itemCounts[item.topItem] > agg[cat].topCount) {
        agg[cat].topCount = agg[cat].itemCounts[item.topItem];
        agg[cat].topItem = item.topItem;
      }
    });

    return Object.keys(agg).map((catName) => ({
      categoria: catName,
      totalEntregado: agg[catName].total,
      unidad: agg[catName].unit,
      valorEstimadoHNL: agg[catName].valor,
      topItem: agg[catName].topItem,
    })).sort((a, b) => a.categoria.localeCompare(b.categoria, "es"));
  };

  const datos = procesarDatos();

  // Calculations
  const totalInsumos = datos.reduce((acc, curr) => acc + curr.totalEntregado, 0);
  const totalValor = datos.reduce((acc, curr) => acc + curr.valorEstimadoHNL, 0);

  // Find max value to scale visual bar chart SVG
  const maxValor = Math.max(...datos.map((d) => d.valorEstimadoHNL), 1);

  // Branding colors variations array
  const colores = ["#3498db", "#1abc9c", "#2980b9", "#16a085", "#5dade2", "#48c9b0"];

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
          RESUMEN DE ENTREGA DE INSUMOS
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
            <h3>Resumen de Entrega de Insumos</h3>
            <p>
              Consolidado de insumos médicos, dentales y ayuda
              humanitaria distribuida a las comunidades.
            </p>
          </div>
        </div>

      </div>

      {/* Filtros */}
      <div className={styles.reportFilters}>
        <div className={styles.filterGroup}>
          <label htmlFor="insumos-periodo">Periodo (Año)</label>
          <select
            id="insumos-periodo"
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
            fontStyle: "italic",
          }}
        >
          Insumos valorados según costo estimado unitario de adquisición.
        </p>
      </div>

      {/* KPIs de Insumos */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
          <p className={styles.kpiLabel}>Total Insumos Entregados</p>
          <p className={styles.kpiValue}>
            {loading ? "..." : totalInsumos.toLocaleString()}
          </p>
          <p className={styles.kpiChange}>Unidades físicas entregadas</p>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
          <p className={styles.kpiLabel}>Valor Estimado Donación</p>
          <p className={styles.kpiValue}>
            L. {loading ? "..." : totalValor.toLocaleString()}
          </p>
          <p className={`${styles.kpiChange} ${styles.kpiChangePositive}`}>
            Aporte social directo
          </p>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiCardTeal}`}>
          <p className={styles.kpiLabel}>Categorías Activas</p>
          <p className={styles.kpiValue}>{loading ? "..." : datos.length}</p>
          <p className={styles.kpiChange}>Grupos de insumos clasificados</p>
        </div>
      </div>

      {/* Gráfico y Tabla lado a lado */}
      <div className={styles.financeSection} style={{ padding: "2.4rem" }}>
        <h4
          style={{
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          Distribución del Valor de Insumos por Categoría
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
              No hay datos para mostrar en el gráfico
            </div>
          ) : (
            <div className={styles.barChartGrid}>
              {datos.map((d, index) => {
                const alturaPorcentaje = Math.max(
                  (d.valorEstimadoHNL / maxValor) * 80,
                  8
                );
                return (
                  <div key={d.categoria} className={styles.barCol}>
                    <div className={styles.barColTooltip}>
                      L. {d.valorEstimadoHNL.toLocaleString()} ({d.totalEntregado}{" "}
                      {d.unidad})
                    </div>
                    <div
                      className={styles.chartBarElement}
                      style={{
                        height: `${alturaPorcentaje}%`,
                        backgroundColor: colores[index % colores.length],
                        width: "3.6rem",
                      }}
                    />
                    <span className={styles.barLabel}>{d.categoria}</span>
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
                <th>Categoría de Insumo</th>
                <th style={{ textAlign: "right" }}>Cantidad Entregada</th>
                <th>Unidad de Medida</th>
                <th>Artículo Más Solicitado / Entregado</th>
                <th style={{ textAlign: "right" }}>Valor Social Estimado</th>
                <th>Porcentaje del Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                    Cargando listado de insumos...
                  </td>
                </tr>
              ) : datos.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                    No se encontraron entregas de insumos.
                  </td>
                </tr>
              ) : (
                datos.map((item, index) => {
                  const porcentajeValor = totalValor > 0
                    ? ((item.valorEstimadoHNL / totalValor) * 100).toFixed(1)
                    : "0.0";
                  return (
                    <tr key={item.categoria}>
                      <td style={{ fontWeight: 700 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: "1.2rem",
                            height: "1.2rem",
                            borderRadius: "50%",
                            backgroundColor: colores[index % colores.length],
                            marginRight: "0.8rem",
                          }}
                        />
                        {item.categoria}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {item.totalEntregado.toLocaleString()}
                      </td>
                      <td style={{ color: "var(--gray)", fontSize: "1.3rem" }}>
                        {item.unidad}
                      </td>
                      <td style={{ fontStyle: "italic" }}>{item.topItem}</td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 700,
                          color: "var(--primaryDark)",
                        }}
                      >
                        L. {item.valorEstimadoHNL.toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>{porcentajeValor}%</td>
                    </tr>
                  );
                })
              )}
              {!loading && datos.length > 0 && (
                <tr className={styles.financeTotalsRow}>
                  <td>TOTALES</td>
                  <td style={{ textAlign: "right" }}>
                    {totalInsumos.toLocaleString()}
                  </td>
                  <td>unidades</td>
                  <td>—</td>
                  <td style={{ textAlign: "right" }}>
                    L. {totalValor.toLocaleString()}
                  </td>
                  <td>100%</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
