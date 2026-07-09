"use client";

import React, { useState, useMemo, useTransition } from "react";
import styles from "@/styles/pages/admin.module.css";

export type PerfilRow = {
  id: string;
  nombre_completo: string | null;
  rol: string;
  cargo?: string | null;
  especialidad_id?: string | null;
  activo: boolean;
  especialidades?: {
    id: string;
    nombre: string;
  } | null;
};

type AsignacionesTableProps = {
  profiles: PerfilRow[];
  assignments: Record<string, string>; // perfil_id -> area_asignada
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

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  coordinador: "Coordinador",
  voluntario: "Voluntario",
};

export default function AsignacionesTable({
  profiles,
  assignments,
  onAssign,
  isReadOnly = false,
}: AsignacionesTableProps) {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("all"); // 'all', 'assigned', 'unassigned'

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // Must be active user to work in a brigade
      if (!p.activo) return false;

      const fullName = (p.nombre_completo || "").toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
        p.cargo?.toLowerCase().includes(searchTerm.toLowerCase());

      const assignedArea = assignments[p.id];
      const isAssigned = !!assignedArea;

      const matchesAssignment = assignmentFilter === "all" ||
        (assignmentFilter === "assigned" && isAssigned) ||
        (assignmentFilter === "unassigned" && !isAssigned);

      return matchesSearch && matchesAssignment;
    });
  }, [profiles, searchTerm, assignmentFilter, assignments]);

  const handleAssignChange = (perfilId: string, area: string) => {
    startTransition(async () => {
      await onAssign(perfilId, area === "none" ? null : area);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
      {/* Filtros */}
      <div
        className={styles.tableContainer}
        style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.6rem" }}
      >
        <h3 style={{ fontSize: "1.6rem", fontWeight: "bold" }}>Asignación de Personal</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.6rem",
          }}
        >
          {/* Buscar */}
          <div className={styles.formField}>
            <span>Buscar personal por nombre o cargo</span>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Asignación */}
          <div className={styles.formField}>
            <span>Filtrar por Asignación</span>
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
            >
              <option value="all">Todo el personal activo</option>
              <option value="assigned">Asignados a un área</option>
              <option value="unassigned">Sin área asignada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className={styles.tableContainer}>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Miembro</th>
                <th>Rol / Cargo</th>
                <th>Especialidad</th>
                <th>Área Asignada</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyCell}>
                    No se encontró personal activo con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => {
                  const currentArea = assignments[p.id] || "none";

                  return (
                    <tr key={p.id}>
                      <td>
                        <strong>
                          {p.nombre_completo || "Usuario Sin Nombre"}
                        </strong>
                      </td>
                      <td>
                        <span style={{ display: "block", fontSize: "1.3rem", fontWeight: "bold" }}>
                          {ROLE_LABELS[p.rol] || p.rol}
                        </span>
                        {p.cargo && (
                          <span style={{ display: "block", fontSize: "1.2rem", color: "var(--gray)" }}>
                            {p.cargo}
                          </span>
                        )}
                      </td>
                      <td>
                        {p.especialidades ? (
                          <span
                            style={{
                              background: "rgba(var(--primary-rgb), 0.1)",
                              color: "var(--primary)",
                              padding: "0.2rem 0.6rem",
                              borderRadius: "4px",
                              fontSize: "1.2rem",
                              fontWeight: "bold",
                            }}
                          >
                            {p.especialidades.nombre}
                          </span>
                        ) : (
                          <span style={{ fontSize: "1.2rem", color: "var(--gray)" }}>—</span>
                        )}
                      </td>
                      <td>
                        <select
                          value={currentArea}
                          onChange={(e) => handleAssignChange(p.id, e.target.value)}
                          disabled={isPending || isReadOnly}
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            borderRadius: "6px",
                            border: "1px solid var(--border-color)",
                            fontSize: "1.3rem",
                            background: currentArea !== "none" ? "rgba(16, 185, 129, 0.05)" : "inherit",
                            borderColor: currentArea !== "none" ? "#10b981" : "var(--border-color)",
                          }}
                        >
                          <option value="none">Sin asignar</option>
                          {Object.entries(AREAS_MAP).map(([val, label]) => (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
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
