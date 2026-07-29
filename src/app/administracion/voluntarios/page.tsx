import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import styles from "@/styles/pages/admin.module.css";
import { obtenerVoluntarios } from "./actions";
import VoluntariosTable from "./components/VoluntariosTable";
import VolunteerStatsCards from "./components/VolunteerStatsCards";
import Link from "next/link";

export default async function VoluntariosPage() {
  await requirePermission(PERMISSIONS.VOLUNTARIADO_READ);
  
  const voluntarios = await obtenerVoluntarios();

  return (
    <div>
      <div className={styles.pageIntro} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Gestión de Voluntarios</h2>
          <p>
            Listado general y métricas de todos los voluntarios registrados en Dibujando Sonrisas.
            Visualiza y administra sus participaciones y asignaciones en brigadas.
          </p>
        </div>
        <Link href="/administracion/voluntarios/especialidades">
          <button className={styles.btnSecondary}>
            Gestionar Especialidades
          </button>
        </Link>
      </div>

      <VolunteerStatsCards voluntarios={voluntarios as any[]} />
      
      <VoluntariosTable voluntarios={voluntarios as any[]} />
    </div>
  );
}
