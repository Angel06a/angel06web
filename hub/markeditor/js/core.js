// Núcleo: configuración, utilidades e idioma

// ===== Configuración global =====
const STORAGE_KEY = 'mark_editor_content';

// ===== CSS embebido que se incluye en el HTML exportado / copiado =====
const EMBEDDED_EXPORT_CSS = `*,::before,::after{box-sizing:border-box}html,body{max-width:100%;overflow-x:hidden}:root{color-scheme:light;scrollbar-color:#cbd5e1 #f1f5f9;scrollbar-width:thin}html.dark{color-scheme:dark;scrollbar-color:#383c3e #181a1b}::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-track{background:#f1f5f9}.dark ::-webkit-scrollbar-track{background:#181a1b}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}::-webkit-scrollbar-thumb:hover{background:#94a3b8}.dark ::-webkit-scrollbar-thumb{background:#383c3e;border-radius:4px}.dark ::-webkit-scrollbar-thumb:hover{background:#4b5563}body{font-family:'Inter',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}.font-mono{font-family:'Fira Code',monospace}.mark-rendered{color:inherit;line-height:1.6;word-wrap:break-word;overflow-wrap:break-word;word-break:break-word;max-width:100%;width:100%}.mark-rendered h1{font-size:2.1em;font-weight:700;margin-top:.8em;margin-bottom:.4em;border-bottom:1px solid currentColor;opacity:.95}.mark-rendered h2{font-size:1.65em;font-weight:600;margin-top:.7em;margin-bottom:.35em;border-bottom:1px solid rgba(128,128,128,.2)}.mark-rendered h3{font-size:1.35em;font-weight:600;margin-top:.6em;margin-bottom:.3em}.mark-rendered h4{font-size:1.15em;font-weight:600;margin-top:.5em;margin-bottom:.25em}.mark-rendered h5{font-size:1em;font-weight:600;margin-top:.4em;margin-bottom:.2em}.mark-rendered h6{font-size:.88em;font-weight:600;margin-top:.4em;margin-bottom:.2em;opacity:.8}.mark-rendered p{margin-bottom:.85em}.mark-rendered mark{background-color:#f6e05e;color:#1a202c;padding:.1em .3em;border-radius:.2em}.mark-admonition{border-left:4px solid;padding:.8em 1.1em;margin:1em 0;border-radius:0 .375rem .375rem 0;background-color:rgba(128,128,128,.08);max-width:100%;overflow-x:auto}.mark-admonition-title{font-weight:700;margin-bottom:.4em;text-transform:capitalize;display:flex;align-items:center;gap:.5rem}.mark-admonition.note{border-color:#3b82f6}.mark-admonition.note .mark-admonition-title{color:#3b82f6}.mark-admonition.info{border-color:#06b6d4}.mark-admonition.info .mark-admonition-title{color:#06b6d4}.mark-admonition.warning{border-color:#f59e0b}.mark-admonition.warning .mark-admonition-title{color:#f59e0b}.mark-admonition.danger{border-color:#ef4444}.mark-admonition.danger .mark-admonition-title{color:#ef4444}.mark-admonition.greentext{border-color:#22c55e}.mark-admonition.greentext .mark-admonition-title{color:#22c55e}.mark-admonition.game,.mark-admonition.download{border-color:#8b5cf6}.mark-admonition.game .mark-admonition-title,.mark-admonition.download .mark-admonition-title{color:#8b5cf6}.mark-admonition.requirements,.mark-admonition.specs{border-color:#10b981}.mark-admonition.requirements .mark-admonition-title,.mark-admonition.specs .mark-admonition-title{color:#10b981}.mark-spoiler{background-color:#2d3748;color:transparent;cursor:pointer;padding:.1em .4em;border-radius:.25rem;transition:all .2s ease;user-select:none}.mark-spoiler.revealed,.mark-spoiler:hover{background-color:rgba(128,128,128,.2);color:inherit}.mark-rendered blockquote{border-left:4px solid #a0aec0;padding-left:1rem;margin:.8rem 0;color:#718096;font-style:italic}.dark .mark-rendered blockquote{border-left-color:#4a5568;color:#a0aec0}.mark-rendered table{display:block;width:100%;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;border-collapse:collapse;margin:1rem 0}.mark-rendered td,.mark-rendered th{border:1px solid #cbd5e0;padding:.5rem .8rem}.dark .mark-rendered td,.dark .mark-rendered th{border-color:#4a5568}.mark-rendered th{background-color:rgba(0,0,0,.05);font-weight:600}.dark .mark-rendered th{background-color:rgba(255,255,255,.05)}.mark-rendered pre{background-color:#1e1e1e;color:#d4d4d4;padding:1rem;border-radius:.375rem;overflow-x:auto;margin:.8rem 0;font-family:'Fira Code',monospace;font-size:.9em;max-width:100%;white-space:pre-wrap;word-break:break-all}.mark-rendered code{font-family:'Fira Code',monospace;background-color:rgba(128,128,128,.15);padding:.15em .4em;border-radius:.25rem;font-size:.9em;word-break:break-word}.mark-rendered pre code{background-color:transparent;padding:0;white-space:pre-wrap;word-break:break-all}.mark-rendered img{max-width:100%!important;height:auto!important}.mark-rendered ul{list-style-type:disc;padding-left:1.5rem;margin-bottom:.8rem}.mark-rendered ol{list-style-type:decimal;padding-left:1.5rem;margin-bottom:.8rem}.mark-rendered ol ol,.mark-rendered ol ul,.mark-rendered ul ol,.mark-rendered ul ul{margin-bottom:0}.mark-rendered li{margin-bottom:.2rem}.mark-toc{background-color:rgba(128,128,128,.08);border:1px solid rgba(128,128,128,.2);border-radius:.375rem;padding:1rem;margin:1rem 0;display:block;width:fit-content;max-width:100%;overflow-x:auto}.mark-toc-title{font-weight:700;margin-bottom:.5rem;border-bottom:1px solid rgba(128,128,128,.2);padding-bottom:.25rem}.mark-toc ul{list-style-type:none;padding-left:1rem;margin:0}.mark-toc>ul{padding-left:0}.mark-toc a{color:#3182ce;text-decoration:none}.mark-toc a:hover{text-decoration:underline}.dark .mark-toc a{color:#63b3ed}.mark-link{color:inherit;word-break:break-word}.mark-task-list{list-style:none!important;padding-left:.5rem!important}.mark-task-item{display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem}.img-float-left{float:left;margin-right:1rem;margin-bottom:.5rem}.img-float-right{float:right;margin-left:1rem;margin-bottom:.5rem}@media (max-width:640px){.img-float-left,.img-float-right{float:none!important;display:block!important;margin:.5rem auto!important;max-width:100%!important}}.mark-download-btn{display:inline-flex;align-items:center;justify-content:space-between;gap:.75rem;background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff!important;padding:.5rem .85rem;border-radius:.375rem;text-decoration:none!important;font-weight:600;box-shadow:0 2px 8px rgba(2,132,199,.25);transition:all .2s ease-in-out;margin:.5rem 0;max-width:100%;width:fit-content;cursor:pointer;word-break:break-word}.mark-download-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(2,132,199,.35);background:linear-gradient(135deg,#0369a1,#075985)}.mark-download-btn.secondary{background:linear-gradient(135deg,#4b5563,#374151);box-shadow:0 2px 8px rgba(75,85,99,.25)}.mark-download-btn.secondary:hover{background:linear-gradient(135deg,#374151,#1f2937)}.mark-download-btn.success{background:linear-gradient(135deg,#16a34a,#15803d);box-shadow:0 2px 8px rgba(22,163,74,.25)}.mark-download-btn.success:hover{background:linear-gradient(135deg,#15803d,#166534)}.mark-download-btn .btn-text{display:flex;flex-direction:column}.mark-download-btn .btn-title{font-size:.85em;font-weight:600;line-height:1.25}.mark-download-btn .btn-sub{font-size:.7em;opacity:.85;font-weight:400;margin-top:.1rem}.mark-download-btn .btn-icon{font-size:1.1em}.mark-badge{display:inline-flex;align-items:center;gap:.3rem;padding:.2em .55em;font-size:.8em;font-weight:600;border-radius:.375rem;background-color:rgba(13,148,136,.15);color:#0d9488;border:1px solid rgba(13,148,136,.3);margin:.15rem .2rem;vertical-align:middle}.dark .mark-badge{color:#2dd4bf;background-color:rgba(13,148,136,.2);border-color:rgba(45,212,191,.35)}.mark-rating{display:inline-flex;align-items:center;gap:.4rem;color:#f59e0b;font-weight:700;font-size:.95em;margin:.25rem 0}.mark-rating-stars{display:inline-flex;gap:.15rem}.mark-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:.75rem;margin:1rem 0;width:100%;max-width:100%}.mark-gallery img{width:100%;height:150px;object-fit:cover;border-radius:.375rem;transition:transform .2s ease,box-shadow .2s ease}.mark-gallery img:hover{transform:scale(1.025);box-shadow:0 8px 16px rgba(0,0,0,.3)}`;

// ===== Referencias al DOM y utilidades generales (escape HTML, cookies, debounce, toast) =====
const markdownInput = document.getElementById('markdown-input');
const previewOutput = document.getElementById('preview-output');
const statWords = document.getElementById('stat-words');
const statChars = document.getElementById('stat-chars');
const statLines = document.getElementById('stat-lines');

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHTML = str => (str || '').replace(/[&<>"']/g, m => HTML_ESCAPES[m]);

// --- GESTIÓN DE COOKIES E IDIOMA ---
function setCookie(name, value, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
  }
  return null;
}

function debounce(func, wait = 150) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('translate-y-10', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
  }, 2500);
}

// ===== Internacionalización: idioma actual, traducciones y cambio de idioma (usa TRANSLATIONS de translations.js) =====
let currentLang = getCookie('user_lang') || 'es';

function t(key) {
  return (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[currentLang]?.[key]) || key;
}

function changeLanguage(lang) {
  if (typeof TRANSLATIONS === 'undefined' || !TRANSLATIONS[lang]) return;
  currentLang = lang;
  setCookie('user_lang', lang, 365);
  applyLanguage(lang);
  parseAndRender();
}

function applyLanguage(lang) {
  if (typeof TRANSLATIONS === 'undefined' || !TRANSLATIONS[lang]) return;
  const dict = TRANSLATIONS[lang];

  document.documentElement.lang = lang;

  const langSelect = document.getElementById('lang-select');
  if (langSelect) langSelect.value = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key]) el.setAttribute('title', dict[key]);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.setAttribute('placeholder', dict[key]);
  });
}
