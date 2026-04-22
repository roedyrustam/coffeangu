import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="legal-container animate-fade">
      <div class="glass-card document-card">
        <h1>Privacy Policy</h1>
        <p class="last-updated">Last Updated: April 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, such as your name, email address, and profile photo. We also collect the cupping data, flavor notes, and scores you input into the application.</p>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use your information to provide, maintain, and improve the Service. Specifically, we use your cupping data to generate analytics, radar charts, and community trends. We do not sell your personal data to third parties.</p>
        </section>

        <section>
          <h2>3. Public vs. Private Data</h2>
          <p>By default, cupping sessions may be public and visible on the Community Board. You can choose to make specific sessions private. Your personal profile, including your XP, level, and badges, is visible to the community.</p>
        </section>

        <section>
          <h2>4. Authentication & Third Parties</h2>
          <p>We use Google Authentication (Firebase Auth) to verify your identity. We do not have access to your Google password. We use third-party services like Tesseract.js (which runs locally on your device) and Firebase for database hosting.</p>
        </section>

        <section>
          <h2>5. Data Retention</h2>
          <p>We store your data as long as your account is active. You may request account deletion at any time, which will permanently remove your personal data and private cupping sessions from our active databases.</p>
        </section>

        <section>
          <h2>6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us via the Contact page.</p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .legal-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      min-height: calc(100vh - 150px);
    }
    .document-card {
      padding: 3rem;
      border-radius: 24px;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }
    .last-updated {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 3rem;
    }
    section {
      margin-bottom: 2.5rem;
    }
    h2 {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }
    p {
      color: var(--text-secondary);
      line-height: 1.7;
      font-size: 1rem;
    }
    @media (max-width: 768px) {
      .legal-container { padding: 1rem; }
      .document-card { padding: 1.5rem; }
      h1 { font-size: 2rem; }
    }
  `]
})
export class PrivacyComponent {}
