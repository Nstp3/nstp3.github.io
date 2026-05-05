import { state, saveState } from '../state.js';
import { addTask, deleteTask, toggleTask } from '../tasks.js';
import { update } from '../renderer.js';
import { t, tSkill } from '../i18n/translations.js';

const SKILL_KEYS = ['Тело','Разум','Продуктивность','Развлечения','Быт','Отдых'];

export function renderTasks() {
  const tasks = state.tasks.filter(task => !task.done);
  return `
    <div class="card">
      <div class="card-title">${t('tasks')}</div>
      <div class="task-input-row">
        <input id="taskInput" placeholder="${t('task_placeholder')}" class="task-input" />
        <select id="taskCat" class="task-select">
          ${SKILL_KEYS.map(k => `<option value="${k}">${tSkill(k)}</option>`).join('')}
          <option value="♻️">♻️ ${t('recurring')}</option>
        </select>
        <button class="btn-add" id="taskAddBtn">+</button>
      </div>
      <div id="taskList" style="max-height:210px;overflow-y:auto;overflow-x:hidden;padding-right:2px;">
        ${tasks.length === 0
          ? `<p class="empty-hint">${t('tasks_empty')}</p>`
          : tasks.map(task => renderTask(task)).join('')
        }
      </div>
    </div>
  `;
}

function renderTask(task) {
  const catColors = {
    'Тело':'cat-physical','Разум':'cat-psyche','Продуктивность':'cat-intel',
    'Развлечения':'cat-shop','Быт':'cat-home','Отдых':'cat-other',
  };
  const catClass = catColors[task.category] || 'cat-other';
  return `
    <div class="task-item" data-id="${task.id}">
      <input type="checkbox" class="task-check" data-id="${task.id}" />
      <span class="task-text">${task.text}</span>
      <span class="task-cat ${catClass}">${tSkill(task.category)}</span>
      ${task.recurring
        ? `<button class="btn-recur-toggle" data-id="${task.id}" title="${t('recurring_off')}" style="
            background:none;border:none;cursor:pointer;font-size:14px;padding:0 2px;
            opacity:0.85;transition:opacity .15s;" >🔄</button>`
        : ''}
      <button class="btn-del" data-id="${task.id}" title="Delete">✕</button>
    </div>
  `;
}

export function bindTasks() {
  const addBtn = document.getElementById('taskAddBtn');
  const input  = document.getElementById('taskInput');

  function handleAdd() {
    const text     = input?.value;
    const catVal   = document.getElementById('taskCat')?.value || 'Тело';
    const recurring = catVal === '♻️';
    const category  = recurring ? 'Отдых' : catVal;

    if (!text?.trim()) return;
    if (addTask(text, category, recurring)) {
      input.value = '';
      update();
    }
  }

  addBtn?.addEventListener('click', handleAdd);
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') handleAdd(); });

  const list = document.getElementById('taskList');

  // Клики
  list?.addEventListener('click', e => {
    const id = +(e.target.dataset.id);
    if (!id) return;

    if (e.target.classList.contains('task-check') || e.target.classList.contains('task-text')) {
      toggleTask(id); update();
    }
    if (e.target.classList.contains('btn-del')) {
      deleteTask(id); update();
    }
    // Снять/поставить повтор
    if (e.target.classList.contains('btn-recur-toggle')) {
      const task = state.tasks.find(t => t.id === id);
      if (task) { task.recurring = false; saveState(); update(); }
    }
  });

  list?.addEventListener('change', e => {
    if (e.target.classList.contains('task-check')) {
      const id = +(e.target.dataset.id);
      if (id) { toggleTask(id); update(); }
    }
  });

  // Долгое нажатие на мобиле — переключить повтор
  let longPressTimer = null;

  list?.addEventListener('pointerdown', e => {
    const item = e.target.closest('.task-item');
    if (!item) return;
    const id = +(item.dataset.id);
    if (!id) return;

    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      const task = state.tasks.find(t => t.id === id);
      if (!task) return;

      task.recurring = !task.recurring;
      saveState();
      update();

      // Тактильный отклик (если поддерживается)
      if (navigator.vibrate) navigator.vibrate(40);
    }, 600);
  });

  list?.addEventListener('pointerup',    () => { clearTimeout(longPressTimer); longPressTimer = null; });
  list?.addEventListener('pointercancel',() => { clearTimeout(longPressTimer); longPressTimer = null; });
  list?.addEventListener('pointermove',  () => { clearTimeout(longPressTimer); longPressTimer = null; });
}
