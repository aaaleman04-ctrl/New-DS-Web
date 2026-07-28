"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getBrigadas } from "@/lib/db/brigadas";
import { getMedicamentos } from "@/lib/db/inventario";
import { supabase } from "@/lib/supabase";
import { createExpedienteCompleto } from "@/lib/db/pacientes";
import styles from "@/styles/pages/admin.module.css";

export function NuevoExpedienteClient() {
  const router = useRouter();

  // Data sources
  const [brigadas, setBrigadas] = useState<any[]>([]);
  const [medicos, setMedicos] = useState<any[]>([]);
  const [medicamentosList, setMedicamentosList] = useState<any[]>([]);

  // Form State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(1); // 1 to 5

  // Errors & Messaging
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recetaError, setRecetaError] = useState<string>("");
  const [backendError, setBackendError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Refs for element focus
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const registerRef = (name: string) => (el: HTMLElement | null) => {
    fieldRefs.current[name] = el;
  };

  // 1. Paciente
  const [paciente, setPaciente] = useState<any>({
    brigada_id: "",
    nombres: "",
    apellidos: "",
    sexo: "Masculino",
    fecha_nacimiento: "",
    edad: "",
    telefono: "",
    comunidad: "",
    responsable: "",
  });

  // 2. Signos
  const [signos, setSignos] = useState<any>({
    peso: "",
    talla: "",
    temperatura: "",
    frecuencia_cardiaca: "",
    frecuencia_respiratoria: "",
    presion_arterial: "",
    saturacion: "",
    glucosa: "",
    observaciones: "",
  });

  // 3. Consulta
  const [consulta, setConsulta] = useState<any>({
    tipo_consulta: "Medica",
    medico_id: "",
    motivo_consulta: "",
    enfermedad_actual: "",
    tratamiento: "",
    requiere_postclinica: false,
    observaciones: "",
  });

  // 4. Diagnosticos
  const [diagnosticosStr, setDiagnosticosStr] = useState("");

  // 5. Medicamentos
  const [medsRecetados, setMedsRecetados] = useState<any[]>([]);
  const [newMedId, setNewMedId] = useState("");
  const [newMedCantidad, setNewMedCantidad] = useState("1");
  const [newMedIndicaciones, setNewMedIndicaciones] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [bRes, mRes, pRes] = await Promise.all([
          getBrigadas(),
          getMedicamentos(),
          supabase
            .from("perfiles")
            .select("*, especialidades:especialidad_id(id, nombre)")
            .order("nombre_completo", { ascending: true }),
        ]);
        if (mounted) {
          const activeBrigadas =
            bRes.data?.filter((b: any) => b.estado !== "finalizada" && b.estado !== "cancelada") || [];
          setBrigadas(activeBrigadas);
          setMedicamentosList(mRes || []);

          const allProfiles = pRes.data || [];
          const activeMedicos = allProfiles.filter((v: any) => {
            if (v.activo === false) return false;

            const rol = (v.rol || "").toLowerCase();
            const cargo = (v.cargo || "").toLowerCase();
            const espNombre = (v.especialidades?.nombre || "").toLowerCase();
            const nombre = (v.nombre_completo || "").toLowerCase();

            if (rol === "medico" || rol === "odontologo" || rol === "enfermero" || rol === "doctor") {
              return true;
            }

            const medicalKeywords = [
              "medic", "médic", "odontol", "odontól", "dentis", "doctor",
              "dr.", "dra.", "pediatr", "ciruj", "salud", "enfermer", "optomet", "ginec", "nutri", "general"
            ];

            const matchesEsp = medicalKeywords.some((k) => espNombre.includes(k));
            const matchesCargo = medicalKeywords.some((k) => cargo.includes(k));
            const matchesNombre = nombre.startsWith("dr.") || nombre.startsWith("dra.") || nombre.startsWith("dr ") || nombre.startsWith("dra ");

            const nonMedicalKeywords = ["logística", "logistica", "ropa", "donaciones", "actividades", "coordinación", "coordinacion"];
            const isNonMedical = nonMedicalKeywords.some((k) => espNombre.includes(k) || cargo.includes(k));

            return matchesEsp || matchesCargo || matchesNombre || (v.especialidad_id && !isNonMedical) || (v.especialidades && !isNonMedical);
          });

          activeMedicos.sort((a: any, b: any) => (a.nombre_completo || "").localeCompare(b.nombre_completo || ""));

          setMedicos(activeMedicos);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  // Helper focus function
  const focusFirstError = (errs: Record<string, string>, fieldOrder: string[]) => {
    for (const name of fieldOrder) {
      if (errs[name]) {
        const el = fieldRefs.current[name];
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        break;
      }
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Brigada
    if (!paciente.brigada_id) {
      newErrors.brigada_id = "Debe seleccionar una brigada activa obligatoriamente.";
    }

    // Nombres
    const cleanedNombres = paciente.nombres.replace(/\s+/g, " ").trim();
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!cleanedNombres) {
      newErrors.nombres = "El nombre es obligatorio.";
    } else if (cleanedNombres.length < 3 || cleanedNombres.length > 100) {
      newErrors.nombres = "Los nombres deben tener entre 3 y 100 caracteres.";
    } else if (!nameRegex.test(cleanedNombres)) {
      newErrors.nombres = "Los nombres solo deben contener letras, espacios y acentos.";
    }

    // Apellidos
    const cleanedApellidos = paciente.apellidos.replace(/\s+/g, " ").trim();
    if (!cleanedApellidos) {
      newErrors.apellidos = "Los apellidos son obligatorios.";
    } else if (cleanedApellidos.length < 3 || cleanedApellidos.length > 100) {
      newErrors.apellidos = "Los apellidos deben tener entre 3 y 100 caracteres.";
    } else if (!nameRegex.test(cleanedApellidos)) {
      newErrors.apellidos = "Los apellidos solo deben contener letras, espacios y acentos.";
    }

    // Sexo
    if (!paciente.sexo) {
      newErrors.sexo = "El sexo es obligatorio.";
    }

    // Edad
    if (paciente.edad === "" || paciente.edad === null || paciente.edad === undefined) {
      newErrors.edad = "La edad es obligatoria.";
    } else {
      const numEdad = Number(paciente.edad);
      if (isNaN(numEdad) || !Number.isInteger(numEdad) || numEdad < 0 || numEdad > 120) {
        newErrors.edad = "La edad debe ser un número entero entre 0 y 120.";
      }
    }

    // Teléfono (Opcional, 8 dígitos si se ingresa)
    if (paciente.telefono) {
      const phoneClean = paciente.telefono.trim();
      if (!/^\d{8}$/.test(phoneClean)) {
        newErrors.telefono = "El teléfono debe contener exactamente 8 números (formato Honduras).";
      }
    }

    // Comunidad (Opcional, mínimo 3 caracteres)
    if (paciente.comunidad) {
      const comClean = paciente.comunidad.replace(/\s+/g, " ").trim();
      if (comClean.length < 3) {
        newErrors.comunidad = "La comunidad debe contener al menos 3 caracteres.";
      }
    }

    // Responsable (Obligatorio si edad < 18)
    const numEdad = Number(paciente.edad);
    if (paciente.edad !== "" && !isNaN(numEdad) && numEdad < 18) {
      const respClean = (paciente.responsable || "").replace(/\s+/g, " ").trim();
      if (!respClean) {
        newErrors.responsable = "El responsable es obligatorio para pacientes menores de 18 años.";
      } else if (respClean.length < 3) {
        newErrors.responsable = "El nombre del responsable debe tener al menos 3 caracteres.";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors, [
        "brigada_id",
        "nombres",
        "apellidos",
        "sexo",
        "edad",
        "telefono",
        "comunidad",
        "responsable",
      ]);
      return false;
    }

    return true;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Peso: 0.5 - 400 kg
    if (signos.peso !== "" && signos.peso !== null && signos.peso !== undefined) {
      const val = Number(signos.peso);
      if (isNaN(val) || val < 0.5 || val > 400) {
        newErrors.peso = "El peso debe estar entre 0.5 y 400 kg.";
      }
    }

    // Talla: 30 - 250 cm
    if (signos.talla !== "" && signos.talla !== null && signos.talla !== undefined) {
      const val = Number(signos.talla);
      if (isNaN(val) || val < 30 || val > 250) {
        newErrors.talla = "La talla debe estar entre 30 y 250 cm.";
      }
    }

    // Temperatura: 30 - 45 °C
    if (signos.temperatura !== "" && signos.temperatura !== null && signos.temperatura !== undefined) {
      const val = Number(signos.temperatura);
      if (isNaN(val) || val < 30 || val > 45) {
        newErrors.temperatura = "La temperatura debe estar entre 30 y 45 °C.";
      }
    }

    // Frecuencia cardíaca: 20 - 250 lpm
    if (signos.frecuencia_cardiaca !== "" && signos.frecuencia_cardiaca !== null && signos.frecuencia_cardiaca !== undefined) {
      const val = Number(signos.frecuencia_cardiaca);
      if (isNaN(val) || !Number.isInteger(val) || val < 20 || val > 250) {
        newErrors.frecuencia_cardiaca = "La frecuencia cardíaca debe ser un número entero entre 20 y 250 lpm.";
      }
    }

    // Frecuencia respiratoria: 5 - 80 rpm
    if (signos.frecuencia_respiratoria !== "" && signos.frecuencia_respiratoria !== null && signos.frecuencia_respiratoria !== undefined) {
      const val = Number(signos.frecuencia_respiratoria);
      if (isNaN(val) || !Number.isInteger(val) || val < 5 || val > 80) {
        newErrors.frecuencia_respiratoria = "La frecuencia respiratoria debe ser un número entero entre 5 y 80 rpm.";
      }
    }

    // Presión arterial: 120/80 format
    if (signos.presion_arterial) {
      const paClean = signos.presion_arterial.trim();
      if (!/^\d{2,3}\/\d{2,3}$/.test(paClean)) {
        newErrors.presion_arterial = "La presión arterial debe tener el formato Sistólica/Diastólica (ej. 120/80).";
      }
    }

    // Saturación: 0 - 100 %
    if (signos.saturacion !== "" && signos.saturacion !== null && signos.saturacion !== undefined) {
      const val = Number(signos.saturacion);
      if (isNaN(val) || val < 0 || val > 100) {
        newErrors.saturacion = "La saturación debe estar entre 0 y 100 %.";
      }
    }

    // Glucosa: 20 - 700 mg/dL
    if (signos.glucosa !== "" && signos.glucosa !== null && signos.glucosa !== undefined) {
      const val = Number(signos.glucosa);
      if (isNaN(val) || val < 20 || val > 700) {
        newErrors.glucosa = "La glucosa debe estar entre 20 y 700 mg/dL.";
      }
    }

    // Observaciones: Max 1000 caracteres
    if (signos.observaciones && signos.observaciones.length > 1000) {
      newErrors.observaciones = "Las observaciones no deben exceder 1000 caracteres.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors, [
        "peso",
        "talla",
        "temperatura",
        "frecuencia_cardiaca",
        "frecuencia_respiratoria",
        "presion_arterial",
        "saturacion",
        "glucosa",
        "observaciones",
      ]);
      return false;
    }

    return true;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!consulta.tipo_consulta) {
      newErrors.tipo_consulta = "El tipo de consulta es obligatorio.";
    }

    if (!consulta.medico_id) {
      newErrors.medico_id = "Debe seleccionar un médico u odontólogo obligatoriamente.";
    }

    const motivoClean = (consulta.motivo_consulta || "").trim();
    if (!motivoClean) {
      newErrors.motivo_consulta = "El motivo de consulta es obligatorio.";
    } else if (motivoClean.length < 10 || motivoClean.length > 1000) {
      newErrors.motivo_consulta = "El motivo de consulta debe tener entre 10 y 1000 caracteres.";
    }

    const enfClean = (consulta.enfermedad_actual || "").trim();
    if (!enfClean) {
      newErrors.enfermedad_actual = "La enfermedad actual es obligatoria.";
    } else if (enfClean.length < 10 || enfClean.length > 1000) {
      newErrors.enfermedad_actual = "La enfermedad actual debe tener entre 10 y 1000 caracteres.";
    }

    const tratClean = (consulta.tratamiento || "").trim();
    if (!tratClean) {
      newErrors.tratamiento = "El plan de tratamiento es obligatorio.";
    } else if (tratClean.length < 10 || tratClean.length > 1000) {
      newErrors.tratamiento = "El plan de tratamiento debe tener entre 10 y 1000 caracteres.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors, [
        "tipo_consulta",
        "medico_id",
        "motivo_consulta",
        "enfermedad_actual",
        "tratamiento",
      ]);
      return false;
    }

    return true;
  };

  // Step 4 Validation
  const validateStep4 = (): boolean => {
    const newErrors: Record<string, string> = {};

    const rawStr = diagnosticosStr.trim();
    if (!rawStr) {
      newErrors.diagnosticosStr = "Debe ingresar al menos un diagnóstico.";
    } else {
      const cleanOnlyLetters = rawStr.replace(/,/g, "").trim();
      if (!cleanOnlyLetters) {
        newErrors.diagnosticosStr = "No se permiten únicamente comas o espacios.";
      } else {
        const items = rawStr
          .split(",")
          .map((d) => d.replace(/\s+/g, " ").trim())
          .filter(Boolean);
        if (items.length === 0) {
          newErrors.diagnosticosStr = "Debe ingresar al menos un diagnóstico válido.";
        } else {
          const invalidItem = items.find((d) => d.length < 3);
          if (invalidItem) {
            newErrors.diagnosticosStr = `Cada diagnóstico debe contener al menos 3 caracteres (ej. "${invalidItem}" es muy corto).`;
          }
        }
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors, ["diagnosticosStr"]);
      return false;
    }

    return true;
  };

  // Tab Navigation Rule: validates before switching forward
  const goToTab = (targetTab: number) => {
    if (targetTab === activeTab) return;

    if (targetTab < activeTab) {
      setErrors({});
      setActiveTab(targetTab);
      return;
    }

    if (activeTab === 1 && !validateStep1()) return;
    if (activeTab === 2 && !validateStep2()) return;
    if (activeTab === 3 && !validateStep3()) return;
    if (activeTab === 4 && !validateStep4()) return;

    if (targetTab > activeTab + 1) {
      if (!validateStep1()) {
        setActiveTab(1);
        return;
      }
      if (!validateStep2()) {
        setActiveTab(2);
        return;
      }
      if (!validateStep3()) {
        setActiveTab(3);
        return;
      }
      if (!validateStep4()) {
        setActiveTab(4);
        return;
      }
    }

    setErrors({});
    setActiveTab(targetTab);
  };

  const handleAddMed = () => {
    setRecetaError("");
    const medErrorObj: Record<string, string> = {};

    if (!newMedId) {
      medErrorObj.newMedId = "Debe seleccionar un medicamento.";
    }

    const numCant = Number(newMedCantidad);
    if (!newMedCantidad || isNaN(numCant) || !Number.isInteger(numCant) || numCant <= 0) {
      medErrorObj.newMedCantidad = "La cantidad debe ser un número entero mayor a 0.";
    }

    const indicClean = newMedIndicaciones.trim();
    if (!indicClean) {
      medErrorObj.newMedIndicaciones = "Las indicaciones son obligatorias.";
    }

    if (Object.keys(medErrorObj).length > 0) {
      setErrors((prev) => ({ ...prev, ...medErrorObj }));
      focusFirstError(medErrorObj, ["newMedId", "newMedCantidad", "newMedIndicaciones"]);
      return;
    }

    const m = medicamentosList.find((x) => x.medicamento_id === newMedId || x.id === newMedId);
    if (!m) return;

    const targetId = m.medicamento_id || m.id;
    const isDuplicate = medsRecetados.some((x) => x.medicamento_id === targetId);

    if (isDuplicate) {
      setRecetaError(`El medicamento "${m.nombre}" ya fue agregado a la receta.`);
      return;
    }

    setMedsRecetados((prev) => [
      ...prev,
      {
        medicamento_id: targetId,
        nombre: m.nombre,
        cantidad: numCant,
        indicaciones: indicClean,
      },
    ]);

    setNewMedId("");
    setNewMedCantidad("1");
    setNewMedIndicaciones("");
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.newMedId;
      delete copy.newMedCantidad;
      delete copy.newMedIndicaciones;
      return copy;
    });
  };

  const handleRemoveMed = (idx: number) => {
    setMedsRecetados((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setBackendError("");
    setSuccessMsg("");

    if (!validateStep1()) {
      setActiveTab(1);
      return;
    }
    if (!validateStep2()) {
      setActiveTab(2);
      return;
    }
    if (!validateStep3()) {
      setActiveTab(3);
      return;
    }
    if (!validateStep4()) {
      setActiveTab(4);
      return;
    }

    try {
      setIsSubmitting(true);

      const p = { ...paciente };
      p.nombres = (p.nombres || "").replace(/\s+/g, " ").trim();
      p.apellidos = (p.apellidos || "").replace(/\s+/g, " ").trim();
      p.codigo = "TEMP-CODE";
      if (p.edad !== "" && p.edad !== null && p.edad !== undefined) {
        p.edad = Number(p.edad);
      } else {
        delete p.edad;
      }

      // Explicitly send NULL for optional date fields if empty (never send "")
      if (!p.fecha_nacimiento || typeof p.fecha_nacimiento !== "string" || !p.fecha_nacimiento.trim()) {
        p.fecha_nacimiento = null;
      } else {
        p.fecha_nacimiento = p.fecha_nacimiento.trim();
      }

      if (p.telefono && p.telefono.trim()) p.telefono = p.telefono.trim();
      else p.telefono = null;

      if (p.comunidad && p.comunidad.trim()) p.comunidad = p.comunidad.replace(/\s+/g, " ").trim();
      else p.comunidad = null;

      if (p.responsable && p.responsable.trim()) p.responsable = p.responsable.replace(/\s+/g, " ").trim();
      else p.responsable = null;

      const s = { ...signos };
      ["peso", "talla", "temperatura", "frecuencia_cardiaca", "frecuencia_respiratoria", "saturacion", "glucosa"].forEach(
        (k) => {
          if (s[k] !== "" && s[k] !== null && s[k] !== undefined) {
            const num = Number(s[k]);
            if (!isNaN(num)) s[k] = num;
            else delete s[k];
          } else {
            delete s[k];
          }
        }
      );
      if (!s.presion_arterial || !s.presion_arterial.trim()) delete s.presion_arterial;
      else s.presion_arterial = s.presion_arterial.trim();
      if (!s.observaciones || !s.observaciones.trim()) delete s.observaciones;
      else s.observaciones = s.observaciones.trim();

      const c = { ...consulta, brigada_id: p.brigada_id };
      c.motivo_consulta = (c.motivo_consulta || "").trim();
      c.enfermedad_actual = (c.enfermedad_actual || "").trim();
      c.tratamiento = (c.tratamiento || "").trim();

      if (!c.fecha_consulta || typeof c.fecha_consulta !== "string" || !c.fecha_consulta.trim()) {
        delete c.fecha_consulta;
      }

      const dList = diagnosticosStr
        .split(",")
        .map((d) => d.replace(/\s+/g, " ").trim())
        .filter(Boolean);

      const mList = medsRecetados.map((m) => ({
        medicamento_id: m.medicamento_id,
        cantidad: m.cantidad,
        indicaciones: m.indicaciones,
      }));

      await createExpedienteCompleto(p, s, c, dList, mList);

      setSuccessMsg("¡Expediente guardado correctamente! Redirigiendo a la lista de pacientes...");
      setTimeout(() => {
        router.push("/administracion/pacientes");
      }, 1500);
    } catch (e: any) {
      console.error("Error técnico al guardar el expediente en Supabase:", e);
      setIsSubmitting(false);
      setBackendError("No fue posible guardar el expediente. Verifique la información ingresada e intente nuevamente.");
    }
  };

  const getInputStyle = (fieldName: string) => {
    if (errors[fieldName]) {
      return { borderColor: "#dc2626", borderWidth: "1px", borderStyle: "solid" };
    }
    return {};
  };

  if (isLoading) return <div>Cargando información base...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem", paddingBottom: "5rem" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      {/* Tabs navigation */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        {[
          { id: 1, label: "1. Datos Paciente" },
          { id: 2, label: "2. Signos Vitales" },
          { id: 3, label: "3. Consulta" },
          { id: 4, label: "4. Diagnósticos" },
          { id: 5, label: "5. Receta Médica" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => goToTab(t.id)}
            disabled={isSubmitting}
            style={{
              padding: "0.8rem 1.6rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontWeight: "bold",
              background: activeTab === t.id ? "var(--primaryColor)" : "transparent",
              color: activeTab === t.id ? "white" : "var(--gray)",
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.tableContainer} style={{ padding: "2.4rem" }}>
        {/* TAB 1: PACIENTE */}
        {activeTab === 1 && (
          <div className={styles.adminFormSingleColumn}>
            <div className={styles.formSectionTitle}>1. Datos Personales del Paciente</div>

            <label className={styles.formField}>
              <span className={styles.fieldLabel}>Brigada Médica <strong className={styles.requiredStar}>* (Requerido)</strong></span>
              <select
                ref={registerRef("brigada_id")}
                style={getInputStyle("brigada_id")}
                value={paciente.brigada_id}
                onChange={(e) => {
                  setPaciente({ ...paciente, brigada_id: e.target.value });
                  if (errors.brigada_id) setErrors((prev) => ({ ...prev, brigada_id: "" }));
                }}
              >
                <option value="">-- Seleccionar Brigada --</option>
                {brigadas.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre} ({b.departamento})
                  </option>
                ))}
              </select>
              {errors.brigada_id && <span className={styles.formFieldError}>⚠️ {errors.brigada_id}</span>}
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem" }}>
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Nombres <strong className={styles.requiredStar}>* (Requerido)</strong></span>
                <input
                  ref={registerRef("nombres")}
                  style={getInputStyle("nombres")}
                  placeholder="Ej. Juan Carlos"
                  value={paciente.nombres}
                  onChange={(e) => {
                    setPaciente({ ...paciente, nombres: e.target.value });
                    if (errors.nombres) setErrors((prev) => ({ ...prev, nombres: "" }));
                  }}
                />
                {errors.nombres && <span className={styles.formFieldError}>⚠️ {errors.nombres}</span>}
              </label>
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Apellidos <strong className={styles.requiredStar}>* (Requerido)</strong></span>
                <input
                  ref={registerRef("apellidos")}
                  style={getInputStyle("apellidos")}
                  placeholder="Ej. Pérez Rodríguez"
                  value={paciente.apellidos}
                  onChange={(e) => {
                    setPaciente({ ...paciente, apellidos: e.target.value });
                    if (errors.apellidos) setErrors((prev) => ({ ...prev, apellidos: "" }));
                  }}
                />
                {errors.apellidos && <span className={styles.formFieldError}>⚠️ {errors.apellidos}</span>}
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.6rem" }}>
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Sexo <strong className={styles.requiredStar}>* (Requerido)</strong></span>
                <select
                  ref={registerRef("sexo")}
                  style={getInputStyle("sexo")}
                  value={paciente.sexo}
                  onChange={(e) => {
                    setPaciente({ ...paciente, sexo: e.target.value });
                    if (errors.sexo) setErrors((prev) => ({ ...prev, sexo: "" }));
                  }}
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
                {errors.sexo && <span className={styles.formFieldError}>⚠️ {errors.sexo}</span>}
              </label>
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Edad (Años) <strong className={styles.requiredStar}>* (Requerido)</strong></span>
                <input
                  ref={registerRef("edad")}
                  style={getInputStyle("edad")}
                  type="number"
                  min="0"
                  max="120"
                  placeholder="Ej. 25"
                  value={paciente.edad}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPaciente({ ...paciente, edad: val });
                    if (errors.edad) setErrors((prev) => ({ ...prev, edad: "" }));
                    if (errors.responsable && Number(val) >= 18) {
                      setErrors((prev) => ({ ...prev, responsable: "" }));
                    }
                  }}
                />
                {errors.edad && <span className={styles.formFieldError}>⚠️ {errors.edad}</span>}
              </label>
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Teléfono <span className={styles.optionalTag}>(Opcional)</span></span>
                <input
                  ref={registerRef("telefono")}
                  style={getInputStyle("telefono")}
                  placeholder="Ej. 99887766 (8 dígitos)"
                  value={paciente.telefono}
                  onChange={(e) => {
                    setPaciente({ ...paciente, telefono: e.target.value });
                    if (errors.telefono) setErrors((prev) => ({ ...prev, telefono: "" }));
                  }}
                />
                {errors.telefono && <span className={styles.formFieldError}>⚠️ {errors.telefono}</span>}
              </label>
            </div>

            <label className={styles.formField}>
              <span className={styles.fieldLabel}>Comunidad <span className={styles.optionalTag}>(Opcional)</span></span>
              <input
                ref={registerRef("comunidad")}
                style={getInputStyle("comunidad")}
                placeholder="Ej. Aldea El Cacao"
                value={paciente.comunidad}
                onChange={(e) => {
                  setPaciente({ ...paciente, comunidad: e.target.value });
                  if (errors.comunidad) setErrors((prev) => ({ ...prev, comunidad: "" }));
                }}
              />
              {errors.comunidad && <span className={styles.formFieldError}>⚠️ {errors.comunidad}</span>}
            </label>

            <div className={styles.formField}>
              <label>
                Responsable (Padre/Tutor){" "}
                {paciente.edad !== "" && !isNaN(Number(paciente.edad)) && Number(paciente.edad) < 18 ? " *" : " (Opcional)"}
              </label>
              <input
                ref={registerRef("responsable")}
                style={getInputStyle("responsable")}
                placeholder={
                  paciente.edad !== "" && !isNaN(Number(paciente.edad)) && Number(paciente.edad) < 18
                    ? "Obligatorio para menores de 18 años"
                    : "Nombre del padre, madre o tutor legal"
                }
                value={paciente.responsable}
                onChange={(e) => {
                  setPaciente({ ...paciente, responsable: e.target.value });
                  if (errors.responsable) setErrors((prev) => ({ ...prev, responsable: "" }));
                }}
              />
              {errors.responsable && <span className={styles.formError}>{errors.responsable}</span>}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button
                className={styles.btnPrimary}
                onClick={() => goToTab(2)}
                disabled={isSubmitting}
              >
                Siguiente: Signos &rarr;
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SIGNOS VITALES */}
        {activeTab === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Signos Vitales</h3>
            <p style={{ color: "var(--gray)", fontSize: "1.4rem" }}>
              Todos los campos son opcionales. Si ingresas datos, se verificarán sus rangos normales.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.6rem" }}>
              <div className={styles.formField}>
                <label>Peso (kg)</label>
                <input
                  ref={registerRef("peso")}
                  style={getInputStyle("peso")}
                  type="number"
                  step="0.01"
                  placeholder="0.5 - 400"
                  value={signos.peso}
                  onChange={(e) => {
                    setSignos({ ...signos, peso: e.target.value });
                    if (errors.peso) setErrors((prev) => ({ ...prev, peso: "" }));
                  }}
                />
                {errors.peso && <span className={styles.formError}>{errors.peso}</span>}
              </div>
              <div className={styles.formField}>
                <label>Talla (cm)</label>
                <input
                  ref={registerRef("talla")}
                  style={getInputStyle("talla")}
                  type="number"
                  step="0.01"
                  placeholder="30 - 250"
                  value={signos.talla}
                  onChange={(e) => {
                    setSignos({ ...signos, talla: e.target.value });
                    if (errors.talla) setErrors((prev) => ({ ...prev, talla: "" }));
                  }}
                />
                {errors.talla && <span className={styles.formError}>{errors.talla}</span>}
              </div>
              <div className={styles.formField}>
                <label>Temperatura (°C)</label>
                <input
                  ref={registerRef("temperatura")}
                  style={getInputStyle("temperatura")}
                  type="number"
                  step="0.1"
                  placeholder="30 - 45"
                  value={signos.temperatura}
                  onChange={(e) => {
                    setSignos({ ...signos, temperatura: e.target.value });
                    if (errors.temperatura) setErrors((prev) => ({ ...prev, temperatura: "" }));
                  }}
                />
                {errors.temperatura && <span className={styles.formError}>{errors.temperatura}</span>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem" }}>
              <div className={styles.formField}>
                <label>Frecuencia Cardíaca (lpm)</label>
                <input
                  ref={registerRef("frecuencia_cardiaca")}
                  style={getInputStyle("frecuencia_cardiaca")}
                  type="number"
                  placeholder="20 - 250"
                  value={signos.frecuencia_cardiaca}
                  onChange={(e) => {
                    setSignos({ ...signos, frecuencia_cardiaca: e.target.value });
                    if (errors.frecuencia_cardiaca) setErrors((prev) => ({ ...prev, frecuencia_cardiaca: "" }));
                  }}
                />
                {errors.frecuencia_cardiaca && <span className={styles.formError}>{errors.frecuencia_cardiaca}</span>}
              </div>
              <div className={styles.formField}>
                <label>Frecuencia Respiratoria (rpm)</label>
                <input
                  ref={registerRef("frecuencia_respiratoria")}
                  style={getInputStyle("frecuencia_respiratoria")}
                  type="number"
                  placeholder="5 - 80"
                  value={signos.frecuencia_respiratoria}
                  onChange={(e) => {
                    setSignos({ ...signos, frecuencia_respiratoria: e.target.value });
                    if (errors.frecuencia_respiratoria) setErrors((prev) => ({ ...prev, frecuencia_respiratoria: "" }));
                  }}
                />
                {errors.frecuencia_respiratoria && <span className={styles.formError}>{errors.frecuencia_respiratoria}</span>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.6rem" }}>
              <div className={styles.formField}>
                <label>Presión Arterial (Ej. 120/80)</label>
                <input
                  ref={registerRef("presion_arterial")}
                  style={getInputStyle("presion_arterial")}
                  placeholder="120/80"
                  value={signos.presion_arterial}
                  onChange={(e) => {
                    setSignos({ ...signos, presion_arterial: e.target.value });
                    if (errors.presion_arterial) setErrors((prev) => ({ ...prev, presion_arterial: "" }));
                  }}
                />
                {errors.presion_arterial && <span className={styles.formError}>{errors.presion_arterial}</span>}
              </div>
              <div className={styles.formField}>
                <label>Saturación O2 (%)</label>
                <input
                  ref={registerRef("saturacion")}
                  style={getInputStyle("saturacion")}
                  type="number"
                  placeholder="0 - 100"
                  value={signos.saturacion}
                  onChange={(e) => {
                    setSignos({ ...signos, saturacion: e.target.value });
                    if (errors.saturacion) setErrors((prev) => ({ ...prev, saturacion: "" }));
                  }}
                />
                {errors.saturacion && <span className={styles.formError}>{errors.saturacion}</span>}
              </div>
              <div className={styles.formField}>
                <label>Glucosa (mg/dL)</label>
                <input
                  ref={registerRef("glucosa")}
                  style={getInputStyle("glucosa")}
                  type="number"
                  step="0.01"
                  placeholder="20 - 700"
                  value={signos.glucosa}
                  onChange={(e) => {
                    setSignos({ ...signos, glucosa: e.target.value });
                    if (errors.glucosa) setErrors((prev) => ({ ...prev, glucosa: "" }));
                  }}
                />
                {errors.glucosa && <span className={styles.formError}>{errors.glucosa}</span>}
              </div>
            </div>

            <div className={styles.formField}>
              <label>Observaciones (Preclínica)</label>
              <textarea
                ref={registerRef("observaciones")}
                style={getInputStyle("observaciones")}
                rows={3}
                placeholder="Máximo 1000 caracteres"
                value={signos.observaciones}
                onChange={(e) => {
                  setSignos({ ...signos, observaciones: e.target.value });
                  if (errors.observaciones) setErrors((prev) => ({ ...prev, observaciones: "" }));
                }}
              />
              {errors.observaciones && <span className={styles.formError}>{errors.observaciones}</span>}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
              <button
                className={styles.btnSecondary}
                onClick={() => goToTab(1)}
                disabled={isSubmitting}
              >
                &larr; Atrás
              </button>
              <button
                className={styles.btnPrimary}
                onClick={() => goToTab(3)}
                disabled={isSubmitting}
              >
                Siguiente: Consulta &rarr;
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CONSULTA */}
        {activeTab === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Consulta Médica / Odontológica</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem" }}>
              <div className={styles.formField}>
                <label>Tipo de Consulta *</label>
                <select
                  ref={registerRef("tipo_consulta")}
                  style={getInputStyle("tipo_consulta")}
                  value={consulta.tipo_consulta}
                  onChange={(e) => {
                    setConsulta({ ...consulta, tipo_consulta: e.target.value });
                    if (errors.tipo_consulta) setErrors((prev) => ({ ...prev, tipo_consulta: "" }));
                  }}
                >
                  <option value="Medica">Médica</option>
                  <option value="Odontologica">Odontológica</option>
                </select>
                {errors.tipo_consulta && <span className={styles.formError}>{errors.tipo_consulta}</span>}
              </div>
              <div className={styles.formField}>
                <label>Médico / Odontólogo que atendió *</label>
                <select
                  ref={registerRef("medico_id")}
                  style={getInputStyle("medico_id")}
                  value={consulta.medico_id}
                  disabled={medicos.length === 0 || isSubmitting}
                  onChange={(e) => {
                    setConsulta({ ...consulta, medico_id: e.target.value });
                    if (errors.medico_id) setErrors((prev) => ({ ...prev, medico_id: "" }));
                  }}
                >
                  {medicos.length === 0 ? (
                    <option value="">No hay médicos disponibles</option>
                  ) : (
                    <>
                      <option value="">-- Seleccionar --</option>
                      {medicos.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre_completo || "Sin Nombre"}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {errors.medico_id && <span className={styles.formError}>{errors.medico_id}</span>}
              </div>
            </div>

            <div className={styles.formField}>
              <label>Motivo de Consulta *</label>
              <textarea
                ref={registerRef("motivo_consulta")}
                style={getInputStyle("motivo_consulta")}
                rows={2}
                placeholder="Mínimo 10 caracteres. Ej. Dolor de cabeza frecuente y fiebre desde hace 2 días."
                value={consulta.motivo_consulta}
                onChange={(e) => {
                  setConsulta({ ...consulta, motivo_consulta: e.target.value });
                  if (errors.motivo_consulta) setErrors((prev) => ({ ...prev, motivo_consulta: "" }));
                }}
              />
              {errors.motivo_consulta && <span className={styles.formError}>{errors.motivo_consulta}</span>}
            </div>

            <div className={styles.formField}>
              <label>Enfermedad Actual *</label>
              <textarea
                ref={registerRef("enfermedad_actual")}
                style={getInputStyle("enfermedad_actual")}
                rows={2}
                placeholder="Mínimo 10 caracteres. Ej. Paciente refiere síntomas de inicio súbito..."
                value={consulta.enfermedad_actual}
                onChange={(e) => {
                  setConsulta({ ...consulta, enfermedad_actual: e.target.value });
                  if (errors.enfermedad_actual) setErrors((prev) => ({ ...prev, enfermedad_actual: "" }));
                }}
              />
              {errors.enfermedad_actual && <span className={styles.formError}>{errors.enfermedad_actual}</span>}
            </div>

            <div className={styles.formField}>
              <label>Plan de Tratamiento *</label>
              <textarea
                ref={registerRef("tratamiento")}
                style={getInputStyle("tratamiento")}
                rows={3}
                placeholder="Mínimo 10 caracteres. Ej. Hidratación oral, reposo y administración de analgésicos."
                value={consulta.tratamiento}
                onChange={(e) => {
                  setConsulta({ ...consulta, tratamiento: e.target.value });
                  if (errors.tratamiento) setErrors((prev) => ({ ...prev, tratamiento: "" }));
                }}
              />
              {errors.tratamiento && <span className={styles.formError}>{errors.tratamiento}</span>}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                background: "var(--bg-light)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <input
                type="checkbox"
                id="postclinica"
                checked={consulta.requiere_postclinica}
                onChange={(e) => setConsulta({ ...consulta, requiere_postclinica: e.target.checked })}
              />
              <label htmlFor="postclinica" style={{ margin: 0, cursor: "pointer", fontWeight: "bold" }}>
                Requiere Postclínica
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
              <button
                className={styles.btnSecondary}
                onClick={() => goToTab(2)}
                disabled={isSubmitting}
              >
                &larr; Atrás
              </button>
              <button
                className={styles.btnPrimary}
                onClick={() => goToTab(4)}
                disabled={isSubmitting}
              >
                Siguiente: Diagnósticos &rarr;
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: DIAGNÓSTICOS */}
        {activeTab === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Diagnósticos Clínicos</h3>
            <p style={{ color: "var(--gray)", fontSize: "1.4rem" }}>
              Ingresa los diagnósticos separados por coma (,). Cada diagnóstico debe tener al menos 3 caracteres.
            </p>

            <div className={styles.formField}>
              <label>Diagnósticos *</label>
              <textarea
                ref={registerRef("diagnosticosStr")}
                style={getInputStyle("diagnosticosStr")}
                rows={4}
                placeholder="Ej. Faringitis Aguda, Anemia, Cefalea Tensional"
                value={diagnosticosStr}
                onChange={(e) => {
                  setDiagnosticosStr(e.target.value);
                  if (errors.diagnosticosStr) setErrors((prev) => ({ ...prev, diagnosticosStr: "" }));
                }}
              />
              {errors.diagnosticosStr && <span className={styles.formError}>{errors.diagnosticosStr}</span>}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
              <button
                className={styles.btnSecondary}
                onClick={() => goToTab(3)}
                disabled={isSubmitting}
              >
                &larr; Atrás
              </button>
              <button
                className={styles.btnPrimary}
                onClick={() => goToTab(5)}
                disabled={isSubmitting}
              >
                Siguiente: Medicamentos &rarr;
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: MEDICAMENTOS */}
        {activeTab === 5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Receta de Medicamentos</h3>

            {recetaError && (
              <div className={styles.toastError} style={{ position: "static", maxWidth: "100%", margin: 0 }}>
                ⚠️ {recetaError}
              </div>
            )}

            <div
              style={{
                background: "var(--bg-light)",
                padding: "1.6rem",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <h4>Añadir Medicamento a la Receta</h4>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div className={styles.formField} style={{ flex: 2, minWidth: "200px" }}>
                  <label>Medicamento</label>
                  <select
                    ref={registerRef("newMedId")}
                    style={getInputStyle("newMedId")}
                    value={newMedId}
                    onChange={(e) => {
                      setNewMedId(e.target.value);
                      setRecetaError("");
                      if (errors.newMedId) setErrors((prev) => ({ ...prev, newMedId: "" }));
                    }}
                  >
                    <option value="">-- Seleccionar --</option>
                    {medicamentosList.map((m) => (
                      <option key={m.medicamento_id || m.id} value={m.medicamento_id || m.id}>
                        {m.nombre} (Stock: {m.stock_total || 0})
                      </option>
                    ))}
                  </select>
                  {errors.newMedId && <span className={styles.formError}>{errors.newMedId}</span>}
                </div>
                <div className={styles.formField} style={{ flex: 1, minWidth: "100px" }}>
                  <label>Cantidad</label>
                  <input
                    ref={registerRef("newMedCantidad")}
                    style={getInputStyle("newMedCantidad")}
                    type="number"
                    min="1"
                    value={newMedCantidad}
                    onChange={(e) => {
                      setNewMedCantidad(e.target.value);
                      if (errors.newMedCantidad) setErrors((prev) => ({ ...prev, newMedCantidad: "" }));
                    }}
                  />
                  {errors.newMedCantidad && <span className={styles.formError}>{errors.newMedCantidad}</span>}
                </div>
              </div>
              <div className={styles.formField}>
                <label>Indicaciones (Dosis, Frecuencia)</label>
                <input
                  ref={registerRef("newMedIndicaciones")}
                  style={getInputStyle("newMedIndicaciones")}
                  placeholder="Ej. 1 tableta cada 8 horas por 5 días"
                  value={newMedIndicaciones}
                  onChange={(e) => {
                    setNewMedIndicaciones(e.target.value);
                    if (errors.newMedIndicaciones) setErrors((prev) => ({ ...prev, newMedIndicaciones: "" }));
                  }}
                />
                {errors.newMedIndicaciones && <span className={styles.formError}>{errors.newMedIndicaciones}</span>}
              </div>
              <div style={{ alignSelf: "flex-end" }}>
                <button className={styles.btnSecondary} onClick={handleAddMed} disabled={isSubmitting}>
                  + Añadir a Receta
                </button>
              </div>
            </div>

            <div>
              <h4>Medicamentos Agregados ({medsRecetados.length})</h4>
              {medsRecetados.length === 0 ? (
                <p style={{ color: "var(--gray)", fontSize: "1.4rem", marginTop: "1rem" }}>
                  No hay medicamentos recetados aún.
                </p>
              ) : (
                <table className={styles.adminTable} style={{ marginTop: "1rem" }}>
                  <thead>
                    <tr>
                      <th>Medicamento</th>
                      <th>Cantidad</th>
                      <th>Indicaciones</th>
                      <th>Quitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medsRecetados.map((m, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: "bold" }}>{m.nombre}</td>
                        <td>{m.cantidad}</td>
                        <td>{m.indicaciones}</td>
                        <td>
                          <button
                            style={{
                              color: "var(--danger)",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                            onClick={() => handleRemoveMed(idx)}
                            disabled={isSubmitting}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {backendError && (
              <div className={styles.toastError} style={{ position: "static", maxWidth: "100%", marginTop: "1.6rem" }}>
                ⚠️ {backendError}
              </div>
            )}

            {successMsg && (
              <div className={styles.toastSuccess} style={{ position: "static", maxWidth: "100%", marginTop: "1.6rem" }}>
                {successMsg}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "2rem",
                paddingTop: "2rem",
                borderTop: "1px solid var(--border-color)",
              }}
            >
              <button
                className={styles.btnSecondary}
                onClick={() => goToTab(4)}
                disabled={isSubmitting}
              >
                &larr; Atrás
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem" }}>
                    <svg
                      style={{
                        width: "1.6rem",
                        height: "1.6rem",
                        animation: "spin 1s linear infinite",
                        display: "inline-block",
                      }}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                    </svg>
                    Guardando expediente...
                  </span>
                ) : (
                  "Guardar Expediente"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
