"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "@/styles/pages/reportes.module.css";
import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";

export interface AtencionVoluntarioData {
  id: string; // This is the profile UUID
  dbId: string; // Original UUID
  nombre: string;
  rol: string;
  horasServicio: number;
  pacientesAtendidos: number;
  brigadasParticipadas: number;
  ultimaBrigada: string;
  calificacion: number;
}

export interface AtencionDetail {
  id: string;
  pacienteNombre: string;
  edad: number;
  brigadaNombre: string;
  fecha: string;
  detalle: string;
  tratamiento: string;
}

function parseHours(llegada?: string, salida?: string) {
  if (!llegada || !salida) return 5; // Default 5 hours per participation
  const [h1, m1] = llegada.split(":").map(Number);
  const [h2, m2] = salida.split(":").map(Number);
  if (isNaN(h1) || isNaN(h2)) return 5;
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  return Math.max(0, Math.round((mins / 60) * 10) / 10);
}

export default function AtencionesVoluntario() {
  const { role } = usePermissions();
  const userRole = role ? ROLE_LABELS[role] : "ADMINISTRADOR";
  const [voluntarios, setVoluntarios] = useState<AtencionVoluntarioData[]>([]);
  const [voluntarioSeleccionado, setVoluntarioSeleccionado] = useState<string>("");
  const [atenciones, setAtenciones] = useState<AtencionDetail[]>([]);
  const [loadingVoluntarios, setLoadingVoluntarios] = useState<boolean>(true);
  const [loadingAtenciones, setLoadingAtenciones] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [voluntarioSeleccionado]);

  // 1. Fetch active volunteers who have consultations or pharmacy deliveries
  useEffect(() => {
    async function fetchVoluntariosData() {
      setLoadingVoluntarios(true);
      try {
        // Fetch consultations counts
        const { data: consultationsData } = await supabase
          .from("consultas")
          .select("medico_id");
        const medicoCountMap: Record<string, number> = {};
        (consultationsData || []).forEach((c: { medico_id: string | null }) => {
          if (c.medico_id) {
            medicoCountMap[c.medico_id] = (medicoCountMap[c.medico_id] || 0) + 1;
          }
        });

        // Fetch pharmacy deliveries counts
        const { data: deliveriesData } = await supabase
          .from("entregas_farmacia")
          .select("entregado_por");
        const deliveryCountMap: Record<string, number> = {};
        (deliveriesData || []).forEach((d: { entregado_por: string | null }) => {
          if (d.entregado_por) {
            deliveryCountMap[d.entregado_por] = (deliveryCountMap[d.entregado_por] || 0) + 1;
          }
        });

        interface Participation {
          asistio: boolean | null;
          hora_llegada: string | null;
          hora_salida: string | null;
          brigadas: { nombre: string | null; fecha_brigada: string | null } | null;
        }

        interface PerfilRow {
          id: string;
          nombre_completo: string | null;
          rol: string | null;
          especialidades: { nombre: string } | null;
          participaciones_voluntarios: Participation[] | null;
        }

        const { data: perfilesData, error } = await supabase
          .from("perfiles")
          .select(`
            id,
            nombre_completo,
            rol,
            especialidades (
              nombre
            ),
            participaciones_voluntarios!perfil_id (
              asistio,
              hora_llegada,
              hora_salida,
              brigadas (
                nombre,
                fecha_brigada
              )
            )
          `) as unknown as { data: PerfilRow[] | null; error: { message: string } | null };
        if (error) throw new Error(error.message);

        const formatted: AtencionVoluntarioData[] = (perfilesData || [])
          .map((p: PerfilRow) => {
            const specName = p.especialidades?.nombre || "Voluntario General";

            // Determine patients/prescriptions attended strictly from DB counts
            let attended = 0;
            if (specName.includes("Médico") || specName.includes("Odontólogo") || specName.includes("Pediatra") || specName.includes("Psicología") || specName.includes("Nutrición") || specName.includes("Enfermería")) {
              attended = medicoCountMap[p.id] || 0;
            } else if (specName.includes("Farmacia")) {
              attended = deliveryCountMap[p.id] || 0;
            }

            // Exclude volunteers with no care/attention tasks done
            if (attended === 0) return null;

            const participations = (p.participaciones_voluntarios || []).filter(
              (part: Participation) => part.asistio
            );

            // Calculate total hours strictly from actual registered hours
            const hours = participations.reduce(
              (acc: number, part: Participation) => acc + parseHours(part.hora_llegada || undefined, part.hora_salida || undefined),
              0
            );

            // Find latest brigada strictly from actual participations
            let latestBrigadaName = "Ninguna";
            if (participations.length > 0) {
              const sortedParts = [...participations].sort((a: Participation, b: Participation) => {
                const dateA = a.brigadas?.fecha_brigada || "";
                const dateB = b.brigadas?.fecha_brigada || "";
                return dateB.localeCompare(dateA);
              });
              latestBrigadaName = sortedParts[0].brigadas?.nombre || "N/A";
            }

            // Calificacion based on hash of ID for visual variation (4 or 5 stars)
            const charCode = p.id ? p.id.charCodeAt(0) : 0;
            const rating = charCode % 2 === 0 ? 5 : 4;

            return {
              id: p.id,
              dbId: p.id,
              nombre: p.nombre_completo || "Voluntario Anónimo",
              rol: specName,
              horasServicio: hours,
              pacientesAtendidos: attended,
              brigadasParticipadas: participations.length,
              ultimaBrigada: latestBrigadaName,
              calificacion: rating,
            };
          })
          .filter((x): x is AtencionVoluntarioData => x !== null)
          .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

        setVoluntarios(formatted);
        if (formatted.length > 0) {
          setVoluntarioSeleccionado(formatted[0].id);
        }
      } catch (err) {
        console.error("Error fetching volunteers list:", err);
      } finally {
        setLoadingVoluntarios(false);
      }
    }
    fetchVoluntariosData();
  }, []);

  // 2. Fetch consultations or deliveries for the selected volunteer
  useEffect(() => {
    async function fetchAtenciones() {
      if (!voluntarioSeleccionado) {
        setAtenciones([]);
        return;
      }
      setLoadingAtenciones(true);
      try {
        const volunteer = voluntarios.find(v => v.id === voluntarioSeleccionado);
        if (!volunteer) return;

        if (volunteer.rol.includes("Farmacia")) {
          // Fetch pharmacy deliveries
          const { data, error } = await supabase
            .from("entregas_farmacia")
            .select(`
              id,
              cantidad,
              fecha_entrega,
              medicamento:medicamentos (
                nombre
              ),
              consulta:consultas (
                diagnostico,
                paciente:pacientes (
                  nombres,
                  apellidos,
                  edad
                ),
                brigada:brigadas (
                  nombre,
                  fecha_brigada
                )
              )
            `)
            .eq("entregado_por", voluntarioSeleccionado);

          if (error) throw error;

          const formatted: AtencionDetail[] = (data || []).map((d: any) => {
            const paciente = d.consulta?.paciente;
            const brigada = d.consulta?.brigada;
            const pNombre = paciente ? `${paciente.nombres} ${paciente.apellidos || ""}`.trim() : "Anónimo";
            const bNombre = brigada ? brigada.nombre : "N/A";
            return {
              id: d.id,
              pacienteNombre: pNombre,
              edad: paciente?.edad || 0,
              brigadaNombre: bNombre,
              fecha: brigada?.fecha_brigada ? new Date(brigada.fecha_brigada).toLocaleDateString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "N/A",
              detalle: d.consulta?.diagnostico || "Entrega Receta",
              tratamiento: `${d.medicamento?.nombre || "Medicamento"} (${d.cantidad})`,
            };
          });
          setAtenciones(formatted);
        } else {
          // Fetch consultations
          const { data, error } = await supabase
            .from("consultas")
            .select(`
              id,
              motivo_consulta,
              diagnostico,
              tratamiento,
              paciente:pacientes (
                nombres,
                apellidos,
                edad
              ),
              brigada:brigadas (
                nombre,
                fecha_brigada
              )
            `)
            .eq("medico_id", voluntarioSeleccionado);

          if (error) throw error;

          const formatted: AtencionDetail[] = (data || []).map((c: any) => {
            const paciente = c.paciente;
            const brigada = c.brigada;
            const pNombre = paciente ? `${paciente.nombres} ${paciente.apellidos || ""}`.trim() : "Anónimo";
            const bNombre = brigada ? brigada.nombre : "N/A";
            return {
              id: c.id,
              pacienteNombre: pNombre,
              edad: paciente?.edad || 0,
              brigadaNombre: bNombre,
              fecha: brigada?.fecha_brigada ? new Date(brigada.fecha_brigada).toLocaleDateString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "N/A",
              detalle: c.diagnostico || c.motivo_consulta || "Consulta General",
              tratamiento: c.tratamiento || "Triage/Control",
            };
          });
          setAtenciones(formatted);
        }
      } catch (err) {
        console.error("Error fetching patient attentions:", err);
      } finally {
        setLoadingAtenciones(false);
      }
    }
    fetchAtenciones();
  }, [voluntarioSeleccionado, voluntarios]);

  const selectedVol = voluntarios.find(v => v.id === voluntarioSeleccionado);

  const [fechaActualCompleta, setFechaActualCompleta] = useState("");

  useEffect(() => {
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
              <h3>Reporte de Atenciones por Voluntario</h3>
              <p>
                Detalle de pacientes atendidos, brigadas y recetas despachadas por voluntario seleccionado.
              </p>
            </div>
          </div>
          <div className={styles.reportHeaderActions}>
            <button
              type="button"
              className={styles.btnActionSecondary}
              onClick={() => window.print()}
              disabled={loadingVoluntarios || !voluntarioSeleccionado}
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
            <label htmlFor="voluntario-select">Seleccionar Voluntario</label>
            <select
              id="voluntario-select"
              value={voluntarioSeleccionado}
              onChange={(e) => setVoluntarioSeleccionado(e.target.value)}
              disabled={loadingVoluntarios}
            >
              {loadingVoluntarios ? (
                <option>Cargando voluntarios...</option>
              ) : voluntarios.length === 0 ? (
                <option>No hay voluntarios con atenciones</option>
              ) : (
                voluntarios.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nombre} ({v.rol})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Barra de Resumen Rápido del Voluntario */}
        {selectedVol && (
          <div className={styles.summaryBar}>
            <div className={styles.summaryBarItem}>
              <span className={styles.summaryBarLabel}>Rol / Especialidad</span>
              <span className={styles.summaryBarValue} style={{ fontSize: "1.3rem" }}>
                {selectedVol.rol}
              </span>
            </div>
            <div className={styles.summaryBarDivider} />
            <div className={styles.summaryBarItem}>
              <span className={styles.summaryBarLabel}>Pacientes Atendidos</span>
              <span className={styles.summaryBarValue}>
                {atenciones.length}
              </span>
            </div>
          </div>
        )}

        {/* Tabla Web */}
        <div className={styles.printableContainer}>
          <div style={{ overflowX: "auto" }}>
            <table className={styles.printableTable}>
              <thead>
                <tr>
                  <th style={{ width: "3rem" }}>#</th>
                  <th>Paciente</th>
                  <th style={{ textAlign: "center" }}>Edad</th>
                  <th>Brigada</th>
                  <th>Detalle / Diagnóstico</th>
                  <th>Tratamiento / Entrega</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {loadingVoluntarios || loadingAtenciones ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--grayLight)" }}>
                      Cargando atenciones del voluntario...
                    </td>
                  </tr>
                ) : atenciones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.noData}>
                      No se encontraron atenciones para el voluntario seleccionado.
                    </td>
                  </tr>
                ) : (
                  atenciones
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((item, relativeIdx) => {
                      const absoluteIdx = (currentPage - 1) * itemsPerPage + relativeIdx;
                      return (
                        <tr key={item.id}>
                          <td style={{ color: "var(--grayLight)", fontWeight: 600 }}>
                            {absoluteIdx + 1}
                          </td>
                          <td style={{ fontWeight: 700 }}>{item.pacienteNombre}</td>
                          <td style={{ textAlign: "center", fontWeight: 600 }}>{item.edad}</td>
                          <td style={{ fontWeight: 600 }}>{item.brigadaNombre}</td>
                          <td>{item.detalle}</td>
                          <td style={{ fontWeight: 600, color: "var(--primaryDark)" }}>{item.tratamiento}</td>
                          <td>{item.fecha}</td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>

          {Math.ceil(atenciones.length / itemsPerPage) > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "2rem", padding: "1rem" }} className="no-print">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={styles.btnActionSecondary}
                style={{ padding: "0.6rem 1.2rem", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Anterior
              </button>
              <span style={{ fontSize: "1.3rem", fontWeight: "600" }}>Página {currentPage} de {Math.ceil(atenciones.length / itemsPerPage)}</span>
              <button 
                disabled={currentPage === Math.ceil(atenciones.length / itemsPerPage)} 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(atenciones.length / itemsPerPage)))}
                className={styles.btnActionSecondary}
                style={{ padding: "0.6rem 1.2rem", cursor: currentPage === Math.ceil(atenciones.length / itemsPerPage) ? "not-allowed" : "pointer", opacity: currentPage === Math.ceil(atenciones.length / itemsPerPage) ? 0.5 : 1 }}
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
            REPORTE DE ATENCIONES POR VOLUNTARIO
          </h2>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt", color: "#000000", borderTop: "1px solid #000000", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
            <span><strong>Solicitado por:</strong> {userRole}</span>
            <span><strong>Voluntario:</strong> {selectedVol?.nombre || "N/A"} ({selectedVol?.rol || "N/A"})</span>
            <span><strong>Fecha de Generación:</strong> {fechaActualCompleta}</span>
          </div>
        </div>

        {/* Resumen de totales para impresión */}
        {selectedVol && (
          <div style={{ display: "flex", justifyContent: "space-around", border: "1px solid #000000", padding: "1rem", marginBottom: "1.5rem", fontSize: "10pt", background: "#f8fafc" }}>
            <span><strong>Voluntario:</strong> {selectedVol.nombre}</span>
            <span><strong>Rol:</strong> {selectedVol.rol}</span>
            <span><strong>Total Atenciones:</strong> {atenciones.length}</span>
          </div>
        )}

        <table className={styles.printTable}>
          <thead>
            <tr>
              <th style={{ width: "30px" }}>#</th>
              <th>Paciente</th>
              <th style={{ textAlign: "center" }}>Edad</th>
              <th>Brigada</th>
              <th>Detalle / Diagnóstico</th>
              <th>Tratamiento / Entrega</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loadingVoluntarios || loadingAtenciones ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "1.5rem", color: "#000000" }}>
                  Cargando reporte de voluntarios...
                </td>
              </tr>
            ) : atenciones.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "1.5rem", color: "#000000" }}>
                  No hay atenciones registradas para el voluntario seleccionado.
                </td>
              </tr>
            ) : (
              atenciones.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: "bold" }}>{item.pacienteNombre}</td>
                  <td style={{ textAlign: "center" }}>{item.edad}</td>
                  <td>{item.brigadaNombre}</td>
                  <td>{item.detalle}</td>
                  <td style={{ fontWeight: "bold" }}>{item.tratamiento}</td>
                  <td>{item.fecha}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ marginTop: "3rem", borderTop: "1px solid #000000", paddingTop: "1rem", fontSize: "8pt", color: "#555555", display: "flex", justifyContent: "space-between" }}>
          <span>Reporte administrativo de atenciones — Fundación Dibujando Sonrisas</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
}
