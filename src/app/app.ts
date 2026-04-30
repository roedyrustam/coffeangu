import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslationService } from './services/translation.service';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { SeoService } from './services/seo.service';
import { ToastComponent } from './components/toast/toast.component';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ToastComponent],
  template: `
    <app-toast></app-toast>
    <div class="mesh-bg" [style.transform]="parallaxTransform()"></div>
    
    <nav class="main-nav luminescent-border" aria-label="Main Navigation">
      <div class="nav-content">
        <a routerLink="/" class="brand brand-font" aria-label="CuppingNotes Home">
          <span class="radiant-text">Cupping</span>Notes
        </a>
        <div class="nav-right">
          <div class="lang-switcher" role="group" aria-label="Language Selector">
            <button (click)="ts.setLocale('en')" [class.active]="ts.currentLocale() === 'en'" aria-label="English">EN</button>
            <button (click)="ts.setLocale('id')" [class.active]="ts.currentLocale() === 'id'" aria-label="Bahasa Indonesia">ID</button>
            <button (click)="ts.setLocale('es')" [class.active]="ts.currentLocale() === 'es'" aria-label="Español">ES</button>
          </div>
          <div class="nav-links">
            <a routerLink="/" class="nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">{{ t('NAV_HOME') }}</a>
            <a routerLink="/cupping" class="nav-link" routerLinkActive="active">{{ t('NAV_NEW') }}</a>
            <a routerLink="/community" class="nav-link" routerLinkActive="active">{{ t('NAV_COMMUNITY') }}</a>
            
            @if (!auth.currentUser()) {
              <a routerLink="/login" class="btn-primary login-btn">{{ t('BTN_LOGIN') }}</a>
            } @else {
              <div class="user-profile">
                <button class="avatar-btn" (click)="showUserMenu.set(!showUserMenu())" [aria-expanded]="showUserMenu()" aria-haspopup="true" aria-label="User Menu">
                  <div class="avatar">
                  @if (!auth.currentUser()?.photoURL) {
                    <span>{{ auth.currentUser()?.displayName?.charAt(0) || 'U' }}</span>
                  } @else {
                    <img [src]="auth.currentUser()?.photoURL" alt="Profile">
                  }
                </div>
                </button>
                
                @if (showUserMenu()) {
                  <div class="user-menu glass-card">
                    <div class="menu-header">
                      <p class="user-name">{{ auth.currentUser()?.displayName }}</p>
                      <p class="user-email">{{ auth.currentUser()?.email }}</p>
                    </div>
                    <div class="menu-divider"></div>
                    
                    <a routerLink="/profile" (click)="showUserMenu.set(false)" class="menu-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span>{{ t('PROFILE_TITLE') }}</span>
                    </a>

                    <button (click)="auth.logout(); showUserMenu.set(false)" class="logout-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      {{ t('BTN_LOGOUT') }}
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </nav>

    <div class="auth-init-overlay" *ngIf="auth.authLoading()">
      <div class="loader-content">
        <div class="brand-font loading-title">{{ t('APP_TITLE') }}</div>
        <div class="loading-spinner"></div>
        <p class="loading-text">Authenticating...</p>
      </div>
    </div>

    <main [class.blur-content]="auth.authLoading()">
      <router-outlet></router-outlet>
    </main>

    <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div class="nav-indicator" [style.transform]="getIndicatorTransform()"></div>
      
      <a routerLink="/" class="bottom-nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="triggerHaptic()">
        <div class="icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <span class="nav-label">{{ t('NAV_HOME') }}</span>
      </a>
      
      <a routerLink="/community" class="bottom-nav-link" routerLinkActive="active" (click)="triggerHaptic()">
        <div class="icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <span class="nav-label">{{ t('NAV_DISCOVER') }}</span>
      </a>
      
      <div class="nav-center-action">
        <button class="center-fab" routerLink="/cupping" aria-label="New Cupping Session" (click)="triggerHaptic()">
          <div class="fab-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <div class="fab-glow"></div>
        </button>
      </div>

      <a routerLink="/analytics" class="bottom-nav-link" routerLinkActive="active" *ngIf="auth.currentUser()" (click)="triggerHaptic()">
        <div class="icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
        <span class="nav-label">{{ t('NAV_INSIGHTS') }}</span>
      </a>

      <a [routerLink]="auth.currentUser() ? '/profile' : '/login'" class="bottom-nav-link" routerLinkActive="active" (click)="triggerHaptic()">
        <div class="icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <span class="nav-label">{{ auth.currentUser() ? (t('NAV_ME') || 'Me') : t('BTN_LOGIN') }}</span>
      </a>
    </nav>

    <footer class="main-footer">
      <div class="footer-links">
        <a routerLink="/tos">Terms of Service</a>
        <a routerLink="/privacy">Privacy Policy</a>
        <a routerLink="/contact">Contact</a>
      </div>
      <p>&copy; {{ currentYear }} {{ t('APP_TITLE') }} - Professional Coffee Cupping Platform</p>
    </footer>
  `,
  styles: [`
    .main-nav {
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      background: rgba(12, 12, 14, 0.6);
      position: sticky;
      top: 0;
      z-index: var(--z-nav);
      height: 80px;
      transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .nav-content {
      max-width: 1400px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 40px;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 40px;
    }
    .lang-switcher {
      display: flex;
      background: rgba(255, 255, 255, 0.03);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid var(--glass-border);
    }
    .lang-switcher button {
      background: transparent;
      border: none;
      color: var(--text-dim);
      padding: 6px 12px;
      font-size: 0.7rem;
      font-weight: 800;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .lang-switcher button.active {
      background: var(--primary-gradient);
      color: #0c0c0e;
      box-shadow: 0 4px 12px rgba(189, 142, 98, 0.3);
    }
    .brand {
      text-decoration: none;
      font-size: 1.8rem;
      font-weight: 900;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -1px;
    }
    .nav-links {
      display: flex;
      gap: 32px;
    }
    .nav-links a {
      color: var(--text-dim);
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      transition: all 0.3s;
      position: relative;
    }
    .nav-links a.active {
      color: var(--text-main);
    }
    .nav-links a.active::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--primary-gradient);
      border-radius: 2px;
    }
    .mobile-bottom-nav {
      display: none;
      position: fixed;
      bottom: calc(20px + env(safe-area-inset-bottom, 0px));
      left: 20px;
      right: 20px;
      height: 80px;
      z-index: var(--z-nav);
      justify-content: space-around;
      align-items: center;
      background: rgba(12, 12, 14, 0.8);
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 28px;
      padding: 0 10px;
      box-shadow: 
        0 30px 60px -15px rgba(0, 0, 0, 0.9),
        0 0 20px rgba(0, 0, 0, 0.4),
        0 1px 1px rgba(255, 255, 255, 0.1) inset;
    }
    .nav-indicator {
      position: absolute;
      top: 10px;
      left: 0;
      width: calc((100% - 100px) / 4); /* Approximate width for 4 items */
      height: 60px;
      background: rgba(189, 142, 98, 0.1);
      border-radius: 20px;
      transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
      pointer-events: none;
      z-index: 0;
    }
    .bottom-nav-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-dim);
      text-decoration: none;
      transition: all 0.4s cubic-bezier(0.2, 1, 0.3, 1);
      flex: 1;
      height: 100%;
      position: relative;
      z-index: 1;
    }
    .nav-label {
      font-size: 0.6rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 4px;
      opacity: 0.7;
      transition: all 0.4s;
    }
    .icon-wrapper {
      position: relative;
      width: 40px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s;
    }
    .bottom-nav-link.active {
      color: var(--primary-color);
    }
    .bottom-nav-link.active .nav-label {
      opacity: 1;
      transform: translateY(-2px);
    }
    .bottom-nav-link svg {
      width: 22px;
      height: 22px;
      stroke-width: 2.2px;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .bottom-nav-link.active svg {
      transform: scale(1.15) translateY(-2px);
      filter: drop-shadow(0 0 8px var(--primary-glow));
    }
    .nav-center-action {
      position: relative;
      width: 80px;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2;
    }
    .center-fab {
      width: 60px;
      height: 60px;
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: absolute;
      top: -30px;
    }
    .fab-inner {
      width: 64px;
      height: 64px;
      background: var(--primary-gradient);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0c0c0e;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 15px 30px var(--primary-glow);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      z-index: 2;
    }
    .fab-glow {
      position: absolute;
      inset: -5px;
      background: var(--primary-color);
      border-radius: 28px;
      filter: blur(15px);
      opacity: 0.3;
      z-index: 1;
      animation: fabPulse 3s infinite;
    }
    @keyframes fabPulse {
      0%, 100% { opacity: 0.2; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.1); }
    }
    .center-fab:hover .fab-inner {
      transform: translateY(-8px) scale(1.1) rotate(5deg);
      box-shadow: 0 25px 45px var(--primary-glow);
    }
    .center-fab:active .fab-inner {
      transform: translateY(-4px) scale(0.9);
    }
    .center-fab svg {
      width: 28px;
      height: 28px;
      stroke-width: 3.5px;
    }
    .main-footer {
      padding: 60px 40px 140px;
      text-align: center;
      border-top: 1px solid var(--glass-border);
      color: var(--text-dim);
      font-size: 0.85rem;
    }
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-bottom: 20px;
    }
    .footer-links a {
      color: var(--text-dim);
      text-decoration: none;
      transition: color 0.3s;
    }
    .footer-links a:hover {
      color: var(--text-main);
    }
    .user-profile { position: relative; }
    .avatar-btn {
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      border-radius: 14px;
      transition: all 0.3s;
    }
    .avatar-btn:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 4px;
    }
    .avatar {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      background: var(--surface-hover);
      border: 1px solid var(--glass-border);
      overflow: hidden;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-menu {
      position: absolute;
      top: 55px;
      right: 0;
      width: 260px;
      padding: 24px;
      z-index: 1001;
      border-radius: 24px;
    }
    @media (max-width: 768px) {
      .main-nav { display: none; }
      .mobile-bottom-nav { display: flex; }
      main { padding-bottom: 120px; }
    }
    /* Loader */
    .auth-init-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: var(--bg-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(189, 142, 98, 0.1);
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class App {
  ts = inject(TranslationService);
  auth = inject(AuthService);
  router = inject(Router);
  updates = inject(SwUpdate);
  seo = inject(SeoService);
  toast = inject(ToastService);
  t = this.ts.t();
  showUserMenu = signal(false);
  parallaxTransform = signal('translate3d(0,0,0) scale(1.1)');
  currentYear = new Date().getFullYear();

  getIndicatorTransform() {
    const url = this.router.url;
    const itemsCount = this.auth.currentUser() ? 4 : 3; // Home, Community, (Analytics), Profile/Login
    const navWidth = window.innerWidth - 40 - 20; // Nav width minus padding and gaps
    const itemWidth = (navWidth - 80) / itemsCount; // 80 is center action width

    // Simplified logic for indicator positioning
    if (url === '/') return `translateX(10px)`;
    if (url.includes('/community')) return `translateX(calc(${itemWidth}px + 10px))`;
    
    // Position 3 and 4 depend on if user is logged in
    if (this.auth.currentUser()) {
      if (url.includes('/analytics')) return `translateX(calc(${itemWidth * 2}px + 90px))`;
      if (url.includes('/profile')) return `translateX(calc(${itemWidth * 3}px + 90px))`;
    } else {
      if (url.includes('/login')) return `translateX(calc(${itemWidth * 2}px + 90px))`;
    }
    
    return 'scale(0)'; // Hide if no match
  }

  triggerHaptic() {
    if ('vibrate' in navigator) {
      navigator.vibrate(12);
    }
  }

  private mouseMoveHandler = (e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 25;
    const y = (e.clientY / window.innerHeight - 0.5) * 25;
    this.parallaxTransform.set(`translate3d(${x}px, ${y}px, 0) scale(1.1)`);
  };

  async ngOnInit() {
    this.seo.updateMeta(); // Default SEO initialization
    
    // Global handle for Firebase Auth redirects (Crucial for Mobile)
    try {
      await this.auth.handleRedirectResult();
    } catch (err) {
      console.error('Global Auth Redirect Error:', err);
    }
    
    
    window.addEventListener('mousemove', this.mouseMoveHandler);

    if (this.updates.isEnabled) {
      this.updates.versionUpdates.subscribe((evt) => {
        if (evt.type === 'VERSION_READY') {
          this.toast.info('New version available!', 0, {
            label: 'Update Now',
            callback: () => window.location.reload()
          });
        }
      });
    }
  }

  ngOnDestroy() {
    window.removeEventListener('mousemove', this.mouseMoveHandler);
  }

  async onLogout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
