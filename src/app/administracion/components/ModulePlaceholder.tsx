import styles from "@/styles/pages/admin.module.css";

export default function ModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className={styles.placeholder}>
      <div className={styles.placeholderIcon} aria-hidden="true">
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
            d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.59m8.032-4.067c.32-.322.598-.686.82-1.075a48.422 48.422 0 0 0-6.837-5.59m6.837 5.59a48.424 48.424 0 0 1-6.828 5.59M6.75 21A2.25 2.25 0 0 1 4.5 18.75V5.25A2.25 2.25 0 0 1 6.75 3h10.5A2.25 2.25 0 0 1 19.5 5.25v13.5A2.25 2.25 0 0 1 17.25 21H6.75Z"
          />
        </svg>
      </div>
      <h2>{title}</h2>
      <p>
        {description ??
          "Este módulo estará disponible próximamente. Por ahora puedes navegar desde el menú lateral."}
      </p>
      <span className={`${styles.badge} ${styles.badgeWarning}`}>
        Próximamente
      </span>
    </div>
  );
}
