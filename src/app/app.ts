import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslationService } from './services/translation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
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
          </div>
        </div>
      </div>
    </nav>
    
    <main>
      <router-outlet></router-outlet>
    </main>

    <nav class="mobile-bottom-nav">
      <a routerLink="/" class="bottom-nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>{{ t('NAV_HOME') }}</span>
      </a>
      <a routerLink="/community" class="bottom-nav-link" routerLinkActive="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span>{{ t('NAV_DISCOVER') }}</span>
      </a>
      <a routerLink="/cupping" class="bottom-nav-link" routerLinkActive="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        <span>{{ t('NAV_NEW') }}</span>
      </a>
    </nav>

    <footer class="main-footer">
      <p>&copy; 2024 CaffeeScore - Professional Coffee Cupping Platform</p>
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
      z-index: 1000;
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
      color: #0c0c0e;
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
      bottom: 20px;
      left: 20px;
      right: 20px;
      height: 75px;
      background: rgba(22, 22, 26, 0.95);
      backdrop-filter: blur(25px);
      border: 1px solid var(--glass-border);
      border-radius: 40px;
      z-index: 1000;
      justify-content: space-around;
      align-items: center;
      padding: 0 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    .bottom-nav-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-dim);
      text-decoration: none;
      font-size: 0.75rem;
      font-weight: 600;
      gap: 4px;
      transition: all 0.3s;
    }
    .bottom-nav-link svg {
      opacity: 0.6;
      transition: all 0.3s;
    }
    .bottom-nav-link.active {
      color: var(--primary-color);
    }
    .bottom-nav-link.active svg {
      opacity: 1;
      transform: translateY(-2px);
      stroke: var(--primary-color);
    }
    .main-footer {
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-top: 1px solid var(--glass-border);
      color: var(--text-dim);
      font-size: 0.85rem;
      letter-spacing: 1px;
    }
    @media (max-width: 768px) {
      .main-nav { height: 80px; }
      .nav-links { display: none; }
      .mobile-bottom-nav { display: flex; }
      main { padding-bottom: 100px; }
      .main-footer {
        padding-bottom: 100px;
        height: 150px;
        align-items: flex-start;
        padding-top: 40px;
      }
    }
  `]
})
export class App {
  ts = inject(TranslationService);
  t = this.ts.t();
}
