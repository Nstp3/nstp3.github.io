# Razl — Plan Fast

<div align="center">

![preview](readme_assets/preview.png)

<strong>🇬🇧 English</strong> &nbsp;·&nbsp; <a href="README.ru.md">🇷🇺 Русский</a>

<br>

<a href="https://nstp3.github.io/">🌐 Live Demo</a> &nbsp;·&nbsp;
<a href="android_version/app-release.apk">⬇️ Android APK</a> &nbsp;·&nbsp;
<a href="PRIVACY.md">🔒 Privacy Policy</a>

</div>

<br>

A personal RPG-style productivity dashboard. Turn your daily tasks, habits and skills into character progression. Runs entirely in the browser — no install, no server, no account needed.

---

## ✨ Features

- **Hero profile** — avatar, level, XP / Daily XP, game trophy and movie award badges
- **Stats** — Health, Mood, Stamina, Motivation with progress bars
- **Tasks** — add by category, recurring tasks, completing earns XP
- **Skills** — level up 6 skill tracks with visual progress bars
- **Radar chart** — spider chart showing your current skill balance
- **Habits** — calendar-style monthly tracker with drag-to-select and day labels
- **Pomodoro** — accurate focus timer, state persists after notifications
- **Activity** — 14-day activity line chart
- **3 themes** — Default · Assassin's Creed · Solo Leveling
- **Export / Import** — JSON backup (`razl-backup.json`)
- **Bilingual** — RU / EN
- **Notifications** — pomodoro alerts + daily task & habit reminders (web + Android)
- **Movies** — watchlist with poster, status filters, watched tracker and film award progression
- **Games** — game library with cover, source link, completion tracker and trophy progression

---

## 🗂️ Layout

### Desktop
Two-column layout with all blocks visible at once. Habits can be collapsed — click any habit row to toggle, or use **"expand all"** next to the Habits heading.

### Mobile (bottom navigation)
| Tab | Contents |
|---|---|
| 👤 Hero | Profile · Stats · Radar |
| ✅ Tasks | Tasks · Activity chart |
| ⚔️ Skills | Skills · Calendar |
| 🔥 Habits | Pomodoro · Habits |
| 🎬 Leisure | Local player · Movies · Games |

---

## ✅ Tasks — Recurring Tasks

### Create a recurring task
Select **♻️ Recurring** from the category dropdown before adding.

### Manage recurring tasks
| Action | How |
|---|---|
| Remove recurring flag | Tap the 🔄 icon on the task |
| Toggle recurring (mobile) | **Long-press** the task ~0.6s → phone vibrates |

---

## 🎮 Games — Trophy System

| Completed | Trophy | Next goal |
|---|---|---|
| 0–9 | — | 10 |
| 10+ | 🥉 Bronze | 50 |
| 50+ | 🥈 Silver | 100 |
| 100+ | 🥇 Gold | 250 |
| 250+ | 💎 Platinum | 500 |
| 500+ | 💜 Purple | 1000 |
| 1000+ | 👑 Legendary | MAX |

Trophy appears next to the hero's name on the profile card. Each new trophy replaces the previous one.

---

## 🎬 Movies — Film Award System

| Watched | Award | Next goal |
|---|---|---|
| 0–9 | — | 10 |
| 10+ | 🥉 Bronze reel | 25 |
| 25+ | 🥈 Silver reel | 50 |
| 50+ | 🥇 Gold reel | 100 |
| 100+ | 🏅 Platinum reel | 250 |
| 250+ | 💚 Green reel | 500 |
| 500+ | 🔴 Red reel | 750 |
| 750+ | 💜 Purple reel | 1000 |
| 1000+ | 💠 Diamond reel | MAX |

Film award appears next to the hero's name alongside the game trophy.

---

## 📱 Android APK

Works **offline** — all files are bundled inside the app.

### Download
[**⬇️ Download app-release.apk**](android_version/app-release.apk)

### Install
1. Download `app-release.apk`
2. Open on your phone
3. If prompted → **Settings → Security → Allow installs from unknown sources**
4. Tap **Install**

> ⚠️ Self-signed APK, not on Google Play — fine for personal use.

---

## 📱 Add to Home Screen (without APK)

### Android — Brave / Chrome
Tap **⋮** → **"Add to Home Screen"** → Confirm

### iPhone — Safari
Tap **Share** → **"Add to Home Screen"** → Confirm

---

## 🔔 Notifications

### Web
- Tap **"🔔 Tap to enable notifications"** under Pomodoro
- **Pomodoro**: alert when session/break ends — works on another tab
- **Daily at 20:00**: reminders about unfinished tasks and habits

### Android APK
- **Pomodoro**: `AlarmManager` — fires even when app is closed
- **Daily at 20:00**: `WorkManager` — fires even when app is closed
- Tapping a notification reopens the app without resetting the timer

---

## ⏱ Pomodoro

| Control | Action |
|---|---|
| Start | Begin work session |
| Pause | Freeze remaining time |
| Resume | Continue from where paused |
| Reset | Return to full duration |
| Apply | Save new durations and reset |

Timer state is persisted — returning from a notification or background does not reset it.

---

## 💾 Data & Privacy

All data stored **locally on your device** in IndexedDB. Nothing sent to servers. See [Privacy Policy](PRIVACY.md).

- **Export** → saves `razl-backup.json`
- **Import** → restore from backup file

---

## 🎨 Themes

| | Theme | Style |
|---|------|-------|
| <img src="readme_assets/theme-dark.png" width="22" height="22"> | Default | Dark blue — `#2e4369` · `#455bb2` · `#cdd3fd` |
| <img src="readme_assets/theme-ac.png" width="22" height="22"> | Assassin's Creed | Parchment, warm brown |
| <img src="readme_assets/theme-mythic.png" width="22" height="22"> | Solo Leveling | Dark purple, neon accents |

---

## 🚀 Local Development

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build      # GitHub Pages → dist/
BUILD_TARGET=android npm run build   # Android → dist-android/
```

### One-command Android rebuild
```bash
BUILD_TARGET=android npm run build && \
rm -r ~/AndroidStudioProjects/Nstp3RPG/app/src/main/assets/* && \
cp -r dist-android/* ~/AndroidStudioProjects/Nstp3RPG/app/src/main/assets
```

---

## 🛠️ Stack

| | |
|---|---|
| Bundler | Vite 5 |
| Language | Vanilla JS (ES Modules) |
| Storage | IndexedDB |
| Charts | Chart.js |
| Hosting | GitHub Pages |
| Android | WebView APK (Kotlin), offline |
| Notifications | Web Notifications API + AlarmManager + WorkManager |

---

*Plan fast. Level up your real life.* ⚔️
