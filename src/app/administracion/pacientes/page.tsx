import ModulePlaceholder from "../components/ModulePlaceholder";
import { requireRouteAccess } from "@/lib/auth/session";

export default async function PacientesPage() {
  await requireRouteAccess("/administracion/pacientes");

  return (
    <ModulePlaceholder
      title="Atención de Pacientes"
      description="Registro y seguimiento de pacientes atendidos en cada brigada."
    />
  );
}
