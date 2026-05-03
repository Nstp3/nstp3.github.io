// renderer.js — оркестратор рендеринга

import { state } from './state.js';
import { getTheme, THEMES } from './themes.js';
import { renderProfile, bindProfile }           from './components/Profile.js';
import { renderStats, bindStats }               from './components/Stats.js';
import { renderTasks, bindTasks }               from './components/Tasks.js';
import { renderSkillsList, renderRadarCard, bindSkills, renderRadarChart } from './components/Skills.js';
import { renderActivityCard, renderLineChart }  from './components/ActivityChart.js';
import { renderPomodoro, bindPomodoro }         from './components/Pomodoro.js';
import { renderHabits, bindHabits }             from './components/Habits.js';
import { renderMovies, bindMovies }             from './components/Movies.js';
import { renderGames, bindGames }               from './components/Games.js';
import { renderLocalPlayer, bindLocalPlayer, renderSoundCloudPlayer, bindSoundCloudPlayer } from './components/Music.js';
import { renderTaskHistory, bindTaskHistory }   from './components/TaskHistory.js';
import { renderCalendar, bindCalendar }         from './components/Calendar.js';
import { t } from './i18n/translations.js';

let currentTab     = 'home';   // десктоп-вкладка
let currentMobTab  = 'hero';   // мобильная вкладка
let tabsInitialized    = false;
let mobTabsInitialized = false;

window.__renderer__ = { update };

function isMobile() {
  return window.innerWidth <= 600;
}

// ── Десктоп-вкладки ───────────────────────────────────────
function initTabs() {
  if (tabsInitialized) return;
  tabsInitialized = true;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      render();
    });
  });
}

function updateTabState() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('tab-btn--active', btn.dataset.tab === currentTab);
  });
  document.querySelectorAll('.tab-btn [data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
}

// ── Мобильные вкладки ─────────────────────────────────────
function initMobTabs() {
  if (mobTabsInitialized) return;
  mobTabsInitialized = true;
  document.querySelectorAll('.bnav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentMobTab = btn.dataset.tab;
      render();
    });
  });
}

function updateMobTabState() {
  document.querySelectorAll('.bnav-btn').forEach(btn => {
    btn.classList.toggle('bnav-btn--active', btn.dataset.tab === currentMobTab);
  });
}

// ── Рендер контента для мобилы ────────────────────────────
function renderMobile(app) {
  initMobTabs();
  updateMobTabState();

  switch (currentMobTab) {

    case 'hero':
      app.innerHTML = `
        <div class="col">
          ${renderProfile()}
          ${renderStats()}
          ${renderRadarCard()}
        </div>`;
      bindProfile(); bindStats(); bindSkills();
      renderRadarChart();
      break;

    case 'tasks':
      app.innerHTML = `
        <div class="col">
          ${renderTasks()}
          ${renderActivityCard()}
        </div>`;
      bindTasks();
      renderLineChart();
      break;

    case 'skills':
      app.innerHTML = `
        <div class="col">
          ${renderSkillsList()}
          ${renderCalendar()}
        </div>`;
      bindSkills(); bindCalendar();
      break;

    case 'habits':
      app.innerHTML = `
        <div class="col">
          ${renderPomodoro()}
          ${renderHabits()}
        </div>`;
      bindPomodoro(); bindHabits();
      break;

    case 'leisure':
      app.innerHTML = `
        <div class="col">
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${renderLocalPlayer()}
            ${renderMovies()}
            ${renderGames()}
          </div>
        </div>`;
      bindLocalPlayer(); bindMovies(); bindGames();
      break;
  }
}

// ── Рендер контента для десктопа ─────────────────────────
function renderDesktop(app) {
  initTabs();
  updateTabState();

  if (currentTab === 'home') {
    app.innerHTML = `
      <div class="col col--left">
        ${renderProfile()}
        ${renderStats()}
        ${renderRadarCard()}
        ${renderPomodoro()}
      </div>
      <div class="col col--mid">
        ${renderTasks()}
        ${renderSkillsList()}
        ${renderHabits()}
        ${renderActivityCard()}
      </div>`;
    bindProfile(); bindStats(); bindTasks(); bindSkills(); bindPomodoro(); bindHabits();
    renderRadarChart(); renderLineChart();

  } else if (currentTab === 'tasks') {
    app.innerHTML = `
      <div class="col col--left">
        ${renderCalendar()}
      </div>
      <div class="col col--mid">
        ${renderTaskHistory()}
      </div>`;
    bindTaskHistory(); bindCalendar();

  } else if (currentTab === 'relax') {
    app.innerHTML = `
      <div style="grid-column:1/-1;max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:12px;width:100%;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${renderLocalPlayer()}
          ${renderSoundCloudPlayer()}
        </div>
        ${renderMovies()}
        ${renderGames()}
      </div>`;
    bindLocalPlayer(); bindSoundCloudPlayer(); bindMovies(); bindGames();
  }
}

// ── Главный render ────────────────────────────────────────
export function render() {
  const app = document.getElementById('app');
  if (!app) return;

  // Topbar
  const btnLang   = document.getElementById('btnLang');
  const btnExport = document.getElementById('btnExport');
  const btnImport = document.getElementById('btnImport');
  const logoImg   = document.getElementById('logoImg');
  if (btnLang)   btnLang.textContent   = t('lang');
  if (btnExport) btnExport.textContent = t('export');
  if (btnImport) btnImport.textContent = t('import');
  const theme = getTheme();
  if (logoImg && theme.logo) logoImg.src = theme.logo;

  if (window.__updateDropdownIcons) window.__updateDropdownIcons();

  if (isMobile()) {
    renderMobile(app);
  } else {
    renderDesktop(app);
  }
}

export function update() { render(); }

// Перерисовать только при изменении ШИРИНЫ (поворот экрана)
// Изменение высоты = открытие клавиатуры — НЕ перерисовываем
let lastWidth = window.innerWidth;
let resizeTimer;
window.addEventListener('resize', () => {
  const newWidth = window.innerWidth;
  if (newWidth === lastWidth) return; // клавиатура — игнорируем
  lastWidth = newWidth;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => render(), 200);
});
