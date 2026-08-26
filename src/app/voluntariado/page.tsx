import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import Header from "../components/Header";
import Footer from "../components/Footer";
import VolunteerForm from "./VolunteerForm";
import PublicBrigadaBanner from "../administracion/brigadas/components/PublicBrigadaBanner";
import styles from "../../styles/pages/volunteer.module.css";

export const metadata: Metadata = {
  title: "Voluntariado | Dibujando Sonrisas",
  description:
    "Únete como voluntario a las brigadas médico-odontológicas de Dibujando Sonrisas en Honduras. Aplica en línea y marca una diferencia real.",
};

export const dynamic = "force-dynamic";

export default async function Voluntariado() {
  const supabase = await createSupabaseServerClient();
  
  // Buscar brigada activa con inscripciones abiertas
  const { data: activeBrigada } = await supabase
    .from("brigadas")
    .select("*")
    .eq("estado", "inscripciones_abiertas")
    .order("fecha_brigada", { ascending: true })
    .limit(1)
    .maybeSingle();

  let cuposInfo = {
    total: null as number | null,
    registrados: 0,
    cupoLleno: false,
    disponibles: null as number | null,
  };

  if (activeBrigada) {
    const { count } = await supabase
      .from("inscripciones_voluntarios")
      .select("*", { count: "exact", head: true })
      .eq("brigada_id", activeBrigada.id)
      .neq("estado", "rechazado");

    const totalCupos = activeBrigada.capacidad_voluntarios ?? null;
    const registrados = count || 0;
    const cupoLleno =
      totalCupos !== null && totalCupos > 0 ? registrados >= totalCupos : false;
    const disponibles =
      totalCupos !== null ? Math.max(0, totalCupos - registrados) : null;

    cuposInfo = {
      total: totalCupos,
      registrados,
      cupoLleno,
      disponibles,
    };
  }

  const isClosed = !activeBrigada;
  const isCupoLleno = cuposInfo.cupoLleno;

  return (
    <>
      <Header />

      {/* ── HERO ── */}
      <div className={styles.hero}>
        <h1>Lleva Sonrisas a Quienes Más lo Necesitan</h1>
        <p className={styles.heroSub}>
          Tus habilidades pueden cambiar vidas. Únete a nuestras brigadas
          médicas y marca una diferencia real en Honduras.
        </p>
        <div className={styles.heroButtons}>
          {!isClosed && !isCupoLleno ? (
            <a href="#formulario" className={styles.btnPrimary}>
              Ser Voluntario
            </a>
          ) : isCupoLleno ? (
            <span
              className={styles.btnPrimary}
              style={{ opacity: 0.85, cursor: "not-allowed", backgroundColor: "#64748b", borderColor: "#64748b" }}
            >
              🔒 Cupo Máximo Alcanzado
            </span>
          ) : (
            <span
              className={styles.btnPrimary}
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            >
              Inscripciones Cerradas
            </span>
          )}
          <Link href="/donar" className={styles.btnOutlined}>
            Donar Ahora
          </Link>
        </div>
      </div>

      {/* ── MAIN ── */}
      <main className={styles.volunteerMain}>
        <div className={styles.innerContainer}>
          {/* ── BANNER DINÁMICO DE PRÓXIMA BRIGADA ── */}
          {!isClosed && activeBrigada && (
            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
              <PublicBrigadaBanner
                brigada={activeBrigada as any}
                cuposInfo={cuposInfo}
              />
            </div>
          )}

          {/* ── ¿POR QUÉ SER VOLUNTARIO? ── */}
          <section className={styles.whySection} aria-labelledby="why-heading">
            <h2 id="why-heading">¿Por Qué Ser Voluntario con Nosotros?</h2>
            <p className={styles.whySubtitle}>
              Crece como profesional mientras impactas la salud de Honduras de
              forma tangible.
            </p>
            <div className={styles.whyCards}>
              <div className={styles.whyCard}>
                <div className={styles.circle}>
                  <span className={styles.circleIcon} aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M19 8h-14a1 1 0 0 0 -1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1 -1v-8a1 1 0 0 0 -1 -1z" />
                      <path d="M12 8v-3a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v3" />
                      <path d="M12 13h.01" />
                    </svg>
                  </span>
                </div>
                <h4>Crecimiento Profesional</h4>
                <p>
                  Gana experiencia médica única en entornos diversos y pon a
                  prueba tus habilidades en campo real.
                </p>
              </div>

              <div className={styles.whyCard}>
                <div className={styles.circle}>
                  <span className={styles.circleIcon} aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18" />
                    </svg>
                  </span>
                </div>
                <h4>Impacto Inmediato</h4>
                <p>
                  Ve los resultados de tu atención directamente en los pacientes
                  y la comunidad que sirves.
                </p>
              </div>

              <div className={styles.whyCard}>
                <div className={styles.circle}>
                  <span className={styles.circleIcon} aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.566" />
                    </svg>
                  </span>
                </div>
                <h4>Servicio con Propósito</h4>
                <p>
                  Más que medicina — predicamos el evangelio y llevamos amor a
                  cada lugar donde llegamos.
                </p>
              </div>
            </div>
          </section>

          {/* ── ROLES DISPONIBLES ── */}
          <section
            className={styles.rolesSection}
            aria-labelledby="roles-heading"
          >
            <h2 id="roles-heading">Roles Disponibles</h2>
            <div>
              <p>
                Necesitamos tanto profesionales de la salud como personal de
                apoyo para hacer exitosas nuestras misiones.
              </p>
            </div>
            <div className={styles.rolesGrid}>
              <div className={styles.roleCard}>
                <div className={styles.roleImg1} aria-hidden="true" />
                <div className={styles.roleName}>
                  <span className={styles.roleIcon} aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M3 6a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                      <path d="M21 14a3 3 0 1 0 -6 0" />
                      <path d="M6 9v11" />
                      <path d="M18 11v8" />
                      <path d="M12 4v16" />
                      <path d="M9 7h6" />
                    </svg>
                  </span>
                  <h3>Profesionales de Salud</h3>
                </div>
                <ul>
                  <li className={styles.roleItem}>
                    Médicos Generales y Especialistas
                  </li>
                  <li className={styles.roleItem}>
                    Odontólogos y Asistentes Dentales
                  </li>
                  <li className={styles.roleItem}>
                    Enfermeros y Técnicos en Salud
                  </li>
                  <li className={styles.roleItem}>
                    Estudiantes de Medicina y Odontología
                  </li>
                </ul>
              </div>

              <div className={styles.roleCard}>
                <div className={styles.roleImg2} aria-hidden="true" />
                <div className={styles.roleName}>
                  <span className={styles.roleIcon} aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M4 13c0-4.243 3.497-8 8-8c4.418 0 7.656 3.582 7.656 8" />
                      <path d="M4 13c0 2.21 1.791 4 4 4h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-3.5" />
                      <path d="M20 13c0 2.21-1.791 4-4 4h-1a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h3.5" />
                    </svg>
                  </span>
                  <h3>Apoyo y Logística</h3>
                </div>
                <ul>
                  <li className={styles.roleItem}>
                    Coordinadores de Logística
                  </li>
                  <li className={styles.roleItem}>Personal de Apoyo General</li>
                  <li className={styles.roleItem}>Evangelistas y Oración</li>
                  <li className={styles.roleItem}>
                    Documentación y Fotografía
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* ── CÓMO UNIRTE ── */}
          <section
            className={styles.stepsSection}
            aria-labelledby="steps-heading"
          >
            <h2 id="steps-heading">¿Cómo Unirte?</h2>
            <div className={styles.stepsGrid}>
              <div className={styles.step}>
                <div className={styles.stepNumber} aria-hidden="true">
                  1
                </div>
                <h3>Aplica en Línea</h3>
                <p>
                  Llena el formulario de abajo con tus datos y área de interés.
                </p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber} aria-hidden="true">
                  2
                </div>
                <h3>Entrevista</h3>
                <p>Una breve llamada para conocerte y alinear expectativas.</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber} aria-hidden="true">
                  3
                </div>
                <h3>Preparación</h3>
                <p>Te informamos sobre la próxima brigada y qué llevar.</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber} aria-hidden="true">
                  4
                </div>
                <h3>¡A Servir!</h3>
                <p>
                  Viaja con el equipo y comienza tu experiencia de voluntariado.
                </p>
              </div>
            </div>
          </section>

          {/* ── CITA VOLUNTARIO ── */}
          <section
            className={styles.quoteSection}
            aria-label="Testimonio de voluntario"
          >
            <div>
              <div
                className={styles.quoteImage}
                role="img"
                aria-label="Foto voluntario"
              />
            </div>
            <div className={styles.quoteWords}>
              <div className={styles.quoteIcon} aria-hidden="true">
                ❝
              </div>
              <h3>
                &#34;Ser voluntario con Dibujando Sonrisas me recordó por qué
                elegí ser médico: para servir a quienes más lo necesitan, con
                amor y fe.&#34;
              </h3>
              <h4>Dr. Eugenio Rodriguez</h4>
              <p>Médico General, 10 brigadas</p>
            </div>
          </section>

          {/* ── FORMULARIO O MENSAJE DE CIERRE ── */}
          <section
            className={styles.formSection}
            aria-labelledby="form-heading"
            id="formulario"
          >
            <h2 id="form-heading">
              {!isClosed && !isCupoLleno
                ? "¿Listo para Unirte?"
                : isCupoLleno
                ? "Capacidad Máxima Alcanzada"
                : "Inscripciones Cerradas"}
            </h2>
            <div>
              <p>
                {!isClosed && !isCupoLleno
                  ? `Llena el formulario para postularte a la brigada ${activeBrigada?.nombre ?? ""}${
                      cuposInfo.disponibles !== null
                        ? ` (${cuposInfo.disponibles} cupos disponibles)`
                        : ""
                    }. Nos pondremos en contacto contigo pronto.`
                  : isCupoLleno
                  ? `Hemos completado la capacidad máxima de voluntarios (${cuposInfo.registrados} de ${cuposInfo.total} cupos ocupados) para la brigada ${activeBrigada?.nombre ?? ""}. Agradecemos tu vocación de servicio; mantente al tanto para futuras convocatorias.`
                  : "Actualmente no contamos con brigadas activas para inscripciones abiertas de voluntarios. Por favor mantente al tanto de nuestros canales oficiales para futuras convocatorias."}
              </p>
            </div>
            {!isClosed && !isCupoLleno && activeBrigada && (
              <VolunteerForm activeBrigadaId={activeBrigada.id} />
            )}
            {isCupoLleno && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "var(--radius-md)",
                  padding: "3rem 2rem",
                  maxWidth: "60rem",
                  margin: "2rem auto 0",
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid var(--border-color)",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: "3.6rem", display: "block", marginBottom: "1rem" }}>
                  🔒
                </span>
                <h3 style={{ fontSize: "2rem", color: "var(--dark)", marginBottom: "1rem" }}>
                  Cupo de Voluntarios Completo
                </h3>
                <p style={{ fontSize: "1.5rem", color: "var(--gray)", marginBottom: "2rem" }}>
                  Esta brigada médica ha alcanzado el número máximo de participantes. Puedes seguir apoyando nuestra labor donando insumos o conociendo nuestras brigadas anteriores.
                </p>
                <div style={{ display: "flex", gap: "1.2rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/brigadas" className="btn-primary">
                    Ver Brigadas Realizadas
                  </Link>
                  <Link href="/donar" className="btn-outline-blue">
                    Apoyar con Donación
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
