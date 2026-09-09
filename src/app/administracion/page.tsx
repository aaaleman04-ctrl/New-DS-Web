import styles from "@/styles/pages/admin.module.css";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import RoleBadge from "./components/RoleBadge";
import UserAvatar from "./components/UserAvatar";
import { Suspense } from "react";
import CountdownBrigada from "./components/dashboard/CountdownBrigada";
import ActividadReciente from "./components/dashboard/ActividadReciente";
import AlertasSistema from "./components/dashboard/AlertasSistema";
import QuickActions from "./components/dashboard/QuickActions";
import SolicitudesRecientesWidget from "./components/dashboard/SolicitudesRecientesWidget";
import { AdminStats, ClinicoStats, FarmaciaStats, VoluntarioStats } from "./components/dashboard/TarjetasDashboard";

function DashboardSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2.4rem" }}>
      <div className={styles.statCard} style={{ opacity: 0.5 }}>Cargando estadísticas...</div>
      <div className={styles.statCard} style={{ opacity: 0.5 }}>Cargando estadísticas...</div>
      <div className={styles.statCard} style={{ opacity: 0.5 }}>Cargando estadísticas...</div>
    </div>
  );
}

export default async function DashboardPage() {
  const ctx = await requirePermission(PERMISSIONS.PERFIL_READ);
  const supabase = await createSupabaseServerClient();

  // Fetch user's specialty name if set
  let specialtyName = "Ninguna / Administrativo";
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

  const nameDisplay = ctx.profile.nombre_completo || "Usuario";
  const role = ctx.profile.rol;

  // Determine what dashboard to show
  let view = "admin";
  if (role === "admin" || role === "coordinador") {
    view = "admin";
  } else if (role === "atencion_pacientes") {
    view = "clinico";
  } else if (role === "encargado_farmacia") {
    view = "farmacia";
  } else if (role === "encargado_bodega") {
    view = "bodega";
  } else if (role === "voluntario") {
    view = "voluntario";
  }

  return (
    <div>
      {/* Sección de Bienvenida */}
      <div
        style={{
          padding: "2.8rem 3.2rem",
          marginBottom: "3.2rem",
          background: "#ffffff",
          borderRadius: "1.8rem",
          border: "1px solid #f1f5f9",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "2.4rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <UserAvatar
            avatarUrl={ctx.profile.avatar_url}
            nombres={ctx.profile.nombre_completo}
            email={ctx.user.email}
            size={70}
          />
          <div>
            <h2
              style={{
                fontFamily: "var(--fontMain)",
                fontSize: "2.6rem",
                fontWeight: 800,
                margin: 0,
                color: "var(--dark)",
                letterSpacing: "-0.02em",
              }}
            >
              Bienvenido, {nameDisplay}
            </h2>
            <p
              style={{
                margin: "0.5rem 0 0",
                color: "#64748b",
                fontSize: "1.5rem",
                fontWeight: 500,
              }}
            >
              Llevando salud, amor y esperanza a las comunidades de Honduras.
            </p>
          </div>
        </div>

        {/* Tarjeta de Detalles del Perfil */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "1.4rem",
            border: "1px solid #e2e8f0",
            padding: "1.8rem 2.4rem",
            minWidth: "290px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.02)",
          }}
        >
          <h4
            style={{
              fontFamily: "var(--fontMain)",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "#94a3b8",
              marginBottom: "1.2rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Perfil Activo
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              fontSize: "1.35rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--dark)" }}>
                Rol:
              </span>
              <RoleBadge role={ctx.profile.rol} />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--dark)" }}>
                Especialidad:
              </span>
              <span
                style={{
                  color: "#0f766e",
                  fontWeight: 600,
                  background: "#f0fdfa",
                  border: "1px solid #ccfbf1",
                  padding: "0.25rem 0.9rem",
                  borderRadius: "9999px",
                  fontSize: "1.2rem",
                }}
              >
                {specialtyName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <QuickActions role={role} />

      <div style={{ marginBottom: "2.4rem" }}>
        <h3 style={{ fontSize: "2rem", color: "var(--dark)", marginBottom: "0.4rem" }}>Resumen General</h3>
        <p style={{ color: "var(--gray)", fontSize: "1.5rem", margin: 0 }}>Vistazo rápido a las actividades de Dibujando Sonrisas.</p>
      </div>

      {/* Grid principal de estadísticas */}
      <div className={styles.statsGrid} style={{ marginBottom: "2.4rem" }}>
        <Suspense fallback={<div className={styles.statCard}>Cargando cuenta regresiva...</div>}>
          <CountdownBrigada />
        </Suspense>

        <Suspense fallback={<DashboardSkeleton />}>
          {view === "admin" && <AdminStats />}
          {view === "clinico" && <ClinicoStats />}
          {view === "enfermeria" && <ClinicoStats isEnfermeria={true} />}
          {view === "farmacia" && <FarmaciaStats />}
          {view === "voluntario" && <VoluntarioStats />}
        </Suspense>
      </div>

      {/* Solicitudes de Inscripción para la Brigada Activa */}
      {view === "admin" && (
        <div style={{ marginBottom: "2.4rem" }}>
          <Suspense fallback={<div className={styles.statCard}>Cargando solicitudes de voluntariado...</div>}>
            <SolicitudesRecientesWidget />
          </Suspense>
        </div>
      )}

      {/* Alertas y Actividad Reciente solo para admin/coord */}
      {view === "admin" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2.4rem" }}>
          <Suspense fallback={<div className={styles.statCard}>Cargando Alertas...</div>}>
            <AlertasSistema />
          </Suspense>
          <Suspense fallback={<div className={styles.statCard}>Cargando Actividad...</div>}>
            <ActividadReciente />
          </Suspense>
        </div>
      )}
    </div>
  );
}
