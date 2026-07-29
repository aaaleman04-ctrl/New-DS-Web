import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import styles from "@/styles/pages/admin.module.css";
import EspecialidadesTable from "../components/EspecialidadesTable";

export default async function EspecialidadesPage() {
  await requirePermission(PERMISSIONS.VOLUNTARIADO_READ);

  const supabase = await createSupabaseServerClient();
  const { data: especialidades, error } = await supabase
    .from("especialidades")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    return (
      <div className={styles.pageIntro}>
        <h2>Gestión de Especialidades</h2>
        <div style={{ color: "red", marginTop: "1rem" }}>
          Error cargando especialidades: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageIntro}>
        <h2>Gestión de Especialidades</h2>
        <p>
          Administra el catálogo de especialidades que pueden ser asignadas a
          los voluntarios de la organización. Las especialidades no se pueden
          eliminar para preservar el historial, pero puedes desactivarlas.
        </p>
      </div>

      <EspecialidadesTable initialSpecialties={(especialidades as any) || []} />
    </div>
  );
}
