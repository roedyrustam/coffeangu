import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="legal-container animate-fade">
      <div class="glass-card document-card">
        <h1>Contact Us</h1>
        <p class="subtitle">We'd love to hear from you.</p>

        <section class="contact-info">
          <h2>Get in Touch</h2>
          <p>For support, inquiries, or feedback regarding CuppingNotes, please reach out to us using the information below:</p>
          
          <div class="contact-methods">
            <div class="method">
              <span class="icon">✉️</span>
              <div class="details">
                <strong>Email</strong>
                <a href="mailto:support@cuppingnotes.online">support&#64;cuppingnotes.online</a>
              </div>
            </div>
            
            <div class="method">
              <span class="icon">🌐</span>
              <div class="details">
                <strong>Social Media</strong>
                <a href="https://github.com/roedyrustam" target="_blank">GitHub Profile</a>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2>Business Inquiries</h2>
          <p>For roastery enterprise plans, partnerships, or bulk licensing, please email us directly with the subject line "Enterprise Inquiry".</p>
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
    .subtitle {
      color: var(--text-secondary);
      font-size: 1.1rem;
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
    .contact-methods {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .method {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: var(--bg-card);
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }
    .icon {
      font-size: 2rem;
    }
    .details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .details strong {
      color: var(--text-primary);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .details a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }
    .details a:hover {
      text-decoration: underline;
    }
    @media (max-width: 768px) {
      .legal-container { padding: 1rem; }
      .document-card { padding: 1.5rem; }
      h1 { font-size: 2rem; }
    }
  `]
})
export class ContactComponent {}
