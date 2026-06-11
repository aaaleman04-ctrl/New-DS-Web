import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { isAppRole, ROLE_LABELS, type AppRole } from "@/lib/auth/roles";
import styles from "@/styles/pages/admin.module.css";
import UsuariosAdminClient from "./UsuariosAdminClient";

export type UserRoleRow = {
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
};

export default async function UsuariosPage() {
  await requirePermission(PERMISSIONS.USERS_MANAGE);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id, role, created_at, updated_at")
    .order("created_at", { ascending: false });

  const rows: UserRoleRow[] = (data ?? []).filter(
    (row): row is UserRoleRow => isAppRole(row.role)
  );

  return (
    <div>
      <div className={styles.pageIntro}>
        <h2>Login y Usuarios</h2>
        <p>
          Asigna roles a usuarios de Supabase Auth. Cada usuario debe tener
          exactamente un rol: admin, staff, medico u odontologo.
        </p>
      </div>

      <UsuariosAdminClient rows={rows} fetchError={error?.message ?? null} />
    </div>
  );
}
