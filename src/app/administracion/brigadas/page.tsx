import { getBrigadas } from "@/lib/db/brigadas";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import styles from "@/styles/pages/admin.module.css";
import BrigadasAdminClient from "./BrigadasAdminClient";

export default async function BrigadasPage() {
  await requirePermission(PERMISSIONS.BRIGADAS_READ);
  const supabase = await createSupabaseServerClient();
  const { data: brigadas, error } = await getBrigadas(supabase);

  return (
    <div>
      <div className={styles.pageIntro}>
        <h2>Gestión de Brigadas</h2>
        <p>
          Administra las brigadas médicas. Los cambios se reflejan en la página
          pública de brigadas.
        </p>
      </div>

      <BrigadasAdminClient brigadas={brigadas ?? []} fetchError={error} />
    </div>
  );
}
