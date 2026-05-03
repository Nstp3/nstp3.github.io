// ============================================================
// state.js — единый источник правды (IndexedDB)
// ============================================================

import { dbGet, dbSet } from './db.js';

const STORAGE_KEY = 'life_rpg_v2';   // старый ключ localStorage (для миграции)

export const defaultState = {
  profile: {
    name: 'Hero',
    avatar: '⚔️',
    level: 1,
    xp: 0,
  },
  stats: {
    Здоровье:     500,
    Настроение:   500,
    Выносливость: 500,
    Мотивация:    500,
  },
  skills: {
    'Тело':           50,
    'Разум':          40,
    'Продуктивность': 30,
    'Развлечения':    45,
    'Быт':            35,
    'Отдых':          55,
  },
  tasks:        [],
  taskHistory:  [],
  logs:         [],
  habits:       [],
  movies:       [],
  scEmbeds:     [],
  games:        [],
  scActive:     null,
  dailyXP:      0,
  dailyXPLimit: 1000,
  lang:         'ru',
  theme:        'dark',
  lastDate:     new Date().toDateString(),
};

function mergeState(saved) {
  if (!saved) return structuredClone(defaultState);
  return {
    ...defaultState,
    ...saved,
    profile:     { ...defaultState.profile,  ...saved.profile },
    stats:       { ...defaultState.stats,     ...saved.stats },
    skills:      { ...defaultState.skills },
    tasks:       Array.isArray(saved.tasks)       ? saved.tasks       : [],
    taskHistory: Array.isArray(saved.taskHistory) ? saved.taskHistory : [],
    logs:        Array.isArray(saved.logs)        ? saved.logs        : [],
    habits:      Array.isArray(saved.habits)      ? saved.habits      : [],
    movies:      Array.isArray(saved.movies)      ? saved.movies      : [],
    games:       Array.isArray(saved.games)       ? saved.games       : [],
    scEmbeds:    Array.isArray(saved.scEmbeds)    ? saved.scEmbeds    : [],
    scActive:    saved.scActive ?? null,
    lang:        saved.lang    || 'ru',
    theme:       saved.theme   || 'dark',
  };
}

// Переменная стейта — заполняется в initState()
export let state = structuredClone(defaultState);

// ── Миграция localStorage → IndexedDB ─────────────────────
function migrateFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    localStorage.removeItem(STORAGE_KEY);
    console.log('Migrated from localStorage → IndexedDB');
    return parsed;
  } catch {
    return null;
  }
}

// ── Инициализация: загрузить стейт до первого render() ────
export async function initState() {
  let saved = await dbGet();

  if (!saved) {
    saved = migrateFromLocalStorage();
    if (saved) await dbSet(saved);
  }

  state = mergeState(saved);

  // Сброс при новом дне
  const today = new Date().toDateString();
  if (state.lastDate !== today) {
    state.dailyXP  = 0;
    state.lastDate = today;
    state.stats    = { Здоровье: 500, Настроение: 500, Выносливость: 500, Мотивация: 500 };

    const hasRestTask = state.tasks.some(t => t.recurring && t.text === 'Отдых 1 час');
    if (!hasRestTask) {
      state.tasks.push({
        id: Date.now(), text: 'Отдых 1 час',
        done: false, category: 'Отдых', recurring: true,
      });
    }
    await dbSet(state);
  }
}

// ── Сохранение ────────────────────────────────────────────
export function saveState() {
  dbSet(state).catch(e => console.warn('IndexedDB save failed:', e));
}

// ── Экспорт / Импорт ──────────────────────────────────────
export function exportJSON() {
  return JSON.stringify(state, null, 2);
}

export function importJSON(json) {
  const parsed = JSON.parse(json);
  state = mergeState(parsed);
  saveState();
}
