import ModulePlaceholder from "../components/ModulePlaceholder";
import { requireRouteAccess } from "@/lib/auth/session";

export default async function ReportesPage() {
  await requireRouteAccess("/administracion/reportes");

  return (
    <ModulePlaceholder
      title="Reportes y Estadísticas"
      description="Resúmenes, gráficos y reportes de actividad de la fundación."
    />
  );
}
