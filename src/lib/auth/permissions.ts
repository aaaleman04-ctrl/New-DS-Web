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
  coordinador: [
    PERMISSIONS.PANEL_ACCESS,
    PERMISSIONS.BRIGADAS_READ,
    PERMISSIONS.BRIGADAS_CREATE,
    PERMISSIONS.BRIGADAS_UPDATE,
    PERMISSIONS.BRIGADAS_DELETE,
    PERMISSIONS.VOLUNTARIOS_READ,
    PERMISSIONS.CONTACTO_READ,
    PERMISSIONS.MEDICAMENTOS_READ,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.PACIENTES_READ,
    PERMISSIONS.PACIENTES_REGISTER,
    PERMISSIONS.DONATIONS_MANAGE,
    PERMISSIONS.ACTIVITIES_READ,
    PERMISSIONS.SALES_MANAGE,
    PERMISSIONS.STATS_VIEW_ALL,
  ],
  voluntario: [PERMISSIONS.PANEL_ACCESS, PERMISSIONS.STATS_VIEW_OWN],
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
  "/administracion/perfil": PERMISSIONS.PANEL_ACCESS,
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
  pathname: string,
  specialtyName?: string | null
): boolean {
  const entry = Object.entries(MODULE_PERMISSIONS).find(([route]) =>
    route === "/administracion"
      ? pathname === "/administracion"
      : pathname.startsWith(route)
  );

  if (!entry) return hasPermission(role, PERMISSIONS.PANEL_ACCESS);

  const [, required] = entry;
  
  // Calculate user's effective permissions based on role + specialty
  const permissions = [...getPermissionsForRole(role || "voluntario")];
  
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

  const requiredArray = Array.isArray(required) ? required : [required];
  return requiredArray.some((p) => permissions.includes(p));
}
