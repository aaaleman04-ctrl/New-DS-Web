import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import styles from "@/styles/pages/auth.module.css";

export default function SinAccesoPage() {
  return (
    <>
      <Header />
      <main className={styles.authPage}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Sin acceso al panel</h1>
          <p className={styles.authSubtitle}>
            Tu cuenta inició sesión correctamente, pero aún no tiene un rol
            asignado. Un administrador debe agregarte en Supabase.
          </p>
          <pre
            style={{
              fontSize: "1.2rem",
              background: "var(--bg-light)",
              padding: "1.2rem",
              borderRadius: "8px",
              overflowX: "auto",
            }}
          >
            {`INSERT INTO public.user_roles (user_id, role)
VALUES ('tu-user-uuid', 'admin');`}
          </pre>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/auth/login" className={styles.submitBtn}>
              Volver al login
            </Link>
            <Link href="/" style={{ alignSelf: "center" }}>
              Ir al sitio público
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
