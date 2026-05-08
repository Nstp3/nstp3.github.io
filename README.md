Razl — Plan Fast
<div align="center">
  <table>
    <tr>
      <td align="center"><img src="readme_assets/preview.png" width="100%" alt="Desktop"><br><sub>Desktop — все три темы</sub></td>
      <td align="center" width="30%"><img src="readme_assets/preview-mobile.jpg" width="100%" alt="Mobile"><br><sub>Mobile — Solo Leveling</sub></td>
    </tr>
  </table>
<strong>🇬🇧 English</strong>  ·  <a href="README.ru.md">🇷🇺 Русский</a>
  <br>
<a href="https://nstp3.github.io/">🌐 Live Demo</a>  · 
<a href="android_version/app-release.apk">⬇️ Android APK</a>  · 
<a href="PRIVACY.md">🔒 Privacy Policy</a>
</div>
<br>
A personal RPG-style productivity dashboard. Turn your daily tasks, habits and skills into character progression. Runs entirely in the browser — no install, no server, no account needed.

✨ Features

Hero profile — avatar, level, XP / Daily XP, game trophy and movie award badges
Stats — Health, Mood, Stamina, Motivation with progress bars
Tasks — add by category, recurring tasks, completing earns XP
Skills — level up 6 skill tracks with visual progress bars
Radar chart — spider chart showing your current skill balance
Habits — calendar-style monthly tracker with drag-to-select and day labels
Pomodoro — accurate focus timer, state persists after notifications
Activity — 14-day activity line chart
3 themes — Default · Assassin's Creed · Solo Leveling
Export / Import — JSON backup (razl-backup.json)
Bilingual — RU / EN
Notifications — pomodoro alerts + daily task & habit reminders (web + Android)
Movies — watchlist with poster, status filters, watched tracker and film award progression
Games — game library with cover, source link, completion tracker and trophy progression


🗂️ Layout
Desktop
Two-column layout with all blocks visible at once. Habits can be collapsed — click any habit row to toggle, or use "expand all" next to the Habits heading.
Mobile (bottom navigation)
TabContents👤 HeroProfile · Stats · Radar✅ TasksTasks · Activity chart⚔️ SkillsSkills · Calendar🔥 HabitsPomodoro · Habits🎬 LeisureLocal player · Movies · Games

✅ Tasks — Recurring Tasks
Create a recurring task
Select ♻️ Recurring from the category dropdown before adding.
Manage recurring tasks
ActionHowRemove recurring flagTap the 🔄 icon on the taskToggle recurring (mobile)Long-press the task ~0.6s → phone vibrates

🎮 Games — Trophy System
CompletedTrophyNext goal0–9—1010+🥉 Bronze5050+🥈 Silver100100+🥇 Gold250250+💎 Platinum500500+💜 Purple10001000+👑 LegendaryMAX
Trophy appears next to the hero's name. Each new trophy replaces the previous one.

🎬 Movies — Film Award System
WatchedAwardNext goal0–9—1010+🥉 Bronze reel2525+🥈 Silver reel5050+🥇 Gold reel100100+🏅 Platinum reel250250+💚 Green reel500500+🔴 Red reel750750+💜 Purple reel10001000+💠 Diamond reelMAX
Film award appears next to the hero's name alongside the game trophy.

📱 Android APK
Works offline — all files are bundled inside the app.
Download
⬇️ Download app-release.apk
Install

Download app-release.apk
Open on your phone
If prompted → Settings → Security → Allow installs from unknown sources
Tap Install


⚠️ Self-signed APK, not on Google Play — fine for personal use.


📱 Add to Home Screen (without APK)
Android — Brave / Chrome
Tap ⋮ → "Add to Home Screen" → Confirm
iPhone — Safari
Tap Share → "Add to Home Screen" → Confirm

🔔 Notifications
Web

Tap "🔔 Tap to enable notifications" under Pomodoro
Pomodoro: alert when session/break ends — works on another tab
Daily at 20:00: reminders about unfinished tasks and habits

Android APK

Pomodoro: AlarmManager — fires even when app is closed
Daily at 20:00: WorkManager — fires even when app is closed
Tapping a notification reopens the app without resetting the timer


⏱ Pomodoro
ControlActionStartBegin work sessionPauseFreeze remaining timeResumeContinue from where pausedResetReturn to full durationApplySave new durations and reset
Timer state is persisted — returning from a notification or background does not reset it.

💾 Data & Privacy
All data stored locally on your device in IndexedDB. Nothing sent to servers. See Privacy Policy.

Export → saves razl-backup.json
Import → restore from backup file


🎨 Themes
ThemeStyle<img src="readme_assets/theme-dark.png" width="22" height="22">DefaultDark blue — #2e4369 · #455bb2 · #cdd3fd<img src="readme_assets/theme-ac.png" width="22" height="22">Assassin's CreedParchment, warm brown<img src="readme_assets/theme-mythic.png" width="22" height="22">Solo LevelingDark purple, neon accents

🚀 Local Development
bashnpm install
npm run dev        # → http://localhost:5173
npm run build      # GitHub Pages → dist/
BUILD_TARGET=android npm run build   # Android → dist-android/
One-command Android rebuild
bashBUILD_TARGET=android npm run build && \
rm -r ~/AndroidStudioProjects/Nstp3RPG/app/src/main/assets/* && \
cp -r dist-android/* ~/AndroidStudioProjects/Nstp3RPG/app/src/main/assets

🛠️ Stack
BundlerVite 5LanguageVanilla JS (ES Modules)StorageIndexedDBChartsChart.jsHostingGitHub PagesAndroidWebView APK (Kotlin), offlineNotificationsWeb Notifications API + AlarmManager + WorkManager

Plan fast. Level up your real life. ⚔️