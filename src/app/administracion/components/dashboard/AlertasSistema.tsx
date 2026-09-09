import styles from "@/styles/pages/admin.module.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AlertasSistema() {
  const supabase = await createSupabaseServerClient();
  const { data: alertas } = await supabase
    .from("v_alertas_sistema")
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
          Alertas del Sistema
        </h3>
        <span
          style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            color: alertas && alertas.length > 0 ? "#b45309" : "#047857",
            backgroundColor: alertas && alertas.length > 0 ? "#fffbeb" : "#ecfdf5",
            border: `1px solid ${alertas && alertas.length > 0 ? "#fde68a" : "#a7f3d0"}`,
            padding: "0.25rem 0.8rem",
            borderRadius: "9999px",
          }}
        >
          {alertas?.length || 0} activas
        </span>
      </div>

      {!alertas || alertas.length === 0 ? (
        <div style={{ padding: "3rem 1.6rem", textAlign: "center", color: "#64748b" }}>
          <div
            style={{
              width: "4.8rem",
              height: "4.8rem",
              borderRadius: "1.2rem",
              backgroundColor: "#ecfdf5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.2rem auto",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              style={{ width: "2.4rem", height: "2.4rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <p style={{ fontSize: "1.45rem", fontWeight: 600, color: "var(--dark)", margin: 0 }}>
            Todo en orden
          </p>
          <p style={{ fontSize: "1.3rem", color: "#94a3b8", margin: "0.3rem 0 0 0" }}>
            No hay advertencias activas en inventario ni citas.
          </p>
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {alertas.map((alerta: any, i: number) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: "1.2rem",
                alignItems: "flex-start",
                background: "#f8fafc",
                border: "1px solid #f1f5f9",
                padding: "1.2rem 1.4rem",
                borderRadius: "1.2rem",
              }}
            >
              <div
                style={{
                  width: "3.2rem",
                  height: "3.2rem",
                  borderRadius: "0.8rem",
                  backgroundColor: "#fffbeb",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
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
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: "1.35rem",
                    color: "var(--dark)",
                  }}
                >
                  {alerta.mensaje}
                </p>
                <p
                  style={{
                    margin: "0.2rem 0 0 0",
                    color: "#64748b",
                    fontSize: "1.25rem",
                  }}
                >
                  {alerta.detalle}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
