// ui.js

let selectedDownloadLink1 = "";
let selectedDownloadLink2 = "";

function openLink(url) {
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}

function isGridEnabled() {
  return getSetting('grid_view');
}

function applyGridView(enabled) {
  document.querySelectorAll('.list-container ul').forEach(ul => {
    ul.classList.toggle('grid', enabled);
  });
}

// Actualiza botones de descarga (data = null → estado inicial)
function setDownloadState(primaryBtn, secondaryBtn, data) {
  const d = data || {};
  const primaryWasOff = primaryBtn.disabled; // ¿el botón 1 venía apagado (nada seleccionado)?
  selectedDownloadLink1 = d.link1 || "";
  selectedDownloadLink2 = d.link2 || "";

  primaryBtn.textContent = d.text1 || t('download');
  primaryBtn.disabled = !selectedDownloadLink1;

  if (selectedDownloadLink2) {
    const wasHidden = secondaryBtn.style.display === "none";
    secondaryBtn.textContent = d.text2 || t('download');
    if (wasHidden && primaryWasOff) {
      // Solo si el botón 1 también se está encendiendo ahora: ambos animan juntos
      secondaryBtn.disabled = true;
      secondaryBtn.style.display = "inline-flex";
      void secondaryBtn.offsetWidth; // fuerza el reflow para que la transición se ejecute
    } else {
      // El botón 1 ya estaba encendido: el 2 aparece encendido, sin animación
      secondaryBtn.style.display = "inline-flex";
    }
    secondaryBtn.disabled = false;
  } else {
    secondaryBtn.style.display = "none";
    secondaryBtn.textContent = t('download');
  }
}

function setupUIStructure(categoriesData) {
  const sidebarUl = document.getElementById('sidebar-categories');
  const mainContent = document.getElementById('main-content');
  const primaryDownloadBtn = document.getElementById('primary-download-btn');
  const secondaryDownloadBtn = document.getElementById('secondary-download-btn');

  loadSettingsState(); // antes de crear listas (p. ej. para saber si va en grid)

  primaryDownloadBtn.addEventListener('click', () => openLink(selectedDownloadLink1));
  secondaryDownloadBtn.addEventListener('click', () => openLink(selectedDownloadLink2));

  attachProjectItemDelegation(mainContent, primaryDownloadBtn, secondaryDownloadBtn);

  renderCategories(categoriesData);

  renderSettingsPanel(); // genera interruptores y aplica los valores guardados

  initLazyLoading();
}

function processItemClick(button, primaryBtn, secondaryBtn) {
  document.querySelectorAll('.project-item.selected').forEach(b => b.classList.remove('selected'));
  button.classList.add('selected');
  setDownloadState(primaryBtn, secondaryBtn, {
    link1: button.getAttribute('data-link1'),
    link2: button.getAttribute('data-link2'),
    text1: button.getAttribute('data-button-text1'),
    text2: button.getAttribute('data-button-text2')
  });
  document.dispatchEvent(new CustomEvent('itemselect', {
    detail: { link1: selectedDownloadLink1, link2: selectedDownloadLink2, element: button }
  }));
}

function attachProjectItemDelegation(containerElement, primaryBtn, secondaryBtn) {
  containerElement.addEventListener('click', function(e) {
    const btn = e.target.closest('.project-item');
    if (btn && containerElement.contains(btn)) {
      processItemClick(btn, primaryBtn, secondaryBtn);
    }
  });
}

// Crea un <li> con el botón de un elemento (reutilizado por categorías y búsqueda)
function createItemElement(item, categoryName, labelText) {
  const liItem = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('project-item');
  const plainLabel = plainText(labelText);
  button.title = plainLabel; // tooltip: útil en vista grid, donde se oculta el texto

  const iconImg = document.createElement('img');
  iconImg.classList.add('item-icon');
  iconImg.alt = '';
  iconImg.setAttribute('draggable', 'false');
  button.appendChild(iconImg);
  loadImageAsync(getItemImagePath(item.imgCategory || categoryName, item.imgName || item.displayName), iconImg);

  const textSpan = document.createElement('span');
  textSpan.classList.add('item-text');
  textSpan.innerHTML = convertEmoji(labelText);
  button.appendChild(textSpan);

  button.setAttribute('data-link1', item.link || "");
  button.setAttribute('data-link2', item.link2 || "");
  if (item.buttonText) button.setAttribute('data-button-text1', item.buttonText);
  if (item.buttonText2) button.setAttribute('data-button-text2', item.buttonText2);

  liItem.appendChild(button);
  return liItem;
}

function createCategoryTabAndContent(cat, index, sidebarUl, mainContent) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('tab-button');
  btn.innerHTML = convertEmoji(cat.name);
  const categoryId = cat.id || slugify(cat.name);
  btn.setAttribute('data-tab', categoryId);
  if (index === 0) btn.classList.add('active');
  li.appendChild(btn);
  sidebarUl.appendChild(li);

  const section = document.createElement('section');
  section.id = categoryId;
  section.classList.add('tab-content');
  if (index === 0) section.classList.add('active');

  const h2 = document.createElement('h2');
  h2.innerHTML = convertEmoji(cat.name);
  section.appendChild(h2);

  const projectListDiv = document.createElement('div');
  projectListDiv.classList.add('project-list');

  const listContainer = document.createElement('div');
  listContainer.classList.add('list-container');

  const ul = document.createElement('ul');
  const fragment = document.createDocumentFragment();
  cat.items.forEach(item => {
    fragment.appendChild(createItemElement(item, cat.name, item.displayName));
  });
  ul.appendChild(fragment);
  if (isGridEnabled()) ul.classList.add('grid');

  listContainer.appendChild(ul);
  projectListDiv.appendChild(listContainer);
  section.appendChild(projectListDiv);
  (document.getElementById('tabs-container') || mainContent).appendChild(section);
}

function showTab(tabId, searchInput, primaryBtn, secondaryBtn) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  document.querySelectorAll('.project-item.selected').forEach(item => item.classList.remove('selected'));

  setDownloadState(primaryBtn, secondaryBtn, null);

  const section = document.getElementById(tabId);
  if (section) {
    section.classList.add('active');
    const lc = section.querySelector('.list-container');
    if (lc) lc.scrollTop = 0;
  }

  const tabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
  if (tabButton) tabButton.classList.add('active');

  if (tabId !== 'busqueda') {
    searchInput.value = "";
    savePref('last_tab', tabId); // recordar última pestaña
  }
  syncSearchClear();
  document.dispatchEvent(new CustomEvent('tabchange', { detail: { tabId } }));
}

function displaySearchResults(items, busquedaListElement) {
  const fragment = document.createDocumentFragment();
  busquedaListElement.innerHTML = '';

  if (items.length === 0) {
    const noResultsLi = document.createElement('li');
    noResultsLi.classList.add('no-results');
    noResultsLi.textContent = t('noResults');
    fragment.appendChild(noResultsLi);
  } else {
    items.forEach(item => {
      let label = item.displayName;
      if (item.itemExtra) label += ` ${item.itemExtra}`;
      if (item.categoryExtra && !label.toLowerCase().includes(item.categoryExtra.toLowerCase())) {
        label += ` ${item.categoryExtra}`;
      }
      fragment.appendChild(createItemElement(item, item.category, label));
    });
  }

  busquedaListElement.appendChild(fragment);
  busquedaListElement.classList.toggle('grid', isGridEnabled());
  initLazyLoading();
}

function setupConfigPanel() {
  const configBtn = document.getElementById('config-btn');
  const configPanel = document.getElementById('config-panel');
  const configCloseBtn = document.getElementById('config-close-btn');
  let closeTimer = null;

  const handleKeyDown = (e) => {
    if (!configPanel.classList.contains('visible')) return;

    if (e.key === 'Escape') {
      closePanel();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = configPanel.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const openPanel = () => {
    clearTimeout(closeTimer); // evita que un cierre pendiente oculte el panel recién abierto
    if (configPanel.classList.contains('visible')) return;
    configPanel.style.display = 'block';
    setTimeout(() => {
      configPanel.classList.add('visible');
      configCloseBtn.focus();
    }, 10);
    document.addEventListener('keydown', handleKeyDown);
  };

  const closePanel = () => {
    if (!configPanel.classList.contains('visible')) return;
    configPanel.classList.remove('visible');
    document.removeEventListener('keydown', handleKeyDown);
    closeTimer = setTimeout(() => {
      configPanel.style.display = 'none';
    }, 300);
    configBtn.focus();
  };

  configBtn.addEventListener('click', openPanel);
  configCloseBtn.addEventListener('click', closePanel);

  document.addEventListener('click', (e) => {
    if (configPanel.classList.contains('visible') && !configPanel.contains(e.target) && !configBtn.contains(e.target)) {
      closePanel();
    }
  });

}


// ---------- Botón de borrar de la barra de búsqueda ----------
function syncSearchClear() {
  const input = document.querySelector('.search-bar input');
  const btn = document.getElementById('search-clear');
  if (input && btn) btn.hidden = !input.value;
}

// ---------- Ajustes (interruptores generados desde SITE_CONFIG.settings) ----------
const settingsState = {};

function loadSettingsState() {
  (SITE_CONFIG.settings || []).forEach(s => {
    const v = loadPref(s.key);
    settingsState[s.key] = v === 'true' ? true : v === 'false' ? false : !!s.default;
  });
}

function getSetting(key) {
  return !!settingsState[key];
}

function setSetting(key, value) {
  settingsState[key] = !!value;
  savePref(key, String(!!value));
  const def = (SITE_CONFIG.settings || []).find(s => s.key === key);
  if (def && def.apply) def.apply(!!value);
}

function renderSettingsPanel() {
  const container = document.getElementById('config-options');
  if (!container) return;
  container.innerHTML = '';
  (SITE_CONFIG.settings || []).forEach(s => {
    const label = document.createElement('label');
    label.className = 'switch-label';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = getSetting(s.key);
    input.addEventListener('change', () => setSetting(s.key, input.checked));
    const slider = document.createElement('span');
    slider.className = 'switch-slider';
    label.append(document.createTextNode(tr(s.label)), input, slider);
    container.appendChild(label);
    if (s.apply) s.apply(getSetting(s.key));
  });
}

// ---------- Widgets / slots ----------
// content: string HTML (de confianza) o Node. Devuelve el elemento insertado.
function addWidget(slotName, content, className = 'widget') {
  const slot = document.querySelector(`[data-slot="${slotName}"]`);
  if (!slot) { console.warn(`addWidget: no existe el slot "${slotName}"`); return null; }
  let el;
  if (content instanceof Node) {
    el = content;
  } else {
    el = document.createElement('div');
    el.className = className;
    el.innerHTML = content;
  }
  slot.appendChild(el);
  return el;
}

// Aplica SITE_CONFIG: título, enlaces de cabecera, pie y widgets
function applySiteConfig() {
  const titleEl = document.getElementById('header-title');
  if (titleEl) titleEl.innerHTML = convertEmoji(SITE_CONFIG.title);

  const footerEl = document.getElementById('footer-text');
  if (footerEl) footerEl.textContent = SITE_CONFIG.footer || '';

  const actions = document.querySelector('[data-slot="header-actions"]');
  (SITE_CONFIG.headerLinks || []).forEach(l => {
    const a = document.createElement('a');
    a.href = l.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', l.label || '');
    const img = document.createElement('img');
    img.src = l.icon;
    img.alt = l.label || '';
    img.className = 'header-icon';
    a.appendChild(img);
    if (actions) actions.appendChild(a);
  });

  (SITE_CONFIG.widgets || []).forEach(w => addWidget(w.slot, w.node || w.html || '', w.className));
}

// ---------- Idioma: reconstruir categorías y textos fijos ----------
function renderCategories(categoriesData) {
  const sidebarUl = document.getElementById('sidebar-categories');
  const mainContent = document.getElementById('main-content');
  sidebarUl.innerHTML = '';
  document.querySelectorAll('#tabs-container > section.tab-content:not(#busqueda)').forEach(sec => sec.remove());
  categoriesData.forEach((cat, index) => createCategoryTabAndContent(cat, index, sidebarUl, mainContent));
  initLazyLoading();
}

function applyStaticTexts() {
  document.documentElement.lang = currentLang;
  const set = (sel, attrs, text) => {
    const el = document.querySelector(sel);
    if (!el) return;
    if (text !== undefined) el.textContent = text;
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
  };
  set('.search-bar input', { placeholder: t('search'), 'aria-label': t('search') });
  set('#search-clear', { title: t('clear'), 'aria-label': t('clear') });
  set('nav', { 'aria-label': t('categories') });
  set('#config-btn', { title: t('config'), 'aria-label': t('config') });
  set('#config-title', {}, t('config'));
  set('#config-close-btn', { title: t('close'), 'aria-label': t('close') });
  updateLanguageMenu();
  const bt = document.getElementById('busqueda-title');
  const bs = document.getElementById('busqueda');
  if (bt && bs && !bs.classList.contains('active')) bt.textContent = t('results');
}


// ---------- Selector de idioma (menú desplegable) ----------
function getLanguages() {
  const l = SITE_CONFIG.languages;
  return l && l.length ? l : [{ code: 'es', name: 'Español', short: 'ES' }, { code: 'en', name: 'English', short: 'EN' }];
}

function setLangMenuOpen(open, returnFocus) {
  const btn = document.getElementById('lang-btn');
  const list = document.getElementById('lang-list');
  if (!btn || !list) return;
  list.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
  if (open) {
    const opt = list.querySelector('[aria-selected="true"]') || list.firstElementChild;
    if (opt) opt.focus();
  } else if (returnFocus) {
    btn.focus();
  }
}

// Reconstruye las opciones y actualiza el texto del botón
function updateLanguageMenu() {
  const btn = document.getElementById('lang-btn');
  const list = document.getElementById('lang-list');
  const cur = document.getElementById('lang-current');
  if (!btn || !list || !cur) return;

  const langs = getLanguages();
  const current = langs.find(l => l.code === currentLang) || langs[0];
  cur.textContent = current.short;
  btn.title = `${t('language')}: ${current.name}`;
  btn.setAttribute('aria-label', `${t('language')}: ${current.name}`);
  list.setAttribute('aria-label', t('language'));

  list.innerHTML = '';
  langs.forEach(l => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.tabIndex = -1;
    li.dataset.lang = l.code;
    li.lang = l.code;
    li.setAttribute('aria-selected', String(l.code === current.code));
    const name = document.createElement('span');
    name.className = 'lang-name';
    name.textContent = l.name;
    const short = document.createElement('span');
    short.className = 'lang-short';
    short.textContent = l.short;
    li.append(name, short);
    list.appendChild(li);
  });
}

function setupLanguageMenu(onChange) {
  const wrap = document.getElementById('lang-menu');
  const btn = document.getElementById('lang-btn');
  const list = document.getElementById('lang-list');
  if (!wrap || !btn || !list) return;

  updateLanguageMenu();

  const choose = (opt) => {
    if (!opt) return;
    const code = opt.dataset.lang;
    setLangMenuOpen(false, true);
    if (code && code !== currentLang) onChange(code);
  };

  btn.addEventListener('click', () => setLangMenuOpen(list.hidden, false));
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setLangMenuOpen(true);
    }
  });

  list.addEventListener('click', (e) => choose(e.target.closest('[role="option"]')));
  list.addEventListener('keydown', (e) => {
    const items = Array.from(list.children);
    const i = items.indexOf(document.activeElement);
    const focusAt = (n) => { e.preventDefault(); items[(n + items.length) % items.length].focus(); };
    switch (e.key) {
      case 'ArrowDown': focusAt(i + 1); break;
      case 'ArrowUp': focusAt(i - 1); break;
      case 'Home': focusAt(0); break;
      case 'End': focusAt(items.length - 1); break;
      case 'Enter':
      case ' ': e.preventDefault(); choose(items[i]); break;
      case 'Escape': e.preventDefault(); setLangMenuOpen(false, true); break;
      case 'Tab': setLangMenuOpen(false, false); break;
    }
  });

  document.addEventListener('click', (e) => {
    if (!list.hidden && !wrap.contains(e.target)) setLangMenuOpen(false, false);
  });
}
