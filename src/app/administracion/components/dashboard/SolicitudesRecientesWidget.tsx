import React from "react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import SolicitudesWidgetClient from "./SolicitudesWidgetClient";
import styles from "@/styles/pages/admin.module.css";

export default async function SolicitudesRecientesWidget() {
  const supabase = await createSupabaseServerClient();

  // 1. Obtener la brigada activa programada (no finalizada y no cancelada)
  const { data: brigadas } = await supabase
    .from("brigadas")
    .select("id, nombre, codigo, lugar, fecha_brigada, estado")
    .neq("estado", "finalizada")
    .neq("estado", "cancelada")
    .order("fecha_brigada", { ascending: true })
    .limit(1);

  const activeBrigada = brigadas?.[0] ?? null;

  // Si no hay brigada activa, no mostrar el widget de recepción
  if (!activeBrigada) {
    return null;
  }

  // 2. Obtener solicitudes de inscripción para esta brigada activa
  const { data: solicitudes, error } = await supabase
    .from("inscripciones_voluntarios")
    .select("*")
    .eq("brigada_id", activeBrigada.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching volunteer registrations:", error.message);
  }

  const list = (solicitudes as any[]) ?? [];
  const pendientesCount = list.filter((s) => s.estado === "pendiente").length;

  return (
    <div
      className={styles.statCard}
      style={{
        gridColumn: "1 / -1",
        background: "var(--white)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-color)",
        padding: "2.8rem 3.2rem",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      {/* Header del Widget */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.2rem",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "1.6rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
          <div
            style={{
              width: "4.4rem",
              height: "4.4rem",
              borderRadius: "1rem",
              background: "var(--primaryLight)",
              color: "var(--primaryDark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              style={{ width: "2.4rem", height: "2.4rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
          </div>
          <div>
            <h3
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "var(--dark)",
                margin: 0,
              }}
            >
              Solicitudes de Inscripción Recibidas
            </h3>
            <p
              style={{
                fontSize: "1.35rem",
                color: "var(--gray)",
                margin: "0.2rem 0 0 0",
              }}
            >
              Brigada Activa: <strong>{activeBrigada.nombre}</strong> (
              {activeBrigada.lugar})
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
          {pendientesCount > 0 ? (
            <span
              style={{
                background: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde68a",
                padding: "0.4rem 1.2rem",
                borderRadius: "2rem",
                fontSize: "1.25rem",
                fontWeight: 700,
              }}
            >
              ⚡ {pendientesCount} {pendientesCount === 1 ? "pendiente" : "pendientes"}
            </span>
          ) : (
            <span
              style={{
                background: "#dcfce7",
                color: "#166534",
                border: "1px solid #bbf7d0",
                padding: "0.4rem 1.2rem",
                borderRadius: "2rem",
                fontSize: "1.25rem",
                fontWeight: 600,
              }}
            >
              ✓ Al día
            </span>
          )}

          <Link
            href="/administracion/brigadas"
            style={{
              fontSize: "1.35rem",
              fontWeight: 600,
              color: "var(--primaryColor)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            Ver todas en Brigadas →
          </Link>
        </div>
      </div>

      {/* Lista / Tabla de solicitudes con acciones interactivas */}
      <SolicitudesWidgetClient
        initialSolicitudes={list}
        brigadaId={activeBrigada.id}
      />
    </div>
  );
}
