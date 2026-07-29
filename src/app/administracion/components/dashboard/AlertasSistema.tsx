import styles from "@/styles/pages/admin.module.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AlertasSistema() {
  const supabase = await createSupabaseServerClient();
  const { data: alertas } = await supabase
    .from("v_alertas_sistema")
    .select("*");

  return (
    <div className={styles.statCard} style={{ background: "var(--white)", gridColumn: "span 1" }}>
      <h3 style={{ margin: "0 0 1.6rem 0", color: "var(--dark)", fontSize: "1.6rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.8rem" }}>
        Alertas del Sistema
      </h3>
      {(!alertas || alertas.length === 0) ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--gray)" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            style={{ width: "3.2rem", height: "3.2rem", color: "#16a34a", margin: "0 auto 0.8rem auto", display: "block" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p style={{ fontSize: "1.4rem", margin: 0 }}>Todo en orden.</p>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {alertas.map((alerta: any, i: number) => (
            <li key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", background: "var(--bg-secondary)", padding: "1rem", borderRadius: "8px" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                style={{ width: "2rem", height: "2rem", color: "#d97706", flexShrink: 0 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <div>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.3rem", color: "var(--dark)" }}>{alerta.mensaje}</p>
                <p style={{ margin: "0.2rem 0 0 0", color: "var(--gray)", fontSize: "1.2rem" }}>{alerta.detalle}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
