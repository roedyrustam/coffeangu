# CaffeeScore v1.2.0 Blueprint

## 1. System Architecture
CaffeeScore is a modern web application built on **Angular 19** utilizing Server-Side Rendering (SSR) optionally, but fundamentally designed as an **Offline-First Progressive Web App (PWA)**. 

### Core Tech Stack:
- **Framework**: Angular 19 (Standalone Components)
- **Styling**: Pure CSS3 variables with the **2026 Obsidian & Radiant Ember** design system.
- **Backend/Database**: Firebase V11 (Firestore & Storage)
- **Authentication**: Firebase Auth (Google Redirect for Mobile, Pop-up for Desktop)
- **Visualization**: Chart.js 4 (Radar Chart) + html2canvas for image snapshots.
- **OCR Engine**: Tesseract.js (AI autofill via package sticker scanning).
- **Asset Generation**: Integrated AI generation for premium fallback product images.

## 2. Directory Structure
```text
CaffeeScore/
├── public/                 # PWA Manifest, Icons, and static assets
│   ├── assets/             # System fallback images (Premium default photos)
├── src/
│   ├── app/
│   │   ├── components/     
│   │   │   ├── dashboard/       # Interactive Command Center (FAB + Stats Carousel)
│   │   │   ├── cupping-form/    # Core sensory input + AI Photo Upload
│   │   │   ├── cupping-result/  # Social Action Bar + Radar Chart visualization
│   │   │   ├── community-board/ # Global discovery feed with Social synchronization
│   │   │   ├── auth/            # Mobile-optimized Redirect handshake
│   │   ├── models/              # TypeScript Interfaces (CuppingSession, SensoryScores)
│   │   ├── services/            # Firebase injection and Atomic Social Handlers
│   │   └── app.component.ts     # Main Shell & Glassmorphism Nav
│   ├── styles.css           # Global Design System (Color Tokens, Mesh Glows)
│   └── index.html
├── ngsw-config.json         # Service Worker aggressive caching rules
└── package.json             # Core dependency map (v1.2.0)
```

## 3. Data Flow Model
1. **Gatekeeping**: `CuppingFormComponent` blocks form entry via an SCA Preparation overlay.
2. **Product Identification**: Users can upload a photo (manual) or scan a sticker (AI OCR) to autofill metadata.
3. **Data Logging**: Evaluators input *Affective* & *Descriptive* CVA scores (Range 6-10).
4. **Atomic Social Interaction**: User 'Likes' and 'Saves' are executed via Firestore `arrayUnion`/`arrayRemove` to ensure cross-device consistency.
5. **Data Visualization**: `CuppingResultComponent` fetches the unified object, recalculates the final average, and orchestrates Chart.js to map radar vertices over an HSL-calculated dark background.

## 4. Key Design Decisions
- **Obsidian & Radiant Ember Palette**: `#0c0c0e` background. Bronze gradients for primary actions. Acid Lime (`#d4e157`) for specialty grade (80+).
- **Mobile Handshake**: Detects mobile user agents to force `signInWithRedirect`, preventing traditional pop-up blocking issues on iOS/Android.
- **Atomic Concurrency**: Social metrics use Firestore `increment()` and Atomic Array operations to prevent race conditions during community engagement.
- **Static Asset Fallback**: Every cupping session is visually anchored by either a user-uploaded photo or a professionally generated system default.
