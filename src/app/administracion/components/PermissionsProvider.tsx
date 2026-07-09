"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AppRole } from "@/lib/auth/roles";
import {
  getPermissionsForRole,
  PERMISSIONS,
  type Permission,
} from "@/lib/auth/permissions";

type PermissionsContextValue = {
  role: AppRole;
  specialtyName?: string | null;
  permissions: readonly Permission[];
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({
  role,
  specialtyName,
  children,
}: {
  role: AppRole;
  specialtyName?: string | null;
  children: ReactNode;
}) {
  const value = useMemo<PermissionsContextValue>(() => {
    const permissions = [...getPermissionsForRole(role)];
    if (role === "voluntario" && specialtyName) {
      if (
        specialtyName === "Médico General" ||
        specialtyName === "Odontólogo" ||
        specialtyName === "Enfermería"
      ) {
        permissions.push(
          PERMISSIONS.PACIENTES_READ,
          PERMISSIONS.PACIENTES_REGISTER,
          PERMISSIONS.MEDICAMENTOS_READ
        );
      } else if (specialtyName === "Farmacia") {
        permissions.push(PERMISSIONS.MEDICAMENTOS_READ);
      }
    }
    return {
      role,
      specialtyName,
      permissions,
      can: (permission) => permissions.includes(permission),
      canAny: (perms) => perms.some((p) => permissions.includes(p)),
      canAll: (perms) => perms.every((p) => permissions.includes(p)),
    };
  }, [role, specialtyName]);

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
