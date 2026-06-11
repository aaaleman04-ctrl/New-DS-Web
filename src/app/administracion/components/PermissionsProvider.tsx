"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AppRole } from "@/lib/auth/roles";
import {
  getPermissionsForRole,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  type Permission,
} from "@/lib/auth/permissions";

type PermissionsContextValue = {
  role: AppRole;
  permissions: readonly Permission[];
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({
  role,
  children,
}: {
  role: AppRole;
  children: ReactNode;
}) {
  const value = useMemo<PermissionsContextValue>(() => {
    const permissions = getPermissionsForRole(role);
    return {
      role,
      permissions,
      can: (permission) => hasPermission(role, permission),
      canAny: (permissions) => hasAnyPermission(role, permissions),
      canAll: (permissions) => hasAllPermissions(role, permissions),
    };
  }, [role]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error("usePermissions debe usarse dentro de PermissionsProvider");
  }
  return ctx;
}

export function useOptionalPermissions() {
  return useContext(PermissionsContext);
}
