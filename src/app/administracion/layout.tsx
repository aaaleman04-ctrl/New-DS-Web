import SideBar from "./components/SideBar";
import { PermissionsProvider } from "./components/PermissionsProvider";
import styles from "@/styles/pages/admin.module.css";
import { getAuthContext } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import UserAvatar from "./components/UserAvatar";
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
  const ctx = await getAuthContext();

  if (!ctx) {
    redirect("/auth/sin-acceso");
  }

  let specialtyName: string | null = null;
  if (ctx.profile.especialidad_id) {
    const supabase = await createSupabaseServerClient();
    const { data: specialty } = await supabase
      .from("especialidades")
      .select("nombre")
      .eq("id", ctx.profile.especialidad_id)
      .maybeSingle();
    if (specialty?.nombre) {
      specialtyName = specialty.nombre;
    }
  }

  const displayName = ctx.profile.nombre_completo || ctx.user.email;

  return (
    <PermissionsProvider role={ctx.role} specialtyName={specialtyName}>
      <div className={styles.adminLayout}>
        <SideBar />

        <main className={styles.mainContent}>
          <header className={styles.topbar}>
            <h1 className={styles.pageTitle}>Administración</h1>
            <div className={styles.topbarUser}>
              <div className={styles.topbarUserInfo}>
                <span>{displayName}</span>
                <span className={styles.roleBadge}>
                  {ROLE_LABELS[ctx.role]}
                </span>
              </div>
              <UserAvatar
                avatarUrl={ctx.profile.avatar_url}
                nombres={ctx.profile.nombre_completo}
                email={ctx.user.email}
                size={36}
              />
            </div>
          </header>

          <div className={styles.contentArea}>{children}</div>
        </main>
      </div>
    </PermissionsProvider>
  );
}
