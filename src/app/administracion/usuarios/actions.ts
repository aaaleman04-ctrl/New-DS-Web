"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { assertPermission, getAuthContext } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";

export type ActionResponse = {
  success?: boolean;
  error?: string;
  message?: string;
} | null;

/** Actualizar datos básicos de perfil (Tarea 4) */
export async function updateProfileAction(
  userId: string,
  data: {
    nombre_completo: string;
    telefono?: string;
    fecha_nacimiento?: string;
    sexo?: string;
  }
): Promise<ActionResponse> {
  try {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Debes iniciar sesión.");

    // Only allow updating own profile, unless they are admin
    if (ctx.user.id !== userId && ctx.role !== "admin") {
      throw new Error("No tienes autorización para editar este perfil.");
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("perfiles")
      .update({
        nombre_completo: data.nombre_completo,
        telefono: data.telefono || null,
        fecha_nacimiento: data.fecha_nacimiento || null,
        sexo: data.sexo || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw new Error(error.message);

    revalidatePath("/administracion/usuarios");
    revalidatePath("/administracion/perfil");
    return {
      success: true,
      message: "Perfil actualizado exitosamente.",
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error al actualizar perfil.",
    };
  }
}

/** Actualizar la URL de avatar del perfil (Tarea 5) */
export async function updateAvatarAction(
  userId: string,
  avatarUrl: string
): Promise<ActionResponse> {
  try {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Debes iniciar sesión.");

    if (ctx.user.id !== userId && ctx.role !== "admin") {
      throw new Error("No tienes autorización para editar este avatar.");
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("perfiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw new Error(error.message);

    revalidatePath("/administracion/usuarios");
    revalidatePath("/administracion/perfil");
    return {
      success: true,
      message: "Avatar actualizado exitosamente.",
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error al actualizar avatar.",
    };
  }
}

/** Cambiar rol del usuario (Tarea 6 - Solo Admin) */
export async function changeRoleAction(
  userId: string,
  role: string
): Promise<ActionResponse> {
  try {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Debes iniciar sesión.");
    if (ctx.user.id === userId) {
      throw new Error("No puedes cambiar tu propio rol de administrador.");
    }

    await assertPermission(PERMISSIONS.USERS_MANAGE);

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("perfiles")
      .update({
        rol: role as any,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw new Error(error.message);

    revalidatePath("/administracion/usuarios");
    return {
      success: true,
      message: "Rol de usuario actualizado exitosamente.",
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error al cambiar rol.",
    };
  }
}

/** Cambiar especialidad del usuario (Tarea 6 - Solo Admin) */
export async function changeSpecialtyAction(
  userId: string,
  specialtyId: string | null
): Promise<ActionResponse> {
  try {
    await assertPermission(PERMISSIONS.USERS_MANAGE);

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("perfiles")
      .update({
        especialidad_id: specialtyId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw new Error(error.message);

    revalidatePath("/administracion/usuarios");
    return {
      success: true,
      message: "Especialidad de usuario actualizada exitosamente.",
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error al cambiar especialidad.",
    };
  }
}

/** Activar cuenta de usuario (Tarea 6 - Solo Admin) */
export async function activateUserAction(
  userId: string
): Promise<ActionResponse> {
  try {
    await assertPermission(PERMISSIONS.USERS_MANAGE);

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("perfiles")
      .update({
        activo: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw new Error(error.message);

    revalidatePath("/administracion/usuarios");
    return {
      success: true,
      message: "Cuenta de usuario activada exitosamente.",
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error al activar usuario.",
    };
  }
}

/** Desactivar cuenta de usuario (Tarea 6 - Solo Admin) */
export async function deactivateUserAction(
  userId: string
): Promise<ActionResponse> {
  try {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Debes iniciar sesión.");
    if (ctx.user.id === userId) {
      throw new Error("No puedes desactivar tu propia cuenta.");
    }

    await assertPermission(PERMISSIONS.USERS_MANAGE);

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("perfiles")
      .update({
        activo: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw new Error(error.message);

    revalidatePath("/administracion/usuarios");
    return {
      success: true,
      message: "Cuenta de usuario desactivada exitosamente.",
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error al desactivar usuario.",
    };
  }
}
