# कागज (Kagaj) — Nepali Notepad

> A minimalist, ad-free, mobile-first Nepali notepad that lets you type seamlessly in Romanized Nepali and transliterates it into Devanagari in real time.

---

## ✨ Features

- 🇳🇵 **Instant Nepali Transliteration** — Type in Romanized Nepali (e.g., `namaste` → `नमस्ते`, `nepal` → `नेपाल`) with smart live suggestions.
- 📱 **Mobile-First Experience** — Built for frictionless mobile typing with quick thumb-accessible suggestion pills, locked zoom gestures, and clean UI navigation.
- 🚫 **100% Ad-Free & Distraction-Free** — No popups, no trackers, no login required. Just open and write.
- 📅 **Bikram Sambat (BS) Calendar** — Automatically displays today's Nepali date (e.g., `आश्विन १४ गते, बुधवार`) in Nepali mode and Gregorian date in English mode.
- 🌙 **Dark / Night Mode** — Eye-friendly dark theme and light theme.
- 💾 **Local Persistence** — Auto-saves your notes, custom transliteration memory preferences, and theme settings directly in your browser (`localStorage`).
- 📋 **Quick Actions** — One-tap clipboard copy with visual feedback, and quick clear.

---

## ⚠️ Important Note on Google Transliteration API

Kagaj uses **Google Input Tools API** (`https://inputtools.google.com/request`) for phonetic Romanized-to-Devanagari transliteration. 

> **Disclaimer**: This relies on Google's public endpoint. Because this is an external, undocumented Google endpoint, Google may change, rate-limit, or deprecate the API at any point without prior notice, which could break or impact the real-time transliteration feature. Kagaj caches chosen suggestions locally in memory to minimize redundant network requests and improve reliability.

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
