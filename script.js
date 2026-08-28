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

function buildGallery(key) {
  const config = MENUS[key];
  const gallery = document.querySelector(`[data-gallery="${key}"]`);
  const track = gallery.querySelector("[data-track]");
  const dots = gallery.querySelector("[data-dots]");
  const page = gallery.querySelector("[data-page]");
  const prev = gallery.querySelector("[data-prev]");
  const next = gallery.querySelector("[data-next]");

  if (!config || config.count === 0) {
    gallery.dataset.empty = "true";
    track.innerHTML = `
      <div class="gallery-empty">
        <strong>Próximamente</strong>
        <span>Estamos actualizando este menú</span>
      </div>`;
    return;
  }

  let imgs = "";
  let dotEls = "";
  for (let i = 1; i <= config.count; i++) {
    const src = `${config.folder}/${i}.jpg`;
    imgs += `<img src="${src}" alt="Menú Santo Burger - página ${i}" loading="lazy" data-index="${i - 1}">`;
    dotEls += `<span data-dot="${i - 1}"></span>`;
  }
  track.innerHTML = imgs;
  dots.innerHTML = dotEls;

  const setPage = (index) => {
    page.textContent = `Página ${index + 1} de ${config.count}`;
    dots.querySelectorAll("span").forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
    prev.disabled = index === 0;
    next.disabled = index === config.count - 1;
  };

  const goTo = (index) => {
    const target = Math.max(0, Math.min(index, config.count - 1));
    track.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
    setPage(target);
  };

  if (config.count > 1) {
    setPage(0);

    track.addEventListener("scroll", () => {
      const index = Math.round(track.scrollLeft / track.clientWidth);
      setPage(index);
    });
    prev.addEventListener("click", () => goTo(Math.round(track.scrollLeft / track.clientWidth) - 1));
    next.addEventListener("click", () => goTo(Math.round(track.scrollLeft / track.clientWidth) + 1));
  } else {
    dots.innerHTML = "";
    page.textContent = "Página 1 de 1";
    prev.hidden = true;
    next.hidden = true;
  }

  track.querySelectorAll("img").forEach((img) => {
    img.addEventListener("click", () => openLightbox(key, Number(img.dataset.index)));
  });
}

/* ============ ACCORDION ============ */

function initAccordion() {
  const cards = document.querySelectorAll(".card[data-card]");

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
  document.querySelector("[data-zoom-label]").textContent = `${Math.round(zoomLevel * 100)}%`;
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
  document.querySelector("[data-lightbox-prev]").hidden = activeImage === 0;
  document.querySelector("[data-lightbox-next]").hidden = activeImage === count - 1;
}

function initLightbox() {
  document.querySelector("[data-lightbox-close]").addEventListener("click", closeLightbox);
  document.querySelector("[data-lightbox]").addEventListener("click", (e) => {
    if (e.target.matches("[data-lightbox]")) closeLightbox();
  });
  document.querySelector("[data-lightbox-prev]").addEventListener("click", () => changeLightboxImage(-1));
  document.querySelector("[data-lightbox-next]").addEventListener("click", () => changeLightboxImage(1));
  document.querySelector("[data-zoom-in]").addEventListener("click", () => setZoom(zoomLevel + 0.25));
  document.querySelector("[data-zoom-out]").addEventListener("click", () => setZoom(zoomLevel - 0.25));
  document.querySelector("[data-lightbox-img]").addEventListener("dblclick", () => {
    setZoom(zoomLevel > 1 ? 1 : 2);
  });
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
