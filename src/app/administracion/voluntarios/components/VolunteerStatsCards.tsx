"use client";

import styles from "@/styles/pages/admin.module.css";
import type { VoluntarioRow } from "./VoluntariosTable";
import { useMemo } from "react";

type VolunteerStatsCardsProps = {
  voluntarios: VoluntarioRow[];
};

export default function VolunteerStatsCards({ voluntarios }: VolunteerStatsCardsProps) {
  const stats = useMemo(() => {
    const total = voluntarios.length;
    const activos = voluntarios.filter(v => v.activo).length;
    
    // Contar participaciones totales
    let participaciones = 0;
    const especialidadesSet = new Set();
    
    voluntarios.forEach(v => {
      participaciones += (v.participaciones_voluntarios?.length || 0);
      if (v.especialidades) {
        especialidadesSet.add(v.especialidades.id);
      }
    });

    return {
      total,
      activos,
      especialidades: especialidadesSet.size,
      participaciones
    };
  }, [voluntarios]);

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statHeader}>
          <h3>Total Voluntarios</h3>
        </div>
        <p className={styles.statValue}>{stats.total}</p>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statHeader}>
          <h3>Voluntarios Activos</h3>
        </div>
        <p className={styles.statValue} style={{ color: "var(--green-dark, #059669)" }}>{stats.activos}</p>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statHeader}>
          <h3>Especialidades</h3>
        </div>
        <p className={styles.statValue}>{stats.especialidades}</p>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statHeader}>
          <h3>Participaciones Totales</h3>
        </div>
        <p className={styles.statValue} style={{ color: "var(--primary)" }}>{stats.participaciones}</p>
      </div>
    </div>
  );
}
