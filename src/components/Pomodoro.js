import { t } from '../i18n/translations.js';
import {
  notifyPomodoroWorkDone,
  notifyPomodoroBreakDone,
  scheduleAndroidPomodoroAlarm,
  cancelAndroidPomodoroAlarm,
} from '../notifications.js';
import { state } from '../state.js';

let timer        = null;
let isBreak      = false;
let isRunning    = false;
let workMinutes  = 25;
let breakMinutes = 5;

// ── Фикс бага 1: храним не «сколько секунд осталось»,
//    а «когда должен закончиться таймер» ──────────────────
let endTime      = 0;   // Date.now() + оставшееся время в мс
let pausedLeft   = 0;   // сколько мс оставалось в момент паузы

function totalMs() {
  return (isBreak ? breakMinutes : workMinutes) * 60 * 1000;
}

function msLeft() {
  if (!isRunning) return pausedLeft;
  return Math.max(0, endTime - Date.now());
}

function formatTime(ms) {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
}

function playBeep() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine'; osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1.2);
  } catch(e) {}
}

function tick() {
  const left = msLeft();

  if (left <= 0) {
    // Сессия закончилась
    clearInterval(timer); timer = null;
    playBeep();

    const lang = state?.lang || 'ru';
    if (isBreak) notifyPomodoroBreakDone(lang);
    else         notifyPomodoroWorkDone(lang);

    // Переходим к следующей фазе
    isBreak    = !isBreak;
    pausedLeft = totalMs();
    endTime    = Date.now() + pausedLeft;

    // Запланировать следующий Android-будильник
    scheduleAndroidPomodoroAlarm(endTime, isBreak, lang);

    // Автоматически стартуем следующую сессию
    timer = setInterval(tick, 250);
    updatePomodoroDisplay();
    return;
  }

  updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
  const timeEl     = document.getElementById('pomTime');
  const labelEl    = document.getElementById('pomLabel');
  const progressEl = document.getElementById('pomProgress');
  const notifEl    = document.getElementById('pomNotifHint');
  const btnEl      = document.getElementById('pomBtn');
  if (!timeEl) return;

  const left  = msLeft();
  const total = totalMs();
  const pct   = ((total - left) / total) * 100;

  timeEl.textContent  = formatTime(left);
  labelEl.textContent = isBreak ? t('rest_label') : t('work');
  progressEl.style.width = `${pct}%`;
  progressEl.style.background = isBreak
    ? 'linear-gradient(90deg,#0277bd,#42a5f5)'
    : 'linear-gradient(90deg,var(--green2),var(--green))';

  // Фикс бага 2: кнопка всегда соответствует реальному состоянию
  if (btnEl) {
    btnEl.textContent = isRunning ? t('pause') : t('start');
  }

  if (notifEl) {
    if (!('Notification' in window)) {
      notifEl.textContent = '';
    } else if (Notification.permission === 'granted') {
      notifEl.textContent = t('notif_on');
      notifEl.style.color  = 'var(--green)';
      notifEl.style.cursor = 'default';
    } else if (Notification.permission === 'denied') {
      notifEl.textContent = t('notif_blocked');
      notifEl.style.color  = 'var(--red)';
      notifEl.style.cursor = 'default';
    } else {
      notifEl.textContent = t('notif_ask');
      notifEl.style.color  = 'var(--text2)';
      notifEl.style.cursor = 'pointer';
    }
  }
}

function startStop() {
  if (isRunning) {
    // Сохраняем остаток ДО смены isRunning — иначе msLeft() вернёт 0
    const remaining = Math.max(0, endTime - Date.now());
    clearInterval(timer); timer = null;
    isRunning  = false;
    pausedLeft = remaining;
    cancelAndroidPomodoroAlarm();
  } else {
    // Старт / продолжить
    if (pausedLeft === 0) pausedLeft = totalMs();
    endTime   = Date.now() + pausedLeft;
    isRunning = true;
    timer     = setInterval(tick, 250); // 250мс вместо 1000 — точнее

    const lang = state?.lang || 'ru';
    scheduleAndroidPomodoroAlarm(endTime, isBreak, lang);
  }
  updatePomodoroDisplay();
}

function reset() {
  clearInterval(timer); timer = null;
  isRunning  = false;
  isBreak    = false;
  pausedLeft = totalMs(); // ← сразу показываем правильное время
  endTime    = 0;
  cancelAndroidPomodoroAlarm();
  updatePomodoroDisplay();
}
function applySettings() {
  const w = parseInt(document.getElementById('pomWork').value);
  const b = parseInt(document.getElementById('pomBreak').value);
  if (!isNaN(w) && w > 0) workMinutes  = w;
  if (!isNaN(b) && b > 0) breakMinutes = b;
  reset();
}

export function renderPomodoro() {
  // Фикс бага 2: рендерим правильный текст кнопки сразу
  const btnLabel = isRunning ? t('pause') : t('start');
  const timeDisplay = formatTime(msLeft() || totalMs());
  
  return `
    <div class="card">
      <div class="card-title">${t('pomodoro')}</div>
      <div class="pom-phase" id="pomLabel">${isBreak ? t('rest_label') : t('work')}</div>
      <div class="pom-time" id="pomTime">${timeDisplay}</div>
      <div class="progress" style="margin:10px 0 14px;">
        <div class="progress-bar" id="pomProgress" style="width:0%;background:linear-gradient(90deg,var(--green2),var(--green));"></div>
      </div>
      <div class="pom-controls">
        <button class="btn-pom" id="pomBtn" onclick="pomStartStop()">${btnLabel}</button>
        <button class="btn-pom btn-pom--ghost" onclick="pomReset()">${t('reset')}</button>
      </div>
      <div class="pom-settings">
        <div class="pom-setting-row">
          <label class="pom-label-sm">${t('work_min')}</label>
          <input id="pomWork" type="number" value="${workMinutes}" min="1" max="120" class="pom-input" />
        </div>
        <div class="pom-setting-row">
          <label class="pom-label-sm">${t('break_min')}</label>
          <input id="pomBreak" type="number" value="${breakMinutes}" min="1" max="60" class="pom-input" />
        </div>
        <button class="btn-pom btn-pom--ghost" style="width:100%;margin-top:6px;" onclick="pomApply()">${t('apply')}</button>
      </div>
      <div id="pomNotifHint" onclick="pomRequestNotif()"
           style="margin-top:10px;font-size:10px;font-family:var(--font-mono);text-align:center;min-height:14px;"></div>
    </div>
  `;
}

export function bindPomodoro() {
  window.pomStartStop    = startStop;
  window.pomReset        = reset;
  window.pomApply        = applySettings;
  window.pomRequestNotif = async () => {
    if (!('Notification' in window)) return;
    await Notification.requestPermission();
    updatePomodoroDisplay();
  };
  setTimeout(updatePomodoroDisplay, 0);
}
