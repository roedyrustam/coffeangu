# CaffeeScore v1.0.0 Blueprint

## 1. System Architecture
CaffeeScore is a modern web application built on **Angular 19** utilizing Server-Side Rendering (SSR) optionally, but fundamentally designed as an **Offline-First Progressive Web App (PWA)**. 

### Core Tech Stack:
- **Framework**: Angular 19 (Standalone Components)
- **Styling**: Pure CSS3 variables with highly customized "Premium Dark" theme.
- **Backend/Database**: Firebase V11 (Firestore)
- **Visualization**: Chart.js 4 (Radar Chart) -> `ng2-charts` wrapper implicitly / native.
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
- **Premium Dark Palette**: `#121212` background, `#1e1e1e` surfaces. Selected specifically to reduce cupper eye strain inside bright/flashy laboratories or dimly lit roasteries.
- **SCA 2025 Value Assessment Protocol**: Follows the strict 4-minute steep / 8.25g golden ratio workflow before data entry begins.
