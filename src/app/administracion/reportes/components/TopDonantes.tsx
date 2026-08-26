"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/pages/reportes.module.css";
import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";
import PrintReportDocument from "./PrintReportDocument";

type Donante = {
  id: string;
  nombre: string;
  tipo: "Empresa" | "Persona Natural" | "ONG" | "Institución";
  ciudad: string;
  donaciones: number;
  total: number; // Valued in HNL (Garments count * 100 HNL)
  ultimaDonacion: string;
  esRecurrente: boolean;
  fechaObj: Date;
};

const tipoLabel: Record<string, string> = {
  Empresa: " Empresa",
  "Persona Natural": " Persona Natural",
  ONG: " ONG",
  Institución: " Institución",
};

const medalEmoji = ["", "", ""];
const rankClasses = [styles.rankGold, styles.rankSilver, styles.rankBronze];

function formatHNL(value: number) {
  return `L. ${value.toLocaleString("es-HN", { minimumFractionDigits: 2 })}`;
}

function getInitials(nombre: string) {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getHeuristicTipo(name: string): "Empresa" | "Persona Natural" | "ONG" | "Institución" {
  const lowercase = name.toLowerCase();
  if (
    lowercase.includes("banco") ||
    lowercase.includes("fundacion") ||
    lowercase.includes("fundación") ||
    lowercase.includes("ong") ||
    lowercase.includes("cruz roja") ||
    lowercase.includes("asociación")
  ) {
    return "ONG";
  }
  if (
    lowercase.includes("grupo") ||
    lowercase.includes("empresa") ||
    lowercase.includes("corporación") ||
    lowercase.includes("s.a.") ||
    lowercase.includes("la colonia") ||
    lowercase.includes("ficohsa") ||
    lowercase.includes("atlántida")
  ) {
    return "Empresa";
  }
  if (
    lowercase.includes("iglesia") ||
    lowercase.includes("municipalidad") ||
    lowercase.includes("cámara") ||
    lowercase.includes("colegio")
  ) {
    return "Institución";
  }
  return "Persona Natural";
}

export default function TopDonantes() {
  const { role } = usePermissions();
  const userRole = role ? ROLE_LABELS[role] : "ADMINISTRADOR";
  const [anioFiltro, setAnioFiltro] = useState<string>("todos");
  const [rawDonaciones, setRawDonaciones] = useState<Array<{
    id: string;
    fecha_donacion: string | null;
    nombre_donante: string | null;
    cantidad_prendas: number | null;
    observaciones: string | null;
  }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [anioFiltro]);

  useEffect(() => {
    async function fetchDonantes() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("donaciones_ropa")
          .select("id, fecha_donacion, nombre_donante, cantidad_prendas, observaciones");
        if (error) throw error;
        setRawDonaciones(data || []);
      } catch (err) {
        console.error("Error loading donantes report:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDonantes();
  }, []);

  // Extract years dynamically from raw donations
  const aniosDisponibles = Array.from(
    new Set(
      rawDonaciones
        .map((row) => {
          try {
            if (!row.fecha_donacion) return null;
            return new Date(row.fecha_donacion).getFullYear().toString();
          } catch {
            return null;
          }
        })
        .filter((y): y is string => Boolean(y) && y !== "NaN")
    )
  ).sort((a, b) => b.localeCompare(a));

  // Dynamic donor grouping & ranking based on selected year filter
  const donantes: Donante[] = rawDonaciones.length === 0 ? [] : (() => {
    const filteredRows = rawDonaciones.filter((row) => {
      if (anioFiltro === "todos") return true;
      try {
        if (!row.fecha_donacion) return false;
        return new Date(row.fecha_donacion).getFullYear().toString() === anioFiltro;
      } catch {
        return false;
      }
    });

    const donorGroups: Record<string, {
      nombre: string;
      dates: Date[];
      prendas: number;
      recordsCount: number;
    }> = {};

    filteredRows.forEach((row) => {
      const donorName = (row.nombre_donante || "Donante Anónimo").trim();
      const date = new Date(row.fecha_donacion || new Date());
      const qty = row.cantidad_prendas || 0;

      if (!donorGroups[donorName]) {
        donorGroups[donorName] = {
          nombre: donorName,
          dates: [],
          prendas: 0,
          recordsCount: 0,
        };
      }
      donorGroups[donorName].dates.push(date);
      donorGroups[donorName].prendas += qty;
      donorGroups[donorName].recordsCount += 1;
    });

    return Object.keys(donorGroups)
      .map((name) => {
        const group = donorGroups[name];
        const sortedDates = [...group.dates].sort((a, b) => b.getTime() - a.getTime());
        const latestDate = sortedDates[0] || new Date();
        const formattedLatestDate = latestDate.toLocaleDateString("es-HN", {
          month: "short",
          year: "numeric",
        });

        return {
          id: name,
          nombre: name,
          tipo: getHeuristicTipo(name),
          ciudad: "Tegucigalpa, Honduras",
          donaciones: group.recordsCount,
          total: group.prendas * 100,
          ultimaDonacion: formattedLatestDate,
          esRecurrente: group.recordsCount > 1,
          fechaObj: latestDate,
        };
      })
      .sort((a, b) => b.total - a.total);
  })();

  const donantesOrdenados = [...donantes];
  const topTres = donantesOrdenados.slice(0, 3);
  const totalAcumulado = donantes.reduce((sum, d) => sum + d.total, 0);
  const maxMonto = donantes[0]?.total || 1;

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
    document.title = "Reporte - Top Donantes por Año";

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
              <h3>Top Donantes por Año</h3>
              <p>
                Muro de Honor — Benefactores que hacen posible nuestra misión de ayuda por periodo anual.
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

        {/* Filtros por Año */}
        <div className={styles.reportFilters}>
          <div className={styles.filterGroup}>
            <label htmlFor="donantes-anio">Periodo Anual</label>
            <select
              id="donantes-anio"
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
            Muro de Honor y ranking acumulado de donantes por aportación en el periodo seleccionado.
          </p>
        </div>

        {/* Estadísticas resumen */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryBarItem}>
          <span className={styles.summaryBarLabel}>Total donantes</span>
          <span className={styles.summaryBarValue}>
            {loading ? "..." : donantes.length}
          </span>
        </div>
        <div className={styles.summaryBarDivider} />
        <div className={styles.summaryBarItem}>
          <span className={styles.summaryBarLabel}>Valor Recaudado (Est.)</span>
          <span className={styles.summaryBarValue}>
            {loading ? "..." : formatHNL(totalAcumulado)}
          </span>
        </div>
        <div className={styles.summaryBarDivider} />
        <div className={styles.summaryBarItem}>
          <span className={styles.summaryBarLabel}>Mayor donante</span>
          <span className={styles.summaryBarValue}>
            {loading ? "..." : (donantes[0]?.nombre.split(" ")[0] ?? "—")}
          </span>
        </div>
        <div className={styles.summaryBarDivider} />
        <div className={styles.summaryBarItem}>
          <span className={styles.summaryBarLabel}>Recurrentes</span>
          <span className={styles.summaryBarValue}>
            {loading ? "..." : donantes.filter((d) => d.esRecurrente).length}
          </span>
        </div>
      </div>

      {/* ── Podio ── */}
      {!loading && donantes.length > 0 && (
        <div className={styles.donantesPodio}>
          {/* Posición 2 — Izquierda */}
          {topTres[1] && (
            <div className={styles.podioItem}>
              <div className={`${styles.podioMedal} ${styles.medal2}`}>
                {medalEmoji[1]}
                <span className={styles.podioRank}>2</span>
              </div>
              <p className={styles.podioName}>{topTres[1].nombre}</p>
              <p className={styles.podioAmount}>{formatHNL(topTres[1].total)}</p>
              <p className={styles.podioPlataforma}>
                {tipoLabel[topTres[1].tipo]}
              </p>
            </div>
          )}

          {/* Posición 1 — Centro (más alto) */}
          {topTres[0] && (
            <div className={styles.podioItem} style={{ order: -1 }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)",
                  borderRadius: "50%",
                  width: "8rem",
                  height: "8rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3.6rem",
                  boxShadow:
                    "0 0 32px rgba(245, 158, 11, 0.6), 0 4px 20px rgba(0,0,0,0.4)",
                  position: "relative",
                  marginBottom: "0.4rem",
                }}
              >
                {medalEmoji[0]}
                <span
                  style={{
                    position: "absolute",
                    bottom: "-0.8rem",
                    right: "-0.4rem",
                    background: "white",
                    borderRadius: "50%",
                    width: "2.4rem",
                    height: "2.4rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: "var(--dark)",
                    border: "2px solid var(--bg-light)",
                  }}
                >
                  1
                </span>
              </div>
              <p
                style={{
                  fontSize: "1.7rem",
                  fontWeight: 800,
                  color: "white",
                  textAlign: "center",
                  lineHeight: 1.3,
                  fontFamily: "var(--fontHeading)",
                  maxWidth: "180px",
                }}
              >
                {topTres[0].nombre}
              </p>
              <p
                style={{
                  fontSize: "2.4rem",
                  fontWeight: 800,
                  color: "#ffd700",
                  fontFamily: "var(--fontHeading)",
                }}
              >
                {formatHNL(topTres[0].total)}
              </p>
              <p className={styles.podioPlataforma}>
                {tipoLabel[topTres[0].tipo]}
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "rgba(255,215,0,0.15)",
                  border: "1px solid rgba(255,215,0,0.3)",
                  borderRadius: "999px",
                  padding: "0.3rem 1rem",
                  marginTop: "0.4rem",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="#ffd700"
                  style={{ width: "1.4rem", height: "1.4rem" }}
                >
                  <path
                    fillRule="evenodd"
                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span
                  style={{
                    fontSize: "1.15rem",
                    color: "#ffd700",
                    fontWeight: 700,
                  }}
                >
                  Mayor Donante
                </span>
              </div>
            </div>
          )}

          {/* Posición 3 — Derecha */}
          {topTres[2] && (
            <div className={styles.podioItem}>
              <div className={`${styles.podioMedal} ${styles.medal3}`}>
                {medalEmoji[2]}
                <span className={styles.podioRank}>3</span>
              </div>
              <p className={styles.podioName}>{topTres[2].nombre}</p>
              <p className={styles.podioAmount}>{formatHNL(topTres[2].total)}</p>
              <p className={styles.podioPlataforma}>
                {tipoLabel[topTres[2].tipo]}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Tabla completa de donantes ── */}
      <div className={styles.donantesTablaWrapper}>
        <div className={styles.donantesTablaTitulo}>
          <h4>Ranking Completo de Donantes</h4>
          <span>{anioFiltro === "todos" ? "Todos los años" : `Año ${anioFiltro}`}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.donantesTable}>
            <thead>
              <tr>
                <th style={{ width: "5rem" }}>#</th>
                <th>Donante</th>
                <th>Tipo</th>
                <th>Ciudad</th>
                <th style={{ textAlign: "center" }}>Donaciones</th>
                <th>Última Donación</th>
                <th style={{ textAlign: "right" }}>Prendas / Valoración (Est.)</th>
                <th>Participación</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                    Cargando ranking de donantes...
                  </td>
                </tr>
              ) : donantes.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.noData}>
                    No hay datos de donantes para este periodo.
                  </td>
                </tr>
              ) : (
                donantesOrdenados
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((donante, relativeIdx) => {
                    const absoluteIdx = (currentPage - 1) * itemsPerPage + relativeIdx;
                    const porcentaje = Math.round((donante.total / maxMonto) * 100);
                    const isTop3 = absoluteIdx < 3;

                    return (
                      <tr key={donante.id}>
                        {/* Rank */}
                        <td>
                          <div className={styles.rankCell}>
                            <span
                              className={`${styles.rankNumber} ${
                                isTop3 ? rankClasses[absoluteIdx] : styles.rankDefault
                              }`}
                            >
                              {isTop3 ? medalEmoji[absoluteIdx] : absoluteIdx + 1}
                            </span>
                          </div>
                        </td>

                        {/* Donante info */}
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "1rem",
                            }}
                          >
                            <div
                              className={styles.donorAvatar}
                              style={
                                isTop3
                                  ? {
                                      background:
                                        absoluteIdx === 0
                                          ? "linear-gradient(135deg,#ffd700,#f59e0b)"
                                          : absoluteIdx === 1
                                            ? "linear-gradient(135deg,#e2e8f0,#94a3b8)"
                                            : "linear-gradient(135deg,#cd7c2f,#92400e)",
                                      color:
                                        absoluteIdx === 0
                                          ? "#78350f"
                                          : absoluteIdx === 1
                                            ? "#1e293b"
                                            : "#fef3c7",
                                    }
                                  : undefined
                              }
                            >
                              {getInitials(donante.nombre)}
                            </div>
                            <div className={styles.donorInfo}>
                              <span className={styles.donorName}>
                                {donante.nombre}
                              </span>
                              {donante.esRecurrente && (
                                <span
                                  style={{
                                    fontSize: "1.15rem",
                                    color: "#16a34a",
                                    fontWeight: 600,
                                  }}
                                >
                                  ↻ Donante recurrente
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Tipo */}
                        <td>
                          <span className={styles.donorType}>
                            {tipoLabel[donante.tipo]}
                          </span>
                        </td>

                        {/* Ciudad */}
                        <td style={{ fontSize: "1.35rem", color: "var(--gray)" }}>
                          {donante.ciudad}
                        </td>

                        {/* Donaciones */}
                        <td style={{ textAlign: "center", fontWeight: 600 }}>
                          {donante.donaciones}
                        </td>

                        {/* Última donación */}
                        <td style={{ fontSize: "1.35rem", color: "var(--gray)" }}>
                          {donante.ultimaDonacion}
                        </td>

                        {/* Total */}
                        <td
                          className={`${styles.totalAmount} ${isTop3 ? styles.totalAmountTop : ""}`}
                          style={{ textAlign: "right" }}
                        >
                          <div>{donante.total / 100} prendas</div>
                          <div style={{ fontSize: "1.1rem", color: "var(--gray)", fontWeight: "normal" }}>
                            ({formatHNL(donante.total)} est.)
                          </div>
                        </td>

                        {/* Progress */}
                        <td style={{ minWidth: "120px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.8rem",
                            }}
                          >
                            <div className={styles.progressBar} style={{ flex: 1 }}>
                              <div
                                className={`${styles.progressFill} ${absoluteIdx === 0 ? styles.progressFillGold : ""}`}
                                style={{ width: `${porcentaje}%` }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: "1.2rem",
                                color: "var(--gray)",
                                minWidth: "3.5rem",
                              }}
                            >
                              {porcentaje}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}

              {/* Totales */}
              {!loading && donantes.length > 0 && (
                <tr
                  style={{
                    background: "var(--bg-light)",
                    borderTop: "2px solid var(--border-color)",
                  }}
                >
                  <td
                    colSpan={6}
                    style={{
                      fontWeight: 700,
                      color: "var(--dark)",
                      fontSize: "1.45rem",
                    }}
                  >
                    TOTAL ACUMULADO VALORADO
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 800,
                      fontSize: "1.6rem",
                      color: "#16a34a",
                    }}
                  >
                    {formatHNL(totalAcumulado)}
                  </td>
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {Math.ceil(donantesOrdenados.length / itemsPerPage) > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "2rem", padding: "1rem" }} className="no-print">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className={styles.btnActionSecondary}
              style={{ padding: "0.6rem 1.2rem", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              Anterior
            </button>
            <span style={{ fontSize: "1.3rem", fontWeight: "600" }}>Página {currentPage} de {Math.ceil(donantesOrdenados.length / itemsPerPage)}</span>
            <button 
              disabled={currentPage === Math.ceil(donantesOrdenados.length / itemsPerPage)} 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(donantesOrdenados.length / itemsPerPage)))}
              className={styles.btnActionSecondary}
              style={{ padding: "0.6rem 1.2rem", cursor: currentPage === Math.ceil(donantesOrdenados.length / itemsPerPage) ? "not-allowed" : "pointer", opacity: currentPage === Math.ceil(donantesOrdenados.length / itemsPerPage) ? 0.5 : 1 }}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Nota al pie */}
      <p
        style={{
          marginTop: "1.6rem",
          fontSize: "1.3rem",
          color: "var(--gray)",
          fontStyle: "italic",
          textAlign: "center",
        }}
      >
        Donaciones en especie valoradas a una estimación de mercado (L. 100 por prenda). Información de carácter social administrativo.
      </p>
      </div>
      {/* ── FIN VISTA WEB ── */}

      {/* ── VISTA DE IMPRESIÓN REUTILIZABLE INSTITUCIONAL ── */}
      <div className={styles.printView}>
        <PrintReportDocument
          title="Top Donantes por Año — Muro de Honor"
          userRole={userRole}
          metaItems={[
            { label: "Periodo Anual", value: anioFiltro === "todos" ? "Todos los Años" : `Año ${anioFiltro}` },
            { label: "Total Donantes", value: donantes.length },
          ]}
          summaryCards={[
            { label: "Total Donantes", value: donantes.length },
            { label: "Valor Recaudado (Est.)", value: formatHNL(totalAcumulado) },
            { label: "Mayor Donante", value: donantes[0]?.nombre.split(" ")[0] ?? "—" },
            { label: "Donantes Recurrentes", value: donantes.filter((d) => d.esRecurrente).length },
          ]}
          footerNote="Muro de Honor y Reconocimiento Institucional — Fundación Dibujando Sonrisas"
        >
          {/* 1. Podio de Donantes en Impresión (Top 3) */}
          {!loading && donantes.length > 0 && (
            <div
              style={{
                pageBreakInside: "avoid",
                breakInside: "avoid",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "1rem 1.2rem",
                marginBottom: "1.5rem",
                background: "#1e293b",
                color: "#ffffff",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              }}
            >
              <h3
                style={{
                  fontSize: "10.5pt",
                  fontWeight: "bold",
                  color: "#ffd700",
                  margin: "0 0 1rem 0",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #475569",
                  paddingBottom: "0.4rem",
                  textAlign: "center",
                }}
              >
                Podio de Benefactores Destacados
              </h3>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  gap: "1.5rem",
                  padding: "0.5rem 0",
                }}
              >
                {/* Posición 2 — Plata */}
                {topTres[1] && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      width: "160px",
                    }}
                  >
                    <div
                      style={{
                        background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
                        borderRadius: "50%",
                        width: "4.5rem",
                        height: "4.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.6rem",
                        fontWeight: 800,
                        color: "#0f172a",
                        border: "3px solid #cbd5e1",
                        marginBottom: "0.4rem",
                        WebkitPrintColorAdjust: "exact",
                        printColorAdjust: "exact",
                      }}
                    >
                      2
                    </div>
                    <p style={{ fontSize: "9pt", fontWeight: "bold", color: "#ffffff", margin: "2px 0" }}>
                      {topTres[1].nombre}
                    </p>
                    <p style={{ fontSize: "10.5pt", fontWeight: 800, color: "#38bdf8", margin: "2px 0" }}>
                      {formatHNL(topTres[1].total)}
                    </p>
                    <span style={{ fontSize: "7.5pt", color: "#94a3b8" }}>
                      {tipoLabel[topTres[1].tipo]}
                    </span>
                  </div>
                )}

                {/* Posición 1 — Oro (Centro, más destacado) */}
                {topTres[0] && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      width: "180px",
                    }}
                  >
                    <div
                      style={{
                        background: "linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)",
                        borderRadius: "50%",
                        width: "5.5rem",
                        height: "5.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2.2rem",
                        fontWeight: 800,
                        color: "#78350f",
                        border: "3px solid #fef08a",
                        marginBottom: "0.4rem",
                        WebkitPrintColorAdjust: "exact",
                        printColorAdjust: "exact",
                      }}
                    >
                      1
                    </div>
                    <p style={{ fontSize: "10pt", fontWeight: "bold", color: "#ffffff", margin: "2px 0" }}>
                      {topTres[0].nombre}
                    </p>
                    <p style={{ fontSize: "12pt", fontWeight: 800, color: "#ffd700", margin: "2px 0" }}>
                      {formatHNL(topTres[0].total)}
                    </p>
                    <span
                      style={{
                        fontSize: "7.5pt",
                        color: "#ffd700",
                        background: "rgba(255, 215, 0, 0.2)",
                        border: "1px solid #ffd700",
                        borderRadius: "999px",
                        padding: "1px 8px",
                        marginTop: "2px",
                        fontWeight: "bold",
                        WebkitPrintColorAdjust: "exact",
                        printColorAdjust: "exact",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#854d0e" stroke="none" aria-hidden="true">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Mayor Donante
                    </span>
                  </div>
                )}

                {/* Posición 3 — Bronce */}
                {topTres[2] && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      width: "160px",
                    }}
                  >
                    <div
                      style={{
                        background: "linear-gradient(135deg, #cd7c2f 0%, #92400e 100%)",
                        borderRadius: "50%",
                        width: "4.5rem",
                        height: "4.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.6rem",
                        fontWeight: 800,
                        color: "#fef3c7",
                        border: "3px solid #fde68a",
                        marginBottom: "0.4rem",
                        WebkitPrintColorAdjust: "exact",
                        printColorAdjust: "exact",
                      }}
                    >
                      3
                    </div>
                    <p style={{ fontSize: "9pt", fontWeight: "bold", color: "#ffffff", margin: "2px 0" }}>
                      {topTres[2].nombre}
                    </p>
                    <p style={{ fontSize: "10.5pt", fontWeight: 800, color: "#f97316", margin: "2px 0" }}>
                      {formatHNL(topTres[2].total)}
                    </p>
                    <span style={{ fontSize: "7.5pt", color: "#94a3b8" }}>
                      {tipoLabel[topTres[2].tipo]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Tabla de Ranking Completo */}
          <h3
            style={{
              fontSize: "10pt",
              fontWeight: "bold",
              color: "#000000",
              margin: "1rem 0 0.4rem 0",
              textTransform: "uppercase",
            }}
          >
            Ranking Completo de Donantes
          </h3>
          <table className={styles.printTable}>
            <thead>
              <tr>
                <th style={{ width: "4%" }}>#</th>
                <th style={{ width: "26%" }}>Nombre del Donante</th>
                <th style={{ width: "14%" }}>Tipo</th>
                <th style={{ width: "16%" }}>Ciudad</th>
                <th style={{ width: "10%", textAlign: "center" }}>Aportes</th>
                <th style={{ width: "15%" }}>Última Donación</th>
                <th style={{ width: "15%", textAlign: "right" }}>Total Valoración</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "1.5rem" }}>Cargando donantes...</td>
                </tr>
              ) : donantes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "1.5rem" }}>No hay donantes registrados.</td>
                </tr>
              ) : (
                donantes.map((d, idx) => (
                  <tr key={d.id}>
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{idx + 1}</td>
                    <td style={{ fontWeight: "bold" }}>
                      {d.nombre}
                      {d.esRecurrente && (
                        <span style={{ fontSize: "7pt", color: "#16a34a", marginLeft: "4px" }}>
                          (Recurrente)
                        </span>
                      )}
                    </td>
                    <td>{d.tipo}</td>
                    <td>{d.ciudad}</td>
                    <td style={{ textAlign: "center" }}>{d.donaciones}</td>
                    <td>{d.ultimaDonacion}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{formatHNL(d.total)}</td>
                  </tr>
                ))
              )}
              {!loading && donantes.length > 0 && (
                <tr style={{ fontWeight: "bold", background: "#f1f5f9" }}>
                  <td colSpan={6}>TOTAL ACUMULADO VALORADO</td>
                  <td style={{ textAlign: "right" }}>{formatHNL(totalAcumulado)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </PrintReportDocument>
      </div>
    </div>
  );
}
