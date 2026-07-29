import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import PerfilClient from "./PerfilClient";

export const metadata = {
  title: "Mi Perfil | Dibujando Sonrisas",
  description: "Edita la información de tu perfil personal.",
};

export default async function PerfilPage() {
  const ctx = await requirePermission(PERMISSIONS.PERFIL_READ);
  const supabase = await createSupabaseServerClient();

  // Fetch the specialty name if the user has one
  let specialtyName = "Ninguna";
  if (ctx.profile.especialidad_id) {
    const { data: specialty } = await supabase
      .from("especialidades")
      .select("nombre")
      .eq("id", ctx.profile.especialidad_id)
      .maybeSingle();

    if (specialty?.nombre) {
      specialtyName = specialty.nombre;
    }
  }

  return (
    <PerfilClient
      profile={ctx.profile}
      email={ctx.user.email ?? ""}
      specialtyName={specialtyName}
    />
  );
}
