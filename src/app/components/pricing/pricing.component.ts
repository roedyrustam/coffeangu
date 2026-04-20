import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MembershipService, TierDetails } from '../../services/membership.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pricing-container animate-fade">
      <header class="pricing-header">
        <h1 class="brand-font">Choose Your Journey</h1>
        <p class="subtitle">Elevate your sensory experience with CaffeeScore Pro</p>
      </header>

      <div class="pricing-grid">
        <div class="tier-card glass-card" 
             *ngFor="let tier of membership.TIERS" 
             [class.featured]="tier.id === 'pro'"
             [style.border-color]="tier.id === 'pro' ? 'var(--primary-color)' : 'var(--glass-border)'">
          
          <div class="tier-header">
            <span class="tier-name" [style.color]="tier.color">{{ tier.name }}</span>
            <div class="price-row">
              <span class="currency" *ngIf="tier.id !== 'classic'">$</span>
              <span class="amount">{{ tier.price.replace('$', '').replace('/mo', '') }}</span>
              <span class="period" *ngIf="tier.id !== 'classic'">/mo</span>
            </div>
          </div>

          <ul class="features-list">
            <li *ngFor="let feature of tier.features">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" [style.color]="tier.color"><polyline points="20 6 9 17 4 12"/></svg>
              {{ feature }}
            </li>
          </ul>

          <div class="tier-actions">
            <button class="btn-primary" 
                    *ngIf="tier.id !== 'classic'" 
                    (click)="subscribe(tier)"
                    [disabled]="processing() || currentMembershipId() === tier.id">
              {{ currentMembershipId() === tier.id ? 'Active Plan' : (processing() ? 'Simulating...' : 'Upgrade Now') }}
            </button>
            <button class="btn-secondary" 
                    *ngIf="tier.id === 'classic'" 
                    routerLink="/"
                    [disabled]="currentMembershipId() === tier.id">
              {{ currentMembershipId() === tier.id ? 'Current Plan' : 'Free Forever' }}
            </button>
          </div>
        </div>
      </div>

      <!-- SIMULATED PAYMENT MODAL -->
      <div class="modal-overlay" *ngIf="showModal()">
        <div class="modal glass-card animate-scale">
          <div class="sim-payment">
             <div class="spinner-large"></div>
             <h3>Processing Simulation</h3>
             <p>Contacting secure sandbox gateway...</p>
             <div class="secure-badge">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
               SECURE SIMULATION
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pricing-container {
      max-width: 1200px;
      margin: 80px auto;
      padding: 0 30px;
      padding-bottom: 200px;
    }
    .pricing-header {
      text-align: center;
      margin-bottom: 80px;
    }
    .pricing-header h1 { font-size: 4rem; margin-bottom: 15px; }
    .subtitle { color: var(--text-dim); font-size: 1.2rem; }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 30px;
      align-items: stretch;
    }

    .tier-card {
      padding: 50px 40px;
      display: flex;
      flex-direction: column;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid var(--glass-border);
      position: relative;
      overflow: hidden;
    }
    .tier-card.featured {
      background: rgba(189, 142, 98, 0.05);
      transform: scale(1.05);
      box-shadow: 0 40px 100px rgba(0,0,0,0.5);
      z-index: 2;
    }
    .tier-card:hover { border-color: var(--primary-color); }

    .tier-header { margin-bottom: 40px; }
    .tier-name { font-size: 1rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; display: block; }
    .price-row { display: flex; align-items: baseline; gap: 5px; }
    .currency { font-size: 1.5rem; font-weight: 800; color: var(--text-dim); }
    .amount { font-size: 4rem; font-weight: 950; font-family: var(--font-brand); line-height: 1; }
    .period { color: var(--text-dim); font-weight: 700; }

    .features-list {
      list-style: none;
      padding: 0;
      margin: 0 0 50px 0;
      flex-grow: 1;
    }
    .features-list li {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      font-weight: 600;
      color: var(--text-main);
      font-size: 0.95rem;
    }

    .tier-actions button {
      width: 100%;
      padding: 18px;
      border-radius: 100px;
      font-size: 1rem;
    }

    /* MODAL */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.9);
      backdrop-filter: blur(20px);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sim-payment {
      text-align: center;
      padding: 60px;
    }
    .sim-payment h3 { font-size: 2rem; margin-bottom: 10px; }
    .sim-payment p { color: var(--text-dim); margin-bottom: 30px; }
    .secure-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(212, 225, 87, 0.1);
      color: var(--accent-neon);
      padding: 8px 20px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .spinner-large {
      width: 60px;
      height: 60px;
      border: 4px solid var(--glass-border);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      margin: 0 auto 30px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .pricing-grid { grid-template-columns: 1fr; }
      .tier-card.featured { transform: scale(1); }
    }
  `]
})
export class PricingComponent {
  protected membership = inject(MembershipService);
  private auth = inject(AuthService);
  private router = inject(Router);

  currentMembershipId = signal<string>('classic');
  processing = signal(false);
  showModal = signal(false);

  constructor() {
    this.membership.getCurrentMembership().subscribe(m => {
      if (m) this.currentMembershipId.set(m.id);
    });
  }

  async subscribe(tier: TierDetails) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.showModal.set(true);
    this.processing.set(true);

    try {
      await this.membership.upgradeMembership(tier.id as any);
      this.showModal.set(false);
      this.router.navigate(['/profile']);
    } catch (e) {
      alert('Subscription failed. Please try again.');
      this.showModal.set(false);
    } finally {
      this.processing.set(false);
    }
  }
}
