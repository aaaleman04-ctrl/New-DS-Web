import { requireRouteAccess, getAuthContext } from "@/lib/auth/session";
import { ActividadesClient } from "./ActividadesClient";

export default async function ActividadesPage() {
  await requireRouteAccess("/administracion/actividades-infantiles");
  const ctx = await getAuthContext();

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Actividades Infantiles</h1>
        <p className="text-muted-foreground mt-2">
          Gestión de actividades, entrega de regalos y control de niños beneficiados.
        </p>
      </div>

      <ActividadesClient userId={ctx?.user.id || ""} />
    </div>
  );
}
