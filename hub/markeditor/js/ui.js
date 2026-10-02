// Interfaz y editor: tema, pestañas, modal, plantillas, barra de formato y scroll

// ===== Interfaz: tema oscuro/claro, pestañas móviles, modal de ayuda y menú de plantillas =====
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  updateThemeIcon();
}

function updateThemeIcon() {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.className = document.documentElement.classList.contains('dark')
      ? 'fa-solid fa-sun text-yellow-400'
      : 'fa-solid fa-moon text-gray-600';
  }
}

function switchMobileTab(tab) {
  const paneEditor = document.getElementById('pane-editor');
  const panePreview = document.getElementById('pane-preview');
  const tabEdit = document.getElementById('tab-edit');
  const tabPreview = document.getElementById('tab-preview');
  const isEdit = tab === 'edit';

  if (paneEditor) paneEditor.classList.toggle('hidden', !isEdit);
  if (panePreview) {
    panePreview.classList.toggle('hidden', isEdit);
    panePreview.classList.toggle('flex', !isEdit);
  }

  const baseBtnClass = 'flex-1 py-1.5 text-xs font-semibold rounded text-center ';
  const activeClass = baseBtnClass + 'bg-white dark:bg-gray-700 shadow-sm';
  const inactiveClass = baseBtnClass + 'text-gray-600 dark:text-gray-400 hover:text-gray-900 text-center';

  if (tabEdit) tabEdit.className = isEdit ? activeClass : inactiveClass;
  if (tabPreview) tabPreview.className = isEdit ? inactiveClass : activeClass;
}

function toggleHelpModal(show) {
  const modal = document.getElementById('help-modal');
  if (modal) modal.classList.toggle('hidden', !show);
}

document.addEventListener('click', function(event) {
  const container = document.getElementById('templates-dropdown-container');
  const menu = document.getElementById('templates-menu');
  if (menu && !menu.classList.contains('hidden') && container && !container.contains(event.target)) {
    menu.classList.add('hidden');
  }
});

function toggleTemplatesDropdown(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('templates-menu');
  if (menu) menu.classList.toggle('hidden');
}

// ===== Acciones del editor: formato desde la barra, limpiar y cargar plantillas =====
function insertFormat(startTag, endTag = '', defaultText = '') {
  if (!markdownInput) return;
  const { selectionStart: start, selectionEnd: end, value: text } = markdownInput;
  const selectedText = text.substring(start, end);
  const content = selectedText.length > 0 ? selectedText : defaultText;
  const replacement = `${startTag}${content}${endTag}`;

  markdownInput.value = text.substring(0, start) + replacement + text.substring(end);
  markdownInput.focus();
  
  const cursorStart = start + startTag.length;
  markdownInput.setSelectionRange(cursorStart, cursorStart + content.length);
  parseAndRender();
}

// ===== Barra de herramientas del editor (se genera a partir de estos datos) =====
// start / end: texto que envuelve la selección · placeholder: texto por defecto si no hay selección
// label + color: botón con texto (variantes de color definidas en styles.css como .tb-<color>)
const TOOLBAR_ITEMS = [
  { i18n: 'tool_bold', title: 'Negrita', icon: 'fa-bold', start: '**', end: '**', placeholder: 'texto en negrita' },
  { i18n: 'tool_italic', title: 'Cursiva', icon: 'fa-italic', start: '*', end: '*', placeholder: 'texto en cursiva' },
  { i18n: 'tool_strikethrough', title: 'Tachado', icon: 'fa-strikethrough', start: '~~', end: '~~', placeholder: 'texto tachado' },
  { i18n: 'tool_highlight', title: 'Resaltador', icon: 'fa-highlighter', start: '==', end: '==', placeholder: 'texto resaltado' },
  'sep',
  { i18n: 'tool_heading', title: 'Encabezado H3', icon: 'fa-heading', start: '### ', end: '', placeholder: 'Título' },
  { i18n: 'tool_color', title: 'Texto con Color (%red%...%%)', icon: 'fa-palette', iconClass: 'text-red-500', start: '%red%', end: '%%', placeholder: 'texto con color' },
  { i18n: 'tool_underline', title: 'Subrayado (!~...~!)', icon: 'fa-underline', start: '!~red;', end: '~!', placeholder: 'texto subrayado' },
  { i18n: 'tool_spoiler', title: 'Spoiler oculto (!>)', icon: 'fa-eye-slash', start: '!> ', end: '', placeholder: 'Texto secreto oculto' },
  'sep',
  { i18n: 'btn_download_tool', title: 'Insertar Botón de Descargar', icon: 'fa-download', label: 'Descarga', color: 'blue', start: '[download: ', end: ' | https://ejemplo.com | Subtexto u opciones | primary]', placeholder: '🚀 Botón de Descarga' },
  { i18n: 'btn_badge_tool', title: 'Insertar Badge/Etiqueta', icon: 'fa-tag', label: 'Badge', color: 'indigo', start: '[badge: ', end: ']', placeholder: 'Etiqueta' },
  { i18n: 'btn_stars_tool', title: 'Insertar Puntuación / Estrellas', icon: 'fa-star', label: 'Estrellas', color: 'amber', start: '[rating: ', end: ']', placeholder: '4.8' },
  { i18n: 'btn_gallery_tool', title: 'Insertar Galería de Imágenes', icon: 'fa-images', label: 'Galería', color: 'emerald', start: ':::gallery\n![Imagen 1](https://placehold.co/400x225)\n![Imagen 2](https://placehold.co/400x225)\n:::\n', end: '', placeholder: '' },
  { i18n: 'btn_specs_tool', title: 'Insertar Bloque de Ficha Técnica', icon: 'fa-clipboard-list', label: 'Ficha Técnica', color: 'teal', start: '!!! info 📌 Ficha Técnica\n    - **Nombre:** \n    - **Versión:** \n', end: '', placeholder: '' },
  'sep',
  { i18n: 'tool_link', title: 'Enlace', icon: 'fa-link', start: '[', end: '](https://ejemplo.com)', placeholder: 'texto del enlace' },
  { i18n: 'tool_image', title: 'Imagen con Tamaño', icon: 'fa-image', start: '![Alt](', end: '){250px:100px}', placeholder: 'https://placehold.co/400x200' },
  { i18n: 'tool_code_inline', title: 'Código Inline', icon: 'fa-code', start: '`', end: '`', placeholder: 'código' },
  { i18n: 'tool_code_block', title: 'Bloque de Código', icon: 'fa-file-code', start: '```javascript\n', end: '\n```', placeholder: '// código aquí' },
  { i18n: 'tool_list_ul', title: 'Lista con Viñetas', icon: 'fa-list-ul', start: '- ', end: '', placeholder: 'Elemento de lista' },
  { i18n: 'tool_task', title: 'Casilla de Verificación', icon: 'fa-square-check', start: '- [ ] ', end: '', placeholder: 'Tarea pendiente' },
  { i18n: 'tool_quote', title: 'Cita', icon: 'fa-quote-right', start: '> ', end: '', placeholder: 'Texto de cita' },
  { i18n: 'tool_callout', title: 'Nota / Callout', icon: 'fa-circle-exclamation', start: '!!! note Título\n    ', end: '', placeholder: 'Contenido de la nota' },
];

function renderToolbar() {
  const bar = document.getElementById('editor-toolbar');
  if (!bar) return;
  bar.textContent = '';

  TOOLBAR_ITEMS.forEach(item => {
    if (item === 'sep') {
      const sep = document.createElement('div');
      sep.className = 'tool-sep';
      bar.appendChild(sep);
      return;
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = item.color ? `tool-btn-label tb-${item.color}` : 'tool-btn';
    btn.title = item.title;
    btn.setAttribute('data-i18n-title', item.i18n);

    const icon = document.createElement('i');
    icon.className = ['fa-solid', item.icon, item.iconClass].filter(Boolean).join(' ');
    btn.appendChild(icon);

    if (item.label) {
      const span = document.createElement('span');
      span.setAttribute('data-i18n', item.i18n);
      span.textContent = item.label;
      btn.append(' ', span);
    }

    btn.addEventListener('click', () => insertFormat(item.start, item.end, item.placeholder));
    bar.appendChild(btn);
  });
}

renderToolbar();

function loadGameTemplate() {
  const menu = document.getElementById('templates-menu');
  if (menu) menu.classList.add('hidden');

  if (confirm(t('confirm_game_template'))) {
    markdownInput.value = GAME_TEMPLATE;
    parseAndRender();
    showToast(t('toast_game_loaded'));
  }
}

function loadSampleMarkdown() {
  const menu = document.getElementById('templates-menu');
  if (menu) menu.classList.add('hidden');

  if (confirm(t('confirm_sample_template'))) {
    markdownInput.value = DEFAULT_MARKDOWN;
    parseAndRender();
    showToast(t('toast_sample_loaded'));
  }
}

function clearEditor() {
  if (confirm(t('confirm_clear'))) {
    markdownInput.value = '';
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    parseAndRender();
    showToast(t('toast_cleared'));
  }
}

// ===== Barra de herramientas del editor: scroll horizontal con la rueda del mouse =====
// Barra de herramientas del editor: la rueda del mouse desplaza horizontalmente (con suavizado)
(function () {
  const toolbar = document.querySelector("#pane-editor .overflow-x-auto");
  if (!toolbar) return;
  let target = 0, raf = null;

  function step() {
    const diff = target - toolbar.scrollLeft;
    if (Math.abs(diff) < 1) {
      toolbar.scrollLeft = target;
      raf = null;
      return;
    }
    const move = diff * 0.18;
    toolbar.scrollLeft += Math.abs(move) < 1 ? Math.sign(diff) : move;
    raf = requestAnimationFrame(step);
  }

  toolbar.addEventListener("wheel", function (e) {
    const max = toolbar.scrollWidth - toolbar.clientWidth;
    if (e.deltaX !== 0 || max <= 0) return;
    e.preventDefault();
    if (raf === null) target = toolbar.scrollLeft;
    const delta = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
    target = Math.max(0, Math.min(max, target + delta));
    if (raf === null) raf = requestAnimationFrame(step);
  }, { passive: false });
})();
