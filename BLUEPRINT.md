# CuppingNotes v1.8.0 Blueprint

## 1. System Architecture
CuppingNotes is a modern web application built on **Angular 21** utilizing the new `@angular/build:application` builder. It is fundamentally designed as an **Offline-First Progressive Web App (PWA)** with a professional production deployment on **Vercel**.

### Core Tech Stack:
- **Framework**: Angular 21 (Standalone Components, Signal-based State, **Angular SSR**)
- **Deployment**: Vercel (Production: `cuppingnotes.online`)
- **Styling**: Pure CSS3 variables with the **2026 Obsidian & Radiant Ember** design system.
- **Backend/Database**: Firebase V11 (Firestore & Storage)
- **Authentication**: Firebase Auth (Google Redirect for Mobile, Pop-up for Desktop)
- **Visualization**: Chart.js 4 (Radar Chart) + html2canvas for social sharing artifacts.
- **Social Ecosystem**: Integrated Social Sharing API with **True SSR Meta-tag Injection** for Threads, WhatsApp, and Facebook.
- **B2B Infrastructure**: Role-based team management with Verified Roastery badges and Shop URL integration.

## 2. Directory Structure
```text
CuppingNotes/
├── public/                 # PWA Manifest, Icons, and static assets
│   ├── assets/             # System fallback images (Premium default photos)
├── src/
│   ├── app/
│   │   ├── components/     
│   │   │   ├── dashboard/       # Interactive Command Center (Top 6 Global Discovery Feed)
│   │   │   ├── cupping-form/    # Core sensory input + AI Photo Upload
│   │   │   ├── cupping-result/  # Radar Chart visualization + Social Share Integration
│   │   │   ├── community-board/ # Bento-style Discovery Grid (Dynamic density logic)
│   │   │   ├── social-share/    # Reusable cross-platform sharing component
│   │   │   ├── sensory-avatar/  # Dynamic user identity based on cupping data
│   │   ├── models/              # TypeScript Interfaces (CuppingSession, UserProfile)
│   │   ├── services/            # Firebase injection and Atomic Social Handlers
│   │   └── app.component.ts     # Main Shell & Glassmorphism Nav
│   ├── styles.css           # Global Design System (Color Tokens, Mesh Glows)
│   └── index.html
├── vercel.json              # Production routing and **SSR Gateway** configuration
├── ngsw-config.json         # Service Worker aggressive caching rules
├── firebase.json            # Security rules and backend configuration
└── package.json             # Core dependency map (v1.8.0)
```

## 3. Data Flow Model
1. **Gatekeeping**: `CuppingFormComponent` blocks form entry via an SCA Preparation overlay.
2. **Product Identification**: Users can upload a photo (manual) or scan a sticker (AI OCR) to autofill metadata.
3. **Data Logging**: Evaluators input *Affective* & *Descriptive* CVA scores (Range 6-10).
4. **Atomic Social Interaction**: User 'Likes' and 'Saves' are executed via Firestore `arrayUnion`/`arrayRemove`.
5. **Data Visualization**: `CuppingResultComponent` recalculates final scores and renders Chart.js radar vertices.
6. **Social Broadcasting**: `SocialShareComponent` triggers native sharing or platform-specific deep links (WhatsApp/X).

## 4. Key Design Decisions
- **Obsidian & Radiant Ember Palette**: `#0c0c0e` background. Bronze gradients for primary actions. Acid Lime (`#d4e157`) for specialty grade (80+).
- **Angular SSR Implementation**: Migrated from static rewrites to true Server-Side Rendering via `@angular/ssr` on Vercel. This enables dynamic Open Graph (OG) tag injection for premium social media link previews (Threads, Facebook, etc.).
- **Mobile Handshake**: Detects mobile user agents to force `signInWithRedirect`, preventing traditional pop-up blocking issues.
- **Premium Coffee Iconography**: Custom coffee-themed SVG icons for mobile navigation (Coffee Cup for Discover, Coffee Bean for History).
- **Handle-based Routing**: Supports professional vanity URLs (e.g., `cuppingnotes.online/u/@handle`) for public profiles.
- **B2B Commerce Bridge**: Roastery-verified sessions include denormalized commerce links (`buyLink`) to facilitate direct sales.
- **Bento Discovery Architecture**: magazine-style grid using `grid-auto-flow: dense` for community feeds.
- **Headerless Mobile UX**: Bottom navigation focus on devices <= `768px` to maximize data scannability.
- **Deep Stability Audit (v1.8.0)**: Hardened Firestore/Storage security rules, memory leak prevention (Chart.js/Global Listeners), and a new reactive **Toast Notification System** for premium user feedback.
