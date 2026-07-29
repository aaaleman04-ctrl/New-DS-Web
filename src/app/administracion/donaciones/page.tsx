import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
// Client component for donations management
import { DonacionesClient } from "./DonacionesClient";

export default async function DonacionesPage() {
  const ctx = await requirePermission(PERMISSIONS.DONACIONES_READ);

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Donaciones y Ropa</h1>
        <p className="text-muted-foreground mt-2">
          Gestión de ropa recibida por donantes y entregada a pacientes en brigadas.
        </p>
      </div>

      <DonacionesClient userId={ctx?.user.id || ""} />
    </div>
  );
}
