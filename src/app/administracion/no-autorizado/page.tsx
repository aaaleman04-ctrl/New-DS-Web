import Link from "next/link";
import styles from "@/styles/pages/admin.module.css";

export default function NoAutorizadoPage() {
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
            d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      </div>
      <h2>Acceso no autorizado</h2>
      <p>
        Tu rol no tiene permiso para ver este módulo. Si crees que es un error,
        contacta a un administrador.
      </p>
      <Link href="/administracion" className={styles.btnPrimary}>
        Volver al dashboard
      </Link>
    </div>
  );
}
