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
              🚨 Próxima Brigada Médica
            </span>

            {isInscripcionesAbiertas && !isCupoLleno && (
              <span className={styles.cupoTag}>
                ✨ Inscripciones Abiertas
                {cuposInfo?.disponibles !== null && cuposInfo?.disponibles !== undefined && (
                  <> ({cuposInfo.disponibles} cupos disponibles)</>
                )}
              </span>
            )}

            {isCupoLleno && (
              <span className={styles.cupoFullTag}>
                ⚠️ Cupos de Voluntariado Llenos
              </span>
            )}

            {brigada.estado === "inscripciones_cerradas" && (
              <span className={styles.statusTag}>
                🔒 Inscripciones Cerradas
              </span>
            )}
          </div>

          {/* Título */}
          <h2 className={styles.title}>{brigada.nombre}</h2>

          {/* Metadatos */}
          <div className={styles.metaInfo}>
            <p className={styles.metaItem}>
              <span>📍</span>
              <strong>
                {brigada.lugar || "Comunidad por definir"}
                {brigada.municipio ? `, ${brigada.municipio}` : ""}
              </strong>
            </p>
            <p className={styles.metaItem}>
              <span>📅</span>
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
                🔒 Cupo Lleno para esta Brigada
              </span>
            ) : (
              <Link href="/voluntariado" className={styles.btnActionPrimary}>
                📋 Información de Voluntariado
              </Link>
            )}

            <Link href="/brigadas" className={styles.btnActionSecondary}>
              📖 Ver Historial de Brigadas
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
