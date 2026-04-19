# ☕ CaffeeScore v1.1.0

CaffeeScore is a premium, enterprise-grade digital cupping form designed to modernize the specialty coffee evaluation process. Completely replacing standard paper workflows, it enforces the strict guidelines of the **SCA 2025 Coffee Value Assessment (CVA)** protocol while operating seamlessly without an internet connection in farms or roasting laboratories.

## 🌟 Key Features

- **Offline-First PWA:** Full functionality entirely off-grid. Cupping session data is stored locally via IndexedDB and automatically synchronized to Firebase Cloud upon reconnection.
- **SCA Protocol Gatekeeping:** Interactive checklist ensuring standardized extraction metrics (Ratio, Temp, Time) before scoring begins.
- **Obsidian & Radiant Ember Theme (2026):** A premium, high-contrast dark theme using `#0c0c0e` backgrounds with Radiant Bronze and Acid Lime accents for maximum professional clarity.
- **SCA Flavor Wheel Visual Picker:** An interactive, hierarchical flavor wheel based on the official SCA lexicon, allowing evaluators to precisely map flavor profiles via a sunburst-style navigation.
- **Advanced Radar Generation:** Instantly map sensory data onto dynamic Radar Charts with built-in export to PNG capabilities.
- **SSR-Ready Architecture:** Improved handling for library loading (e.g., Tesseract.js) to ensure seamless performance in Angular 19 SSR environments.
## 🚀 Getting Started

### Prerequisites
- Node.js `v18+`
- Angular CLI `v19+`

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server
Run `npm run dev` or `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### PWA Production Build
To test the offline Service Worker, the application must be built into production output:
```bash
npm run build
npx http-server dist/coffeescore/browser
```

## 📚 Official Documentation
For deep-dive architecture reading and system objectives:
- [BLUEPRINT.md](./BLUEPRINT.md) - System Architecture & Tech Stack Details
- [PRD.md](./PRD.md) - Product Requirements & Business Vision 

## 🛠 Required Technologies
- Angular 19
- Firebase V11 (Firestore DB)
- Chart.js (Radar component)
- html2canvas (Image generation)

---

*Designed for the precise palate of the Q-Grader.*
