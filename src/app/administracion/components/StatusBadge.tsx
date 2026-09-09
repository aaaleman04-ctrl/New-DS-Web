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
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: activo ? "#10b981" : "#f43f5e",
          display: "inline-block",
        }}
      />
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}
