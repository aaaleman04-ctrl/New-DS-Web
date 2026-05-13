"use client";

import { useState, FormEvent } from "react";
import { insertVoluntario } from "../../lib/db/voluntarios";
import styles from "../../styles/pages/volunteer.module.css";

export default function VolunteerForm() {
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
      rol: (form.elements.namedItem("rol") as HTMLInputElement).value.trim(),
      telefono: (
        form.elements.namedItem("telefono") as HTMLInputElement
      ).value.trim(),
      mensaje:
        (
          form.elements.namedItem("mensaje") as HTMLTextAreaElement
        ).value.trim() || null,
    };

    const { error: sbError } = await insertVoluntario(data);

    if (sbError) {
      console.error("Error Supabase:", sbError);
      setError(
        "Hubo un error al enviar tu solicitud. Por favor intenta de nuevo."
      );
      setLoading(false);
    } else {
      setSuccess(true);
      form.reset();
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.form}>
        <p className={styles.successMsg}>
          ✅ ¡Solicitud enviada correctamente! Nos pondremos en contacto contigo
          pronto.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} id="formulario" onSubmit={handleSubmit}>
      <fieldset style={{ border: "none", padding: 0 }}>
        <div className={styles.formGrid}>
          <div className={styles.campo}>
            <label htmlFor="nombre">Nombre</label>
            <input
              className={styles.input}
              id="nombre"
              name="nombre"
              type="text"
              placeholder="María"
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
              placeholder="García"
              required
            />
          </div>

          <div className={styles.campo}>
            <label htmlFor="rol">Rol de Interés</label>
            <input
              className={styles.input}
              id="rol"
              name="rol"
              type="text"
              placeholder="Médico / Odontólogo / Logística..."
              required
            />
          </div>

          <div className={styles.campo}>
            <label htmlFor="telefono">Número de Teléfono</label>
            <input
              className={styles.input}
              id="telefono"
              name="telefono"
              type="tel"
              placeholder="+504 9999-9999"
              required
            />
          </div>

          <div className={styles.campoFull}>
            <label htmlFor="mensaje">Mensaje (Opcional)</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              id="mensaje"
              name="mensaje"
              placeholder="Cuéntanos un poco de ti y por qué quieres ser voluntario..."
              rows={4}
            />
          </div>
        </div>

        {error && (
          <p style={{ color: "red", fontSize: "1.4rem", marginTop: "1rem" }}>
            {error}
          </p>
        )}

        <div className={styles.submitRow}>
          <button
            className={styles.submitBtn}
            type="submit"
            id="btnVoluntario"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Solicitud"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
