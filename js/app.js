// app.js

function initApp() {
  applySiteConfig();

  initLanguage();
  let categories = getCategories(currentLang);
  let allItems = categories.flatMap(c => c.items);

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

  // Última búsqueda pintada: evita repintar (y deseleccionar) si la consulta no ha cambiado
  let lastSearchKey = null;

  const goToTab = (tabId) => {
    if (tabId !== 'busqueda') lastSearchKey = null;
    showTab(tabId, searchInput, primaryDownloadBtn, secondaryDownloadBtn);
  };

  // ---------- Rutas limpias (/juegos-pc, /pc-games...) ----------
  const BASE = window.SITE_BASE || location.pathname.replace(/[^\/]*$/, '');
  const tabExists = (id) => !!id && !!sidebarUl.querySelector(`.tab-button[data-tab="${id}"]`);

  // slug (de cualquier idioma) → id interna. Así /juegos-pc y /pc-games abren la misma pestaña.
  // Se crea solo cuando hace falta: el otro idioma no se analiza hasta que se necesita.
  let slugMap = null;
  function getSlugMap() {
    if (!slugMap) {
      slugMap = {};
      SITE_CONFIG.languages.forEach(l => {
        getCategories(l.code).forEach(c => { slugMap[c.slug] = c.id; });
      });
    }
    return slugMap;
  }

  // id interna → slug en el idioma actual
  function slugForTab(id) {
    const c = categories.find(c => c.id === id);
    return c ? c.slug : id;
  }

  function getTabFromUrl() {
    let slug = location.pathname.slice(BASE.length).replace(/\/+$/, '');
    if (!slug) return null;
    try { slug = decodeURIComponent(slug); } catch (e) {}
    const id = getSlugMap()[slug];
    return tabExists(id) ? id : null;
  }

  function updateUrl(tabId, mode) {
    const target = BASE + slugForTab(tabId);
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
  } else if (currentTabId) {
    ensureCategoryRendered(currentTabId); // la primera pestaña ya está activa en el HTML
  }

  // Cambio de idioma (reconstruye la lista y conserva pestaña y búsqueda)
  function setLanguage(lang) {
    currentLang = lang;
    savePref('lang', lang);
    categories = getCategories(lang);
    allItems = categories.flatMap(c => c.items);
    lastSearchKey = null; // hay que repintar los resultados en el nuevo idioma
    renderCategories(categories);
    applyStaticTexts();
    renderSettingsPanel();
    if (searchInput.value.trim()) runSearch();
    else if (currentTabId) {
      goToTab(currentTabId);
      updateUrl(currentTabId, 'replace');   // actualiza la URL al slug del nuevo idioma
    }
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

    // Misma consulta que la ya mostrada (p. ej. al teclear un espacio): no hay nada que repintar
    const key = tokens.join(' ');
    if (key === lastSearchKey && busquedaSection.classList.contains('active')) return;

    const matchingItems = allItems.filter(item => tokens.every(tok => item.searchText.includes(tok)));

    displaySearchResults(matchingItems, busquedaList);
    busquedaTitle.textContent = `${t('results')} (${matchingItems.length})`;
    const typed = searchInput.value;
    goToTab('busqueda');
    searchInput.value = typed; // showTab no borra en 'busqueda', pero por seguridad
    lastSearchKey = key;       // después de goToTab, que lo reinicia
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
}

// ---------- Lista de categorías (con caché por idioma) ----------
// Cada idioma se analiza una sola vez, y solo cuando hace falta (el otro idioma
// no se procesa hasta que se cambia de idioma o se abre una URL con su slug).
const categoryCache = {};
function getCategories(lang) {
  if (!categoryCache[lang]) {
    const raw = getListText(lang);
    const refCats = (lang === 'es' || raw === getListText('es')) ? null : getCategories('es');
    categoryCache[lang] = parseListData(raw, refCats);
  }
  return categoryCache[lang];
}

// Analiza el idioma indicado; id de pestaña e imágenes salen siempre del texto en español
// (así los nombres de archivo y el estado interno no cambian), y la búsqueda funciona en ambos idiomas.
// El slug de la URL, en cambio, sale del nombre en el idioma actual.
// refCats: categorías ya analizadas en español (null si este mismo texto es el español).
function parseListData(rawText, refCats) {
  const cats = parseCategories(rawText);
  const es = refCats || cats;
  cats.forEach((cat, i) => {
    const ref = es[i] || cat;
    cat.id = slugify(ref.name);     // interno, siempre en español
    cat.slug = slugify(cat.name);   // para la URL, en el idioma actual
    // Cada idioma puede tener su propio orden: los elementos se emparejan por sus enlaces
    // (iguales en ambos idiomas); con enlaces repetidos se usa el orden de aparición.
    const key = it => it.link + '|' + it.link2;
    const pool = {};
    ref.items.forEach((r, k) => (pool[key(r)] ||= []).push(k));
    cat.items.forEach((item, j) => {
      const q = pool[key(item)];
      const k = q && q.length ? q.shift() : j;   // sin coincidencia: por posición
      const r = ref.items[k] || item;
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


// Arranque (al final del archivo para que todo lo anterior ya esté definido).
// Los scripts se cargan con "defer": el DOM ya está listo cuando se ejecutan.
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
