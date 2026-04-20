# ☕ CaffeeScore v1.6.0 - Obsidian Bento Edition

CaffeeScore is a premium, enterprise-grade digital cupping form designed to modernize the specialty coffee evaluation process. Completely replacing standard paper workflows, it enforces the strict guidelines of the **SCA 2025 Coffee Value Assessment (CVA)** protocol while operating seamlessly across all devices with real-time community interaction.

## 🌟 Key Features

- **Bento Discovery Feed:** A high-fidelity, magazine-style grid for exploring global cupping sessions. Dynamic density logic highlights top-rated and verified roastery results automatically.
- **Top 6 Global Discovery:** The main dashboard now features a real-time feed of the six highest-scoring sessions from the global community.
- **Nano-Compact Authentication:** Hyper-focused and minimalist login experience, perfectly centered for maximum user focus.
- **Headerless Mobile UX:** An immersive, content-first mobile layout that maximizes vertical space by hiding the top navigation.
- **Offline-First PWA:** Full functionality entirely off-grid. Cupping session data is stored locally via IndexedDB and automatically synchronized to Firebase Cloud upon reconnection.
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
- Angular 21
- Firebase V11 (Firestore DB)
- Chart.js (Radar component)
- html2canvas (Image generation)

---

*Designed for the precise palate of the Q-Grader.*
