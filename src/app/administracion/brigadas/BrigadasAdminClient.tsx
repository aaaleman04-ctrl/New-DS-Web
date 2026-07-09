"use client";

import React, { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Brigada, EstadoBrigada } from "@/lib/db/brigadas";
import {
  crearBrigada,
  editarBrigada,
  eliminarBrigada,
  registrarGasto,
  actualizarPresupuesto,
  aceptarInscripcion,
  rechazarInscripcion,
  asignarVoluntario,
} from "./actions";
import BrigadasTable from "./components/BrigadasTable";
import BrigadaForm from "./components/BrigadaForm";
import PresupuestoCard from "./components/PresupuestoCard";
import GastosTable, { GastoRow } from "./components/GastosTable";
import InscripcionesTable, { InscripcionRow } from "./components/InscripcionesTable";
import AsignacionesTable, { PerfilRow } from "./components/AsignacionesTable";
import GaleriaUploader from "./components/GaleriaUploader";
import GaleriaPreview, { BrigadaImagenRow } from "./components/GaleriaPreview";
import styles from "@/styles/pages/admin.module.css";

type TabName = "finanzas" | "inscripciones" | "asignaciones" | "galeria";

type BrigadasAdminClientProps = {
  initialBrigadas: Brigada[];
  initialBudgets: { id: string; brigada_id: string; presupuesto_estimado: number }[];
  initialExpenses: GastoRow[];
  initialRegistrations: InscripcionRow[];
  initialAssignments: { id: string; brigada_id: string; perfil_id: string; area_asignada: string }[];
  initialProfiles: PerfilRow[];
  initialImages: BrigadaImagenRow[];
  fetchError: string | null;
};

export default function BrigadasAdminClient({
  initialBrigadas,
  initialBudgets,
  initialExpenses,
  initialRegistrations,
  initialAssignments,
  initialProfiles,
  initialImages,
  fetchError,
}: BrigadasAdminClientProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    initialBrigadas.length > 0 ? initialBrigadas[0].id : null
  );
  const [activeTab, setActiveTab] = useState<TabName>("finanzas");

  // Modals / Dialog state
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingBrigada, setEditingBrigada] = useState<Brigada | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brigada | null>(null);

  // Transitions
  const [isPending, startActionTransition] = useTransition();

  // Toast notifications
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Maps / Memoized values for summary calculations
  const budgetsMap = useMemo(() => {
    const map: Record<string, number> = {};
    initialBudgets.forEach((b) => {
      map[b.brigada_id] = b.presupuesto_estimado || 0;
    });
    return map;
  }, [initialBudgets]);

  const spentMap = useMemo(() => {
    const map: Record<string, number> = {};
    initialExpenses.forEach((e) => {
      map[e.brigada_id] = (map[e.brigada_id] || 0) + (e.monto || 0);
    });
    return map;
  }, [initialExpenses]);

  const registrationsCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    initialRegistrations.forEach((r) => {
      map[r.brigada_id] = (map[r.brigada_id] || 0) + 1;
    });
    return map;
  }, [initialRegistrations]);

  // Find active selected brigade
  const activeBrigada = useMemo(() => {
    return initialBrigadas.find((b) => b.id === selectedId) || null;
  }, [initialBrigadas, selectedId]);

  const isReadOnly = activeBrigada?.estado === "finalizada";

  // Filtered lists for the active selected brigade
  const activeExpenses = useMemo(() => {
    if (!selectedId) return [];
    return initialExpenses.filter((e) => e.brigada_id === selectedId);
  }, [initialExpenses, selectedId]);

  const activeRegistrations = useMemo(() => {
    if (!selectedId) return [];
    return initialRegistrations.filter((r) => r.brigada_id === selectedId);
  }, [initialRegistrations, selectedId]);

  const activeAssignmentsMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (selectedId) {
      initialAssignments
        .filter((a) => a.brigada_id === selectedId)
        .forEach((a) => {
          map[a.perfil_id] = a.area_asignada;
        });
    }
    return map;
  }, [initialAssignments, selectedId]);

  const activeImages = useMemo(() => {
    if (!selectedId) return [];
    return initialImages.filter((img) => img.brigada_id === selectedId);
  }, [initialImages, selectedId]);

  // 1. Create Brigade Submit Handler
  const handleCreateBrigada = async (data: Parameters<typeof crearBrigada>[0]) => {
    startActionTransition(async () => {
      const res = await crearBrigada(data);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        showToast("Brigada creada y presupuesto inicializado con éxito.", "success");
        setModalMode(null);
        if (res.id) setSelectedId(res.id);
      }
    });
  };

  // 2. Edit Brigade Submit Handler
  const handleEditBrigada = async (data: Parameters<typeof editarBrigada>[1]) => {
    if (!selectedId) return;
    startActionTransition(async () => {
      const res = await editarBrigada(selectedId, data);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        showToast("Cambios guardados con éxito.", "success");
        setModalMode(null);
      }
    });
  };

  // 3. Delete Brigade Confirm Handler
  const handleDeleteBrigada = async () => {
    if (!deleteTarget) return;
    startActionTransition(async () => {
      const res = await eliminarBrigada(deleteTarget.id);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        showToast("Brigada eliminada con éxito.", "success");
        setDeleteTarget(null);
        // Select first available or null
        const remaining = initialBrigadas.filter((b) => b.id !== deleteTarget.id);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
    });
  };

  // 4. Update Budget Action
  const handleUpdateBudget = async (newAmount: number) => {
    if (!selectedId) return;
    const res = await actualizarPresupuesto(selectedId, newAmount);
    if (res.error) {
      showToast(res.error, "error");
    } else {
      showToast("Presupuesto inicial actualizado.", "success");
    }
  };

  // 5. Gasto Save Action (insert, update, delete)
  const handleSaveGasto = async (gasto: Omit<GastoRow, "id"> & { id?: string }, isDelete = false) => {
    const res = await registrarGasto(gasto, isDelete);
    if (res.error) {
      showToast(res.error, "error");
    } else {
      showToast(
        isDelete
          ? "Gasto eliminado con éxito."
          : gasto.id
            ? "Gasto actualizado con éxito."
            : "Gasto registrado con éxito.",
        "success"
      );
    }
  };

  // 6. Accept Registration
  const handleAcceptRegistration = async (id: string) => {
    const res = await aceptarInscripcion(id);
    if (res.error) {
      showToast(res.error, "error");
    } else {
      showToast("Solicitud aceptada.", "success");
    }
  };

  // 7. Reject Registration
  const handleRejectRegistration = async (id: string) => {
    const res = await rechazarInscripcion(id);
    if (res.error) {
      showToast(res.error, "error");
    } else {
      showToast("Solicitud rechazada.", "success");
    }
  };

  // 8. Assign Volunteer to Area
  const handleAssignVolunteer = async (perfilId: string, area: string | null) => {
    if (!selectedId) return;
    const res = await asignarVoluntario(selectedId, perfilId, area);
    if (res.error) {
      showToast(res.error, "error");
    } else {
      showToast(area ? "Área asignada correctamente." : "Asignación removida.", "success");
    }
  };

  // Status badges labels/colors
  const ESTADO_LABELS: Record<EstadoBrigada, string> = {
    inscripciones_abiertas: "Inscripciones Abiertas",
    inscripciones_cerradas: "Inscripciones Cerradas",
    finalizada: "Finalizada (Solo Consulta)",
    cancelada: "Cancelada",
  };

  const ESTADO_CLASSES: Record<EstadoBrigada, string> = {
    inscripciones_abiertas: styles.badgeInfo,
    inscripciones_cerradas: styles.badgeSecondary,
    finalizada: styles.badgeDanger,
    cancelada: styles.badgeSecondary,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>
      {toast && (
        <div
          className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}
          style={{ zIndex: 1000 }}
        >
          {toast.message}
        </div>
      )}

      {fetchError && (
        <div className={styles.tableError}>
          <strong>Error de Carga:</strong> {fetchError}
        </div>
      )}

      {/* 1. Tabla de listado y filtros */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>Planificación de Brigadas</h3>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={() => {
            setEditingBrigada(null);
            setModalMode("create");
          }}
        >
          + Nueva Brigada
        </button>
      </div>

      <BrigadasTable
        brigadas={initialBrigadas}
        budgets={budgetsMap}
        spent={spentMap}
        registrationsCount={registrationsCountMap}
        selectedBrigadaId={selectedId}
        onSelect={setSelectedId}
        onEdit={(b) => {
          setEditingBrigada(b);
          setModalMode("edit");
        }}
        onDelete={setDeleteTarget}
      />

      {/* 2. Sección de Detalles y Gestión del Evento Seleccionado */}
      {activeBrigada ? (
        <div
          className={styles.tableContainer}
          style={{ padding: "2.4rem", display: "flex", flexDirection: "column", gap: "2rem", marginTop: "2rem" }}
        >
          {/* Header de Gestión */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--border-color)",
              paddingBottom: "1.6rem",
              flexWrap: "wrap",
              gap: "1.2rem",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "var(--primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Panel de Administración
              </span>
              <h2 style={{ fontSize: "2.2rem", fontWeight: "bold", color: "var(--text-color)", marginTop: "0.4rem" }}>
                {activeBrigada.nombre} ({activeBrigada.codigo})
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
              <span className={`${styles.badge} ${ESTADO_CLASSES[activeBrigada.estado]}`}>
                {ESTADO_LABELS[activeBrigada.estado]}
              </span>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => {
                  setEditingBrigada(activeBrigada);
                  setModalMode("edit");
                }}
                style={{ padding: "0.8rem 1.6rem" }}
              >
                Editar Información
              </button>
            </div>
          </div>

          {/* Warning read only */}
          {isReadOnly && (
            <div
              style={{
                padding: "1.2rem 1.6rem",
                background: "rgba(239, 68, 68, 0.05)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "8px",
                color: "var(--danger)",
                fontSize: "1.3rem",
              }}
            >
              🔒 <strong>Brigada Finalizada:</strong> Esta brigada se encuentra en modo de consulta. No se pueden realizar modificaciones en finanzas, voluntarios, galería ni permitir inscripciones.
            </div>
          )}

          {/* Tabs Navigation */}
          <div
            style={{
              display: "flex",
              borderBottom: "2px solid var(--border-color)",
              gap: "2rem",
              overflowX: "auto",
            }}
          >
            {(["finanzas", "inscripciones", "asignaciones", "galeria"] as TabName[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "1rem 0.4rem",
                  border: "none",
                  background: "none",
                  fontSize: "1.5rem",
                  fontWeight: activeTab === tab ? "bold" : "normal",
                  color: activeTab === tab ? "var(--primary)" : "var(--gray)",
                  borderBottom: activeTab === tab ? "3px solid var(--primary)" : "3px solid transparent",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  textTransform: "capitalize",
                }}
              >
                {tab === "inscripciones"
                  ? "Solicitudes"
                  : tab === "asignaciones"
                    ? "Asignar Personal"
                    : tab === "galeria"
                      ? "Fotografías"
                      : tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ marginTop: "1rem" }}>
            {activeTab === "finanzas" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>
                <PresupuestoCard
                  presupuestoEstimado={budgetsMap[activeBrigada.id] ?? 0}
                  presupuestoEjecutado={spentMap[activeBrigada.id] ?? 0}
                  onUpdateBudget={handleUpdateBudget}
                  isReadOnly={isReadOnly}
                />
                <GastosTable
                  brigadaId={activeBrigada.id}
                  gastos={activeExpenses}
                  onSaveGasto={handleSaveGasto}
                  isReadOnly={isReadOnly}
                />
              </div>
            )}

            {activeTab === "inscripciones" && (
              <InscripcionesTable
                inscripciones={activeRegistrations}
                profiles={initialProfiles}
                assignments={activeAssignmentsMap}
                onAccept={handleAcceptRegistration}
                onReject={handleRejectRegistration}
                onAssign={handleAssignVolunteer}
                isReadOnly={isReadOnly}
              />
            )}

            {activeTab === "asignaciones" && (
              <AsignacionesTable
                profiles={initialProfiles}
                assignments={activeAssignmentsMap}
                onAssign={handleAssignVolunteer}
                isReadOnly={isReadOnly}
              />
            )}

            {activeTab === "galeria" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>
                <GaleriaUploader
                  brigadaId={activeBrigada.id}
                  brigadaCodigo={activeBrigada.codigo}
                  existingImages={activeImages}
                  onUploadSuccess={() => router.refresh()}
                  isReadOnly={isReadOnly}
                />
                <GaleriaPreview
                  brigadaId={activeBrigada.id}
                  brigadaCodigo={activeBrigada.codigo}
                  imagenes={activeImages}
                  onReload={() => router.refresh()}
                  isReadOnly={isReadOnly}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: "4rem", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "12px" }}>
          <p style={{ color: "var(--gray)", fontSize: "1.5rem" }}>
            No hay brigadas registradas. Haz clic en &quot;+ Nueva Brigada&quot; para registrar la primera.
          </p>
        </div>
      )}

      {/* 3. Form Modal */}
      {modalMode && (
        <BrigadaForm
          mode={modalMode}
          brigada={editingBrigada || undefined}
          initialBudget={editingBrigada ? budgetsMap[editingBrigada.id] ?? 0 : 0}
          onClose={() => setModalMode(null)}
          onSubmit={modalMode === "create" ? handleCreateBrigada : handleEditBrigada}
          isSubmitting={isPending}
        />
      )}

      {/* 4. Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => !isPending && setDeleteTarget(null)}>
          <div
            className={`${styles.modal} ${styles.modalSm}`}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="delete-brigada-title"
          >
            <div className={styles.modalHeader}>
              <h3 id="delete-brigada-title">¿Eliminar Brigada?</h3>
            </div>
            <p className={styles.confirmText}>
              ¿Estás seguro de que deseas eliminar la brigada{" "}
              <strong>
                {deleteTarget.codigo} — {deleteTarget.nombre}
              </strong>
              ? Se eliminarán todos los presupuestos, gastos, solicitudes y asignaciones relacionadas. Esta acción
              no se puede deshacer.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={handleDeleteBrigada}
                disabled={isPending}
              >
                {isPending ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
