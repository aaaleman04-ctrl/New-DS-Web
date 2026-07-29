"use client";

import React, { useState, useMemo } from "react";
import type { Brigada, EstadoBrigada } from "@/lib/db/brigadas";
import styles from "@/styles/pages/admin.module.css";
import { usePermissions } from "@/app/administracion/components/PermissionsProvider";
import { PERMISSIONS } from "@/lib/auth/permissions";

type BrigadasTableProps = {
  brigadas: Brigada[];
  budgets: Record<string, number>; // brigada_id -> estimated
  spent: Record<string, number>; // brigada_id -> executed (spent)
  registrationsCount: Record<string, number>; // brigada_id -> count
  selectedBrigadaId: string | null;
  onSelect: (id: string) => void;
  onEdit: (b: Brigada) => void;
  onDelete: (b: Brigada) => void;
};

const ESTADO_CLASSES: Record<EstadoBrigada, string> = {
  inscripciones_abiertas: styles.badgeInfo,
  inscripciones_cerradas: styles.badgeSecondary,
  finalizada: styles.badgeDanger,
  cancelada: styles.badgeSecondary,
};

const ESTADO_LABELS: Record<EstadoBrigada, string> = {
  inscripciones_abiertas: "Inscripciones Abiertas",
  inscripciones_cerradas: "Inscripciones Cerradas",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

export default function BrigadasTable({
  brigadas,
  budgets,
  spent,
  registrationsCount,
  selectedBrigadaId,
  onSelect,
  onEdit,
  onDelete,
}: BrigadasTableProps) {
  const { can } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [placeFilter, setPlaceFilter] = useState("all");

  // Format currencies to Honduran Lempira / USD format
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-HN", {
      style: "currency",
      currency: "HNL",
    }).format(amount);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return date.toLocaleDateString("es-HN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Extract unique years for filtering
  const uniqueYears = useMemo(() => {
    const years = new Set<string>();
    brigadas.forEach((b) => {
      if (b.fecha_brigada) {
        const year = new Date(b.fecha_brigada).getFullYear().toString();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [brigadas]);

  // Extract unique places/communities for filtering
  const uniquePlaces = useMemo(() => {
    const places = new Set<string>();
    brigadas.forEach((b) => {
      if (b.lugar) places.add(b.lugar.trim());
    });
    return Array.from(places).sort();
  }, [brigadas]);

  // Apply filters and search
  const filteredBrigadas = useMemo(() => {
    return brigadas.filter((b) => {
      const matchesSearch = b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || b.estado === statusFilter;
      
      const bYear = b.fecha_brigada ? new Date(b.fecha_brigada).getFullYear().toString() : "";
      const matchesYear = yearFilter === "all" || bYear === yearFilter;
      
      const matchesPlace = placeFilter === "all" || b.lugar === placeFilter;

      return matchesSearch && matchesStatus && matchesYear && matchesPlace;
    });
  }, [brigadas, searchTerm, statusFilter, yearFilter, placeFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Filtros */}
      <div
        className={styles.tableContainer}
        style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.6rem" }}
      >
        <h3 style={{ fontSize: "1.6rem", fontWeight: "bold" }}>Filtros y Búsqueda</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.6rem",
          }}
        >
          {/* Buscador */}
          <div className={styles.formField}>
            <span>Buscar por nombre o código</span>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Estado */}
          <div className={styles.formField}>
            <span>Filtrar por Estado</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Todos los estados</option>
              <option value="inscripciones_abiertas">Inscripciones Abiertas</option>
              <option value="inscripciones_cerradas">Inscripciones Cerradas</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {/* Año */}
          <div className={styles.formField}>
            <span>Filtrar por Año</span>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
              <option value="all">Todos los años</option>
              {uniqueYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Lugar */}
          <div className={styles.formField}>
            <span>Filtrar por Comunidad</span>
            <select value={placeFilter} onChange={(e) => setPlaceFilter(e.target.value)}>
              <option value="all">Todas las comunidades</option>
              {uniquePlaces.map((pl) => (
                <option key={pl} value={pl}>
                  {pl}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>Listado de Brigadas ({filteredBrigadas.length})</h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Lugar</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>P. Estimado</th>
                <th>P. Ejecutado</th>
                <th>Inscritos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrigadas.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyCell}>
                    No se encontraron brigadas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredBrigadas.map((b) => {
                  const estBudget = budgets[b.id] ?? 0;
                  const execBudget = spent[b.id] ?? 0;
                  const inscCount = registrationsCount[b.id] ?? 0;
                  const isSelected = selectedBrigadaId === b.id;

                  return (
                    <tr
                      key={b.id}
                      style={{
                        backgroundColor: isSelected ? "rgba(var(--primary-rgb), 0.05)" : undefined,
                        cursor: "pointer",
                      }}
                      onClick={() => onSelect(b.id)}
                    >
                      <td>
                        <strong style={{ color: "var(--primary)" }}>{b.codigo}</strong>
                      </td>
                      <td>
                        <strong>{b.nombre}</strong>
                        {b.descripcion && (
                          <p
                            style={{
                              fontSize: "1.2rem",
                              color: "var(--gray)",
                              marginTop: "0.2rem",
                              maxWidth: "250px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {b.descripcion}
                          </p>
                        )}
                      </td>
                      <td>{b.lugar || "—"}</td>
                      <td>{formatDate(b.fecha_brigada)}</td>
                      <td>
                        <span className={`${styles.badge} ${ESTADO_CLASSES[b.estado]}`}>
                          {ESTADO_LABELS[b.estado]}
                        </span>
                      </td>
                      <td>{formatCurrency(estBudget)}</td>
                      <td style={{ color: execBudget > estBudget ? "var(--danger)" : "inherit" }}>
                        {formatCurrency(execBudget)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            background: "var(--bg-light)",
                            padding: "0.2rem 0.8rem",
                            borderRadius: "12px",
                            fontWeight: "bold",
                            fontSize: "1.2rem",
                          }}
                        >
                          {inscCount}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className={styles.tableActions}>
                          {can(PERMISSIONS.BRIGADAS_UPDATE) && (
                            <button
                              type="button"
                              className={styles.linkBtn}
                              onClick={() => onEdit(b)}
                            >
                              Editar
                            </button>
                          )}
                          {can(PERMISSIONS.BRIGADAS_DELETE) && (
                            <button
                              type="button"
                              className={styles.linkBtnDanger}
                              onClick={() => onDelete(b)}
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
