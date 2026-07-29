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
    { data: ven }
  ] = await Promise.all([
    supabase.from("dashboard_voluntarios").select("*").maybeSingle(),
    supabase.from("dashboard_inventario").select("*").maybeSingle(),
    supabase.from("dashboard_pacientes").select("*").maybeSingle(),
    supabase.from("dashboard_farmacia").select("*").maybeSingle(),
    supabase.from("dashboard_ropa").select("*").maybeSingle(),
    supabase.from("dashboard_ventas").select("*").maybeSingle()
  ]);

  return (
    <>
      <div className={styles.statCard} style={{ borderTop: "4px solid #3b82f6" }}>
        <div className={styles.statHeader}>
          <h3>Voluntarios Totales</h3>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#3b82f6" style={{ width: "2.2rem", height: "2.2rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        </div>
        <p className={styles.statValue}>{vol?.total_inscritos || 0}</p>
        <p className={styles.statChange} style={{ color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem" }}>
          {vol?.nuevos_este_ano || 0} nuevos este año
        </p>
      </div>

      <div className={styles.statCard} style={{ borderTop: "4px solid #10b981" }}>
        <div className={styles.statHeader}>
          <h3>Medicamentos</h3>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#10b981" style={{ width: "2.2rem", height: "2.2rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>
        <p className={styles.statValue}>{inv?.total_medicamentos || 0}</p>
        <p className={styles.statChange} style={{ color: inv?.medicamentos_stock_bajo ? "var(--danger)" : "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem" }}>
          {inv?.medicamentos_stock_bajo || 0} bajo stock / {inv?.lotes_vencidos || 0} vencidos
        </p>
      </div>

      <div className={styles.statCard} style={{ borderTop: "4px solid #6366f1" }}>
        <div className={styles.statHeader}>
          <h3>Pacientes Atendidos</h3>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#6366f1" style={{ width: "2.2rem", height: "2.2rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <p className={styles.statValue}>{pac?.pacientes || 0}</p>
        <p className={styles.statChange} style={{ color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem" }}>
          {pac?.hombres || 0} hombres, {pac?.mujeres || 0} mujeres
        </p>
      </div>

      <div className={styles.statCard} style={{ borderTop: "4px solid #06b6d4" }}>
        <div className={styles.statHeader}>
          <h3>Farmacia: Entregas</h3>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#06b6d4" style={{ width: "2.2rem", height: "2.2rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 0 1-1.591.659H9.061a2.25 2.25 0 0 1-1.591-.659L5 14.5m14 0V17a2.25 2.25 0 0 1-2.25 2.25H7.25A2.25 2.25 0 0 1 5 17v-2.5" />
          </svg>
        </div>
        <p className={styles.statValue}>{far?.total_entregas || 0}</p>
        <p className={styles.statChange} style={{ color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem" }}>
          {far?.total_unidades_entregadas || 0} meds. entregados
        </p>
      </div>

      <div className={styles.statCard} style={{ borderTop: "4px solid #ec4899" }}>
        <div className={styles.statHeader}>
          <h3>Ropa: Donaciones</h3>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#ec4899" style={{ width: "2.2rem", height: "2.2rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m-6 3.75h12v9.75H6v-9.75Z" />
          </svg>
        </div>
        <p className={styles.statValue}>{rop?.prendas_entregadas || 0}</p>
        <p className={styles.statChange} style={{ color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem" }}>
          {rop?.pacientes_beneficiados || 0} pacientes beneficiados
        </p>
      </div>

      <div className={styles.statCard} style={{ borderTop: "4px solid #f59e0b" }}>
        <div className={styles.statHeader}>
          <h3>Ventas Recaudadas</h3>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#f59e0b" style={{ width: "2.2rem", height: "2.2rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5a1.5 1.5 0 0 1 1.5 1.5v9.75a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5Zm13.5 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM6 7.5h1.5v1.5H6V7.5Z" />
          </svg>
        </div>
        <p className={styles.statValue}>L. {Number(ven?.ingresos || 0).toLocaleString("es-HN", { minimumFractionDigits: 2 })}</p>
        <p className={styles.statChange} style={{ color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem" }}>
          {ven?.ventas || 0} ventas completadas
        </p>
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
      <div className={styles.statCard} style={{ borderTop: "4px solid #6366f1" }}>
        <div className={styles.statHeader}>
          <h3>Pacientes Globales</h3>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#6366f1" style={{ width: "2.2rem", height: "2.2rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <p className={styles.statValue}>{pac?.pacientes || 0}</p>
        <p className={styles.statChange} style={{ color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem" }}>
          {pac?.hombres || 0} hombres, {pac?.mujeres || 0} mujeres
        </p>
      </div>
      {isEnfermeria && (
        <div className={styles.statCard} style={{ borderTop: "4px solid #06b6d4" }}>
          <div className={styles.statHeader}>
            <h3>Signos Vitales</h3>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#06b6d4" style={{ width: "2.2rem", height: "2.2rem" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <p className={styles.statValue}>{pac?.pacientes || 0}</p>
          <p className={styles.statChange} style={{ color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem" }}>Registrados este mes</p>
        </div>
      )}
      <div className={styles.statCard} style={{ borderTop: "4px solid #10b981" }}>
        <div className={styles.statHeader}>
          <h3>Inventario Disponible</h3>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#10b981" style={{ width: "2.2rem", height: "2.2rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>
        <p className={styles.statValue}>{inv?.total_medicamentos || 0}</p>
        <p className={styles.statChange} style={{ color: "var(--success)", fontSize: "1.2rem", marginTop: "0.5rem" }}>Medicamentos en catálogo</p>
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
      <div className={styles.statCard} style={{ borderTop: "4px solid #06b6d4" }}>
        <div className={styles.statHeader}>
          <h3>Medicamentos Entregados</h3>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#06b6d4" style={{ width: "2.2rem", height: "2.2rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 0 1-1.591.659H9.061a2.25 2.25 0 0 1-1.591-.659L5 14.5m14 0V17a2.25 2.25 0 0 1-2.25 2.25H7.25A2.25 2.25 0 0 1 5 17v-2.5" />
          </svg>
        </div>
        <p className={styles.statValue}>{far?.total_unidades_entregadas || 0}</p>
        <p className={styles.statChange} style={{ color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem" }}>
          {far?.total_entregas || 0} recetas despachadas
        </p>
      </div>

      <div className={styles.statCard} style={{ borderTop: "4px solid #10b981" }}>
        <div className={styles.statHeader}>
          <h3>Catálogo Inventario</h3>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#10b981" style={{ width: "2.2rem", height: "2.2rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>
        <p className={styles.statValue}>{inv?.total_medicamentos || 0}</p>
        <p className={styles.statChange} style={{ color: inv?.medicamentos_stock_bajo ? "var(--danger)" : "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem" }}>
          {inv?.medicamentos_stock_bajo || 0} bajo stock / {inv?.lotes_vencidos || 0} vencidos
        </p>
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
      <div className={styles.statCard} style={{ borderTop: "4px solid #3b82f6" }}>
        <div className={styles.statHeader}>
          <h3>Mi Participación</h3>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#3b82f6" style={{ width: "2.2rem", height: "2.2rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        </div>
        <p className={styles.statValue}>{count || 0}</p>
        <p className={styles.statChange} style={{ color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem" }}>
          Brigadas asignadas
        </p>
      </div>

      <div className={styles.statCard} style={{ borderTop: "4px solid #f59e0b" }}>
        <div className={styles.statHeader}>
          <h3>Horas de Voluntariado</h3>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#f59e0b" style={{ width: "2.2rem", height: "2.2rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <p className={styles.statValue}>{(count || 0) * 8}</p>
        <p className={styles.statChange} style={{ color: "var(--gray)", fontSize: "1.2rem", marginTop: "0.5rem" }}>
          Horas certificadas estimadas
        </p>
      </div>
    </>
  );
}
