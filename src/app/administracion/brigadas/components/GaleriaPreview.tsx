"use client";

import React, { useTransition, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cambiarPortada, eliminarImagenBrigada, reordenarGaleria } from "../actions";
import styles from "@/styles/pages/admin.module.css";

// SVG Icons (Sin emojis)
function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export type BrigadaImagenRow = {
  id: string;
  brigada_id: string;
  nombre_archivo: string;
  portada: boolean;
  orden: number;
  created_at: string;
};

type GaleriaPreviewProps = {
  brigadaId: string;
  brigadaCodigo: string;
  imagenes: BrigadaImagenRow[];
  onReload: () => void;
  isReadOnly?: boolean;
};

export default function GaleriaPreview({
  brigadaId,
  brigadaCodigo,
  imagenes,
  onReload,
  isReadOnly = false,
}: GaleriaPreviewProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<BrigadaImagenRow | null>(null);

  // Obtener URL pública desde el bucket 'brigadas' en Supabase Storage
  const getPublicUrl = (filename: string) => {
    const { data } = supabase.storage
      .from("brigadas")
      .getPublicUrl(`${brigadaCodigo}/${filename}`);
    return data.publicUrl;
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    const img = deleteTarget;
    setDeleteTarget(null);

    startTransition(async () => {
      try {
        // Invocar Server Action autenticada que borra de Storage y de la BD
        const res = await eliminarImagenBrigada(img.id, brigadaCodigo, img.nombre_archivo);
        if (res.error) throw new Error(res.error);

        onReload();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error al eliminar la imagen.");
      }
    });
  };

  const handleSetCover = (img: BrigadaImagenRow) => {
    startTransition(async () => {
      try {
        const res = await cambiarPortada(brigadaId, img.id);
        if (res.error) throw new Error(res.error);
        onReload();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error al establecer la portada.");
      }
    });
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= imagenes.length) return;

    startTransition(async () => {
      try {
        const rearranged = [...imagenes];
        const temp = rearranged[index];
        rearranged[index] = rearranged[newIndex];
        rearranged[newIndex] = temp;

        const ids = rearranged.map((img) => img.id);
        const res = await reordenarGaleria(ids);
        if (res.error) throw new Error(res.error);

        onReload();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error al reordenar.");
      }
    });
  };

  return (
    <>
      <div
        className={styles.tableContainer}
        style={{ padding: "2.4rem", display: "flex", flexDirection: "column", gap: "1.8rem" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.6rem", fontWeight: "700" }}>
            Fotografías Guardadas en Galería ({imagenes.length})
          </h3>
          <span style={{ fontSize: "1.2rem", color: "var(--gray)" }}>
            Carpeta: <code>brigadas/{brigadaCodigo}/</code>
          </span>
        </div>

        {imagenes.length === 0 ? (
          <div style={{ padding: "3rem 2rem", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
            <p style={{ color: "var(--gray)", fontSize: "1.4rem", margin: 0 }}>
              Esta brigada aún no cuenta con fotografías subidas. Utiliza el panel superior para cargar imágenes.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "2rem",
            }}
          >
            {imagenes.map((img, i) => {
              const url = getPublicUrl(img.nombre_archivo);

              return (
                <div
                  key={img.id}
                  style={{
                    position: "relative",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: img.portada ? "3px solid #16a34a" : "1px solid var(--border-color)",
                    background: "var(--white)",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Elemento de Imagen */}
                  <div style={{ aspectRatio: "1.4", overflow: "hidden", position: "relative", background: "#f8fafc" }}>
                    <img
                      src={url}
                      alt={img.nombre_archivo}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                    {img.portada && (
                      <span
                        style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          background: "#16a34a",
                          color: "#fff",
                          padding: "0.3rem 0.8rem",
                          borderRadius: "4px",
                          fontSize: "1.1rem",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <StarIcon /> Portada Principal
                      </span>
                    )}
                  </div>

                  {/* Panel Inferior de Gestión */}
                  <div
                    style={{
                      padding: "1.2rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                      flexGrow: 1,
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.2rem",
                        color: "var(--gray)",
                        wordBreak: "break-all",
                        fontFamily: "monospace",
                      }}
                    >
                      {img.nombre_archivo}
                    </span>

                    {/* Botones de Reordenamiento */}
                    {!isReadOnly && (
                      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                        <button
                          type="button"
                          className={styles.btnSecondary}
                          onClick={() => handleMove(i, -1)}
                          disabled={i === 0 || isPending}
                          title="Mover hacia la izquierda"
                          aria-label="Mover izquierda"
                          style={{
                            flex: 1,
                            padding: "0.4rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: i === 0 ? 0.3 : 1,
                          }}
                        >
                          <ChevronLeftIcon />
                        </button>
                        <span
                          style={{
                            fontSize: "1.2rem",
                            fontWeight: "700",
                            minWidth: "24px",
                            textAlign: "center",
                          }}
                        >
                          {img.orden}
                        </span>
                        <button
                          type="button"
                          className={styles.btnSecondary}
                          onClick={() => handleMove(i, 1)}
                          disabled={i === imagenes.length - 1 || isPending}
                          title="Mover hacia la derecha"
                          aria-label="Mover derecha"
                          style={{
                            flex: 1,
                            padding: "0.4rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: i === imagenes.length - 1 ? 0.3 : 1,
                          }}
                        >
                          <ChevronRightIcon />
                        </button>
                      </div>
                    )}

                    {/* Acciones de Portada y Eliminación Individual */}
                    {!isReadOnly && (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.8rem",
                          borderTop: "1px solid var(--border-color)",
                          paddingTop: "1rem",
                        }}
                      >
                        <button
                          type="button"
                          className={styles.linkBtn}
                          onClick={() => handleSetCover(img)}
                          disabled={img.portada || isPending}
                          style={{ flex: 1, fontSize: "1.2rem", textAlign: "center" }}
                        >
                          {img.portada ? "Es Portada" : "Fijar Portada"}
                        </button>
                        <button
                          type="button"
                          className={styles.linkBtnDanger}
                          onClick={() => setDeleteTarget(img)}
                          disabled={isPending}
                          style={{ flex: 1, fontSize: "1.2rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                        >
                          <TrashIcon /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Advertencia HCI al eliminar foto individual */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => setDeleteTarget(null)}>
          <div
            className={`${styles.modal} ${styles.modalSm}`}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="delete-photo-title"
          >
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#dc2626" }}>
                <AlertTriangleIcon />
                <h3 id="delete-photo-title">¿Eliminar Fotografía?</h3>
              </div>
            </div>
            <p className={styles.confirmText}>
              Se eliminará permanentemente el archivo <strong>{deleteTarget.nombre_archivo}</strong> de Supabase Storage y de la base de datos de esta brigada.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={confirmDelete}
                disabled={isPending}
              >
                {isPending ? "Eliminando..." : "Sí, Eliminar de Storage"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
