# Nstp3-RPG — Gamified Productivity Dashboard

<div align="center">
  <table>
    <tr>
      <td align="center"><img src="readme_assets/preview.png" width="100%" alt="Desktop"><br><sub>Desktop</sub></td>
      <td align="center" width="32%"><img src="readme_assets/preview-mobile.jpg" width="100%" alt="Mobile"><br><sub>Mobile</sub></td>
    </tr>
  </table>

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

- **Hero profile** — avatar, level and XP / Daily XP tracking
- **Stats** — Health, Mood, Stamina, Motivation with progress bars
- **Tasks** — add by category, completing tasks earns XP
- **Skills** — level up 6 skill tracks with visual progress bars
- **Radar chart** — spider chart showing your current skill balance
- **Habits** — monthly day tracker with drag-to-select range and day labels
- **Pomodoro** — focus timer with configurable work / break duration
- **Activity** — daily activity line chart
- **3 themes** — Default · Assassin's Creed · Solo Leveling
- **Export / Import** — JSON backup of all your progress
- **Bilingual** — RU / EN
- **Notifications** — pomodoro alerts + daily task & habit reminders (web + Android)
- **Movies** — personal watchlist with poster, status filters and favorites
- **Games** — personal game library with cover art, source link, completion tracker and trophy progression

---

## 🎮 Games — Trophy System

Track your gaming progress with a visual trophy progression:

| Completed | Trophy | Progress |
|---|---|---|
| 0–9 | — | `🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜ X/10` |
| 10+ | 🥉 Bronze | `🟩🟩⬜⬜⬜⬜⬜⬜⬜⬜ X/50` |
| 50+ | 🥈 Silver | progress toward 100 |
| 100+ | 🥇 Gold | progress toward 250 |
| 250+ | 💎 Platinum | progress toward 500 |
| 500+ | 💜 Purple | progress toward 1000 |
| 1000+ | 👑 Legendary | MAX |

---

## 📱 Android APK

A native Android WebView wrapper. Works **offline** — all files are bundled inside the app.

### Download

[**⬇️ Download app-release.apk**](android_version/app-release.apk)

### Install

1. Download `app-release.apk`
2. Open the file on your phone
3. If prompted → **Settings → Security → Allow installs from unknown sources**
4. Tap **Install**
5. The **Nstp3 RPG** icon will appear on your home screen

> ⚠️ This APK is self-signed and not published on Google Play — that's fine for personal use.

---

## 📱 Add to Home Screen (without APK)

### Android — Brave / Chrome

1. Open [nstp3.github.io](https://nstp3.github.io/) in **Brave** or **Chrome**
2. Tap **⋮** → **"Add to Home Screen"** or **"Install app"**
3. Confirm — icon appears on home screen

### iPhone — Safari

1. Open [nstp3.github.io](https://nstp3.github.io/) in **Safari**
2. Tap **Share** → **"Add to Home Screen"**
3. Confirm — icon appears on home screen

---

## 🔔 Notifications

### Web (browser)
- On first load the browser asks for notification permission
- Tap **"🔔 Tap to enable notifications"** under the Pomodoro block to enable
- **Pomodoro**: alert when work session or break ends — works even on another tab
- **Daily at 20:00**: reminder about unfinished tasks and unchecked habits (while tab is open)

### Android APK
- System permission dialog appears on first launch — tap Allow
- **Pomodoro**: native alarm via `AlarmManager` — fires even when the app is fully closed
- **Daily at 20:00**: background job via `WorkManager` — fires even when the app is fully closed

---

## 💾 Data & Privacy

All data is stored **locally on your device** in IndexedDB (~500 MB limit). Nothing is sent to any server. See [Privacy Policy](PRIVACY.md).

- **Export** — "Export" button in the top bar → saves `life-rpg-backup.json`
- **Import** — "Import" button → pick your saved file

> ⚠️ Clearing browser data will erase your progress. Export regularly.

---

## 🎨 Themes

Switch via the icon button in the top-right corner.

| | Theme | Style |
|---|------|-------|
| <img src="readme_assets/theme-dark.png" width="22" height="22"> | Default | Dark blue — `#2e4369` · `#455bb2` · `#cdd3fd` |
| <img src="readme_assets/theme-ac.png" width="22" height="22"> | Assassin's Creed | Parchment, warm brown tones |
| <img src="readme_assets/theme-mythic.png" width="22" height="22"> | Solo Leveling | Dark purple with neon accents |

---

## 🚀 Local Development

### Requirements
- [Node.js](https://nodejs.org/) 18+

```bash
cd nstp3-rpg
npm install
npm run dev        # → http://localhost:5173
```

### Build for GitHub Pages
```bash
npm run build
```

### Build for Android APK
```bash
BUILD_TARGET=android npm run build
```

### One-command rebuild & copy to Android Studio
```bash
cd nstp3-rpg && \
BUILD_TARGET=android npm run build && \
rm -r ~/AndroidStudioProjects/Nstp3RPG/app/src/main/assets/* && \
cp -r dist-android/* ~/AndroidStudioProjects/Nstp3RPG/app/src/main/assets && \
echo "✓ Done — build APK in Android Studio"
```

Then in Android Studio: **Build → Generate Signed APK → release → Finish**

### Test on mobile (same Wi-Fi)
```bash
npm run dev -- --host
```

---

## 📁 Project Structure

```
nstp3-rpg/
├── android_version/
│   └── app-release.apk
├── readme_assets/
├── PRIVACY.md
├── index.html
├── package.json
├── vite.config.js
├── assets/
└── src/
    ├── main.js
    ├── renderer.js
    ├── state.js
    ├── db.js
    ├── notifications.js
    ├── themes.js
    ├── icons.js
    ├── xp.js
    ├── components/
    │   ├── Movies.js
    │   ├── Games.js
    │   ├── Pomodoro.js
    │   ├── Habits.js
    │   ├── Tasks.js
    │   ├── Skills.js
    │   ├── Stats.js
    │   └── ...
    ├── styles/
    ├── ui/
    └── i18n/
```

---

## 🛠️ Stack

| | |
|---|---|
| Bundler | Vite 5 |
| Language | Vanilla JS (ES Modules), no frameworks |
| Styles | CSS Custom Properties, 3 themes |
| Storage | IndexedDB |
| Charts | Chart.js |
| Hosting | GitHub Pages |
| Android | WebView APK (Android Studio / Kotlin), offline |
| Notifications | Web Notifications API + AlarmManager + WorkManager |

---

*Level up your real life* ⚔️
