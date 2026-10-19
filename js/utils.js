// utils.js

// ---------- Preferencias (localStorage con respaldo en cookies) ----------
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  document.cookie = cname + "=" + encodeURIComponent(cvalue) + ";expires=" + d.toUTCString() + ";path=/;SameSite=Lax";
}

function getCookie(cname) {
  const name = cname + "=";
  const ca = document.cookie.split(';');
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(name) === 0) {
      try { return decodeURIComponent(c.substring(name.length)); }
      catch (e) { return c.substring(name.length); }
    }
  }
  return "";
}

function savePref(key, value) {
  try { localStorage.setItem(key, value); }
  catch (e) { setCookie(key, value, 36500); }
}

function loadPref(key) {
  try {
    const v = localStorage.getItem(key);
    if (v !== null) return v;
  } catch (e) { /* ignorar */ }
  return getCookie(key); // migra preferencias antiguas guardadas en cookie
}

// ---------- Texto ----------
// Las expresiones regulares se crean una sola vez (estas funciones se llaman miles de veces)
const RE_EMOJI = /\(emoji\.(?:windows|android|web)\)/g;
const RE_EMOJI_CAP = /\(emoji\.(windows|android|web)\)/g;
const RE_EMOJI_OR_TAG = /\(emoji\.(windows|android|web)\)|\[([^\[\]]+)\]/g;
const RE_BRACKETS = /\s*\[[^\]]*\]\s*/g;
const RE_PARENS_LAZY = /\s*\(.*?\)\s*/g;
const RE_BRACKETS_LAZY = /\s*\[.*?\]\s*/g;
const RE_SPACES = /\s{2,}/g;
const RE_ACCENTS = /[\u0300-\u036f]/g;
const RE_NON_SLUG = /[^a-z0-9]+/g;
const RE_EDGE_DASH = /^-+|-+$/g;
const RE_ESCAPE = /[&<>"']/g;
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

const EMOJI_IMG = {
  windows: '<img src="./img/emoji.windows.webp" alt="Windows" class="emoji" draggable="false" />',
  android: '<img src="./img/emoji.android.webp" alt="Android" class="emoji" draggable="false" />',
  web: '<img src="./img/emoji.web.webp" alt="Web" class="emoji" draggable="false" />'
};

function debounce(func, delay) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      requestAnimationFrame(() => func.apply(context, args));
    }, delay);
  };
}

function escapeHtml(str) {
  return String(str).replace(RE_ESCAPE, ch => HTML_ESCAPES[ch]);
}

// ¿El texto contiene marcadores que requieren HTML? (si no, basta con textContent)
function needsMarkup(text) {
  return !!text && (text.indexOf('(emoji.') !== -1 || text.indexOf('[') !== -1);
}

// Conversión de marcadores a imágenes de emoji y etiquetas, en una sola pasada
// (el texto se escapa antes). [Texto] → etiqueta; (emoji.x) → icono.
function convertEmoji(text) {
  if (!text) return "";
  return escapeHtml(text).replace(RE_EMOJI_OR_TAG, (m, platform, tag) =>
    platform
      ? EMOJI_IMG[platform]
      : '<span class="tag">' + tag.replace(RE_EMOJI_CAP, (mm, p) => EMOJI_IMG[p]) + '</span>'
  );
}

// Texto plano para tooltips: sin marcadores de emoji (conserva [etiquetas])
function plainText(text) {
  if (!text) return "";
  return text.replace(RE_EMOJI, "").replace(RE_SPACES, " ").trim();
}

// Quitar marcadores de emoji (para rutas, títulos y tooltips)
function cleanCategoryName(name) {
  if (!name) return "";
  return name.replace(RE_EMOJI, "").replace(RE_BRACKETS, " ").replace(RE_SPACES, " ").trim();
}

// Slug para URLs limpias: sin emojis, tildes ni espacios ("Páginas Web" → "paginas-web")
function slugify(text) {
  return cleanCategoryName(text)
    .normalize('NFD').replace(RE_ACCENTS, '')
    .toLowerCase()
    .replace(RE_NON_SLUG, '-')
    .replace(RE_EDGE_DASH, '');
}

// Quitar paréntesis y dos puntos para nombres de archivo de imagen
function stripParentheses(text) {
  if (!text) return "";
  return text.replace(RE_PARENS_LAZY, ' ').replace(RE_BRACKETS_LAZY, ' ').replace(/:/g, '').replace(RE_SPACES, ' ').trim();
}

// Ruta de imagen segura (codifica caracteres como & # ? %)
function getItemImagePath(categoryName, displayName) {
  return `./img/Elementos/${encodeURIComponent(cleanCategoryName(categoryName))}/${encodeURIComponent(stripParentheses(displayName))}.webp`;
}

// ---------- Búsqueda ----------
// Sin tildes, minúsculas; los marcadores de emoji pasan a ser palabras
// ("windows", "android", "web") en lugar de la palabra "emoji", que coincidía con todo.
function searchableText(text) {
  return String(text || "")
    .replace(RE_EMOJI_CAP, ' $1 ')
    .normalize('NFD').replace(RE_ACCENTS, '')
    .toLowerCase();
}

// ---------- Carga diferida de imágenes ----------
// Un observador por lista (.list-container) usando esa lista como "root":
// así el margen de precarga se aplica de verdad dentro del scroll de la lista y las
// imágenes ya están cargadas cuando llegas a ellas. Solo se observan las imágenes nuevas.
const lazyObservers = new WeakMap();

function loadLazyImage(img) {
  const src = img.dataset.src;
  if (!src) return;
  img.removeAttribute('data-src');
  img.onerror = function() {
    img.onerror = null;
    img.src = './img/fallback.webp';
  };
  img.src = src; // el placeholder se mantiene visible hasta que la imagen real esté lista
}

function observeLazyImages(imgs, list) {
  if (!imgs.length) return;
  if (!('IntersectionObserver' in window)) {
    imgs.forEach(loadLazyImage);
    return;
  }
  const root = list.closest('.list-container');
  const key = root || document;
  let io = lazyObservers.get(key);
  if (!io) {
    io = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          loadLazyImage(entry.target);
        }
      }
    }, { root: root || null, rootMargin: '300px 0px' });
    lazyObservers.set(key, io);
  }
  imgs.forEach(img => io.observe(img));
}

// Libera el observador de una lista que se va a vaciar (evita retener nodos eliminados)
function releaseLazyImages(list) {
  const key = list.closest('.list-container') || document;
  const io = lazyObservers.get(key);
  if (io) {
    io.disconnect();
    lazyObservers.delete(key);
  }
}

function loadImageAsync(src, imgElement) {
  imgElement.src = './img/placeholder.webp';
  imgElement.dataset.src = src;
}

// ---------- Idioma ----------
let currentLang = 'es';
function t(key) {
  const d = (typeof I18N !== 'undefined' && (I18N[currentLang] || I18N.es)) || {};
  return d[key] !== undefined ? d[key] : key;
}
// Acepta texto o {es, en}
function tr(v) {
  return v && typeof v === 'object' ? (v[currentLang] ?? v.es ?? '') : (v ?? '');
}
function initLanguage() {
  const s = loadPref('lang');
  currentLang = (s === 'es' || s === 'en') ? s : ((navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en');
}
// Compatible con el formato antiguo (listData como string)
function getListText(lang) {
  return typeof listData === 'string' ? listData : (listData[lang] || listData.es || '');
}
