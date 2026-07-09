"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/pages/reportes.module.css";
import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";

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
  Empresa: "🏢 Empresa",
  "Persona Natural": "👤 Persona Natural",
  ONG: "🤝 ONG",
  Institución: "🏛️ Institución",
};

const medalEmoji = ["🥇", "🥈", "🥉"];
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
  const [rawDonantes, setRawDonantes] = useState<Donante[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchDonantes() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("donaciones_ropa")
          .select("id, fecha_donacion, nombre_donante, cantidad_prendas, observaciones");
        if (error) throw error;

        // Group by donor name
        const donorGroups: Record<string, {
          nombre: string;
          dates: Date[];
          prendas: number;
          recordsCount: number;
        }> = {};

        (data || []).forEach((row) => {
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

        const formattedList: Donante[] = Object.keys(donorGroups).map((name) => {
          const group = donorGroups[name];
          // Get latest date
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
            ciudad: "Tegucigalpa, Honduras", // Default location
            donaciones: group.recordsCount,
            total: group.prendas * 100, // Value HNL (L. 100 per garment)
            ultimaDonacion: formattedLatestDate,
            esRecurrente: group.recordsCount > 1,
            fechaObj: latestDate,
          };
        });

        setRawDonantes(formattedList);
      } catch (err) {
        console.error("Error loading donantes report:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDonantes();
  }, []);

  // Extract years dynamically
  const aniosDisponibles = Array.from(
    new Set(
      rawDonantes
        .map((d) => {
          try {
            return d.fechaObj.getFullYear().toString();
          } catch {
            return null;
          }
        })
        .filter(Boolean)
    )
  ).sort() as string[];

  const donantes = rawDonantes
    .filter((d) => {
      if (anioFiltro === "todos") return true;
      return d.fechaObj.getFullYear().toString() === anioFiltro;
    })
    .sort((a, b) => b.total - a.total);

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
          <h1 className={styles.headerPrintTitle} style={{ margin: 0 }}>
            Fundación Dibujando Sonrisas
          </h1>
        </div>
        <h2 className={styles.headerPrintSubtitle}>
          TOP DE DONANTES Y BENEFACTORES
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
            <h3>Top de Donantes</h3>
            <p>
              Muro de Honor — Benefactores que hacen posible nuestra misión de ayuda.
            </p>
          </div>
        </div>
        <div className={styles.reportHeaderActions}>
          <div className={styles.filterGroup} style={{ minWidth: "auto" }}>
            <select
              id="periodo-donantes"
              value={anioFiltro}
              onChange={(e) => setAnioFiltro(e.target.value)}
              style={{ fontSize: "1.4rem", padding: "0.8rem 1.2rem" }}
            >
              <option value="todos">Todos los años</option>
              {aniosDisponibles.map((p) => (
                <option key={p} value={p}>
                  Año {p}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={styles.btnActionSecondary}
            onClick={() => window.print()}
            style={{ fontSize: "1.4rem", padding: "0.8rem 1.2rem" }}
          >
            Imprimir
          </button>
        </div>
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
                donantesOrdenados.map((donante, idx) => {
                  const porcentaje = Math.round((donante.total / maxMonto) * 100);
                  const isTop3 = idx < 3;

                  return (
                    <tr key={donante.id}>
                      {/* Rank */}
                      <td>
                        <div className={styles.rankCell}>
                          <span
                            className={`${styles.rankNumber} ${
                              isTop3 ? rankClasses[idx] : styles.rankDefault
                            }`}
                          >
                            {isTop3 ? medalEmoji[idx] : idx + 1}
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
                                      idx === 0
                                        ? "linear-gradient(135deg,#ffd700,#f59e0b)"
                                        : idx === 1
                                          ? "linear-gradient(135deg,#e2e8f0,#94a3b8)"
                                          : "linear-gradient(135deg,#cd7c2f,#92400e)",
                                    color:
                                      idx === 0
                                        ? "#78350f"
                                        : idx === 1
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
                              className={`${styles.progressFill} ${idx === 0 ? styles.progressFillGold : ""}`}
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
  );
}
