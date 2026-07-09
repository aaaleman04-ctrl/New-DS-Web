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
          REPORTE DE PACIENTES POR BRIGADA
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

      {/* Tabla imprimible */}
      <div className={styles.printableContainer}>
        {/* Header del documento */}
        <div className={styles.printableHeader}>
          <div className={styles.printableHeaderBrand}>
            <div
              style={{
                width: "4.4rem",
                height: "4.4rem",
                background:
                  "linear-gradient(135deg, var(--primaryColor), var(--accentColor))",
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
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </div>
            <div>
              <h4>Fundación Dibujando Sonrisas</h4>
              <span>Registro de Atención Médica — {nombreBrigada}</span>
            </div>
          </div>
          <div className={styles.printableMeta}>
            <p>
              <strong>Fecha de generación:</strong> {fechaGeneracion}
            </p>
            <p>
              <strong>Total de pacientes:</strong> {pacientesFiltrados.length}
            </p>
            <p style={{ fontSize: "1.2rem", color: "var(--grayLight)" }}>
              Documento confidencial — uso interno
            </p>
          </div>
        </div>

        {/* Tabla */}
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
                pacientesFiltrados.map((p, idx) => (
                  <tr key={p.id}>
                    <td
                      style={{
                        color: "var(--grayLight)",
                        fontWeight: 600,
                        width: "3rem",
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                    <td style={{ textAlign: "center" }}>{p.edad} años</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className={styles.printableFooter}>
          <p>
            Generado por: <strong>Sistema de Gestión Dibujando Sonrisas</strong>
          </p>
          <p>
            <strong>{pacientesFiltrados.length} paciente(s)</strong> registrados
            en esta brigada
          </p>
        </div>
      </div>
    </div>
  );
}
