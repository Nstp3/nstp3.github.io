// ============================================================
// components/Games.js — блок с играми
// ============================================================

import { state, saveState } from '../state.js';
import { update }           from '../renderer.js';
import { t }                from '../i18n/translations.js';
import { ICONS }            from '../icons.js';

let currentFilter = 'planned'; // default — планирую

// ── Кубки: пороги и иконки ────────────────────────────────
const TROPHY_LEVELS = [
  { min: 1000, key: 'trophy_legendary', label: '👑' },
  { min:  500, key: 'trophy_purple',    label: '💜' },
  { min:  250, key: 'trophy_platinum',  label: '💎' },
  { min:  100, key: 'trophy_gold',      label: '🥇' },
  { min:   50, key: 'trophy_silver',    label: '🥈' },
  { min:   10, key: 'trophy_bronze',    label: '🥉' },
];

// Найти текущий уровень кубка
function getTrophyLevel(completed) {
  for (const lvl of TROPHY_LEVELS) {
    if (completed >= lvl.min) return lvl;
  }
  return null;
}

// Следующий порог после текущего
function getNextThreshold(completed) {
  const thresholds = [10, 50, 100, 250, 500, 1000];
  return thresholds.find(t => t > completed) || null;
}

// ── Прогресс-шкала ────────────────────────────────────────
function renderProgress(completed) {
  const level = getTrophyLevel(completed);
  const next  = getNextThreshold(completed);

  // Иконка кубка или эмодзи
  let trophyHtml = '';
  if (level) {
    const src = ICONS[level.key];
    trophyHtml = src
      ? `<img src="${src}" style="width:28px;height:28px;object-fit:contain;vertical-align:middle;margin-right:4px;">`
      : `<span style="font-size:18px;margin-right:4px;">${level.label}</span>`;
  }

  // Шкала
  let barHtml = '';
  if (next !== null) {
    const prevThreshold = level ? level.min : 0;
    const progress = Math.min(completed - prevThreshold, next - prevThreshold);
    const total    = next - prevThreshold;
    const blocks   = 10;
    const filled   = Math.round((progress / total) * blocks);
    const bar      = '🟩'.repeat(filled) + '⬜'.repeat(blocks - filled);
    const pct      = Math.round((completed / next) * 100);
    barHtml = `
      <span style="font-size:10px;font-family:var(--font-mono);color:var(--text2);">
        ${bar}&nbsp;${completed}/${next}&nbsp;(${pct}%)
      </span>`;
  } else {
    barHtml = `<span style="font-size:11px;color:var(--green);font-family:var(--font-mono);">${completed} 🎮 MAX</span>`;
  }

  return `
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
      ${trophyHtml}
      ${barHtml}
    </div>`;
}

// ── Render ─────────────────────────────────────────────────
export function renderGames() {
  if (!Array.isArray(state.games)) state.games = [];

  const completed = state.games.filter(g => g.status === 'completed').length;

  const filters = [
    { key: 'all',       label: `🗂️ ${t('games_filter_all')}` },
    { key: 'planned',   label: `⏳ ${t('games_filter_planned')}` },
    { key: 'completed', label: `🏆 ${t('games_filter_completed')}` },
  ];

  const filtered = currentFilter === 'all'
    ? state.games
    : state.games.filter(g => g.status === currentFilter);

  return `
    <div class="card" id="gamesCard">

      <!-- Заголовок + прогресс -->
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
        <div class="card-title" style="margin-bottom:0;">🎮 ${t('games')}</div>
        <div>${renderProgress(completed)}</div>
      </div>

      <!-- Форма добавления -->
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;">
        <!-- Строка 1: название + загрузить обложку -->
        <div style="display:flex;gap:8px;">
          <input
            id="gameTitleInput"
            type="text"
            placeholder="${t('game_title_placeholder')}"
            style="flex:1;background:var(--bg4);border:1px solid var(--border);border-radius:6px;padding:7px 10px;color:var(--text);font-size:13px;outline:none;"
          >
          <label style="cursor:pointer;display:flex;align-items:center;justify-content:center;background:var(--bg4);border:1px solid var(--border);border-radius:6px;padding:7px 10px;color:var(--text2);font-size:13px;white-space:nowrap;" title="${t('game_cover_upload')}">
            + 🖼
            <input type="file" id="gameCoverFile" accept="image/*" style="display:none;">
          </label>
        </div>
        <!-- Строка 2: ссылка на обложку -->
        <input
          id="gameCoverInput"
          type="text"
          placeholder="${t('game_cover_placeholder')}"
          style="background:var(--bg4);border:1px solid var(--border);border-radius:6px;padding:7px 10px;color:var(--text);font-size:13px;outline:none;"
        >
        <!-- Строка 3: ссылка на игру + кнопка -->
        <div style="display:flex;gap:8px;">
          <input
            id="gameUrlInput"
            type="text"
            placeholder="${t('game_url_placeholder')}"
            style="flex:1;background:var(--bg4);border:1px solid var(--border);border-radius:6px;padding:7px 10px;color:var(--text);font-size:13px;outline:none;"
          >
          <button id="addGameBtn" style="background:var(--green);color:#000;border:none;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;">${t('game_add')}</button>
        </div>
      </div>

      <!-- Фильтры -->
      <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;">
        ${filters.map(f => `
          <button class="game-filter-btn" data-filter="${f.key}" style="
            background:${currentFilter === f.key ? 'var(--green)' : 'var(--bg4)'};
            color:${currentFilter === f.key ? '#000' : 'var(--text2)'};
            border:none;border-radius:6px;padding:4px 12px;font-size:12px;cursor:pointer;
          ">${f.label}</button>
        `).join('')}
      </div>

      <!-- Список игр -->
      ${filtered.length === 0
        ? `<p class="empty-hint">${t('games_empty')}</p>`
        : `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            ${filtered.map(g => `
              <div class="game-card" data-id="${g.id}" style="background:var(--bg3);border-radius:8px;overflow:hidden;position:relative;">
                <!-- Обложка -->
                <div style="height:160px;background:var(--bg4);overflow:hidden;">
                  ${g.cover
                    ? `<img src="${g.cover}" alt="${g.title}" style="width:100%;height:100%;object-fit:cover;">`
                    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px;">🎮</div>`
                  }
                </div>
                <!-- Инфо -->
                <div style="padding:6px;">
                  <!-- Название + ссылка -->
                  <div style="font-size:11px;font-weight:600;color:var(--text);margin-bottom:4px;line-height:1.3;">
                    ${g.title}
                    ${g.url ? `<a href="${g.url}" target="_blank" rel="noopener" style="font-size:9px;color:var(--green);text-decoration:none;margin-left:4px;font-weight:400;">[тык]</a>` : ''}
                  </div>
                  <!-- Кнопки статуса -->
                  <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    ${g.status !== 'planned'   ? `<button class="game-status-btn" data-id="${g.id}" data-status="planned"   style="font-size:9px;padding:2px 5px;border:none;border-radius:4px;cursor:pointer;background:var(--bg4);color:var(--text2);">⏳</button>` : `<span style="font-size:9px;padding:2px 5px;border-radius:4px;background:var(--blue);color:#fff;">⏳</span>`}
                    ${g.status !== 'completed' ? `<button class="game-status-btn" data-id="${g.id}" data-status="completed" style="font-size:9px;padding:2px 5px;border:none;border-radius:4px;cursor:pointer;background:var(--bg4);color:var(--text2);">🏆</button>` : `<span style="font-size:9px;padding:2px 5px;border-radius:4px;background:var(--green);color:#000;">🏆</span>`}
                    <button class="game-del-btn" data-id="${g.id}" style="font-size:9px;padding:2px 5px;border:none;border-radius:4px;cursor:pointer;background:var(--bg4);color:var(--red);margin-left:auto;">✕</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>`
      }
    </div>
  `;
}

// ── Bind ───────────────────────────────────────────────────
export function bindGames() {
  // Фильтры
  document.querySelectorAll('.game-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      update();
    });
  });

  // Загрузка обложки файлом
  document.getElementById('gameCoverFile')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const input = document.getElementById('gameCoverInput');
      if (input) input.value = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Добавить игру
  const addBtn     = document.getElementById('addGameBtn');
  const titleInput = document.getElementById('gameTitleInput');
  const coverInput = document.getElementById('gameCoverInput');
  const urlInput   = document.getElementById('gameUrlInput');

  const doAdd = () => {
    const title = titleInput?.value.trim();
    if (!title) return;
    if (!Array.isArray(state.games)) state.games = [];
    state.games.push({
      id:     Date.now(),
      title,
      cover:  coverInput?.value.trim() || '',
      url:    urlInput?.value.trim()   || '',
      status: 'planned',
    });
    saveState();
    if (titleInput) titleInput.value = '';
    if (coverInput) coverInput.value = '';
    if (urlInput)   urlInput.value   = '';
    update();
  };

  addBtn?.addEventListener('click', doAdd);
  titleInput?.addEventListener('keydown', e => { if (e.key === 'Enter') doAdd(); });

  // Смена статуса
  document.querySelectorAll('.game-status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id   = +btn.dataset.id;
      const game = state.games.find(g => g.id === id);
      if (game) { game.status = btn.dataset.status; saveState(); update(); }
    });
  });

  // Удалить игру
  document.querySelectorAll('.game-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.dataset.id;
      state.games = state.games.filter(g => g.id !== id);
      saveState();
      update();
    });
  });
}
