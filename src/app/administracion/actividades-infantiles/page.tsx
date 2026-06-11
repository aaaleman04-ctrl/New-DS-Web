import ModulePlaceholder from "../components/ModulePlaceholder";
import { requireRouteAccess } from "@/lib/auth/session";

export default async function ActividadesInfantilesPage() {
  await requireRouteAccess("/administracion/actividades-infantiles");

  return (
    <ModulePlaceholder
      title="Actividades Infantiles"
      description="Organización y registro de actividades recreativas y educativas para niños."
    />
  );
}
