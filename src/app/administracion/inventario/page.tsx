import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { InventarioClient } from "./InventarioClient";

export default async function InventarioPage() {
  await requirePermission(PERMISSIONS.INVENTARIO_READ);

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventario Médico</h1>
        <p className="text-muted-foreground mt-2">
          Control de insumos, medicamentos y materiales utilizados en las brigadas.
        </p>
      </div>

      <InventarioClient />
    </div>
  );
}
