// Parser Markdown y render de la vista previa

// ===== Seguridad: escape de atributos y sanitizado del HTML generado =====
const IMAGE_FALLBACK_URL = 'https://placehold.co/300x150?text=Image+Not+Found';
const escapeAttr = str => (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const BLOCKED_TAGS = new Set(['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'STYLE', 'LINK', 'META', 'BASE', 'FORM', 'TEMPLATE', 'FRAME', 'FRAMESET', 'APPLET', 'NOSCRIPT']);
const URL_ATTRS = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'poster', 'data']);

function isSafeUrl(value, tagName) {
  const v = value.replace(/[\u0000-\u0020\u00A0\u1680\u2000-\u200F\u2028\u2029\u205F\u3000\uFEFF]/g, '').toLowerCase();
  if (/^(javascript|vbscript):/.test(v)) return false;
  if (v.startsWith('data:')) return tagName === 'IMG' && /^data:image\/(png|jpe?g|gif|webp|avif);/.test(v);
  return true;
}

// Elimina etiquetas peligrosas, manejadores on*, URLs javascript: y estilos con url()/expression()
function sanitizeFragment(root) {
  root.querySelectorAll('*').forEach(el => {
    const tag = el.tagName.toUpperCase();
    if (BLOCKED_TAGS.has(tag)) { el.remove(); return; }
    Array.from(el.attributes).forEach(attr => {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || name === 'srcdoc') el.removeAttribute(attr.name);
      else if (URL_ATTRS.has(name) && !isSafeUrl(attr.value, tag)) el.removeAttribute(attr.name);
      else if (name === 'style' && /expression\s*\(|url\s*\(|javascript:|@import/i.test(attr.value)) el.removeAttribute(attr.name);
    });
    if (el.getAttribute('target') === '_blank') el.setAttribute('rel', 'noopener noreferrer');
  });
  return root;
}

// ===== Funciones auxiliares del parser Markdown (admoniciones, tablas, listas, colores, TOC, etc.) =====
function renderRatingStars(score, max = 5) {
  const outOf = max > 0 ? max : 5;
  // Normaliza a una escala de 5 estrellas y limita el rango
  const normalized = Math.min(5, Math.max(0, (score / outOf) * 5));
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    if (normalized >= i) starsHtml += '<i class="fa-solid fa-star"></i>';
    else if (normalized >= i - 0.5) starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
    else starsHtml += '<i class="fa-regular fa-star opacity-40"></i>';
  }
  return `<span class="mark-rating"><span class="mark-rating-stars">${starsHtml}</span> <span class="text-xs font-bold text-gray-700 dark:text-gray-300">(${score.toFixed(1)}/${outOf})</span></span>`;
}

function parseDimension(val) {
  const trimmed = (val || '').trim().replace(/[^\w.%-]/g, '');
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
    else color = val.replace(/[^\w#(),.%\s-]/g, '');
  });

  return `<span style="text-decoration-line: ${type}; text-decoration-color: ${color}; text-decoration-style: ${style}; text-decoration-thickness: ${thickness};">${content}</span>`;
}

const TABLE_SEPARATOR_RE = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

function parseTables(text) {
  const lines = text.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const next = lines[i + 1];
    const startsTable = lines[i].includes('|') && next !== undefined && next.includes('|') && TABLE_SEPARATOR_RE.test(next);

    if (!startsTable) {
      result.push(lines[i]);
      i++;
      continue;
    }

    const tableBuffer = [];
    while (i < lines.length && lines[i].includes('|')) {
      tableBuffer.push(lines[i].trim());
      i++;
    }
    result.push(renderTable(tableBuffer));
  }
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
  const stack = []; // listas abiertas: { indent, tag }

  const closeList = () => result.push(`</li></${stack.pop().tag}>`);
  const closeAll = () => { while (stack.length) closeList(); };
  const indentOf = ws => ws.replace(/\t/g, '    ').length;

  for (const line of lines) {
    const task = line.match(/^([ \t]*)[-*]\s+\[( |x|X)\]\s*(.*)$/);
    if (task) {
      closeAll();
      const indent = indentOf(task[1]);
      const margin = indent > 0 ? ` style="margin-left: ${indent * 0.25}rem;"` : '';
      const checked = task[2] !== ' ';
      result.push(`<div class="mark-task-item"${margin}><input type="checkbox"${checked ? ' checked' : ''} disabled> <span${checked ? ' class="line-through"' : ''}>${task[3]}</span></div>`);
      continue;
    }

    const item = line.match(/^([ \t]*)([-*]|\d+[.)])\s+(.+)$/);
    if (!item) {
      closeAll();
      result.push(line);
      continue;
    }

    const indent = indentOf(item[1]);
    const ordered = /\d/.test(item[2]);
    const tag = ordered ? 'ol' : 'ul';

    while (stack.length && stack[stack.length - 1].indent > indent) closeList();
    let top = stack[stack.length - 1];
    if (top && top.indent === indent && top.tag !== tag) {
      closeList();
      top = stack[stack.length - 1];
    }

    if (top && top.indent === indent) {
      result.push('</li>');
    } else {
      const startNum = ordered ? parseInt(item[2], 10) : 1;
      result.push(`<${tag}${startNum !== 1 ? ` start="${startNum}"` : ''}>`);
      stack.push({ indent, tag });
    }
    result.push(`<li>${item[3]}`);
  }
  closeAll();

  return result.join('\n');
}

function parseParagraphs(text) {
  return text.split(/\n\n+/).map(p => {
    const trimmed = p.trim();
    if (/^<(h[1-6]|table|div|pre|ul|ol|blockquote|hr|p[\s>])/i.test(trimmed) || /^___CODE_BLOCK_\d+___$/.test(trimmed)) return p;
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

  // Primero se extrae el código (así su contenido no se toca) y después se aplican los escapes
  let text = rawText
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const id = `___CODE_BLOCK_${codeBlocks.length}___`;
      codeBlocks.push(`<pre><code class="language-${lang}">${escapeHTML(code.trimEnd())}</code></pre>`);
      return id;
    })
    .replace(/(?<!\\)`([^`\n]+)`/g, (_, code) => {
      const id = `___INLINE_CODE_${inlineCodes.length}___`;
      inlineCodes.push(`<code>${escapeHTML(code)}</code>`);
      return id;
    })
    .replace(/\\([*~=%!#>\\`\-_\[\]\(\)])/g, (_, char) => `&#${char.charCodeAt(0)};`)
    .replace(/^\[\/\/\]:\s*\((.*?)\)$/gm, '');

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
    const title = escapeHTML(parts[0] || t('download_default_title'));
    const href = parts[1] || '#';
    const subtext = parts[2] ? escapeHTML(parts[2]) : '';
    const styleClass = (parts[3] ? parts[3].toLowerCase().replace(/[^a-z0-9_-]/g, '') : '') || 'primary';

    return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener" class="mark-download-btn ${styleClass}">
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
    const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      const full = '#' + (hex[1].length === 3 ? hex[1].split('').map(c => c + c).join('') : hex[1]);
      customStyle = `style="background-color: ${full}25; color: ${full}; border-color: ${full}50;"`;
    } else if (/^[a-z]+$/i.test(color)) {
      customStyle = `style="background-color: ${color};"`;
    }
    return `<span class="mark-badge" ${customStyle}>${textVal}</span>`;
  });

  text = text.replace(/\[rating:\s*([\d\.]+)(?:\/(\d+))?\]/gi, (_, scoreVal, maxVal) => renderRatingStars(parseFloat(scoreVal) || 0, parseInt(maxVal, 10) || 5));

  text = parseTables(text);

  text = text.replace(/^((?:>[ \t]?)+)(.*)$/gm, (_, quotes, content) => {
    const depth = (quotes.match(/>/g) || []).length;
    return '<blockquote>'.repeat(depth) + content + '</blockquote>'.repeat(depth);
  });

  text = text
    .replace(/^!;\s*$/gm, '<div style="clear: both;"></div>')
    .replace(/^(\*\*\*|---|___)\s*$/gm, '<hr class="my-4 border-gray-300 dark:border-gray-700">')
    .replace(/!~([^;~]+)?(;[^;~]+)?(;[^;~]+)?(;[^;~]+)?;\s*([\s\S]*?)\s*~!/g, (_, p1, p2, p3, p4, content) => formatMarkUnderline(p1, p2, p3, p4, content))
    .replace(/!~\s*([\s\S]*?)\s*~!/g, '<span style="text-decoration: underline;">$1</span>')
    .replace(/!>\s*(.*?)$/gm, '<span class="mark-spoiler">$1</span>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(?=\S)([^*\n]*?\S)\*/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(/==(.*?)==/g, '<mark>$1</mark>');

  text = text.replace(/!\[([^\]]*)\]\(([^)]+?)\)(?:\{([^}]+)\})?/g, (_, alt, urlAndHash, size) => {
    let url = urlAndHash;
    let floatClass = '';
    let titleAttr = '';

    if (url.includes('"')) {
      const parts = url.split('"');
      url = parts[0].trim();
      titleAttr = `title="${escapeAttr(parts[1])}"`;
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

    return `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" ${titleAttr} class="rounded max-w-full inline-block ${floatClass}" ${styleAttr}>`;
  });

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => `<a href="${escapeAttr(url.trim())}" target="_blank" rel="noopener" class="mark-link underline hover:opacity-80">${label}</a>`);

  text = parseMarkColors(text);
  text = parseLists(text);
  text = parseParagraphs(text);

  inlineCodes.forEach((codeHTML, idx) => { text = text.replace(`___INLINE_CODE_${idx}___`, () => codeHTML); });
  codeBlocks.forEach((blockHTML, idx) => { text = text.replace(`___CODE_BLOCK_${idx}___`, () => blockHTML); });

  requestAnimationFrame(() => {
    const tpl = document.createElement('template');
    tpl.innerHTML = text;
    sanitizeFragment(tpl.content);
    previewOutput.replaceChildren(tpl.content);
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
