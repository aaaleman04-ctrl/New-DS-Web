export const APP_ROLES = ["admin", "staff", "medico", "odontologo"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  staff: "Staff",
  medico: "Médico",
  odontologo: "Odontólogo",
};

export function isAppRole(value: string | null | undefined): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}
