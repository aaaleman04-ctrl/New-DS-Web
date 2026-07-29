/**
 * Utilidades de Validación Jerárquica de Entrada (Capítulo 15 - Kendall & Kendall)
 * 
 * Jerarquía de Validaciones:
 * 1. Presencia y Longitud.
 * 2. Sintaxis y Composición (Regex).
 * 3. Semántica y Rango.
 * 4. Referencias Cruzadas y Coherencia.
 * 5. Controles GUI en Frontend.
 */

import { z } from "zod";
import { validateHondurasDNI } from "../coding/codingUtils";

// Expresiones Regulares Estandarizadas
export const REGEX_PATTERNS = {
  // Teléfono de Honduras: 8 dígitos iniciando en 2 (fijo), 3, 8 o 9 (móvil)
  HONDURAS_PHONE: /^[2389]\d{7}$/,
  // Correo electrónico estándar internacional
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // Solo texto alfabético y espacios (para nombres/apellidos)
  ONLY_ALPHA: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  // Solo caracteres alfanuméricos y guiones (códigos de negocio)
  ALPHANUMERIC_CODE: /^[A-Z0-9-]+$/,
};

/**
 * Esquema de validación reutilizable para Teléfono de Honduras
 */
export const phoneHondurasSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (val) => {
      if (!val || val === "") return true;
      const clean = val.replace(/[^0-9]/g, "");
      return REGEX_PATTERNS.HONDURAS_PHONE.test(clean);
    },
    {
      message:
        "Prueba de sintaxis: El teléfono de Honduras debe tener exactamente 8 dígitos y comenzar con 2, 3, 8 o 9.",
    }
  );

/**
 * Esquema de validación reutilizable para DNI de Honduras
 */
export const dniHondurasSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (val) => {
      if (!val || val === "") return true;
      const result = validateHondurasDNI(val);
      return result.isValid;
    },
    {
      message:
        "Prueba de sintaxis y rango: DNI de Honduras inválido. Debe tener 13 dígitos numéricos y departamento (01-18) válido.",
    }
  );

/**
 * Esquema de validación reutilizable para Correo Electrónico
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Prueba de presencia: El correo electrónico es obligatorio.")
  .refine((val) => REGEX_PATTERNS.EMAIL.test(val), {
    message: "Prueba de sintaxis: Ingrese una dirección de correo electrónico válida (ej. usuario@dominio.com).",
  });

/**
 * Helper para preprocesar valores de números en formularios de React
 */
export function sanitizeNumberInput(val: unknown, fallback: number = 0): number {
  if (val === "" || val === null || val === undefined) return fallback;
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}
