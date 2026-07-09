import Link from "next/link";
import styles from "@/styles/pages/admin.module.css";
import { AppRole } from "@/lib/auth/roles";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/auth/permissions";

export default function QuickActions({ role }: { role: AppRole }) {
  const permissions = getPermissionsForRole(role);

  const actions = [
    { label: "Nueva Brigada", href: "/administracion/brigadas", icon: "🏥", perm: PERMISSIONS.BRIGADAS_CREATE },
    { label: "Registrar Paciente", href: "/administracion/pacientes/nuevo", icon: "📝", perm: PERMISSIONS.PACIENTES_REGISTER },
    { label: "Agregar Inventario", href: "/administracion/inventario", icon: "💊", perm: PERMISSIONS.INVENTORY_MANAGE },
    { label: "Registrar Venta", href: "/administracion/ventas", icon: "💲", perm: PERMISSIONS.SALES_MANAGE },
    { label: "Registrar Donación", href: "/administracion/donaciones", icon: "👕", perm: PERMISSIONS.DONATIONS_MANAGE },
  ];

  const visibleActions = actions.filter(a => permissions.includes(a.perm));

  if (visibleActions.length === 0) return null;

  return (
    <div style={{ marginBottom: "3rem" }}>
      <h3 style={{ fontSize: "1.6rem", color: "var(--dark)", marginBottom: "1.6rem" }}>Accesos Rápidos</h3>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {visibleActions.map((action, i) => (
          <Link key={i} href={action.href} style={{ textDecoration: "none" }}>
            <div className={styles.quickActionCard}>
              <span style={{ fontSize: "1.8rem" }}>{action.icon}</span>
              {action.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
