const SUPABASE_URL = "https://rnuvfkhutuuyhlummzeb.supabase.co";
const SUPABASE_ANON_KEY = "PASTE_ANON_KEY_FROM_SUPABASE_DASHBOARD_SETTINGS_API";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("formVoluntario");
const btnEnviar = document.getElementById("btnVoluntario");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Deshabilitar botón mientras envía para evitar doble envío
  btnEnviar.disabled = true;
  btnEnviar.textContent = "Enviando...";

  const data = {
    nombre: form.nombre.value.trim(),
    apellido: form.apellido.value.trim(),
    rol: form.rol.value.trim(),
    telefono: form.telefono.value.trim(),
    mensaje: form.mensaje.value.trim() || null,
  };

  const { error } = await sb.from("voluntarios").insert([data]);

  if (error) {
    console.error("Error Supabase:", error.message);
    alert("Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.");
    btnEnviar.disabled = false;
    btnEnviar.textContent = "Enviar Solicitud";
  } else {
    alert(
      "¡Solicitud enviada correctamente! Nos pondremos en contacto contigo pronto."
    );
    form.reset();
    btnEnviar.disabled = false;
    btnEnviar.textContent = "Enviar Solicitud";
  }
});
