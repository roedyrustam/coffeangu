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
    
    <nav class="main-nav">
      <div class="nav-content">
        <a routerLink="/" class="brand brand-font">{{ t('APP_TITLE') }}</a>
        <div class="nav-right">
          <div class="lang-switcher">
            <button (click)="ts.setLocale('en')" [class.active]="ts.currentLocale() === 'en'">EN</button>
            <button (click)="ts.setLocale('id')" [class.active]="ts.currentLocale() === 'id'">ID</button>
            <button (click)="ts.setLocale('es')" [class.active]="ts.currentLocale() === 'es'">ES</button>
          </div>
          <div class="nav-links">
            <a routerLink="/" class="nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">{{ t('NAV_HOME') }}</a>
            <a routerLink="/cupping" class="nav-link" routerLinkActive="active">{{ t('NAV_NEW') }}</a>
            <a routerLink="/community" class="nav-link" routerLinkActive="active">{{ t('NAV_COMMUNITY') }}</a>
            
            @if (!auth.currentUser()) {
              <a routerLink="/login" class="btn-primary login-btn">{{ t('BTN_LOGIN') }}</a>
            } @else {
              <div class="user-profile">
                <div class="avatar" (click)="showUserMenu.set(!showUserMenu())">
                  @if (!auth.currentUser()?.photoURL) {
                    <span>{{ auth.currentUser()?.displayName?.charAt(0) || 'U' }}</span>
                  } @else {
                    <img [src]="auth.currentUser()?.photoURL" alt="Profile">
                  }
                </div>
                
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

    <nav class="mobile-bottom-nav">
      <div class="nav-blur-bg"></div>
      
      <a routerLink="/" class="bottom-nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>{{ t('NAV_HOME') }}</span>
      </a>
      
      <a routerLink="/community" class="bottom-nav-link" routerLinkActive="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
        <span>{{ t('NAV_DISCOVER') }}</span>
      </a>
      
      <div class="nav-center-action">
        <button class="center-fab" routerLink="/cupping">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>

      <a routerLink="/profile" class="bottom-nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{queryParams: 'exact'}">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C7 2 3 7 3 12s4 10 9 10 9-4.5 9-10S17 2 12 2z"/><path d="M12 22c-2.5-2.5-4-6-4-10s1.5-7.5 4-10c2.5 2.5 4 6 4 10s-1.5 7.5-4 10z"/><path d="M3 12h18"/></svg>
        <span>{{ t('NAV_HISTORY') }}</span>
      </a>

      <a [routerLink]="auth.currentUser() ? '/profile' : '/login'" class="bottom-nav-link" routerLinkActive="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>{{ auth.currentUser() ? (t('NAV_ME') || 'Me') : t('BTN_LOGIN') }}</span>
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
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      background: rgba(12, 12, 14, 0.7);
      border-bottom: 1px solid var(--glass-border);
      position: sticky;
      top: 0;
      z-index: var(--z-nav);
      height: 90px;
      transition: all 0.4s;
    }
    .nav-content {
      max-width: 1200px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 30px;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 50px;
    }
    .lang-switcher {
      display: flex;
      gap: 8px;
    }
    .lang-switcher button {
      background: transparent;
      border: 1px solid var(--glass-border);
      color: var(--text-dim);
      padding: 4px 10px;
      font-size: 0.65rem;
      font-weight: 900;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .lang-switcher button:hover {
      color: var(--text-main);
      border-color: var(--text-dim);
    }
    .lang-switcher button.active {
      background: var(--primary-color);
      color: #FFFFFF;
      border-color: transparent;
    }
    .brand {
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand h1 {
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 2.2rem;
      margin: 0;
      font-weight: 800;
    }
    .nav-links {
      display: flex;
      gap: 40px;
    }
    .nav-links a {
      color: var(--text-dim);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      transition: all 0.3s;
      position: relative;
      padding: 8px 0;
    }
    .nav-links a::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--primary-gradient);
      transition: width 0.3s;
    }
    .nav-links a:hover::after, .nav-links a.active::after {
      width: 100%;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--text-main);
    }
    main {
      min-height: calc(100vh - 180px);
      max-width: 1400px;
      margin: 0 auto;
    }
    .mobile-bottom-nav {
      display: none;
      position: fixed;
      bottom: calc(15px + env(safe-area-inset-bottom, 0px));
      left: 15px;
      right: 15px;
      height: 68px;
      z-index: var(--z-nav);
      justify-content: center;
      padding: 0 5px;
      gap: 2px;
    }
    .nav-blur-bg {
      position: absolute;
      inset: 0;
      background: var(--glass-bg);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      z-index: -1;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    }
    .bottom-nav-link {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-dim);
      text-decoration: none;
      font-size: 0.6rem;
      font-weight: 800;
      gap: 4px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      z-index: 1;
      position: relative;
    }
    .bottom-nav-link svg {
      opacity: 0.6;
      transition: all 0.3s;
      stroke-width: 2px;
    }
    .bottom-nav-link.active {
      color: var(--primary-color);
    }
    .bottom-nav-link.active svg {
      opacity: 1;
      transform: translateY(-2px);
      stroke: var(--primary-color);
      stroke-width: 2.5px;
    }
    .bottom-nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -8px;
      width: 4px;
      height: 4px;
      background: var(--primary-color);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--primary-color);
    }
    .nav-center-action {
      position: relative;
      width: 60px;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2;
    }
    .center-fab {
      width: 58px;
      height: 58px;
      background: var(--primary-gradient);
      border-radius: 50%;
      border: 5px solid var(--bg-color);
      display: flex;
      justify-content: center;
      align-items: center;
      color: #FFFFFF;
      box-shadow: 0 10px 25px var(--primary-glow);
      cursor: pointer;
      position: absolute;
      top: -24px;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .center-fab:hover {
      transform: scale(1.1) translateY(-5px);
      box-shadow: 0 15px 40px var(--primary-glow);
    }
    .center-fab:active {
      transform: scale(0.9);
    }
    .main-footer {
      min-height: 120px;
      padding: 20px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-top: 1px solid var(--glass-border);
      color: var(--text-dim);
      font-size: 0.85rem;
      letter-spacing: 1px;
      background: var(--bg-card);
    }
    .user-profile {
      position: relative;
      display: flex;
      align-items: center;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 2px solid var(--glass-border);
      overflow: hidden;
      transition: all 0.3s;
    }
    .avatar:hover {
      transform: scale(1.1);
      border-color: var(--primary-color);
    }
    .avatar span {
      color: #FFFFFF;
      font-weight: 800;
      font-size: 1.1rem;
    }
    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .user-menu {
      position: absolute;
      top: 55px;
      right: 0;
      width: 240px;
      padding: 20px;
      z-index: 1001;
      animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .menu-header {
      margin-bottom: 15px;
    }
    .user-name {
      font-weight: 800;
      color: var(--text-main);
      font-size: 0.95rem;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-email {
      font-size: 0.75rem;
      color: var(--text-dim);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .menu-divider {
      height: 1px;
      background: var(--glass-border);
      margin: 15px 0;
    }
    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      color: var(--text-dim);
      text-decoration: none !important;
      font-size: 0.85rem;
      font-weight: 700;
      border-radius: 8px;
      transition: all 0.3s;
      margin-bottom: 8px;
      border: 1px solid transparent;
    }
    .menu-item:hover {
      background: var(--surface-hover);
      color: var(--primary-color);
      border-color: var(--glass-border);
    }
    .logout-btn {
      width: 100%;
      background: transparent;
      border: 1px solid var(--danger);
      color: var(--danger);
      padding: 10px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.3s;
    }
    .logout-btn:hover {
      background: var(--danger);
      color: white;
    }
    .login-btn {
      padding: 10px 24px;
      font-size: 0.75rem;
      text-decoration: none;
    }
    .footer-links {
      display: flex;
      gap: 20px;
      margin-bottom: 10px;
    }
    .footer-links a {
      color: var(--text-dim);
      text-decoration: none;
      font-size: 0.8rem;
      transition: color 0.3s;
    }
    .footer-links a:hover {
      color: var(--text-main);
    }
    @media (max-width: 768px) {
      .main-nav { display: none; }
      .mobile-bottom-nav { display: flex; }
      main { padding-bottom: 100px; }
      .main-footer {
        padding-bottom: 110px;
        padding-top: 40px;
        align-items: center;
        text-align: center;
      }
      .footer-links {
        flex-wrap: wrap;
        justify-content: center;
        gap: 15px;
      }
    }

    /* AUTH LOADING UI */
    .auth-init-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: var(--bg-color);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .loader-content {
      text-align: center;
      animation: pulse 2s infinite ease-in-out;
    }
    .loading-title {
      font-size: 2.5rem;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 20px;
    }
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      margin: 0 auto 15px;
      animation: spin 1s linear infinite;
    }
    .loading-text {
      color: var(--text-dim);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 800;
    }
    .blur-content {
      filter: blur(10px);
      pointer-events: none;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(0.98); opacity: 0.8; }
    }
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

  private mouseMoveHandler = (e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 15;
    const y = (e.clientY / window.innerHeight - 0.5) * 15;
    this.parallaxTransform.set(`translate3d(${x}px, ${y}px, 0) scale(1.05)`);
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
