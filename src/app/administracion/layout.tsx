import SideBar from "./components/SideBar";
import { PermissionsProvider } from "./components/PermissionsProvider";
import styles from "@/styles/pages/admin.module.css";
import { getAuthContext } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard | Dibujando Sonrisas",
  description: "Panel de control para gestionar Dibujando Sonrisas.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAuthContext();

  if (!ctx) {
    redirect("/auth/sin-acceso");
  }

  return (
    <PermissionsProvider role={ctx.role}>
      <div className={styles.adminLayout}>
        <SideBar />

        <main className={styles.mainContent}>
          <header className={styles.topbar}>
            <h1 className={styles.pageTitle}>Administración</h1>
            <div className={styles.topbarUser}>
              <div className={styles.topbarUserInfo}>
                <span>{ctx.user.email}</span>
                <span className={styles.roleBadge}>{ROLE_LABELS[ctx.role]}</span>
              </div>
              <div className={styles.topbarAvatar}>
                {ctx.user.email?.charAt(0).toUpperCase() || "A"}
              </div>
            </div>
          </header>

          <div className={styles.contentArea}>{children}</div>
        </main>
      </div>
    </PermissionsProvider>
  );
}
