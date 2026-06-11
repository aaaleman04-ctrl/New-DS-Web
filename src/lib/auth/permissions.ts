import type { AppRole } from "./roles";

export const PERMISSIONS = {
  PANEL_ACCESS: "panel.access",
  BRIGADAS_READ: "brigadas.read",
  BRIGADAS_CREATE: "brigadas.create",
  BRIGADAS_UPDATE: "brigadas.update",
  BRIGADAS_DELETE: "brigadas.delete",
  USERS_MANAGE: "users.manage",
  VOLUNTARIOS_READ: "voluntarios.read",
  CONTACTO_READ: "contacto.read",
  MEDICAMENTOS_READ: "medicamentos.read",
  INVENTORY_MANAGE: "inventory.manage",
  PACIENTES_READ: "pacientes.read",
  PACIENTES_REGISTER: "pacientes.register",
  DONATIONS_MANAGE: "donations.manage",
  ACTIVITIES_READ: "activities.read",
  SALES_MANAGE: "sales.manage",
  STATS_VIEW_ALL: "stats.view_all",
  STATS_VIEW_OWN: "stats.view_own",
  SETTINGS_MANAGE: "settings.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  admin: Object.values(PERMISSIONS),
  staff: [
    PERMISSIONS.PANEL_ACCESS,
    PERMISSIONS.BRIGADAS_READ,
    PERMISSIONS.VOLUNTARIOS_READ,
    PERMISSIONS.CONTACTO_READ,
    PERMISSIONS.MEDICAMENTOS_READ,
    PERMISSIONS.PACIENTES_READ,
    PERMISSIONS.ACTIVITIES_READ,
    PERMISSIONS.STATS_VIEW_ALL,
  ],
  medico: [
    PERMISSIONS.PANEL_ACCESS,
    PERMISSIONS.BRIGADAS_READ,
    PERMISSIONS.MEDICAMENTOS_READ,
    PERMISSIONS.PACIENTES_READ,
    PERMISSIONS.PACIENTES_REGISTER,
    PERMISSIONS.STATS_VIEW_OWN,
  ],
  odontologo: [
    PERMISSIONS.PANEL_ACCESS,
    PERMISSIONS.BRIGADAS_READ,
    PERMISSIONS.MEDICAMENTOS_READ,
    PERMISSIONS.PACIENTES_READ,
    PERMISSIONS.PACIENTES_REGISTER,
    PERMISSIONS.STATS_VIEW_OWN,
  ],
};

export function getPermissionsForRole(role: AppRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(
  role: AppRole | null | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(
  role: AppRole | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(
  role: AppRole | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/** Permiso mínimo para ver un módulo en el sidebar */
export const MODULE_PERMISSIONS: Record<string, Permission | Permission[]> = {
  "/administracion": PERMISSIONS.PANEL_ACCESS,
  "/administracion/usuarios": PERMISSIONS.USERS_MANAGE,
  "/administracion/brigadas": PERMISSIONS.BRIGADAS_READ,
  "/administracion/voluntarios": PERMISSIONS.VOLUNTARIOS_READ,
  "/administracion/inventario": PERMISSIONS.MEDICAMENTOS_READ,
  "/administracion/pacientes": PERMISSIONS.PACIENTES_READ,
  "/administracion/farmacia": PERMISSIONS.MEDICAMENTOS_READ,
  "/administracion/donaciones": PERMISSIONS.DONATIONS_MANAGE,
  "/administracion/actividades-infantiles": PERMISSIONS.ACTIVITIES_READ,
  "/administracion/ventas": PERMISSIONS.SALES_MANAGE,
  "/administracion/reportes": [
    PERMISSIONS.STATS_VIEW_ALL,
    PERMISSIONS.STATS_VIEW_OWN,
  ],
};

export function canAccessRoute(
  role: AppRole | null | undefined,
  pathname: string
): boolean {
  const entry = Object.entries(MODULE_PERMISSIONS).find(([route]) =>
    route === "/administracion"
      ? pathname === "/administracion"
      : pathname.startsWith(route)
  );

  if (!entry) return hasPermission(role, PERMISSIONS.PANEL_ACCESS);

  const [, required] = entry;
  if (Array.isArray(required)) {
    return hasAnyPermission(role, required);
  }
  return hasPermission(role, required);
}
