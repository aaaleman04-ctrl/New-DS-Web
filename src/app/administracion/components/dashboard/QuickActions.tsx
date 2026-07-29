import Link from "next/link";
import styles from "@/styles/pages/admin.module.css";
import { AppRole } from "@/lib/auth/roles";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";

export default function QuickActions({ role }: { role: AppRole }) {
  const actions = [
    {
      label: "Nueva Brigada",
      href: "/administracion/brigadas",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: "2rem", height: "2rem" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      perm: PERMISSIONS.BRIGADAS_CREATE,
    },
    {
      label: "Registrar Paciente",
      href: "/administracion/pacientes/nuevo",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: "2rem", height: "2rem" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
      perm: PERMISSIONS.PACIENTES_CREATE,
    },
    {
      label: "Agregar Inventario",
      href: "/administracion/inventario",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: "2rem", height: "2rem" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      ),
      perm: PERMISSIONS.INVENTARIO_CREATE,
    },
    {
      label: "Registrar Venta",
      href: "/administracion/ventas",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: "2rem", height: "2rem" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5a1.5 1.5 0 0 1 1.5 1.5v9.75a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5Zm13.5 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM6 7.5h1.5v1.5H6V7.5Z" />
        </svg>
      ),
      perm: PERMISSIONS.VENTAS_CREATE,
    },
    {
      label: "Registrar Donación",
      href: "/administracion/donaciones",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: "2rem", height: "2rem" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m-6 3.75h12v9.75H6v-9.75Z" />
        </svg>
      ),
      perm: PERMISSIONS.DONACIONES_CREATE,
    },
  ];

  const visibleActions = actions.filter((a) => hasPermission(role, a.perm));

  if (visibleActions.length === 0) return null;

  return (
    <div style={{ marginBottom: "3rem" }}>
      <h3 style={{ fontSize: "1.6rem", color: "var(--dark)", marginBottom: "1.6rem" }}>Accesos Rápidos</h3>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {visibleActions.map((action, i) => (
          <Link key={i} href={action.href} style={{ textDecoration: "none" }}>
            <div className={styles.quickActionCard}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", color: "var(--primaryDark)" }}>
                {action.icon}
                <span>{action.label}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
