"use client";

import styles from "@/styles/pages/admin.module.css";

type VolunteerFiltersProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterSpecialty: string;
  onSpecialtyChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  specialties: { id: string; nombre: string }[];
};

export default function VolunteerFilters({
  searchTerm,
  onSearchChange,
  filterSpecialty,
  onSpecialtyChange,
  filterStatus,
  onStatusChange,
  specialties,
}: VolunteerFiltersProps) {
  return (
    <div className={styles.tableContainer} style={{ padding: "2rem" }}>
      <h3 style={{ fontSize: "1.6rem", marginBottom: "1.6rem", marginTop: 0 }}>
        Filtros de Búsqueda
      </h3>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1.6rem",
      }}>
        <div className={styles.formField}>
          <span>Buscar por nombre</span>
          <input
            type="text"
            placeholder="Buscar voluntario..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className={styles.formField}>
          <span>Especialidad</span>
          <select
            value={filterSpecialty}
            onChange={(e) => onSpecialtyChange(e.target.value)}
          >
            <option value="all">Todas las especialidades</option>
            {specialties.map((sp) => (
              <option key={sp.id} value={sp.id}>{sp.nombre}</option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <span>Estado</span>
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>
    </div>
  );
}
