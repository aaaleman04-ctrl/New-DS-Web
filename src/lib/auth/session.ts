import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isAppRole, type AppRole } from "./roles";
import {
  canAccessRoute,
  hasPermission,
  type Permission,
} from "./permissions";

export type AuthContext = {
  user: User;
  role: AppRole;
};

export async function getCurrentUserRole(): Promise<AppRole | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data?.role || !isAppRole(data.role)) {
    return null;
  }

  return data.role;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data?.role || !isAppRole(data.role)) {
    return null;
  }

  return { user, role: data.role };
}

export async function requireAuthContext(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) {
    redirect("/auth/sin-acceso");
  }
  return ctx;
}

export async function requirePermission(permission: Permission): Promise<AuthContext> {
  const ctx = await requireAuthContext();
  if (!hasPermission(ctx.role, permission)) {
    redirect("/administracion/no-autorizado");
  }
  return ctx;
}

export async function requireRouteAccess(pathname: string): Promise<AuthContext> {
  const ctx = await requireAuthContext();
  if (!canAccessRoute(ctx.role, pathname)) {
    redirect("/administracion/no-autorizado");
  }
  return ctx;
}

export async function assertPermission(
  permission: Permission
): Promise<void> {
  const ctx = await getAuthContext();
  if (!ctx) {
    throw new Error("Debes iniciar sesión para realizar esta acción.");
  }
  if (!hasPermission(ctx.role, permission)) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
}
