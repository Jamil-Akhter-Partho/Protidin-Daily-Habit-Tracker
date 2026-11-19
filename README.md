# Protidin (প্রতিদিন) — Daily Habit Tracker

<div align="center">

![Protidin Banner](https://img.shields.io/badge/Protidin-Daily_Habit_Tracker-e84393?style=for-the-badge&logo=target&logoColor=white)

**A beautifully animated, privacy-first, client-side daily habit tracker engineered for visual consistency, gamified progression, and aesthetic delight.**

[![React 19](https://img.shields.io/badge/React-19.3-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 7](https://img.shields.io/badge/TypeScript-7.0-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.3-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square)](LICENSE)

</div>

---

## 📖 Overview

**Protidin** (*Bengali for "Everyday" / "প্রতিদিন"*) is an all-in-one, distraction-free habit-building application that bridges productivity tracking with organic aesthetic satisfaction. Unlike cloud-gated or subscription-heavy habit trackers, Protidin runs entirely inside your browser with **zero backend dependencies**, **zero analytics tracking**, and **instant local storage persistence**.

With Protidin, every habit completion is tangible: habits visually sprout and blossom into lush trees, interactive meadow charts rise with your daily discipline, and milestone XP levels turn consistency into a rewarding journey.

---

## ✨ Key Features

### 🌸 1. Dual Visual Aesthetic Modes
Switch between two bespoke visual modes designed for different workflows:

* **Garden Mode (Botanical Gamification):**
  * **Living Habit Tree (`Plant`):** Grows dynamically through 5 botanical stages (Seedling → Sprout → Sapling → Budding → Full Bloom Tree) with organic swaying canopies and floating Sakura petals.
  * **Living Progress Blooms:** Frosted glass hero stat pills reacting to your progress (`TodayBloom`, `GoalBloom`, `StreakBloom`).
  * **Flower Meadow Chart:** Custom SVG data visualization where every single day sprouts an individual flower whose stem height corresponds directly to daily completion. Features cladded average lines and floating pills that never bury into the soil.
  * **Weekday Flower:** A 7-petal radial flower where each petal dynamically expands according to your strongest days of the week.
  * **Weekly Blooms:** Weekly circular rings with pulsating petals and a spinning golden Whole-Month Crown bloom.
* **Classic Mode (Clean Modern SaaS):**
  * Bento-style KPI cards (`Today`, `Monthly goals`, `Best active streak`, `Perfect days`) with sleek progress bars.
  * Radial donut gauges and weekday performance velocity bar charts.
  * Interactive Rhythm trend-line with day hover tooltips and habit breakdown popovers.

---

### 🎨 2. Comprehensive Theming & OKLCH Color Engine
Protidin leverages modern CSS Custom Properties with OKLCH color spaces for perceptual uniformity:

| Theme Modes | Description |
| :--- | :--- |
| **System** | Automatically syncs with operating system light/dark preferences. |
| **Light** | Crisp, bright, clean paper-white aesthetic with gentle drop shadows. |
| **Dark** | High-contrast, easy-on-the-eyes dark palette with glowing accents. |
| **Night** | True `#000000` pitch-black mode optimized for OLED displays and battery saving. |

* **5 Garden Bloom Palettes:** Choose your floral mood anytime:
  * 🌸 **Pink** (`352°`)
  * 🪻 **Lavender** (`300°`)
  * 🍑 **Peach** (`48°`)
  * 🌿 **Mint** (`165°`)
  * 🌌 **Sky** (`240°`)
* **Zero FOUC:** Includes an inline head script to apply stored themes before first paint, preventing layout or color flashes.

---

### 📅 3. High-Performance Habit Matrix
* **31-Day Calendar Grid:** Divided by weekly groups (Week 1 through Week 5) for effortless monthly planning.
* **Micro-Interactive Toggles:** Smooth checkbox animations with scale pop, expanding ring pulses, and floating `+10 XP` badges.
* **Inline Habit Management:**
  * Reorder habits with instant Move Up / Move Down buttons.
  * In-place editing (custom emojis, habit names, and monthly target day goals).
  * Safe modal confirmation dialogs for destructive actions.
* **Garden Soil View:** Miniature plant stage indicators growing above each day column.

---

### 🏆 4. Gamification & Rewards Engine
Earn experience points and unlock milestones as you build consistency:

* **XP Engine:** Earn **+10 XP** for every habit ticked, plus massive bonus XP from milestone badges.
* **10 Character Titles:** Progress from `Beginner` → `Starter` → `Builder` → `Consistent` → `Committed` → `Dedicated` → `Disciplined` → `Unstoppable` → `Master` → `Legend`.
* **12 Unlockable Badges:**
  * 👣 **First Step** (+20 XP) — *Tick your first habit*
  * 🔥 **Warming Up** (+30 XP) — *3-day streak on a habit*
  * ⭐ **Perfect Day** (+50 XP) — *Finish every habit in one day*
  * ⚡ **One Week Strong** (+75 XP) — *7-day streak on a habit*
  * 🚀 **Getting Serious** (+75 XP) — *50 habits ticked*
  * 🎯 **Goal Crusher** (+100 XP) — *Reach a monthly goal*
  * ✨ **Perfect Week** (+150 XP) — *7 perfect days in a row*
  * 🛡️ **Habit Formed** (+200 XP) — *21-day streak on a habit*
  * 🏅 **Momentum** (+200 XP) — *250 habits ticked*
  * 🏆 **Clean Sweep** (+300 XP) — *Reach every goal in a month*
  * 💎 **Iron Will** (+400 XP) — *50-day streak on a habit*
  * 👑 **Thousand Club** (+500 XP) — *1,000 habits ticked*
* **Celebration FX:** Fullscreen celebratory confetti bursts, floating experience markers, and level-up popups.
* **Botanical Badges:** Locked badges appear as sleeping buds that gently sway in the breeze; unlocked badges bloom into tiered multi-petal flowers with golden sparkle stars.

---

### 🔒 5. Privacy-First & Zero Backend
* **100% Client-Side:** No sign-up, no login, no tracking cookies, and no database servers.
* **Local Storage Persistence:** Uses structured, versioned state keys (`protidin:v1`).
* **Self-Healing Corruption Guard:** Validates schemas on load; preserves an unreadable rescue copy rather than wiping your data if storage is corrupted.
* **1-Click Backup & Restore:** Export your entire tracker state into clean `.json` format and restore it anytime across devices or browsers.

---

### ♿ 6. Accessibility & Motion Craftsmanship
* **Reduced Motion Compliant:** Strict support for `@media (prefers-reduced-motion: reduce)`, instantly dampening all SVG physics and transitions for sensitive users.
* **Keyboard Accessible:** Full keyboard navigation across daily habit slots, date headers, and dialogs with prominent focus-visible rings.
* **Responsive Layouts:** Finely tuned CSS grids that adapt gracefully from ultrawide monitors down to 14-inch laptops and smaller tablets.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** (`^19.3.1`) | Functional components, modern hooks (`useReducer`, `useMemo`, `useCallback`) |
| **Language** | **TypeScript 7** (`^7.0.2`) | Strict type checking (`strict: true`, zero `any`) |
| **Bundler & Tooling** | **Vite 8** (`^8.3.8`) | Ultra-fast HMR and optimized production asset pipeline |
| **Styling & Design** | **Tailwind CSS v4** (`^4.3.5`) | Pure CSS theme tokens, OKLCH gradients, `@theme inline` |
| **Icons** | **Lucide React** (`^1.71.0`) | Modern, crisp SVG icons |
| **Typography** | **Fontsource Variable** | *Fredoka*, *Nunito*, *Inter*, and *Bricolage Grotesque* |
| **State Management** | **React Reducer + LocalStorage** | Zero boilerplate, deterministic state updates, schema validator |

---

## 📁 Project Structure

```text
Protidin-Daily-Habit-Tracker/
├── public/                 # Static public assets (icons, favicons)
├── src/
│   ├── components/         # Modular UI Components
│   │   ├── Celebration.tsx # Confetti, XP floaters, unlock popups
│   │   ├── Charts.tsx      # Donut gauges & weekday bar charts
│   │   ├── DayFocus.tsx    # Accessible day hover & tooltip management
│   │   ├── Garden.tsx      # GardenCard, Meadow chart, WeekdayFlower, WeeklyBlooms
│   │   ├── HabitGrid.tsx   # 31-day weekly habit grid & checkbox rows
│   │   ├── HabitModal.tsx  # Add / Edit habit modal form
│   │   ├── Header.tsx      # Top nav, month switcher, backup/restore buttons
│   │   ├── Modal.tsx       # Accessible dialog backdrop & portal
│   │   ├── Plant.tsx       # 5-stage SVG botanical plant renderer
│   │   ├── Rewards.tsx     # Gamification panel, LevelWreath, BadgeBloom
│   │   ├── RhythmChart.tsx # Classic monthly rhythm trendline
│   │   ├── StatCards.tsx   # Classic Bento metric cards
│   │   └── ThemeMenu.tsx   # Theme (System/Light/Dark/Night) & Bloom palette picker
│   ├── lib/                # Pure Business Logic & State Utilities
│   │   ├── date.ts         # Pure date calculation utilities (no external deps)
│   │   ├── hooks.ts        # Custom React hooks (count-up animations, focus)
│   │   ├── rewards.ts      # XP calculations, badge definitions, leveling logic
│   │   ├── stats.ts        # Monthly completion aggregation & streaks
│   │   ├── store.ts        # Reducer, local storage sync & JSON schema validator
│   │   └── theme.ts        # Theme & bloom state management
│   ├── App.tsx             # Root dashboard controller & layout orchestrator
│   ├── garden.css          # OKLCH design tokens, SVG floral animations & keyframes
│   ├── index.css           # Global typography, Tailwind v4 imports & base styles
│   └── main.tsx            # Vite React 19 application entrypoint
├── index.html              # HTML shell with zero-FOUC theme bootstrapper
├── package.json            # Node dependencies and project scripts
├── tsconfig.json           # Strict TypeScript configuration
└── vite.config.ts          # Vite build config with relative base path support
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (version 18 or higher recommended) installed on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/Jamil-Akhter-Partho/Protidin-Daily-Habit-Tracker.git
cd Protidin-Daily-Habit-Tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Local Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
To build a production-ready bundle:
```bash
npm run build
```
The optimized static build will be generated in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🌐 Deployment

Protidin is configured with a relative base path (`base: './'`), meaning the output `dist/` folder can be hosted on any static hosting provider without configuration changes:

* **Vercel:** Auto-detected as a `Vite` application preset. Zero config required.
* **Netlify:** Set publish directory to `dist` and build command to `npm run build`.
* **GitHub Pages:** Deploy the built `dist` folder directly to the `gh-pages` branch.

---

## 📄 License

This project is open-source under the **[MIT License](LICENSE)**. Feel free to use, customize, and extend it for your own personal productivity journey.

---

<div align="center">

Crafted with 💚 for daily discipline and mindful habit growth.  
**Build your streak, watch your garden bloom!**

</div>
