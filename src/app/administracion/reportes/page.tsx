import { requireAnyPermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import ReportesClient from "./ReportesClient";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  await requireAnyPermission([PERMISSIONS.REPORTES_READ, PERMISSIONS.REPORTES_PROCESS]);

  return <ReportesClient />;
}
