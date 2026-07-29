"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction } from "@/app/auth/actions";
import styles from "@/styles/pages/auth.module.css";

export default function RegistroForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, null);

  return (
    <main className={styles.authPage}>
      <div className={styles.authCard}>
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
                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
              />
            </svg>
          </div>
          <h1 className={styles.authTitle}>Crear Cuenta</h1>
          <p className={styles.authSubtitle}>
            Completa tus datos para registrarte en el portal de la fundación.
          </p>
        </div>

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

        <form className={styles.authForm} action={formAction} noValidate>
          {/* Nombre Completo */}
          <div className={styles.fieldGroup}>
            <label htmlFor="fullName" className={styles.fieldLabel}>
              Nombre completo <strong style={{ color: "#e74c3c" }}>*</strong>
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
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Ej. María Josefa Rodríguez"
                className={styles.fieldInput}
                required
                disabled={isPending}
              />
            </div>
          </div>

          {/* Correo Electrónico */}
          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.fieldLabel}>
              Correo electrónico <strong style={{ color: "#e74c3c" }}>*</strong>
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
              Contraseña <strong style={{ color: "#e74c3c" }}>*</strong>
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
                placeholder="Mínimo 8 caracteres"
                className={styles.fieldInput}
                required
                disabled={isPending}
              />
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div className={styles.fieldGroup}>
            <label htmlFor="confirmPassword" className={styles.fieldLabel}>
              Confirmar contraseña <strong style={{ color: "#e74c3c" }}>*</strong>
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
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0 1 12 2.714Z"
                  />
                </svg>
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                className={styles.fieldInput}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isPending}
          >
            {isPending ? "Registrando cuenta..." : "Crear mi cuenta"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <span style={{ fontSize: "1.4rem", color: "var(--text-light)" }}>
              ¿Ya tienes una cuenta?{" "}
            </span>
            <Link
              href="/auth/login"
              style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "var(--primaryColor)",
              }}
            >
              Iniciar sesión aquí
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
