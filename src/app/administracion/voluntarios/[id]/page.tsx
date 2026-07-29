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
  await requirePermission(PERMISSIONS.VOLUNTARIADO_READ);
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
    <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>
      <div>
        <Link
          href="/administracion/voluntarios"
          style={{
            color: "var(--primaryDark)",
            textDecoration: "none",
            fontWeight: 600,
            marginBottom: "1.6rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "1.4rem",
            background: "var(--white)",
            padding: "0.6rem 1.2rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "1.6rem", height: "1.6rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <span>Volver al Listado de Voluntarios</span>
        </Link>
        <div className={styles.pageIntro} style={{ marginBottom: "0", marginTop: "1rem" }}>
          <h2>Perfil del Voluntario</h2>
          <p>Consulta la información institucional, edita sus áreas asignadas y revisa el registro de participaciones en brigadas.</p>
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
