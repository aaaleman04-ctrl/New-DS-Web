"use client";

import React, { useState, useRef } from "react";
import { subirImagenBrigadaStorageAction } from "../actions";
import styles from "@/styles/pages/admin.module.css";

// SVG Icons (Sin emojis)
function UploadCloudIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinIcon}>
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2 a 10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

type GaleriaUploaderProps = {
  brigadaId: string;
  brigadaCodigo: string;
  existingImages: { id: string; nombre_archivo: string; orden: number }[];
  onUploadSuccess: () => void;
  isReadOnly?: boolean;
};

type FilePreview = {
  id: string;
  file: File;
  previewUrl: string;
  isCover: boolean;
};

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

const isHeicFile = (file: File) => {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    type === "image/heic" ||
    type === "image/heif" ||
    type === "image/heic-sequence" ||
    type === "image/heif-sequence"
  );
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
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Convierte cualquier formato de imagen (incluyendo HEIC / HEIF de iPhone, PNG, WEBP, etc.)
   * al formato estándar único JPEG (.jpg) optimizado para web mediante heic2any y Canvas.
   */
  const convertImageToJpg = async (file: File): Promise<Blob> => {
    let sourceBlob: Blob = file;

    // 1. Decodificación cliente para archivos HEIC/HEIF
    if (isHeicFile(file)) {
      try {
        // @ts-ignore
        const heic2any = (await import("heic2any")).default;
        const converted = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.85,
        });
        sourceBlob = Array.isArray(converted) ? converted[0] : converted;
      } catch (heicErr) {
        throw new Error(`No se pudo decodificar la foto HEIC ${file.name}.`);
      }
    }

    // 2. Renderizado en Canvas para aplanado y compresión JPG (máximo 1600px)
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(sourceBlob);
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
          reject(new Error("No se pudo obtener el contexto del lienzo canvas."));
          return;
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Falló la conversión al formato único JPG."));
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => {
        reject(new Error(`Error al decodificar la imagen ${file.name}.`));
      };
    });
  };

  const handleFiles = async (files: FileList) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const selectedList = Array.from(files);

    const imageFiles = selectedList.filter((file) => {
      const name = file.name.toLowerCase();
      return (
        file.type.startsWith("image/") ||
        name.endsWith(".heic") ||
        name.endsWith(".heif")
      );
    });

    if (imageFiles.length === 0) {
      setErrorMsg("Selecciona únicamente archivos de imagen válidos (.jpg, .png, .webp, .heic, .heif).");
      return;
    }

    // 2. Validación de Tamaño en Cliente (< 15 MB)
    const validFiles: File[] = [];
    const overweightFiles: string[] = [];

    for (const file of imageFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        overweightFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    }

    if (overweightFiles.length > 0) {
      if (overweightFiles.length === 1) {
        setErrorMsg(`El archivo ${overweightFiles[0]} supera el límite de 15 MB. Por favor, selecciona imágenes más ligeras.`);
      } else {
        setErrorMsg(`Los siguientes archivos superan el límite de 15 MB: ${overweightFiles.join(", ")}. Por favor, selecciona imágenes más ligeras.`);
      }
    }

    if (validFiles.length === 0) return;

    setUploadStatusMsg("Generando vistas previas...");

    try {
      const newPreviews: FilePreview[] = [];

      // Procesamiento secuencial con bucle for...of para evitar saturación de memoria
      for (const file of validFiles) {
        let previewUrl = "";
        if (isHeicFile(file)) {
          try {
            // @ts-ignore
            const heic2any = (await import("heic2any")).default;
            const converted = await heic2any({
              blob: file,
              toType: "image/jpeg",
              quality: 0.7,
            });
            const jpgBlob = Array.isArray(converted) ? converted[0] : converted;
            previewUrl = URL.createObjectURL(jpgBlob);
          } catch {
            previewUrl = URL.createObjectURL(file);
          }
        } else {
          previewUrl = URL.createObjectURL(file);
        }

        newPreviews.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          previewUrl,
          isCover: false,
        });
      }

      setSelectedImages((prev) => [...prev, ...newPreviews]);
    } catch {
      setErrorMsg("Error al generar vista previa de algunas imágenes.");
    } finally {
      setUploadStatusMsg("");
    }
  };

  const removeSelectedImage = (id: string) => {
    setSelectedImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const toggleCover = (id: string) => {
    setSelectedImages((prev) =>
      prev.map((img) => ({
        ...img,
        isCover: img.id === id ? !img.isCover : false,
      }))
    );
  };

  /**
   * Subida Secuencial con Bucle For (Secuencial 1 a 1)
   * Manejo de Reintentos y Excepciones individuales por archivo para evitar saturación de red ('fetch failed').
   */
  const handleUpload = async () => {
    if (selectedImages.length === 0) return;
    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let successCount = 0;
    const failedFiles: string[] = [];

    // Bucle secuencial 1 por 1
    for (let i = 0; i < selectedImages.length; i++) {
      const item = selectedImages[i];
      const isHeic = isHeicFile(item.file);

      setUploadStatusMsg(
        isHeic
          ? `Decodificando HEIC y subiendo foto ${i + 1} de ${selectedImages.length}: ${item.file.name}...`
          : `Procesando y subiendo foto ${i + 1} de ${selectedImages.length}: ${item.file.name}...`
      );

      try {
        // 1. Convertir imagen a Blob JPG comprimido
        const jpgBlob = await convertImageToJpg(item.file);

        // 2. Crear FormData individual por archivo
        const formData = new FormData();
        formData.append("brigadaId", brigadaId);
        formData.append("brigadaCodigo", brigadaCodigo);
        formData.append("portada", item.isCover ? "true" : "false");
        formData.append("file", new File([jpgBlob], item.file.name, { type: "image/jpeg" }));

        // 3. Ejecutar subida mediante Server Action autenticada
        const res = await subirImagenBrigadaStorageAction(formData);

        if (res.error) {
          failedFiles.push(`${item.file.name} (${res.error})`);
        } else {
          successCount++;
        }
      } catch (err) {
        // Captura de excepción individual sin detener el bucle
        const errorMsgDetail = err instanceof Error ? err.message : "Error de conexión o red";
        failedFiles.push(`${item.file.name} (${errorMsgDetail})`);
      }
    }

    // Informe detallado de resultados
    if (failedFiles.length > 0) {
      setErrorMsg(
        `No se pudieron subir ${failedFiles.length} foto(s): ${failedFiles.join("; ")}.`
      );
    }

    if (successCount > 0) {
      setSuccessMsg(
        `Se subieron con éxito ${successCount} de ${selectedImages.length} fotografías a la galería.`
      );
      selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setSelectedImages([]);
      onUploadSuccess();
    }

    setUploading(false);
    setUploadStatusMsg("");
  };

  return (
    <div
      className={styles.tableContainer}
      style={{ padding: "2.4rem", display: "flex", flexDirection: "column", gap: "1.8rem" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.6rem", fontWeight: "700" }}>Cargar Fotografías a la Galería</h3>
        <span style={{ fontSize: "1.2rem", color: "var(--gray)" }}>
          Bucket: <strong>brigadas</strong> | Máx: <strong>15 MB por foto</strong>
        </span>
      </div>

      {/* Mensajes de retroalimentación HCI */}
      {successMsg && (
        <div className={styles.toastSuccess} style={{ padding: "1.2rem 1.6rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <CheckCircleIcon />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className={styles.tableError} style={{ padding: "1.2rem 1.6rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <AlertCircleIcon />
          <span>{errorMsg}</span>
        </div>
      )}

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
          style={{ borderStyle: "dashed", cursor: "pointer", padding: "3rem 2rem" }}
        >
          <div className={styles.dropzoneIcon} style={{ display: "flex", justifyContent: "center" }}>
            <UploadCloudIcon />
          </div>
          <p className={styles.dropzoneText} style={{ marginTop: "1rem" }}>
            <strong>Haz clic aquí o arrastra imágenes (JPG, PNG, HEIC de iPhone)</strong>
            <br />
            <span style={{ fontSize: "1.2rem", color: "var(--gray)" }}>
              Procesamiento secuencial seguro para <strong>HEIC / HEIF de iPhone</strong>, PNG y JPG (máx. 15 MB por imagen). Se guardarán en <strong>formato JPG (.jpg)</strong>.
            </span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.heic,.heif,.HEIC,.HEIF"
            className={styles.dropzoneInput}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
              e.target.value = "";
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ display: "none" }}
          />
        </div>
      )}

      {selectedImages.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
          <h4 style={{ fontSize: "1.4rem", fontWeight: "600", margin: 0 }}>
            Previsualización de Selección ({selectedImages.length} fotos listas)
          </h4>

          {/* Cuadrícula de miniaturas previsualizadas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "1.2rem",
            }}
          >
            {selectedImages.map((img) => (
              <div
                key={img.id}
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: img.isCover ? "3px solid #16a34a" : "1px solid var(--border-color)",
                  aspectRatio: "1",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                <img
                  src={img.previewUrl}
                  alt="Vista previa"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />

                {/* Botón de quitar selección individual */}
                <button
                  type="button"
                  onClick={() => removeSelectedImage(img.id)}
                  disabled={uploading}
                  title="Remover de la selección"
                  aria-label="Remover"
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CloseIcon />
                </button>

                {/* Botón Fijar Portada */}
                <button
                  type="button"
                  onClick={() => toggleCover(img.id)}
                  disabled={uploading}
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    left: "6px",
                    right: "6px",
                    padding: "0.3rem 0.4rem",
                    borderRadius: "4px",
                    background: img.isCover ? "#16a34a" : "rgba(0,0,0,0.65)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {img.isCover ? "Portada Principal" : "Marcar Portada"}
                </button>
              </div>
            ))}
          </div>

          {/* Fila de acciones y estado del sistema (HCI) */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginTop: "1rem" }}>
            <div>
              {uploading || uploadStatusMsg ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", color: "var(--primaryColor)", fontWeight: "600", fontSize: "1.4rem" }}>
                  <SpinnerIcon />
                  <span>{uploadStatusMsg || "Subiendo imágenes secuencialmente..."}</span>
                </div>
              ) : (
                <span style={{ fontSize: "1.3rem", color: "var(--gray)" }}>
                  Los archivos se guardarán uno a uno en <code>brigadas/{brigadaCodigo}/</code>
                </span>
              )}
            </div>

            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleUpload}
              disabled={uploading || selectedImages.length === 0}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem", padding: "0.8rem 2rem" }}
            >
              {uploading && <SpinnerIcon />}
              <span>{uploading ? "Subiendo 1 a 1..." : "Guardar en Galería"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
