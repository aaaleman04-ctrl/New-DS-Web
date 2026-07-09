"use client";

import React from "react";
import type { Brigada } from "@/lib/db/brigadas";
import CountdownCard from "./CountdownCard";

type PublicBrigadaBannerProps = {
  brigada: Brigada;
};

export default function PublicBrigadaBanner({ brigada }: PublicBrigadaBannerProps) {
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "Próximamente";
    const date = new Date(isoString);
    return date.toLocaleDateString("es-HN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const bannerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)",
    borderRadius: "16px",
    padding: "3.2rem",
    color: "#fff",
    boxShadow: "0 10px 30px rgba(30, 64, 175, 0.25)",
    marginBottom: "4rem",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    alignItems: "center",
    maxWidth: "800px",
    width: "100%",
    marginLeft: "auto",
    marginRight: "auto",
  };

  return (
    <div style={bannerStyle}>
      <div>
        <span
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            background: "rgba(255, 255, 255, 0.2)",
            padding: "0.4rem 1.2rem",
            borderRadius: "50px",
            color: "#fff",
            display: "inline-block",
            marginBottom: "1rem",
          }}
        >
          🚨 Próxima Brigada Activa
        </span>
        <h2
          style={{
            fontSize: "2.8rem",
            fontWeight: "bold",
            lineHeight: "1.2",
            margin: "0.6rem 0",
          }}
        >
          {brigada.nombre}
        </h2>
        <p
          style={{
            fontSize: "1.6rem",
            color: "rgba(255, 255, 255, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.8rem",
            marginTop: "1rem",
          }}
        >
          📍 Comunidad: <strong>{brigada.lugar || "Por confirmar"}</strong>
        </p>
        <p
          style={{
            fontSize: "1.4rem",
            color: "rgba(255, 255, 255, 0.8)",
            marginTop: "0.6rem",
          }}
        >
          📅 Fecha: {formatDate(brigada.fecha_brigada)}
        </p>
      </div>

      {brigada.fecha_brigada && (
        <div style={{ width: "100%", maxWidth: "450px" }}>
          <p
            style={{
              fontSize: "1.3rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "rgba(255,255,255,0.75)",
              marginBottom: "1rem",
              fontWeight: "bold",
            }}
          >
            Tiempo restante para iniciar
          </p>
          <CountdownCard targetDateStr={brigada.fecha_brigada} />
        </div>
      )}

      {brigada.descripcion && (
        <p
          style={{
            fontSize: "1.4rem",
            color: "rgba(255, 255, 255, 0.85)",
            maxWidth: "600px",
            lineHeight: "1.5",
            margin: "0.6rem 0",
            fontStyle: "italic",
          }}
        >
          &quot;{brigada.descripcion}&quot;
        </p>
      )}

      <div>
        <a
          href="#formulario"
          style={{
            background: "#fff",
            color: "var(--primary)",
            padding: "1.2rem 3rem",
            borderRadius: "50px",
            fontSize: "1.5rem",
            fontWeight: "bold",
            textDecoration: "none",
            display: "inline-block",
            boxShadow: "0 4px 15px rgba(255, 255, 255, 0.15)",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 255, 255, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 255, 255, 0.15)";
          }}
        >
          📋 Inscribirse como Voluntario
        </a>
      </div>
    </div>
  );
}
