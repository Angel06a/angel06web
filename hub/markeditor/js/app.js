// Aplicación: importar/exportar e inicialización (debe cargarse al final)

// ===== Importar / exportar: importar .md/.html, copiar HTML renderizado y descargar Markdown =====
function triggerImport() {
  const fileInput = document.getElementById('file-import-input');
  if (fileInput) fileInput.click();
}

function handleFileImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (markdownInput.value.trim() && !confirm(t('confirm_import'))) {
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const rawMarkdownScript = doc.getElementById('mark-raw-markdown');

      if (rawMarkdownScript) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = rawMarkdownScript.innerHTML;
        markdownInput.value = textarea.value;
        showToast(t('toast_html_imported'));
      } else {
        const rendered = doc.querySelector('.mark-rendered') || doc.body;
        markdownInput.value = rendered ? (rendered.innerText || rendered.textContent || content) : content;
        showToast(t('toast_html_text_imported'));
      }
    } else {
      markdownInput.value = content;
      showToast(t('toast_md_imported'));
    }

    parseAndRender();
  };

  reader.onerror = () => showToast(t('toast_file_error'));
  reader.readAsText(file);
  event.target.value = '';
}

async function copyRenderedHTML() {
  const isDark = document.documentElement.classList.contains('dark');
  const safeRawMarkdown = escapeHTML(markdownInput.value).replace(/<\/script/gi, '<\\/script');
  
  const fullHTML = `<!DOCTYPE html>
<html lang="${currentLang}" class="${isDark ? 'dark' : ''}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(t('export_page_title'))}</title>
  <link rel="icon" type="image/png" href="icon.png">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            mark: {
              bg: '#181a1b',
              card: '#222426',
              border: '#383c3e',
              text: '#e8e6e3',
              accent: '#458588',
              hover: '#326264'
            }
          }
        }
      }
    }
  <\/script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>${EMBEDDED_EXPORT_CSS}</style>
</head>
<body class="bg-gray-100 text-gray-900 dark:bg-mark-bg dark:text-mark-text p-4 sm:p-8 md:p-10 min-h-screen transition-colors duration-200 max-w-full overflow-x-hidden">
  <script type="text/template" id="mark-raw-markdown">${safeRawMarkdown}</script>
  <div class="fixed top-3 right-3 sm:top-4 sm:right-4 z-50">
    <button onclick="toggleExportDarkMode()" title="${escapeHTML(t('export_theme_title'))}" class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-mark-card border border-gray-200 dark:border-mark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md transition flex items-center justify-center">
      <i id="export-theme-icon" class="fa-solid ${isDark ? 'fa-sun text-yellow-400' : 'fa-moon text-gray-600'}"></i>
    </button>
  </div>
  <div class="max-w-4xl mx-auto mark-rendered w-full box-border">
${previewOutput.innerHTML}
  </div>
  <script>
    function toggleExportDarkMode() {
      document.documentElement.classList.toggle('dark');
      const icon = document.getElementById('export-theme-icon');
      if (icon) {
        icon.className = document.documentElement.classList.contains('dark') ? 'fa-solid fa-sun text-yellow-400' : 'fa-solid fa-moon text-gray-600';
      }
    }
    document.addEventListener('click', function (e) {
      var spoiler = e.target.closest && e.target.closest('.mark-spoiler');
      if (spoiler) spoiler.classList.toggle('revealed');
    });
    document.addEventListener('error', function (e) {
      var img = e.target;
      if (!img || img.tagName !== 'IMG' || img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = '1';
      img.src = 'https://placehold.co/300x150?text=Image+Not+Found';
    }, true);
  <\/script>
</body>
</html>`;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(fullHTML);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = fullHTML;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    showToast(t('toast_copied'));
  } catch (err) {
    showToast(t('toast_copy_error'));
  }
}

function downloadMarkdown() {
  if (!markdownInput) return;
  const blob = new Blob([markdownInput.value], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'documento.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t('toast_downloaded'));
}

// ===== Punto de entrada: inicialización de la app y listeners globales =====
window.onload = function () {
  applyLanguage(currentLang);

  try {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    markdownInput.value = savedContent !== null ? savedContent : DEFAULT_MARKDOWN;
  } catch (e) {
    markdownInput.value = DEFAULT_MARKDOWN;
  }
  parseAndRender();
  
  updateThemeIcon();
};

if (markdownInput) {
  markdownInput.addEventListener('input', debounce(parseAndRender, 150));
}

// Los spoilers y el respaldo de imágenes rotas se manejan por delegación (el HTML sanitizado no lleva onclick/onerror)
if (previewOutput) {
  previewOutput.addEventListener('click', e => {
    const spoiler = e.target.closest && e.target.closest('.mark-spoiler');
    if (spoiler) spoiler.classList.toggle('revealed');
  });
  previewOutput.addEventListener('error', e => {
    const img = e.target;
    if (!img || img.tagName !== 'IMG' || img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = '1';
    img.src = IMAGE_FALLBACK_URL;
  }, true);
}
