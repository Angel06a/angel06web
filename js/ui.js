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
  selectedDownloadLink1 = d.link1 || "";
  selectedDownloadLink2 = d.link2 || "";

  primaryBtn.textContent = d.text1 || "Descargar";
  primaryBtn.disabled = !selectedDownloadLink1;

  if (selectedDownloadLink2) {
    secondaryBtn.style.display = "inline-flex";
    secondaryBtn.textContent = d.text2 || "Descargar";
    secondaryBtn.disabled = false;
  } else {
    secondaryBtn.style.display = "none";
    secondaryBtn.textContent = "Descargar";
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

  categoriesData.forEach((cat, index) => {
    createCategoryTabAndContent(cat, index, sidebarUl, mainContent);
  });

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

  // Doble clic: abre directamente el enlace principal
  containerElement.addEventListener('dblclick', function(e) {
    const btn = e.target.closest('.project-item');
    if (btn && containerElement.contains(btn)) {
      openLink(btn.getAttribute('data-link1'));
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
  loadImageAsync(getItemImagePath(categoryName, item.displayName), iconImg);

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
  const categoryId = cleanCategoryName(cat.name).toLowerCase().replace(/\s+/g, '-');
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
    noResultsLi.textContent = 'No se encontraron resultados.';
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
    label.append(document.createTextNode(s.label), input, slider);
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
