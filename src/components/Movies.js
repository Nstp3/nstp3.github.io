import { state, saveState } from '../state.js';
import { update }           from '../renderer.js';
import { t }                from '../i18n/translations.js';
import { ICONS }            from '../icons.js';

let currentFilter = 'planned'; // default — планирую

// ── Награды за просмотренные фильмы ──────────────────────
const FILM_LEVELS = [
  { min: 1000, key: 'film_diamond',  label: '💠' },
  { min:  750, key: 'film_purple',   label: '💜' },
  { min:  500, key: 'film_red',      label: '🔴' },
  { min:  250, key: 'film_green',    label: '💚' },
  { min:  100, key: 'film_platinum', label: '🏅' },
  { min:   50, key: 'film_gold',     label: '🥇' },
  { min:   25, key: 'film_silver',   label: '🥈' },
  { min:   10, key: 'film_bronze',   label: '🥉' },
];

export function getFilmAward() {
  if (!Array.isArray(state.movies)) return null;
  const watched = state.movies.filter(m => m.status === 'watched').length;
  for (const lvl of FILM_LEVELS) {
    if (watched >= lvl.min) return lvl;
  }
  return null;
}

function getNextFilmThreshold(watched) {
  const thresholds = [10, 25, 50, 100, 250, 500, 750, 1000];
  return thresholds.find(t => t > watched) || null;
}

function renderFilmProgress(watched) {
  const level = getFilmAward();
  const next  = getNextFilmThreshold(watched);

  let awardHtml = '';
  if (level) {
    const src = ICONS[level.key];
    awardHtml = src
      ? `<img src="${src}" style="width:28px;height:28px;object-fit:contain;vertical-align:middle;margin-right:4px;">`
      : `<span style="font-size:18px;margin-right:4px;">${level.label}</span>`;
  }

  let barHtml = '';
  if (next !== null) {
    const prevThreshold = level ? level.min : 0;
    const progress = Math.min(watched - prevThreshold, next - prevThreshold);
    const total    = next - prevThreshold;
    const blocks   = 10;
    const filled   = Math.round((progress / total) * blocks);
    const bar      = '🟩'.repeat(filled) + '⬜'.repeat(blocks - filled);
    const pct      = Math.round((watched / next) * 100);
    barHtml = `<span style="font-size:10px;font-family:var(--font-mono);color:var(--text2);">${bar}&nbsp;${watched}/${next}&nbsp;(${pct}%)</span>`;
  } else {
    barHtml = `<span style="font-size:11px;color:var(--green);font-family:var(--font-mono);">${watched} 🎬 MAX</span>`;
  }

  return `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">${awardHtml}${barHtml}</div>`;
}

export function renderMovies() {
  if (!Array.isArray(state.movies)) state.movies = [];

  const watched = state.movies.filter(m => m.status === 'watched').length;

  const filters = [
    { key: 'all',       label: t('filter_all') },
    { key: 'planned',   label: t('filter_planned') },
    { key: 'unwatched', label: t('filter_unwatched') },
    { key: 'watched',   label: t('filter_watched') },
    { key: 'favorite',  label: t('filter_favorite') },
  ];

  const filtered = currentFilter === 'all'
    ? state.movies
    : state.movies.filter(m => m.status === currentFilter);

  return `
    <div class="card" id="moviesCard">
      <!-- Заголовок + прогресс -->
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
        <div class="card-title" style="margin-bottom:0;">🎬 ${t('movies')}</div>
        <div>${renderFilmProgress(watched)}</div>
      </div>

      <!-- Форма добавления -->
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;">
        <div style="display:flex;gap:8px;">
          <input id="movieTitleInput" type="text" placeholder="${t('movie_title_placeholder')}"
            style="flex:1;background:var(--bg4);border:1px solid var(--border);border-radius:6px;padding:7px 10px;color:var(--text);font-size:13px;outline:none;">
          <label style="cursor:pointer;display:flex;align-items:center;justify-content:center;background:var(--bg4);border:1px solid var(--border);border-radius:6px;padding:7px 10px;color:var(--text2);font-size:13px;" title="Загрузить постер">
            + 🖼<input type="file" id="moviePosterFile" accept="image/*" style="display:none;">
          </label>
        </div>
        <div style="display:flex;gap:8px;">
          <input id="moviePosterInput" type="text" placeholder="${t('movie_poster_placeholder')}"
            style="flex:1;background:var(--bg4);border:1px solid var(--border);border-radius:6px;padding:7px 10px;color:var(--text);font-size:13px;outline:none;">
          <button id="addMovieBtn" style="background:var(--green);color:#000;border:none;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;">${t('movie_add')}</button>
        </div>
      </div>

      <!-- Фильтры -->
      <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;">
        ${filters.map(f => `
          <button class="movie-filter-btn" data-filter="${f.key}" style="
            background:${currentFilter === f.key ? 'var(--green)' : 'var(--bg4)'};
            color:${currentFilter === f.key ? '#000' : 'var(--text2)'};
            border:none;border-radius:6px;padding:4px 12px;font-size:12px;cursor:pointer;">
            ${f.label}
          </button>`).join('')}
      </div>

      <!-- Список -->
      ${filtered.length === 0
        ? `<p class="empty-hint">${t('movies_empty')}</p>`
        : `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            ${filtered.map(m => `
              <div class="movie-card" data-id="${m.id}" style="background:var(--bg3);border-radius:8px;overflow:hidden;">
                <div style="height:160px;background:var(--bg4);overflow:hidden;">
                  ${m.poster
                    ? `<img src="${m.poster}" alt="${m.title}" style="width:100%;height:100%;object-fit:cover;">`
                    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px;">🎬</div>`}
                </div>
                <div style="padding:6px;">
                  <div style="font-size:11px;font-weight:600;color:var(--text);margin-bottom:4px;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${m.title}</div>
                  <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    ${m.status !== 'planned'   ? `<button class="movie-status-btn" data-id="${m.id}" data-status="planned"   style="font-size:9px;padding:2px 5px;border:none;border-radius:4px;cursor:pointer;background:var(--bg4);color:var(--text2);">📋</button>` : `<span style="font-size:9px;padding:2px 5px;border-radius:4px;background:var(--blue);color:#fff;">📋</span>`}
                    ${m.status !== 'unwatched' ? `<button class="movie-status-btn" data-id="${m.id}" data-status="unwatched" style="font-size:9px;padding:2px 5px;border:none;border-radius:4px;cursor:pointer;background:var(--bg4);color:var(--text2);">👁</button>` : `<span style="font-size:9px;padding:2px 5px;border-radius:4px;background:var(--amber);color:#000;">👁</span>`}
                    ${m.status !== 'watched'   ? `<button class="movie-status-btn" data-id="${m.id}" data-status="watched"   style="font-size:9px;padding:2px 5px;border:none;border-radius:4px;cursor:pointer;background:var(--bg4);color:var(--text2);">✅</button>` : `<span style="font-size:9px;padding:2px 5px;border-radius:4px;background:var(--green);color:#000;">✅</span>`}
                    ${m.status !== 'favorite'  ? `<button class="movie-status-btn" data-id="${m.id}" data-status="favorite"  style="font-size:9px;padding:2px 5px;border:none;border-radius:4px;cursor:pointer;background:var(--bg4);color:var(--text2);">⭐</button>` : `<span style="font-size:9px;padding:2px 5px;border-radius:4px;background:var(--red);color:#fff;">⭐</span>`}
                    <button class="movie-del-btn" data-id="${m.id}" style="font-size:9px;padding:2px 5px;border:none;border-radius:4px;cursor:pointer;background:var(--bg4);color:var(--red);margin-left:auto;">✕</button>
                  </div>
                </div>
              </div>`).join('')}
          </div>`}
    </div>`;
}

export function bindMovies() {
  document.querySelectorAll('.movie-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => { currentFilter = btn.dataset.filter; update(); });
  });

  document.getElementById('moviePosterFile')?.addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const input = document.getElementById('moviePosterInput');
      if (input) input.value = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  const addBtn      = document.getElementById('addMovieBtn');
  const titleInput  = document.getElementById('movieTitleInput');
  const posterInput = document.getElementById('moviePosterInput');

  const doAdd = () => {
    const title = titleInput?.value.trim(); if (!title) return;
    state.movies.push({ id: Date.now(), title, poster: posterInput?.value.trim() || '', status: 'planned' });
    saveState();
    if (titleInput) titleInput.value = '';
    if (posterInput) posterInput.value = '';
    update();
  };

  addBtn?.addEventListener('click', doAdd);
  titleInput?.addEventListener('keydown', e => { if (e.key === 'Enter') doAdd(); });

  document.querySelectorAll('.movie-status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const movie = state.movies.find(m => m.id === +btn.dataset.id);
      if (movie) { movie.status = btn.dataset.status; saveState(); update(); }
    });
  });

  document.querySelectorAll('.movie-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.movies = state.movies.filter(m => m.id !== +btn.dataset.id);
      saveState(); update();
    });
  });
}
