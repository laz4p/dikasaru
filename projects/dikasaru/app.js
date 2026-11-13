(() => {
'use strict';
const statuses = {
  watched: 'Посмотрел',
  watching: 'Смотрю',
  dropped: 'Забросил',
  planned: 'Планирую посмотреть',
};

function normalize(value) {
  return value.normalize('NFKD').toLowerCase().replace(/ё/g, 'е')
    .replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function createIndex(data) {
  return data.map(([id, ru, original, year, rank, aliases]) => ({
    id, title: ru || original, original, year, rank,
    names: [...new Set([ru, original, ...aliases].filter(Boolean).map(normalize))],
    primary: normalize(ru || original),
    romanized: normalize(original),
  }));
}

function search(index, raw, limit = 16) {
  const query = normalize(raw);
  if (query.length < 2) return [];
  const matches = [];
  for (const item of index) {
    let best = 99;
    for (const name of item.names) {
      const primary = name === item.primary || name === item.romanized;
      const at = name.indexOf(query);
      const match = name === query ? 0 : at === 0 ? (name[query.length] === ' ' ? 2 : 3) : at > 0 ? (name[at - 1] === ' ' ? 5 : 7) : 99;
      const weight = primary ? 0 : 1;
      if (match < 99) best = Math.min(best, match + weight);
      if (best === 0) break;
    }
    if (best < 99) matches.push({ item, best });
  }
  const relevance = item => item.rank - item.primary.length * 6;
  return matches.sort((a, b) => a.best - b.best || relevance(b.item) - relevance(a.item) || a.item.year - b.item.year || a.item.id - b.item.id)
    .slice(0, limit).map(({ item }) => item);
}

const validScore = n => Number.isInteger(n) && n >= 1 && n <= 10;
const validStatus = status => typeof status === 'string' && Object.hasOwn(statuses, status);
function clean(row) {
  if (!Number.isSafeInteger(row?.id) || row.id < 1 || typeof row.title !== 'string' || !row.title.trim()) return null;
  return {
    id: row.id, title: row.title.trim().slice(0, 400),
    original: typeof row.original === 'string' ? row.original.slice(0, 400) : '',
    year: Number.isInteger(row.year) && row.year >= 1900 && row.year <= 2200 ? row.year : 0,
    score: validScore(row.score) ? row.score : null,
    status: validStatus(row.status) ? row.status : 'watched',
  };
}
function restore(raw) {
  try {
    const entries = JSON.parse(raw);
    if (!Array.isArray(entries)) return [];
    return [...new Map(entries.map(clean).filter(Boolean).map(row => [row.id, row])).values()];
  } catch {
    return [];
  }
}
function add(list, item) {
  const row = clean(item);
  return row && !list.some(({ id }) => id === row.id) ? [...list, row] : list;
}
function update(list, id, patch) {
  return list.map(row => row.id !== id ? row : {
    ...row,
    score: patch.score === null || validScore(patch.score) ? patch.score : row.score,
    status: validStatus(patch.status) ? patch.status : row.status,
  });
}
function byStatus(list, status) {
  return status === 'all' ? list : list.filter(row => row.status === status);
}
function partition(rows, maximum) {
  const count = Math.max(1, Math.min(maximum, Math.ceil(rows.length / 6)));
  return Array.from({ length: count }, (_, index) => {
    const width = Math.floor(rows.length / count);
    const extra = rows.length % count;
    const start = index * width + Math.min(index, extra);
    return rows.slice(start, start + width + Number(index < extra));
  });
}



function copyText(list) {
  return list.map(row => row.title + ' — ' + (row.score ? row.score + '/10' : 'без оценки')).join('\n');
}

function groupedText(list) {
  return [['all', 'Все'], ...Object.entries(statuses)].map(([key, label]) => {
    const titles = byStatus(list, key).map(row => row.title);
    return ['///' + label.toLowerCase() + '///', ...titles].join('\n');
  }).join('\n\n') + '\n';
}

const $ = id => document.getElementById(id);
const shape = {
  star: '<path d="m16 2 4.15 8.6 9.5 1.2-6.9 6.7 1.8 9.5L16 23.4 7.45 28l1.8-9.5-6.9-6.7 9.5-1.2Z"/>',
  folder: '<path d="M3 7.5a1.5 1.5 0 0 1 1.5-1.5H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5Z"/><path d="M3 10h18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
};
function node(tag, className = '', text = '') {
  const element = document.createElement(tag);
  element.className = className;
  if (text) element.textContent = text;
  return element;
}
function button(className, label, icon) {
  const el = node('button', className);
  el.type = 'button';
  el.setAttribute('aria-label', label);
  if (icon) {
    el.title = label;
    el.innerHTML = '<svg aria-hidden="true" viewBox="' + (icon === 'star' ? '0 0 32 32' : '0 0 24 24') + '">' + shape[icon] + '</svg>';
  }
  return el;
}
const storageKey = 'dikasaru-library-v1';
let list = [];
try { list = restore(localStorage.getItem(storageKey)); }
catch { $('storage-warning').hidden = false; }
let filter = 'all';
let recent = 0;
let index;
let loadPromise;
let searchTimer;
let searchToken = 0;
let opener;
let activeRow;
const panel = $('search-panel');
const input = $('query');
const menu = $('row-menu');
const mid = matchMedia('(min-width: 680px)');
const wide = matchMedia('(min-width: 1180px)');
const searchButtons = [$('search-toggle'), $('search-plus')];
for (const [i, char] of [...'dikasaru'].entries()) {
  const letter = node('span', '', char);
  letter.setAttribute('aria-hidden', 'true');
  letter.style.setProperty('--i', i);
  if (!i) $('wordmark').textContent = '';
  $('wordmark').append(letter);
}
function announce(text) { $('announcement').textContent = text; }
function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(list));
    $('storage-warning').hidden = true;
  } catch {
    $('storage-warning').hidden = false;
  }
}
function setFilter(value) {
  filter = value;
  for (const el of $('filters').querySelectorAll('button')) {
    el.setAttribute('aria-pressed', String(el.dataset.filter === filter));
  }
  renderLibrary();
}
function renderLibrary() {
  closeRowMenu(false);
  const items = byStatus(list, filter);
  $('count').textContent = String(items.length).padStart(2, '0');
  $('empty').hidden = Boolean(items.length);
  $('empty-title').textContent = list.length ? 'В этой папке пока пусто' : 'Список пока пуст';
  $('empty-search').hidden = Boolean(list.length);
  const columns = partition(items, wide.matches ? 3 : mid.matches ? 2 : 1);
  $('library').style.setProperty('--columns', columns.length);
  $('library').replaceChildren(...columns.map(group => {
    const column = node('ul', 'column');
    for (const item of group) {
      const row = node('li', 'entry' + (recent === item.id ? ' is-new' : ''));
      const words = node('div', 'entry-text');
      words.append(node('span', 'entry-title', item.title));
      if (item.status !== 'watched') words.append(node('small', '', statuses[item.status]));
      const actions = node('div', 'row-actions');
      const star = button('square score', item.title + ': ' + (item.score ? 'оценка ' + item.score + ' из 10' : 'поставить оценку'), 'star');
      star.dataset.rated = String(Boolean(item.score));
      if (item.score) star.append(node('span', 'score-number', String(item.score)));
      const folder = button('square folder', item.title + ': ' + statuses[item.status] + ', изменить статус', 'folder');
      folder.dataset.default = String(item.status === 'watched');
      for (const [control, kind] of [[star, 'score'], [folder, 'status']]) {
        control.id = kind + '-' + item.id;
        control.setAttribute('aria-expanded', 'false');
        control.setAttribute('aria-controls', menu.id);
        control.addEventListener('click', () => openRowMenu(control, item, kind));
      }
      actions.append(star, folder);
      row.append(words, actions);
      column.append(row);
    }
    return column;
  }));
  recent = 0;
}
function closeRowMenu(refocus) {
  if (!menu.matches(':popover-open')) return;
  const anchor = activeRow;
  menu.hidePopover();
  anchor?.setAttribute('aria-expanded', 'false');
  if (refocus) anchor?.focus();
  activeRow = null;
}
function openRowMenu(anchor, item, kind) {
  if (activeRow === anchor && menu.matches(':popover-open')) return closeRowMenu(true);
  closeSearch(false);
  closeRowMenu(false);
  activeRow = anchor;
  anchor.setAttribute('aria-expanded', 'true');
  const scoring = kind === 'score';
  const label = scoring ? 'Оценка от 1 до 10' : 'Статус просмотра';
  const title = node('h2', '', label);
  title.id = 'options-title';
  const options = node('div', scoring ? 'score-options' : 'status-options');
  options.setAttribute('role', 'group');
  options.setAttribute('aria-labelledby', title.id);
  function apply(value) {
    list = update(list, item.id, { [kind]: value });
    persist();
    renderLibrary();
    ($(anchor.id) ?? $('filters').querySelector('[aria-pressed="true"]')).focus();
    announce(scoring ? (value ? 'Оценка: ' + value + ' из 10' : 'Оценка снята') : 'Статус: ' + statuses[value]);
  }
  const choices = scoring ? Array.from({ length: 10 }, (_, i) => [i + 1, i + 1]) : Object.entries(statuses);
  for (const [value, caption] of choices) {
    const option = button('', String(caption));
    option.textContent = caption;
    option.setAttribute('aria-pressed', String(item[kind] === value));
    option.addEventListener('click', () => apply(value));
    options.append(option);
  }
  menu.replaceChildren(title, options);
  if (scoring && item.score) {
    const reset = button('reset-score', 'Снять оценку');
    reset.textContent = 'Снять оценку';
    reset.addEventListener('click', () => apply(null));
    menu.append(reset);
  }
  menu.showPopover();
  positionMenu();
  (options.querySelector('[aria-pressed="true"]') || options.firstElementChild).focus({ preventScroll: true });
}
function positionMenu() {
  if (!activeRow || !menu.matches(':popover-open')) return;
  const rect = activeRow.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > innerHeight) return closeRowMenu(false);
  const left = Math.max(12, Math.min(innerWidth - menu.offsetWidth - 12, rect.right - menu.offsetWidth));
  const y = rect.bottom + 5 + menu.offsetHeight <= innerHeight - 8
    ? rect.bottom + 5
    : Math.max(8, rect.top - menu.offsetHeight - 5);
  menu.style.left = left + 'px';
  menu.style.top = y + 'px';
}
menu.addEventListener('toggle', () => {
  if (!menu.matches(':popover-open') && activeRow) {
    activeRow.setAttribute('aria-expanded', 'false');
    activeRow = null;
  }
});
menu.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  event.preventDefault();
  closeRowMenu(true);
});
window.addEventListener('scroll', positionMenu, { passive: true });
window.addEventListener('resize', positionMenu);
for (const mq of [mid, wide]) mq.addEventListener('change', renderLibrary);
$('filters').addEventListener('click', event => {
  const el = event.target.closest('[data-filter]');
  if (el) setFilter(el.dataset.filter);
});
function loadIndex() {
  if (index) return Promise.resolve(index);
  loadPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'catalog.js';
    script.onload = () => {
      try {
        index = createIndex(globalThis.DIKASARU_CATALOG);
        delete globalThis.DIKASARU_CATALOG;
        resolve(index);
      } catch (error) { reject(error); }
      script.remove();
    };
    script.onerror = () => { script.remove(); reject(new Error('catalog unavailable')); };
    document.head.append(script);
  }).catch(error => { loadPromise = null; throw error; });
  return loadPromise;
}
function openSearch(trigger) {
  closeRowMenu(false);
  opener = trigger;
  panel.hidden = false;
  searchButtons.forEach(el => el.setAttribute('aria-expanded', 'true'));
  input.focus();
  refreshSearch();
  loadIndex().catch(() => {});
}
function closeSearch(refocus) {
  if (panel.hidden) return;
  panel.hidden = true;
  ++searchToken;
  clearTimeout(searchTimer);
  searchButtons.forEach(el => el.setAttribute('aria-expanded', 'false'));
  if (refocus) (opener?.offsetParent ? opener : $('search-toggle')).focus();
}
function renderResults(results) {
  const added = new Set(list.map(({ id }) => id));
  $('results').replaceChildren(...results.map(item => {
    const row = node('li', 'result');
    const text = node('div', '', item.title);
    const detail = [item.original !== item.title ? item.original : '', item.year].filter(Boolean).join(' · ');
    if (detail) text.append(node('small', '', detail));
    const exists = added.has(item.id);
    const control = button('square', (exists ? 'Уже в списке: ' : 'Добавить: ') + item.title, exists ? 'check' : 'plus');
    control.disabled = exists;
    control.addEventListener('click', () => {
      list = add(list, item);
      recent = item.id;
      persist();
      if (filter !== 'all' && filter !== 'watched') setFilter('all');
      else renderLibrary();
      announce('Добавлено: ' + item.title);
      closeSearch(false);
      $('search-toggle').focus();
    });
    row.append(text, control);
    return row;
  }));
}
async function refreshSearch() {
  const query = input.value;
  const token = ++searchToken;
  const hint = $('search-hint');
  if (normalize(query).length < 2) {
    $('results').replaceChildren();
    hint.textContent = query ? 'Введите ещё один символ' : 'По-русски, по-английски или ромадзи';
    return;
  }
  if (!index) hint.textContent = 'Загружаю каталог…';
  try {
    const catalog = await loadIndex();
    if (token !== searchToken || panel.hidden || query !== input.value) return;
    const results = search(catalog, query);
    renderResults(results);
    hint.textContent = results.length ? 'Результаты поиска' : 'Ничего не найдено. Попробуйте другое написание.';
  } catch {
    if (token === searchToken) hint.textContent = 'Каталог не загрузился. Откройте поиск ещё раз.';
  }
}
input.addEventListener('input', () => {
  ++searchToken;
  $('results').replaceChildren();
  clearTimeout(searchTimer);
  searchTimer = setTimeout(refreshSearch, 105);
});
input.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') {
    const first = $('results').querySelector('button:enabled');
    if (first) { event.preventDefault(); first.focus(); }
  }
});
$('results').addEventListener('keydown', event => {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
  const buttons = [...$('results').querySelectorAll('button:enabled')];
  const next = buttons[buttons.indexOf(event.target) + (event.key === 'ArrowDown' ? 1 : -1)];
  if (next || event.key === 'ArrowUp') {
    event.preventDefault();
    (next || input).focus();
  }
});
for (const control of [...searchButtons, $('empty-search')]) {
  control.addEventListener('click', () => panel.hidden ? openSearch(control) : closeSearch(true));
}
$('close-search').addEventListener('click', () => closeSearch(true));
document.addEventListener('pointerdown', event => {
  if (!panel.hidden && !event.target.closest('.search-area, #empty-search')) closeSearch(false);
});
document.addEventListener('keydown', event => {
  if (event.defaultPrevented) return;
  if (event.key === 'Escape' && !panel.hidden) closeSearch(true);
  if (event.key === '/' && !event.altKey && !event.ctrlKey && !event.metaKey && !event.target.closest('input, textarea, [contenteditable]')) {
    event.preventDefault();
    openSearch($('search-toggle'));
  }
});
renderLibrary();

const exportMenu = $('export-menu');
const exportToggle = $('export-toggle');
const exportFeedback = $('export-feedback');
const exportChoices = [...exportMenu.querySelectorAll('[data-export]')];
function positionExport() {
  if (!exportMenu.matches(':popover-open')) return;
  const rect = exportToggle.getBoundingClientRect();
  exportMenu.style.left = Math.max(12, rect.right - exportMenu.offsetWidth) + 'px';
  exportMenu.style.top = Math.max(8, rect.top - exportMenu.offsetHeight - 8) + 'px';
}
exportToggle.addEventListener('click', () => {
  closeSearch(false);
  closeRowMenu(false);
  exportFeedback.textContent = '';
  $('export-empty').hidden = list.length > 0;
  for (const choice of exportChoices) choice.disabled = !list.length;
});
exportMenu.addEventListener('beforetoggle', event => {
  exportToggle.setAttribute('aria-expanded', String(event.newState === 'open'));
});
exportMenu.addEventListener('toggle', positionExport);
window.addEventListener('resize', positionExport);
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = node('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function wrapTitle(ctx, title, width) {
  const lines = [];
  let line = '';
  for (const word of title.split(/\s+/)) {
    const candidate = line ? line + ' ' + word : word;
    if (ctx.measureText(candidate).width <= width) { line = candidate; continue; }
    if (line) lines.push(line);
    line = '';
    for (const char of word) {
      if (line && ctx.measureText(line + char).width > width) { lines.push(line); line = ''; }
      line += char;
    }
  }
  if (line) lines.push(line);
  return lines;
}
async function exportPng(rows) {
  await document.fonts?.ready;
  const canvas = node('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  const font = '"Pixelify Sans", "Courier New", monospace';
  const colWidth = 430, gap = 24, padding = 24, top = 104;
  const cols = partition(rows, rows.length > 300 ? 4 : rows.length > 60 ? 3 : rows.length > 16 ? 2 : 1);
  ctx.font = '19px ' + font;
  const blocks = cols.map(col => col.map(row => {
    const lines = wrapTitle(ctx, row.title, colWidth - 85);
    return { row, lines, height: 35 + lines.length * 23 };
  }));
  const width = padding * 2 + cols.length * colWidth + (cols.length - 1) * gap;
  const height = top + padding + Math.max(...blocks.map(col => col.reduce((total, block) => total + block.height, 0)));
  const scale = Math.min(2, 16384 / Math.max(width, height), Math.sqrt(20000000 / (width * height)));
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#fcfcf7';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ddddd5';
  ctx.fillRect(0, 0, width, 44);
  ctx.strokeStyle = '#77776c';
  ctx.strokeRect(.5, .5, width - 1, height - 1);
  ctx.fillRect(0, 44, width, 1);
  ctx.fillStyle = '#232320';
  ctx.textBaseline = 'middle';
  ctx.font = '19px ' + font;
  ctx.fillText('Лист просмотренных аниме', padding, 22);
  ctx.textAlign = 'right';
  ctx.fillText('dikasaru', width - padding, 22);
  ctx.textAlign = 'left';
  ctx.font = '26px ' + font;
  ctx.fillText('Мой список (' + rows.length + ')', padding, 75);
  for (const [index, column] of blocks.entries()) {
    const x = padding + index * (colWidth + gap);
    let y = top;
    for (const { row, lines, height: rowHeight } of column) {
      ctx.fillStyle = '#b2b2a7';
      ctx.fillRect(x, y, colWidth, 1);
      ctx.font = '19px ' + font;
      ctx.fillStyle = '#232320';
      lines.forEach((line, i) => ctx.fillText(line, x + 4, y + 19 + i * 23));
      ctx.textAlign = 'right';
      ctx.fillText(row.score ? row.score + '/10' : '—', x + colWidth - 4, y + 19);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#55554e';
      ctx.font = '15px ' + font;
      ctx.fillText(statuses[row.status], x + 4, y + rowHeight - 15);
      y += rowHeight;
    }
    ctx.fillStyle = '#b2b2a7';
    ctx.fillRect(x, y, colWidth, 1);
  }
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('image unavailable');
  download(blob, 'dikasaru-anime.png');
}
async function copyList(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const dialog = $('copy-dialog');
    const value = $('copy-value');
    value.value = text;
    dialog.showModal();
    value.select();
    return false;
  }
}
exportMenu.addEventListener('click', async event => {
  const choice = event.target.closest('[data-export]');
  if (!choice || !list.length) return;
  const snapshot = list.slice();
  exportMenu.hidePopover();
  exportToggle.focus();
  try {
    if (choice.dataset.export === 'copy') {
      if (await copyList(copyText(snapshot))) exportFeedback.textContent = 'Список скопирован';
    } else if (choice.dataset.export === 'txt') {
      const content = groupedText(snapshot).replace(/\n/g, '\r\n');
      download(new Blob(['\uFEFF', content], { type: 'text/plain;charset=utf-8' }), 'dikasaru-anime.txt');
      exportFeedback.textContent = 'TXT готов';
    } else {
      exportFeedback.textContent = 'Готовлю снимок…';
      await exportPng(snapshot);
      exportFeedback.textContent = 'Снимок готов';
    }
  } catch {
    exportFeedback.textContent = 'Не удалось сохранить список. Попробуйте ещё раз.';
  }
});

})();
