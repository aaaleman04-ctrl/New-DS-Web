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
      <div className={styles.statCard} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", gridColumn: "1 / -1" }}>
        <h3 style={{ margin: 0, color: "var(--gray)", fontSize: "1.4rem" }}>Próxima Brigada</h3>
        <p style={{ fontSize: "1.6rem", fontWeight: "bold", margin: "1rem 0" }}>No hay brigadas programadas.</p>
      </div>
    );
  }

  const dias = brigada.dias_faltantes || 0;
  let countdownText = `Faltan ${dias} días`;
  if (dias === 0) countdownText = "¡Es hoy!";
  if (dias < 0) countdownText = "En curso / Pendiente de cierre";

  return (
    <div className={styles.statCard} style={{ background: "linear-gradient(135deg, var(--primaryColor) 0%, var(--primaryDark) 100%)", color: "white", border: "none", gridColumn: "1 / -1" }}>
      <h3 style={{ margin: 0, color: "rgba(255,255,255,0.9)", fontSize: "1.4rem", textTransform: "uppercase", letterSpacing: "1px" }}>Próxima Brigada</h3>
      <h2 style={{ fontSize: "2.8rem", margin: "0.5rem 0" }}>{brigada.nombre}</h2>
      <p style={{ fontSize: "1.6rem", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "2rem", height: "2rem" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        <span>{brigada.lugar}</span>
      </p>
      <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem 2rem", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "0.8rem" }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "2rem", height: "2rem" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <span style={{ fontSize: "1.8rem", fontWeight: "bold" }}>{countdownText}</span>
      </div>
    </div>
  );
}
