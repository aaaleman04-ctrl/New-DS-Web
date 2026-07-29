import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { PacientesClient } from "./PacientesClient";

export default async function PacientesPage() {
  await requirePermission(PERMISSIONS.PACIENTES_READ);

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Atención de Pacientes</h1>
        <p className="text-muted-foreground mt-2">
          Expediente digital y registro de atenciones durante las brigadas.
        </p>
      </div>

      <PacientesClient />
    </div>
  );
}
