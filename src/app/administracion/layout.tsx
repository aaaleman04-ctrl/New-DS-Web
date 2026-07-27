import { PermissionsProvider } from "./components/PermissionsProvider";
import AdminLayoutClient from "./components/AdminLayoutClient";
import { getAuthContext } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata = {
  title: "Dashboard | Fundación Dibujando Sonrisas",
  description: "Sistema Web de Gestión Integral — Fundación Dibujando Sonrisas.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAuthContext();

  if (!ctx) {
    redirect("/auth/sin-acceso");
  }

  let specialtyName: string | null = null;
  if (ctx.profile.especialidad_id) {
    const supabase = await createSupabaseServerClient();
    const { data: specialty } = await supabase
      .from("especialidades")
      .select("nombre")
      .eq("id", ctx.profile.especialidad_id)
      .maybeSingle();
    if (specialty?.nombre) {
      specialtyName = specialty.nombre;
    }
  }

  const displayName = ctx.profile.nombre_completo || ctx.user.email || "Usuario";
  const roleLabel = ROLE_LABELS[ctx.role] || ctx.role;

  return (
    <PermissionsProvider role={ctx.role} specialtyName={specialtyName}>
      <AdminLayoutClient
        displayName={displayName}
        roleLabel={roleLabel}
        avatarUrl={ctx.profile.avatar_url}
        email={ctx.user.email || ""}
      >
        {children}
      </AdminLayoutClient>
    </PermissionsProvider>
  );
}
