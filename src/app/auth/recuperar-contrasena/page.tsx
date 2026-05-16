import Link from "next/link";
import styles from "../../../styles/pages/auth.module.css";

export const metadata = {
  title: "Recuperar Contraseña — Dibujando Sonrisas",
  description:
    "Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.",
};

export default function RecuperarContrasenaPage() {
  return (
    <main className={styles.authPage}>
      <div className={styles.authCard}>
        {/* ── Encabezado ── */}
        <div className={styles.authHeader}>
          <div className={styles.authIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <h1 className={styles.authTitle}>Recuperar Contraseña</h1>
          <p className={styles.authSubtitle}>
            Ingresa tu correo y te enviaremos un enlace para restablecer tu
            contraseña.
          </p>
        </div>

        {/* ── Formulario ── */}
        <form className={styles.authForm} noValidate>
          {/* Correo electrónico */}
          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.fieldLabel}>
              Correo electrónico
            </label>
            <div className={styles.fieldWrapper}>
              <span className={styles.fieldIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                className={styles.fieldInput}
              />
            </div>
          </div>

          {/* Botón submit */}
          <button type="submit" className={styles.submitBtn}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
            Enviar enlace de recuperación
          </button>
        </form>

        {/* ── Divider ── */}
        <div className={styles.divider}>o</div>

        {/* ── Footer ── */}
        <p className={styles.authFooter}>
          ¿Recordaste tu contraseña?{" "}
          <Link href="/auth/login">Iniciar Sesión</Link>
        </p>
      </div>
    </main>
  );
}
