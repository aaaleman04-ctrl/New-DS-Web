"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/app/auth/actions";
import styles from "../../../styles/pages/auth.module.css";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

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
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <h1 className={styles.authTitle}>Iniciar Sesión</h1>
          <p className={styles.authSubtitle}>
            Bienvenido de vuelta. Ingresa tus credenciales para continuar.
          </p>
        </div>

        {/* ── Error global ── */}
        {state?.error && (
          <div className={styles.errorBanner} role="alert">
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
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            {state.error}
          </div>
        )}

        {/* ── Formulario ── */}
        <form className={styles.authForm} action={formAction} noValidate>
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
                required
                disabled={isPending}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className={styles.fieldGroup}>
            <label htmlFor="password" className={styles.fieldLabel}>
              Contraseña
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
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={styles.fieldInput}
                required
                disabled={isPending}
              />
            </div>
          </div>

          {/* Recordar & Olvidé contraseña */}
          <div className={styles.fieldRow}>
            <label className={styles.checkboxLabel}>
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className={styles.checkboxInput}
                disabled={isPending}
              />
              Recordar sesión
            </label>
            <Link
              href="/auth/recuperar-contrasena"
              className={styles.forgotLink}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Botón submit */}
          <button type="submit" className={styles.submitBtn} disabled={isPending}>
            {isPending ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Ingresando...
              </>
            ) : (
              <>
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
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                  />
                </svg>
                Ingresar
              </>
            )}
          </button>
        </form>

        {/* ── Divider ── */}
        <div className={styles.divider}>o</div>

        {/* ── Footer ── */}
        <p className={styles.authFooter}>
          ¿No tienes cuenta?{" "}
          <Link href="/contacto">Contáctanos</Link>
        </p>
      </div>
    </main>
  );
}
