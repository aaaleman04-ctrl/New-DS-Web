import ModulePlaceholder from "../components/ModulePlaceholder";
import { requireRouteAccess } from "@/lib/auth/session";

export default async function VoluntariosPage() {
  await requireRouteAccess("/administracion/voluntarios");

  return (
    <ModulePlaceholder
      title="Gestión de Voluntarios"
      description="Revisa y administra las solicitudes de voluntariado recibidas desde la web."
    />
  );
}
