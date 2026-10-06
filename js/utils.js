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
  return String(str).replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

// Conversión de marcadores a imágenes de emoji (el texto se escapa antes)
function convertEmoji(text) {
  if (!text) return "";
  return escapeHtml(text)
    .replace(/\(emoji\.windows\)/g, '<img src="./img/emoji.windows.webp" alt="Windows" class="emoji" draggable="false" />')
    .replace(/\(emoji\.android\)/g, '<img src="./img/emoji.android.webp" alt="Android" class="emoji" draggable="false" />')
    .replace(/\(emoji\.web\)/g, '<img src="./img/emoji.web.webp" alt="Web" class="emoji" draggable="false" />')
    // [Texto] → etiqueta (el contenido ya viene escapado)
    .replace(/\[([^\[\]]+)\]/g, '<span class="tag">$1</span>');
}

// Texto plano para tooltips: sin marcadores de emoji (conserva [etiquetas])
function plainText(text) {
  if (!text) return "";
  return text.replace(/\(emoji\.(windows|android|web)\)/g, "").replace(/\s{2,}/g, " ").trim();
}

// Quitar marcadores de emoji (para rutas, títulos y tooltips)
function cleanCategoryName(name) {
  if (!name) return "";
  return name.replace(/\(emoji\.(windows|android|web)\)/g, "").replace(/\s*\[[^\]]*\]\s*/g, " ").replace(/\s{2,}/g, " ").trim();
}

// Slug para URLs limpias: sin emojis, tildes ni espacios ("Páginas Web" → "paginas-web")
function slugify(text) {
  return cleanCategoryName(text)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Quitar paréntesis y dos puntos para nombres de archivo de imagen
function stripParentheses(text) {
  if (!text) return "";
  return text.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s*\[.*?\]\s*/g, ' ').replace(/:/g, '').replace(/\s{2,}/g, ' ').trim();
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
    .replace(/\(emoji\.windows\)/g, ' windows ')
    .replace(/\(emoji\.android\)/g, ' android ')
    .replace(/\(emoji\.web\)/g, ' web ')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// ---------- Carga diferida de imágenes ----------
let lazyImageObserver;
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img[data-src]');

  const loadImg = (img) => {
    const src = img.dataset.src;
    if (!src) return;
    const tempImg = new Image();
    tempImg.onload = function() {
      img.src = src;
      img.removeAttribute('data-src');
    };
    tempImg.onerror = function() {
      img.src = './img/fallback.webp';
      img.removeAttribute('data-src');
    };
    tempImg.src = src;
  };

  if ('IntersectionObserver' in window) {
    if (!lazyImageObserver) {
      lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            loadImg(entry.target);
          }
        });
      }, { rootMargin: '200px' });
    }
    lazyImages.forEach(img => lazyImageObserver.observe(img));
  } else {
    lazyImages.forEach(loadImg);
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
