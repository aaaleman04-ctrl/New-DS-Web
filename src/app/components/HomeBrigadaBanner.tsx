"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Brigada } from "@/lib/db/brigadas";
import CountdownCard from "@/app/administracion/brigadas/components/CountdownCard";
import InscripcionModal from "@/app/components/InscripcionModal";
import styles from "@/styles/components/home-brigada-banner.module.css";

export type CuposInfo = {
  total: number | null;
  registrados: number;
  cupoLleno: boolean;
  disponibles: number | null;
};

type HomeBrigadaBannerProps = {
  brigada: Brigada;
  cuposInfo?: CuposInfo;
};

export default function HomeBrigadaBanner({
  brigada,
  cuposInfo,
}: HomeBrigadaBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "Fecha por confirmar";
    const date = new Date(isoString);
    return date.toLocaleDateString("es-HN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isInscripcionesAbiertas = brigada.estado === "inscripciones_abiertas";
  const isCupoLleno = cuposInfo?.cupoLleno || false;
  const canRegister = isInscripcionesAbiertas && !isCupoLleno;

  return (
    <>
      <section
        className={styles.bannerContainer}
        aria-label="Información de la próxima brigada médica"
      >
        <div className={styles.bannerCard}>
          <div className={styles.decorCircle1} aria-hidden="true" />
          <div className={styles.decorCircle2} aria-hidden="true" />

          {/* Tags */}
          <div className={styles.tagRow}>
            <span className={styles.statusTag}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ verticalAlign: "middle", marginRight: "6px" }}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Próxima Brigada Médica
            </span>

            {isInscripcionesAbiertas && !isCupoLleno && (
              <span className={styles.cupoTag}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ verticalAlign: "middle", marginRight: "6px" }}
                  aria-hidden="true"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Inscripciones Abiertas
                {cuposInfo?.disponibles !== null && cuposInfo?.disponibles !== undefined && (
                  <> ({cuposInfo.disponibles} cupos disponibles)</>
                )}
              </span>
            )}

            {isCupoLleno && (
              <span className={styles.cupoFullTag}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ verticalAlign: "middle", marginRight: "6px" }}
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Cupos de Voluntariado Llenos
              </span>
            )}

            {brigada.estado === "inscripciones_cerradas" && (
              <span className={styles.statusTag}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ verticalAlign: "middle", marginRight: "6px" }}
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Inscripciones Cerradas
              </span>
            )}
          </div>

          {/* Título */}
          <h2 className={styles.title}>{brigada.nombre}</h2>

          {/* Metadatos */}
          <div className={styles.metaInfo}>
            <p className={styles.metaItem}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <strong>
                {brigada.lugar || "Comunidad por definir"}
                {brigada.municipio ? `, ${brigada.municipio}` : ""}
              </strong>
            </p>
            <p className={styles.metaItem}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{formatDate(brigada.fecha_brigada)}</span>
            </p>
          </div>

          {/* Countdown */}
          {brigada.fecha_brigada && (
            <div className={styles.countdownSection}>
              <p className={styles.countdownLabel}>Tiempo restante para el inicio</p>
              <CountdownCard targetDateStr={brigada.fecha_brigada} />
            </div>
          )}

          {/* Descripción */}
          {brigada.descripcion && (
            <p className={styles.description}>&ldquo;{brigada.descripcion}&rdquo;</p>
          )}

          {/* Botones de Acción */}
          <div className={styles.ctaRow}>
            {canRegister ? (
              <button
                type="button"
                className={styles.btnActionPrimary}
                onClick={() => setIsModalOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Inscribirme como Voluntario
              </button>
            ) : isCupoLleno ? (
              <span
                className={styles.btnActionPrimary}
                style={{ opacity: 0.85, cursor: "default", background: "#f1f5f9", color: "#64748b" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Cupo Lleno para esta Brigada
              </span>
            ) : (
              <Link href="/voluntariado" className={styles.btnActionPrimary}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Información de Voluntariado
              </Link>
            )}

            <Link href="/brigadas" className={styles.btnActionSecondary}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Ver Historial de Brigadas
            </Link>
          </div>
        </div>
      </section>

      {/* Modal de Inscripción */}
      <InscripcionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brigada={brigada}
      />
    </>
  );
}
