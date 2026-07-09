import styles from "@/styles/pages/admin.module.css";

type StatusBadgeProps = {
  activo: boolean;
};

export default function StatusBadge({ activo }: StatusBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${
        activo ? styles.badgeSuccess : styles.badgeDanger
      }`}
    >
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}
