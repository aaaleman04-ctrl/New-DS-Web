import styles from "@/styles/pages/admin.module.css";

export default function BrigadasPage() {
  return (
    <div>
      <div style={{ marginBottom: "2.4rem" }}>
        <h2 style={{ fontSize: "2rem", color: "var(--dark)", marginBottom: "0.4rem" }}>
          Gestión de Brigadas
        </h2>
        <p style={{ color: "var(--gray)", fontSize: "1.5rem", margin: 0 }}>
          Administra las brigadas médicas programadas y pasadas.
        </p>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>Listado de Brigadas</h3>
          <button style={{ backgroundColor: "var(--primaryColor)", color: "white", border: "none", padding: "0.8rem 1.6rem", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 600 }}>
            + Nueva Brigada
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Brigada de Salud Integral</strong></td>
                <td>25 May, 2026</td>
                <td>Comunidad El Carmelo</td>
                <td><span className={`${styles.badge} ${styles.badgeWarning}`}>Próxima</span></td>
                <td><a href="#" style={{ color: "var(--primaryColor)", fontWeight: 600 }}>Editar</a></td>
              </tr>
              <tr>
                <td><strong>Jornada Odontológica Infantil</strong></td>
                <td>12 May, 2026</td>
                <td>Escuela San José</td>
                <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Completada</span></td>
                <td><a href="#" style={{ color: "var(--primaryColor)", fontWeight: 600 }}>Ver Detalles</a></td>
              </tr>
              <tr>
                <td><strong>Brigada de Especialidades</strong></td>
                <td>05 Abr, 2026</td>
                <td>Centro de Salud La Paz</td>
                <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Completada</span></td>
                <td><a href="#" style={{ color: "var(--primaryColor)", fontWeight: 600 }}>Ver Detalles</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
