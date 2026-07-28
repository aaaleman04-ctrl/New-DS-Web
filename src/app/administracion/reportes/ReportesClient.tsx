"use client";

import { useState } from "react";
import styles from "@/styles/pages/reportes.module.css";

// ── Importar Reportes Individuales ─────────────────────────────────────────
import PacientesBrigada from "./components/PacientesBrigada";
import MedicamentosVencer from "./components/MedicamentosVencer";
import StockMinimo from "./components/StockMinimo";
import AtencionesVoluntario from "./components/AtencionesVoluntario";
import ResumenInsumos from "./components/ResumenInsumos";
import ResumenFinanciero from "./components/ResumenFinanciero";
import ResumenBrigadas from "./components/ResumenBrigadas";
import TopDonantes from "./components/TopDonantes";

// ── Tipos y Definiciones ───────────────────────────────────────────────────

type VistaGlobal = "estadisticas" | "reportes";
type CategoriaId = "detallados" | "sintetizados" | "excepciones";

interface ReporteDef {
  id: string;
  label: string;
  descripcion: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

interface CategoriaDef {
  id: CategoriaId;
  label: string;
  categoryLabel: string;
  categoryClass: string;
  icon: React.ReactNode;
  reportes: ReporteDef[];
}

// ── Iconos SVG ─────────────────────────────────────────────────────────────
const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none" as const,
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor",
};

// ── Estructura de Reportes ─────────────────────────────────────────────────
const categorias: CategoriaDef[] = [
  {
    id: "detallados",
    label: "Reportes Detallados",
    categoryLabel: "Detallado",
    categoryClass: styles.labelDetallado,
    icon: (
      <svg {...iconProps}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
    ),
    reportes: [
      {
        id: "pacientes-brigada",
        label: " Pacientes por Brigada",
        descripcion:
          "Listado de pacientes atendidos, diagnósticos y medicamentos formulados.",
        icon: (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        ),
        component: <PacientesBrigada />,
      },
      {
        id: "medicamentos-vencer",
        label: " Medicamentos a Vencer",
        descripcion:
          "Alertas de caducidad y fechas límites de fármacos en farmacia.",
        icon: (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        ),
        component: <MedicamentosVencer />,
      },
      {
        id: "stock-minimo",
        label: " Alerta de Stock Mínimo",
        descripcion:
          "Productos e insumos por debajo del umbral de reabastecimiento.",
        icon: (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        ),
        component: <StockMinimo />,
      },
      {
        id: "atenciones-voluntario",
        label: " Atenciones por Voluntario",
        descripcion:
          "Horas aportadas y pacientes atendidos por cada especialista.",
        icon: (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
            />
          </svg>
        ),
        component: <AtencionesVoluntario />,
      },
    ],
  },
  {
    id: "sintetizados",
    label: "Reportes Sintetizados",
    categoryLabel: "Sintetizado",
    categoryClass: styles.labelSintetizado,
    icon: (
      <svg {...iconProps}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      </svg>
    ),
    reportes: [
      {
        id: "resumen-insumos",
        label: " Resumen de Entrega de Insumos",
        descripcion:
          "Consolidación de materiales y medicamentos donados por categoría.",
        icon: (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 12a1.5 1.5 0 0 1-1.5 1.5H5.875a1.5 1.5 0 0 1-1.5-1.5L3.75 7.5M10 10.5h4M12 3v3M12 21V10.5"
            />
          </svg>
        ),
        component: <ResumenInsumos />,
      },
      {
        id: "resumen-financiero",
        label: " Resumen Financiero por Periodo",
        descripcion:
          "Balance de ingresos, egresos y saldo neto con visualización gráfica.",
        icon: (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        ),
        component: <ResumenFinanciero />,
      },
      {
        id: "resumen-brigadas",
        label: " Resumen de Brigadas Realizadas",
        descripcion:
          "Pacientes atendidos, recetas y médicos en las brigadas médicas.",
        icon: (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
            />
          </svg>
        ),
        component: <ResumenBrigadas />,
      },
    ],
  },
  {
    id: "excepciones",
    label: "Reportes de Excepción",
    categoryLabel: "Excepción",
    categoryClass: styles.labelExcepcion,
    icon: (
      <svg {...iconProps}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />
      </svg>
    ),
    reportes: [
      {
        id: "top-donantes",
        label: " Top Donantes por Año",
        descripcion:
          "Insignia y muro de honor a los benefactores de la fundación por periodo anual.",
        icon: (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
            />
          </svg>
        ),
        component: <TopDonantes />,
      },
    ],
  },
];

export default function ReportesClient() {
  const [vistaGlobal, setVistaGlobal] = useState<VistaGlobal>("reportes");
  const [categoriaActiva, setCategoriaActiva] =
    useState<CategoriaId>("detallados");
  const [reporteSeleccionado, setReporteSeleccionado] = useState<
    Record<CategoriaId, string>
  >({
    detallados: "pacientes-brigada",
    sintetizados: "resumen-insumos",
    excepciones: "top-donantes",
  });
  const [dropdownAbierto, setDropdownAbierto] = useState<boolean>(false);

  const categoriaActual = categorias.find((c) => c.id === categoriaActiva)!;
  const reporteActivoId = reporteSeleccionado[categoriaActiva];
  const reporteActual = categoriaActual.reportes.find(
    (r) => r.id === reporteActivoId
  )!;

  const toggleDropdown = () => setDropdownAbierto(!dropdownAbierto);

  const cambiarReporte = (id: string) => {
    setReporteSeleccionado((prev) => ({
      ...prev,
      [categoriaActiva]: id,
    }));
    setDropdownAbierto(false);
  };

  const cambiarCategoria = (catId: CategoriaId) => {
    setCategoriaActiva(catId);
    setDropdownAbierto(false);
  };

  return (
    <div>
      {/* ── Page Header con Switch Estadísticas / Reportes ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <h2>Estadísticas y Reportes de la Fundación</h2>
          <p>
            {vistaGlobal === "estadisticas"
              ? "Resumen visual de impacto, atenciones médicas e información financiera consolidada."
              : "Generador de reportes formales listos para imprimir o exportar."}
          </p>
        </div>

        {/* Switch Principal */}
        <div className={styles.viewSelector}>
          <button
            type="button"
            className={`${styles.viewSelectorBtn} ${
              vistaGlobal === "estadisticas" ? styles.viewSelectorBtnActive : ""
            }`}
            onClick={() => setVistaGlobal("estadisticas")}
          >
            <svg {...iconProps} fill="none" stroke="currentColor">
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
            Estadísticas
          </button>
          <button
            type="button"
            className={`${styles.viewSelectorBtn} ${
              vistaGlobal === "reportes" ? styles.viewSelectorBtnActive : ""
            }`}
            onClick={() => setVistaGlobal("reportes")}
          >
            <svg {...iconProps} fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
            Reportes
          </button>
        </div>
      </div>

      {/* ── VISTA DE ESTADÍSTICAS GLOBAL ── */}
      {vistaGlobal === "estadisticas" && (
        <div className={styles.statsDashboard}>
          {/* Fila de KPIs de Impacto */}
          <div className={styles.kpiGrid}>
            <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
              <p className={styles.kpiLabel}>Pacientes Atendidos</p>
              <p className={styles.kpiValue}>1,701</p>
              <p className={`${styles.kpiChange} ${styles.kpiChangePositive}`}>
                +18% este año
              </p>
            </div>
            <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
              <p className={styles.kpiLabel}>Brigadas Médicas</p>
              <p className={styles.kpiValue}>32</p>
              <p className={styles.kpiChange}>12 departamentos cubiertos</p>
            </div>
            <div className={`${styles.kpiCard} ${styles.kpiCardTeal}`}>
              <p className={styles.kpiLabel}>Voluntarios Totales</p>
              <p className={styles.kpiValue}>142</p>
              <p className={styles.kpiChange}>Activos en brigadas</p>
            </div>
            <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
              <p className={styles.kpiLabel}>Fondos Recaudados</p>
              <p className={styles.kpiValue}>L. 1.07M</p>
              <p className={`${styles.kpiChange} ${styles.kpiChangePositive}`}>
                Periodo 2025/2026
              </p>
            </div>
          </div>

          {/* Fila de Gráficos Consolidados */}
          <div className={styles.chartCardGrid}>
            {/* Gráfico 1: Atenciones Anuales */}
            <div className={styles.chartCard}>
              <div className={styles.chartCardHeader}>
                <h3>Crecimiento de Atenciones (Pacientes)</h3>
                <span>Histórico Anual</span>
              </div>
              <div className={styles.chartContainer}>
                <div className={styles.barChartGrid}>
                  <div className={styles.barCol}>
                    <div className={styles.barColTooltip}>280 Pacientes</div>
                    <div
                      className={styles.chartBarElement}
                      style={{ height: "30%", width: "2.4rem" }}
                    />
                    <span className={styles.barLabel}>2023</span>
                  </div>
                  <div className={styles.barCol}>
                    <div className={styles.barColTooltip}>680 Pacientes</div>
                    <div
                      className={styles.chartBarElement}
                      style={{ height: "60%", width: "2.4rem" }}
                    />
                    <span className={styles.barLabel}>2024</span>
                  </div>
                  <div className={styles.barCol}>
                    <div className={styles.barColTooltip}>1,200 Pacientes</div>
                    <div
                      className={styles.chartBarElement}
                      style={{ height: "90%", width: "2.4rem" }}
                    />
                    <span className={styles.barLabel}>2025</span>
                  </div>
                  <div className={styles.barCol}>
                    <div className={styles.barColTooltip}>
                      711 Pacientes (Sem I)
                    </div>
                    <div
                      className={styles.chartBarElement}
                      style={{ height: "55%", width: "2.4rem" }}
                    />
                    <span className={styles.barLabel}>2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico 2: Distribución de Presupuesto */}
            <div className={styles.chartCard}>
              <div className={styles.chartCardHeader}>
                <h3>Distribución de Costos</h3>
                <span>Presupuesto Invertido (HNL)</span>
              </div>
              <div className={styles.chartContainer}>
                <div className={styles.barChartGrid}>
                  <div className={styles.barCol}>
                    <div className={styles.barColTooltip}>L. 134,500</div>
                    <div
                      className={styles.chartBarElement}
                      style={{
                        height: "80%",
                        backgroundColor: "#e74c3c",
                        width: "2.4rem",
                      }}
                    />
                    <span className={styles.barLabel}>Médicos</span>
                  </div>
                  <div className={styles.barCol}>
                    <div className={styles.barColTooltip}>L. 84,000</div>
                    <div
                      className={styles.chartBarElement}
                      style={{
                        height: "50%",
                        backgroundColor: "#1abc9c",
                        width: "2.4rem",
                      }}
                    />
                    <span className={styles.barLabel}>Dental</span>
                  </div>
                  <div className={styles.barCol}>
                    <div className={styles.barColTooltip}>L. 58,200</div>
                    <div
                      className={styles.chartBarElement}
                      style={{
                        height: "35%",
                        backgroundColor: "#f1c40f",
                        width: "2.4rem",
                      }}
                    />
                    <span className={styles.barLabel}>Logística</span>
                  </div>
                  <div className={styles.barCol}>
                    <div className={styles.barColTooltip}>L. 47,890</div>
                    <div
                      className={styles.chartBarElement}
                      style={{
                        height: "28%",
                        backgroundColor: "#9b59b6",
                        width: "2.4rem",
                      }}
                    />
                    <span className={styles.barLabel}>Ayuda Hum.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VISTA DE REPORTES CON DROPDOWN SIN SIDEBAR ── */}
      {vistaGlobal === "reportes" && (
        <div className={styles.reportsLayout}>
          {/* Categorías Principales */}
          <div className={styles.categoryTabs}>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.categoryTabBtn} ${
                  categoriaActiva === cat.id ? styles.categoryTabBtnActive : ""
                }`}
                onClick={() => cambiarCategoria(cat.id)}
              >
                {cat.icon}
                {cat.label}
                <span
                  className={`${styles.tabCategoryLabel} ${cat.categoryClass}`}
                >
                  {cat.categoryLabel}
                </span>
              </button>
            ))}
          </div>

          {/* Menú Desplegable (Dropdown) Integrado */}
          <div className={styles.reportSelectorWrapper}>
            <button
              type="button"
              className={styles.dropdownTrigger}
              onClick={toggleDropdown}
            >
              <span className={styles.dropdownTriggerValue}>
                {reporteActual.icon}
                {reporteActual.label}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`${styles.dropdownTriggerArrow} ${
                  dropdownAbierto ? styles.dropdownTriggerArrowActive : ""
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {dropdownAbierto && (
              <div className={styles.dropdownMenu}>
                {categoriaActual.reportes.map((rep) => (
                  <button
                    key={rep.id}
                    type="button"
                    className={`${styles.dropdownItem} ${
                      reporteActivoId === rep.id
                        ? styles.dropdownItemActive
                        : ""
                    }`}
                    onClick={() => cambiarReporte(rep.id)}
                  >
                    {rep.icon}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 600 }}>{rep.label}</span>
                      <span
                        style={{ fontSize: "1.15rem", color: "var(--gray)" }}
                      >
                        {rep.descripcion}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Panel de Visualización del Reporte Seleccionado */}
          <div>{reporteActual.component}</div>
        </div>
      )}
    </div>
  );
}
