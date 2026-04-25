 const SUPABASE_URL      = "https://rnuvfkhutuuyhlummzeb.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudXZma2h1dHV1eWhsdW1temViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgwMzEsImV4cCI6MjA5MjYzNDAzMX0.7bj9YpOA7ENZWesLhTiUg6Tvd2eT-FAp2nsDCX4Lg_Q";
      const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const form    = document.getElementById("formVoluntario");
      const btnEnviar = document.getElementById("btnVoluntario");

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Deshabilitar botón mientras envía para evitar doble envío
        btnEnviar.disabled    = true;
        btnEnviar.textContent = "Enviando...";

        const data = {
          nombre:   form.nombre.value.trim(),
          apellido: form.apellido.value.trim(),
          rol:      form.rol.value.trim(),
          telefono: form.telefono.value.trim(),
          mensaje:  form.mensaje.value.trim() || null,
        };

        const { error } = await sb.from("voluntarios").insert([data]);

        if (error) {
          console.error("Error Supabase:", error.message);
          alert("Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.");
          btnEnviar.disabled    = false;
          btnEnviar.textContent = "Enviar Solicitud";
        } else {
          alert("¡Solicitud enviada correctamente! Nos pondremos en contacto contigo pronto.");
          form.reset();
          btnEnviar.disabled    = false;
          btnEnviar.textContent = "Enviar Solicitud";
        }
      });