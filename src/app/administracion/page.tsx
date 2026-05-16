import styles from "@/styles/pages/admin.module.css";

export default function DashboardPage() {
  return (
    <div>
      <div style={{ marginBottom: "2.4rem" }}>
        <h2 style={{ fontSize: "2rem", color: "var(--dark)", marginBottom: "0.4rem" }}>
          Resumen General
        </h2>
        <p style={{ color: "var(--gray)", fontSize: "1.5rem", margin: 0 }}>
          Aquí tienes un vistazo rápido al estado actual de las actividades.
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3>Voluntarios Activos</h3>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          <p className={styles.statValue}>142</p>
          <p className={`${styles.statChange} ${styles.positive}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: "1.6rem" }}>
              <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
            </svg>
            +12% desde el mes pasado
          </p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3>Brigadas Realizadas</h3>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <p className={styles.statValue}>24</p>
          <p className={`${styles.statChange} ${styles.positive}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: "1.6rem" }}>
              <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
            </svg>
            +3 este año
          </p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3>Nuevos Mensajes</h3>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <p className={styles.statValue}>8</p>
          <p className={`${styles.statChange} ${styles.neutral}`}>
            En la última semana
          </p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>Actividad Reciente</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Voluntario</strong></td>
                <td>Nuevo registro: Carlos Martínez</td>
                <td>Hoy, 10:45 AM</td>
                <td><span className={`${styles.badge} ${styles.badgeWarning}`}>Pendiente</span></td>
              </tr>
              <tr>
                <td><strong>Mensaje</strong></td>
                <td>Consulta sobre donaciones de medicamentos</td>
                <td>Ayer, 16:20 PM</td>
                <td><span className={`${styles.badge} ${styles.badgeWarning}`}>No leído</span></td>
              </tr>
              <tr>
                <td><strong>Brigada</strong></td>
                <td>Brigada Santa Lucía marcada como completada</td>
                <td>12 May, 2026</td>
                <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Completado</span></td>
              </tr>
              <tr>
                <td><strong>Voluntario</strong></td>
                <td>Aprobación de cuenta: Laura Torres</td>
                <td>11 May, 2026</td>
                <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Aprobado</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
