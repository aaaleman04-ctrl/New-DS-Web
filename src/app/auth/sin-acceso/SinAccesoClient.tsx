"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import styles from "@/styles/pages/auth.module.css";

export default function SinAccesoClient({
  userName,
  userEmail,
}: {
  userName?: string;
  userEmail?: string;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  const handleRefresh = () => {
    setIsChecking(true);
    // Redirigir a /administracion para que el Proxy/Guard evalúe el rol actualizado
    router.push("/administracion");
  };

  return (
    <main className={styles.authPage}>
      <div className={styles.authCard} style={{ maxWidth: "56rem", textAlign: "center" }}>
        <div className={styles.authHeader}>
          <div
            className={styles.authIcon}
            style={{
              background: "#e0f2fe",
              color: "#0284c7",
              width: "7.2rem",
              height: "7.2rem",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              style={{ width: "3.6rem", height: "3.6rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <h1 className={styles.authTitle}>Cuenta Pendiente de Permisos</h1>
          {userName && (
            <p style={{ fontSize: "1.4rem", color: "var(--primaryDark)", fontWeight: 600, marginBottom: "0.8rem" }}>
              Hola, {userName} ({userEmail})
            </p>
          )}
        </div>

        <div
          style={{
            background: "var(--bg-light)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "2rem",
            marginBottom: "2.4rem",
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: "1.5rem",
              color: "var(--dark)",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            Tu cuenta ha sido registrada exitosamente. Un administrador te asignará los permisos correspondientes pronto para que puedas acceder a los módulos del sistema.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleRefresh}
            disabled={isChecking}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.8rem",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              style={{ width: "1.8rem", height: "1.8rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            {isChecking ? "Recomprobando permisos..." : "Recomprobar estado de mi rol"}
          </button>

          <form action={logoutAction} style={{ width: "100%" }}>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "1.2rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                background: "var(--white)",
                color: "var(--dark)",
                fontSize: "1.4rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
