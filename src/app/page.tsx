import type { Metadata } from "next";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import styles from "../styles/pages/home.module.css";

export const metadata: Metadata = {
  title: "Inicio | Dibujando Sonrisas",
  description:
    "Dibujando Sonrisas — Brigadas médico-odontológicas en Honduras. Llevando atención médica y odontológica esencial a las comunidades que más lo necesitan, una sonrisa a la vez.",
};

export default function Home() {
  return (
    <>
      <Header />

      <section className={styles.hero}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className={styles.heroVideo}
          aria-hidden="true"
        >
          <source src="/video-brigada.mp4" type="video/mp4" />
          Tu navegador no soporta videos.
        </video>

        <div className={styles.heroOverlay} aria-hidden="true" />

        <div className={`${styles.heroContent} container`}>
          <h1 className={styles.heroHeading}>Dibujando Sonrisas</h1>
          <p className={styles.heroParagraph}>
            Llevando atención médica y odontológica esencial a las comunidades
            de Honduras que más lo necesitan, una sonrisa a la vez.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/sobre-nosotros" className="btn-primary">
              Conócenos
            </Link>
            <Link href="/donar" className="btn-outline">
              Apóyanos
            </Link>
          </div>
        </div>
      </section>

      <main className={`${styles.main} container`}>
        <section className={styles.mision} aria-labelledby="mision-heading">
          <h2 id="mision-heading">Nuestra Misión</h2>
          <p>
            Dibujando Sonrisas es una fundación cristiana dedicada a mejorar la
            salud y el bienestar de familias en zonas remotas y vulnerables de
            Honduras. Lo hacemos a través de brigadas médico-odontológicas,
            programas de educación en salud y donaciones de insumos a hospitales
            y asilos de ancianos.
          </p>
        </section>

        <h2 className={styles.impactHeader} id="impacto-heading">
          Nuestro Impacto
        </h2>
        <div
          className={styles.impactGrid}
          role="list"
          aria-labelledby="impacto-heading"
        >
          <article className={styles.impactCard} role="listitem">
            <div className={styles.cardImg1} aria-hidden="true" />
            <div className={styles.impactCardBody}>
              <h3>Consultas Médicas</h3>
              <p>
                Brindamos consultas médicas generales y tratamientos a personas
                que no tienen acceso a centros de salud.
              </p>
            </div>
          </article>

          <article className={styles.impactCard} role="listitem">
            <div className={styles.cardImg2} aria-hidden="true" />
            <div className={styles.impactCardBody}>
              <h3>Atención Odontológica</h3>
              <p>
                Realizamos extracciones, limpiezas y tratamientos dentales en
                comunidades sin clínicas cercanas.
              </p>
            </div>
          </article>

          <article className={styles.impactCard} role="listitem">
            <div className={styles.cardImg3} aria-hidden="true" />
            <div className={styles.impactCardBody}>
              <h3>Apoyo Comunitario</h3>
              <p>
                Donamos insumos médicos a hospitales y llevamos amor a los
                asilos de ancianos de nuestra región.
              </p>
            </div>
          </article>
        </div>

        <h2 className={styles.testimonialsHeader} id="testimonios-heading">
          Testimonios
        </h2>
        <div
          className={styles.testimonialsGrid}
          role="list"
          aria-labelledby="testimonios-heading"
        >
          <article className={styles.testimonialCard} role="listitem">
            <div
              className={styles.testimonialImgPlaceholder}
              aria-hidden="true"
            >
            </div>
            <div className={styles.testimonialCardBody}>
              <h4>&#34;Dibujando Sonrisas cambió la vida de mi familia&#34;</h4>
              <p>— María Rodríguez</p>
            </div>
          </article>

          <article className={styles.testimonialCard} role="listitem">
            <div
              className={styles.testimonialImgPlaceholder}
              aria-hidden="true"
            >
            </div>
            <div className={styles.testimonialCardBody}>
              <h4>&#34;La atención que recibimos fue un regalo de Dios&#34;</h4>
              <p>— Carlos López</p>
            </div>
          </article>

          <article className={styles.testimonialCard} role="listitem">
            <div
              className={styles.testimonialImgPlaceholder}
              aria-hidden="true"
            >
            </div>
            <div className={styles.testimonialCardBody}>
              <h4>&#34;Su dedicación y amor nos inspira profundamente&#34;</h4>
              <p>— Sofía Martínez</p>
            </div>
          </article>
        </div>
      </main>

      <section className={styles.support} aria-labelledby="cta-heading">
        <h2 id="cta-heading">Apoya Nuestra Causa</h2>
        <p>
          Tu contribución puede transformar la vida de una familia en Honduras.
        </p>
        <Link href="/donar" className="btn-primary">
          Donar Ahora
        </Link>
      </section>

      <Footer />
    </>
  );
}
