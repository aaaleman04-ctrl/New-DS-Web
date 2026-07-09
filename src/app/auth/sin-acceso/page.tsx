import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import styles from "@/styles/pages/auth.module.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function SinAccesoPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userUuid = user?.id || "tu-user-uuid";

  return (
    <>
      <Header />
      <main className={styles.authPage}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Sin acceso al panel</h1>
          <p className={styles.authSubtitle}>
            Tu cuenta inició sesión correctamente, pero aún no tiene un rol
            asignado o se encuentra inactiva. Un administrador debe agregarte en
            Supabase.
          </p>
          <p
            style={{
              fontSize: "1.3rem",
              color: "var(--gray)",
              marginBottom: "1rem",
              textAlign: "left",
            }}
          >
            Para asignar el rol de administrador principal a esta cuenta, puedes
            ejecutar el siguiente comando SQL en el SQL Editor de tu consola de
            Supabase:
          </p>
          <pre
            style={{
              fontSize: "1.2rem",
              background: "var(--bg-light)",
              padding: "1.2rem",
              borderRadius: "8px",
              overflowX: "auto",
              textAlign: "left",
              marginBottom: "2rem",
              fontFamily: "monospace",
              border: "1px solid var(--border-color)",
            }}
          >
            {`INSERT INTO public.perfiles (id, nombre_completo, rol, activo)
VALUES ('${userUuid}', 'Admin Sistema', 'admin', true)
ON CONFLICT (id) DO UPDATE 
SET rol = 'admin', activo = true;`}
          </pre>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/auth/login" className={styles.submitBtn}>
              Volver al login
            </Link>
            <Link href="/" style={{ alignSelf: "center", fontSize: "1.4rem" }}>
              Ir al sitio público
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
