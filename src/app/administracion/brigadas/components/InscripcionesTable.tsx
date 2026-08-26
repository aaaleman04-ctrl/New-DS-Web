"use client";

import React, { useTransition } from "react";
import styles from "@/styles/pages/admin.module.css";

export type InscripcionRow = {
  id: string;
  brigada_id: string;
  nombre_completo: string;
  correo: string;
  telefono: string;
  area_interes: string;
  estado: "pendiente" | "aceptado" | "rechazado";
  created_at: string;
  updated_at?: string;
};

export type PerfilMini = {
  id: string;
  nombre_completo: string | null;
};

type InscripcionesTableProps = {
  inscripciones: InscripcionRow[];
  profiles: PerfilMini[];
  assignments: Record<string, string>; // perfil_id -> area_asignada
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onAssign: (perfilId: string, area: string | null) => Promise<void>;
  isReadOnly?: boolean;
};

const AREAS_MAP: Record<string, string> = {
  registro: "Registro",
  preclinica: "Preclínica",
  consulta_medica: "Consulta Médica",
  consulta_odontologica: "Consulta Odontológica",
  farmacia: "Farmacia",
  postclinica: "Postclínica",
  ropa: "Donaciones / Ropa",
  actividades: "Actividades Infantiles",
  logistica: "Logística",
  coordinacion: "Coordinación",
};

const STATE_LABELS = {
  pendiente: "Pendiente",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
};

const STATE_CLASSES = {
  pendiente: styles.badgeInfo,
  aceptado: styles.badgeSuccess || styles.badgeInfo,
  rechazado: styles.badgeDanger,
};

export default function InscripcionesTable({
  inscripciones,
  profiles,
  assignments,
  onAccept,
  onReject,
  onAssign,
  isReadOnly = false,
}: InscripcionesTableProps) {
  const [isPending, startTransition] = useTransition();

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("es-HN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleAccept = (id: string) => {
    startTransition(async () => {
      await onAccept(id);
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      const confirm = window.confirm("¿Estás seguro de que deseas rechazar esta solicitud?");
      if (confirm) {
        await onReject(id);
      }
    });
  };

  const handleAssignChange = (perfilId: string, area: string) => {
    startTransition(async () => {
      await onAssign(perfilId, area === "none" ? null : area);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
      <h3 style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
        Solicitudes de Voluntariado ({inscripciones.length})
      </h3>

      <div className={styles.tableContainer}>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Voluntario</th>
                <th>Contacto</th>
                <th>Área de Interés</th>
                <th>Fecha Solicitud</th>
                <th>Estado</th>
                <th>Asignación Rápida</th>
                {!isReadOnly && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {inscripciones.length === 0 ? (
                <tr>
                  <td colSpan={isReadOnly ? 6 : 7} className={styles.emptyCell}>
                    No hay solicitudes registradas para esta brigada.
                  </td>
                </tr>
              ) : (
                inscripciones.map((ins) => {
                  // Find profile matching names (since emails are only in auth.users)
                  const matchingProfile = profiles.find((p) => {
                    const fullName = (p.nombre_completo || "").trim().toLowerCase();
                    return fullName === ins.nombre_completo.trim().toLowerCase();
                  });

                  const assignedArea = matchingProfile ? assignments[matchingProfile.id] || "none" : "none";

                  return (
                    <tr key={ins.id}>
                      <td>
                        <strong>{ins.nombre_completo}</strong>
                      </td>
                      <td>
                        <span style={{ display: "block", fontSize: "1.3rem" }}>{ins.correo}</span>
                        <span style={{ display: "block", fontSize: "1.2rem", color: "var(--gray)" }}>
                          {ins.telefono}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontStyle: "italic", fontSize: "1.3rem" }}>{ins.area_interes}</span>
                      </td>
                      <td>{formatDate(ins.created_at)}</td>
                      <td>
                        <span
                          className={`${styles.badge} ${STATE_CLASSES[ins.estado]} ${
                            ins.estado === "aceptado" ? "badgeSuccess" : ""
                          }`}
                          style={
                            ins.estado === "aceptado"
                              ? { backgroundColor: "#10b981", color: "#fff" }
                              : {}
                          }
                        >
                          {STATE_LABELS[ins.estado]}
                        </span>
                      </td>
                      <td>
                        {ins.estado === "aceptado" ? (
                          matchingProfile ? (
                            <select
                              value={assignedArea}
                              onChange={(e) => handleAssignChange(matchingProfile.id, e.target.value)}
                              disabled={isPending || isReadOnly}
                              style={{ width: "100%", padding: "0.4rem" }}
                            >
                              <option value="none">Sin asignar</option>
                              {Object.entries(AREAS_MAP).map(([val, label]) => (
                                <option key={val} value={val}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              style={{
                                fontSize: "1.2rem",
                                color: "#f59e0b",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                maxWidth: "200px",
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                              Sin perfil registrado. Solicitar registro en la app.
                            </span>
                          )
                        ) : (
                          <span style={{ fontSize: "1.2rem", color: "var(--gray)" }}>
                            Debe ser aceptado primero.
                          </span>
                        )}
                      </td>
                      {!isReadOnly && (
                        <td>
                          {ins.estado === "pendiente" ? (
                            <div className={styles.tableActions}>
                              <button
                                type="button"
                                className={styles.linkBtn}
                                onClick={() => handleAccept(ins.id)}
                                disabled={isPending}
                                style={{ color: "#10b981" }}
                              >
                                Aceptar
                              </button>
                              <button
                                type="button"
                                className={styles.linkBtnDanger}
                                onClick={() => handleReject(ins.id)}
                                disabled={isPending}
                              >
                                Rechazar
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: "1.2rem", color: "var(--gray)" }}>—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
