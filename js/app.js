/* ================================================================
   DIBUJANDO SONRISAS — js/app.js
   Funciones:
     1. Datos de brigadas (EDITA AQUÍ para agregar brigadas)
     2. Carrusel de selección (muestra 4 a la vez)
     3. Galería de fotos con lazy loading + lightbox
     4. Mapa embebido por brigada
     5. Modo oscuro (dark mode toggle)
   ================================================================ */


/* ================================================================
   1. DATOS DE LAS BRIGADAS
   ─────────────────────────────────────────────────────────────────
   Para agregar o editar una brigada:
   - "id"          → nombre de la carpeta en img/ (ej: "Brigada-1")
                     Las fotos deben llamarse 1.jpg, 2.jpg, 3.jpg...
   - "numero"      → etiqueta que aparece arriba del nombre
   - "nombre"      → nombre del lugar
   - "fecha"       → año o fecha de la brigada
   - "lugar"       → descripción completa del lugar
   - "descripcion" → texto informativo que aparece en el panel
   - "lat" / "lng" → coordenadas GPS (clic derecho en Google Maps)
   - "totalFotos"  → cuántas fotos hay en esa carpeta (1.jpg, 2.jpg…)
                     Si es 0 o no hay fotos, aparece un mensaje.
   ================================================================ */
const brigadas = [
  {
    id: "Brigada-1",
    numero: "Brigada 01",
    nombre: "El Progreso",
    fecha: "2022",
    lugar: "El Progreso, Yoro – Honduras",
    descripcion: "Nuestra primera brigada oficial. Atendimos a más de 80 personas con consultas médicas y extracciones dentales en una comunidad rural sin acceso a servicios de salud. Fue un día lleno de bendiciones, aprendizaje y mucha fe.",
    lat: 15.4007,
    lng: -87.7933,
    totalFotos: 0   // ← cambia esto al número real de fotos en img/Brigada-1/
  },
  {
    id: "Brigada-2",
    numero: "Brigada 02",
    nombre: "La Lima",
    fecha: "2022",
    lugar: "La Lima, Cortés – Honduras",
    descripcion: "Segunda brigada realizada en una colonia de La Lima. Brindamos atención odontológica y medicina general a familias de escasos recursos. También oramos con los pacientes y predicamos el evangelio.",
    lat: 15.4368,
    lng: -87.9195,
    totalFotos: 45
  },
  {
    id: "Brigada-3",
    numero: "Brigada 03",
    nombre: "Villanueva",
    fecha: "2023",
    lugar: "Villanueva, Cortés – Honduras",
    descripcion: "En Villanueva llegamos a colonias nuevas donde muchas familias no tienen acceso a clínicas. Atendimos niños, adultos y personas de la tercera edad con mucho amor.",
    lat: 15.3219,
    lng: -88.0227,
    totalFotos: 6
  },
  {
    id: "Brigada-4",
    numero: "Brigada 04",
    nombre: "San Pedro Sula",
    fecha: "2023",
    lugar: "San Pedro Sula, Cortés – Honduras",
    descripcion: "Brigada realizada en una colonia vulnerable de San Pedro Sula. Donamos medicamentos e insumos médicos y compartimos el mensaje de esperanza del evangelio con cada familia atendida.",
    lat: 15.5037,
    lng: -88.0253,
    totalFotos: 0
  },
  {
    id: "Brigada-5",
    numero: "Brigada 05",
    nombre: "Choloma",
    fecha: "2023",
    lugar: "Choloma, Cortés – Honduras",
    descripcion: "Llegamos a Choloma con un equipo fortalecido de voluntarios médicos y odontólogos. Atendimos a más de 120 personas en un solo día. ¡Para Dios nada es imposible!",
    lat: 15.6094,
    lng: -87.9524,
    totalFotos: 0
  },
  {
    id: "Brigada-6",
    numero: "Brigada 06",
    nombre: "Santa Cruz de Yojoa",
    fecha: "2024",
    lugar: "Santa Cruz de Yojoa, Cortés – Honduras",
    descripcion: "Una de nuestras brigadas más grandes hasta la fecha. Llegamos a una comunidad a orillas del Lago de Yojoa y brindamos atención a familias que viajan horas para recibir ayuda médica.",
    lat: 14.8701,
    lng: -88.0265,
    totalFotos: 0
  }
  // Agrega más brigadas aquí siguiendo el mismo formato ↑
];


/* ================================================================
   2. CARRUSEL DE SELECCIÓN
   ─────────────────────────────────────────────────────────────────
   Muestra 4 brigadas a la vez en desktop.
   En tablet muestra 2, en móvil se puede deslizar.
   ================================================================ */

let carouselIndex = 0;  // posición actual del carrusel
let visibleCount  = 4;  // cuántos items caben visibles (se recalcula)

/* Calcula cuántos items caben según el ancho de pantalla */
function getVisibleCount() {
  if (window.innerWidth <= 550) return 1;
  if (window.innerWidth <= 900) return 2;
  return 4;
}

/* Mueve el carrusel al índice indicado */
function moverCarrusel(nuevoIndex) {
  const track     = document.getElementById("carouselTrack");
  const btnPrev   = document.getElementById("carouselPrev");
  const btnNext   = document.getElementById("carouselNext");
  const totalBtns = brigadas.length;

  visibleCount = getVisibleCount();

  // Límites: no pasar del primer ni del último grupo
  const maxIndex = Math.max(0, totalBtns - visibleCount);
  carouselIndex  = Math.min(Math.max(nuevoIndex, 0), maxIndex);

  // Calcular el desplazamiento: ancho de un item + gap (1.5rem = 15px aprox)
  // Usamos el ancho real del primer botón para ser exactos
  const primerBtn = track.querySelector(".brigada-btn");
  if (!primerBtn) return;

  const itemAncho = primerBtn.offsetWidth + 15; // 15px ≈ 1.5rem gap
  track.style.transform = `translateX(-${carouselIndex * itemAncho}px)`;

  // Deshabilitar botones en los extremos
  btnPrev.disabled = carouselIndex === 0;
  btnNext.disabled = carouselIndex >= maxIndex;
}

/* Inicializa el carrusel: crea los botones y los eventos */
function iniciarCarrusel() {
  const track   = document.getElementById("carouselTrack");
  const btnPrev = document.getElementById("carouselPrev");
  const btnNext = document.getElementById("carouselNext");

  // Crear un botón por cada brigada
  brigadas.forEach((brigada, i) => {
    const btn = document.createElement("button");
    btn.className  = "brigada-btn" + (i === 0 ? " active" : "");
    btn.dataset.id = brigada.id;
    btn.innerHTML  = `
      <span class="brigada-num">${brigada.numero}</span>
      <span class="brigada-name">${brigada.nombre}</span>
    `;
    btn.addEventListener("click", () => {
      activarBrigada(brigada.id);
    });
    track.appendChild(btn);
  });

  // Eventos de las flechas
  btnPrev.addEventListener("click", () => moverCarrusel(carouselIndex - 1));
  btnNext.addEventListener("click", () => moverCarrusel(carouselIndex + 1));

  // Estado inicial
  moverCarrusel(0);

  // Recalcular si cambia el tamaño de ventana
  window.addEventListener("resize", () => moverCarrusel(carouselIndex));
}

/* Activa el panel de una brigada y resalta su botón */
function activarBrigada(id) {
  // Ocultar todos los paneles
  document.querySelectorAll(".brigada-panel").forEach(p => p.classList.remove("active"));
  // Quitar clase active de todos los botones
  document.querySelectorAll(".brigada-btn").forEach(b => b.classList.remove("active"));

  // Mostrar el panel seleccionado
  const panel = document.getElementById("panel-" + id);
  if (panel) {
    panel.classList.add("active");
    // Scroll suave al panel
    setTimeout(() => {
      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }

  // Marcar el botón activo
  const btn = document.querySelector(`.brigada-btn[data-id="${id}"]`);
  if (btn) btn.classList.add("active");
}


/* ================================================================
   3. GALERÍA DE FOTOS
   ─────────────────────────────────────────────────────────────────
   Las imágenes deben estar en: img/Brigada-X/
   Nombradas secuencialmente:  1.jpg, 2.jpg, 3.jpg ...
   (igual que en el app.js de referencia que nos diste)

   SOBRE OPTIMIZACIÓN DE IMÁGENES:
   El navegador hace lazy loading automáticamente con loading="lazy".
   Cuando aprendas herramientas de build (Vite, Gulp, etc.),
   podrás generar versiones .webp y .avif automáticamente para
   imágenes aún más ligeras, igual que el proyecto de referencia.
   Por ahora, asegúrate de guardar tus fotos a un tamaño razonable
   (ej: 1200px de ancho máximo, exportadas al 70-80% de calidad).
   ================================================================ */

let imagenesBrigadaActiva = []; // cache de rutas de imágenes abiertas
let imagenActualIndex     = 0;  // índice de imagen en el lightbox

/* Crea la galería de fotos para una brigada */
function crearGaleria(brigada, contenedor) {
  contenedor.innerHTML = ""; // limpiar antes de rellenar

  if (!brigada.totalFotos || brigada.totalFotos === 0) {
    contenedor.innerHTML = `
      <div class="no-fotos-msg">
        Las fotos de esta brigada estarán disponibles próximamente.
      </div>
    `;
    return;
  }

  // Guardar rutas para navegación en el lightbox
  imagenesBrigadaActiva = [];
  for (let i = 1; i <= brigada.totalFotos; i++) {
    imagenesBrigadaActiva.push(`img/${brigada.id}/${i}.jpg`);
  }

  // Crear un elemento <picture> por cada foto (igual que el app.js de referencia)
  for (let i = 1; i <= brigada.totalFotos; i++) {
    const rutaJpg = `img/${brigada.id}/${i}.jpg`;

    const picture = document.createElement("PICTURE");
    picture.classList.add("gallery-item");

    /*
      Estructura con <source> + <img>:
      - El navegador elige el mejor formato que soporte.
      - loading="lazy" → el navegador solo carga la foto cuando
        el usuario se acerca a ella en el scroll (ahorra datos).
      - width y height → evitan el "layout shift" (salto visual).

      NOTA: Si en el futuro quieres versiones .webp o .avif,
      agrega líneas <source> adicionales como hace el app.js
      de referencia, y genera esos archivos con Squoosh o Vite.
    */
    picture.innerHTML = `
      <img
        loading="lazy"
        width="400"
        height="400"
        src="${rutaJpg}"
        alt="Foto ${i} de la brigada ${brigada.nombre}"
      >
    `;

    // Al hacer clic → abrir lightbox en esa foto
    const indice = i - 1; // captura del índice por closure
    picture.addEventListener("click", () => {
      abrirLightbox(indice);
    });

    contenedor.appendChild(picture);
  }
}


/* ================================================================
   4. LIGHTBOX / MODAL
   ─────────────────────────────────────────────────────────────────
   Similar al app.js de referencia pero con navegación entre fotos.
   ================================================================ */

/* Abre el lightbox mostrando la imagen en el índice dado */
function abrirLightbox(indice) {
  imagenActualIndex = indice;

  // Crear el modal
  const modal = document.createElement("DIV");
  modal.classList.add("modal");
  modal.setAttribute("id", "modalLightbox");

  modal.innerHTML = `
    <button class="btn-cerrar" id="btnCerrarModal" aria-label="Cerrar">✕</button>

    <button class="modal-nav modal-nav-prev" id="btnNavPrev" aria-label="Foto anterior">&#8592;</button>

    <picture id="modalPicture">
      <img
        src="${imagenesBrigadaActiva[imagenActualIndex]}"
        alt="Foto de brigada"
        width="900"
        height="700"
      >
    </picture>

    <button class="modal-nav modal-nav-next" id="btnNavNext" aria-label="Foto siguiente">&#8594;</button>
  `;

  document.body.appendChild(modal);
  document.body.classList.add("overflow-hidden");

  actualizarNavModal();

  // Cerrar al hacer clic en el fondo oscuro
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });

  // Botón cerrar
  document.getElementById("btnCerrarModal").addEventListener("click", cerrarModal);

  // Flechas de navegación
  document.getElementById("btnNavPrev").addEventListener("click", (e) => {
    e.stopPropagation();
    navegarModal(-1);
  });
  document.getElementById("btnNavNext").addEventListener("click", (e) => {
    e.stopPropagation();
    navegarModal(1);
  });
}

/* Navega entre fotos dentro del lightbox */
function navegarModal(direccion) {
  const nuevoIndice = imagenActualIndex + direccion;
  if (nuevoIndice < 0 || nuevoIndice >= imagenesBrigadaActiva.length) return;

  imagenActualIndex = nuevoIndice;

  const img = document.querySelector("#modalPicture img");
  if (img) {
    img.src = imagenesBrigadaActiva[imagenActualIndex];
    img.alt = `Foto ${imagenActualIndex + 1} de brigada`;
  }

  actualizarNavModal();
}

/* Muestra u oculta las flechas según si hay foto anterior/siguiente */
function actualizarNavModal() {
  const btnPrev = document.getElementById("btnNavPrev");
  const btnNext = document.getElementById("btnNavNext");
  if (!btnPrev || !btnNext) return;

  btnPrev.style.display = imagenActualIndex === 0                                  ? "none" : "flex";
  btnNext.style.display = imagenActualIndex === imagenesBrigadaActiva.length - 1   ? "none" : "flex";
}

/* Cierra el lightbox con animación de fade-out */
function cerrarModal() {
  const modal = document.getElementById("modalLightbox");
  if (!modal) return;

  modal.classList.add("fade-out");
  setTimeout(() => {
    modal.remove();
    document.body.classList.remove("overflow-hidden");
  }, 400);
}

/* Navegar con teclado (← →  Escape) */
document.addEventListener("keydown", (e) => {
  if (!document.getElementById("modalLightbox")) return;
  if (e.key === "ArrowLeft")  navegarModal(-1);
  if (e.key === "ArrowRight") navegarModal(1);
  if (e.key === "Escape")     cerrarModal();
});


/* ================================================================
   5. CONSTRUCCIÓN DE PANELES
   ─────────────────────────────────────────────────────────────────
   Genera un panel completo por brigada con:
   - Texto informativo
   - Mapa embebido (sin API key)
   - Galería de fotos
   ================================================================ */

function construirPaneles() {
  const contenedor = document.getElementById("brigadasPanels");
  if (!contenedor) return;

  brigadas.forEach((brigada, i) => {
    const panel = document.createElement("DIV");
    panel.id        = "panel-" + brigada.id;
    panel.className = "brigada-panel" + (i === 0 ? " active" : "");

    panel.innerHTML = `
      <div class="brigada-info">

        <div class="brigada-info-text">
          <h3>${brigada.numero} — ${brigada.nombre}</h3>
          <p>${brigada.descripcion}</p>
          <div class="brigada-meta">
            <div class="brigada-meta-item">
              <span>Año: ${brigada.fecha}</span>
            </div>
            <div class="brigada-meta-item">
            <p>Lugar : </p>
              <span>${brigada.lugar}</span>
            </div>
            <div class="brigada-meta-item">
              <span>${brigada.totalFotos > 0 ? brigada.totalFotos + " fotos" : "Fotos próximamente"}</span>
            </div>
          </div>
        </div>

        <div class="brigada-map">
          <iframe
            src="https://maps.google.com/maps?q=${brigada.lat},${brigada.lng}&z=14&output=embed"
            title="Mapa de ${brigada.nombre}"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>

      </div>

      <div class="brigada-gallery">
        <h3>Galería de Fotos</h3>
        <div class="gallery-grid" id="galeria-${brigada.id}"></div>
      </div>
    `;

    contenedor.appendChild(panel);

    // Crear la galería de fotos dentro del panel recién creado
    const gridGaleria = panel.querySelector(`#galeria-${brigada.id}`);
    crearGaleria(brigada, gridGaleria);
  });
}


/* ================================================================
   6. MODO OSCURO (DARK MODE)
   ─────────────────────────────────────────────────────────────────
   - Guarda la preferencia del usuario en localStorage.
   - Si el usuario prefiere modo oscuro en su sistema (prefers-color-
     scheme), lo activa automáticamente la primera vez.
   - El botón 🌙 / ☀️ lo encontrarás en el header de brigadas.html.
     Cuando aprendas más JS, podrás moverlo a un componente
     reutilizable e incluirlo en todas las páginas fácilmente.
   ================================================================ */

function iniciarDarkMode() {
  const html   = document.documentElement; // el elemento <html>
  const boton  = document.getElementById("darkToggle");
  if (!boton) return;

  // Determinar el tema inicial:
  // 1. Si ya hay preferencia guardada → usarla
  // 2. Si el sistema del usuario prefiere oscuro → activarlo
  // 3. Si no → modo claro por defecto
  const temaGuardado   = localStorage.getItem("ds-tema");
  const sistemaOscuro  = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const temaInicial    = temaGuardado || (sistemaOscuro ? "dark" : "light");

  aplicarTema(temaInicial);

  // Al hacer clic en el botón, alternar entre light y dark
  boton.addEventListener("click", () => {
    const temaActual  = html.getAttribute("data-theme");
    const nuevoTema   = temaActual === "dark" ? "light" : "dark";
    aplicarTema(nuevoTema);
    localStorage.setItem("ds-tema", nuevoTema); // guardar preferencia
  });
}

/* Aplica el tema y actualiza el ícono del botón */
function aplicarTema(tema) {
  const html  = document.documentElement;
  const boton = document.getElementById("darkToggle");

  html.setAttribute("data-theme", tema);

  if (boton) {
    boton.textContent    = tema === "dark" ? "☀️" : "🌙";
    boton.title          = tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
    boton.setAttribute("aria-label", boton.title);
  }
}


/* ================================================================
   INICIALIZACIÓN — se ejecuta cuando el DOM está listo
   ================================================================ */
document.addEventListener("DOMContentLoaded", function () {

  // Construir paneles de brigadas
  construirPaneles();

  // Iniciar carrusel de selección
  iniciarCarrusel();

  // Activar la primera brigada por defecto
  if (brigadas.length > 0) {
    activarBrigada(brigadas[0].id);
  }

  // Iniciar modo oscuro
  iniciarDarkMode();

});