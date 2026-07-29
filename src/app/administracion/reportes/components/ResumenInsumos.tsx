"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/pages/reportes.module.css";
import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";
import PrintReportDocument from "./PrintReportDocument";

export interface BrigadeReportData {
  brigada_id: string;
  brigada_nombre: string;
  fecha: string;
  comunidad: string;
  total_medicamentos: number;
  total_ropa: number;
  total_juguetes: number;
  total_general: number;
}

export default function ResumenInsumos() {
  const { role } = usePermissions();
  const userRole = role ? ROLE_LABELS[role] : "ADMINISTRADOR";

  const [brigadasData, setBrigadasData] = useState<BrigadeReportData[]>([]);
  const [selectedBrigadaId, setSelectedBrigadaId] = useState<string>("todas");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchReporteData() {
      setLoading(true);
      try {
        // 1. Consultar la View optimizada v_reporte_insumos_brigada
        const { data: viewData, error: viewError } = await supabase
          .from("v_reporte_insumos_brigada")
          .select("*")
          .order("fecha", { ascending: false });

        if (!viewError && viewData) {
          const formatted: BrigadeReportData[] = viewData.map((row: any) => ({
            brigada_id: row.brigada_id || "",
            brigada_nombre: row.brigada_nombre || "Sin Nombre",
            fecha: row.fecha || "",
            comunidad: row.comunidad || "N/A",
            total_medicamentos: Number(row.total_medicamentos || 0),
            total_ropa: Number(row.total_ropa || 0),
            total_juguetes: Number(row.total_juguetes || 0),
            total_general: Number(row.total_general || 0),
          }));
          setBrigadasData(formatted);
          if (formatted.length > 0) {
            setSelectedBrigadaId(formatted[0].brigada_id);
          }
          return;
        }

        // Fallback optimizado por si la View aún no ha sido aplicada en la base de datos
        console.warn("View v_reporte_insumos_brigada no disponible, ejecutando fallback:", viewError?.message);

        const [
          { data: brigadas },
          { data: farmaciaData },
          { data: ropaData },
          { data: juguetesData },
        ] = await Promise.all([
          supabase.from("brigadas").select("id, nombre, fecha_brigada, lugar").order("fecha_brigada", { ascending: false }),
          supabase.from("entregas_farmacia").select("cantidad, consultas!inner(brigada_id)"),
          supabase.from("entregas_ropa").select("cantidad_prendas, brigada_id"),
          supabase.from("actividades_infantiles").select("cantidad_regalos, brigada_id"),
        ]);

        const medMap: Record<string, number> = {};
        (farmaciaData || []).forEach((f: any) => {
          const bId = f.consultas?.brigada_id;
          if (bId) {
            medMap[bId] = (medMap[bId] || 0) + Number(f.cantidad || 0);
          }
        });

        const ropaMap: Record<string, number> = {};
        (ropaData || []).forEach((r: any) => {
          if (r.brigada_id) {
            ropaMap[r.brigada_id] = (ropaMap[r.brigada_id] || 0) + Number(r.cantidad_prendas || 0);
          }
        });

        const jugMap: Record<string, number> = {};
        (juguetesData || []).forEach((j: any) => {
          if (j.brigada_id) {
            jugMap[j.brigada_id] = (jugMap[j.brigada_id] || 0) + Number(j.cantidad_regalos || 0);
          }
        });

        const list: BrigadeReportData[] = (brigadas || []).map((b: any) => {
          const tMed = medMap[b.id] || 0;
          const tRopa = ropaMap[b.id] || 0;
          const tJug = jugMap[b.id] || 0;
          return {
            brigada_id: b.id,
            brigada_nombre: b.nombre,
            fecha: b.fecha_brigada,
            comunidad: b.lugar || "N/A",
            total_medicamentos: tMed,
            total_ropa: tRopa,
            total_juguetes: tJug,
            total_general: tMed + tRopa + tJug,
          };
        });

        setBrigadasData(list);
        if (list.length > 0) {
          setSelectedBrigadaId(list[0].brigada_id);
        }
      } catch (err) {
        console.error("Error al cargar datos del reporte de insumos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReporteData();
  }, []);

  // Determinar los datos a mostrar según el filtro de brigada
  const selectedBrigada = brigadasData.find((b) => b.brigada_id === selectedBrigadaId);

  const displayNombre = selectedBrigadaId === "todas"
    ? "Todas las Brigadas"
    : selectedBrigada?.brigada_nombre || "Seleccionar Brigada";

  const displayFecha = selectedBrigadaId === "todas"
    ? "Consolidado General"
    : selectedBrigada?.fecha
      ? new Date(selectedBrigada.fecha).toLocaleDateString("es-HN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Fecha no registrada";

  const displayComunidad = selectedBrigadaId === "todas"
    ? "Varias Comunidades"
    : selectedBrigada?.comunidad || "No especificada";

  let totalMedicamentos = 0;
  let totalRopa = 0;
  let totalJuguetes = 0;

  if (selectedBrigadaId === "todas") {
    totalMedicamentos = brigadasData.reduce((acc, b) => acc + b.total_medicamentos, 0);
    totalRopa = brigadasData.reduce((acc, b) => acc + b.total_ropa, 0);
    totalJuguetes = brigadasData.reduce((acc, b) => acc + b.total_juguetes, 0);
  } else if (selectedBrigada) {
    totalMedicamentos = selectedBrigada.total_medicamentos;
    totalRopa = selectedBrigada.total_ropa;
    totalJuguetes = selectedBrigada.total_juguetes;
  }

  const totalGeneral = totalMedicamentos + totalRopa + totalJuguetes;

  // Categorías sintetizadas para la tabla y gráfico
  const categorias = [
    {
      id: "med",
      nombre: "Medicamentos Entregados",
      nombreCorto: "Medicamentos",
      cantidad: totalMedicamentos,
      color: "#3498db",
    },
    {
      id: "ropa",
      nombre: "Prendas de Ropa Entregadas",
      nombreCorto: "Ropa",
      cantidad: totalRopa,
      color: "#1abc9c",
    },
    {
      id: "jug",
      nombre: "Juguetes Entregados",
      nombreCorto: "Juguetes",
      cantidad: totalJuguetes,
      color: "#2980b9",
    },
  ];

  const maxCantidad = Math.max(...categorias.map((c) => c.cantidad), 1);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Reporte de Entrega de Insumos - ${displayNombre}`;

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
              <h3>Resumen de Entrega de Insumos</h3>
              <p>
                Consolidado sintetizado de insumos entregados durante la brigada seleccionada.
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
            <label htmlFor="insumos-brigada">Filtrar por Brigada</label>
            <select
              id="insumos-brigada"
              value={selectedBrigadaId}
              onChange={(e) => setSelectedBrigadaId(e.target.value)}
              disabled={loading}
            >
              <option value="todas">Todas las brigadas</option>
              {brigadasData.map((b) => (
                <option key={b.brigada_id} value={b.brigada_id}>
                  {b.brigada_nombre} {b.fecha ? `(${new Date(b.fecha).toLocaleDateString("es-HN")})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              margin: "auto 0 0",
              fontSize: "1.35rem",
              color: "var(--gray)",
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <span><strong>Brigada:</strong> {displayNombre}</span>
            <span><strong>Fecha:</strong> {displayFecha}</span>
            <span><strong>Comunidad:</strong> {displayComunidad}</span>
          </div>
        </div>

        {/* KPIs de Insumos por Brigada */}
        <div className={styles.kpiGrid}>
          <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
            <p className={styles.kpiLabel}>Total Insumos Entregados</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : totalGeneral.toLocaleString()}
            </p>
            <p className={styles.kpiChange}>Total general en la brigada</p>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiCardTeal}`}>
            <p className={styles.kpiLabel}>Medicamentos Entregados</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : totalMedicamentos.toLocaleString()}
            </p>
            <p className={styles.kpiChange}>Dosis y recetas de farmacia</p>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
            <p className={styles.kpiLabel}>Prendas de Ropa Entregadas</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : totalRopa.toLocaleString()}
            </p>
            <p className={styles.kpiChange}>Piezas de vestir distribuidas</p>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
            <p className={styles.kpiLabel}>Juguetes Entregados</p>
            <p className={styles.kpiValue}>
              {loading ? "..." : totalJuguetes.toLocaleString()}
            </p>
            <p className={styles.kpiChange}>Regalos en actividades infantiles</p>
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
            Distribución de Insumos Entregados ({displayNombre})
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
            ) : totalGeneral === 0 ? (
              <div style={{ textAlign: "center", paddingTop: "50px", color: "var(--grayLight)" }}>
                No hay entregas registradas para esta brigada.
              </div>
            ) : (
              <div className={styles.barChartGrid}>
                {categorias.map((cat) => {
                  const alturaPorcentaje = Math.max(
                    (cat.cantidad / maxCantidad) * 80,
                    8
                  );
                  return (
                    <div key={cat.id} className={styles.barCol}>
                      <div className={styles.barColTooltip}>
                        {cat.cantidad.toLocaleString()} {cat.nombreCorto.toLowerCase()} entregados
                      </div>
                      <div
                        className={styles.chartBarElement}
                        style={{
                          height: `${alturaPorcentaje}%`,
                          backgroundColor: cat.color,
                          width: "3.6rem",
                        }}
                      />
                      <span className={styles.barLabel}>{cat.nombreCorto}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tabla sintetizada por categoría */}
          <div style={{ overflowX: "auto" }}>
            <table className={styles.financeTable}>
              <thead>
                <tr>
                  <th>Categoría de Insumo</th>
                  <th style={{ textAlign: "right" }}>Total Entregado</th>
                  <th style={{ textAlign: "right" }}>Porcentaje del Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                      Cargando resumen de insumos...
                    </td>
                  </tr>
                ) : totalGeneral === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                      No se encontraron entregas para esta brigada.
                    </td>
                  </tr>
                ) : (
                  categorias.map((cat) => {
                    const porcentaje = totalGeneral > 0
                      ? ((cat.cantidad / totalGeneral) * 100).toFixed(1)
                      : "0.0";
                    return (
                      <tr key={cat.id}>
                        <td style={{ fontWeight: 700 }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: "1.2rem",
                              height: "1.2rem",
                              borderRadius: "50%",
                              backgroundColor: cat.color,
                              marginRight: "0.8rem",
                            }}
                          />
                          {cat.nombre}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                          {cat.cantidad.toLocaleString()}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                          {porcentaje}%
                        </td>
                      </tr>
                    );
                  })
                )}
                {!loading && totalGeneral > 0 && (
                  <tr className={styles.financeTotalsRow}>
                    <td>TOTAL GENERAL DE INSUMOS ENTREGADOS</td>
                    <td style={{ textAlign: "right" }}>
                      {totalGeneral.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>100%</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* ── FIN VISTA WEB ── */}

      {/* ── VISTA DE IMPRESIÓN REUTILIZABLE INSTITUCIONAL ── */}
      <div className={styles.printView}>
        <PrintReportDocument
          title="Resumen de Entrega de Insumos por Brigada"
          userRole={userRole}
          metaItems={[
            { label: "Brigada", value: displayNombre },
            { label: "Fecha", value: displayFecha },
            { label: "Comunidad", value: displayComunidad },
          ]}
          summaryCards={[
            { label: "Total General Insumos", value: totalGeneral.toLocaleString() },
            { label: "Medicamentos Entregados", value: totalMedicamentos.toLocaleString() },
            { label: "Prendas de Ropa Entregadas", value: totalRopa.toLocaleString() },
            { label: "Juguetes Entregados", value: totalJuguetes.toLocaleString() },
          ]}
          footerNote="Consolidado de ayuda humanitaria e insumos — Fundación Dibujando Sonrisas"
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
              Distribución de Insumos Entregados
            </h3>

            <div style={{ height: "180px", width: "100%", maxWidth: "680px", margin: "0 auto" }}>
              {loading ? (
                <div style={{ textAlign: "center", paddingTop: "40px", fontSize: "9pt" }}>
                  Cargando gráfico...
                </div>
              ) : totalGeneral === 0 ? (
                <div style={{ textAlign: "center", paddingTop: "40px", fontSize: "9pt" }}>
                  No hay entregas registradas para esta brigada.
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
                  {categorias.map((cat) => {
                    const alturaPorcentaje = Math.max(
                      (cat.cantidad / maxCantidad) * 75,
                      10
                    );
                    return (
                      <div
                        key={cat.id}
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
                          {cat.cantidad.toLocaleString()}
                        </span>
                        <div
                          style={{
                            height: `${alturaPorcentaje}%`,
                            backgroundColor: cat.color,
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
                          {cat.nombreCorto}
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
                <th style={{ width: "48%" }}>Categoría de Insumo</th>
                <th style={{ width: "24%", textAlign: "right" }}>Total Entregado</th>
                <th style={{ width: "20%", textAlign: "right" }}>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "1.5rem" }}>
                    Cargando insumos...
                  </td>
                </tr>
              ) : totalGeneral === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "1.5rem" }}>
                    No hay entregas registradas para esta brigada.
                  </td>
                </tr>
              ) : (
                categorias.map((cat, idx) => {
                  const porcentaje = totalGeneral > 0
                    ? ((cat.cantidad / totalGeneral) * 100).toFixed(1)
                    : "0.0";
                  return (
                    <tr key={cat.id}>
                      <td style={{ textAlign: "center" }}>{idx + 1}</td>
                      <td style={{ fontWeight: "bold" }}>{cat.nombre}</td>
                      <td style={{ textAlign: "right", fontWeight: "bold" }}>
                        {cat.cantidad.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "bold" }}>
                        {porcentaje}%
                      </td>
                    </tr>
                  );
                })
              )}
              {!loading && totalGeneral > 0 && (
                <tr style={{ fontWeight: "bold", background: "#f1f5f9" }}>
                  <td colSpan={2}>TOTAL GENERAL DE INSUMOS ENTREGADOS</td>
                  <td style={{ textAlign: "right" }}>{totalGeneral.toLocaleString()}</td>
                  <td style={{ textAlign: "right" }}>100%</td>
                </tr>
              )}
            </tbody>
          </table>
        </PrintReportDocument>
      </div>
    </div>
  );
}
