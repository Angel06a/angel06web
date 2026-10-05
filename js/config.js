// config.js — Punto único para personalizar el sitio sin tocar la lógica.
//
// SLOTS disponibles (zonas del layout donde se pueden insertar widgets):
//   header-actions · sidebar-top · sidebar-bottom · main-top · main-bottom · sidebar-right
// (sidebar-right se muestra solo cuando tiene contenido)
//
// Para añadir una sección (p. ej. anuncios) basta con una entrada en "widgets":
//   { slot: 'sidebar-right', html: '<div class="ad-box">…</div>' }
// o desde cualquier script:  addWidget('main-top', '<p>Hola</p>');
//
// Eventos disponibles: 'tabchange' (detail.tabId) y 'itemselect' (detail.link1/link2).

const SITE_CONFIG = {
  title: "Angel06 Web (emoji.windows) (emoji.android) (emoji.web)",
  footer: "© 2026 Angel06 Web",

  // Iconos de la cabecera (a la izquierda del botón de configuración)
  headerLinks: [
    { href: "https://www.youtube.com/@AngeL06oficial", icon: "./img/youtube-icon.webp", label: "YouTube" },
    { href: "https://gravatar.com/totallytacoc43f8d4da2", icon: "./img/gravatar.webp", label: "Gravatar" }
  ],

  // Opciones del panel de configuración (se generan solas como interruptores).
  // key = nombre con el que se guarda; apply(valor) se ejecuta al cargar y al cambiar.
  settings: [
    { key: "grid_view", label: "Activar vista grid de iconos", default: false, apply: (v) => applyGridView(v) }
  ],

  // Widgets que se insertan al cargar. Ejemplo:
  // { slot: 'sidebar-right', html: '<strong>Anuncio</strong><p>Texto…</p>' }
  widgets: []
};
