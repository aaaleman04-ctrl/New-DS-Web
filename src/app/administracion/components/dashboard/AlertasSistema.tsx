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
          <span style={{ fontSize: "2.4rem", display: "block", marginBottom: "0.5rem" }}>✅</span>
          <p style={{ fontSize: "1.4rem", margin: 0 }}>Todo en orden.</p>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {alertas.map((alerta: any, i: number) => (
            <li key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", background: "var(--bg-secondary)", padding: "1rem", borderRadius: "8px" }}>
              <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>{alerta.icono}</span>
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
