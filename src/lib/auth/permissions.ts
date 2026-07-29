import type { AppRole } from "./roles";

/**
 * CATÁLOGO ÚNICO DE PERMISOS DEL SISTEMA
 * Define las capacidades granulares por módulo.
 */
export const PERMISSIONS = {
  // Módulo de Inventario
  INVENTARIO_READ: "inventario.read",
  INVENTARIO_CREATE: "inventario.create",
  INVENTARIO_UPDATE: "inventario.update",
  INVENTARIO_DELETE: "inventario.delete",

  // Módulo de Farmacia
  FARMACIA_READ: "farmacia.read",
  FARMACIA_CREATE: "farmacia.create",
  FARMACIA_UPDATE: "farmacia.update",
  FARMACIA_DELETE: "farmacia.delete",
  FARMACIA_PROCESS: "farmacia.process",

  // Módulo de Pacientes y Consultas
  PACIENTES_READ: "pacientes.read",
  PACIENTES_CREATE: "pacientes.create",
  PACIENTES_UPDATE: "pacientes.update",
  PACIENTES_DELETE: "pacientes.delete",

  // Módulo de Brigadas Médicas (Restringido EXCLUSIVAMENTE a Administrador)
  BRIGADAS_READ: "brigadas.read",
  BRIGADAS_CREATE: "brigadas.create",
  BRIGADAS_UPDATE: "brigadas.update",
  BRIGADAS_DELETE: "brigadas.delete",

  // Módulo de Reportes y Analítica
  REPORTES_READ: "reportes.read",
  REPORTES_PROCESS: "reportes.process",

  // Módulo de Usuarios y Perfiles
  USUARIOS_READ: "usuarios.read",
  USUARIOS_CREATE: "usuarios.create",
  USUARIOS_UPDATE: "usuarios.update",
  USUARIOS_DELETE: "usuarios.delete",

  // Módulo de Voluntariado
  VOLUNTARIADO_READ: "voluntariado.read",
  VOLUNTARIADO_CREATE: "voluntariado.create",
  VOLUNTARIADO_UPDATE: "voluntariado.update",
  VOLUNTARIADO_DELETE: "voluntariado.delete",

  // Módulo de Donaciones de Ropa
  DONACIONES_READ: "donaciones.read",
  DONACIONES_CREATE: "donaciones.create",
  DONACIONES_UPDATE: "donaciones.update",
  DONACIONES_DELETE: "donaciones.delete",

  // Módulo de Actividades Infantiles
  ACTIVIDADES_READ: "actividades.read",
  ACTIVIDADES_CREATE: "actividades.create",
  ACTIVIDADES_UPDATE: "actividades.update",
  ACTIVIDADES_DELETE: "actividades.delete",

  // Módulo de Ventas y Presupuestos
  VENTAS_READ: "ventas.read",
  VENTAS_CREATE: "ventas.create",
  VENTAS_UPDATE: "ventas.update",
  VENTAS_DELETE: "ventas.delete",

  // Módulo de Perfil de Usuario (Permiso Mínimo)
  PERFIL_READ: "perfil.read",
  PERFIL_UPDATE: "perfil.update",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * MATRIZ CENTRALIZADA DE PERMISOS POR ROL
 * Restricción estricta: Módulo de Brigadas EXCLUSIVO para Administrador (admin).
 */
const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  // 1. Administrador: Control Total en todos los módulos (incluyendo Brigadas)
  admin: Object.values(PERMISSIONS),

  // 2. Coordinador: Acceso general excepto Brigadas
  coordinador: [
    PERMISSIONS.PERFIL_READ,
    PERMISSIONS.PERFIL_UPDATE,
    PERMISSIONS.INVENTARIO_READ,
    PERMISSIONS.FARMACIA_READ,
    PERMISSIONS.PACIENTES_READ,
    PERMISSIONS.REPORTES_READ,
    PERMISSIONS.VOLUNTARIADO_READ,
    PERMISSIONS.VOLUNTARIADO_CREATE,
    PERMISSIONS.VOLUNTARIADO_UPDATE,
    PERMISSIONS.VOLUNTARIADO_DELETE,
    PERMISSIONS.DONACIONES_READ,
    PERMISSIONS.DONACIONES_CREATE,
    PERMISSIONS.DONACIONES_UPDATE,
    PERMISSIONS.DONACIONES_DELETE,
    PERMISSIONS.ACTIVIDADES_READ,
    PERMISSIONS.ACTIVIDADES_CREATE,
    PERMISSIONS.ACTIVIDADES_UPDATE,
    PERMISSIONS.ACTIVIDADES_DELETE,
    PERMISSIONS.VENTAS_READ,
    PERMISSIONS.VENTAS_CREATE,
    PERMISSIONS.VENTAS_UPDATE,
    PERMISSIONS.VENTAS_DELETE,
  ],

  // 3. Atención de Pacientes (Médicos / Odontólogos)
  atencion_pacientes: [
    PERMISSIONS.PERFIL_READ,
    PERMISSIONS.PERFIL_UPDATE,
    PERMISSIONS.FARMACIA_READ,
    PERMISSIONS.FARMACIA_PROCESS,
    PERMISSIONS.PACIENTES_READ,
    PERMISSIONS.PACIENTES_CREATE,
    PERMISSIONS.PACIENTES_UPDATE,
    PERMISSIONS.PACIENTES_DELETE,
    PERMISSIONS.REPORTES_PROCESS,
    PERMISSIONS.VOLUNTARIADO_READ,
    PERMISSIONS.DONACIONES_READ,
    PERMISSIONS.DONACIONES_CREATE,
    PERMISSIONS.DONACIONES_UPDATE,
    PERMISSIONS.DONACIONES_DELETE,
    PERMISSIONS.ACTIVIDADES_READ,
    PERMISSIONS.ACTIVIDADES_CREATE,
    PERMISSIONS.ACTIVIDADES_UPDATE,
    PERMISSIONS.ACTIVIDADES_DELETE,
  ],

  // 4. Encargado de Farmacia
  encargado_farmacia: [
    PERMISSIONS.PERFIL_READ,
    PERMISSIONS.PERFIL_UPDATE,
    PERMISSIONS.INVENTARIO_READ,
    PERMISSIONS.FARMACIA_READ,
    PERMISSIONS.FARMACIA_CREATE,
    PERMISSIONS.FARMACIA_UPDATE,
    PERMISSIONS.FARMACIA_DELETE,
    PERMISSIONS.FARMACIA_PROCESS,
    PERMISSIONS.PACIENTES_READ,
    PERMISSIONS.REPORTES_PROCESS,
    PERMISSIONS.DONACIONES_READ,
    PERMISSIONS.DONACIONES_CREATE,
    PERMISSIONS.DONACIONES_UPDATE,
    PERMISSIONS.DONACIONES_DELETE,
    PERMISSIONS.ACTIVIDADES_READ,
    PERMISSIONS.ACTIVIDADES_CREATE,
    PERMISSIONS.ACTIVIDADES_UPDATE,
    PERMISSIONS.ACTIVIDADES_DELETE,
  ],

  // 5. Encargado de Bodega
  encargado_bodega: [
    PERMISSIONS.PERFIL_READ,
    PERMISSIONS.PERFIL_UPDATE,
    PERMISSIONS.INVENTARIO_READ,
    PERMISSIONS.INVENTARIO_CREATE,
    PERMISSIONS.INVENTARIO_UPDATE,
    PERMISSIONS.INVENTARIO_DELETE,
    PERMISSIONS.FARMACIA_READ,
    PERMISSIONS.REPORTES_PROCESS,
    PERMISSIONS.DONACIONES_READ,
    PERMISSIONS.DONACIONES_CREATE,
    PERMISSIONS.DONACIONES_UPDATE,
    PERMISSIONS.DONACIONES_DELETE,
    PERMISSIONS.ACTIVIDADES_READ,
    PERMISSIONS.ACTIVIDADES_CREATE,
    PERMISSIONS.ACTIVIDADES_UPDATE,
    PERMISSIONS.ACTIVIDADES_DELETE,
  ],

  // 6. Voluntario (Nivel inicial / Por defecto): ÚNICAMENTE Dashboard y Perfil
  voluntario: [
    PERMISSIONS.PERFIL_READ,
    PERMISSIONS.PERFIL_UPDATE,
  ],
};

/**
 * Obtiene la lista completa de permisos asignados a un rol.
 */
export function getPermissionsForRole(role: AppRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Verifica si un rol tiene un permiso específico.
 */
export function hasPermission(
  role: AppRole | null | undefined,
  permission: Permission
): boolean {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Verifica si un rol posee AL MENOS UNO de los permisos provistos.
 */
export function hasAnyPermission(
  role: AppRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Verifica si un rol posee TODOS los permisos provistos.
 */
export function hasAllPermissions(
  role: AppRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Permiso requerido mínimo para acceder a una ruta de navegación
 */
export const MODULE_PERMISSIONS: Record<string, Permission | Permission[]> = {
  "/administracion": PERMISSIONS.PERFIL_READ,
  "/administracion/perfil": PERMISSIONS.PERFIL_READ,
  "/administracion/usuarios": PERMISSIONS.USUARIOS_READ,
  "/administracion/brigadas": PERMISSIONS.BRIGADAS_READ,
  "/administracion/voluntarios": PERMISSIONS.VOLUNTARIADO_READ,
  "/administracion/inventario": PERMISSIONS.INVENTARIO_READ,
  "/administracion/pacientes": PERMISSIONS.PACIENTES_READ,
  "/administracion/farmacia": PERMISSIONS.FARMACIA_READ,
  "/administracion/donaciones": PERMISSIONS.DONACIONES_READ,
  "/administracion/actividades-infantiles": PERMISSIONS.ACTIVIDADES_READ,
  "/administracion/ventas": PERMISSIONS.VENTAS_READ,
  "/administracion/reportes": [
    PERMISSIONS.REPORTES_READ,
    PERMISSIONS.REPORTES_PROCESS,
  ],
};

/**
 * Verifica si un rol puede acceder a una ruta protegida.
 * REGLA ESTRICTA: El módulo de Brigadas está reservado EXCLUSIVAMENTE para el Administrador.
 */
export function canAccessRoute(
  role: AppRole | null | undefined,
  pathname: string,
  _specialtyName?: string | null
): boolean {
  // Restricción EXCLUSIVA del módulo de Brigadas para Administrador
  if (pathname.startsWith("/administracion/brigadas")) {
    return role === "admin";
  }

  const entry = Object.entries(MODULE_PERMISSIONS).find(([route]) =>
    route === "/administracion"
      ? pathname === "/administracion"
      : pathname.startsWith(route)
  );

  if (!entry) return hasPermission(role, PERMISSIONS.PERFIL_READ);

  const [, required] = entry;
  const permissions = [...getPermissionsForRole(role || "voluntario")];
  const requiredArray = Array.isArray(required) ? required : [required];

  return requiredArray.some((p) => permissions.includes(p));
}
