import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="main-nav">
      <div class="nav-content">
        <a routerLink="/" class="brand brand-font">CaffeeScore</a>
        <div class="nav-links">
          <a routerLink="/" class="nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
          <a routerLink="/cupping" class="nav-link" routerLinkActive="active">New Session</a>
        </div>
      </div>
    </nav>
    
    <main>
      <router-outlet></router-outlet>
    </main>

    <nav class="mobile-bottom-nav">
      <a routerLink="/" class="bottom-nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Home</span>
      </a>
      <a routerLink="/cupping" class="bottom-nav-link" routerLinkActive="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        <span>New</span>
      </a>
    </nav>

    <footer class="main-footer">
      <p>&copy; 2024 CaffeeScore - Professional Coffee Cupping Platform</p>
    </footer>
  `,
  styles: [`
    .main-nav {
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      background: rgba(18, 18, 18, 0.85);
      border-bottom: 1px solid var(--glass-border);
      position: sticky;
      top: 0;
      z-index: 100;
      height: 80px;
    }
    .nav-content {
      max-width: 1200px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
    }
    .brand {
      text-decoration: none;
    }
    .brand h1 {
      color: var(--primary-color);
      text-shadow: none;
      font-size: 1.8rem;
      margin: 0;
    }
    .nav-links {
      display: flex;
      gap: 30px;
    }
    .nav-links a {
      color: var(--text-dim);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      transition: color 0.2s;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--primary-color);
    }
    main {
      min-height: calc(100vh - 160px);
    }
    .mobile-bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 70px;
      background: rgba(12, 12, 12, 0.9);
      backdrop-filter: blur(20px);
      border-top: 1px solid var(--glass-border);
      z-index: 1000;
      justify-content: space-around;
      align-items: center;
      padding: 0 10px;
    }
    .bottom-nav-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-dim);
      text-decoration: none;
      font-size: 0.7rem;
      gap: 5px;
      transition: color 0.2s;
    }
    .bottom-nav-link svg {
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    .bottom-nav-link.active {
      color: var(--primary-color);
    }
    .bottom-nav-link.active svg {
      opacity: 1;
    }
    .main-footer {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-top: 1px solid var(--glass-border);
      color: var(--text-dim);
      font-size: 0.8rem;
    }
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
      .mobile-bottom-nav {
        display: flex;
      }
      main {
        padding-bottom: 80px;
      }
      .main-footer {
        padding-bottom: 70px;
        height: 150px;
        align-items: flex-start;
        padding-top: 40px;
      }
    }
  `]
})
export class App {
  name = 'CaffeeScore';
}
