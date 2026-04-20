# ☕ CaffeeScore v1.2.0

CaffeeScore is a premium, enterprise-grade digital cupping form designed to modernize the specialty coffee evaluation process. Completely replacing standard paper workflows, it enforces the strict guidelines of the **SCA 2025 Coffee Value Assessment (CVA)** protocol while operating seamlessly across all devices with real-time community interaction.

## 🌟 Key Features

- **Offline-First PWA:** Full functionality entirely off-grid. Cupping session data is stored locally via IndexedDB and automatically synchronized to Firebase Cloud upon reconnection.
- **Global Community Discovery:** A real-time hub for exploring cupping results from around the world, featuring atomic 'Likes' and 'Saves' for cross-device synchronization.
- **Native Mobile Experience:** Optimized Google Auth redirect handshake and an immersive dashboard featuring dynamic greetings, interactive stats carousels, and mesh-glow aesthetics.
- **Advanced Product Integration:** Enhanced visual storytelling with user-uploaded product photos or premium AI-generated fallbacks for every session.
- **AI OCR Scanning:** Autofill bean information by scanning sticker or packaging via integrated Tesseract.js engine.
- **Obsidian & Radiant Ember Theme (2026):** A premium, high-contrast dark theme using `#0c0c0e` backgrounds with Radiant Bronze and Acid Lime accents for maximum professional clarity.
- **Radar Visualization:** High-fidelity sensory mapping onto dynamic Radar Charts with built-in export to PNG capabilities.
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
