"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { Brigada } from "@/lib/db/brigadas";
import {
  createBrigadaAction,
  deleteBrigadaAction,
  updateBrigadaAction,
  type BrigadaActionState,
} from "./actions";
import Can from "../components/Can";
import { PERMISSIONS } from "@/lib/auth/permissions";
import styles from "@/styles/pages/admin.module.css";

type ModalMode = "create" | "edit" | null;

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`${styles.toast} ${type === "success" ? styles.toastSuccess : styles.toastError}`}
      role="status"
    >
      {message}
    </div>
  );
}

function BrigadaFormModal({
  mode,
  brigada,
  onClose,
  onSuccess,
}: {
  mode: "create" | "edit";
  brigada?: Brigada;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const action = mode === "create" ? createBrigadaAction : updateBrigadaAction;
  const [state, formAction, pending] = useActionState<
    BrigadaActionState,
    FormData
  >(action, null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success && state.message) {
      onSuccess(state.message);
      onClose();
    }
  }, [state, onSuccess, onClose]);

  function addFiles(newFiles: FileList | File[]) {
    const arr = Array.from(newFiles).filter(
      (f) => f.type.startsWith("image/") && f.size > 0
    );
    setSelectedFiles((prev) => [...prev, ...arr]);
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  function handleFormAction(formData: FormData) {
    // Append selected files to formData
    for (const file of selectedFiles) {
      formData.append("photos", file);
    }
    formAction(formData);
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="brigada-modal-title"
      >
        <div className={styles.modalHeader}>
          <h3 id="brigada-modal-title">
            {mode === "create" ? "Nueva Brigada" : "Editar Brigada"}
          </h3>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form action={handleFormAction} className={styles.adminForm}>
          {mode === "edit" && brigada && (
            <input type="hidden" name="id" value={brigada.id} />
          )}

          <div className={styles.formRow}>
            <label className={styles.formField}>
              <span>Número *</span>
              <input
                name="numero"
                defaultValue={brigada?.numero ?? ""}
                placeholder="Ej: 16"
                required
              />
            </label>
            <label className={styles.formField}>
              <span>Orden</span>
              <input
                name="orden"
                type="number"
                defaultValue={brigada?.orden ?? ""}
                placeholder="Ej: 16"
              />
            </label>
          </div>

          <label className={styles.formField}>
            <span>Nombre *</span>
            <input
              name="nombre"
              defaultValue={brigada?.nombre ?? ""}
              placeholder="Nombre de la brigada"
              required
            />
          </label>

          <label className={styles.formField}>
            <span>Descripción</span>
            <textarea
              name="descripcion"
              rows={3}
              defaultValue={brigada?.descripcion ?? ""}
              placeholder="Breve descripción de la brigada"
            />
          </label>

          <div className={styles.formRow}>
            <label className={styles.formField}>
              <span>Año / Fecha</span>
              <input
                name="fecha"
                defaultValue={brigada?.fecha ?? ""}
                placeholder="Ej: 2026"
              />
            </label>
            <label className={styles.formField}>
              <span>Ubicación</span>
              <input
                name="lugar"
                defaultValue={brigada?.lugar ?? ""}
                placeholder="Comunidad o lugar"
              />
            </label>
          </div>

          <div className={styles.formRow}>
            <label className={styles.formField}>
              <span>Latitud</span>
              <input
                name="lat"
                type="number"
                step="any"
                defaultValue={brigada?.lat ?? ""}
                placeholder="Ej: 14.0723"
              />
            </label>
            <label className={styles.formField}>
              <span>Longitud</span>
              <input
                name="lng"
                type="number"
                step="any"
                defaultValue={brigada?.lng ?? ""}
                placeholder="Ej: -87.1921"
              />
            </label>
          </div>

          {/* ── Dropzone de fotos ── */}
          <div className={styles.formField}>
            <span>Fotos de la brigada</span>
            <div
              className={`${styles.dropzone} ${dragOver ? styles.dropzoneDragOver : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.dropzoneIcon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className={styles.dropzoneText}>
                <strong>Haz clic o arrastra</strong> imágenes aquí
                <br />
                JPG, PNG, WEBP
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className={styles.dropzoneInput}
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {selectedFiles.length > 0 && (
              <>
                <div className={styles.photoPreviewGrid}>
                  {selectedFiles.map((file, i) => (
                    <div key={`${file.name}-${i}`} className={styles.photoPreviewItem}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                      />
                      <button
                        type="button"
                        className={styles.photoPreviewRemove}
                        onClick={() => removeFile(i)}
                        aria-label={`Quitar ${file.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <p className={styles.photoCount}>
                  {selectedFiles.length}{" "}
                  {selectedFiles.length === 1 ? "foto seleccionada" : "fotos seleccionadas"}
                </p>
              </>
            )}
          </div>

          {mode === "edit" && brigada && (
            <p className={styles.formHint}>
              ID interno (para fotos en Storage): <code>{brigada.id}</code>
            </p>
          )}

          {state?.error && (
            <p className={styles.formError} role="alert">
              {state.error}
            </p>
          )}

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={pending}
            >
              {pending
                ? "Guardando..."
                : mode === "create"
                  ? "Crear brigada"
                  : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BrigadasAdminClient({
  brigadas,
  fetchError,
}: {
  brigadas: Brigada[];
  fetchError?: string | null;
}) {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingBrigada, setEditingBrigada] = useState<Brigada | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brigada | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  function openCreate() {
    setEditingBrigada(null);
    setModalMode("create");
  }

  function openEdit(brigada: Brigada) {
    setEditingBrigada(brigada);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingBrigada(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    const result = await deleteBrigadaAction(deleteTarget.id);

    setDeleting(false);
    setDeleteTarget(null);

    if (result?.success && result.message) {
      setToast({ message: result.message, type: "success" });
    } else if (result?.error) {
      setToast({ message: result.error, type: "error" });
    }
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>Listado de Brigadas ({brigadas.length})</h3>
          <Can permission={PERMISSIONS.BRIGADAS_CREATE}>
            <button type="button" className={styles.btnPrimary} onClick={openCreate}>
              + Nueva Brigada
            </button>
          </Can>
        </div>

        {fetchError && (
          <p className={styles.tableError} role="alert">
            No se pudieron cargar las brigadas: {fetchError}
          </p>
        )}

        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Ubicación</th>
                <th>Orden</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {brigadas.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
                    No hay brigadas registradas. Crea la primera con el botón
                    &quot;+ Nueva Brigada&quot;.
                  </td>
                </tr>
              ) : (
                brigadas.map((b) => (
                  <tr key={b.id}>
                    <td>{b.numero}</td>
                    <td>
                      <strong>{b.nombre}</strong>
                      {b.descripcion && (
                        <p className={styles.tableSubtext}>{b.descripcion}</p>
                      )}
                    </td>
                    <td>{b.fecha || "—"}</td>
                    <td>{b.lugar || "—"}</td>
                    <td>{b.orden ?? "—"}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <Can permission={PERMISSIONS.BRIGADAS_UPDATE}>
                          <button
                            type="button"
                            className={styles.linkBtn}
                            onClick={() => openEdit(b)}
                          >
                            Editar
                          </button>
                        </Can>
                        <Can permission={PERMISSIONS.BRIGADAS_DELETE}>
                          <button
                            type="button"
                            className={styles.linkBtnDanger}
                            onClick={() => setDeleteTarget(b)}
                          >
                            Eliminar
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode && (
        <BrigadaFormModal
          mode={modalMode}
          brigada={editingBrigada ?? undefined}
          onClose={closeModal}
          onSuccess={(message) =>
            setToast({ message, type: "success" })
          }
        />
      )}

      {deleteTarget && (
        <div
          className={styles.modalOverlay}
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className={`${styles.modal} ${styles.modalSm}`}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="delete-title"
          >
            <div className={styles.modalHeader}>
              <h3 id="delete-title">¿Eliminar brigada?</h3>
            </div>
            <p className={styles.confirmText}>
              ¿Estás seguro de que deseas eliminar la brigada{" "}
              <strong>
                {deleteTarget.numero} — {deleteTarget.nombre}
              </strong>
              ? Esta acción no se puede deshacer.
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
                {deleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
