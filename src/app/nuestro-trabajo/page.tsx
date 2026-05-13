import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../../styles/pages/our-work.module.css";

export const metadata: Metadata = {
  title: "Nuestro Trabajo | Dibujando Sonrisas",
  description:
    "Descubre el impacto de las brigadas médico-odontológicas de Dibujando Sonrisas — más de 2,000 pacientes atendidos, 15 comunidades servidas y cientos de voluntarios.",
};

/* ── Servicios data ── */
const services = [
  {
    id: "odontologia",
    title: "Atención Odontológica",
    desc: "Extracciones, limpiezas dentales y tratamientos para restaurar la salud bucal de nuestros pacientes.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 5.5c-1.032-.956-2.418-1.5-4-1.5c-3.314 0-6 2.686-6 6c0 4 2 7 4 9h4" />
        <path d="M12 5.5c1.032-.956 2.418-1.5 4-1.5c3.314 0 6 2.686 6 6c0 4-2 7-4 9h-4" />
        <path d="M9 11c0 1 .667 2 3 2s3-1 3-2" />
      </svg>
    ),
  },
  {
    id: "medicina",
    title: "Medicina General",
    desc: "Consultas generales, chequeos y tratamientos para enfermedades comunes en todas las edades.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M19 8h-14a1 1 0 0 0 -1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1 -1v-8a1 1 0 0 0 -1 -1z" />
        <path d="M12 8v-3a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v3" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="12" y1="10" x2="12" y2="16" />
      </svg>
    ),
  },
  {
    id: "prevencion",
    title: "Prevención y Educación",
    desc: "Educamos a las comunidades en higiene, nutrición y prevención de enfermedades para una salud duradera.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 3a9 9 0 1 0 9 9" />
        <path d="M15 4.5l-3 3l-3 -3" />
        <path d="M21 3l-5 5" />
        <path d="M16 3h5v5" />
      </svg>
    ),
  },
  {
    id: "donaciones",
    title: "Donación de Insumos",
    desc: "Entregamos medicamentos e insumos médicos a hospitales públicos y asilos de ancianos.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.566" />
        <path d="M12 6l-2 4l4 2l-2 4" />
      </svg>
    ),
  },
];

/* ── Gallery photos ── */
const actionPhotos = [
  { src: "/accion1.jpg", alt: "Brigada médica en acción" },
  { src: "/accion2.jpg", alt: "Atención odontológica" },
  { src: "/accion3.jpg", alt: "Atención comunitaria" },
  { src: "/accion4.jpg", alt: "Consulta médica" },
  { src: "/accion5.jpg", alt: "Voluntarios" },
  { src: "/accion6.jpg", alt: "Comunidad" },
];

/* ── Stories ── */
const stories = [
  {
    id: "roberto",
    quote:
      '"Por años no podía ver bien para leerle a mis nietos. Los anteojos que recibí en la brigada cambiaron todo. Es algo pequeño que hizo una diferencia enorme en mi vida."',
    name: "Roberto S.",
    location: "Beneficiario, Palma Real, Omoa",
    img: "/stories1.jpeg",
  },
  {
    id: "rosa",
    quote:
      '"Mi hijo llevaba semanas con dolor de muelas y no teníamos cómo pagar un dentista. Gracias a Dibujando Sonrisas, pudo ser atendido con mucho amor y cariño."',
    name: "Rosa M.",
    location: "Beneficiaria, Agua Zarca, Santa Bárbara",
    img: "/stories2.jpeg",
  },
];

export default function NuestroTrabajo() {
  return (
    <div className={styles.pageWrapper}>
      <Header />

      {/* ── HERO ── */}
      <div className={styles.hero}>
        <div className={styles.inner}>
          <h1>Transformando Vidas, Una Sonrisa a la Vez</h1>
          <p className={styles.heroSub}>
            Descubre el impacto que nuestras brigadas médico-odontológicas
            tienen en comunidades que lo necesitan
          </p>
          <div className={styles.heroButtons}>
            <Link href="/voluntariado" className={styles.btnSolid}>
              Ser Voluntario
            </Link>
            <Link href="/donar" className={styles.btnOutline}>
              Donar Ahora
            </Link>
          </div>
        </div>
      </div>

      <main>
        {/* ── NÚMEROS ── */}
        <section
          className={styles.numbersSection}
          aria-labelledby="numeros-heading"
        >
          <div className={styles.inner}>
            <h2 id="numeros-heading">Nuestro Impacto en Números</h2>
            <div className={styles.numbersGrid}>
              <div className={styles.statCard}>
                <h4>Pacientes Atendidos</h4>
                <p>2,000+</p>
              </div>
              <div className={styles.statCard}>
                <h4>Voluntarios Participantes</h4>
                <p>200+</p>
              </div>
              <div className={styles.statCard}>
                <h4>Comunidades Servidas</h4>
                <p>15+</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICIOS ── */}
        <section
          className={styles.servicesSection}
          aria-labelledby="servicios-heading"
        >
          <div className={styles.inner}>
            <h2 id="servicios-heading">Servicios Médicos que Brindamos</h2>
            <div className={styles.servicesGrid}>
              {services.map((s) => (
                <div key={s.id} className={styles.serviceCard}>
                  <div className={styles.serviceIcon}>{s.icon}</div>
                  <div className={styles.serviceText}>
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GALERÍA ── */}
        <section
          className={styles.actionSection}
          aria-labelledby="galeria-heading"
        >
          <div className={styles.inner}>
            <h2 id="galeria-heading">Nuestras Brigadas en Acción</h2>
            <div className={styles.actionGrid}>
              {actionPhotos.map((photo) => (
                <div key={photo.src} className={styles.actionCard}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={600}
                    height={450}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HISTORIAS ── */}
        <section
          className={styles.storiesSection}
          aria-labelledby="historias-heading"
        >
          <div className={styles.inner}>
            <h2 id="historias-heading">Historias de Esperanza</h2>
            <div className={styles.storiesGrid}>
              {stories.map((s) => (
                <article key={s.id} className={styles.storyCard}>
                  <p>{s.quote}</p>
                  <div className={styles.storyRow}>
                    <div className={styles.storyImg}>
                      <Image
                        src={s.img}
                        alt={s.name}
                        width={50}
                        height={50}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div className={styles.storyText}>
                      <h4>{s.name}</h4>
                      <p>{s.location}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
