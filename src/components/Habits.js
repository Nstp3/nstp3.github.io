import { state, saveState } from '../state.js';
import { addXP, XP_PER_HABIT } from '../xp.js';
import { showToast } from '../ui/toast.js';
import { update } from '../renderer.js';
import { t } from '../i18n/translations.js';

function ensureHabits() { if (!Array.isArray(state.habits)) state.habits = []; }
function todayDay()    { return new Date().getDate(); }
function isMobile()    { return window.innerWidth <= 600; }
function daysInMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}
function monthStartDow() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  return (d + 6) % 7;
}

const DOW_LABELS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

// Какие привычки развёрнуты (по индексу)
// На мобиле все развёрнуты по умолчанию, на десктопе — свёрнуты
const expandedSet = new Set();
let expandedInitialized = false;

function initExpanded() {
  if (expandedInitialized) return;
  expandedInitialized = true;
  if (isMobile()) {
    // Мобиле — все развёрнуты
    ensureHabits();
    state.habits.forEach((_, i) => expandedSet.add(i));
  }
  // Десктоп — все свёрнуты по умолчанию
}

export function renderHabits() {
  ensureHabits();
  initExpanded();

  const days     = daysInMonth();
  const today    = todayDay();
  const startDow = monthStartDow();
  const mobile   = isMobile();

  return `
    <div class="card" id="habitsCard">
      <div class="card-title" style="display:flex;justify-content:space-between;align-items:center;">
        <span>${t('habits')}</span>
        ${!mobile ? `
          <button id="habExpandAllBtn" style="font-size:10px;font-family:var(--font-mono);
            background:var(--bg4);border:1px solid var(--border);border-radius:4px;
            color:var(--text2);padding:2px 8px;cursor:pointer;">
            развернуть все
          </button>` : ''}
      </div>
      <div class="task-input-row" style="margin-bottom:12px;">
        <input id="habitInput" placeholder="${t('habit_placeholder')}" class="task-input" />
        <button class="btn-add" id="addHabitBtn">+</button>
      </div>
      ${state.habits.length === 0
        ? `<p class="empty-hint">${t('habits_empty')}</p>`
        : state.habits.map((h, hi) => {
            const doneDays  = (h.done||[]).filter(d => d <= today).length;
            const pct       = today > 0 ? Math.round(doneDays / today * 100) : 0;
            const isOpen    = expandedSet.has(hi);
            const totalCells = startDow + days;
            const rows       = Math.ceil(totalCells / 7);
            const totalSlots = rows * 7;

            let cells = '';
            for (let i = 0; i < totalSlots; i++) {
              const dayNum = i - startDow + 1;
              if (dayNum < 1 || dayNum > days) {
                cells += `<div style="height:${mobile?'40px':'28px'};border-radius:${mobile?'6':'4'}px;"></div>`;
              } else {
                const done    = (h.done||[]).includes(dayNum);
                const future  = dayNum > today;
                const isToday = dayNum === today;
                const bg  = done    ? 'var(--green)'
                          : isToday ? 'var(--bg3)'
                          :            'var(--bg4)';
                const clr = done    ? 'var(--bg)'
                          : isToday ? 'var(--green)'
                          :            'var(--text3)';
                const outline = isToday ? 'outline:2px solid var(--green);outline-offset:2px;' : '';
                const h_px    = mobile ? '40px' : '28px';
                const r_px    = mobile ? '6px'  : '4px';
                const fs_px   = mobile ? '12px' : '10px';

                cells += `<div
                  class="habit-sq"
                  data-hi="${hi}"
                  data-day="${dayNum}"
                  style="height:${h_px};border-radius:${r_px};background:${bg};${outline}
                    opacity:${future?'0.2':'1'};pointer-events:${future?'none':'auto'};
                    display:flex;align-items:center;justify-content:center;
                    font-size:${fs_px};font-weight:500;font-family:var(--font-mono);
                    color:${clr};cursor:${future?'default':'pointer'};user-select:none;"
                  >${dayNum}</div>`;
              }
            }

            return `
              <div class="habit-row" style="margin-bottom:${mobile?'16':'10'}px;
                border:1px solid var(--border);border-radius:8px;
                padding:10px;background:var(--bg2);">

                <!-- Заголовок — всегда виден -->
                <div style="display:flex;justify-content:space-between;align-items:center;
                  ${!mobile ? 'cursor:pointer;' : ''}
                  ${isOpen && !mobile ? 'margin-bottom:8px;' : ''}"
                  ${!mobile ? `class="habit-toggle" data-hi="${hi}"` : ''}>
                  <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
                    ${!mobile ? `<span style="font-size:11px;color:var(--text3);transition:.2s;">${isOpen?'▼':'▶'}</span>` : ''}
                    <span style="font-size:${mobile?'13':'12'}px;font-weight:500;color:var(--text);
                      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${h.name}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                    <span style="font-size:10px;color:var(--text2);font-family:var(--font-mono);">${doneDays}/${today}&nbsp;(${pct}%)</span>
                    <button class="btn-del" data-hi="${hi}" title="${t('habit_delete_confirm')}">✕</button>
                  </div>
                </div>

                <!-- Прогресс-шкала (всегда видна) -->
                <div style="background:var(--bg4);border-radius:4px;height:3px;${isOpen&&!mobile?'':'margin-top:6px;'}">
                  <div style="background:var(--green);height:100%;width:${pct}%;border-radius:4px;transition:width .3s;"></div>
                </div>

                <!-- Календарь — видим если isOpen или мобиле -->
                ${isOpen || mobile ? `
                  <div style="margin-top:8px;">
                    <!-- Дни недели -->
                    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:2px;">
                      ${DOW_LABELS.map(d => `
                        <div style="font-size:${mobile?'9':'8'}px;color:var(--text3);text-align:center;
                          padding-bottom:2px;font-family:var(--font-mono);">${d}</div>
                      `).join('')}
                    </div>
                    <!-- Сетка -->
                    <div class="habit-grid" data-hi="${hi}" data-days="${days}" data-startdow="${startDow}"
                      style="display:grid;grid-template-columns:repeat(7,1fr);gap:${mobile?'3':'2'}px;">
                      ${cells}
                    </div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')
      }
    </div>
  `;
}

export function bindHabits() {
  ensureHabits();
  initExpanded();
  const mobile = isMobile();

  // Добавить привычку
  const habitInput = document.getElementById('habitInput');
  function doAddHabit() {
    const name = habitInput?.value.trim();
    if (!name) return;
    const newIdx = state.habits.length;
    state.habits.push({ name, done: [] });
    habitInput.value = '';
    // Новая привычка: мобиле — открыта, десктоп — открыта (показать сразу)
    expandedSet.add(newIdx);
    saveState(); update();
  }
  document.getElementById('addHabitBtn')?.addEventListener('click', doAddHabit);
  habitInput?.addEventListener('keydown', e => { if (e.key === 'Enter') doAddHabit(); });

  // Удалить
  document.querySelectorAll('.btn-del[data-hi]').forEach(btn => {
    btn.addEventListener('click', () => {
      const hi = +btn.dataset.hi;
      if (confirm(`${t('habit_delete_confirm')} "${state.habits[hi].name}"?`)) {
        state.habits.splice(hi, 1);
        // Пересчитать expandedSet
        const newSet = new Set();
        expandedSet.forEach(i => { if (i < hi) newSet.add(i); else if (i > hi) newSet.add(i - 1); });
        expandedSet.clear();
        newSet.forEach(i => expandedSet.add(i));
        saveState(); update();
      }
    });
  });

  // Свернуть/развернуть (только десктоп)
  if (!mobile) {
    document.querySelectorAll('.habit-toggle').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.classList.contains('btn-del')) return;
        const hi = +el.dataset.hi;
        if (expandedSet.has(hi)) expandedSet.delete(hi);
        else expandedSet.add(hi);
        update();
      });
    });

    // Развернуть все
    document.getElementById('habExpandAllBtn')?.addEventListener('click', () => {
      const allOpen = state.habits.every((_, i) => expandedSet.has(i));
      if (allOpen) {
        expandedSet.clear();
      } else {
        state.habits.forEach((_, i) => expandedSet.add(i));
      }
      update();
    });
  }

  // ── Drag-выделение ────────────────────────────────────
  let ds = null;
  if (window.__habUp)   document.removeEventListener('mouseup',   window.__habUp);
  if (window.__habMove) document.removeEventListener('mousemove', window.__habMove);

  function sqBg(done, isToday) {
    return done ? 'var(--green)' : isToday ? 'var(--bg3)' : 'var(--bg4)';
  }
  function sqClr(done, isToday) {
    return done ? 'var(--bg)' : isToday ? 'var(--green)' : 'var(--text3)';
  }

  function preview(hi, a, b) {
    const min = Math.min(a, b), max = Math.max(a, b);
    const habit = state.habits[hi];
    document.querySelectorAll(`.habit-sq[data-hi="${hi}"]`).forEach(sq => {
      const day     = +sq.dataset.day;
      const done    = (habit.done||[]).includes(day);
      const isToday = day === todayDay();
      const inRange = day >= min && day <= max;
      sq.style.background = inRange
        ? (ds.mode === 'remove' ? sqBg(false, isToday) : 'var(--green)')
        : sqBg(done, isToday);
      sq.style.color = inRange
        ? (ds.mode === 'remove' ? sqClr(false, isToday) : 'var(--bg)')
        : sqClr(done, isToday);
    });
  }

  function commit() {
    if (!ds) return;
    const { hi, startDay, endDay, mode } = ds;
    const min = Math.min(startDay, endDay), max = Math.max(startDay, endDay);
    const habit = state.habits[hi];
    const today = todayDay();
    if (!habit.done) habit.done = [];
    for (let day = min; day <= max; day++) {
      if (day > today) continue;
      const idx = habit.done.indexOf(day);
      if (mode === 'add'    && idx === -1) { habit.done.push(day);      addXP( XP_PER_HABIT); }
      if (mode === 'remove' && idx !== -1) { habit.done.splice(idx, 1); addXP(-XP_PER_HABIT); }
    }
    if (mode === 'add') showToast(`+XP · ${t('habits')}`, 'xp');
    saveState(); ds = null; update();
  }

  function dayFromXY(hi, clientX, clientY) {
    const grid = document.querySelector(`.habit-grid[data-hi="${hi}"]`);
    if (!grid) return null;
    const rect     = grid.getBoundingClientRect();
    const startDow = +grid.dataset.startdow;
    const days     = +grid.dataset.days;
    const cols     = 7;
    const rows     = Math.ceil((startDow + days) / 7);
    const cellW    = rect.width  / cols;
    const cellH    = rect.height / rows;
    const col      = Math.floor((clientX - rect.left) / cellW);
    const row      = Math.floor((clientY - rect.top)  / cellH);
    const slot     = row * cols + Math.max(0, Math.min(cols - 1, col));
    const dayNum   = slot - startDow + 1;
    return dayNum >= 1 && dayNum <= days ? Math.min(dayNum, todayDay()) : null;
  }

  document.querySelectorAll('.habit-sq').forEach(sq => {
    sq.addEventListener('mousedown', e => {
      e.preventDefault();
      const day  = +sq.dataset.day;
      const hi   = +sq.dataset.hi;
      const done = (state.habits[hi].done||[]).includes(day);
      ds = { hi, startDay: day, endDay: day, mode: done ? 'remove' : 'add' };
      preview(hi, day, day);
    });
  });

  window.__habMove = e => {
    if (!ds) return;
    const day = dayFromXY(ds.hi, e.clientX, e.clientY);
    if (day === null || day === ds.endDay) return;
    ds.endDay = day;
    preview(ds.hi, ds.startDay, day);
  };
  window.__habUp = () => { if (ds) commit(); };
  document.addEventListener('mousemove', window.__habMove);
  document.addEventListener('mouseup',   window.__habUp);
}
