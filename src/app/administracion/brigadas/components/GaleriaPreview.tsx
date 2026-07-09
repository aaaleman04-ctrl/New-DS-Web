"use client";

import React, { useTransition } from "react";
import { supabase } from "@/lib/supabase";
import { cambiarPortada, eliminarImagenBrigada, reordenarGaleria } from "../actions";
import styles from "@/styles/pages/admin.module.css";

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

  // Get public URLs from Storage based on filename
  const getPublicUrl = (filename: string) => {
    const { data } = supabase.storage
      .from("brigadas")
      .getPublicUrl(`${brigadaCodigo}/${filename}`);
    return data.publicUrl;
  };

  const handleDelete = (img: BrigadaImagenRow) => {
    const confirm = window.confirm(`¿Estás seguro de que deseas eliminar la imagen ${img.nombre_archivo}?`);
    if (!confirm) return;

    startTransition(async () => {
      try {
        const bucketName = "brigadas";
        const path = `${brigadaCodigo}/${img.nombre_archivo}`;

        // 1. Delete from Supabase Storage
        const { error: storageError } = await supabase.storage.from(bucketName).remove([path]);
        if (storageError) {
          console.error("Warning: Failed to delete image from storage:", storageError.message);
        }

        // 2. Delete from database
        const res = await eliminarImagenBrigada(img.id);
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
        // Swap elements in local copy
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
    <div
      className={styles.tableContainer}
      style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.6rem" }}
    >
      <h3 style={{ fontSize: "1.6rem", fontWeight: "bold" }}>Galería de la Brigada ({imagenes.length})</h3>

      {imagenes.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--gray)", fontSize: "1.4rem", padding: "2rem" }}>
          No hay fotografías en la galería de esta brigada.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
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
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: img.portada ? "3px solid #10b981" : "1px solid var(--border-color)",
                  background: "var(--bg-light)",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
                }}
              >
                {/* Image element */}
                <div style={{ aspectRatio: "1.5", overflow: "hidden", position: "relative" }}>
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
                        background: "#10b981",
                        color: "#fff",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "4px",
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                      }}
                    >
                      ★ Principal
                    </span>
                  )}
                </div>

                {/* Info and Reorder Row */}
                <div
                  style={{
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                    flexGrow: 1,
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.1rem",
                      color: "var(--gray)",
                      wordBreak: "break-all",
                      display: "block",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {img.nombre_archivo}
                  </span>

                  {/* Reorder Buttons (Move left/right) */}
                  {!isReadOnly && (
                    <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleMove(i, -1)}
                        disabled={i === 0 || isPending}
                        style={{
                          flex: 1,
                          padding: "0.4rem",
                          fontSize: "1.2rem",
                          cursor: i === 0 ? "not-allowed" : "pointer",
                          opacity: i === 0 ? 0.3 : 1,
                        }}
                      >
                        ◀
                      </button>
                      <span
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                          alignSelf: "center",
                          minWidth: "24px",
                          textAlign: "center",
                        }}
                      >
                        {img.orden}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMove(i, 1)}
                        disabled={i === imagenes.length - 1 || isPending}
                        style={{
                          flex: 1,
                          padding: "0.4rem",
                          fontSize: "1.2rem",
                          cursor: i === imagenes.length - 1 ? "not-allowed" : "pointer",
                          opacity: i === imagenes.length - 1 ? 0.3 : 1,
                        }}
                      >
                        ▶
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!isReadOnly && (
                    <div
                      style={{
                        display: "flex",
                        gap: "0.8rem",
                        marginTop: "0.6rem",
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: "0.8rem",
                      }}
                    >
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => handleSetCover(img)}
                        disabled={img.portada || isPending}
                        style={{ flex: 1, fontSize: "1.2rem", padding: "0.4rem 0" }}
                      >
                        {img.portada ? "Portada" : "Usar Portada"}
                      </button>
                      <button
                        type="button"
                        className={styles.linkBtnDanger}
                        onClick={() => handleDelete(img)}
                        disabled={isPending}
                        style={{ flex: 1, fontSize: "1.2rem", padding: "0.4rem 0" }}
                      >
                        Eliminar
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
  );
}
