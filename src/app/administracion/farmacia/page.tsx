import ModulePlaceholder from "../components/ModulePlaceholder";
import { requireRouteAccess } from "@/lib/auth/session";

export default async function FarmaciaPage() {
  await requireRouteAccess("/administracion/farmacia");

  return (
    <ModulePlaceholder
      title="Farmacia"
      description="Gestión de medicamentos dispensados y existencias de farmacia."
    />
  );
}
