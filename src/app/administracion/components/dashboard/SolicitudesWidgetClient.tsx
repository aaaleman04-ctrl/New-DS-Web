"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { aceptarInscripcion, rechazarInscripcion } from "@/app/administracion/brigadas/actions";
import styles from "@/styles/pages/admin.module.css";

export type SolicitudItem = {
  id: string;
  brigada_id: string;
  nombre_completo: string;
  correo: string;
  telefono: string | null;
  area_interes: string | null;
  profesion: string | null;
  comentarios: string | null;
  estado: "pendiente" | "aceptado" | "rechazado" | string | null;
  created_at: string | null;
};

type SolicitudesWidgetClientProps = {
  initialSolicitudes: SolicitudItem[];
  brigadaId: string;
};

export default function SolicitudesWidgetClient({
  initialSolicitudes,
}: SolicitudesWidgetClientProps) {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>(initialSolicitudes);
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = (id: string) => {
    setProcessingId(id);
    startTransition(async () => {
      // Optimistic update
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, estado: "aceptado" } : s))
      );

      const res = await aceptarInscripcion(id);
      if (res?.error) {
        alert(`Error al aceptar: ${res.error}`);
        router.refresh();
      }
      setProcessingId(null);
    });
  };

  const handleReject = (id: string) => {
    const confirm = window.confirm(
      "¿Estás seguro de que deseas rechazar esta solicitud de inscripción?"
    );
    if (!confirm) return;

    setProcessingId(id);
    startTransition(async () => {
      // Optimistic update
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, estado: "rechazado" } : s))
      );

      const res = await rechazarInscripcion(id);
      if (res?.error) {
        alert(`Error al rechazar: ${res.error}`);
        router.refresh();
      }
      setProcessingId(null);
    });
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return date.toLocaleDateString("es-HN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (solicitudes.length === 0) {
    return (
      <div
        style={{
          padding: "3rem 2rem",
          textAlign: "center",
          background: "var(--bg-light)",
          borderRadius: "var(--radius-md)",
          border: "1px dashed var(--border-color)",
        }}
      >
        <p style={{ margin: 0, color: "var(--gray)", fontSize: "1.45rem" }}>
          No hay solicitudes de voluntariado registradas aún para esta brigada.
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className={styles.adminTable} style={{ width: "100%", margin: 0 }}>
        <thead>
          <tr>
            <th>Voluntario</th>
            <th>Contacto</th>
            <th>Área de Interés</th>
            <th>Fecha Envío</th>
            <th>Estado</th>
            <th style={{ textAlign: "right" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((sol) => {
            const isItemPending = isPending && processingId === sol.id;
            const estadoStr = sol.estado || "pendiente";

            return (
              <tr key={sol.id}>
                <td>
                  <strong>{sol.nombre_completo}</strong>
                  {sol.profesion && (
                    <span
                      style={{
                        display: "block",
                        fontSize: "1.2rem",
                        color: "var(--gray)",
                      }}
                    >
                      {sol.profesion}
                    </span>
                  )}
                </td>
                <td>
                  <span style={{ display: "block", fontSize: "1.3rem" }}>
                    {sol.correo}
                  </span>
                  {sol.telefono && (
                    <span
                      style={{
                        display: "block",
                        fontSize: "1.2rem",
                        color: "var(--gray)",
                      }}
                    >
                      📞 {sol.telefono}
                    </span>
                  )}
                </td>
                <td>
                  <span
                    style={{
                      background: "var(--bg-light)",
                      padding: "0.3rem 0.8rem",
                      borderRadius: "0.6rem",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "var(--primaryDark)",
                      display: "inline-block",
                    }}
                  >
                    {sol.area_interes || "Sin área"}
                  </span>
                </td>
                <td style={{ fontSize: "1.25rem", color: "var(--gray)" }}>
                  {formatDate(sol.created_at)}
                </td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.3rem 1rem",
                      borderRadius: "1rem",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      textTransform: "capitalize",
                      backgroundColor:
                        estadoStr === "aceptado"
                          ? "#dcfce7"
                          : estadoStr === "rechazado"
                          ? "#fee2e2"
                          : "#fef3c7",
                      color:
                        estadoStr === "aceptado"
                          ? "#15803d"
                          : estadoStr === "rechazado"
                          ? "#b91c1c"
                          : "#b45309",
                    }}
                  >
                    {estadoStr}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  {estadoStr === "pendiente" ? (
                    <div
                      style={{
                        display: "inline-flex",
                        gap: "0.8rem",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleAccept(sol.id)}
                        disabled={isItemPending}
                        style={{
                          background: "#10b981",
                          color: "#fff",
                          border: "none",
                          borderRadius: "0.6rem",
                          padding: "0.5rem 1rem",
                          fontSize: "1.25rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "opacity 0.2s",
                        }}
                      >
                        ✓ Aceptar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(sol.id)}
                        disabled={isItemPending}
                        style={{
                          background: "transparent",
                          color: "#ef4444",
                          border: "1px solid #fca5a5",
                          borderRadius: "0.6rem",
                          padding: "0.5rem 0.9rem",
                          fontSize: "1.25rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        ✕ Rechazar
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: "1.2rem", color: "var(--gray)" }}>
                      Revisado
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
