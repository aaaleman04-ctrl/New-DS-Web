import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../../styles/pages/donate.module.css";

export const metadata: Metadata = {
  title: "Donar | Dibujando Sonrisas",
  description:
    "Apoya a Dibujando Sonrisas — dona a través de GoFundMe, contacta para donaciones en especie, o únete como voluntario. Tu apoyo hace la diferencia.",
};

const alternatives = [
  {
    id: "gofundme",
    icon: "",
    title: "GoFundMe",
    desc: "Dona de forma segura desde cualquier parte del mundo a través de nuestra campaña en GoFundMe.",
    cta: (
      <a
        href="https://gofund.me/97bce5025"
        className={styles.btnGofundme}
        target="_blank"
        rel="noopener noreferrer"
      >
        Donar en GoFundMe
      </a>
    ),
  },
  {
    id: "contacto",
    icon: "",
    title: "Contacto Directo",
    desc: "¿Estás en Honduras? Contáctanos directamente para coordinar una donación en insumos médicos o medicamentos.",
    cta: (
      <Link href="/contacto" className={styles.btnOutline}>
        Contáctanos →
      </Link>
    ),
  },
  {
    id: "insumos",
    icon: "",
    title: "Dona Insumos",
    desc: "Medicamentos, equipos médicos, material odontológico o cualquier insumo que pueda servir en nuestras brigadas.",
    cta: (
      <Link href="/contacto" className={styles.btnOutline}>
        Saber más →
      </Link>
    ),
  },
  {
    id: "voluntario",
    icon: "",
    title: "Sé Voluntario",
    desc: "Tu tiempo y habilidades también son una forma poderosa de apoyar. ¡Únete a nuestro equipo de voluntarios!",
    cta: (
      <Link href="/voluntariado" className={styles.btnOutline}>
        Ser Voluntario →
      </Link>
    ),
  },
];

export default function Donar() {
  return (
    <>
      <Header />

      <main>
        <section className={styles.comingSoon} aria-labelledby="donate-heading">
          <div className={styles.content}>
            <div className={styles.icon} aria-hidden="true">
              
            </div>

            <h1 id="donate-heading">¡Tu apoyo hace la diferencia!</h1>
            <p>
              Estamos trabajando para implementar un sistema de donaciones en
              línea seguro y conveniente. Mientras tanto, puedes apoyarnos a
              través de las siguientes opciones:
            </p>

            {/* ── Alternatives grid ── */}
            <div className={styles.altGrid}>
              {alternatives.map((alt) => (
                <div key={alt.id} className={styles.altCard}>
                  <div className={styles.altIcon} aria-hidden="true">
                    {alt.icon}
                  </div>
                  <h4>{alt.title}</h4>
                  <p>{alt.desc}</p>
                  {alt.cta}
                </div>
              ))}
            </div>

            <p className={styles.note}>
              Sistema de pagos en línea — <strong>Próximamente</strong>
              <small>
                Estamos configurando plataformas para hacer las donaciones más
                sencillas.
              </small>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
