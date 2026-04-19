# CaffeeScore v1.1.0 Blueprint

## 1. System Architecture
CaffeeScore is a modern web application built on **Angular 19** utilizing Server-Side Rendering (SSR) optionally, but fundamentally designed as an **Offline-First Progressive Web App (PWA)**. 

### Core Tech Stack:
- **Framework**: Angular 19 (Standalone Components)
- **Styling**: Pure CSS3 variables with the **2026 Obsidian & Radiant Ember** design system.
- **Backend/Database**: Firebase V11 (Firestore)
- **Visualization**: Chart.js 4 (Radar Chart) + html2canvas for image snapshots.
- **OCR Engine**: Tesseract.js (loaded dynamically to support SSR pre-rendering).
- **Offline Persistence**: `@angular/pwa` Service Workers + IndexedDB Firestore LocalCache.

## 2. Directory Structure
```text
CaffeeScore/
├── public/                 # PWA Manifest, Icons, and static assets
├── src/
│   ├── app/
│   │   ├── components/     
│   │   │   ├── dashboard/       # Global Analytics & Recent Scores
│   │   │   ├── cupping-form/    # Core sensory input + SCA Checklist Gatekeeping
│   │   │   ├── cupping-result/  # Radar chart visualization + html2canvas engine
│   │   ├── models/              # TypeScript Interfaces (CuppingSession, SensoryScores)
│   │   ├── services/            # Firebase injection and local-first data handlers
│   │   └── app.component.ts     # Main Shell & Glassmorphism Nav
│   ├── styles.css           # Global Design System (Color Tokens, Typography)
│   └── index.html
├── ngsw-config.json         # Service Worker aggressive caching rules
└── package.json             # Core dependency map (v1.0.0)
```

## 3. Data Flow Model
1. **Gatekeeping**: `CuppingFormComponent` blocks form entry via an SCA Preparation overlay.
2. **Data Logging**: Evaluators input *Affective* & *Descriptive* CVA scores (Range 6-10).
3. **Local Store**: Data is written to Firestore IndexedDB cache instantly (Zero-latency UI).
4. **Cloud Sync**: Firebase JS SDK synchronizes to the cloud bucket silently in the background when an online connection is established.
5. **Data Visualization**: `CuppingResultComponent` fetches the unified object, recalculates the final average, and orchestrates Chart.js to map radar vertices over an HSL-calculated dark background.

## 4. Key Design Decisions
- **Obsidian & Radiant Ember Palette**: `#0c0c0e` background, `#161618` surfaces. Bronze gradients (`#bd8e62` to `#e5bc7d`) for primary actions. Acid Lime (`#d4e157`) for success and specialty indicators.
- **Dynamic Module Loading**: Tesseract.js is imported dynamically inside interaction methods to prevent `__dirname` resolution errors in Vite-based Angular SSR environments.
- **SCA 2025 Value Assessment Protocol**: Follows the strict 4-minute steep / 8.25g golden ratio workflow before data entry begins.
