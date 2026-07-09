"use client";

import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { subirImagenBrigada } from "../actions";
import styles from "@/styles/pages/admin.module.css";

type GaleriaUploaderProps = {
  brigadaId: string;
  brigadaCodigo: string;
  existingImages: { id: string; nombre_archivo: string; orden: number }[];
  onUploadSuccess: () => void;
  isReadOnly?: boolean;
};

type FilePreview = {
  file: File;
  previewUrl: string;
  isCover: boolean;
};

export default function GaleriaUploader({
  brigadaId,
  brigadaCodigo,
  existingImages,
  onUploadSuccess,
  isReadOnly = false,
}: GaleriaUploaderProps) {
  const [selectedImages, setSelectedImages] = useState<FilePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
    const previews = list.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isCover: false,
    }));
    setSelectedImages((prev) => [...prev, ...previews]);
  };

  const removeSelectedImage = (index: number) => {
    URL.revokeObjectURL(selectedImages[index].previewUrl);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCover = (index: number) => {
    setSelectedImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isCover: i === index ? !img.isCover : false, // toggle selection, only one cover
      }))
    );
  };

  const processImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_SIZE = 1600;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas to blob conversion failed"));
          },
          "image/webp",
          0.8
        );
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    });
  };

  const getNextGalleryIndex = () => {
    let maxIdx = 0;
    existingImages.forEach((img) => {
      const match = img.nombre_archivo.match(/^galeria-(\d+)\.webp$/);
      if (match) {
        const idx = parseInt(match[1], 10);
        if (idx > maxIdx) maxIdx = idx;
      }
    });
    return maxIdx + 1;
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) return;
    setUploading(true);
    setUploadProgress("Procesando imágenes...");

    let nextGalleryIdx = getNextGalleryIndex();

    try {
      const bucketName = "brigadas";

      for (let i = 0; i < selectedImages.length; i++) {
        const img = selectedImages[i];
        setUploadProgress(`Procesando imagen ${i + 1} de ${selectedImages.length}...`);
        
        // 1. Process image: WebP conversion, resize, compress
        const processedBlob = await processImage(img.file);

        // 2. Determine file name
        let filename = "";
        if (img.isCover) {
          filename = "principal.webp";
        } else {
          const paddedIdx = String(nextGalleryIdx).padStart(3, "0");
          filename = `galeria-${paddedIdx}.webp`;
          nextGalleryIdx++;
        }

        // Folder naming schema: CODIGO-BRIGADA/filename
        const storagePath = `${brigadaCodigo}/${filename}`;
        setUploadProgress(`Subiendo ${filename} al storage...`);

        // 3. Upload to Supabase Storage bucket
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(storagePath, processedBlob, {
            contentType: "image/webp",
            upsert: true, // Upsert true to allow changing principal.webp
          });

        if (uploadError) {
          throw new Error(`Error en storage al subir ${filename}: ${uploadError.message}`);
        }

        // 4. Save metadata in DB via Server Action
        const { error: dbError } = await subirImagenBrigada(
          brigadaId,
          filename,
          img.isCover
        );

        if (dbError) {
          throw new Error(`Error en base de datos al guardar ${filename}: ${dbError}`);
        }
      }

      setUploadProgress("Carga finalizada con éxito.");
      // Clean selected images
      selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setSelectedImages([]);
      onUploadSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error durante la subida.");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  return (
    <div
      className={styles.tableContainer}
      style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.6rem" }}
    >
      <h3 style={{ fontSize: "1.6rem", fontWeight: "bold" }}>Agregar Fotografías</h3>

      {!isReadOnly && (
        <div
          className={`${styles.dropzone} ${dragOver ? styles.dropzoneDragOver : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{ borderStyle: "dashed", cursor: "pointer" }}
        >
          <div className={styles.dropzoneIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "4rem", height: "4rem", color: "var(--primary)" }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <p className={styles.dropzoneText}>
            <strong>Haz clic o arrastra fotos aquí</strong>
            <br />
            Se redimensionarán a 1600px y se guardarán como WebP comprimido (80% calidad)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className={styles.dropzoneInput}
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ display: "none" }}
          />
        </div>
      )}

      {selectedImages.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
          {/* Previsualización */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: "1.2rem",
            }}
          >
            {selectedImages.map((img, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: img.isCover ? "3px solid #10b981" : "1px solid var(--border-color)",
                  aspectRatio: "1",
                }}
              >
                <img
                  src={img.previewUrl}
                  alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeSelectedImage(i)}
                  disabled={uploading}
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "12px",
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  ✕
                </button>

                {/* Make Cover Button */}
                <button
                  type="button"
                  onClick={() => toggleCover(i)}
                  disabled={uploading}
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    left: "4px",
                    right: "4px",
                    padding: "0.2rem",
                    borderRadius: "4px",
                    background: img.isCover ? "#10b981" : "rgba(0,0,0,0.6)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                  }}
                >
                  {img.isCover ? "★ Portada" : "Fijar Portada"}
                </button>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {uploadProgress ? (
              <span style={{ fontSize: "1.3rem", color: "var(--primary)", fontWeight: "bold" }}>
                ⏳ {uploadProgress}
              </span>
            ) : (
              <span style={{ fontSize: "1.3rem", color: "var(--gray)" }}>
                {selectedImages.length} imágenes listas para subir.
              </span>
            )}
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleUpload}
              disabled={uploading || selectedImages.length === 0}
              style={{ padding: "0.8rem 1.6rem" }}
            >
              {uploading ? "Subiendo..." : "Subir a Galería"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
