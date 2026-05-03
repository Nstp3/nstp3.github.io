// ============================================================
// notifications.js — Web Notifications API (Этап 1)
// Работает: веб-браузер (другая вкладка) + Android APK (открытое приложение)
// ============================================================

const ICON = '/favicon.ico';

// ── Запросить разрешение ──────────────────────────────────
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  // Запрашиваем только по жесту пользователя — иначе браузер блокирует
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function notificationsGranted() {
  return 'Notification' in window && Notification.permission === 'granted';
}

// ── Показать уведомление ──────────────────────────────────
export function showNotification(title, body, options = {}) {
  if (!notificationsGranted()) return;
  try {
    const n = new Notification(title, {
      body,
      icon: ICON,
      badge: ICON,
      vibrate: [200, 100, 200],
      tag: options.tag || 'nstp3-rpg',
      renotify: options.renotify ?? true,
      ...options,
    });
    // Клик по уведомлению — фокус на вкладку
    n.onclick = () => { window.focus(); n.close(); };
    // Автозакрытие через 8 секунд
    setTimeout(() => n.close(), 8000);
  } catch (e) {
    console.warn('Notification failed:', e);
  }
}

// ── Помодоро: конец рабочей сессии ───────────────────────
export function notifyPomodoroWorkDone(lang = 'ru') {
  const title = lang === 'ru' ? '⏱ Сессия завершена!' : '⏱ Session complete!';
  const body  = lang === 'ru'
    ? 'Отличная работа! Время отдохнуть 🎉'
    : 'Great work! Time to take a break 🎉';
  showNotification(title, body, { tag: 'pomodoro-work' });
}

// ── Помодоро: конец перерыва ──────────────────────────────
export function notifyPomodoroBreakDone(lang = 'ru') {
  const title = lang === 'ru' ? '⚡ Перерыв закончен!' : '⚡ Break is over!';
  const body  = lang === 'ru'
    ? 'Вернись к работе — ты справишься 💪'
    : 'Back to work — you got this 💪';
  showNotification(title, body, { tag: 'pomodoro-break' });
}

// ── Ежедневные напоминания ────────────────────────────────
// Планируем проверку на вечер (20:00).
// Если вкладка открыта — сработает в нужное время.

let _dailyTimer = null;

export function scheduleDailyReminder(state) {
  if (_dailyTimer) clearTimeout(_dailyTimer);

  const now   = new Date();
  const remind = new Date();
  remind.setHours(20, 0, 0, 0);   // 20:00

  // Если 20:00 уже прошло сегодня — ставим на завтра
  if (remind <= now) remind.setDate(remind.getDate() + 1);

  const ms = remind.getTime() - now.getTime();

  _dailyTimer = setTimeout(() => {
    fireDailyReminder(state);
    // Перепланируем на следующий день
    scheduleDailyReminder(state);
  }, ms);

  console.log(`[notifications] Ежедневное напоминание через ${Math.round(ms/1000/60)} мин`);
}

function fireDailyReminder(state) {
  if (!notificationsGranted()) return;

  const lang        = state.lang || 'ru';
  const today       = new Date().getDate();
  const pendingTasks = (state.tasks || []).filter(t => !t.done).length;
  const pendingHabits = (state.habits || []).filter(h => {
    const done = (h.done || []).includes(today);
    return !done;
  }).length;

  // Уведомление о задачах
  if (pendingTasks > 0) {
    const title = lang === 'ru' ? '📋 Незавершённые задачи' : '📋 Pending tasks';
    const body  = lang === 'ru'
      ? `У тебя ${pendingTasks} невыполненн${pendingTasks === 1 ? 'ая задача' : 'ых задач'} на сегодня`
      : `You have ${pendingTasks} task${pendingTasks === 1 ? '' : 's'} left for today`;
    showNotification(title, body, { tag: 'daily-tasks' });
  }

  // Уведомление о привычках (через 3 сек чтобы не перекрывали)
  if (pendingHabits > 0) {
    setTimeout(() => {
      const title = lang === 'ru' ? '🔥 Не забудь про привычки!' : '🔥 Don\'t forget your habits!';
      const body  = lang === 'ru'
        ? `${pendingHabits} привычк${pendingHabits === 1 ? 'а' : 'и'} ещё не отмечен${pendingHabits === 1 ? 'а' : 'ы'} сегодня`
        : `${pendingHabits} habit${pendingHabits === 1 ? '' : 's'} not checked today`;
      showNotification(title, body, { tag: 'daily-habits' });
    }, 3000);
  }

  // Если всё сделано — похвалить
  if (pendingTasks === 0 && pendingHabits === 0) {
    const title = lang === 'ru' ? '🏆 Всё выполнено!' : '🏆 All done!';
    const body  = lang === 'ru'
      ? 'Все задачи и привычки на сегодня выполнены. Молодец!'
      : 'All tasks and habits done for today. Great job!';
    showNotification(title, body, { tag: 'daily-complete' });
  }
}
