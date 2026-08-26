"use client";

import { useState, FormEvent } from "react";
import { insertContacto } from "../../lib/db/contacto";
import styles from "../../styles/pages/contact.module.css";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      nombre: (
        form.elements.namedItem("nombre") as HTMLInputElement
      ).value.trim(),
      apellido: (
        form.elements.namedItem("apellido") as HTMLInputElement
      ).value.trim(),
      email: (
        form.elements.namedItem("email") as HTMLInputElement
      ).value.trim(),
      telefono:
        (
          form.elements.namedItem("telefono") as HTMLInputElement
        ).value.trim() || null,
      asunto: (
        form.elements.namedItem("asunto") as HTMLInputElement
      ).value.trim(),
      mensaje: (
        form.elements.namedItem("mensaje") as HTMLTextAreaElement
      ).value.trim(),
    };

    const { error: sbError } = await insertContacto(data);

    if (sbError) {
      console.error("Error Supabase:", sbError);
      setError(
        "Hubo un error al enviar tu mensaje. Por favor intenta de nuevo."
      );
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "#dcfce7", color: "#166534", padding: "1.6rem 2rem", borderRadius: "var(--radius-sm)", border: "1px solid #bbf7d0" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          ¡Mensaje enviado correctamente! Te responderemos pronto.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        <div className={styles.campo}>
          <label htmlFor="nombre">Nombre</label>
          <input
            className={styles.input}
            id="nombre"
            name="nombre"
            type="text"
            placeholder="Tu nombre"
            required
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="apellido">Apellido</label>
          <input
            className={styles.input}
            id="apellido"
            name="apellido"
            type="text"
            placeholder="Tu apellido"
            required
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="email">Correo Electrónico</label>
          <input
            className={styles.input}
            id="email"
            name="email"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            required
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="telefono">Teléfono (Opcional)</label>
          <input
            className={styles.input}
            id="telefono"
            name="telefono"
            type="tel"
            placeholder="+504 9999-9999"
          />
        </div>

        <div className={styles.campoFull}>
          <label htmlFor="asunto">Asunto</label>
          <input
            className={styles.input}
            id="asunto"
            name="asunto"
            type="text"
            placeholder="¿En qué podemos ayudarte?"
            required
          />
        </div>

        <div className={styles.campoFull}>
          <label htmlFor="mensaje">Mensaje</label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            id="mensaje"
            name="mensaje"
            placeholder="Escribe tu mensaje aquí..."
            rows={5}
            required
          />
        </div>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.submitRow}>
        <button
          className={styles.submitBtn}
          type="submit"
          id="btnContacto"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar Mensaje →"}
        </button>
      </div>
    </form>
  );
}
