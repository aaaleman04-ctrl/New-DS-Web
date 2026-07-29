"use client";

import { useState, useTransition } from "react";
import type { ProfileWithSpecialty, SpecialtyRow } from "./page";
import { APP_ROLES, ROLE_LABELS, type AppRole } from "@/lib/auth/roles";
import {
  changeRoleAction,
  changeSpecialtyAction,
  activateUserAction,
  deactivateUserAction,
} from "./actions";
import RoleBadge from "../components/RoleBadge";
import StatusBadge from "../components/StatusBadge";
import UserAvatar from "../components/UserAvatar";
import styles from "@/styles/pages/admin.module.css";

type UsuariosAdminClientProps = {
  rows: ProfileWithSpecialty[];
  specialties: SpecialtyRow[];
  fetchError: string | null;
  currentUserId: string;
};

export default function UsuariosAdminClient({
  rows,
  specialties,
  fetchError,
  currentUserId,
}: UsuariosAdminClientProps) {
  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Edit Modal State
  const [editTarget, setEditTarget] = useState<ProfileWithSpecialty | null>(
    null
  );
  const [selectedRole, setSelectedRole] = useState<AppRole>("admin");
  const [selectedSpecialtyId, setSelectedSpecialtyId] =
    useState<string>("none");
  const [selectedActive, setSelectedActive] = useState<boolean>(true);

  // Transition & UX State
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Open Edit Modal
  const openEditModal = (user: ProfileWithSpecialty) => {
    setEditTarget(user);
    setSelectedRole(user.rol);
    setSelectedSpecialtyId(user.especialidad_id || "none");
    setSelectedActive(user.activo);
  };

  // Close Edit Modal
  const closeEditModal = () => {
    if (!isPending) {
      setEditTarget(null);
    }
  };

  // Handle Save
  const handleSave = () => {
    if (!editTarget) return;

    startTransition(async () => {
      try {
        // 1. Check and update Role if changed
        if (selectedRole !== editTarget.rol) {
          const res = await changeRoleAction(editTarget.id, selectedRole);
          if (res?.error) throw new Error(res.error);
        }

        // 2. Check and update Specialty if changed
        const currentSpecId = editTarget.especialidad_id || "none";
        if (selectedSpecialtyId !== currentSpecId) {
          const specIdValue =
            selectedSpecialtyId === "none" ? null : selectedSpecialtyId;
          const res = await changeSpecialtyAction(editTarget.id, specIdValue);
          if (res?.error) throw new Error(res.error);
        }

        // 3. Check and update Active Status if changed
        if (selectedActive !== editTarget.activo) {
          const res = selectedActive
            ? await activateUserAction(editTarget.id)
            : await deactivateUserAction(editTarget.id);
          if (res?.error) throw new Error(res.error);
        }

        showToast("Usuario actualizado exitosamente.", "success");
        setEditTarget(null);
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Ocurrió un error al guardar.",
          "error"
        );
      }
    });
  };

  // Filter Logic
  const filteredRows = rows.filter((user) => {
    const fullName = (user.nombre_completo || "").toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.id.includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.rol === roleFilter;

    const matchesSpecialty =
      specialtyFilter === "all" ||
      (specialtyFilter === "none" && !user.especialidad_id) ||
      user.especialidad_id === specialtyFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.activo) ||
      (statusFilter === "inactive" && !user.activo);

    return matchesSearch && matchesRole && matchesSpecialty && matchesStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>
      {fetchError && (
        <div className={styles.tableError}>
          <strong>Error de Carga:</strong> {fetchError}
        </div>
      )}

      {/* Caja de Filtros */}
      <div className={styles.tableContainer} style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.6rem", marginBottom: "1.6rem" }}>
          Filtros de Búsqueda
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.6rem",
          }}
        >
          {/* Buscar por Nombre */}
          <div className={styles.formField}>
            <span>Buscar por nombre</span>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtrar por Rol */}
          <div className={styles.formField}>
            <span>Rol</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              {APP_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>

          {/* Filtrar por Especialidad */}
          <div className={styles.formField}>
            <span>Especialidad</span>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="all">Todas las especialidades</option>
              <option value="none">Sin especialidad</option>
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtrar por Estado */}
          <div className={styles.formField}>
            <span>Estado</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>Miembros Registrados ({filteredRows.length})</h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Miembro</th>
                <th>Rol</th>
                <th>Cargo</th>
                <th>Especialidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
                    No se encontraron miembros con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredRows.map((user) => {
                  const nameDisplay =
                    user.nombre_completo
                      ? user.nombre_completo.trim()
                      : "Usuario Nuevo (Sin Perfil)";
                  return (
                    <tr key={user.id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1.2rem",
                          }}
                        >
                          <UserAvatar
                            avatarUrl={user.avatar_url}
                            nombres={user.nombre_completo}
                            size={40}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{nameDisplay}</div>
                            <div
                              style={{
                                fontSize: "1.2rem",
                                color: "var(--gray)",
                              }}
                            >
                              ID: <code>{user.id.substring(0, 8)}...</code>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <RoleBadge role={user.rol} />
                      </td>
                      <td>
                        {user.cargo || (
                          <span style={{ color: "var(--grayLight)" }}>—</span>
                        )}
                      </td>
                      <td>
                        {user.especialidades?.nombre || (
                          <span style={{ color: "var(--grayLight)" }}>—</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge activo={user.activo} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.linkBtn}
                          onClick={() => openEditModal(user)}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición de Usuario */}
      {editTarget && (
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px" }}
          >
            <div className={styles.modalHeader}>
              <h3>Editar Miembro</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeEditModal}
                disabled={isPending}
              >
                &times;
              </button>
            </div>

            <div className={styles.adminForm}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.2rem",
                  marginBottom: "0.8rem",
                }}
              >
                <UserAvatar
                  avatarUrl={editTarget.avatar_url}
                  nombres={editTarget.nombre_completo}
                  size={56}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: "1.6rem" }}>
                    {editTarget.nombre_completo
                      ? editTarget.nombre_completo.trim()
                      : "Usuario Sin Nombre"}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1.3rem",
                      color: "var(--gray)",
                    }}
                  >
                    ID: <code>{editTarget.id}</code>
                  </p>
                </div>
              </div>

              {/* Editar Rol */}
               <label className={styles.formField}>
                 <span>Rol en la Plataforma</span>
                 <select
                   value={selectedRole}
                   onChange={(e) => setSelectedRole(e.target.value as AppRole)}
                   disabled={isPending || editTarget.id === currentUserId}
                 >
                   {APP_ROLES.map((role) => (
                     <option key={role} value={role}>
                       {ROLE_LABELS[role]}
                     </option>
                   ))}
                 </select>
                 {editTarget.id === currentUserId && (
                   <span style={{ fontSize: "1.2rem", color: "var(--gray)", marginTop: "0.4rem" }}>
                     No puedes cambiar tu propio rol de administrador.
                   </span>
                 )}
               </label>

              {/* Editar Especialidad */}
              <label className={styles.formField}>
                <span>Especialidad Médica/Odontológica</span>
                <select
                  value={selectedSpecialtyId}
                  onChange={(e) => setSelectedSpecialtyId(e.target.value)}
                  disabled={isPending}
                >
                  <option value="none">Ninguna / Administrativo</option>
                  {specialties.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.nombre}
                    </option>
                  ))}
                </select>
              </label>

              {/* Editar Estado Activo */}
              <div className={styles.formField}>
                <span>Acceso Activo</span>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    cursor: editTarget.id === currentUserId ? "not-allowed" : "pointer",
                    marginTop: "0.4rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedActive}
                    onChange={(e) => setSelectedActive(e.target.checked)}
                    disabled={isPending || editTarget.id === currentUserId}
                    style={{ width: "auto", cursor: editTarget.id === currentUserId ? "not-allowed" : "pointer" }}
                  />
                  <span style={{ fontSize: "1.4rem", fontWeight: "normal" }}>
                    Permitir acceso al panel administrativo
                  </span>
                </label>
                {editTarget.id === currentUserId && (
                  <span style={{ fontSize: "1.2rem", color: "var(--gray)", marginTop: "0.4rem" }}>
                    No puedes desactivar tu propio acceso.
                  </span>
                )}
              </div>

              {/* Mensaje de Confirmación Extra si se Desactiva */}
              {!selectedActive && editTarget.activo && (
                <div
                  style={{
                    backgroundColor: "#fee2e2",
                    border: "1px solid #fecaca",
                    borderRadius: "var(--radius-sm)",
                    padding: "1rem 1.2rem",
                    fontSize: "1.3rem",
                    color: "#b91c1c",
                  }}
                >
                  <strong>Atención:</strong> Desactivar esta cuenta bloqueará
                  inmediatamente la sesión de este usuario y no podrá volver a
                  iniciar sesión hasta ser reactivado.
                </div>
              )}

              {/* Acciones de Modal */}
              <div
                className={styles.modalActions}
                style={{ marginTop: "1rem" }}
              >
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={closeEditModal}
                  disabled={isPending}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleSave}
                  disabled={isPending}
                >
                  {isPending ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div
          className={`${styles.toast} ${
            toast.type === "success" ? styles.toastSuccess : styles.toastError
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
