# Product Requirements Document (PRD) v1.8.0

## 1. Product Vision
**CuppingNotes** (formerly CaffeeScore) is designed to digitize and elevate the professional coffee sensory evaluation process. Our goal is to replace archaic paper forms with a premium, responsive, and robust offline-first digital application that adheres strictly to the **Specialty Coffee Association (SCA) 2025 CVA Protocol**.

## 2. Target Audience
1. **Q-Graders & Professional Cuppers**: Individuals certifying specialty coffee grades.
2. **Roasters**: Businesses conducting routine quality control on production roasts.
3. **Coffee Farmers/Producers**: Stakeholders analyzing harvest outputs in field environments.
4. **Specialty Enthusiasts**: Home brewers tracking their sensory journey.

## 3. Core Features
### 3.1. SCA Gatekeeping Protocol
- **Requirement:** Users must be presented with the strict SCA Preparation checklist prior to initiating any cupping form instance.
- **Goal:** Drive protocol homogeneity (8.25g / 150ml, 92-94C water, 4 min steep time).

### 3.2. CVA Evaluation Matrix
- **Requirement:** Granular numerical input forms supporting precise interval integers/decimals between 6.0 and 10.0 across flavor categories.
- **Attributes Analyzed:** Fragrance/Aroma, Flavor, Aftertaste, Acidity, Body, Balance, Overall.

### 3.3. Advanced Radar Visualization & Sharing
- **Requirement:** Aggregate scoring dimensions into an interactive Radar Chart.
- **New Feature:** Integrated Social Sharing buttons for WhatsApp, X (Twitter), and Facebook.
- **Goal:** Enable reviewers to share results instantly with professional formatting and Open Graph rich media.

### 3.4. Uncompromising Offline Capability (PWA)
- **Requirement:** 100% operational in areas with 0 Mbps internet speed.
- **Goal:** Firebase Local Persistance caches forms inside browser IndexedDB. Angular Service Worker caches the UI components.

### 3.5. Professional Identity (Public Profiles)
- **Requirement:** Vanity handles (e.g., `@cupper123`) for public sharing.
- **Feature:** Dynamic "Sensory Avatar" that evolves based on the user's historical cupping data.

## 4. UI/UX Specifications
- **Domain**: `cuppingnotes.online`
- **Theme**: "Obsidian & Radiant Ember" 2026 Edition (`#0c0c0e` Root).
- **Typography**: Outfit (Primary) & Playfair Display (Accent/Scores).
- **Routing**: **Angular SSR** on Vercel to support dynamic SEO metadata and deep linking.

## 5. Success Metrics
- 0% data loss during offline rural cupping scenarios.
- Reduction of session logging time compared to manual paper systems.
- Growth in professional network engagement through **Dynamic Social Link Previews**.
- Successful migration to **Full Angular SSR** on Vercel infrastructure.
