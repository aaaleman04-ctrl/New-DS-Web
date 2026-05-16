import Link from "next/link";
import styles from "../../styles/components/header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`${styles.headerContent} container`}>
        <Link href="/">
          <p className={styles.logo}>
            Dibujando<span className={styles.logoSpan}> Sonrisas</span>
          </p>
        </Link>

        <nav className={styles.navbar}>
          <Link className={styles.navRef} href="/sobre-nosotros">
            Sobre Nosotros
          </Link>
          <Link className={styles.navRef} href="/nuestro-trabajo">
            Nuestro Trabajo
          </Link>
          <Link className={styles.navRef} href="/brigadas">
            Brigadas
          </Link>
          <Link className={styles.navRef} href="/voluntariado">
            Voluntariado
          </Link>
          <Link className={styles.navRef} href="/donar">
            Donar
          </Link>
          <Link className={styles.navRef} href="/contacto">
            Contacto
          </Link>
        </nav>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link href="/auth/login" className={styles.headerButtonOutline}>
            Iniciar Sesión
          </Link>
          <Link href="/donar" className={styles.headerButton}>
            Donar
          </Link>
        </div>
      </div>
    </header>
  );
}
