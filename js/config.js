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

  // Idiomas del menú desplegable (code debe existir en list.js)
  languages: [
    { code: "es", name: "Español", short: "ES" },
    { code: "en", name: "English", short: "EN" }
  ],

  // Opciones del panel de configuración (se generan solas como interruptores).
  // key = nombre con el que se guarda; apply(valor) se ejecuta al cargar y al cambiar.
  settings: [
    { key: "grid_view", label: { es: "Activar vista grid de iconos", en: "Enable icon grid view" }, default: false, apply: (v) => applyGridView(v) }
  ],

  // Widgets que se insertan al cargar. Ejemplo:
  // { slot: 'sidebar-right', html: '<strong>Anuncio</strong><p>Texto…</p>' }
  widgets: []
};

// Textos de la interfaz por idioma (los de la lista están en list.js)
const I18N = {
  es: { search: 'Buscar...', clear: 'Borrar búsqueda', categories: 'Categorías', results: 'Búsqueda', noResults: 'No se encontraron resultados.', download: 'Descargar', config: 'Configuración', close: 'Cerrar', language: 'Idioma' },
  en: { search: 'Search...', clear: 'Clear search', categories: 'Categories', results: 'Search', noResults: 'No results found.', download: 'Download', config: 'Settings', close: 'Close', language: 'Language' }
};
