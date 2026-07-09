"use client";

import React, { useState, useTransition, useRef } from "react";
import { z } from "zod";
import type { Perfil } from "@/lib/auth/session";
import { updateProfileAction, updateAvatarAction } from "../usuarios/actions";
import { supabase } from "@/lib/supabase";
import UserAvatar from "../components/UserAvatar";
import RoleBadge from "../components/RoleBadge";
import StatusBadge from "../components/StatusBadge";
import styles from "@/styles/pages/admin.module.css";

// Zod Validation Schema
const profileSchema = z.object({
  nombre_completo: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede exceder los 100 caracteres."),
  telefono: z
    .string()
    .regex(
      /^\+?[0-9\s-]{8,15}$/,
      "El número de teléfono no es válido (8 a 15 dígitos)."
    )
    .or(z.literal("")),
  fecha_nacimiento: z.string().or(z.literal("")),
  sexo: z.string().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type PerfilClientProps = {
  profile: Perfil;
  email: string;
  specialtyName: string;
};

export default function PerfilClient({
  profile,
  email,
  specialtyName,
}: PerfilClientProps) {
  const [formData, setFormData] = useState<ProfileFormValues>({
    nombre_completo: profile.nombre_completo || "",
    telefono: profile.telefono || "",
    fecha_nacimiento: profile.fecha_nacimiento || "",
    sexo: profile.sexo || "",
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ProfileFormValues, string>>
  >({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Avatar Upload State
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when editing
    if (formErrors[name as keyof ProfileFormValues]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Zod validation check
    const validation = profileSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Partial<Record<keyof ProfileFormValues, string>> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as keyof ProfileFormValues] = issue.message;
        }
      });
      setFormErrors(errors);
      showToast("Por favor corrige los errores del formulario.", "error");
      return;
    }

    startTransition(async () => {
      const response = await updateProfileAction(profile.id, formData);
      if (response?.success) {
        showToast(response.message || "Perfil guardado con éxito.", "success");
      } else {
        showToast(response?.error || "Error al actualizar perfil.", "error");
      }
    });
  };

  // Avatar upload handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 1024 * 1024 * 2) {
      showToast("La imagen no debe pesar más de 2MB.", "error");
      return;
    }

    // Validate format
    if (!file.type.startsWith("image/")) {
      showToast("El archivo seleccionado debe ser una imagen.", "error");
      return;
    }

    // Show local preview
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setUploadingAvatar(true);

    try {
      // 1. Create directory if not exists: avatars bucket check
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // 3. Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // 4. Update avatar_url in the perfiles table
      const res = await updateAvatarAction(profile.id, publicUrl);
      if (res?.success) {
        showToast("Fotografía de perfil cargada y guardada.", "success");
      } else {
        throw new Error(res?.error || "Error al actualizar la base de datos.");
      }
    } catch (err) {
      console.error(err);
      showToast(
        err instanceof Error ? err.message : "Error al subir la fotografía.",
        "error"
      );
      setLocalPreview(null); // revert preview on failure
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div>
      <div className={styles.pageIntro}>
        <h2>Mi Perfil</h2>
        <p>
          Configura tus datos personales y fotografía de perfil en la
          plataforma.
        </p>
      </div>

      <div className={styles.usersGrid}>
        {/* Formulario Principal */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h3>Información Personal</h3>
          </div>

          <form onSubmit={handleSubmit} className={styles.adminForm}>
            <div className={styles.formRow}>
              <label className={styles.formField}>
                <span>Nombre Completo *</span>
                <input
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleInputChange}
                  placeholder="Tu nombre completo"
                  required
                  disabled={isPending}
                />
                {formErrors.nombre_completo && (
                  <span className={styles.formError}>{formErrors.nombre_completo}</span>
                )}
              </label>
            </div>

            <div className={styles.formRow}>
              <label className={styles.formField}>
                <span>Número de Teléfono</span>
                <input
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="Ej: +504 9999-9999"
                  disabled={isPending}
                />
                {formErrors.telefono && (
                  <span className={styles.formError}>
                    {formErrors.telefono}
                  </span>
                )}
              </label>

              <label className={styles.formField}>
                <span>Fecha de Nacimiento</span>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
                {formErrors.fecha_nacimiento && (
                  <span className={styles.formError}>
                    {formErrors.fecha_nacimiento}
                  </span>
                )}
              </label>
            </div>

            <label className={styles.formField}>
              <span>Sexo</span>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleInputChange}
                disabled={isPending}
              >
                <option value="">Selecciona una opción</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              {formErrors.sexo && (
                <span className={styles.formError}>{formErrors.sexo}</span>
              )}
            </label>

            <div
              style={{ marginTop: "1.2rem", display: "flex", gap: "1.2rem" }}
            >
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={isPending || uploadingAvatar}
              >
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>

        {/* Tarjeta Lateral de Avatar y Roles */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h3>Fotografía y Roles</h3>
          </div>

          <div
            className={styles.adminForm}
            style={{ alignItems: "center", textAlign: "center" }}
          >
            {/* Foto de Perfil */}
            <div style={{ position: "relative", marginBottom: "1.2rem" }}>
              <UserAvatar
                avatarUrl={localPreview || profile.avatar_url}
                nombres={formData.nombre_completo || profile.nombre_completo}
                email={email}
                size={120}
              />
              {uploadingAvatar && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className={styles.spinner} />
                </div>
              )}
            </div>

            {/* Dropzone de Carga */}
            <div
              className={styles.dropzone}
              style={{ width: "100%", boxSizing: "border-box" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.dropzoneInput}
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
                style={{ display: "none" }}
              />
              <svg
                className={styles.dropzoneIcon}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                />
              </svg>
              <p className={styles.dropzoneText}>
                <strong>Sube una foto</strong> o arrástrala aquí.
              </p>
              <p className={styles.formHint}>PNG, JPG o WEBP (máx. 2MB)</p>
            </div>

            <hr
              style={{
                width: "100%",
                border: "none",
                borderTop: "1px solid var(--border-color)",
                margin: "1.2rem 0",
              }}
            />

            {/* Detalles de Cuenta (Read Only) */}
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--dark)",
                    fontSize: "1.4rem",
                  }}
                >
                  Correo:
                </span>
                <span style={{ color: "var(--gray)", fontSize: "1.4rem" }}>
                  {email}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--dark)",
                    fontSize: "1.4rem",
                  }}
                >
                  Rol:
                </span>
                <RoleBadge role={profile.rol} />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--dark)",
                    fontSize: "1.4rem",
                  }}
                >
                  Especialidad:
                </span>
                <span style={{ color: "var(--gray)", fontSize: "1.4rem" }}>
                  {specialtyName}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--dark)",
                    fontSize: "1.4rem",
                  }}
                >
                  Cargo:
                </span>
                <span style={{ color: "var(--gray)", fontSize: "1.4rem" }}>
                  {profile.cargo || "Ninguno"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--dark)",
                    fontSize: "1.4rem",
                  }}
                >
                  Estado:
                </span>
                <StatusBadge activo={profile.activo} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast de Notificaciones */}
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
