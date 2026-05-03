import { t } from '../i18n/translations.js';
import { notifyPomodoroWorkDone, notifyPomodoroBreakDone, notificationsGranted } from '../notifications.js';
import { state } from '../state.js';

let timer = null;
let secondsLeft = 0;
let isBreak = false;
let isRunning = false;
let workMinutes = 25;
let breakMinutes = 5;

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine'; osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1.2);
  } catch(e) {}
}

function formatTime(seconds) {
  return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
}

function tick() {
  if (secondsLeft <= 0) {
    playBeep();

    // ── Уведомление при завершении сессии ─────────────────
    const lang = state?.lang || 'ru';
    if (isBreak) {
      // Перерыв закончился — пора работать
      notifyPomodoroBreakDone(lang);
    } else {
      // Рабочая сессия закончилась — пора отдыхать
      notifyPomodoroWorkDone(lang);
    }

    isBreak = !isBreak;
    secondsLeft = (isBreak ? breakMinutes : workMinutes) * 60;
    updatePomodoroDisplay();
    return;
  }
  secondsLeft--;
  updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
  const timeEl     = document.getElementById('pomTime');
  const labelEl    = document.getElementById('pomLabel');
  const progressEl = document.getElementById('pomProgress');
  const notifEl    = document.getElementById('pomNotifHint');
  if (!timeEl) return;

  const total = (isBreak ? breakMinutes : workMinutes) * 60;
  const pct   = ((total - secondsLeft) / total) * 100;
  timeEl.textContent  = formatTime(secondsLeft);
  labelEl.textContent = isBreak ? t('rest_label') : t('work');
  progressEl.style.width = `${pct}%`;
  progressEl.style.background = isBreak
    ? 'linear-gradient(90deg,#0277bd,#42a5f5)'
    : 'linear-gradient(90deg,var(--green2),var(--green))';

  // Обновляем подсказку уведомлений
  if (notifEl) {
    if (!('Notification' in window)) {
      notifEl.textContent = '';
    } else if (Notification.permission === 'granted') {
      notifEl.textContent = t('notif_on');
      notifEl.style.color = 'var(--green)';
    } else if (Notification.permission === 'denied') {
      notifEl.textContent = t('notif_blocked');
      notifEl.style.color = 'var(--red)';
    } else {
      notifEl.textContent = t('notif_ask');
      notifEl.style.color = 'var(--text2)';
      notifEl.style.cursor = 'pointer';
    }
  }
}

function startStop() {
  if (isRunning) {
    clearInterval(timer); isRunning = false;
    document.getElementById('pomBtn').textContent = t('start');
  } else {
    if (secondsLeft === 0) secondsLeft = workMinutes * 60;
    timer = setInterval(tick, 1000); isRunning = true;
    document.getElementById('pomBtn').textContent = t('pause');
  }
}

function reset() {
  clearInterval(timer); isRunning = false; isBreak = false;
  secondsLeft = workMinutes * 60;
  document.getElementById('pomBtn').textContent = t('start');
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
  return `
    <div class="card">
      <div class="card-title">${t('pomodoro')}</div>
      <div class="pom-phase" id="pomLabel">${t('work')}</div>
      <div class="pom-time" id="pomTime">${String(workMinutes).padStart(2,'0')}:00</div>
      <div class="progress" style="margin:10px 0 14px;">
        <div class="progress-bar" id="pomProgress" style="width:0%;background:linear-gradient(90deg,var(--green2),var(--green));"></div>
      </div>
      <div class="pom-controls">
        <button class="btn-pom" id="pomBtn" onclick="pomStartStop()">${t('start')}</button>
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
  window.pomStartStop = startStop;
  window.pomReset     = reset;
  window.pomApply     = applySettings;
  window.pomRequestNotif = async () => {
    if (!('Notification' in window)) return;
    await Notification.requestPermission();
    updatePomodoroDisplay();
  };
  // Обновить статус уведомлений сразу после рендера
  setTimeout(updatePomodoroDisplay, 0);
}
