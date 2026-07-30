import { requireRouteAccess } from "@/lib/auth/session";
import ReportesClient from "./ReportesClient";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  await requireRouteAccess("/administracion/reportes");

  return <ReportesClient />;
}
