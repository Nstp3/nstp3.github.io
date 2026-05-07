import { state, saveState } from '../state.js';
import { t } from '../i18n/translations.js';
import { ProgressBar } from '../ui/progressBar.js';
import { update } from '../renderer.js';
import { xpForLevel } from '../xp.js';
import { ICONS } from '../icons.js';

const TROPHY_LEVELS = [
  { min: 1000, key: 'trophy_legendary' },
  { min:  500, key: 'trophy_purple'    },
  { min:  250, key: 'trophy_platinum'  },
  { min:  100, key: 'trophy_gold'      },
  { min:   50, key: 'trophy_silver'    },
  { min:   10, key: 'trophy_bronze'    },
];

const FILM_LEVELS = [
  { min: 1000, key: 'film_diamond'  },
  { min:  750, key: 'film_purple'   },
  { min:  500, key: 'film_red'      },
  { min:  250, key: 'film_green'    },
  { min:  100, key: 'film_platinum' },
  { min:   50, key: 'film_gold'     },
  { min:   25, key: 'film_silver'   },
  { min:   10, key: 'film_bronze'   },
];

function getGameTrophy() {
  if (!Array.isArray(state.games)) return null;
  const completed = state.games.filter(g => g.status === 'completed').length;
  for (const lvl of TROPHY_LEVELS) { if (completed >= lvl.min) return lvl; }
  return null;
}

function getFilmAward() {
  if (!Array.isArray(state.movies)) return null;
  const watched = state.movies.filter(m => m.status === 'watched').length;
  for (const lvl of FILM_LEVELS) { if (watched >= lvl.min) return lvl; }
  return null;
}

function badgeImg(key, title) {
  const src = ICONS[key];
  return src
    ? `<img src="${src}" style="width:28px;height:28px;object-fit:contain;filter:drop-shadow(0 0 4px rgba(0,0,0,0.8));" title="${title}">`
    : '';
}

export function renderProfile() {
  const { name, avatar, level, xp, avatarUrl } = state.profile;
  const needed = xpForLevel(level);
  const bgStyle = avatarUrl
    ? `background-image:url('${avatarUrl}'); background-size:cover; background-position:center;`
    : `background:var(--bg4);`;

  const trophy = getGameTrophy();
  const film   = getFilmAward();

  // Собираем значки: сначала то что получено раньше по времени — нет точного timestamps,
  // поэтому просто: сначала игровой кубок, потом фильмовая награда
  const badges = [
    trophy ? badgeImg(trophy.key, 'Игровое достижение') : '',
    film   ? badgeImg(film.key,   'Кинодостижение')     : '',
  ].filter(Boolean).join('');

  const trophyHtml = badges;

  return `
    <div class="card card--profile" style="padding:0; overflow:hidden;">
      <label id="avatarLabel" style="display:block; position:relative; height:200px; cursor:pointer; ${bgStyle}">
        <input type="file" id="avatarInput" accept="image/*" style="display:none;">
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,transparent 50%);"></div>

        <!-- Имя + уровень + кубок в одной строке -->
        <div style="position:absolute;top:10px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:center;gap:6px;">
          <div style="display:flex;align-items:center;gap:6px;min-width:0;">
            <span id="editName" style="font-size:14px;font-weight:600;color:#fff;cursor:pointer;text-shadow:0 1px 4px rgba(0,0,0,0.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</span>
            ${trophyHtml}
          </div>
          <span id="editLevel" style="font-family:var(--font-mono);font-size:11px;color:var(--green);background:rgba(0,0,0,0.5);border:1px solid var(--border2);border-radius:4px;padding:2px 8px;cursor:pointer;flex-shrink:0;">LVL ${level}</span>
        </div>

        ${!avatarUrl ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40px;opacity:0.3;">${avatar}</div>` : ''}
        <div style="position:absolute;bottom:8px;right:10px;font-size:10px;color:rgba(255,255,255,0.4);font-family:var(--font-mono);">${t('photo')}</div>
      </label>
      <div style="padding:12px;">
        <div class="xp-section">
          <div class="xp-label">
            <span>${t('xp_label')}</span>
            <span class="mono">${xp} / ${needed}</span>
          </div>
          ${ProgressBar(xp, needed, 'green')}
        </div>
        <div class="xp-section" style="margin-top:10px">
          <div class="xp-label">
            <span class="label-muted">${t('daily_xp')}</span>
            <span class="mono label-muted">${state.dailyXP} / ${state.dailyXPLimit}</span>
          </div>
          ${ProgressBar(state.dailyXP, state.dailyXPLimit, 'amber')}
        </div>
      </div>
    </div>
  `;
}

export function bindProfile() {
  document.getElementById('editLevel')?.addEventListener('click', () => {
    const val = prompt(t('edit_level_prompt'), state.profile.level);
    if (val !== null && !isNaN(+val)) {
      state.profile.level = Math.max(1, Math.floor(+val));
      saveState(); update();
    }
  });
  document.getElementById('editName')?.addEventListener('click', () => {
    const val = prompt(t('edit_name_prompt'), state.profile.name);
    if (val?.trim()) { state.profile.name = val.trim(); saveState(); update(); }
  });
  document.getElementById('avatarInput')?.addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { state.profile.avatarUrl = ev.target.result; saveState(); update(); };
    reader.readAsDataURL(file);
  });
}
