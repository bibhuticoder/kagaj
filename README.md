# कागज (Kagaj) — Nepali Notepad

> A minimalist, ad-free, mobile-first Nepali notepad that lets you type seamlessly in Romanized Nepali and transliterates it into Devanagari in real time — with full offline support.

---

## ✨ Features

- 🇳🇵 **Instant Nepali Transliteration** — Type in Romanized Nepali (e.g., `namaste` → `नमस्ते`, `nepal` → `नेपाल`) with smart real-time suggestions.
- ⚡ **Full Offline Support** — Built-in phonetic Finite State Machine (FSM) and Frequency-Weighted Lexicon Trie engine. Works 100% offline without needing an active internet connection.
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

## ⚡ Transliteration Architecture & Offline Engine

Kagaj uses a resilient **Hybrid Transliteration Engine**:

1. **Instant Offline Engine (0ms Latency)**:
   - **Phonetic Rule FSM**: Deterministically handles consonant conjuncts (`virama / ्`), independent vowels, dependent matras, numerals (`०-९`), Chandrabindu (`**`/`~n`), Anusvara (`*`), and Visarga (`:`).
   - **Lexicon Trie**: Resolves schwa deletions and common Roman colloquial spellings (`ramro` → `राम्रो`, `ghar` → `घर`, `tapaiko` → `तपाईंको`).
   - **Dynamic Learning**: User-preferred words are cached in `localStorage` and dynamically indexed into the trie.

2. **Google Input Tools API Enrichment**:
   - For additional vocabulary, debounced requests (250ms delay) are sent to Google's public endpoint.

3. **Resilient Offline Fallback**:
   - **If the Google API is unreachable, rate-limited, blocked, or changed, the application seamlessly falls back to the built-in offline engine with zero errors or disruption.**

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
