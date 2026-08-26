"use client";

import React, { useState } from "react";
import styles from "@/styles/pages/admin.module.css";

type PresupuestoCardProps = {
  presupuestoEstimado: number;
  presupuestoEjecutado: number;
  onUpdateBudget: (newAmount: number) => Promise<void>;
  isReadOnly?: boolean;
};

export default function PresupuestoCard({
  presupuestoEstimado,
  presupuestoEjecutado,
  onUpdateBudget,
  isReadOnly = false,
}: PresupuestoCardProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(presupuestoEstimado.toString());
  const [loading, setLoading] = useState(false);

  const disponible = presupuestoEstimado - presupuestoEjecutado;
  
  // Calculate percentage, avoid divide by zero
  const percentage = presupuestoEstimado > 0 
    ? Math.round((presupuestoEjecutado / presupuestoEstimado) * 100) 
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-HN", {
      style: "currency",
      currency: "HNL",
    }).format(amount);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(inputValue);
    if (Number.isNaN(parsed) || parsed < 0) return;
    
    setLoading(true);
    await onUpdateBudget(parsed);
    setLoading(false);
    setEditing(false);
  };

  // Determine progress bar color based on percentage
  let progressBarColor = "var(--primary)";
  if (percentage >= 100) {
    progressBarColor = "var(--danger)";
  } else if (percentage >= 80) {
    progressBarColor = "var(--warning, #f59e0b)";
  }

  return (
    <div
      className={styles.tableContainer}
      style={{
        padding: "2.4rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>Presupuesto Financiero</h3>
        {!isReadOnly && (
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => {
              setInputValue(presupuestoEstimado.toString());
              setEditing(!editing);
            }}
            style={{ padding: "0.6rem 1.2rem", fontSize: "1.3rem" }}
          >
            {editing ? "Cancelar" : "Editar Presupuesto Inicial"}
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} style={{ display: "flex", gap: "1.2rem", alignItems: "flex-end" }}>
          <div className={styles.formField} style={{ flex: 1, maxWidth: "250px", marginBottom: 0 }}>
            <span>Nuevo presupuesto estimado (HNL)</span>
            <input
              type="number"
              step="0.01"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={loading}
            style={{ padding: "1rem 1.6rem" }}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </form>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2.4rem",
          }}
        >
          {/* Inicial */}
          <div
            style={{
              padding: "1.6rem",
              borderRadius: "8px",
              background: "var(--bg-light)",
              border: "1px solid var(--border-color)",
            }}
          >
            <span style={{ fontSize: "1.2rem", color: "var(--gray)", textTransform: "uppercase" }}>
              Presupuesto Inicial
            </span>
            <h2 style={{ fontSize: "2.4rem", fontWeight: "bold", marginTop: "0.6rem", color: "var(--text-color)" }}>
              {formatCurrency(presupuestoEstimado)}
            </h2>
          </div>

          {/* Ejecutado */}
          <div
            style={{
              padding: "1.6rem",
              borderRadius: "8px",
              background: "var(--bg-light)",
              border: "1px solid var(--border-color)",
            }}
          >
            <span style={{ fontSize: "1.2rem", color: "var(--gray)", textTransform: "uppercase" }}>
              Total Gastado
            </span>
            <h2 style={{ fontSize: "2.4rem", fontWeight: "bold", marginTop: "0.6rem", color: "var(--danger)" }}>
              {formatCurrency(presupuestoEjecutado)}
            </h2>
          </div>

          {/* Disponible */}
          <div
            style={{
              padding: "1.6rem",
              borderRadius: "8px",
              background: disponible < 0 ? "rgba(var(--danger-rgb, 239, 68, 68), 0.05)" : "rgba(16, 185, 129, 0.05)",
              border: disponible < 0 ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <span style={{ fontSize: "1.2rem", color: "var(--gray)", textTransform: "uppercase" }}>
              Presupuesto Disponible
            </span>
            <h2
              style={{
                fontSize: "2.4rem",
                fontWeight: "bold",
                marginTop: "0.6rem",
                color: disponible < 0 ? "var(--danger)" : "var(--success, #10b981)",
              }}
            >
              {formatCurrency(disponible)}
            </h2>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3rem", color: "var(--gray)" }}>
          <span>Progreso del Presupuesto Ejecutado</span>
          <span style={{ fontWeight: "bold", color: percentage >= 100 ? "var(--danger)" : "inherit" }}>
            {percentage}%
          </span>
        </div>
        <div
          style={{
            height: "12px",
            width: "100%",
            backgroundColor: "var(--border-color)",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: progressBarColor,
              borderRadius: "6px",
              transition: "width 0.5s ease-in-out",
            }}
          />
        </div>
        {disponible < 0 && (
          <p style={{ fontSize: "1.2rem", color: "var(--danger)", marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <strong>Alerta:</strong> El presupuesto ejecutado ha sobrepasado el límite inicial estimado por {formatCurrency(Math.abs(disponible))}.
          </p>
        )}
      </div>
    </div>
  );
}
