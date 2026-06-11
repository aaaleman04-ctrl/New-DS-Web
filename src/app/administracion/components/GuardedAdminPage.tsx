import { requireRouteAccess } from "@/lib/auth/session";

type GuardedAdminPageProps = {
  pathname: string;
  children: React.ReactNode;
};

/** Verifica permisos de ruta en el servidor antes de renderizar el módulo. */
export default async function GuardedAdminPage({
  pathname,
  children,
}: GuardedAdminPageProps) {
  await requireRouteAccess(pathname);
  return children;
}
