"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "@/styles/pages/reportes.module.css";
import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";

export interface MedicamentoVenceData {
  id: string;
  nombre: string;
  lote: string;
  fechaVencimiento: string;
  stock: number;
  ubicacion: string;
  categoria: string;
}

export default function MedicamentosVencer() {
  const { role } = usePermissions();
  const userRole = role ? ROLE_LABELS[role] : "ADMINISTRADOR";
  const [diasFiltro, setDiasFiltro] = useState<number>(90); // 30, 60, 90, 180
  const [filtroAlerta, setFiltroAlerta] = useState<string>("todos"); // todos, critico, advertencia, seguro
  const [rawMedicamentos, setRawMedicamentos] = useState<MedicamentoVenceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchMedicamentosVencer() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("lotes_medicamentos")
          .select(`
            id,
            numero_lote,
            fecha_vencimiento,
            cantidad_actual,
            medicamentos (
              nombre,
              categorias_inventario (
                nombre
              )
            )
          `);
        if (error) throw error;

        const formatted: MedicamentoVenceData[] = (data || []).map((l: {
          id: string;
          numero_lote: string | null;
          fecha_vencimiento: string;
          cantidad_actual: number | null;
          medicamentos: {
            nombre: string;
            categorias_inventario: { nombre: string } | null;
          } | null;
        }) => {
          const med = l.medicamentos;
          const cat = med?.categorias_inventario?.nombre || "Sin Categoría";
          return {
            id: l.id.slice(0, 8).toUpperCase(), // Shortened ID for UI clean layout
            nombre: med?.nombre || "Medicamento Desconocido",
            lote: l.numero_lote || "N/A",
            fechaVencimiento: l.fecha_vencimiento,
            stock: l.cantidad_actual || 0,
            ubicacion: "Farmacia Central", // Default location
            categoria: cat,
          };
        });

        setRawMedicamentos(formatted);
      } catch (err) {
        console.error("Error fetching lotes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMedicamentosVencer();
  }, []);

  const hoy = new Date();

  const procesarDatos = () => {
    return rawMedicamentos
      .map((item) => {
        const fechaVence = new Date(item.fechaVencimiento);
        const diffTime = fechaVence.getTime() - hoy.getTime();
        const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let estado: "critico" | "advertencia" | "seguro" = "seguro";
        let estadoLabel = "Seguro";
        let statusClass = styles.statusSuccess;

        if (diasRestantes <= 30) {
          estado = "critico";
          estadoLabel = diasRestantes <= 0 ? "Vencido" : `Crítico (<30d)`;
          statusClass = styles.statusCritical;
        } else if (diasRestantes <= 90) {
          estado = "advertencia";
          estadoLabel = "Advertencia (30-90d)";
          statusClass = styles.statusWarning;
        } else {
          estadoLabel = "Seguro (>90d)";
        }

        return {
          ...item,
          diasRestantes,
          estado,
          estadoLabel,
          statusClass,
        };
      })
      .filter((item) => {
        // Filtrar por días de vencimiento
        if (item.diasRestantes > diasFiltro) return false;

        // Filtrar por nivel de alerta
        if (filtroAlerta !== "todos" && item.estado !== filtroAlerta)
          return false;

        return true;
      })
      .sort(
        (a, b) =>
          a.lote.localeCompare(b.lote) ||
          a.fechaVencimiento.localeCompare(b.fechaVencimiento)
      );
  };

  const medicamentosFiltrados = procesarDatos();

  const handlePrint = () => {
    window.print();
  };

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
          REPORTE DE MEDICAMENTOS PRÓXIMOS A VENCER
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
            <h3>Reporte de Medicamentos Próximos a Vencer</h3>
            <p>
              Supervisa las fechas de caducidad del inventario para su
              distribución prioritaria o descarte seguro.
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
          <label htmlFor="dias-vence">Vence en menos de</label>
          <select
            id="dias-vence"
            value={diasFiltro}
            onChange={(e) => setDiasFiltro(Number(e.target.value))}
          >
            <option value={30}>30 días (Crítico)</option>
            <option value={60}>60 días</option>
            <option value={90}>90 días</option>
            <option value={180}>180 días (Semestre)</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="alerta-filtro">Alerta/Estado</label>
          <select
            id="alerta-filtro"
            value={filtroAlerta}
            onChange={(e) => setFiltroAlerta(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="critico">🔴 Crítico / Vencido</option>
            <option value="advertencia">🟡 Advertencia</option>
            <option value="seguro">🟢 Seguro</option>
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
          Fecha de Control: <strong>{hoy.toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" })}</strong>
        </p>
      </div>

      {/* Tabla printable */}
      <div className={styles.printableContainer}>
        <div className={styles.printableHeader}>
          <div className={styles.printableHeaderBrand}>
            <div
              style={{
                width: "4.4rem",
                height: "4.4rem",
                background: "linear-gradient(135deg, #ef4444, #f59e0b)",
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
                strokeWidth={2}
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
              <span>Alerta de Farmacia — Medicamentos Próximos a Vencer</span>
            </div>
          </div>
          <div className={styles.printableMeta}>
            <p>
              <strong>Total Registros:</strong> {medicamentosFiltrados.length}
            </p>
            <p>
              <strong>Urgentes para Donación/Uso:</strong>{" "}
              {
                medicamentosFiltrados.filter((m) => m.estado === "critico")
                  .length
              }
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className={styles.printableTable}>
            <thead>
              <tr>
                <th>Código / ID</th>
                <th>Medicamento / Suministro</th>
                <th>Categoría</th>
                <th>Lote</th>
                <th>Fecha Vencimiento</th>
                <th>Días Restantes</th>
                <th>Stock Disponible</th>
                <th>Ubicación</th>
                <th>Estado de Alerta</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                    Cargando información de lotes...
                  </td>
                </tr>
              ) : medicamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.noData}>
                    No hay medicamentos que venzan en el rango seleccionado.
                  </td>
                </tr>
              ) : (
                medicamentosFiltrados.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600, color: "var(--gray)" }}>
                      {m.id}
                    </td>
                    <td style={{ fontWeight: 700 }}>{m.nombre}</td>
                    <td>{m.categoria}</td>
                    <td style={{ fontFamily: "monospace" }}>{m.lote}</td>
                    <td style={{ fontWeight: 600 }}>
                      {new Date(m.fechaVencimiento).toLocaleDateString("es-HN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td
                      style={{
                        color: m.diasRestantes <= 30 ? "#dc2626" : "inherit",
                        fontWeight: 700,
                      }}
                    >
                      {m.diasRestantes <= 0
                        ? "Vencido"
                        : `${m.diasRestantes} días`}
                    </td>
                    <td style={{ fontWeight: 600 }}>{m.stock} uds</td>
                    <td>{m.ubicacion}</td>
                    <td>
                      <span
                        className={`${styles.badgeStatus} ${m.statusClass}`}
                      >
                        {m.estadoLabel}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.printableFooter}>
          <p>
            Generado automáticamente por el Módulo de Inventario y Farmacia.
          </p>
          <p>Fundación Dibujando Sonrisas — Honduras</p>
        </div>
      </div>
    </div>
  );
}
