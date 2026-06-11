"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { assertPermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { isAppRole, type AppRole } from "@/lib/auth/roles";

export type UserRoleActionState = {
  success?: boolean;
  error?: string;
  message?: string;
} | null;

export async function upsertUserRoleAction(
  _prev: UserRoleActionState,
  formData: FormData
): Promise<UserRoleActionState> {
  try {
    await assertPermission(PERMISSIONS.USERS_MANAGE);
    const supabase = await createSupabaseServerClient();

    const userId = (formData.get("user_id") as string)?.trim();
    const role = (formData.get("role") as string)?.trim();

    if (!userId || !isAppRole(role)) {
      return { error: "Usuario (UUID) y rol válidos son obligatorios." };
    }

    const { error } = await supabase.from("user_roles").upsert(
      {
        user_id: userId,
        role: role as AppRole,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      return { error: `No se pudo asignar el rol: ${error.message}` };
    }

    revalidatePath("/administracion/usuarios");
    return {
      success: true,
      message: "Rol asignado exitosamente.",
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error al asignar rol.",
    };
  }
}

export async function deleteUserRoleAction(
  userId: string
): Promise<UserRoleActionState> {
  try {
    await assertPermission(PERMISSIONS.USERS_MANAGE);
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (error) {
      return { error: `No se pudo eliminar el rol: ${error.message}` };
    }

    revalidatePath("/administracion/usuarios");
    return {
      success: true,
      message: "Rol eliminado exitosamente.",
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error al eliminar rol.",
    };
  }
}
