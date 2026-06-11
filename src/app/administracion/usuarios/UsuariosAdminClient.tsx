"use client";

import { useActionState, useState } from "react";
import {
  deleteUserRoleAction,
  upsertUserRoleAction,
  type UserRoleActionState,
} from "./actions";
import type { UserRoleRow } from "./page";
import { APP_ROLES, ROLE_LABELS, type AppRole } from "@/lib/auth/roles";
import styles from "@/styles/pages/admin.module.css";

function AssignRoleForm() {
  const [state, formAction, pending] = useActionState<
    UserRoleActionState,
    FormData
  >(upsertUserRoleAction, null);

  return (
    <form action={formAction} className={styles.adminForm}>
      <h3>Asignar o cambiar rol</h3>
      <p className={styles.formHint}>
        Obtén el UUID del usuario en Supabase → Authentication → Users.
      </p>

      <label className={styles.formField}>
        <span>User ID (UUID) *</span>
        <input name="user_id" placeholder="00000000-0000-0000-0000-000000000000" required />
      </label>

      <label className={styles.formField}>
        <span>Rol *</span>
        <select name="role" required defaultValue="staff">
          {APP_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </label>

      {state?.error && <p className={styles.formError}>{state.error}</p>}
      {state?.success && state.message && (
        <p className={styles.formSuccess}>{state.message}</p>
      )}

      <button type="submit" className={styles.btnPrimary} disabled={pending}>
        {pending ? "Guardando..." : "Guardar rol"}
      </button>
    </form>
  );
}

export default function UsuariosAdminClient({
  rows,
  fetchError,
}: {
  rows: UserRoleRow[];
  fetchError: string | null;
}) {
  const [deleteTarget, setDeleteTarget] = useState<UserRoleRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteUserRoleAction(deleteTarget.user_id);
    setDeleting(false);
    setDeleteTarget(null);
    if (result?.message) setMessage(result.message);
    if (result?.error) setMessage(result.error);
  }

  return (
    <div className={styles.usersGrid}>
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>Usuarios con rol ({rows.length})</h3>
        </div>

        {fetchError && (
          <p className={styles.tableError}>Error al cargar: {fetchError}</p>
        )}
        {message && <p className={styles.formSuccess}>{message}</p>}

        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className={styles.emptyCell}>
                    No hay usuarios con rol asignado.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.user_id}>
                    <td>
                      <code>{row.user_id}</code>
                    </td>
                    <td>{ROLE_LABELS[row.role]}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.linkBtnDanger}
                        onClick={() => setDeleteTarget(row)}
                      >
                        Quitar rol
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <AssignRoleForm />
      </div>

      {deleteTarget && (
        <div
          className={styles.modalOverlay}
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className={`${styles.modal} ${styles.modalSm}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>¿Quitar rol?</h3>
            </div>
            <p className={styles.confirmText}>
              El usuario <code>{deleteTarget.user_id}</code> perderá acceso al
              panel hasta que se le asigne un rol nuevamente.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Eliminando..." : "Sí, quitar rol"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
