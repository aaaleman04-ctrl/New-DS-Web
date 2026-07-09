import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/pages/admin.module.css";
import VoluntarioProfile from "../components/VoluntarioProfile";
import AsignacionesCard from "../components/AsignacionesCard";
import ParticipacionesTable from "../components/ParticipacionesTable";

export default async function VoluntarioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission(PERMISSIONS.USERS_MANAGE);
  const id = (await params).id;

  const supabase = await createSupabaseServerClient();
  
  // Fetch voluntario
  const { data: voluntario, error: volError } = await supabase
    .from("perfiles")
    .select("*, especialidades:especialidad_id(id, nombre)")
    .eq("id", id)
    .single();

  if (volError || !voluntario) {
    notFound();
  }

  // Fetch asignaciones
  const { data: asignaciones } = await supabase
    .from("asignaciones_voluntarios")
    .select("*, brigada:brigada_id(id, nombre)")
    .eq("perfil_id", id);

  // Fetch participaciones
  const { data: participaciones } = await supabase
    .from("participaciones_voluntarios")
    .select("*, brigada:brigada_id(id, nombre, fecha_brigada)")
    .eq("perfil_id", id)
    .order("created_at", { ascending: false });

  // Mezclar participaciones con asignaciones para la vista unificada
  const mergedParticipaciones = [...(participaciones || [])];
  
  (asignaciones || []).forEach(asig => {
    const exists = mergedParticipaciones.find(p => p.brigada_id === asig.brigada_id);
    if (exists) {
      // Inyectar el área asignada en la participación existente
      (exists as any).area_asignada = asig.area_asignada;
    } else {
      // Agregar la asignación como una participación "pendiente"
      mergedParticipaciones.push({
        brigada_id: asig.brigada_id,
        perfil_id: id,
        brigada: asig.brigada as any,
        area_asignada: asig.area_asignada,
      } as any);
    }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <Link href="/administracion/voluntarios" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "bold", marginBottom: "1rem", display: "inline-block" }}>
          &larr; Volver al Listado
        </Link>
        <div className={styles.pageIntro} style={{ marginBottom: "0" }}>
          <h2>Perfil del Voluntario</h2>
          <p>Consulta la información, edita sus áreas asignadas o registra la participación del voluntario en las brigadas.</p>
        </div>
      </div>

      <VoluntarioProfile voluntario={{
        ...voluntario,
        participaciones_voluntarios: participaciones || []
      }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
        {/* Usamos Flex y min-width para acomodar las dos tablas */}
        <div style={{ flex: "2 1 600px" }}>
          <ParticipacionesTable 
            perfilId={id} 
            participaciones={mergedParticipaciones} 
          />
        </div>

        <div style={{ flex: "1 1 350px" }}>
          <AsignacionesCard 
            perfilId={id} 
            asignaciones={asignaciones || []} 
          />
        </div>
      </div>
    </div>
  );
}
