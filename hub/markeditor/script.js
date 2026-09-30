const STORAGE_KEY = 'mark_editor_content';

const EMBEDDED_EXPORT_CSS = `body{font-family:'Inter',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}.font-mono{font-family:'Fira Code',monospace}.mark-rendered{color:inherit;line-height:1.6;word-wrap:break-word}.mark-rendered h1{font-size:2.1em;font-weight:700;margin-top:.8em;margin-bottom:.4em;border-bottom:1px solid currentColor;opacity:.95}.mark-rendered h2{font-size:1.65em;font-weight:600;margin-top:.7em;margin-bottom:.35em;border-bottom:1px solid rgba(128,128,128,.2)}.mark-rendered h3{font-size:1.35em;font-weight:600;margin-top:.6em;margin-bottom:.3em}.mark-rendered h4{font-size:1.15em;font-weight:600;margin-top:.5em;margin-bottom:.25em}.mark-rendered h5{font-size:1em;font-weight:600;margin-top:.4em;margin-bottom:.2em}.mark-rendered h6{font-size:.88em;font-weight:600;margin-top:.4em;margin-bottom:.2em;opacity:.8}.mark-rendered p{margin-bottom:.85em}.mark-rendered mark{background-color:#f6e05e;color:#1a202c;padding:.1em .3em;border-radius:.2em}.mark-admonition{border-left:4px solid;padding:.8em 1.1em;margin:1em 0;border-radius:0 .375rem .375rem 0;background-color:rgba(128,128,128,.08)}.mark-admonition-title{font-weight:700;margin-bottom:.4em;text-transform:capitalize;display:flex;align-items:center;gap:.5rem}.mark-admonition.note{border-color:#3b82f6}.mark-admonition.note .mark-admonition-title{color:#3b82f6}.mark-admonition.info{border-color:#06b6d4}.mark-admonition.info .mark-admonition-title{color:#06b6d4}.mark-admonition.warning{border-color:#f59e0b}.mark-admonition.warning .mark-admonition-title{color:#f59e0b}.mark-admonition.danger{border-color:#ef4444}.mark-admonition.danger .mark-admonition-title{color:#ef4444}.mark-admonition.greentext{border-color:#22c55e}.mark-admonition.greentext .mark-admonition-title{color:#22c55e}.mark-spoiler{background-color:#2d3748;color:transparent;cursor:pointer;padding:.1em .4em;border-radius:.25rem;transition:all .2s ease;user-select:none}.mark-spoiler.revealed,.mark-spoiler:hover{background-color:rgba(128,128,128,.2);color:inherit}.mark-rendered blockquote{border-left:4px solid #a0aec0;padding-left:1rem;margin:.8rem 0;color:#718096;font-style:italic}.dark .mark-rendered blockquote{border-left-color:#4a5568;color:#a0aec0}.mark-rendered table{width:100%;border-collapse:collapse;margin:1rem 0}.mark-rendered td,.mark-rendered th{border:1px solid #cbd5e0;padding:.5rem .8rem}.dark .mark-rendered td,.dark .mark-rendered th{border-color:#4a5568}.mark-rendered th{background-color:rgba(0,0,0,.05);font-weight:600}.dark .mark-rendered th{background-color:rgba(255,255,255,.05)}.mark-rendered pre{background-color:#1e1e1e;color:#d4d4d4;padding:1rem;border-radius:.375rem;overflow-x:auto;margin:.8rem 0;font-family:'Fira Code',monospace;font-size:.9em}.mark-rendered code{font-family:'Fira Code',monospace;background-color:rgba(128,128,128,.15);padding:.15em .4em;border-radius:.25rem;font-size:.9em}.mark-rendered pre code{background-color:transparent;padding:0}.mark-toc{background-color:rgba(128,128,128,.08);border:1px solid rgba(128,128,128,.2);border-radius:.375rem;padding:1rem;margin:1rem 0;display:inline-block;min-width:240px;max-width:100%}.mark-toc-title{font-weight:700;margin-bottom:.5rem;border-bottom:1px solid rgba(128,128,128,.2);padding-bottom:.25rem}.mark-toc ul{list-style-type:none;padding-left:1rem;margin:0}.mark-toc>ul{padding-left:0}.mark-toc a{color:#3182ce;text-decoration:none}.mark-toc a:hover{text-decoration:underline}.dark .mark-toc a{color:#63b3ed}.mark-link{color:inherit}.mark-rendered ul{list-style-type:disc;padding-left:1.5rem;margin-bottom:.8rem}.mark-rendered ol{list-style-type:decimal;padding-left:1.5rem;margin-bottom:.8rem}.mark-rendered ol ol,.mark-rendered ol ul,.mark-rendered ul ol,.mark-rendered ul ul{margin-bottom:0}.mark-rendered li{margin-bottom:.2rem}.mark-task-list{list-style:none!important;padding-left:.5rem!important}.mark-task-item{display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem}.img-float-left{float:left;margin-right:1rem;margin-bottom:.5rem}.img-float-right{float:right;margin-left:1rem;margin-bottom:.5rem}`;

const DEFAULT_MARKDOWN = `# Mark Markdown Publisher
Welcome to the recreated **Mark** Markdown publisher app!

[TOC]

***

## Header Alignments & Styling
-> Centered Header <-
-> Right Aligned Header ->

### Inline Text Formatting
*Italics*, **Bold**, ~~Strikeout~~, and ==Highlighted Mark==.
You can also escape symbols: \*Not Italics\*.

### Colored & Underlined Extensions
%red% Colored Red Text %% and %#3182ce% Hex Color Text %%.
%#ff5555% [%#ff5555% Colored Link %%](https://example.com) %%

Underline syntax supports parameters: \`!~color; style; type; thickness;~\`
!~ Simple Underlined Text ~!
!~red; Underlined Text With Color ~!
!~green;wavy; Underlined Text Plus Wavy Style ~!
!~blue;double;line-through; Underlined Plus Line Through ~!
!~#d69e2e;dashed;underline;4; Custom Thickness & Dashed ~!

Nested combinations: %violet% !~green; Double Combination Color ~! %%

### Spoilers & Comments
!> This is a secret spoiler text! Click to reveal.

[//]: (This is a hidden comment and will not render)

### Admonitions / Callouts
!!! note Useful Note
    Admonitions are callout boxes! Supported types: note, info, warning, danger, greentext.

!!! danger
    This is a danger callout without an explicit title.

### Lists & Tasks
-nombre1
-nombre2
- Bulleted list item
    - Nested list item (4 spaces or tab)
- [ ] Unchecked Task item
- [x] Completed Task item

1. Numbered Item 1
2. Numbered Item 2

### Blockquotes
>> How to use quotes in Markdown?
> Just prepend text with > character.

### Code Block
\`\`\`javascript
// Mark live syntax parsing
function helloWorld() {
    console.log("Hello from Mark!");
}
helloWorld();
\`\`\`

### Custom Tables
Header 1 \\n Line 2 | Header 2
:---: | ---:
Centered Cell | Right Cell
Cell \\n with break | Cell

### Images & Youtube Embeds
![Mark Logo](https://placehold.co/400x120/1e293b/38bdf8?text=Mark+Image){250px:75px}

[![Youtube Thumbnail](https://placehold.co/300x150/0284c7/ffffff?text=Play+Video){200px:100px}](https://youtube.com)

!;
Floating clear separator applied above using \`!;\`.
`;

const markdownInput = document.getElementById('markdown-input');
const previewOutput = document.getElementById('preview-output');
const statWords = document.getElementById('stat-words');
const statChars = document.getElementById('stat-chars');
const statLines = document.getElementById('stat-lines');

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHTML = str => (str || '').replace(/[&<>"']/g, m => HTML_ESCAPES[m]);

function debounce(func, wait = 150) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

window.onload = function () {
    try {
        const savedContent = localStorage.getItem(STORAGE_KEY);
        markdownInput.value = savedContent !== null ? savedContent : DEFAULT_MARKDOWN;
    } catch (e) {
        markdownInput.value = DEFAULT_MARKDOWN;
    }
    parseAndRender();
    
    if (!document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.add('dark');
    }
    updateThemeIcon();
};

if (markdownInput) {
    markdownInput.addEventListener('input', debounce(parseAndRender, 150));
}

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

function parseAndRender() {
    if (!markdownInput || !previewOutput) return;

    const rawText = markdownInput.value.replace(/\r\n?/g, '\n');
    
    try {
        localStorage.setItem(STORAGE_KEY, rawText);
    } catch (e) {
        // Ignorar excepciones en entornos sin acceso a localStorage
    }
    
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

    inlineCodes.forEach((codeHTML, idx) => {
        text = text.replace(`___INLINE_CODE_${idx}___`, codeHTML);
    });
    codeBlocks.forEach((blockHTML, idx) => {
        text = text.replace(`___CODE_BLOCK_${idx}___`, blockHTML);
    });

    requestAnimationFrame(() => {
        previewOutput.innerHTML = text;
        const indicator = document.getElementById('rendering-indicator');
        if (indicator) {
            indicator.style.opacity = '1';
            setTimeout(() => { indicator.style.opacity = '0'; }, 500);
        }
    });
}

function parseDimension(val) {
    const trimmed = (val || '').trim();
    return /^\d+$/.test(trimmed) ? `${trimmed}px` : trimmed;
}

function parseAdmonitions(text) {
    const lines = text.split('\n');
    const result = [];
    let inAdmonition = false;
    let admType = 'warning';
    let admTitle = '';
    let admContent = [];

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

    if (inAdmonition) {
        result.push(renderAdmonitionBlock(admType, admTitle, admContent));
    }

    return result.join('\n');
}

function renderAdmonitionBlock(type, title, contentLines) {
    const icons = {
        note: 'fa-circle-info',
        info: 'fa-circle-exclamation',
        warning: 'fa-triangle-exclamation',
        danger: 'fa-radiation',
        greentext: 'fa-check-circle'
    };
    const icon = icons[type] || 'fa-bell';
    const body = contentLines.join('\n').trim();
    return `<div class="mark-admonition ${type}">
        <div class="mark-admonition-title"><i class="fa-solid ${icon}"></i> ${escapeHTML(title)}</div>
        <div>${body}</div>
    </div>`;
}

function parseMarkColors(text) {
    let prevText;
    const colorRegex = /%([#\w]+)%\s*([\s\S]*?)\s*%%/g;
    do {
        prevText = text;
        text = text.replace(colorRegex, (_, color, content) => `<span style="color: ${color};">${content}</span>`);
    } while (text !== prevText);
    return text;
}

function formatMarkUnderline(p1, p2, p3, p4, content) {
    const params = [p1, p2, p3, p4].map(p => p ? p.replace(';', '').trim() : 'default');

    let color = 'currentColor';
    let style = 'solid';
    let type = 'underline';
    let thickness = '1px';

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
    let inTable = false;
    let tableBuffer = [];
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
    if (inTable) {
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

    html += '</tbody></table>';
    return html;
}

function parseLists(text) {
    const lines = text.split('\n');
    const result = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (/^\s*[-\*]\s+\[ \]/.test(line)) {
            if (inList) { result.push('</ul>'); inList = false; }
            line = line.replace(/^\s*[-\*]\s+\[ \]\s*(.*)$/, '<div class="mark-task-item"><input type="checkbox" disabled> <span>$1</span></div>');
            result.push(line);
            continue;
        }
        if (/^\s*[-\*]\s+\[[xX]\]/.test(line)) {
            if (inList) { result.push('</ul>'); inList = false; }
            line = line.replace(/^\s*[-\*]\s+\[[xX]\]\s*(.*)$/, '<div class="mark-task-item"><input type="checkbox" checked disabled> <span class="line-through">$1</span></div>');
            result.push(line);
            continue;
        }

        if (/^\s*[-\*]\s*(.+)$/.test(line)) {
            const content = line.replace(/^\s*[-\*]\s*(.+)$/, '$1');
            if (!inList) { result.push('<ul>'); inList = true; }
            result.push(`<li>${content}</li>`);
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
        if (/^<(h[1-6]|table|div|pre|ul|ol|blockquote)/i.test(trimmed)) {
            return p;
        }
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');
}

function generateTOCHTML(headers, minLevel) {
    if (!headers.length) return '';
    const filtered = headers.filter(h => h.level >= minLevel);
    if (!filtered.length) return '';

    let tocHTML = '<div class="mark-toc"><div class="mark-toc-title">Table of Contents</div><ul>';
    filtered.forEach(h => {
        const indent = (h.level - minLevel) * 1.2;
        tocHTML += `<li style="margin-left: ${indent}rem;"><a href="#${h.id}">${escapeHTML(h.title)}</a></li>`;
    });
    return tocHTML + '</ul></div>';
}

function updateStats(text) {
    if (!statChars || !statWords || !statLines) return;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;

    statChars.textContent = chars.toLocaleString();
    statWords.textContent = words.toLocaleString();
    statLines.textContent = lines.toLocaleString();
}

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    icon.className = document.documentElement.classList.contains('dark')
        ? 'fa-solid fa-sun text-yellow-400'
        : 'fa-solid fa-moon text-gray-600';
}

function switchMobileTab(tab) {
    const paneEditor = document.getElementById('pane-editor');
    const panePreview = document.getElementById('pane-preview');
    const tabEdit = document.getElementById('tab-edit');
    const tabPreview = document.getElementById('tab-preview');

    const isEdit = tab === 'edit';
    if (paneEditor) paneEditor.classList.toggle('hidden', !isEdit);
    if (panePreview) panePreview.classList.toggle('hidden', isEdit);

    const activeClass = 'flex-1 py-1.5 text-xs font-semibold rounded bg-white dark:bg-gray-700 shadow-sm text-center';
    const inactiveClass = 'flex-1 py-1.5 text-xs font-semibold rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 text-center';

    if (tabEdit) tabEdit.className = isEdit ? activeClass : inactiveClass;
    if (tabPreview) tabPreview.className = isEdit ? inactiveClass : activeClass;
}

function toggleHelpModal(show) {
    const modal = document.getElementById('help-modal');
    if (modal) modal.classList.toggle('hidden', !show);
}

function loadSampleMarkdown() {
    if (confirm("Are you sure you want to load the sample template? Your current text will be replaced.")) {
        markdownInput.value = DEFAULT_MARKDOWN;
        parseAndRender();
        showToast("Sample loaded successfully!");
    }
}

function clearEditor() {
    if (confirm("Are you sure you want to clear the editor?")) {
        markdownInput.value = '';
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        parseAndRender();
        showToast("Editor cleared");
    }
}

function triggerImport() {
    const fileInput = document.getElementById('file-import-input');
    if (fileInput) fileInput.click();
}

function handleFileImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

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
                showToast("Mark HTML imported & Markdown restored!");
            } else {
                const rendered = doc.querySelector('.mark-rendered') || doc.body;
                markdownInput.value = rendered ? (rendered.innerText || rendered.textContent || content) : content;
                showToast("HTML text imported successfully!");
            }
        } else {
            markdownInput.value = content;
            showToast("Markdown file imported!");
        }

        parseAndRender();
    };

    reader.onerror = () => showToast("Error reading file");
    reader.readAsText(file);
    event.target.value = '';
}

async function copyRenderedHTML() {
    const isDark = document.documentElement.classList.contains('dark');
    const safeRawMarkdown = escapeHTML(markdownInput.value).replace(/<\/script/gi, '<\\/script');
    
    const fullHTML = `<!DOCTYPE html>
<html lang="en" class="${isDark ? 'dark' : ''}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mark Exported Document</title>
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
<body class="bg-gray-100 text-gray-900 dark:bg-mark-bg dark:text-mark-text p-6 sm:p-10 min-h-screen transition-colors duration-200">
    <script type="text/template" id="mark-raw-markdown">${safeRawMarkdown}</script>
    <div class="fixed top-4 right-4 z-50">
        <button onclick="toggleExportDarkMode()" title="Toggle Dark/Light Mode" class="w-10 h-10 rounded-full bg-white dark:bg-mark-card border border-gray-200 dark:border-mark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md transition flex items-center justify-center">
            <i id="export-theme-icon" class="fa-solid ${isDark ? 'fa-sun text-yellow-400' : 'fa-moon text-gray-600'}"></i>
        </button>
    </div>
    <div class="max-w-4xl mx-auto mark-rendered">
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
        showToast("Full styled HTML copied to clipboard!");
    } catch (err) {
        showToast("Failed to copy HTML");
    }
}

function downloadMarkdown() {
    if (!markdownInput) return;
    const blob = new Blob([markdownInput.value], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mark-entry.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Markdown file downloaded!");
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