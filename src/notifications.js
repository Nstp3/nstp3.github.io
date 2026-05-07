// ============================================================
// notifications.js — Web Notifications API + Android Bridge
// Этап 1: уведомления когда вкладка открыта (веб + APK)
// Этап 2: вызовы AndroidNative для нативных уведомлений (APK закрыт)
// ============================================================

const ICON = '/favicon.ico';

// Проверяем запущены ли мы внутри Android WebView
function isAndroid() {
  return typeof window.AndroidNative !== 'undefined';
}

// ── Запросить разрешение ──────────────────────────────────
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function notificationsGranted() {
  return 'Notification' in window && Notification.permission === 'granted';
}

// ── Показать Web уведомление ──────────────────────────────
export function showNotification(title, body, options = {}) {
  if (!notificationsGranted()) return;
  try {
    const n = new Notification(title, {
      body,
      icon: ICON,
      badge: ICON,
      vibrate: [200, 100, 200],
      tag: options.tag || 'razl',
      renotify: options.renotify ?? true,
      ...options,
    });
    n.onclick = () => { window.focus(); n.close(); };
    setTimeout(() => n.close(), 8000);
  } catch (e) {
    console.warn('Notification failed:', e);
  }
}

// ── Помодоро: запланировать нативный будильник ───────────
// Вызывается из Pomodoro.js когда таймер стартует
export function scheduleAndroidPomodoroAlarm(endTimeMs, isBreak, lang) {
  if (!isAndroid()) return;
  try {
    window.AndroidNative.schedulePomodoroAlarm(endTimeMs, isBreak, lang);
  } catch (e) {
    console.warn('Android alarm schedule failed:', e);
  }
}

// Вызывается когда таймер останавливается или сбрасывается
export function cancelAndroidPomodoroAlarm() {
  if (!isAndroid()) return;
  try {
    window.AndroidNative.cancelPomodoroAlarm();
  } catch (e) {
    console.warn('Android alarm cancel failed:', e);
  }
}

// ── Синхронизация статистики для WorkManager ──────────────
// Вызывается из state.js при каждом saveState
export function syncStatsToAndroid(state) {
  if (!isAndroid()) return;
  try {
    const today        = new Date().getDate();
    const pendingTasks  = (state.tasks  || []).filter(t => !t.done).length;
    const pendingHabits = (state.habits || []).filter(h => {
      return !(h.done || []).includes(today);
    }).length;
    const lang = state.lang || 'ru';
    window.AndroidNative.updateStats(pendingTasks, pendingHabits, lang);
  } catch (e) {
    console.warn('Android stats sync failed:', e);
  }
}

// ── Помодоро: конец рабочей сессии (Web уведомление) ─────
export function notifyPomodoroWorkDone(lang = 'ru') {
  const title = lang === 'ru' ? '⏱ Сессия завершена!' : '⏱ Session complete!';
  const body  = lang === 'ru'
    ? 'Отличная работа! Время отдохнуть 🎉'
    : 'Great work! Time to take a break 🎉';
  showNotification(title, body, { tag: 'pomodoro-work' });
}

// ── Помодоро: конец перерыва (Web уведомление) ────────────
export function notifyPomodoroBreakDone(lang = 'ru') {
  const title = lang === 'ru' ? '⚡ Перерыв закончен!' : '⚡ Break is over!';
  const body  = lang === 'ru'
    ? 'Вернись к работе — ты справишься 💪'
    : 'Back to work — you got this 💪';
  showNotification(title, body, { tag: 'pomodoro-break' });
}

// ── Ежедневные напоминания (Web) ──────────────────────────
let _dailyTimer = null;

export function scheduleDailyReminder(state) {
  if (_dailyTimer) clearTimeout(_dailyTimer);

  const now    = new Date();
  const remind = new Date();
  remind.setHours(20, 0, 0, 0);
  if (remind <= now) remind.setDate(remind.getDate() + 1);

  const ms = remind.getTime() - now.getTime();
  _dailyTimer = setTimeout(() => {
    fireDailyReminder(state);
    scheduleDailyReminder(state);
  }, ms);

  console.log(`[notifications] Ежедневное напоминание через ${Math.round(ms/1000/60)} мин`);
}

function fireDailyReminder(state) {
  if (!notificationsGranted()) return;

  const lang         = state.lang || 'ru';
  const today        = new Date().getDate();
  const pendingTasks  = (state.tasks  || []).filter(t => !t.done).length;
  const pendingHabits = (state.habits || []).filter(h => {
    return !(h.done || []).includes(today);
  }).length;

  if (pendingTasks > 0) {
    const title = lang === 'ru' ? '📋 Незавершённые задачи' : '📋 Pending tasks';
    const body  = lang === 'ru'
      ? `У тебя ${pendingTasks} невыполненных задач на сегодня`
      : `You have ${pendingTasks} task${pendingTasks === 1 ? '' : 's'} left today`;
    showNotification(title, body, { tag: 'daily-tasks' });
  }

  if (pendingHabits > 0) {
    setTimeout(() => {
      const title = lang === 'ru' ? '🔥 Не забудь про привычки!' : '🔥 Don\'t forget your habits!';
      const body  = lang === 'ru'
        ? `${pendingHabits} привычек ещё не отмечено сегодня`
        : `${pendingHabits} habit${pendingHabits === 1 ? '' : 's'} not checked today`;
      showNotification(title, body, { tag: 'daily-habits' });
    }, 3000);
  }

  if (pendingTasks === 0 && pendingHabits === 0) {
    const title = lang === 'ru' ? '🏆 Всё выполнено!' : '🏆 All done!';
    const body  = lang === 'ru'
      ? 'Все задачи и привычки на сегодня выполнены. Молодец!'
      : 'All tasks and habits done for today. Great job!';
    showNotification(title, body, { tag: 'daily-complete' });
  }
}
