import styles from "@/styles/pages/admin.module.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function AdminStats() {
  const supabase = await createSupabaseServerClient();
  
  // Fetch views in parallel
  const [
    { data: vol },
    { data: inv },
    { data: pac },
    { data: far },
    { data: rop },
    { data: act },
    { data: ven }
  ] = await Promise.all([
    supabase.from("dashboard_voluntarios").select("*").maybeSingle(),
    supabase.from("dashboard_inventario").select("*").maybeSingle(),
    supabase.from("dashboard_pacientes").select("*").maybeSingle(),
    supabase.from("dashboard_farmacia").select("*").maybeSingle(),
    supabase.from("dashboard_ropa").select("*").maybeSingle(),
    supabase.from("dashboard_actividades").select("*").maybeSingle(),
    supabase.from("dashboard_ventas").select("*").maybeSingle()
  ]);

  return (
    <>
      <div className={styles.statCard}>
        <div className={styles.statHeader}><h3>Voluntarios Totales</h3><span></span></div>
        <p className={styles.statValue}>{vol?.total_inscritos || 0}</p>
        <p className={styles.statChange} style={{color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem"}}>{vol?.nuevos_este_ano || 0} nuevos este año</p>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statHeader}><h3>Medicamentos</h3><span></span></div>
        <p className={styles.statValue}>{inv?.total_medicamentos || 0}</p>
        <p className={styles.statChange} style={{color: "var(--danger)", fontSize: "1.2rem", marginTop: "0.5rem"}}>{inv?.medicamentos_stock_bajo || 0} bajo stock / {inv?.lotes_vencidos || 0} vencidos</p>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statHeader}><h3>Pacientes Atendidos</h3><span></span></div>
        <p className={styles.statValue}>{pac?.pacientes || 0}</p>
        <p className={styles.statChange} style={{color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem"}}>{pac?.hombres || 0} hombres, {pac?.mujeres || 0} mujeres</p>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statHeader}><h3>Farmacia: Entregas</h3><span></span></div>
        <p className={styles.statValue}>{far?.total_entregas || 0}</p>
        <p className={styles.statChange} style={{color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem"}}>{far?.total_unidades_entregadas || 0} meds. entregados</p>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statHeader}><h3>Ropa: Donaciones</h3><span></span></div>
        <p className={styles.statValue}>{rop?.prendas_entregadas || 0}</p>
        <p className={styles.statChange} style={{color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem"}}>{rop?.pacientes_beneficiados || 0} pacientes beneficiados</p>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statHeader}><h3>Ventas Recaudadas</h3><span></span></div>
        <p className={styles.statValue}>L. {Number(ven?.ingresos || 0).toLocaleString("es-HN", { minimumFractionDigits: 2 })}</p>
        <p className={styles.statChange} style={{color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem"}}>{ven?.ventas || 0} ventas completadas</p>
      </div>
    </>
  );
}

export async function ClinicoStats({ isEnfermeria = false }: { isEnfermeria?: boolean }) {
  const supabase = await createSupabaseServerClient();
  const [{ data: pac }, { data: inv }] = await Promise.all([
    supabase.from("dashboard_pacientes").select("*").maybeSingle(),
    supabase.from("dashboard_inventario").select("*").maybeSingle(),
  ]);

  return (
    <>
      <div className={styles.statCard}>
        <div className={styles.statHeader}><h3>Pacientes Globales</h3><span></span></div>
        <p className={styles.statValue}>{pac?.pacientes || 0}</p>
        <p className={styles.statChange} style={{color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem"}}>{pac?.hombres || 0} hombres, {pac?.mujeres || 0} mujeres</p>
      </div>
      {isEnfermeria && (
        <div className={styles.statCard}>
          <div className={styles.statHeader}><h3>Signos Vitales</h3><span></span></div>
          <p className={styles.statValue}>{pac?.pacientes || 0}</p>
          <p className={styles.statChange} style={{color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem"}}>Registrados este mes</p>
        </div>
      )}
      <div className={styles.statCard}>
        <div className={styles.statHeader}><h3>Inventario Disponible</h3><span></span></div>
        <p className={styles.statValue}>{inv?.total_medicamentos || 0}</p>
        <p className={styles.statChange} style={{color: "var(--success)", fontSize: "1.2rem", marginTop: "0.5rem"}}>Medicamentos en catálogo</p>
      </div>
    </>
  );
}

export async function FarmaciaStats() {
  const supabase = await createSupabaseServerClient();
  const [{ data: far }, { data: inv }] = await Promise.all([
    supabase.from("dashboard_farmacia").select("*").maybeSingle(),
    supabase.from("dashboard_inventario").select("*").maybeSingle(),
  ]);

  return (
    <>
      <div className={styles.statCard}>
        <div className={styles.statHeader}><h3>Medicamentos Entregados</h3><span></span></div>
        <p className={styles.statValue}>{far?.total_unidades_entregadas || 0}</p>
        <p className={styles.statChange} style={{color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem"}}>{far?.total_entregas || 0} recetas despachadas</p>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statHeader}><h3>Catálogo Inventario</h3><span></span></div>
        <p className={styles.statValue}>{inv?.total_medicamentos || 0}</p>
        <p className={styles.statChange} style={{color: "var(--danger)", fontSize: "1.2rem", marginTop: "0.5rem"}}>{inv?.medicamentos_stock_bajo || 0} bajo stock / {inv?.lotes_vencidos || 0} vencidos</p>
      </div>
    </>
  );
}

export async function VoluntarioStats() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { count } = await supabase.from("asignaciones_voluntarios").select("*", { count: "exact", head: true }).eq("perfil_id", user?.id || "");

  return (
    <>
      <div className={styles.statCard}>
        <div className={styles.statHeader}><h3>Mi Participación</h3><span></span></div>
        <p className={styles.statValue}>{count || 0}</p>
        <p className={styles.statChange} style={{color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem"}}>Brigadas asignadas</p>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statHeader}><h3>Horas de Voluntariado</h3><span></span></div>
        <p className={styles.statValue}>{(count || 0) * 8}</p>
        <p className={styles.statChange} style={{color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem"}}>Horas certificadas estimadas</p>
      </div>
    </>
  );
}
