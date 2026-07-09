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
    case "voluntario":
      badgeClass = styles.badgeSuccess;
      break;
  }

  return (
    <span className={`${styles.badge} ${badgeClass}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}
