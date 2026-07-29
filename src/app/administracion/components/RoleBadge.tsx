import type { AppRole } from "@/lib/auth/roles";
import { ROLE_LABELS } from "@/lib/auth/roles";
import styles from "@/styles/pages/admin.module.css";

type RoleBadgeProps = {
  role: AppRole;
};

export default function RoleBadge({ role }: RoleBadgeProps) {
  let badgeClass = styles.badgeSecondary;

  switch (role) {
    case "admin":
      badgeClass = styles.badgeDanger;
      break;
    case "coordinador":
      badgeClass = styles.badgeInfo;
      break;
    case "atencion_pacientes":
      badgeClass = styles.badgePrimary;
      break;
    case "encargado_farmacia":
      badgeClass = styles.badgeWarning;
      break;
    case "encargado_bodega":
      badgeClass = styles.badgeSecondary;
      break;
  }

  return (
    <span className={`${styles.badge} ${badgeClass}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}
