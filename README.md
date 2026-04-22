# ☕ CuppingNotes v1.7.0 - Professional Sensory Evaluation

CuppingNotes is a premium, enterprise-grade digital cupping platform designed to modernize the specialty coffee evaluation process. Completely replacing standard paper workflows, it enforces the strict guidelines of the **SCA 2025 Coffee Value Assessment (CVA)** protocol while operating seamlessly across all devices with native social sharing capabilities.

## 🌟 Key Features

- **Social Sharing Integration:** Native-like sharing buttons for WhatsApp, X (Twitter), Facebook, and LinkedIn. Share your professional assessments instantly with rich media previews.
- **Bento Discovery Feed:** A high-fidelity, magazine-style grid for exploring global cupping sessions. Dynamic density logic highlights top-rated results.
- **Vercel Production Hardening:** Fully optimized for `cuppingnotes.online` with robust SPA routing rules to prevent 404 errors on deep links.
- **Professional User Handles:** Personalized vanity URLs (e.g., `cuppingnotes.online/u/@handle`) for public profile sharing.
- **Offline-First PWA:** Full functionality entirely off-grid. Data is stored locally via IndexedDB and synchronized to Firebase Cloud upon reconnection.
- **AI OCR Scanning:** Autofill bean information by scanning sticker or packaging via integrated Tesseract.js engine.
- **Obsidian & Radiant Ember Theme:** A premium, high-contrast dark theme for maximum professional clarity.
- **Radar Visualization:** High-fidelity sensory mapping onto dynamic Radar Charts with automated Open Graph image generation.

## 🚀 Getting Started

### Prerequisites
- Node.js `v20+`
- Angular CLI `v19+`

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server
Run `npm run dev` for a dev server. Navigate to `http://localhost:4200/`.

### Deployment
This project is configured for seamless deployment on **Vercel**. 
- The `vercel.json` ensures that all routes (like `/result/:id`) correctly resolve to the Angular application.
- Production Domain: `https://cuppingnotes.online`

## 📚 Official Documentation
For deep-dive architecture reading and system objectives:
- [BLUEPRINT.md](./BLUEPRINT.md) - System Architecture & Tech Stack Details
- [PRD.md](./PRD.md) - Product Requirements & Business Vision 

## 🛠 Tech Stack
- **Framework:** Angular 21 (Signals, Standalone)
- **Hosting:** Vercel
- **Database:** Firebase V11 (Firestore)
- **Analytics/SEO:** Custom SEO Service with Open Graph meta tagging.

---

*Designed for the precise palate of the Q-Grader.*
