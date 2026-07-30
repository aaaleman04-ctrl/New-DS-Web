"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import UserAvatar from "./UserAvatar";
import NotificacionesStockBtn from "./NotificacionesStockBtn";
import styles from "@/styles/pages/admin.module.css";

interface AdminHeaderProps {
  displayName: string;
  roleLabel: string;
  avatarUrl?: string | null;
  email?: string | null;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleMobile: () => void;
}

const MODULE_TITLES: { prefix: string; title: string; subtitle: string }[] = [
  { prefix: "/administracion/pacientes", title: "Atención de Pacientes", subtitle: "Expedientes clínicos y consultas" },
  { prefix: "/administracion/brigadas", title: "Gestión de Brigadas", subtitle: "Planificación, estado y asignaciones" },
  { prefix: "/administracion/voluntarios", title: "Gestión de Voluntarios", subtitle: "Registro, perfiles y especialidades" },
  { prefix: "/administracion/inventario", title: "Inventario Médico", subtitle: "Medicamentos, insumos y movimientos" },
  { prefix: "/administracion/farmacia", title: "Farmacia", subtitle: "Despacho de recetas y control de stock" },
  { prefix: "/administracion/donaciones", title: "Donaciones y Ropa", subtitle: "Recepción, inventario y entregas" },
  { prefix: "/administracion/actividades-infantiles", title: "Actividades Infantiles", subtitle: "Recreación, apoyo y dinámicas comunitarias" },
  { prefix: "/administracion/ventas", title: "Ventas de Apoyo", subtitle: "Kits, artículos institucionales y recaudación" },
  { prefix: "/administracion/reportes", title: "Reportes y Estadísticas", subtitle: "Análisis de datos, atenciones y brigadas" },
  { prefix: "/administracion/usuarios", title: "Login y Usuarios", subtitle: "Administración de accesos y credenciales" },
  { prefix: "/administracion/perfil", title: "Mi Perfil", subtitle: "Información personal y cuenta" },
  { prefix: "/administracion", title: "Dashboard General", subtitle: "Resumen ejecutivo y métricas globales" },
];

export default function AdminHeader({
  displayName,
  roleLabel,
  avatarUrl,
  email,
  isCollapsed,
  onToggleSidebar,
  onToggleMobile,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find module title based on pathname
  const activeModule = MODULE_TITLES.find((m) =>
    m.prefix === "/administracion" ? pathname === "/administracion" : pathname.startsWith(m.prefix)
  ) || { title: "Sistema Integral", subtitle: "Fundación Dibujando Sonrisas" };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={styles.header100}>
      {/* LADO IZQUIERDO: Toggle ☰ + Brand + Módulo Dinámico */}
      <div className={styles.headerLeft}>
        <button
          className={styles.toggleBtn}
          onClick={onToggleSidebar}
          title={isCollapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
          aria-label="Alternar menú lateral"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            style={{ width: "2.4rem", height: "2.4rem" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <button
          className={styles.toggleMobileBtn}
          onClick={onToggleMobile}
          aria-label="Abrir menú móvil"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            style={{ width: "2.4rem", height: "2.4rem" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Identidad institucional en el Header (solo cuando el Sidebar está contraído) */}
        {isCollapsed && (
          <>
            <Link href="/" className={styles.headerBrandLink}>
              <div className={styles.headerLogoContainer}>
                <Image
                  src="/DS-LOGO.png"
                  alt="Logo Fundación Dibujando Sonrisas"
                  width={40}
                  height={40}
                  className={styles.headerLogoImg}
                  priority
                />
              </div>
              <div className={styles.headerBrandInfo}>
                <span className={styles.headerAppName}>Sistema Web de Gestión Integral</span>
                <span className={styles.headerFoundationName}>Fundación Dibujando Sonrisas</span>
              </div>
            </Link>
            <div className={styles.headerDivider} />
          </>
        )}

        <div className={styles.headerModuleBadge}>
          <span className={styles.headerModuleName}>{activeModule.title}</span>
          <span className={styles.headerModuleSub}>{activeModule.subtitle}</span>
        </div>
      </div>

      {/* LADO DERECHO: Notificaciones de Stock + Perfil de usuario + Dropdown */}
      <div className={styles.headerRight}>
        {/* Botón de notificaciones de alertas de stock mínimo */}
        <NotificacionesStockBtn />

        <div className={styles.headerRightDivider} />

        <div ref={dropdownRef} style={{ position: "relative" }}>
        <div
          className={styles.userProfileTrigger}
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <div className={styles.userProfileText}>
            <span className={styles.userProfileName}>{displayName}</span>
            <span className={styles.userRoleBadge}>{roleLabel}</span>
          </div>
          <UserAvatar avatarUrl={avatarUrl} nombres={displayName} email={email} size={38} />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`${styles.dropdownArrow} ${dropdownOpen ? styles.dropdownArrowOpen : ""}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        {dropdownOpen && (
          <div className={styles.userDropdownMenu}>
            <div className={styles.dropdownHeaderInfo}>
              <span className={styles.dropdownUserName}>{displayName}</span>
              <span className={styles.dropdownUserEmail}>{email}</span>
            </div>
            <hr className={styles.dropdownDivider} />
            <Link
              href="/administracion/perfil"
              className={styles.dropdownItem}
              onClick={() => setDropdownOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Mi Perfil
            </Link>
            <form action={logoutAction}>
              <button type="submit" className={`${styles.dropdownItem} ${styles.dropdownLogout}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
                Cerrar Sesión
              </button>
            </form>
          </div>
        )}
        </div>
      </div>
    </header>
  );
}
