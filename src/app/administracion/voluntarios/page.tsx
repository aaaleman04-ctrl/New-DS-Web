import styles from "@/styles/pages/admin.module.css";

export default function VoluntariosPage() {
  return (
    <div>
      <div style={{ marginBottom: "2.4rem" }}>
        <h2 style={{ fontSize: "2rem", color: "var(--dark)", marginBottom: "0.4rem" }}>
          Directorio de Voluntarios
        </h2>
        <p style={{ color: "var(--gray)", fontSize: "1.5rem", margin: 0 }}>
          Administra la información de los voluntarios registrados en el sistema.
        </p>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>Listado de Voluntarios</h3>
          <button style={{ backgroundColor: "var(--primaryColor)", color: "white", border: "none", padding: "0.8rem 1.6rem", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 600 }}>
            Exportar a Excel
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Ciudad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Carlos Martínez</strong><br/><span style={{ fontSize: "1.2rem", color: "var(--gray)" }}>carlos.m@example.com</span></td>
                <td>Odontología</td>
                <td>Tegucigalpa</td>
                <td><span className={`${styles.badge} ${styles.badgeWarning}`}>Pendiente Revisión</span></td>
                <td><a href="#" style={{ color: "var(--primaryColor)", fontWeight: 600 }}>Revisar Perfil</a></td>
              </tr>
              <tr>
                <td><strong>Laura Torres</strong><br/><span style={{ fontSize: "1.2rem", color: "var(--gray)" }}>laura.t@example.com</span></td>
                <td>Medicina General</td>
                <td>San Pedro Sula</td>
                <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Activa</span></td>
                <td><a href="#" style={{ color: "var(--primaryColor)", fontWeight: 600 }}>Ver Perfil</a></td>
              </tr>
              <tr>
                <td><strong>Roberto Sánchez</strong><br/><span style={{ fontSize: "1.2rem", color: "var(--gray)" }}>roberto.s@example.com</span></td>
                <td>Logística y Apoyo</td>
                <td>Tegucigalpa</td>
                <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Activo</span></td>
                <td><a href="#" style={{ color: "var(--primaryColor)", fontWeight: 600 }}>Ver Perfil</a></td>
              </tr>
              <tr>
                <td><strong>María Fernanda L.</strong><br/><span style={{ fontSize: "1.2rem", color: "var(--gray)" }}>maria.l@example.com</span></td>
                <td>Enfermería</td>
                <td>Comayagua</td>
                <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Activa</span></td>
                <td><a href="#" style={{ color: "var(--primaryColor)", fontWeight: 600 }}>Ver Perfil</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
