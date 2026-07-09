import { requireRouteAccess, getAuthContext } from "@/lib/auth/session";
import { VentasClient } from "./VentasClient";

export default async function VentasPage() {
  await requireRouteAccess("/administracion/ventas");
  const ctx = await getAuthContext();

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ventas de Apoyo</h1>
        <p className="text-muted-foreground mt-2">
          Gestión de inventario de recaudación, registro de ventas internas y estadísticas de ingresos.
        </p>
      </div>

      <VentasClient userId={ctx?.user.id || ""} />
    </div>
  );
}
