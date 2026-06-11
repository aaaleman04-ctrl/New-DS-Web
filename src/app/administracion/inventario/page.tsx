import ModulePlaceholder from "../components/ModulePlaceholder";
import { requireRouteAccess } from "@/lib/auth/session";

export default async function InventarioPage() {
  await requireRouteAccess("/administracion/inventario");

  return (
    <ModulePlaceholder
      title="Inventario Médico"
      description="Control de insumos, medicamentos y materiales utilizados en las brigadas."
    />
  );
}
