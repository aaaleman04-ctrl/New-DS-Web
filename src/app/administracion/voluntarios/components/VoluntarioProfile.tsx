"use client";

import styles from "@/styles/pages/admin.module.css";
import type { VoluntarioRow } from "./VoluntariosTable";
import RoleBadge from "../../components/RoleBadge";

type VoluntarioProfileProps = {
  voluntario: VoluntarioRow;
};

export default function VoluntarioProfile({ voluntario }: VoluntarioProfileProps) {
  const participacionesCount = voluntario.participaciones_voluntarios?.length || 0;
  const horasEstimadas = participacionesCount * 8;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-color)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        padding: "2.4rem 2.8rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "2.4rem", flexWrap: "wrap" }}>
        {/* Avatar */}
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            backgroundColor: "var(--primaryColor)",
            backgroundImage: voluntario.avatar_url ? `url(${voluntario.avatar_url})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: "3.2rem",
            fontWeight: 700,
            border: "4px solid #ffffff",
            boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
            flexShrink: 0,
          }}
        >
          {!voluntario.avatar_url && (voluntario.nombre_completo?.charAt(0).toUpperCase() || "V")}
        </div>

        {/* Info Principal */}
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", flexWrap: "wrap" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "2.4rem",
                fontWeight: 700,
                color: "var(--dark)",
                letterSpacing: "-0.01em",
              }}
            >
              {voluntario.nombre_completo || "Sin Nombre Registrado"}
            </h2>

            <span
              style={{
                padding: "0.3rem 1rem",
                borderRadius: "1.2rem",
                fontSize: "1.2rem",
                fontWeight: 600,
                backgroundColor: voluntario.activo ? "#dcfce7" : "#fee2e2",
                color: voluntario.activo ? "#166534" : "#991b1b",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: voluntario.activo ? "#22c55e" : "#ef4444",
                }}
              />
              {voluntario.activo ? "Voluntario Activo" : "Inactivo"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.6rem", flexWrap: "wrap", fontSize: "1.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontWeight: 600, color: "var(--dark)" }}>Rol Asignado:</span>
              <RoleBadge role={voluntario.rol as any} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontWeight: 600, color: "var(--dark)" }}>Especialidad / Área:</span>
              <span
                style={{
                  background: "#e0f2fe",
                  color: "#0369a1",
                  padding: "0.2rem 0.8rem",
                  borderRadius: "1rem",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                }}
              >
                {voluntario.especialidades?.nombre || "Sin Especialidad Asignada"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Metadatos Detallados */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.6rem",
          marginTop: "0.8rem",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--white)",
            border: "1px solid var(--border-color)",
            padding: "1.4rem 1.6rem",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ fontSize: "1.2rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.4rem" }}>
            Teléfono
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--dark)" }}>
            {voluntario.telefono || "No especificado"}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "var(--white)",
            border: "1px solid var(--border-color)",
            padding: "1.4rem 1.6rem",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ fontSize: "1.2rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.4rem" }}>
            Cargo u Oficio
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--dark)" }}>
            {voluntario.cargo || "Voluntario General"}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "var(--white)",
            border: "1px solid var(--border-color)",
            padding: "1.4rem 1.6rem",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ fontSize: "1.2rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.4rem" }}>
            Brigadas Participadas
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primaryDark)" }}>
            {participacionesCount} Brigadas
          </div>
        </div>

        <div
          style={{
            backgroundColor: "var(--white)",
            border: "1px solid var(--border-color)",
            padding: "1.4rem 1.6rem",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ fontSize: "1.2rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.4rem" }}>
            Horas de Servicio
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#166534" }}>
            ~{horasEstimadas} Horas Certificables
          </div>
        </div>
      </div>
    </div>
  );
}
