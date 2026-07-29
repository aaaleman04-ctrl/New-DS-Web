import styles from "@/styles/pages/admin.module.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function CountdownBrigada() {
  const supabase = await createSupabaseServerClient();
  const { data: brigada } = await supabase
    .from("dashboard_brigadas")
    .select("*")
    .maybeSingle();

  if (!brigada) {
    return (
      <div
        className={styles.statCard}
        style={{
          background: "var(--white)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "2.4rem",
          gridColumn: "1 / -1",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--text-light)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: "2.4rem", height: "2.4rem", color: "var(--primaryColor)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
          <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>Próxima Brigada Médica</h3>
        </div>
        <p style={{ fontSize: "1.6rem", fontWeight: 600, color: "var(--dark)", margin: "1.2rem 0 0 0" }}>
          No hay brigadas activas programadas en este momento.
        </p>
      </div>
    );
  }

  const dias = brigada.dias_faltantes || 0;
  let countdownText = `Faltan ${dias} días para la brigada`;
  if (dias === 0) countdownText = "¡La brigada médica es HOY!";
  if (dias < 0) countdownText = "Brigada en curso / Pendiente de cierre";

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
        color: "#ffffff",
        borderRadius: "var(--radius-lg)",
        padding: "2.8rem 3.2rem",
        gridColumn: "1 / -1",
        boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.3)",
        display: "flex",
        flexDirection: "column",
        gap: "1.6rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Círculo decorativo de fondo */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.06)",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <span
          style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: "rgba(255, 255, 255, 0.2)",
            padding: "0.4rem 1.2rem",
            borderRadius: "2rem",
            backdropFilter: "blur(4px)",
          }}
        >
          Próxima Brigada Médica
        </span>
      </div>

      <h2
        style={{
          fontFamily: "var(--fontHeading)",
          fontSize: "2.8rem",
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.2,
          color: "#ffffff",
          letterSpacing: "-0.01em",
        }}
      >
        {brigada.nombre}
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
        <p style={{ fontSize: "1.5rem", margin: 0, display: "flex", alignItems: "center", gap: "0.8rem", color: "rgba(255, 255, 255, 0.95)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "2rem", height: "2rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <span style={{ fontWeight: 600 }}>Comunidad: {brigada.lugar}</span>
        </p>
      </div>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.18)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "var(--radius-md)",
          padding: "1.2rem 2rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "1.2rem",
          width: "fit-content",
          backdropFilter: "blur(8px)",
          marginTop: "0.4rem",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" style={{ width: "2.2rem", height: "2.2rem", color: "#ffffff" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <span style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.01em" }}>
          {countdownText}
        </span>
      </div>
    </div>
  );
}
