"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/pages/reportes.module.css";
import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";

export interface StockMinimoData {
  id: string;
  nombre: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  unidad: string;
  ubicacion: string;
}

export default function StockMinimo() {
  const { role } = usePermissions();
  const userRole = role ? ROLE_LABELS[role] : "ADMINISTRADOR";
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");
  const [rawStock, setRawStock] = useState<StockMinimoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchStockMinimo() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("medicamentos")
          .select(`
            id,
            codigo,
            nombre,
            unidad_medida,
            stock_minimo,
            stock_actual,
            categorias_inventario (
              nombre
            )
          `);
        if (error) throw error;

        const formatted: StockMinimoData[] = (data || []).map((m: {
          id: string;
          codigo: string | null;
          nombre: string;
          unidad_medida: string | null;
          stock_minimo: number | null;
          stock_actual: number | null;
          categorias_inventario: { nombre: string } | null;
        }) => {
          return {
            id: m.codigo || m.id.slice(0, 8).toUpperCase(),
            nombre: m.nombre,
            categoria: m.categorias_inventario?.nombre || "Sin Categoría",
            stockActual: m.stock_actual || 0,
            stockMinimo: m.stock_minimo || 0,
            unidad: m.unidad_medida || "uds",
            ubicacion: "Farmacia Central",
          };
        });

        setRawStock(formatted);
      } catch (err) {
        console.error("Error fetching stock data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStockMinimo();
  }, []);

  const categoriasDisponibles = Array.from(
    new Set(rawStock.map((item) => item.categoria))
  ).filter(Boolean);

  const procesarDatos = () => {
    return rawStock
      .map((item) => {
        const porcentaje = item.stockMinimo > 0
          ? Math.round((item.stockActual / item.stockMinimo) * 100)
          : 100;
        let estado: "critico" | "advertencia" | "optimo" = "optimo";
        let estadoLabel = "Óptimo";
        let statusClass = styles.statusSuccess;

        if (item.stockActual < item.stockMinimo) {
          estado = "critico";
          estadoLabel = "Crítico (Bajo Mínimo)";
          statusClass = styles.statusCritical;
        } else if (item.stockActual <= item.stockMinimo * 1.3) {
          estado = "advertencia";
          estadoLabel = "Advertencia (Stock Límite)";
          statusClass = styles.statusWarning;
        }

        return {
          ...item,
          porcentaje,
          estado,
          estadoLabel,
          statusClass,
        };
      })
      .filter((item) => {
        if (categoriaFiltro !== "todas" && item.categoria !== categoriaFiltro)
          return false;
        if (estadoFiltro !== "todos" && item.estado !== estadoFiltro)
          return false;
        return true;
      })
      .sort((a, b) => a.id.localeCompare(b.id, "es"));
  };

  const inventarioFiltrado = procesarDatos();

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
          REPORTE DE STOCK MÍNIMO DE INSUMOS
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
            <h3>Alerta de Stock Mínimo de Insumos</h3>
            <p>
              Muestra los materiales e insumos odontológicos, de farmacia e
              higiene que requieren reabastecimiento urgente.
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
          <label htmlFor="cat-filtro">Categoría</label>
          <select
            id="cat-filtro"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="todas">Todas las categorías</option>
            {categoriasDisponibles.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="estado-filtro">Estado del Stock</label>
          <select
            id="estado-filtro"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="todos">Todos los niveles</option>
            <option value="critico">🔴 Crítico (Bajo Mínimo)</option>
            <option value="advertencia">
              🟡 Advertencia (Cerca del Límite)
            </option>
            <option value="optimo">🟢 Óptimo (Correcto)</option>
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
          Umbral de alerta: <strong>&lt; 100% de Stock Mínimo</strong>
        </p>
      </div>

      {/* Tabla */}
      <div className={styles.printableContainer}>
        <div className={styles.printableHeader}>
          <div className={styles.printableHeaderBrand}>
            <div
              style={{
                width: "4.4rem",
                height: "4.4rem",
                background: "linear-gradient(135deg, #e53e3e, #dd6b20)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                style={{ width: "2.4rem", height: "2.4rem" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <div>
              <h4>Fundación Dibujando Sonrisas</h4>
              <span>Alerta de Stock Crítico — Control de Reabastecimiento</span>
            </div>
          </div>
          <div className={styles.printableMeta}>
            <p>
              <strong>Artículos Críticos:</strong>{" "}
              {
                inventarioFiltrado.filter((item) => item.estado === "critico")
                  .length
              }
            </p>
            <p>
              <strong>Artículos en Advertencia:</strong>{" "}
              {
                inventarioFiltrado.filter(
                  (item) => item.estado === "advertencia"
                ).length
              }
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className={styles.printableTable}>
            <thead>
              <tr>
                <th>Código / SKU</th>
                <th>Nombre del Insumo</th>
                <th>Categoría</th>
                <th style={{ textAlign: "right" }}>Stock Mínimo</th>
                <th style={{ textAlign: "right" }}>Stock Actual</th>
                <th>Unidad</th>
                <th>Ubicación</th>
                <th style={{ width: "160px" }}>Nivel de Cobertura</th>
                <th>Estado de Alerta</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                    Cargando información del inventario...
                  </td>
                </tr>
              ) : inventarioFiltrado.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.noData}>
                    No hay insumos que requieran reabastecimiento con los
                    filtros seleccionados.
                  </td>
                </tr>
              ) : (
                inventarioFiltrado.map((item) => {
                  const nivelAncho = Math.min(item.porcentaje, 100);
                  let colorBarra = "var(--primaryColor)";
                  if (item.estado === "critico") colorBarra = "#ef4444";
                  else if (item.estado === "advertencia")
                    colorBarra = "#f59e0b";
                  else colorBarra = "#10b981";

                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: "var(--gray)" }}>
                        {item.id}
                      </td>
                      <td style={{ fontWeight: 700 }}>{item.nombre}</td>
                      <td>{item.categoria}</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {item.stockMinimo}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 700,
                          color:
                            item.stockActual < item.stockMinimo
                              ? "#dc2626"
                              : "inherit",
                        }}
                      >
                        {item.stockActual}
                      </td>
                      <td>{item.unidad}</td>
                      <td>{item.ubicacion}</td>
                      {/* Barra de progreso visual */}
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.8rem",
                          }}
                        >
                          <div
                            style={{
                              height: "0.6rem",
                              backgroundColor: "var(--border-color)",
                              borderRadius: "999px",
                              overflow: "hidden",
                              flex: 1,
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                borderRadius: "999px",
                                backgroundColor: colorBarra,
                                width: `${nivelAncho}%`,
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: "1.15rem",
                              fontWeight: 700,
                              color: "var(--gray)",
                              minWidth: "3rem",
                              textAlign: "right",
                            }}
                          >
                            {item.porcentaje}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.badgeStatus} ${item.statusClass}`}
                        >
                          {item.estadoLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.printableFooter}>
          <p>
            Reporte de niveles críticos — Planifique compras antes de las
            brigadas programadas.
          </p>
          <p>Honduras — Gestión de Inventario</p>
        </div>
      </div>
    </div>
  );
}
