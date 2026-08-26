"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../../styles/components/header.module.css";

const NAV_LINKS = [
  { href: "/sobre-nosotros", label: "Sobre Nosotros" },
  { href: "/nuestro-trabajo", label: "Nuestro Trabajo" },
  { href: "/brigadas", label: "Brigadas" },
  { href: "/voluntariado", label: "Voluntariado" },
  { href: "/donar", label: "Donar" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className={styles.header}>
      <div className={`${styles.headerContent} container`}>
        <Link href="/" className={styles.logoLink}>
          <span className={styles.headerLogo}>
            <Image
              src="/DS-LOGO.png"
              alt="Logo Dibujando Sonrisas"
              width={50}
              height={50}
              priority
            />
          </span>
          <p className={styles.logo}>
            Dibujando<span className={styles.logoSpan}> Sonrisas</span>
          </p>
        </Link>

        {/* Navegación Desktop */}
        <nav className={styles.navbar} aria-label="Navegación principal">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navRef} ${
                  isActive ? styles.navRefActive : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Botones de Acción Desktop */}
        <div className={styles.headerActions}>
          <Link href="/auth/login" className={styles.headerButtonOutline}>
            Iniciar Sesión
          </Link>
          <Link href="/donar" className={styles.headerButton}>
            Donar
          </Link>

          {/* Botón Hamburguesa Móvil */}
          <button
            type="button"
            className={styles.mobileMenuToggle}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className={styles.mobileNavContainer}>
          <nav className={styles.mobileNavbar} aria-label="Navegación móvil">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.mobileNavRef} ${
                    isActive ? styles.mobileNavRefActive : ""
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className={styles.mobileNavButtons}>
              <Link href="/auth/login" className={styles.headerButtonOutline}>
                Iniciar Sesión
              </Link>
              <Link href="/donar" className={styles.headerButton}>
                Donar
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
