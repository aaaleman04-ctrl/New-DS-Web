"use client";

import React, { useState, useEffect } from "react";
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
          supabase.from("perfiles").select("*").in("rol", ["medico", "odontologo", "enfermero"])
        ]);
        if (mounted) {
          const activeBrigadas = bRes.data?.filter((b: any) => b.estado !== 'finalizada' && b.estado !== 'cancelada') || [];
          setBrigadas(activeBrigadas);
          setMedicamentosList(mRes || []);
          setMedicos(pRes.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchAll();
    return () => { mounted = false; };
  }, []);

  const handleAddMed = () => {
    if (!newMedId || Number(newMedCantidad) <= 0) return;
    const m = medicamentosList.find((x) => x.medicamento_id === newMedId || x.id === newMedId);
    if (!m) return;

    setMedsRecetados(prev => [
      ...prev,
      {
        medicamento_id: m.medicamento_id || m.id,
        nombre: m.nombre,
        cantidad: Number(newMedCantidad),
        indicaciones: newMedIndicaciones
      }
    ]);
    setNewMedId("");
    setNewMedCantidad("1");
    setNewMedIndicaciones("");
  };

  const handleRemoveMed = (idx: number) => {
    setMedsRecetados(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!paciente.nombres || !paciente.brigada_id || !consulta.medico_id || !consulta.tipo_consulta) {
      alert("Faltan campos obligatorios: Nombres, Brigada, Médico o Tipo Consulta");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const p = { ...paciente };
      p.codigo = "TEMP-CODE";
      if (p.edad) p.edad = Number(p.edad);

      const s = { ...signos };
      // parse numeric
      ["peso", "talla", "temperatura", "frecuencia_cardiaca", "frecuencia_respiratoria", "saturacion", "glucosa"].forEach(k => {
        if (s[k]) s[k] = Number(s[k]);
        else delete s[k];
      });
      if (!s.presion_arterial) delete s.presion_arterial;
      if (!s.observaciones) delete s.observaciones;

      const c = { ...consulta, brigada_id: p.brigada_id };
      
      const dList = diagnosticosStr.split(",").map(d => d.trim()).filter(d => d);

      const mList = medsRecetados.map(m => ({
        medicamento_id: m.medicamento_id,
        cantidad: m.cantidad,
        indicaciones: m.indicaciones
      }));

      await createExpedienteCompleto(p, s, c, dList, mList);

      router.push("/administracion/pacientes");
    } catch (e: any) {
      alert("Error al guardar expediente: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Cargando información base...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem", paddingBottom: "5rem" }}>
      
      {/* Tabs navigation */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        {[
          { id: 1, label: "1. Datos Paciente" },
          { id: 2, label: "2. Signos Vitales" },
          { id: 3, label: "3. Consulta" },
          { id: 4, label: "4. Diagnósticos" },
          { id: 5, label: "5. Receta Médica" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "0.8rem 1.6rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              background: activeTab === t.id ? "var(--primaryColor)" : "transparent",
              color: activeTab === t.id ? "white" : "var(--gray)"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.tableContainer} style={{ padding: "2.4rem" }}>
        
        {/* TAB 1: PACIENTE */}
        {activeTab === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Datos del Paciente</h3>
            
            <div className={styles.formField}>
              <label>Brigada *</label>
              <select value={paciente.brigada_id} onChange={e => setPaciente({...paciente, brigada_id: e.target.value})}>
                <option value="">-- Seleccionar Brigada --</option>
                {brigadas.map(b => (
                  <option key={b.id} value={b.id}>{b.nombre} ({b.departamento})</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem" }}>
              <div className={styles.formField}>
                <label>Nombres *</label>
                <input value={paciente.nombres} onChange={e => setPaciente({...paciente, nombres: e.target.value})} />
              </div>
              <div className={styles.formField}>
                <label>Apellidos</label>
                <input value={paciente.apellidos} onChange={e => setPaciente({...paciente, apellidos: e.target.value})} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.6rem" }}>
              <div className={styles.formField}>
                <label>Sexo *</label>
                <select value={paciente.sexo} onChange={e => setPaciente({...paciente, sexo: e.target.value})}>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
              <div className={styles.formField}>
                <label>Edad (Años)</label>
                <input type="number" min="0" value={paciente.edad} onChange={e => setPaciente({...paciente, edad: e.target.value})} />
              </div>
              <div className={styles.formField}>
                <label>Teléfono</label>
                <input value={paciente.telefono} onChange={e => setPaciente({...paciente, telefono: e.target.value})} />
              </div>
            </div>

            <div className={styles.formField}>
              <label>Comunidad</label>
              <input value={paciente.comunidad} onChange={e => setPaciente({...paciente, comunidad: e.target.value})} />
            </div>

            <div className={styles.formField}>
              <label>Responsable (Padre/Tutor si aplica)</label>
              <input value={paciente.responsable} onChange={e => setPaciente({...paciente, responsable: e.target.value})} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button className={styles.btnPrimary} onClick={() => setActiveTab(2)}>Siguiente: Signos &rarr;</button>
            </div>
          </div>
        )}

        {/* TAB 2: SIGNOS VITALES */}
        {activeTab === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Signos Vitales</h3>
            <p style={{ color: "var(--gray)", fontSize: "1.4rem" }}>Todos los campos son opcionales. Deja en blanco si no se tomó la medida.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.6rem" }}>
              <div className={styles.formField}>
                <label>Peso (kg)</label>
                <input type="number" step="0.01" value={signos.peso} onChange={e => setSignos({...signos, peso: e.target.value})} />
              </div>
              <div className={styles.formField}>
                <label>Talla (cm)</label>
                <input type="number" step="0.01" value={signos.talla} onChange={e => setSignos({...signos, talla: e.target.value})} />
              </div>
              <div className={styles.formField}>
                <label>Temperatura (°C)</label>
                <input type="number" step="0.1" value={signos.temperatura} onChange={e => setSignos({...signos, temperatura: e.target.value})} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem" }}>
              <div className={styles.formField}>
                <label>Frecuencia Cardíaca (lpm)</label>
                <input type="number" value={signos.frecuencia_cardiaca} onChange={e => setSignos({...signos, frecuencia_cardiaca: e.target.value})} />
              </div>
              <div className={styles.formField}>
                <label>Frecuencia Respiratoria (rpm)</label>
                <input type="number" value={signos.frecuencia_respiratoria} onChange={e => setSignos({...signos, frecuencia_respiratoria: e.target.value})} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.6rem" }}>
              <div className={styles.formField}>
                <label>Presión Arterial (Ej. 120/80)</label>
                <input value={signos.presion_arterial} onChange={e => setSignos({...signos, presion_arterial: e.target.value})} />
              </div>
              <div className={styles.formField}>
                <label>Saturación O2 (%)</label>
                <input type="number" value={signos.saturacion} onChange={e => setSignos({...signos, saturacion: e.target.value})} />
              </div>
              <div className={styles.formField}>
                <label>Glucosa (mg/dL)</label>
                <input type="number" step="0.01" value={signos.glucosa} onChange={e => setSignos({...signos, glucosa: e.target.value})} />
              </div>
            </div>

            <div className={styles.formField}>
              <label>Observaciones (Preclínica)</label>
              <textarea rows={3} value={signos.observaciones} onChange={e => setSignos({...signos, observaciones: e.target.value})} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
              <button className={styles.btnSecondary} onClick={() => setActiveTab(1)}>&larr; Atrás</button>
              <button className={styles.btnPrimary} onClick={() => setActiveTab(3)}>Siguiente: Consulta &rarr;</button>
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
                <select value={consulta.tipo_consulta} onChange={e => setConsulta({...consulta, tipo_consulta: e.target.value})}>
                  <option value="Medica">Médica</option>
                  <option value="Odontologica">Odontológica</option>
                </select>
              </div>
              <div className={styles.formField}>
                <label>Médico / Odontólogo que atendió *</label>
                <select value={consulta.medico_id} onChange={e => setConsulta({...consulta, medico_id: e.target.value})}>
                  <option value="">-- Seleccionar --</option>
                  {medicos.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre_completo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formField}>
              <label>Motivo de Consulta</label>
              <textarea rows={2} value={consulta.motivo_consulta} onChange={e => setConsulta({...consulta, motivo_consulta: e.target.value})} />
            </div>

            <div className={styles.formField}>
              <label>Enfermedad Actual</label>
              <textarea rows={2} value={consulta.enfermedad_actual} onChange={e => setConsulta({...consulta, enfermedad_actual: e.target.value})} />
            </div>

            <div className={styles.formField}>
              <label>Plan de Tratamiento (General)</label>
              <textarea rows={3} value={consulta.tratamiento} onChange={e => setConsulta({...consulta, tratamiento: e.target.value})} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "var(--bg-light)", borderRadius: "var(--radius-sm)" }}>
              <input type="checkbox" id="postclinica" checked={consulta.requiere_postclinica} onChange={e => setConsulta({...consulta, requiere_postclinica: e.target.checked})} />
              <label htmlFor="postclinica" style={{ margin: 0, cursor: "pointer", fontWeight: "bold" }}>Requiere Postclínica</label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
              <button className={styles.btnSecondary} onClick={() => setActiveTab(2)}>&larr; Atrás</button>
              <button className={styles.btnPrimary} onClick={() => setActiveTab(4)}>Siguiente: Diagnósticos &rarr;</button>
            </div>
          </div>
        )}

        {/* TAB 4: DIAGNÓSTICOS */}
        {activeTab === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Diagnósticos Clínicos</h3>
            <p style={{ color: "var(--gray)", fontSize: "1.4rem" }}>Ingresa los diagnósticos separados por coma (,).</p>

            <div className={styles.formField}>
              <label>Diagnósticos</label>
              <textarea 
                rows={4} 
                placeholder="Ej. Faringitis Aguda, Anemia, Cefalea Tensional"
                value={diagnosticosStr} 
                onChange={e => setDiagnosticosStr(e.target.value)} 
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
              <button className={styles.btnSecondary} onClick={() => setActiveTab(3)}>&larr; Atrás</button>
              <button className={styles.btnPrimary} onClick={() => setActiveTab(5)}>Siguiente: Medicamentos &rarr;</button>
            </div>
          </div>
        )}

        {/* TAB 5: MEDICAMENTOS */}
        {activeTab === 5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Receta de Medicamentos</h3>
            
            <div style={{ background: "var(--bg-light)", padding: "1.6rem", borderRadius: "var(--radius-sm)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h4>Añadir Medicamento a la Receta</h4>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div className={styles.formField} style={{ flex: 2, minWidth: "200px" }}>
                  <label>Medicamento</label>
                  <select value={newMedId} onChange={e => setNewMedId(e.target.value)}>
                    <option value="">-- Seleccionar --</option>
                    {medicamentosList.map(m => (
                      <option key={m.medicamento_id || m.id} value={m.medicamento_id || m.id}>{m.nombre} (Stock: {m.stock_total || 0})</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formField} style={{ flex: 1, minWidth: "100px" }}>
                  <label>Cantidad</label>
                  <input type="number" min="1" value={newMedCantidad} onChange={e => setNewMedCantidad(e.target.value)} />
                </div>
              </div>
              <div className={styles.formField}>
                <label>Indicaciones (Dosis, Frecuencia)</label>
                <input placeholder="Ej. 1 tableta cada 8 horas por 5 días" value={newMedIndicaciones} onChange={e => setNewMedIndicaciones(e.target.value)} />
              </div>
              <div style={{ alignSelf: "flex-end" }}>
                <button className={styles.btnSecondary} onClick={handleAddMed}>+ Añadir a Receta</button>
              </div>
            </div>

            <div>
              <h4>Medicamentos Agregados ({medsRecetados.length})</h4>
              {medsRecetados.length === 0 ? (
                <p style={{ color: "var(--gray)", fontSize: "1.4rem", marginTop: "1rem" }}>No hay medicamentos recetados aún.</p>
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
                          <button style={{ color: "var(--danger)", background: "transparent", border: "none", cursor: "pointer", fontWeight: "bold" }} onClick={() => handleRemoveMed(idx)}>X</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--border-color)" }}>
              <button className={styles.btnSecondary} onClick={() => setActiveTab(4)}>&larr; Atrás</button>
              <button 
                className={styles.btnPrimary} 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                style={{ background: "var(--success)" }}
              >
                {isSubmitting ? "Guardando..." : "✅ Finalizar y Guardar Expediente"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
