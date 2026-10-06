// app.js

document.addEventListener('DOMContentLoaded', function() {
  applySiteConfig();

  initLanguage();
  let categories = parseListData(getListText(currentLang), getListText('es'));

  const searchInput = document.querySelector('.search-bar input');
  const sidebarUl = document.getElementById('sidebar-categories');
  const busquedaSection = document.getElementById('busqueda');
  const busquedaList = document.getElementById('busqueda-list');
  const busquedaTitle = document.getElementById('busqueda-title');
  const primaryDownloadBtn = document.getElementById('primary-download-btn');
  const secondaryDownloadBtn = document.getElementById('secondary-download-btn');

  setupUIStructure(categories);
  setupConfigPanel();
  applyStaticTexts();

  const goToTab = (tabId) => showTab(tabId, searchInput, primaryDownloadBtn, secondaryDownloadBtn);

  // ---------- Rutas limpias (/juegos-pc, /programas-pc...) ----------
  const BASE = window.SITE_BASE || location.pathname.replace(/[^\/]*$/, '');
  const tabExists = (id) => !!id && !!sidebarUl.querySelector(`.tab-button[data-tab="${id}"]`);

  function getTabFromUrl() {
    let slug = location.pathname.slice(BASE.length).replace(/\/+$/, '');
    try { slug = decodeURIComponent(slug); } catch (e) {}
    return tabExists(slug) ? slug : null;
  }

  function updateUrl(tabId, mode) {
    const target = BASE + tabId;
    if (location.pathname === target) return;
    try {
      history[mode === 'replace' ? 'replaceState' : 'pushState']({ tab: tabId }, '', target);
    } catch (e) { /* p. ej. file:// → se ignora */ }
  }

  // Pestaña actual (para volver a ella al borrar la búsqueda)
  const firstTabButton = sidebarUl.querySelector('.tab-button');
  let currentTabId = firstTabButton ? firstTabButton.getAttribute('data-tab') : null;

  // Pestaña inicial: la de la URL, si no la última visitada
  const savedTab = loadPref('last_tab');
  const startTab = getTabFromUrl() || (tabExists(savedTab) ? savedTab : null);
  if (startTab) {
    currentTabId = startTab;
    goToTab(startTab);
    updateUrl(startTab, 'replace');
  }

  // Cambio de idioma (reconstruye la lista y conserva pestaña y búsqueda)
  function setLanguage(lang) {
    currentLang = lang;
    savePref('lang', lang);
    categories = parseListData(getListText(lang), getListText('es'));
    renderCategories(categories);
    applyStaticTexts();
    renderSettingsPanel();
    if (searchInput.value.trim()) runSearch();
    else if (currentTabId) goToTab(currentTabId);
  }
  setupLanguageMenu(setLanguage);

  // Cambio de pestañas
  sidebarUl.addEventListener('click', function(e) {
    const btn = e.target.closest('.tab-button');
    if (btn && sidebarUl.contains(btn)) {
      currentTabId = btn.getAttribute('data-tab');
      searchInput.value = "";
      goToTab(currentTabId);
      updateUrl(currentTabId, 'push');
    }
  });

  // Botones Atrás / Adelante del navegador
  window.addEventListener('popstate', function() {
    const tabId = getTabFromUrl() || (firstTabButton && firstTabButton.getAttribute('data-tab'));
    if (!tabId) return;
    currentTabId = tabId;
    searchInput.value = "";
    goToTab(tabId);
  });

  // Búsqueda: sin tildes, ignora mayúsculas y exige que coincidan todas las palabras
  function runSearch() {
    const tokens = searchableText(searchInput.value.trim()).split(/\s+/).filter(Boolean);

    if (!tokens.length) {
      // Solo volver a la pestaña anterior si veníamos de una búsqueda
      if (busquedaSection.classList.contains('active') && currentTabId) goToTab(currentTabId);
      return;
    }

    const matchingItems = [];
    categories.forEach(cat => {
      cat.items.forEach(item => {
        if (tokens.every(t => item.searchText.includes(t))) {
          matchingItems.push(item);
        }
      });
    });

    displaySearchResults(matchingItems, busquedaList);
    busquedaTitle.textContent = `${t('results')} (${matchingItems.length})`;
    const typed = searchInput.value;
    goToTab('busqueda');
    searchInput.value = typed; // showTab no borra en 'busqueda', pero por seguridad
  }

  searchInput.addEventListener('input', debounce(runSearch, 100));
  searchInput.addEventListener('input', syncSearchClear);

  // Botón de borrar propio (funciona en todos los navegadores)
  document.getElementById('search-clear').addEventListener('click', function() {
    searchInput.value = "";
    syncSearchClear();
    runSearch();
    searchInput.focus();
  });

  // Atajos: "/" enfoca la búsqueda, Escape la limpia
  document.addEventListener('keydown', function(e) {
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && this.value) {
      e.preventDefault();
      this.value = "";
      syncSearchClear();
      runSearch();
    }
  });

  // Scroll horizontal en nav para móviles
  const navUl = document.querySelector('nav ul');
  if (navUl) {
    navUl.addEventListener('wheel', function(e) {
      if (window.innerWidth <= 768 && navUl.scrollWidth > navUl.clientWidth) {
        e.preventDefault();
        navUl.scrollBy({ left: e.deltaY * 3, behavior: 'smooth' });
      }
    }, { passive: false });
  }

  // Fade out del overlay de carga
  window.addEventListener('load', function() {
    const bgOverlay = document.getElementById('bg-overlay');
    if (bgOverlay) {
      bgOverlay.style.opacity = '0';
      setTimeout(() => bgOverlay.remove(), 1000);
    }
  });
});


// Analiza el idioma actual; id de pestaña e imágenes salen siempre del texto en español
// (así las URLs y los nombres de archivo no cambian), y la búsqueda funciona en ambos idiomas.
function parseListData(rawText, esText) {
  const cats = parseCategories(rawText);
  const es = !esText || esText === rawText ? cats : parseCategories(esText);
  cats.forEach((cat, i) => {
    const ref = es[i] || cat;
    cat.id = slugify(ref.name);
    cat.items.forEach((item, j) => {
      const r = ref.items[j] || item;
      item.imgCategory = ref.name;
      item.imgName = r.displayName;
      if (r !== item) item.searchText += ' ' + r.searchText;
    });
  });
  return cats;
}

function parseCategories(rawText) {
  const categories = [];
  let currentCategory = null;

  rawText.split('\n').forEach(rawLine => {
    const line = rawLine.trim();
    if (!line) return;

    // Los elementos se comprueban primero para que un nombre terminado en ":" no se tome por categoría
    if (line.startsWith('-')) {
      if (!currentCategory) return;

      const content = line.substring(1).trim();
      const linkMatches = content.match(/"([^"]*)"/g) || [];
      const link = linkMatches[0] ? linkMatches[0].replace(/"/g, '') : "";
      const link2 = linkMatches[1] ? linkMatches[1].replace(/"/g, '') : "";

      let tempContent = content.replace(/"([^"]*)"/g, '').trim();
      const starMatches = tempContent.match(/\*([^*]+)\*/g) || [];
      const buttonText = starMatches[0] ? starMatches[0].replace(/\*/g, '') : "";
      const buttonText2 = starMatches[1] ? starMatches[1].replace(/\*/g, '') : "";

      tempContent = tempContent.replace(/\*([^*]+)\*/g, '').trim();

      let name = tempContent;
      let itemExtra = '';
      const itemExtraMatch = name.match(/=([^=]+)=/);
      if (itemExtraMatch) {
        itemExtra = itemExtraMatch[1].trim();
        name = name.replace(/=([^=]+)=/, '').trim();
      }
      const displayName = name.replace(/\s{2,}/g, ' ');

      currentCategory.items.push({
        name: tempContent,
        displayName,
        itemExtra,
        link,
        link2,
        buttonText,
        buttonText2,
        categoryExtra: currentCategory.extra,
        category: currentCategory.name,
        // Texto indexado para búsqueda (nombre, extras, categoría y plataforma)
        searchText: searchableText(`${displayName} ${itemExtra} ${currentCategory.name} ${currentCategory.extra}`)
      });
    } else if (line.endsWith(':')) {
      let catName = line.slice(0, -1).trim();
      let categoryExtra = '';
      const extraMatch = catName.match(/=([^=]+)=/);
      if (extraMatch) {
        categoryExtra = extraMatch[1].trim();
        catName = catName.replace(/=([^=]+)=/g, '').trim();
      }
      currentCategory = { name: catName, extra: categoryExtra, items: [] };
      categories.push(currentCategory);
    }
  });
  return categories;
}
