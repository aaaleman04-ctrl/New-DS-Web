"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import styles from "@/styles/pages/admin.module.css";
import VolunteerFilters from "./VolunteerFilters";

export type VoluntarioRow = {
  id: string;
  nombre_completo: string | null;
  rol: string;
  avatar_url: string | null;
  activo: boolean;
  cargo: string | null;
  especialidades?: { id: string; nombre: string } | null;
  asignaciones_voluntarios?: any[];
  participaciones_voluntarios?: any[];
};

type VoluntariosTableProps = {
  voluntarios: VoluntarioRow[];
};

export default function VoluntariosTable({ voluntarios }: VoluntariosTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const specialties = useMemo(() => {
    const specs = new Map();
    voluntarios.forEach(v => {
      if (v.especialidades) {
        specs.set(v.especialidades.id, v.especialidades.nombre);
      }
    });
    return Array.from(specs.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [voluntarios]);

  const filtered = useMemo(() => {
    return voluntarios.filter((v) => {
      const matchSearch = v.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSpecialty = filterSpecialty === "all" || v.especialidades?.id === filterSpecialty;
      const matchStatus = filterStatus === "all" 
        || (filterStatus === "active" && v.activo)
        || (filterStatus === "inactive" && !v.activo);

      return matchSearch && matchSpecialty && matchStatus;
    });
  }, [voluntarios, searchTerm, filterSpecialty, filterStatus]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem", marginTop: "2rem" }}>
      <VolunteerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterSpecialty={filterSpecialty}
        onSpecialtyChange={setFilterSpecialty}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        specialties={specialties}
      />

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>Voluntarios Encontrados ({filtered.length})</h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
        <thead>
          <tr>
            <th>Voluntario</th>
            <th>Especialidad</th>
            <th>Cargo</th>
            <th>Participaciones</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                No se encontraron voluntarios con los filtros aplicados.
              </td>
            </tr>
          ) : (
            filtered.map((v) => (
              <tr key={v.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "var(--gray-light)",
                      backgroundImage: v.avatar_url ? `url(${v.avatar_url})` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--gray)",
                      fontWeight: "bold",
                    }}>
                      {!v.avatar_url && (v.nombre_completo?.charAt(0) || "?")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{v.nombre_completo || "Sin nombre"}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--gray)" }}>
                        Rol: {v.rol}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{v.especialidades?.nombre || <span style={{ color: "var(--gray)" }}>Sin asignar</span>}</td>
                <td>{v.cargo || <span style={{ color: "var(--gray)" }}>N/A</span>}</td>
                <td>
                  {v.participaciones_voluntarios?.length || 0} brigadas
                </td>
                <td>
                  <span
                    style={{
                      padding: "0.2rem 0.6rem",
                      borderRadius: "1rem",
                      fontSize: "0.85rem",
                      backgroundColor: v.activo ? "var(--green-light, #d1fae5)" : "var(--red-light, #fee2e2)",
                      color: v.activo ? "var(--green-dark, #065f46)" : "var(--red-dark, #991b1b)",
                      fontWeight: 500,
                    }}
                  >
                    {v.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  <Link href={`/administracion/voluntarios/${v.id}`}>
                    <button className={styles.btnSecondary}>
                      Ver Perfil
                    </button>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      </div>
    </div>
  );
}
