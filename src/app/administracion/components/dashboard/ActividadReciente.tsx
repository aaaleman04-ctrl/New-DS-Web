import styles from "@/styles/pages/admin.module.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function ActividadReciente() {
  const supabase = await createSupabaseServerClient();
  const { data: actividad } = await supabase
    .from("v_actividad_reciente")
    .select("*");

  return (
    <div
      className={styles.statCard}
      style={{
        background: "#ffffff",
        gridColumn: "span 1",
        borderRadius: "1.8rem",
        border: "1px solid #f1f5f9",
        padding: "2.4rem 2.8rem",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "1.4rem",
          marginBottom: "1.6rem",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "var(--dark)",
            fontSize: "1.7rem",
            fontWeight: 700,
            fontFamily: "var(--fontMain)",
            letterSpacing: "-0.01em",
          }}
        >
          Actividad Reciente
        </h3>
      </div>

      {!actividad || actividad.length === 0 ? (
        <div style={{ padding: "3rem 1.6rem", textAlign: "center", color: "#64748b" }}>
          <p style={{ fontSize: "1.4rem", margin: 0 }}>No hay actividad reciente registrada.</p>
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1.4rem",
          }}
        >
          {actividad.map((act: any, i: number) => {
            const date = new Date(act.created_at);
            return (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: "1.2rem",
                  alignItems: "flex-start",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "1rem",
                    height: "1rem",
                    borderRadius: "50%",
                    background: "var(--primaryColor)",
                    marginTop: "0.5rem",
                    flexShrink: 0,
                    boxShadow: "0 0 0 3px rgba(10, 140, 136, 0.15)",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: "1.35rem",
                      color: "var(--dark)",
                    }}
                  >
                    {act.tipo}
                  </p>
                  <p
                    style={{
                      margin: "0.2rem 0 0 0",
                      color: "#64748b",
                      fontSize: "1.25rem",
                    }}
                  >
                    {act.descripcion}
                  </p>
                  <span
                    style={{
                      fontSize: "1.15rem",
                      color: "#94a3b8",
                      display: "block",
                      marginTop: "0.3rem",
                      fontWeight: 500,
                    }}
                  >
                    {date.toLocaleDateString("es-HN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
