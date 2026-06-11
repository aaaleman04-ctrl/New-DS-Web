"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import { adminModules } from "./navModules";
import { usePermissions } from "./PermissionsProvider";
import { canAccessRoute } from "@/lib/auth/permissions";
import styles from "@/styles/pages/admin.module.css";

export default function SideBar() {
  const pathname = usePathname();
  const { role } = usePermissions();

  const visibleModules = adminModules.filter((link) =>
    canAccessRoute(role, link.href)
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <p className={styles.sidebarLogo}>
            Panel<span className={styles.sidebarLogoSpan}> Admin</span>
          </p>
        </Link>
      </div>

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
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              {link.icon}
              <span className={styles.navItemLabel}>
                {link.name}
                {!link.available && (
                  <span className={styles.navSoon}>Próx.</span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <form action={logoutAction}>
          <button type="submit" className={styles.logoutBtn}>
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
            Cerrar Sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
