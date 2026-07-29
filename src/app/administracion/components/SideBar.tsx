"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import { adminModules } from "./navModules";
import { usePermissions } from "./PermissionsProvider";
import {
  hasPermission,
  hasAnyPermission,
  MODULE_PERMISSIONS,
} from "@/lib/auth/permissions";
import styles from "@/styles/pages/admin.module.css";

interface SideBarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function SideBar({ isCollapsed, isMobileOpen, onCloseMobile }: SideBarProps) {
  const pathname = usePathname();
  const { role } = usePermissions();

  const visibleModules = adminModules.filter((link) => {
    const required = MODULE_PERMISSIONS[link.href];
    if (!required) return true;
    return Array.isArray(required)
      ? hasAnyPermission(role, required)
      : hasPermission(role, required);
  });

  return (
    <>
      {/* Overlay para móviles */}
      {isMobileOpen && (
        <div className={styles.mobileOverlay} onClick={onCloseMobile} />
      )}

      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""} ${
          isMobileOpen ? styles.sidebarMobileOpen : ""
        }`}
      >
        {/* Cabecera del Menú Lateral (Solo se muestra cuando el menú está EXPANDIDO) */}
        {!isCollapsed && (
          <div className={styles.sidebarHeader}>
            <Link href="/" className={styles.sidebarBrandLink} onClick={onCloseMobile}>
              <div className={styles.sidebarLogoIcon}>
                <Image
                  src="/DS-LOGO.png"
                  alt="Logo Fundación"
                  width={34}
                  height={34}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className={styles.sidebarBrandText}>
                <p className={styles.sidebarLogoTitle}>Dibujando Sonrisas</p>
                <p className={styles.sidebarLogoSub}>Fundación Honduras</p>
              </div>
            </Link>
          </div>
        )}

        {/* Lista de Navegación de Módulos */}
        <nav className={styles.sidebarNav}>
          {visibleModules.map((link) => {
            const isActive =
              link.href === "/administracion"
                ? pathname === "/administracion"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onCloseMobile}
                title={isCollapsed ? link.name : undefined}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <div className={styles.navItemIcon}>{link.icon}</div>
                {!isCollapsed && (
                  <span className={styles.navItemLabel}>
                    {link.name}
                    {!link.available && <span className={styles.navSoon}>Próx.</span>}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Pie del Menú / Cerrar Sesión */}
        <div className={styles.sidebarFooter}>
          <form action={logoutAction}>
            <button
              type="submit"
              className={styles.logoutBtn}
              title={isCollapsed ? "Cerrar Sesión" : undefined}
            >
              <div className={styles.logoutIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                  />
                </svg>
              </div>
              {!isCollapsed && <span>Cerrar Sesión</span>}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
