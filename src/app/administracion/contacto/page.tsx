import styles from "@/styles/pages/admin.module.css";

export default function ContactoPage() {
  return (
    <div>
      <div style={{ marginBottom: "2.4rem" }}>
        <h2
          style={{
            fontSize: "2rem",
            color: "var(--dark)",
            marginBottom: "0.4rem",
          }}
        >
          Mensajes de Contacto
        </h2>
        <p style={{ color: "var(--gray)", fontSize: "1.5rem", margin: 0 }}>
          Revisa y responde los mensajes enviados a través de la página web.
        </p>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>Bandeja de Entrada</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Remitente</th>
                <th>Asunto / Mensaje Corto</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Ana Garc&iacute;a</strong>
                  <br />
                  <span style={{ fontSize: "1.2rem", color: "var(--gray)" }}>
                    ana@example.com
                  </span>
                </td>
                <td>
                  Duda sobre donaciones
                  <br />
                  <span style={{ fontSize: "1.3rem", color: "var(--gray)" }}>
                    Hola, me gustaría saber si aceptan...
                  </span>
                </td>
                <td>Hoy, 10:45 AM</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeWarning}`}>
                    No leído
                  </span>
                </td>
                <td>
                  <a
                    href="#"
                    style={{ color: "var(--primaryColor)", fontWeight: 600 }}
                  >
                    Leer
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Empresa XYZ</strong>
                  <br />
                  <span style={{ fontSize: "1.2rem", color: "var(--gray)" }}>
                    contacto@xyz.com
                  </span>
                </td>
                <td>
                  Propuesta de patrocinio
                  <br />
                  <span style={{ fontSize: "1.3rem", color: "var(--gray)" }}>
                    Nos interesa colaborar con su causa...
                  </span>
                </td>
                <td>Ayer, 16:20 PM</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                    Leído
                  </span>
                </td>
                <td>
                  <a
                    href="#"
                    style={{ color: "var(--primaryColor)", fontWeight: 600 }}
                  >
                    Ver
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Juan Pérez</strong>
                  <br />
                  <span style={{ fontSize: "1.2rem", color: "var(--gray)" }}>
                    juan@example.com
                  </span>
                </td>
                <td>
                  Problemas con formulario
                  <br />
                  <span style={{ fontSize: "1.3rem", color: "var(--gray)" }}>
                    Intento registrarme pero me da un error...
                  </span>
                </td>
                <td>13 May, 2026</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                    Leído
                  </span>
                </td>
                <td>
                  <a
                    href="#"
                    style={{ color: "var(--primaryColor)", fontWeight: 600 }}
                  >
                    Ver
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
