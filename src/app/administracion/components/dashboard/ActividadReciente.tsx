import styles from "@/styles/pages/admin.module.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function ActividadReciente() {
  const supabase = await createSupabaseServerClient();
  const { data: actividad } = await supabase
    .from("v_actividad_reciente")
    .select("*");

  return (
    <div className={styles.statCard} style={{ background: "var(--white)", gridColumn: "span 1" }}>
      <h3 style={{ margin: "0 0 1.6rem 0", color: "var(--dark)", fontSize: "1.6rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.8rem" }}>
        Actividad Reciente
      </h3>
      {(!actividad || actividad.length === 0) ? (
        <p style={{ color: "var(--gray)", fontSize: "1.4rem" }}>No hay actividad reciente.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {actividad.map((act: any, i: number) => {
            const date = new Date(act.created_at);
            return (
              <li key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primaryColor)", marginTop: "6px" }}></div>
                <div>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.3rem", color: "var(--dark)" }}>{act.tipo}</p>
                  <p style={{ margin: "0.2rem 0 0 0", color: "var(--gray)", fontSize: "1.2rem" }}>{act.descripcion}</p>
                  <span style={{ fontSize: "1.1rem", color: "var(--gray-light)", display: "block", marginTop: "0.2rem" }}>
                    {date.toLocaleDateString()} {date.toLocaleTimeString()}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
