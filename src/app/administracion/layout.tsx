import SideBar from "./components/SideBar";
import styles from "@/styles/pages/admin.module.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata = {
  title: "Dashboard | Dibujando Sonrisas",
  description: "Panel de control para gestionar Dibujando Sonrisas.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className={styles.adminLayout}>
      <SideBar />
      
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>Administración</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--gray)", fontSize: "1.4rem" }}>
            <span>{user?.email}</span>
            <div style={{ width: "3.2rem", height: "3.2rem", borderRadius: "50%", backgroundColor: "var(--primaryLight)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primaryColor)", fontWeight: "bold" }}>
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </header>
        
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}
