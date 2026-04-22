import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="legal-container animate-fade">
      <div class="glass-card document-card">
        <h1>Terms of Service</h1>
        <p class="last-updated">Last Updated: April 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using CuppingNotes ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.</p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>CuppingNotes provides a digital platform for coffee professionals to record, analyze, and share coffee cupping evaluations based on SCA standards.</p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>You must provide accurate information when creating an account. You are responsible for safeguarding the password and for all activities that occur under your account.</p>
        </section>

        <section>
          <h2>4. Data Ownership & Privacy</h2>
          <p>You retain all rights to the cupping data you input into the Service. By making a session public, you grant CuppingNotes a license to display that data to other users. For more details, please review our Privacy Policy.</p>
        </section>

        <section>
          <h2>5. Pro/Roastery Memberships</h2>
          <p>Premium features require a paid subscription. Payments are non-refundable except where required by law. CuppingNotes reserves the right to modify pricing with prior notice.</p>
        </section>

        <section>
          <h2>6. Limitation of Liability</h2>
          <p>The Service is provided "AS IS". CuppingNotes shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the Service.</p>
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
export class TosComponent {}
