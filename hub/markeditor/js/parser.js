// Parser Markdown y render de la vista previa

// ===== Funciones auxiliares del parser Markdown (admoniciones, tablas, listas, colores, TOC, etc.) =====
function renderRatingStars(score) {
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    if (score >= i) starsHtml += '<i class="fa-solid fa-star"></i>';
    else if (score >= i - 0.5) starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
    else starsHtml += '<i class="fa-regular fa-star opacity-40"></i>';
  }
  return `<span class="mark-rating"><span class="mark-rating-stars">${starsHtml}</span> <span class="text-xs font-bold text-gray-700 dark:text-gray-300">(${score.toFixed(1)}/5)</span></span>`;
}

function parseDimension(val) {
  const trimmed = (val || '').trim();
  return /^\d+$/.test(trimmed) ? `${trimmed}px` : trimmed;
}

function parseAdmonitions(text) {
  const lines = text.split('\n');
  const result = [];
  let inAdmonition = false;
  let admType = 'warning', admTitle = '', admContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^!!!\s*(\w+)?\s*(.*)$/);

    if (match) {
      if (inAdmonition) {
        result.push(renderAdmonitionBlock(admType, admTitle, admContent));
        admContent = [];
      }
      inAdmonition = true;
      admType = match[1] || 'warning';
      admTitle = match[2] || admType;
    } else if (inAdmonition) {
      if (line.startsWith('    ') || line.startsWith('\t')) {
        admContent.push(line.replace(/^(    |\t)/, ''));
      } else if (line.trim() === '') {
        admContent.push('');
      } else {
        result.push(renderAdmonitionBlock(admType, admTitle, admContent));
        inAdmonition = false;
        admContent = [];
        result.push(line);
      }
    } else {
      result.push(line);
    }
  }

  if (inAdmonition) result.push(renderAdmonitionBlock(admType, admTitle, admContent));
  return result.join('\n');
}

function renderAdmonitionBlock(type, title, contentLines) {
  const icons = {
    note: 'fa-circle-info', info: 'fa-circle-exclamation', warning: 'fa-triangle-exclamation',
    danger: 'fa-radiation', greentext: 'fa-check-circle', game: 'fa-gamepad',
    download: 'fa-circle-down', requirements: 'fa-microchip', specs: 'fa-sliders'
  };
  const body = contentLines.join('\n').trim();
  // El contenido va en líneas propias para que parseLists lo procese; si está vacío no se
  // deja ninguna línea en blanco (parseParagraphs partiría el bloque en varios <p>).
  const content = body ? `<div>\n${body}\n    </div>` : '<div></div>';
  return `<div class="mark-admonition ${type}">
    <div class="mark-admonition-title"><i class="fa-solid ${icons[type] || 'fa-bell'}"></i> ${escapeHTML(title)}</div>
    ${content}
  </div>`;
}

function parseMarkColors(text) {
  let prev;
  do {
    prev = text;
    text = text.replace(/%([#\w]+)%\s*([\s\S]*?)\s*%%/g, '<span style="color: $1;">$2</span>');
  } while (text !== prev);
  return text;
}

function formatMarkUnderline(p1, p2, p3, p4, content) {
  const params = [p1, p2, p3, p4].map(p => p ? p.replace(';', '').trim() : 'default');
  let color = 'currentColor', style = 'solid', type = 'underline', thickness = '1px';

  params.forEach(val => {
    if (!val || val === 'default') return;
    if (/^(solid|double|dotted|dashed|wavy)$/.test(val)) style = val;
    else if (/^(underline|line-through|overline|both)$/.test(val)) type = val === 'both' ? 'underline overline' : val;
    else if (/^\d+$/.test(val)) thickness = `${val}px`;
    else color = val;
  });

  return `<span style="text-decoration-line: ${type}; text-decoration-color: ${color}; text-decoration-style: ${style}; text-decoration-thickness: ${thickness};">${content}</span>`;
}

function parseTables(text) {
  const lines = text.split('\n');
  let inTable = false, tableBuffer = [];
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('|')) {
      inTable = true;
      tableBuffer.push(line);
    } else {
      if (inTable) {
        result.push(renderTable(tableBuffer));
        tableBuffer = [];
        inTable = false;
      }
      result.push(lines[i]);
    }
  }
  if (inTable) result.push(renderTable(tableBuffer));
  return result.join('\n');
}

function renderTable(rows) {
  if (rows.length < 2) return rows.join('\n');

  const splitCells = line => line.split('|').map(s => s.trim()).filter((s, idx, arr) => (idx > 0 && idx < arr.length - 1) || arr.length === 1 || s !== '');
  const headers = splitCells(rows[0]);
  const alignments = splitCells(rows[1]);

  const alignStyles = alignments.map(a => {
    if (a.startsWith(':') && a.endsWith(':')) return 'text-align: center;';
    if (a.endsWith(':')) return 'text-align: right;';
    if (a.startsWith(':')) return 'text-align: left;';
    return '';
  });

  let html = '<table><thead><tr>';
  headers.forEach((h, idx) => {
    html += `<th style="${alignStyles[idx] || ''}">${h.replace(/\\n/g, '<br>')}</th>`;
  });
  html += '</tr></thead><tbody>';

  for (let i = 2; i < rows.length; i++) {
    const cells = splitCells(rows[i]);
    html += '<tr>';
    cells.forEach((c, idx) => {
      html += `<td style="${alignStyles[idx] || ''}">${c.replace(/\\n/g, '<br>')}</td>`;
    });
    html += '</tr>';
  }

  return html + '</tbody></table>';
}

function parseLists(text) {
  const lines = text.split('\n');
  const result = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (/^\s*[-\*]\s+\[ \]/.test(line)) {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push(line.replace(/^\s*[-\*]\s+\[ \]\s*(.*)$/, '<div class="mark-task-item"><input type="checkbox" disabled> <span>$1</span></div>'));
      continue;
    }
    if (/^\s*[-\*]\s+\[[xX]\]/.test(line)) {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push(line.replace(/^\s*[-\*]\s+\[[xX]\]\s*(.*)$/, '<div class="mark-task-item"><input type="checkbox" checked disabled> <span class="line-through">$1</span></div>'));
      continue;
    }

    if (/^\s*[-\*]\s+(.+)$/.test(line)) {
      if (!inList) { result.push('<ul>'); inList = true; }
      result.push(`<li>${line.replace(/^\s*[-\*]\s+(.+)$/, '$1')}</li>`);
    } else {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push(line);
    }
  }
  if (inList) result.push('</ul>');

  return result.join('\n');
}

function parseParagraphs(text) {
  return text.split(/\n\n+/).map(p => {
    const trimmed = p.trim();
    if (/^<(h[1-6]|table|div|pre|ul|ol|blockquote)/i.test(trimmed)) return p;
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
}

function generateTOCHTML(headers, minLevel) {
  if (!headers.length) return '';
  const filtered = headers.filter(h => h.level >= minLevel);
  if (!filtered.length) return '';

  const tocTitle = t('toc_title');
  let tocHTML = `<div class="mark-toc"><div class="mark-toc-title">${tocTitle}</div><ul>`;
  filtered.forEach(h => {
    const indent = (h.level - minLevel) * 1.2;
    tocHTML += `<li style="margin-left: ${indent}rem;"><a href="#${h.id}">${escapeHTML(h.title)}</a></li>`;
  });
  return tocHTML + '</ul></div>';
}

// ===== Render principal: convierte el Markdown del editor en HTML y actualiza estadísticas =====
function parseAndRender() {
  if (!markdownInput || !previewOutput) return;

  const rawText = markdownInput.value.replace(/\r\n?/g, '\n');
  
  try {
    localStorage.setItem(STORAGE_KEY, rawText);
  } catch (e) {}
  
  updateStats(rawText);

  const headersList = [];
  const codeBlocks = [];
  const inlineCodes = [];

  let text = rawText
    .replace(/\\([*~=%!#>\\`\-_\[\]\(\)])/g, (_, char) => `&#${char.charCodeAt(0)};`)
    .replace(/^\[\/\/\]:\s*\((.*?)\)$/gm, '')
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const id = `___CODE_BLOCK_${codeBlocks.length}___`;
      codeBlocks.push(`<pre><code class="language-${lang}">${escapeHTML(code.trimEnd())}</code></pre>`);
      return id;
    })
    .replace(/`([^`]+)`/g, (_, code) => {
      const id = `___INLINE_CODE_${inlineCodes.length}___`;
      inlineCodes.push(`<code>${escapeHTML(code)}</code>`);
      return id;
    });

  text = parseAdmonitions(text);

  text = text.replace(/^(#{1,6})\s*(.*?)$/gm, (_, hashes, title) => {
    const level = hashes.length;
    let align = '';
    let cleanTitle = title.trim();

    if (cleanTitle.startsWith('->') && cleanTitle.endsWith('<-')) {
      align = 'text-align: center;';
      cleanTitle = cleanTitle.substring(2, cleanTitle.length - 2).trim();
    } else if (cleanTitle.startsWith('->') && cleanTitle.endsWith('->')) {
      align = 'text-align: right;';
      cleanTitle = cleanTitle.substring(2, cleanTitle.length - 2).trim();
    }

    const headerId = 'header-' + cleanTitle.toLowerCase().replace(/[^\w]+/g, '-');
    headersList.push({ level, title: cleanTitle, id: headerId });

    return `<h${level} id="${headerId}" style="${align}">${cleanTitle}</h${level}>`;
  });

  text = text
    .replace(/^->\s*(.*?)\s*<-$/gm, '<p style="text-align: center; font-weight: 600;">$1</p>')
    .replace(/^->\s*(.*?)\s*->$/gm, '<p style="text-align: right; font-weight: 600;">$1</p>')
    .replace(/\[TOC(\d?)\]/g, (_, minLevel) => generateTOCHTML(headersList, minLevel ? parseInt(minLevel, 10) : 1));

  text = text.replace(/:::\s*gallery\s*\n([\s\S]*?)\n:::/gi, (_, galleryContent) => `<div class="mark-gallery">${galleryContent}</div>`);

  text = text.replace(/\[download:\s*([^\]]+)\]/gi, (_, content) => {
    const parts = content.split('|').map(s => s.trim());
    const title = escapeHTML(parts[0] || 'Descargar');
    const href = parts[1] || '#';
    const subtext = parts[2] ? escapeHTML(parts[2]) : '';
    const styleClass = parts[3] ? parts[3].toLowerCase() : 'primary';

    return `<a href="${href}" target="_blank" rel="noopener" class="mark-download-btn ${styleClass}">
      <span class="btn-text">
        <span class="btn-title">${title}</span>
        ${subtext ? `<span class="btn-sub">${subtext}</span>` : ''}
      </span>
      <i class="fa-solid fa-cloud-arrow-down btn-icon"></i>
    </a>`;
  });

  text = text.replace(/\[badge:\s*([^\]]+)\]/gi, (_, content) => {
    const parts = content.split('|').map(s => s.trim());
    const textVal = escapeHTML(parts[0] || '');
    const color = parts[1] || '';
    let customStyle = '';
    if (color) {
      customStyle = color.startsWith('#')
        ? `style="background-color: ${color}25; color: ${color}; border-color: ${color}50;"`
        : `style="background-color: ${color};"`;
    }
    return `<span class="mark-badge" ${customStyle}>${textVal}</span>`;
  });

  text = text.replace(/\[rating:\s*([\d\.]+)(?:\/(\d+))?\]/gi, (_, scoreVal) => renderRatingStars(parseFloat(scoreVal) || 0));

  text = parseTables(text);

  text = text.replace(/^(>+)\s*(.*?)$/gm, (_, quotes, content) => {
    let result = content;
    for (let i = 0; i < quotes.length; i++) {
      result = `blockquote>${result}</blockquote`;
    }
    return `<${result}>`;
  });

  text = text
    .replace(/^!;\s*$/gm, '<div style="clear: both;"></div>')
    .replace(/^(\*\*\*|---|___)\s*$/gm, '<hr class="my-4 border-gray-300 dark:border-gray-700">')
    .replace(/!~([^;~]+)?(;[^;~]+)?(;[^;~]+)?(;[^;~]+)?;\s*([\s\S]*?)\s*~!/g, (_, p1, p2, p3, p4, content) => formatMarkUnderline(p1, p2, p3, p4, content))
    .replace(/!~\s*([\s\S]*?)\s*~!/g, '<span style="text-decoration: underline;">$1</span>')
    .replace(/!>\s*(.*?)$/gm, '<span class="mark-spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(/==(.*?)==/g, '<mark>$1</mark>');

  text = text.replace(/!\[([^\]]*)\]\(([^)]+?)\)(?:\{([^}]+)\})?/g, (_, alt, urlAndHash, size) => {
    let url = urlAndHash;
    let floatClass = '';
    let titleAttr = '';

    if (url.includes('"')) {
      const parts = url.split('"');
      url = parts[0].trim();
      titleAttr = `title="${parts[1]}"`;
    }

    if (url.includes('#left')) {
      url = url.replace('#left', '');
      floatClass = 'img-float-left';
    } else if (url.includes('#right')) {
      url = url.replace('#right', '');
      floatClass = 'img-float-right';
    }

    let styleAttr = '';
    if (size) {
      const dimensions = size.split(':');
      if (dimensions.length === 2) {
        styleAttr = `style="width: ${parseDimension(dimensions[0])}; height: ${parseDimension(dimensions[1])}; object-fit: cover;"`;
      } else if (dimensions.length === 1) {
        styleAttr = `style="width: ${parseDimension(dimensions[0])};"`;
      }
    }

    return `<img src="${url}" alt="${alt}" ${titleAttr} class="rounded max-w-full inline-block ${floatClass}" ${styleAttr} onerror="this.src='https://placehold.co/300x150?text=Image+Not+Found'">`;
  });

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="mark-link underline hover:opacity-80">$1</a>');

  text = parseMarkColors(text);
  text = parseLists(text);
  text = parseParagraphs(text);

  inlineCodes.forEach((codeHTML, idx) => { text = text.replace(`___INLINE_CODE_${idx}___`, codeHTML); });
  codeBlocks.forEach((blockHTML, idx) => { text = text.replace(`___CODE_BLOCK_${idx}___`, blockHTML); });

  requestAnimationFrame(() => {
    previewOutput.innerHTML = text;
    const indicator = document.getElementById('rendering-indicator');
    if (indicator) {
      indicator.style.opacity = '1';
      setTimeout(() => { indicator.style.opacity = '0'; }, 500);
    }
  });
}

function updateStats(text) {
  if (!statChars || !statWords || !statLines) return;
  statChars.textContent = text.length.toLocaleString();
  statWords.textContent = (text.trim() ? text.trim().split(/\s+/).length : 0).toLocaleString();
  statLines.textContent = text.split('\n').length.toLocaleString();
}
