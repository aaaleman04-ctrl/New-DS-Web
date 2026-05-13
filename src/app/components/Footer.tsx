import Link from "next/link";
import styles from "../../styles/components/footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.footerTop} container`}>
        <div className={styles.brand}>
          <Link href="/">
            <p className={styles.logo}>
              Dibujando<span className={styles.logoSpan}> Sonrisas</span>
            </p>
          </Link>
          <p className={styles.tagline}>
            Fundación cristiana que lleva salud, amor y esperanza a las
            comunidades más vulnerables de Honduras.
          </p>

          <div className={styles.social}>
            <a
              href="https://www.facebook.com/share/18fJDbV3QB/?mibextid=wwXIfr"
              aria-label="Facebook"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                width="18"
                height="18"
              >
                <path
                  clipRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  fillRule="evenodd"
                />
              </svg>
            </a>

            <a
              href="https://www.instagram.com/dibujando.sonrisas21?igsh=MXJlazZ0bHRmeWg1bA=="
              aria-label="Instagram"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                width="18"
                height="18"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            <a
              href="https://www.tiktok.com/@dibujando.sonrisas.hn?_r=1&_t=ZS-95n2jXuRkIu"
              aria-label="TikTok"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                width="18"
                height="18"
              >
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.83 1.56V6.79a4.85 4.85 0 01-1.06-.1z" />
              </svg>
            </a>

            <a
              href="https://x.com/dibujandos93469?s=21"
              aria-label="X (Twitter)"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                width="18"
                height="18"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <a
              href="https://youtube.com/@dibujandosonrisas.honduras?si=mW60M5L9hQyNGlNs"
              aria-label="YouTube"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                width="18"
                height="18"
              >
                <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
              </svg>
            </a>
            <a
              href="https://gofund.me/97bce5025"
              aria-label="GoFundMe"
              className={`${styles.socialLink} ${styles.gfmLink}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>GFM</span>
            </a>
          </div>
        </div>

        <nav>
          <p className={styles.navTitle}>Navegación</p>
          <ul className={styles.navList}>
            <li>
              <Link href="/sobre-nosotros">Sobre Nosotros</Link>
            </li>
            <li>
              <Link href="/nuestro-trabajo">Nuestro Trabajo</Link>
            </li>
            <li>
              <Link href="/brigadas">Brigadas</Link>
            </li>
            <li>
              <Link href="/voluntariado">Voluntariado</Link>
            </li>
            <li>
              <Link href="/donar">Donar</Link>
            </li>
            <li>
              <Link href="/contacto">Contacto</Link>
            </li>
          </ul>
        </nav>

        <div className={styles.infoCol}>
          <p className={styles.navTitle}>Contacto</p>
          <p>Honduras</p>
          <p>fundacion.ds2021@gmail.com</p>
          <p>WhatsApp disponible próximamente</p>
          <p>Fundación Cristiana</p>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={`${styles.footerBottomInner} container`}>
          <p>© 2025 Dibujando Sonrisas. Todos los derechos reservados.</p>
          <p>Hecho con amor para Honduras</p>
        </div>
      </div>
    </footer>
  );
}
