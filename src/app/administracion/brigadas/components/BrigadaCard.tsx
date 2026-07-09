"use client";

import React from "react";
import type { Brigada, EstadoBrigada } from "@/lib/db/brigadas";
import styles from "@/styles/pages/admin.module.css";

type BrigadaCardProps = {
  brigada: Brigada;
  isSelected: boolean;
  onSelect: () => void;
};

const ESTADO_CLASSES: Record<EstadoBrigada, string> = {
  inscripciones_abiertas: styles.badgeInfo,
  inscripciones_cerradas: styles.badgeSecondary,
  finalizada: styles.badgeDanger, // finalizada will be danger-style or custom
  cancelada: styles.badgeSecondary,
};

const ESTADO_LABELS: Record<EstadoBrigada, string> = {
  inscripciones_abiertas: "Inscripciones Abiertas",
  inscripciones_cerradas: "Cerrada / Programada",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

export default function BrigadaCard({
  brigada,
  isSelected,
  onSelect,
}: BrigadaCardProps) {
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "Sin fecha";
    const date = new Date(isoString);
    return date.toLocaleDateString("es-HN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      onClick={onSelect}
      style={{
        border: isSelected
          ? "2px solid var(--primary)"
          : "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "1.6rem",
        cursor: "pointer",
        background: isSelected ? "rgba(var(--primary-rgb), 0.05)" : "var(--card-bg, #fff)",
        transition: "all 0.2s ease-in-out",
        boxShadow: isSelected
          ? "0 4px 20px rgba(0,0,0,0.08)"
          : "0 2px 8px rgba(0,0,0,0.02)",
        position: "relative",
      }}
      className={styles.brigadaCardItem}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <span
          style={{
            fontSize: "1.1rem",
            fontWeight: "bold",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--primary)",
            background: "rgba(var(--primary-rgb), 0.1)",
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
          }}
        >
          {brigada.codigo}
        </span>
        <span className={`${styles.badge} ${ESTADO_CLASSES[brigada.estado]}`}>
          {ESTADO_LABELS[brigada.estado]}
        </span>
      </div>

      <h4
        style={{
          fontSize: "1.6rem",
          fontWeight: "bold",
          color: "var(--text-color)",
          marginBottom: "0.6rem",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {brigada.nombre}
      </h4>

      <p
        style={{
          fontSize: "1.3rem",
          color: "var(--gray)",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginBottom: "0.4rem",
        }}
      >
        📍 {brigada.lugar || "Lugar no especificado"}
      </p>

      <p
        style={{
          fontSize: "1.2rem",
          color: "var(--gray)",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
        }}
      >
        📅 {formatDate(brigada.fecha_brigada)}
      </p>
    </div>
  );
}
