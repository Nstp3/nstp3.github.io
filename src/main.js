import { t } from './i18n/translations.js';
import { state, saveState, exportJSON, importJSON, initState } from './state.js';
import { render } from './renderer.js';
import { setI18nState } from './i18n/translations.js';
import { THEMES } from './themes.js';
import { ICONS } from './icons.js';
import { requestNotificationPermission, scheduleDailyReminder } from './notifications.js';

const THEME_ICON_MAP = {
  dark:   'ic-theme-dark',
  ac:     'ic-theme-ac',
  mythic: 'ic-theme-mythic',
};

// ── Старт приложения ──────────────────────────────────────
async function boot() {
  await initState();
  setI18nState(state);
  applyTheme(state.theme || 'dark');
  render();
  initThemeDropdown();
  updateDropdownIcons();

  // Запрашиваем разрешение на уведомления (только если ещё не решено)
  if ('Notification' in window && Notification.permission === 'default') {
    // Небольшая задержка чтобы не пугать пользователя сразу при открытии
    setTimeout(() => requestNotificationPermission(), 3000);
  }

  // Планируем ежедневное напоминание на 20:00
  scheduleDailyReminder(state);
}

boot();

// ── Экспорт ───────────────────────────────────────────────
document.getElementById('btnExport')?.addEventListener('click', () => {
  const blob = new Blob([exportJSON()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'razl-backup.json';
  a.click();
});

// ── Импорт ────────────────────────────────────────────────
document.getElementById('btnImport')?.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        importJSON(ev.target.result);
        applyTheme(state.theme || 'dark');
        render();
        updateDropdownIcons();
      } catch { alert(t('import_error')); }
    };
    reader.readAsText(file);
  };
  input.click();
});

// ── Язык ──────────────────────────────────────────────────
document.getElementById('btnLang')?.addEventListener('click', () => {
  state.lang = state.lang === 'ru' ? 'en' : 'ru';
  saveState(); render();
});

// ── Иконки дропдауна ──────────────────────────────────────
function updateDropdownIcons() {
  const current = state.theme || 'dark';
  const mainImg = document.getElementById('themeIconImg');
  if (mainImg) mainImg.src = ICONS[THEME_ICON_MAP[current]] || '';

  document.querySelectorAll('.theme-opt-img').forEach(img => {
    img.src = ICONS[img.dataset.key] || '';
  });
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.toggle('theme-option--active', btn.dataset.theme === current);
  });
}
window.__updateDropdownIcons = updateDropdownIcons;

// ── Dropdown темы ─────────────────────────────────────────
function initThemeDropdown() {
  const btn      = document.getElementById('btnTheme');
  const dropdown = document.getElementById('themeDropdown');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.toggle('theme-dropdown--open');
  });

  dropdown.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', e => {
      e.stopPropagation();
      applyTheme(opt.dataset.theme);
      render();
      updateDropdownIcons();
      dropdown.classList.remove('theme-dropdown--open');
    });
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('theme-dropdown--open');
  });
}

// ── Тема ──────────────────────────────────────────────────
export function applyTheme(themeName) {
  const def = THEMES[themeName] || THEMES.dark;
  document.body.dataset.theme = def.bodyClass || '';
  state.theme = themeName;
  saveState();
}

window.__themeToggle = function () {
  const next = THEMES[state.theme || 'dark']?.next || 'dark';
  applyTheme(next);
  render();
  updateDropdownIcons();
};
