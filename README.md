# कागज (Kagaj) — Nepali Notepad

> A minimalist, ad-free, mobile-first Nepali notepad that lets you type seamlessly in Romanized Nepali and transliterates it into Devanagari in real time — with full offline support.

---

## ✨ Features

- 🇳🇵 **Instant Nepali Transliteration** — Type in Romanized Nepali (e.g., `namaste` → `नमस्ते`, `nepal` → `नेपाल`) with smart real-time suggestions.
- ⚡ **100% Offline Support** — Includes a built-in phonetic Finite State Machine (FSM) and Frequency-Weighted Lexicon Trie engine. Works completely offline without requiring an active internet connection.
- 🛡️ **Zero-Interruption Google API Fallback** — Uses Google Input Tools API for rich cloud suggestions when online, but if the API fails, gets blocked, or goes offline, Kagaj seamlessly falls back to the local offline engine without showing errors.
- 📱 **Mobile-First Experience** — Built for frictionless mobile typing with quick thumb-accessible suggestion pills, locked zoom gestures, and clean UI navigation.
- 🚫 **100% Ad-Free & Distraction-Free** — No popups, no trackers, no login required. Just open and write.
- 📅 **Bikram Sambat (BS) Calendar** — Automatically displays today's Nepali date (e.g., `आश्विन १४ गते, बुधवार`) in Nepali mode and Gregorian date in English mode.
- 🔢 **Nepali Numerals & Word Counter** — Live word counter formatted in Devanagari digits (`५ शब्दहरू`) or English (`5 words`).
- 🌐 **Dual Language & UI Mode** — One-tap switcher to toggle between Romanized Nepali transliteration and Direct English typing mode, with full dynamic UI localization.
- 🌙 **Dark / Night Mode** — Eye-friendly dark theme and light theme.
- 🎨 **18-Color Wallpaper Palette** — Customize your workspace background color on desktop.
- 💾 **Local Persistence** — Auto-saves your notes, custom transliteration memory preferences, and theme settings directly in your browser (`localStorage`).
- 📋 **Quick Actions** — One-tap clipboard copy with visual feedback, and custom localized clear confirmation dialog.

---

## ⚡ Offline Support & Hybrid Transliteration

Kagaj is designed to be fully functional without relying on external servers. It uses a **Hybrid Transliteration Engine** combining instant local execution with cloud enrichment:

1. **Instant Offline Engine (<1ms Latency)**:
   - **Phonetic Rule FSM**: Deterministically handles consonant conjuncts (`virama / ्`), independent vowels, dependent matras, numerals (`०-९`), Chandrabindu (`**`/`~n`), Anusvara (`*`), and Visarga (`:`).
   - **Lexicon Trie**: Resolves schwa deletions and common Roman colloquial spellings (`ramro` → `राम्रो`, `ghar` → `घर`, `tapaiko` → `तपाईंको`).
   - **Dynamic Local Memory**: User-selected words are cached locally in your browser (`localStorage`) and dynamically prioritized in future suggestions.

2. **Smart API Debouncing**:
   - Cloud suggestion queries are debounced (250ms) to ensure minimal network traffic and smooth typing without redundant requests on fast keystrokes.

3. **Seamless Google API Fallback**:
   - **When online**: Kagaj fetches additional suggestions from the Google Input Tools API to enrich local suggestions.
   - **When offline or if Google API fails**: If the API call times out, encounters network errors, gets blocked, or fails for any reason, Kagaj **silently falls back to the built-in offline engine**. Typing remains 100% functional with zero disruptions, popups, or error messages.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vite.dev/)
- **UI & Components**: [Mantine UI v7](https://mantine.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with `persist` middleware)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Calendar & Formatting**: `ad-bs-converter` for Bikram Sambat conversions
- **Cursor Tracking**: `textarea-caret`

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher) and **npm** installed on your machine.

### Installation

Clone the repository and install the dependencies:

```bash
# Clone repository
git clone git@github.com:bibhuticoder/kagaj.git
cd kagaj

# Install dependencies
npm install
```

### Running Locally (Development)

Start the local Vite development server:

```bash
npm run dev
```

To access the app from your mobile device over the local Wi-Fi network:

```bash
npm run dev -- --host
```

Open your browser at `http://localhost:3000/` (or the Network IP displayed in the terminal for mobile access).

### Production Build

Create an optimized production bundle:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 📄 License

Open-source under the [MIT License](LICENSE).
