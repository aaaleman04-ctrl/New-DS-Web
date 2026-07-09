import { requireRouteAccess, getAuthContext } from "@/lib/auth/session";
import { FarmaciaClient } from "./FarmaciaClient";

export default async function FarmaciaPage() {
  await requireRouteAccess("/administracion/farmacia");
  const ctx = await getAuthContext();

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Farmacia y Entregas</h1>
        <p className="text-muted-foreground mt-2">
          Gestión de recetas pendientes y entregas de medicamentos a pacientes.
        </p>
      </div>

      <FarmaciaClient userId={ctx?.user.id || ""} />
    </div>
  );
}
