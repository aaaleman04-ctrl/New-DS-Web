const SUPABASE_URL      = "https://rnuvfkhutuuyhlummzeb.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudXZma2h1dHV1eWhsdW1temViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgwMzEsImV4cCI6MjA5MjYzNDAzMX0.7bj9YpOA7ENZWesLhTiUg6Tvd2eT-FAp2nsDCX4Lg_Q";
      const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const form      = document.getElementById("formContacto");
      const btnEnviar = document.getElementById("btnContacto");

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        btnEnviar.disabled    = true;
        btnEnviar.textContent = "Enviando...";

        const data = {
          nombre:   form.nombre.value.trim(),
          apellido: form.apellido.value.trim(),
          email:    form.email.value.trim(),
          telefono: form.telefono.value.trim() || null,
          asunto:   form.asunto.value.trim(),
          mensaje:  form.mensaje.value.trim(),
        };

        const { error } = await sb.from("contacto").insert([data]);

        if (error) {
          console.error("Error Supabase:", error.message);
          alert("Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.");
          btnEnviar.disabled    = false;
          btnEnviar.textContent = "Enviar Mensaje →";
        } else {
          alert("¡Mensaje enviado correctamente! Te responderemos pronto.");
          form.reset();
          btnEnviar.disabled    = false;
          btnEnviar.textContent = "Enviar Mensaje →";
        }
      });