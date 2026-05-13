/* ================================================================
   DIBUJANDO SONRISAS — js/app.js
   ─────────────────────────────────────────────────────────────────
   Módulos:
   1. Configuración de Supabase
   2. Cargar brigadas desde la base de datos
   3. Construir paneles (texto + mapa)
   4. Carrusel de selección (flechas ← →, 4 visibles en desktop)
   5. Galería de fotos  ← dos modos según dónde estén tus fotos:
        MODO A — Imágenes en Supabase Storage  (recomendado)
        MODO B — Imágenes en local (img/Brigada-X/1.jpg)
      Actualmente el MODO A está activo. Para cambiar al B,
      busca "CAMBIAR MODO" más abajo.
   6. Lightbox / Modal con navegación ← → y teclado
   ================================================================ */

/* ── 1. SUPABASE ────────────────────────────────────────────── */
const SUPABASE_URL = "https://rnuvfkhutuuyhlummzeb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudXZma2h1dHV1eWhsdW1temViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgwMzEsImV4cCI6MjA5MjYzNDAzMX0.7bj9YpOA7ENZWesLhTiUg6Tvd2eT-FAp2nsDCX4Lg_Q";

// El CDN de Supabase DEBE estar cargado antes que este archivo.
// En brigadas.html debe aparecer así (en ese orden):
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="js/app.js"></script>
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*
   ── CAMBIAR MODO DE IMÁGENES ────────────────────────────────
   true  → Supabase Storage (necesitas bucket "brigadas" configurado)
   false → Imágenes locales  (img/Brigada-X/1.jpg, 2.jpg...)
   ────────────────────────────────────────────────────────── */
const USAR_SUPABASE_STORAGE = true;

// Nombre del bucket que creaste en Supabase Storage
const STORAGE_BUCKET = "brigadas";

/* ── 2. VARIABLES GLOBALES ──────────────────────────────────── */
let carouselIndex = 0;
let totalBrigadasGlobal = 0; // se llena cuando llegan los datos
let imagenesBrigadaActiva = [];
let imagenActualIndex = 0;

/* ── 3. CARGAR BRIGADAS DESDE SUPABASE ─────────────────────── */
async function cargarBrigadas() {
  const panelsEl = document.getElementById("brigadasPanels");
  if (panelsEl) {
    panelsEl.innerHTML = `
      <p style="text-align:center;color:var(--gray);font-size:1.6rem;padding:4rem 0;">
        Cargando brigadas…
      </p>`;
  }

  const { data: brigadas, error } = await sb
    .from("brigadas")
    .select("*")
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error cargando brigadas:", error.message);
    if (panelsEl) {
      panelsEl.innerHTML = `
        <p style="text-align:center;color:#e74c3c;font-size:1.5rem;padding:4rem 0;">
          No se pudieron cargar las brigadas. Verifica la conexión.
        </p>`;
    }
    return;
  }

  if (!brigadas || brigadas.length === 0) {
    if (panelsEl) {
      panelsEl.innerHTML = `
        <p style="text-align:center;color:var(--gray);font-size:1.5rem;padding:4rem 0;">
          Aún no hay brigadas registradas.
        </p>`;
    }
    return;
  }

  totalBrigadasGlobal = brigadas.length;

  construirPaneles(brigadas);
  iniciarCarrusel(brigadas);

  // Cargar las fotos de cada brigada en paralelo
  brigadas.forEach((b) => {
    const grid = document.getElementById(`galeria-${b.id}`);
    if (!grid) return;
    if (USAR_SUPABASE_STORAGE) {
      cargarFotosDesdeStorage(b, grid);
    } else {
      cargarFotosLocales(b, grid);
    }
  });

  // Activar la primera brigada por defecto
  activarBrigada(brigadas[0].id);
}

/* ── 4. CONSTRUIR PANELES ───────────────────────────────────── */
function construirPaneles(brigadas) {
  const contenedor = document.getElementById("brigadasPanels");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  brigadas.forEach((b, i) => {
    const panel = document.createElement("div");
    panel.id = `panel-${b.id}`;
    panel.className = "brigada-panel" + (i === 0 ? " active" : "");

    panel.innerHTML = `
      <div class="brigada-info">
        <div class="brigada-info-text">
          <h3>${b.numero} — ${b.nombre}</h3>
          <p>${b.descripcion || ""}</p>
          <div class="brigada-meta">
            <div class="brigada-meta-item"><span>Año: ${b.fecha || "—"}</span></div>
            <div class="brigada-meta-item"><span>${b.lugar || "—"}</span></div>
            <div class="brigada-meta-item" id="meta-fotos-${b.id}">
              <span>Cargando fotos…</span>
            </div>
          </div>
        </div>
        <div class="brigada-map">
          <iframe
            src="https://maps.google.com/maps?q=${b.lat},${b.lng}&z=14&output=embed"
            title="Mapa de ${b.nombre}"
            allowfullscreen loading="lazy"
          ></iframe>
        </div>
      </div>
      <div class="brigada-gallery">
        <h3>Galería de Fotos</h3>
        <div class="gallery-grid" id="galeria-${b.id}"></div>
      </div>
    `;

    contenedor.appendChild(panel);
  });
}

/* ── 5A. CARRUSEL ───────────────────────────────────────────────
   El carrusel calcula el ancho de los items directamente desde
   el DOM —después— de que el navegador haya pintado los botones
   (via setTimeout). Esto evita que offsetWidth sea 0.
   ─────────────────────────────────────────────────────────────── */
function iniciarCarrusel(brigadas) {
  const track = document.getElementById("carouselTrack");
  const btnPrev = document.getElementById("carouselPrev");
  const btnNext = document.getElementById("carouselNext");
  if (!track) return;

  track.innerHTML = "";

  brigadas.forEach((b, i) => {
    const btn = document.createElement("button");
    btn.className = "brigada-btn" + (i === 0 ? " active" : "");
    btn.dataset.id = b.id;
    btn.innerHTML = `
      <span class="brigada-num">${b.numero}</span>
      <span class="brigada-name">${b.nombre}</span>
    `;
    btn.addEventListener("click", () => activarBrigada(b.id));
    track.appendChild(btn);
  });

  btnPrev.addEventListener("click", () => moverCarrusel(carouselIndex - 1));
  btnNext.addEventListener("click", () => moverCarrusel(carouselIndex + 1));

  // ── El setTimeout es la clave del fix del carrusel ──────────
  // Cuando los botones se insertan dinámicamente, el navegador
  // aún no ha calculado su tamaño real (offsetWidth = 0).
  // setTimeout(fn, 0) pone la función al final de la cola,
  // después de que el navegador haya terminado de pintar.
  setTimeout(() => moverCarrusel(0), 0);

  // Recalcular si cambia el tamaño de ventana
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => moverCarrusel(carouselIndex), 100);
  });
}

function getVisibleCount() {
  if (window.innerWidth <= 550) return 1;
  if (window.innerWidth <= 900) return 2;
  return 4;
}

function moverCarrusel(nuevoIndex) {
  const track = document.getElementById("carouselTrack");
  const viewport = document.querySelector(".carousel-viewport");
  const btnPrev = document.getElementById("carouselPrev");
  const btnNext = document.getElementById("carouselNext");
  if (!track || !viewport) return;

  const visible = getVisibleCount();
  const GAP_PX = 15; // gap: 1.5rem = ~15px
  const total = totalBrigadasGlobal;
  const maxIndex = Math.max(0, total - visible);

  carouselIndex = Math.min(Math.max(nuevoIndex, 0), maxIndex);

  // Calcular el ancho de cada botón en función del viewport real
  // ────────────────────────────────────────────────────────────
  // viewportW = ancho real del contenedor visible
  // itemWidth = (total ancho - gaps entre items) / items visibles
  const viewportW = viewport.offsetWidth;
  const itemWidth = (viewportW - GAP_PX * (visible - 1)) / visible;

  // Aplicar el ancho a cada botón
  track.querySelectorAll(".brigada-btn").forEach((btn) => {
    btn.style.width = `${itemWidth}px`;
    btn.style.flexShrink = "0";
  });

  // Mover el track
  const offset = carouselIndex * (itemWidth + GAP_PX);
  track.style.transform = `translateX(-${offset}px)`;

  // Habilitar / deshabilitar flechas
  if (btnPrev) btnPrev.disabled = carouselIndex === 0;
  if (btnNext) btnNext.disabled = carouselIndex >= maxIndex;
}

function activarBrigada(id) {
  document
    .querySelectorAll(".brigada-panel")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".brigada-btn")
    .forEach((b) => b.classList.remove("active"));

  const panel = document.getElementById(`panel-${id}`);
  if (panel) {
    panel.classList.add("active");
    setTimeout(
      () => panel.scrollIntoView({ behavior: "smooth", block: "nearest" }),
      50
    );
  }

  const btn = document.querySelector(`.brigada-btn[data-id="${id}"]`);
  if (btn) btn.classList.add("active");
}

/* ── 5B. GALERÍA — MODO A: Supabase Storage ─────────────────────
   Requiere:
   - Bucket público llamado "brigadas" en Supabase Storage
   - Carpetas dentro del bucket: Brigada-1/, Brigada-2/, etc.
   - Las fotos pueden tener cualquier nombre (foto1.jpg, etc.)

   Lo que hace este código:
   1. Lista todos los archivos de la carpeta "Brigada-X" en el bucket
   2. Para cada archivo obtiene su URL pública
   3. Crea un elemento <picture> con lazy loading
   ─────────────────────────────────────────────────────────────── */
async function cargarFotosDesdeStorage(brigada, grid) {
  const metaEl = document.getElementById(`meta-fotos-${brigada.id}`);

  // Listar archivos de la carpeta en el bucket
  const { data: archivos, error } = await sb.storage
    .from(STORAGE_BUCKET)
    .list(brigada.id, {
      sortBy: { column: "name", order: "asc" },
    });

  if (error) {
    console.error(`Storage error en ${brigada.id}:`, error.message);
    mostrarSinFotos(grid, brigada.id);
    if (metaEl) metaEl.innerHTML = `<span>Error cargando fotos</span>`;
    return;
  }

  // Filtrar solo archivos de imagen (ignorar carpetas u otros archivos)
  const imagenes = (archivos || []).filter(
    (f) => f.name && /\.(jpg|jpeg|png|webp|avif)$/i.test(f.name)
  );

  if (imagenes.length === 0) {
    mostrarSinFotos(grid, brigada.id);
    if (metaEl) metaEl.innerHTML = `<span>Fotos próximamente</span>`;
    return;
  }

  // Actualizar el contador de fotos en la meta info
  if (metaEl) {
    metaEl.innerHTML = `<span>${imagenes.length} fotos</span>`;
  }

  // Guardar las URLs para el lightbox
  const urls = imagenes.map((f) => {
    const { data } = sb.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`${brigada.id}/${f.name}`);
    return data.publicUrl;
  });

  // Renderizar la galería
  renderizarGaleria(grid, urls);
}

/* ── 5C. GALERÍA — MODO B: Imágenes locales ─────────────────────
   Las fotos deben estar en: img/Brigada-X/1.jpg, 2.jpg, 3.jpg…
   El código intenta cargar secuencialmente y para cuando falla.
   ─────────────────────────────────────────────────────────────── */
function cargarFotosLocales(brigada, grid) {
  const metaEl = document.getElementById(`meta-fotos-${brigada.id}`);
  const urls = [];
  let indice = 1;
  const MAX = 200; // tope de seguridad

  function intentar() {
    if (indice > MAX) {
      terminar();
      return;
    }

    const url = `img/${brigada.id}/${indice}.jpg`;
    const img = new Image();

    img.onload = () => {
      urls.push(url);
      indice++;
      intentar();
    };

    img.onerror = () => {
      // Ya no hay más fotos
      terminar();
    };

    img.src = url;
  }

  function terminar() {
    if (urls.length === 0) {
      mostrarSinFotos(grid, brigada.id);
      if (metaEl) metaEl.innerHTML = `<span>Fotos próximamente</span>`;
    } else {
      if (metaEl) metaEl.innerHTML = `<span>${urls.length} fotos</span>`;
      renderizarGaleria(grid, urls);
    }
  }

  intentar();
}

/* ── 5D. RENDERIZAR GALERÍA (compartido por ambos modos) ──────── */
function renderizarGaleria(grid, urls) {
  grid.innerHTML = "";

  urls.forEach((url, i) => {
    const picture = document.createElement("picture");
    picture.classList.add("gallery-item");

    const img = document.createElement("img");
    img.src = url;
    img.alt = `Foto ${i + 1} de la brigada`;
    img.loading = "lazy"; // carga diferida: el navegador solo descarga
    img.width = 400; // la foto cuando el usuario se acerca en scroll
    img.height = 400;

    picture.appendChild(img);
    grid.appendChild(picture);

    picture.addEventListener("click", () => {
      imagenesBrigadaActiva = urls;
      abrirLightbox(i);
    });
  });
}

function mostrarSinFotos(grid, brigadaId) {
  grid.innerHTML = `
    <div class="no-fotos-msg">
      Las fotos de esta brigada estarán disponibles próximamente.
    </div>`;
}

/* ── 6. LIGHTBOX ─────────────────────────────────────────────── */
function abrirLightbox(indice) {
  imagenActualIndex = indice;

  const modal = document.createElement("div");
  modal.id = "modalLightbox";
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

  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });
  document
    .getElementById("btnCerrarModal")
    .addEventListener("click", cerrarModal);
  document.getElementById("btnNavPrev").addEventListener("click", (e) => {
    e.stopPropagation();
    navegarModal(-1);
  });
  document.getElementById("btnNavNext").addEventListener("click", (e) => {
    e.stopPropagation();
    navegarModal(1);
  });
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
  prev.style.display = imagenActualIndex === 0 ? "none" : "flex";
  next.style.display =
    imagenActualIndex === imagenesBrigadaActiva.length - 1 ? "none" : "flex";
}

function cerrarModal() {
  const modal = document.getElementById("modalLightbox");
  if (!modal) return;
  modal.classList.add("fade-out");
  setTimeout(() => {
    modal.remove();
    document.body.classList.remove("overflow-hidden");
  }, 400);
}

document.addEventListener("keydown", (e) => {
  if (!document.getElementById("modalLightbox")) return;
  if (e.key === "ArrowLeft") navegarModal(-1);
  if (e.key === "ArrowRight") navegarModal(1);
  if (e.key === "Escape") cerrarModal();
});

/* ── INIT ────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  cargarBrigadas();
});
