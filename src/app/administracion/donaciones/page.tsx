import ModulePlaceholder from "../components/ModulePlaceholder";
import { requireRouteAccess } from "@/lib/auth/session";

export default async function DonacionesPage() {
  await requireRouteAccess("/administracion/donaciones");

  return (
    <ModulePlaceholder
      title="Donaciones y Ropa"
      description="Registro de donaciones recibidas, ropa y artículos de apoyo comunitario."
    />
  );
}
