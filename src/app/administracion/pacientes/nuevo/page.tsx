import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { NuevoExpedienteClient } from "./NuevoExpedienteClient";

export default async function NuevoExpedientePage() {
  await requirePermission(PERMISSIONS.PACIENTES_READ);

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Expediente</h1>
        <p className="text-muted-foreground mt-2">
          Digita el expediente físico llenado durante la brigada.
        </p>
      </div>

      <NuevoExpedienteClient />
    </div>
  );
}
