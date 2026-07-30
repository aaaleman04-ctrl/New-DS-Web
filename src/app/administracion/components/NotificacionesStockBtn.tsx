"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePermissions } from "./PermissionsProvider";
import { createBrowserClient } from "@supabase/ssr";
import styles from "@/styles/pages/admin.module.css";
import type { AppRole } from "@/lib/auth/roles";

/** Roles que pueden ver las alertas de stock mínimo */
const ROLES_CON_ACCESO: AppRole[] = ["admin", "encargado_farmacia", "encargado_bodega"];

interface AlertaStockItem {
  id: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  unidad: string;
  categoria: string;
}

export default function NotificacionesStockBtn() {
  const { role } = usePermissions();
  const [open, setOpen] = useState(false);
  const [alertas, setAlertas] = useState<AlertaStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  // Solo renderizar para los roles autorizados
  const tieneAcceso = ROLES_CON_ACCESO.includes(role as AppRole);

  useEffect(() => {
    if (!tieneAcceso) return;

    async function fetchAlertas() {
      setLoading(true);
      try {
        // Crear el cliente del navegador localmente para evitar que el
        // singleton de supabase.ts se evalúe en el contexto SSR del layout.
        const client = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await client
          .from("stock_actual")
          .select("medicamento_id, nombre, stock_total, stock_minimo, unidad_medida, tipo_recurso")
          .order("nombre", { ascending: true });

        if (error) throw error;

        const criticos: AlertaStockItem[] = (data || [])
          .filter((m: any) => (m.stock_total ?? 0) < (m.stock_minimo ?? 0))
          .map((m: any) => ({
            id: m.medicamento_id,
            nombre: m.nombre,
            stockActual: m.stock_total ?? 0,
            stockMinimo: m.stock_minimo ?? 0,
            unidad: m.unidad_medida || "uds",
            categoria:
              m.tipo_recurso === "insumo_medico"
                ? "Insumo Médico"
                : m.tipo_recurso === "material_brigada"
                ? "Material Brigada"
                : "Medicamento",
          }));
        setAlertas(criticos);
      } catch (err) {
        console.error("Error al cargar alertas de stock:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAlertas();
  }, [tieneAcceso]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!tieneAcceso) return null;

  const count = alertas.length;

  return (
    <div className={styles.notifWrapper} ref={ref}>
      {/* Botón campana */}
      <button
        id="btn-notificaciones-stock"
        className={styles.notifBtn}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Alertas de stock mínimo${count > 0 ? ` — ${count} críticos` : ""}`}
        title="Alertas de stock mínimo"
      >
        {/* Bell icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          style={{ width: "2.2rem", height: "2.2rem" }}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>

        {/* Badge con conteo */}
        {count > 0 && (
          <span className={styles.notifBadge} aria-label={`${count} alertas críticas`}>
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {open && (
        <div className={styles.notifDropdown} role="dialog" aria-label="Alertas de stock mínimo">
          {/* Encabezado del dropdown */}
          <div className={styles.notifDropdownHeader}>
            <div className={styles.notifDropdownTitleRow}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                style={{ width: "1.8rem", height: "1.8rem", color: "#ef4444", flexShrink: 0 }}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <span className={styles.notifDropdownTitle}>Alertas de Stock Mínimo</span>
            </div>
            {count > 0 && (
              <span className={styles.notifDropdownCount}>
                {count} {count === 1 ? "producto crítico" : "productos críticos"}
              </span>
            )}
          </div>

          <hr className={styles.dropdownDivider} />

          {/* Lista de alertas */}
          <div className={styles.notifList}>
            {loading ? (
              <p className={styles.notifEmpty}>Cargando alertas...</p>
            ) : count === 0 ? (
              <div className={styles.notifEmptyState}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  style={{ width: "3.2rem", height: "3.2rem", color: "var(--grayLight)" }}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <p className={styles.notifEmpty}>Sin alertas críticas de stock</p>
              </div>
            ) : (
              alertas.slice(0, 8).map((item) => (
                <div key={item.id} className={styles.notifItem}>
                  <div className={styles.notifItemInfo}>
                    <span className={styles.notifItemNombre}>{item.nombre}</span>
                    <span className={styles.notifItemCategoria}>{item.categoria}</span>
                  </div>
                  <div className={styles.notifItemStock}>
                    <span className={styles.notifItemStockCritico}>
                      {item.stockActual} / {item.stockMinimo} {item.unidad}
                    </span>
                    <span className={styles.notifItemBadgeCritico}>Crítico</span>
                  </div>
                </div>
              ))
            )}

            {count > 8 && (
              <p className={styles.notifMoreIndicator}>
                +{count - 8} {count - 8 === 1 ? "producto más" : "productos más"} con stock crítico
              </p>
            )}
          </div>

          {/* Pie del dropdown: link al reporte completo */}
          <hr className={styles.dropdownDivider} />
          <Link
            href="/administracion/reportes"
            className={styles.notifFooterLink}
            onClick={() => setOpen(false)}
          >
            Ver reporte completo de stock
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              style={{ width: "1.4rem", height: "1.4rem" }}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
