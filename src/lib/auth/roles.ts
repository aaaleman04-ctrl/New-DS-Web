export const APP_ROLES = [
  "admin",
  "coordinador",
  "atencion_pacientes",
  "encargado_farmacia",
  "encargado_bodega",
  "voluntario",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  coordinador: "Coordinador",
  atencion_pacientes: "Atención de Pacientes",
  encargado_farmacia: "Encargado de Farmacia",
  encargado_bodega: "Encargado de Bodega",
  voluntario: "Voluntario",
};

export function isAppRole(value: string | null | undefined): value is AppRole {
  if (!value) return false;
  return (APP_ROLES as readonly string[]).includes(value.toLowerCase());
}
