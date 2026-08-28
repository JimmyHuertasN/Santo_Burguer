/* ============================================
   SANTO BURGER — menú digital
   -------------------------------------------
   Para actualizar el menú:
   1. Agrega/reemplaza las fotos en:
      assets/menu-comida/       (ej: 1.jpg, 2.jpg, 3.jpg...)
      assets/menu-micheladas/
   2. Actualiza los números en MENUS de abajo para que
      coincidan con la cantidad de imágenes en cada carpeta.
   3. Sube los cambios (git push) — el sitio se actualiza solo.
   ============================================ */

const MENUS = {
  comida: {
    folder: "assets/menu-comida",
    count: 2, // hay 2 imágenes: 1.jpg y 2.jpg
  },
  micheladas: {
    folder: "assets/menu-micheladas",
    count: 0, // aún no hay fotos — se muestra "próximamente"
  },
};

let activeMenu = null;
let activeImage = 0;
let zoomLevel = 1;
let pinchStartDistance = 0;
let pinchStartZoom = 1;

function buildGallery(key) {
  const config = MENUS[key];
  const gallery = document.querySelector(`[data-gallery="${key}"]`);
  if (!gallery) return;
  const track = gallery.querySelector("[data-track]");
  const dots = gallery.querySelector("[data-dots]");

  if (!config || config.count === 0) {
    gallery.dataset.empty = "true";
    track.innerHTML = `
      <div class="gallery-empty">
        <strong>Próximamente</strong>
        <span>Estamos actualizando este menú</span>
      </div>`;
    return;
  }

}

/* ============ ACCORDION ============ */

function initAccordion() {
  const cards = document.querySelectorAll(".card[data-card]:not([data-direct-menu])");

  document.querySelector("[data-direct-menu] [data-toggle]").addEventListener("click", () => {
    openLightbox("comida", 0);
  });

  cards.forEach((card) => {
    const key = card.dataset.card;
    const btn = card.querySelector("[data-toggle]");

    btn.addEventListener("click", () => {
      const isOpen = card.dataset.open === "true";

      // cerrar los demás (comportamiento tipo acordeón)
      cards.forEach((c) => {
        c.dataset.open = "false";
        c.querySelector("[data-toggle]").setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        card.dataset.open = "true";
        btn.setAttribute("aria-expanded", "true");
        card.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ============ LIGHTBOX ============ */

function openLightbox(key, index) {
  activeMenu = key;
  activeImage = index;
  const lightbox = document.querySelector("[data-lightbox]");
  const img = document.querySelector("[data-lightbox-img]");
  const config = MENUS[key];
  img.src = `${config.folder}/${index + 1}.jpg`;
  img.alt = `Menú Santo Burger - página ${index + 1}`;
  setZoom(1);
  lightbox.dataset.visible = "true";
  lightbox.setAttribute("aria-hidden", "false");
  document.querySelector("[data-lightbox-close]").focus();
  updateLightboxNavigation();
}

function closeLightbox() {
  const lightbox = document.querySelector("[data-lightbox]");
  lightbox.dataset.visible = "false";
  lightbox.setAttribute("aria-hidden", "true");
}

function setZoom(level) {
  zoomLevel = Math.max(1, Math.min(level, 2.5));
  document.querySelector("[data-lightbox-img]").style.transform = `scale(${zoomLevel})`;
}

function changeLightboxImage(step) {
  if (!activeMenu) return;
  const count = MENUS[activeMenu].count;
  activeImage = Math.max(0, Math.min(activeImage + step, count - 1));
  const img = document.querySelector("[data-lightbox-img]");
  img.src = `${MENUS[activeMenu].folder}/${activeImage + 1}.jpg`;
  img.alt = `Menú Santo Burger - página ${activeImage + 1}`;
  setZoom(1);
  updateLightboxNavigation();
}

function updateLightboxNavigation() {
  const count = MENUS[activeMenu].count;
  document.querySelector("[data-lightbox-page]").textContent = `Página ${activeImage + 1} de ${count}`;
  document.querySelector("[data-lightbox-pages]").innerHTML = Array.from({ length: count }, (_, i) => `
    <button type="button" class="${i === activeImage ? "active" : ""}" data-lightbox-page-button="${i}">Página ${i + 1}</button>`).join("");
  document.querySelectorAll("[data-lightbox-page-button]").forEach((button) => {
    button.addEventListener("click", () => {
      activeImage = Number(button.dataset.lightboxPageButton);
      changeLightboxImage(0);
    });
  });
}

function initLightbox() {
  document.querySelector("[data-lightbox-close]").addEventListener("click", closeLightbox);
  document.querySelector("[data-lightbox]").addEventListener("click", (e) => {
    if (e.target.matches("[data-lightbox]")) closeLightbox();
  });
  document.querySelector("[data-lightbox-img]").addEventListener("dblclick", () => {
    setZoom(zoomLevel > 1 ? 1 : 2);
  });
  const wrap = document.querySelector("[data-image-wrap]");

  wrap.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 2) return;
    const [first, second] = event.touches;
    pinchStartDistance = Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
    pinchStartZoom = zoomLevel;
  }, { passive: true });
  wrap.addEventListener("touchmove", (event) => {
    if (event.touches.length !== 2 || !pinchStartDistance) return;
    event.preventDefault();
    const [first, second] = event.touches;
    const distance = Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
    setZoom(pinchStartZoom * (distance / pinchStartDistance));
  }, { passive: false });
  wrap.addEventListener("touchend", () => { pinchStartDistance = 0; }, { passive: true });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
    if (document.querySelector("[data-lightbox]").dataset.visible === "true") {
      if (e.key === "ArrowLeft") changeLightboxImage(-1);
      if (e.key === "ArrowRight") changeLightboxImage(1);
    }
  });
}

/* ============ INIT ============ */

document.addEventListener("DOMContentLoaded", () => {
  Object.keys(MENUS).forEach(buildGallery);
  initAccordion();
  initLightbox();
});
