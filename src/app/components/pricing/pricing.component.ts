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

    </div>

    <!-- PAYPAL CHECKOUT MODAL (outside pricing-container for proper centering) -->
    <div class="modal-overlay" *ngIf="showModal()">
      <div class="checkout-modal glass-card">
        <button class="close-btn" (click)="closeModal()">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        
        <div class="checkout-header">
          <h3>{{ selectedTier()?.name }} Upgrade</h3>
          <p>Complete your payment via PayPal's secure gateway</p>
        </div>

        <div class="paypal-wrapper">
          <div id="paypal-container-{{ selectedButtonId() }}" class="paypal-container"></div>
          
          <div class="sdk-loader" *ngIf="loadingSDK()">
            <div class="spinner-small"></div>
            <span>Securing Connection...</span>
          </div>
        </div>

        <div class="checkout-footer">
          <div class="secure-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Standard PayPal Encryption
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
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.92);
      backdrop-filter: blur(25px);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    }
    .checkout-modal {
      width: 100%;
      max-width: 420px;
      padding: 40px;
      position: relative;
      margin: auto;
      overflow: visible;
      box-sizing: border-box;
    }
    /* Override global glass-card:hover transform */
    .checkout-modal:hover {
      transform: none !important;
    }
    .paypal-container { width: 100%; overflow: visible; }
    .close-btn {
      position: absolute;
      top: 20px;
      right: 20px;
      background: transparent;
      border: none;
      color: var(--text-dim);
      cursor: pointer;
      transition: all 0.3s;
    }
    .close-btn:hover { color: var(--text-main); transform: rotate(90deg); }

    .checkout-header { text-align: center; margin-bottom: 30px; }
    .checkout-header h3 { font-size: 1.8rem; margin-bottom: 8px; font-family: var(--font-brand); }
    .checkout-header p { color: var(--text-dim); font-size: 0.9rem; }

    .paypal-wrapper {
      min-height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }


    .sdk-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      color: var(--text-dim);
      font-size: 0.85rem;
      font-weight: 700;
    }

    .checkout-footer {
      margin-top: 30px;
      display: flex;
      justify-content: center;
    }
    .secure-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(212, 225, 87, 0.08);
      color: #d4e157;
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .spinner-small {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(189, 142, 98, 0.1);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .pricing-grid { grid-template-columns: 1fr; }
      .tier-card.featured { transform: scale(1); }
      .checkout-modal { padding: 30px 20px; }
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
  loadingSDK = signal(false);
  selectedTier = signal<TierDetails | null>(null);
  selectedButtonId = signal<string>('');

  private BUTTON_IDS: Record<string, string> = {
    pro: 'WMZGDKGCQLKX8',
    roastery: 'SR6V7JTRTBGZW'
  };

  private sdkLoaded = false;

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

    this.selectedTier.set(tier);
    this.selectedButtonId.set(this.BUTTON_IDS[tier.id]);
    this.showModal.set(true);
    
    await this.initPayPal();
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedTier.set(null);
    this.selectedButtonId.set('');
  }

  private async initPayPal() {
    if (!this.sdkLoaded) {
      this.loadingSDK.set(true);
      await this.loadPayPalSDK();
      this.sdkLoaded = true;
      this.loadingSDK.set(false);
    }

    // Wait for DOM to catch up with signal update
    setTimeout(() => {
      this.renderHostedButton();
    }, 100);
  }

  private loadPayPalSDK(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=BAAV-mITKSmcExAjXzaToMMOYypRIIfN4MCdLjAm_MT5NtgE9cIsWqbZIYTKlXD-oGmEBTzAVaZm5Z5m6M&components=hosted-buttons&disable-funding=venmo&currency=USD`;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  private renderHostedButton() {
    const paypal = (window as any).paypal;
    const tierId = this.selectedTier()?.id;
    const buttonId = this.selectedButtonId();

    if (paypal && paypal.HostedButtons && buttonId) {
      paypal.HostedButtons({
        hostedButtonId: buttonId,
        onComplete: async (data: any) => {
          console.log('Payment Complete:', data);
          this.processing.set(true);
          try {
            await this.membership.finalizeUpgrade(tierId as any, data);
            this.showModal.set(false);
            this.router.navigate(['/profile']);
          } catch (e) {
            alert('Upgrade activation failed. Please contact support.');
          } finally {
            this.processing.set(false);
          }
        }
      }).render(`#paypal-container-${buttonId}`);
    }
  }
}
