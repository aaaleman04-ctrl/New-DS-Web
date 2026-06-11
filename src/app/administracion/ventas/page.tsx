import ModulePlaceholder from "../components/ModulePlaceholder";
import { requireRouteAccess } from "@/lib/auth/session";

export default async function VentasPage() {
  await requireRouteAccess("/administracion/ventas");

  return (
    <ModulePlaceholder
      title="Ventas de Apoyo"
      description="Control de ventas de apoyo a la fundación y productos de recaudación."
    />
  );
}
