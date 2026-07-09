"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/reportes.module.css";
import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";

interface Brigada {
  id: string;
  nombre: string;
}

interface PacienteData {
  id: string;
  nombre: string;
  edad: number;
  comunidad: string;
  motivo: string;
  medico: string;
  medicamentos: string[];
}

export default function PacientesBrigada() {
  const { role } = usePermissions();
  const userRole = role ? ROLE_LABELS[role] : "ADMINISTRADOR";
  const [brigadas, setBrigadas] = useState<Brigada[]>([]);
  const [brigadaSeleccionada, setBrigadaSeleccionada] = useState<string>("");
  const [pacientes, setPacientes] = useState<PacienteData[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [brigadaSeleccionada, busqueda]);

  useEffect(() => {
    async function fetchBrigadas() {
      try {
        const { data, error } = await supabase
          .from("brigadas")
          .select("id, nombre")
          .order("fecha_brigada", { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setBrigadas(data);
          setBrigadaSeleccionada(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching brigadas:", err);
      }
    }
    fetchBrigadas();
  }, []);

  useEffect(() => {
    if (!brigadaSeleccionada) return;
    async function fetchPacientes() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("pacientes")
          .select(`
            id,
            nombres,
            apellidos,
            edad,
            comunidad,
            consultas (
              id,
              motivo_consulta,
              medico:perfiles (
                nombre_completo
              ),
              medicamentos_consulta (
                medicamentos (
                  nombre
                )
              )
            )
          `)
          .eq("brigada_id", brigadaSeleccionada);
        if (error) throw error;

        interface ConsultaData {
          motivo_consulta: string | null;
          medico: { nombre_completo: string | null } | null;
          medicamentos_consulta: {
            medicamentos: { nombre: string } | null;
          }[] | null;
        }

        const formatted = (data || []).map((p: {
          id: string;
          nombres: string;
          apellidos: string | null;
          edad: number | null;
          comunidad: string | null;
          consultas: ConsultaData[] | null;
        }) => {
          const consulta = p.consultas && p.consultas[0];
          const meds = consulta
            ? (consulta.medicamentos_consulta || [])
                .map((mc: { medicamentos: { nombre: string } | null }) => mc.medicamentos?.nombre)
                .filter(Boolean) as string[]
            : [];
          return {
            id: p.id,
            nombre: `${p.nombres} ${p.apellidos}`,
            edad: p.edad || 0,
            comunidad: p.comunidad || "N/A",
            motivo: consulta?.motivo_consulta || "Solo registro/triage",
            medico: consulta?.medico?.nombre_completo || "No asignado",
            medicamentos: meds,
          };
        });
        setPacientes(formatted);
      } catch (err) {
        console.error("Error fetching patients:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPacientes();
  }, [brigadaSeleccionada]);

  const pacientesFiltrados = pacientes
    .filter(
      (p) =>
        busqueda === "" ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.comunidad.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.medico.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const nombreBrigada = brigadas.find((b) => b.id === brigadaSeleccionada)?.nombre || "";

  const fechaGeneracion = new Date().toLocaleDateString("es-HN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

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
      {/* ── VISTA WEB (PAGINADA) ── */}
      <div className={styles.screenView}>
        {/* Encabezado */}
        <div className={styles.reportHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div className={styles.reportHeaderText}>
              <h3>Reporte de Pacientes por Brigada</h3>
              <p>
                Listado detallado de pacientes atendidos, diagnóstico y
                medicamentos recetados.
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
            <label htmlFor="brigada-select">Brigada</label>
            <select
              id="brigada-select"
              value={brigadaSeleccionada}
              onChange={(e) => setBrigadaSeleccionada(e.target.value)}
            >
              {brigadas.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>
          <div
            className={styles.filterGroup}
            style={{ flex: 1, minWidth: "220px" }}
          >
            <label htmlFor="busqueda-paciente">Buscar paciente</label>
            <input
              id="busqueda-paciente"
              type="text"
              placeholder="Nombre, comunidad, médico…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla Web */}
        <div className={styles.printableContainer}>
          <div style={{ overflowX: "auto" }}>
            <table className={styles.printableTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre del Paciente</th>
                  <th>Edad</th>
                  <th>Comunidad</th>
                  <th>Motivo de Consulta</th>
                  <th>Médico Asignado</th>
                  <th>Medicamentos Recetados</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                      Cargando pacientes de la brigada...
                    </td>
                  </tr>
                ) : pacientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={adminStyles.emptyCell}>
                      No se encontraron pacientes con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  pacientesFiltrados
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((p, relativeIdx) => {
                      const absoluteIdx = (currentPage - 1) * itemsPerPage + relativeIdx;
                      return (
                        <tr key={p.id}>
                          <td
                            style={{
                              color: "var(--grayLight)",
                              fontWeight: 600,
                              width: "3rem",
                            }}
                          >
                            {absoluteIdx + 1}
                          </td>
                          <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                          <td style={{ textAlign: "center" }}>{p.edad}</td>
                          <td style={{ maxWidth: "160px" }}>{p.comunidad}</td>
                          <td>
                            <span className={styles.motivoPill}>{p.motivo}</span>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>{p.medico}</td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "0.2rem",
                              }}
                            >
                              {p.medicamentos.length === 0 ? (
                                <span style={{ color: "var(--grayLight)", fontSize: "1.1rem" }}>Ninguno</span>
                              ) : (
                                p.medicamentos.map((med, mIdx) => (
                                  <span key={mIdx} className={styles.medicamentoPill}>
                                    {med}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>

          {Math.ceil(pacientesFiltrados.length / itemsPerPage) > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "2rem", padding: "1rem" }} className="no-print">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={styles.btnActionSecondary}
                style={{ padding: "0.6rem 1.2rem", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Anterior
              </button>
              <span style={{ fontSize: "1.3rem", fontWeight: "600" }}>Página {currentPage} de {Math.ceil(pacientesFiltrados.length / itemsPerPage)}</span>
              <button 
                disabled={currentPage === Math.ceil(pacientesFiltrados.length / itemsPerPage)} 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(pacientesFiltrados.length / itemsPerPage)))}
                className={styles.btnActionSecondary}
                style={{ padding: "0.6rem 1.2rem", cursor: currentPage === Math.ceil(pacientesFiltrados.length / itemsPerPage) ? "not-allowed" : "pointer", opacity: currentPage === Math.ceil(pacientesFiltrados.length / itemsPerPage) ? 0.5 : 1 }}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── VISTA DE IMPRESIÓN (SIN PAGINAR, CONTINUA) ── */}
      <div className={styles.printView}>
        {/* Encabezado Oficial Institucional */}
        <div style={{ borderBottom: "3px double #000000", paddingBottom: "1rem", marginBottom: "2rem", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <Image
              src="/DS-LOGO.png"
              alt="Logo Dibujando Sonrisas"
              width={35}
              height={35}
              style={{ objectFit: "contain" }}
            />
            <h1 style={{ fontSize: "18pt", fontWeight: "bold", margin: 0, color: "#000000", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Fundación Dibujando Sonrisas
            </h1>
          </div>
          <h2 style={{ fontSize: "13pt", fontWeight: "bold", margin: "0.5rem 0", color: "#000000", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            REPORTE DE PACIENTES POR BRIGADA
          </h2>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt", color: "#000000", borderTop: "1px solid #000000", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
            <span><strong>Solicitado por:</strong> {userRole}</span>
            <span><strong>Brigada:</strong> {nombreBrigada}</span>
            <span><strong>Ordenamiento:</strong> Alfabético Ascendente</span>
            <span><strong>Fecha de Generación:</strong> {fechaActualCompleta}</span>
          </div>
        </div>

        <table className={styles.printTable}>
          <thead>
            <tr>
              <th style={{ width: "30px" }}>#</th>
              <th>Nombre del Paciente</th>
              <th>Edad</th>
              <th>Comunidad</th>
              <th>Motivo de Consulta</th>
              <th>Médico Asignado</th>
              <th>Medicamentos Recetados</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "1.5rem", color: "#000000" }}>
                  Cargando pacientes de la brigada...
                </td>
              </tr>
            ) : pacientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "1.5rem", color: "#000000" }}>
                  No se encontraron pacientes para esta brigada.
                </td>
              </tr>
            ) : (
              pacientesFiltrados.map((p, idx) => (
                <tr key={p.id}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: "bold" }}>{p.nombre}</td>
                  <td>{p.edad}</td>
                  <td>{p.comunidad}</td>
                  <td>{p.motivo}</td>
                  <td>{p.medico}</td>
                  <td>
                    {p.medicamentos.length === 0 ? (
                      <span style={{ color: "#777777" }}>Ninguno</span>
                    ) : (
                      p.medicamentos.join(", ")
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ marginTop: "3rem", borderTop: "1px solid #000000", paddingTop: "1rem", fontSize: "8pt", color: "#555555", display: "flex", justifyContent: "space-between" }}>
          <span>Confidencialidad médica — Fundación Dibujando Sonrisas</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
}
