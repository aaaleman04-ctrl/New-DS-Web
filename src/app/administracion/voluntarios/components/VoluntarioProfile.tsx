"use client";

import styles from "@/styles/pages/admin.module.css";
import type { VoluntarioRow } from "./VoluntariosTable";

type VoluntarioProfileProps = {
  voluntario: VoluntarioRow;
};

export default function VoluntarioProfile({ voluntario }: VoluntarioProfileProps) {
  return (
    <div className={styles.tableContainer} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem", flexWrap: "wrap" }}>
        
        {/* Avatar */}
        <div style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          backgroundColor: "var(--gray-light)",
          backgroundImage: voluntario.avatar_url ? `url(${voluntario.avatar_url})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--gray)",
          fontSize: "2.5rem",
          fontWeight: "bold",
          border: "4px solid var(--border-color)",
          flexShrink: 0,
        }}>
          {!voluntario.avatar_url && (voluntario.nombre_completo?.charAt(0) || "?")}
        </div>

        {/* Info */}
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div>
            <h2 style={{ margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "1rem" }}>
              {voluntario.nombre_completo || "Sin nombre"}
              <span
                style={{
                  padding: "0.2rem 0.6rem",
                  borderRadius: "1rem",
                  fontSize: "0.85rem",
                  backgroundColor: voluntario.activo ? "var(--green-light, #d1fae5)" : "var(--red-light, #fee2e2)",
                  color: voluntario.activo ? "var(--green-dark, #065f46)" : "var(--red-dark, #991b1b)",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                {voluntario.activo ? "Activo" : "Inactivo"}
              </span>
            </h2>
            <div style={{ color: "var(--gray)", fontSize: "0.95rem" }}>
              <strong>Rol:</strong> {voluntario.rol}
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
            <div style={{ backgroundColor: "var(--bg-default)", padding: "0.8rem", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--gray)", fontWeight: "bold", marginBottom: "0.2rem" }}>Especialidad</div>
              <div>{voluntario.especialidades?.nombre || "N/A"}</div>
            </div>
            
            <div style={{ backgroundColor: "var(--bg-default)", padding: "0.8rem", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--gray)", fontWeight: "bold", marginBottom: "0.2rem" }}>Cargo</div>
              <div>{voluntario.cargo || "N/A"}</div>
            </div>

            <div style={{ backgroundColor: "var(--bg-default)", padding: "0.8rem", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--gray)", fontWeight: "bold", marginBottom: "0.2rem" }}>Participaciones</div>
              <div>{voluntario.participaciones_voluntarios?.length || 0} Brigadas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
