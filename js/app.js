/* ================================================================
   DIBUJANDO SONRISAS — js/app.js
   Funciones:
     1. Conexión a Supabase
     2. Cargar brigadas desde la base de datos
     3. Carrusel de selección (4 visibles en desktop)
     4. Galería de fotos locales con lazy loading + lightbox
   ================================================================ */


/* ================================================================
   1. CONFIGURACIÓN DE SUPABASE
   ─────────────────────────────────────────────────────────────────
   IMPORTANTE: el CDN de Supabase debe cargarse ANTES que este
   archivo en el HTML. Verifica que en brigadas.html sea:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="js/app.js"></script>   ← este va después
   ================================================================ */
const SUPABASE_URL     = "https://rnuvfkhutuuyhlummzeb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudXZma2h1dHV1eWhsdW1temViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgwMzEsImV4cCI6MjA5MjYzNDAzMX0.7bj9YpOA7ENZWesLhTiUg6Tvd2eT-FAp2nsDCX4Lg_Q";

// Crear cliente de Supabase (viene del CDN cargado antes en el HTML)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


/* ================================================================
   2. VARIABLES GLOBALES
   ================================================================ */
let carouselIndex         = 0;
let imagenesBrigadaActiva = [];
let imagenActualIndex     = 0;


/* ================================================================
   3. CARGAR BRIGADAS DESDE SUPABASE
   ─────────────────────────────────────────────────────────────────
   Trae todas las brigadas ordenadas por el campo "orden".
   Una vez cargadas, construye los paneles y el carrusel.
   ================================================================ */
async function cargarBrigadas() {
  // Mostrar indicador de carga mientras espera
  const panelsContainer = document.getElementById("brigadasPanels");
  if (panelsContainer) {
    panelsContainer.innerHTML = `
      <p style="text-align:center; color:var(--gray); font-size:1.6rem; padding:4rem 0;">
        Cargando brigadas...
      </p>`;
  }

  const { data: brigadas, error } = await supabaseClient
    .from("brigadas")
    .select("*")
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error cargando brigadas:", error.message);
    if (panelsContainer) {
      panelsContainer.innerHTML = `
        <p style="text-align:center; color:#e74c3c; font-size:1.5rem; padding:4rem 0;">
          No se pudieron cargar las brigadas. Verifica la conexión.
        </p>`;
    }
    return;
  }

  if (!brigadas || brigadas.length === 0) {
    if (panelsContainer) {
      panelsContainer.innerHTML = `
        <p style="text-align:center; color:var(--gray); font-size:1.5rem; padding:4rem 0;">
          Aún no hay brigadas registradas.
        </p>`;
    }
    return;
  }

  // Con los datos listos, construir la página
  construirPaneles(brigadas);
  iniciarCarrusel(brigadas);

  // Activar la primera brigada por defecto
  activarBrigada(brigadas[0].id);
}


/* ================================================================
   4. CARRUSEL DE SELECCIÓN
   ─────────────────────────────────────────────────────────────────
   Muestra 4 brigadas visibles en desktop, 2 en tablet,
   scroll táctil en móvil. Las flechas mueven el track.
   ================================================================ */
function getVisibleCount() {
  if (window.innerWidth <= 550) return 1;
  if (window.innerWidth <= 900) return 2;
  return 4;
}

function moverCarrusel(nuevoIndex, totalBtns) {
  const track   = document.getElementById("carouselTrack");
  const btnPrev = document.getElementById("carouselPrev");
  const btnNext = document.getElementById("carouselNext");

  const visibleCount = getVisibleCount();
  const maxIndex     = Math.max(0, totalBtns - visibleCount);
  carouselIndex      = Math.min(Math.max(nuevoIndex, 0), maxIndex);

  const primerBtn = track.querySelector(".brigada-btn");
  if (!primerBtn) return;

  // 15px ≈ 1.5rem gap entre items
  const itemAncho = primerBtn.offsetWidth + 15;
  track.style.transform = `translateX(-${carouselIndex * itemAncho}px)`;

  btnPrev.disabled = carouselIndex === 0;
  btnNext.disabled = carouselIndex >= maxIndex;
}

function iniciarCarrusel(brigadas) {
  const track   = document.getElementById("carouselTrack");
  const btnPrev = document.getElementById("carouselPrev");
  const btnNext = document.getElementById("carouselNext");

  if (!track) return;
  track.innerHTML = ""; // limpiar si hubiera algo

  // Crear un botón por brigada
  brigadas.forEach((brigada, i) => {
    const btn      = document.createElement("button");
    btn.className  = "brigada-btn" + (i === 0 ? " active" : "");
    btn.dataset.id = brigada.id;
    btn.innerHTML  = `
      <span class="brigada-num">${brigada.numero}</span>
      <span class="brigada-name">${brigada.nombre}</span>
    `;
    btn.addEventListener("click", () => activarBrigada(brigada.id));
    track.appendChild(btn);
  });

  btnPrev.addEventListener("click", () => moverCarrusel(carouselIndex - 1, brigadas.length));
  btnNext.addEventListener("click", () => moverCarrusel(carouselIndex + 1, brigadas.length));

  // Estado inicial
  moverCarrusel(0, brigadas.length);

  // Recalcular al cambiar tamaño de ventana
  window.addEventListener("resize", () => moverCarrusel(carouselIndex, brigadas.length));
}

function activarBrigada(id) {
  document.querySelectorAll(".brigada-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".brigada-btn").forEach(b => b.classList.remove("active"));

  const panel = document.getElementById("panel-" + id);
  if (panel) {
    panel.classList.add("active");
    setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  }

  const btn = document.querySelector(`.brigada-btn[data-id="${id}"]`);
  if (btn) btn.classList.add("active");
}


/* ================================================================
   5. CONSTRUCCIÓN DE PANELES
   ─────────────────────────────────────────────────────────────────
   Genera un panel por brigada con:
   - Texto informativo (viene de Supabase)
   - Mapa embebido con las coordenadas de Supabase
   - Galería de fotos locales (img/Brigada-X/1.jpg, 2.jpg...)
   ================================================================ */
function construirPaneles(brigadas) {
  const contenedor = document.getElementById("brigadasPanels");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  brigadas.forEach((brigada, i) => {
    const panel     = document.createElement("DIV");
    panel.id        = "panel-" + brigada.id;
    panel.className = "brigada-panel" + (i === 0 ? " active" : "");

    panel.innerHTML = `
      <div class="brigada-info">
        <div class="brigada-info-text">
          <h3>${brigada.numero} — ${brigada.nombre}</h3>
          <p>${brigada.descripcion || ""}</p>
          <div class="brigada-meta">
            <div class="brigada-meta-item">
              <span class="icon">📅</span>
              <span>Año: ${brigada.fecha || "—"}</span>
            </div>
            <div class="brigada-meta-item">
              <span class="icon">📍</span>
              <span>${brigada.lugar || "—"}</span>
            </div>
            <div class="brigada-meta-item">
              <span class="icon">📸</span>
              <span id="foto-count-${brigada.id}">${brigada.total_fotos > 0 ? brigada.total_fotos + " fotos" : "Fotos próximamente"}</span>
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

    // Crear la galería con las fotos locales
    const grid = panel.querySelector(`#galeria-${brigada.id}`);
    crearGaleria(brigada, grid);
  });
}


/* ================================================================
   6. GALERÍA DE FOTOS LOCALES
   ─────────────────────────────────────────────────────────────────
   Las fotos están guardadas en: img/Brigada-X/1.jpg, 2.jpg...
   El código intenta cargar 1.jpg, 2.jpg, etc. y se detiene
   automáticamente cuando una imagen falla (ya no hay más).

   ¿Por qué funciona así?
   El navegador no puede leer carpetas directamente por seguridad.
   El truco es usar el evento "onerror" de cada <img>: si la foto
   no existe, el error nos indica que ya no hay más imágenes.
   Así no necesitas contar manualmente cuántas fotos hay.

   NOTA: total_fotos en Supabase se usa como máximo de seguridad
   para no hacer requests infinitos. Si es 0 o null, usa 200
   como límite máximo (más que suficiente para cualquier brigada).
   ================================================================ */
function crearGaleria(brigada, grid) {
  grid.innerHTML = "";

  const maxFotos = brigada.total_fotos > 0 ? brigada.total_fotos : 200;
  let   contador = 0; // fotos que cargaron correctamente
  let   indice   = 1; // foto que se está intentando cargar

  function cargarSiguiente() {
    if (indice > maxFotos) {
      // Llegamos al límite — mostrar mensaje si no cargó ninguna
      if (contador === 0) mostrarSinFotos(grid, brigada.id);
      return;
    }

    const rutaJpg = `img/${brigada.id}/${indice}.jpg`;
    const num     = indice; // captura para el closure del click

    const picture = document.createElement("PICTURE");
    picture.classList.add("gallery-item");

    const img        = document.createElement("img");
    img.src          = rutaJpg;
    img.alt          = `Foto ${num} de la brigada ${brigada.nombre}`;
    img.loading      = "lazy";   // el navegador la carga solo cuando aparece en pantalla
    img.width        = 400;
    img.height       = 400;

    img.onload = () => {
      // La foto existe y cargó bien — agregarla a la galería
      contador++;
      picture.appendChild(img);
      grid.appendChild(picture);

      // Guardar la ruta en el array global para el lightbox
      // (lo hacemos aquí para que el orden sea correcto)
      picture.dataset.index = contador - 1;
      picture.addEventListener("click", () => {
        // Recopilar todas las fotos visibles de esta brigada en orden
        const todasLasFotos = Array.from(
          grid.querySelectorAll(".gallery-item img")
        ).map(i => i.src);

        imagenesBrigadaActiva = todasLasFotos;
        abrirLightbox(parseInt(picture.dataset.index));
      });

      // Intentar la siguiente
      indice++;
      cargarSiguiente();
    };

    img.onerror = () => {
      // Esta foto no existe — significa que ya se acabaron
      if (contador === 0) mostrarSinFotos(grid, brigada.id);
      // No seguir intentando
    };

    // Para fotos que aún no tienen picture en el DOM,
    // creamos la imagen fuera del DOM primero para detectar el error
    if (counter === 0 && !picture.parentNode) {
      // ya está siendo cargada por onload/onerror arriba
    }
  }

  cargarSiguiente();
}

function mostrarSinFotos(grid, brigadaId) {
  grid.innerHTML = `
    <div class="no-fotos-msg">
      <span>📸</span>
      Las fotos de esta brigada estarán disponibles próximamente.<br>
      <small>Agrega tus fotos en <code>img/${brigadaId}/</code> nombradas 1.jpg, 2.jpg, 3.jpg...</small>
    </div>
  `;
}


/* ================================================================
   7. LIGHTBOX
   ─────────────────────────────────────────────────────────────────
   Modal que muestra la foto en grande con navegación ← →
   y soporte de teclado (flechas + Escape).
   ================================================================ */
function abrirLightbox(indice) {
  imagenActualIndex = indice;

  const modal = document.createElement("DIV");
  modal.id    = "modalLightbox";
  modal.classList.add("modal");

  modal.innerHTML = `
    <button class="btn-cerrar" id="btnCerrarModal" aria-label="Cerrar">✕</button>
    <button class="modal-nav modal-nav-prev" id="btnNavPrev" aria-label="Foto anterior">&#8592;</button>
    <picture id="modalPicture">
      <img src="${imagenesBrigadaActiva[imagenActualIndex]}" alt="Foto de brigada" width="900" height="700">
    </picture>
    <button class="modal-nav modal-nav-next" id="btnNavNext" aria-label="Foto siguiente">&#8594;</button>
  `;

  document.body.appendChild(modal);
  document.body.classList.add("overflow-hidden");
  actualizarNavModal();

  modal.addEventListener("click",    (e) => { if (e.target === modal) cerrarModal(); });
  document.getElementById("btnCerrarModal").addEventListener("click", cerrarModal);
  document.getElementById("btnNavPrev").addEventListener("click", (e) => { e.stopPropagation(); navegarModal(-1); });
  document.getElementById("btnNavNext").addEventListener("click", (e) => { e.stopPropagation(); navegarModal(1); });
}

function navegarModal(dir) {
  const nuevo = imagenActualIndex + dir;
  if (nuevo < 0 || nuevo >= imagenesBrigadaActiva.length) return;
  imagenActualIndex = nuevo;
  const img = document.querySelector("#modalPicture img");
  if (img) img.src = imagenesBrigadaActiva[imagenActualIndex];
  actualizarNavModal();
}

function actualizarNavModal() {
  const prev = document.getElementById("btnNavPrev");
  const next = document.getElementById("btnNavNext");
  if (!prev || !next) return;
  prev.style.display = imagenActualIndex === 0                                 ? "none" : "flex";
  next.style.display = imagenActualIndex === imagenesBrigadaActiva.length - 1  ? "none" : "flex";
}

function cerrarModal() {
  const modal = document.getElementById("modalLightbox");
  if (!modal) return;
  modal.classList.add("fade-out");
  setTimeout(() => { modal.remove(); document.body.classList.remove("overflow-hidden"); }, 400);
}

document.addEventListener("keydown", (e) => {
  if (!document.getElementById("modalLightbox")) return;
  if (e.key === "ArrowLeft")  navegarModal(-1);
  if (e.key === "ArrowRight") navegarModal(1);
  if (e.key === "Escape")     cerrarModal();
});


/* ================================================================
   INICIALIZACIÓN
   ================================================================ */
document.addEventListener("DOMContentLoaded", function () {
  cargarBrigadas();
});