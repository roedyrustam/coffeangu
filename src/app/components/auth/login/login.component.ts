import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="login-container animate-fade">
      <div class="glass-card login-card">
        <header>
          <h2 class="brand-font">{{ t('LOGIN_TITLE') }}</h2>
          <p class="subtitle">{{ t('LOGIN_SUBTITLE') }}</p>
        </header>

        <div class="auth-toggle">
          <button [class.active]="mode() === 'login'" (click)="mode.set('login')">{{ t('BTN_LOGIN') }}</button>
          <button [class.active]="mode() === 'signup'" (click)="mode.set('signup')">{{ t('BTN_SIGNUP') }}</button>
        </div>

        <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
          <div class="form-group" *ngIf="mode() === 'signup'">
            <label>{{ t('LABEL_NAME') }}</label>
            <input type="text" formControlName="displayName" [placeholder]="t('PLACEHOLDER_NAME')">
          </div>

          <div class="form-group">
            <label>{{ t('LABEL_EMAIL') }}</label>
            <input type="email" formControlName="email" placeholder="name@roastery.com">
          </div>

          <div class="form-group">
            <label>{{ t('LABEL_PASSWORD') }}</label>
            <input type="password" formControlName="password" placeholder="••••••••">
          </div>

          <div class="error-msg" *ngIf="errorMessage()">{{ errorMessage() }}</div>

          <button type="submit" class="btn-primary w-full" [disabled]="loading()">
            <span *ngIf="!loading()">{{ mode() === 'login' ? t('BTN_LOGIN') : t('BTN_SIGNUP') }}</span>
            <span *ngIf="loading()" class="loader"></span>
          </button>
        </form>

        <div class="divider">
          <span>{{ t('OR_CONTINUE_WITH') }}</span>
        </div>

        <div class="social-auth-grid">
          <button (click)="loginWithGoogle()" class="btn-google" [disabled]="loading()">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          
          <button (click)="loginWithFacebook()" class="btn-facebook" [disabled]="loading()">
            <svg viewBox="0 0 24 24" width="18" height="18">
               <path fill="#ffffff" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>
      </div>
    </div>
  `,
    <main class="login-container animate-fade">
      <div class="brand-visual desktop-only" aria-hidden="true">
        <div class="mesh-glow"></div>
        <div class="brand-content-large">
           <h1 class="brand-font">CuppingNotes</h1>
           <p>Elevating sensory intelligence for specialty coffee professionals.</p>
        </div>
      </div>

      <section class="auth-box glass-card animate-slide-up" role="region" aria-labelledby="auth-title">
        <button class="btn-close" routerLink="/" aria-label="Back to home">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <header class="auth-header">
          <h2 id="auth-title" class="brand-font">{{ t('LOGIN_TITLE') }}</h2>
          <p class="subtitle">{{ t('LOGIN_SUBTITLE') }}</p>
        </header>

        <nav class="auth-toggle" role="tablist">
          <button role="tab" 
                  [attr.aria-selected]="mode() === 'login'"
                  [class.active]="mode() === 'login'" 
                  (click)="mode.set('login')">
            {{ t('BTN_LOGIN') }}
          </button>
          <button role="tab" 
                  [attr.aria-selected]="mode() === 'signup'"
                  [class.active]="mode() === 'signup'" 
                  (click)="mode.set('signup')">
            {{ t('BTN_SIGNUP') }}
          </button>
        </nav>

        <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group" *ngIf="mode() === 'signup'">
            <label for="displayName">{{ t('LABEL_NAME') }}</label>
            <input id="displayName" 
                   type="text" 
                   formControlName="displayName" 
                   [placeholder]="t('PLACEHOLDER_NAME')"
                   autocomplete="name"
                   spellcheck="false">
          </div>

          <div class="form-group">
            <label for="email">{{ t('LABEL_EMAIL') }}</label>
            <input id="email" 
                   type="email" 
                   formControlName="email" 
                   placeholder="name@roastery.com"
                   autocomplete="email"
                   inputmode="email"
                   spellcheck="false">
          </div>

          <div class="form-group">
            <label for="password">{{ t('LABEL_PASSWORD') }}</label>
            <input id="password" 
                   type="password" 
                   formControlName="password" 
                   placeholder="••••••••"
                   autocomplete="current-password">
          </div>

          <div class="error-msg" *ngIf="errorMessage()" role="alert">{{ errorMessage() }}</div>

          <button type="submit" class="btn-primary-glow w-full" [disabled]="loading()">
            <span *ngIf="!loading()">{{ mode() === 'login' ? t('BTN_LOGIN') : t('BTN_SIGNUP') }}</span>
            <span *ngIf="loading()" class="loader-white"></span>
          </button>
        </form>

        <div class="divider">
          <span>{{ t('OR_CONTINUE_WITH') }}</span>
        </div>

        <div class="social-auth-grid">
          <button (click)="loginWithGoogle()" class="btn-social btn-google-premium" [disabled]="loading()" aria-label="Continue with Google">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google</span>
          </button>
          
          <button (click)="loginWithFacebook()" class="btn-social btn-facebook-premium" [disabled]="loading()" aria-label="Continue with Facebook">
            <svg viewBox="0 0 24 24" width="20" height="20">
               <path fill="#ffffff" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </button>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .login-container {
      display: grid;
      grid-template-columns: 1fr 500px;
      min-height: 100dvh;
      background: var(--bg-color);
      position: relative;
      overflow: hidden;
    }
    
    .brand-visual {
      position: relative;
      background: url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop') center/cover;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
    }
    .brand-visual::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(12,12,14,0.95) 0%, rgba(12,12,14,0.4) 100%);
    }
    .mesh-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
      opacity: 0.5;
      pointer-events: none;
    }
    .brand-content-large {
      position: relative;
      z-index: 1;
      max-width: 500px;
      text-align: left;
    }
    .brand-content-large h1 { font-size: 5rem; margin-bottom: 20px; color: var(--primary-color); }
    .brand-content-large p { font-size: 1.5rem; color: var(--text-dim); line-height: 1.4; font-weight: 500; }

    .auth-box {
      background: var(--surface-color);
      border-left: 1px solid var(--glass-border);
      padding: 80px 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      z-index: 1;
      box-shadow: -20px 0 60px rgba(0,0,0,0.5);
    }

    .btn-close {
      position: absolute;
      top: 30px;
      right: 30px;
      background: var(--surface-hover);
      border: 1px solid var(--glass-border);
      color: var(--text-dim);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-close:hover { color: var(--danger); border-color: var(--danger); transform: rotate(90deg); }

    .auth-header { margin-bottom: 50px; }
    .auth-header h2 { font-size: 3rem; margin-bottom: 12px; }
    .subtitle { color: var(--text-dim); font-size: 1.1rem; font-weight: 500; }

    .auth-toggle {
      display: flex;
      background: rgba(255,255,255,0.03);
      padding: 6px;
      border-radius: 16px;
      margin-bottom: 40px;
      border: 1px solid var(--glass-border);
    }
    .auth-toggle button {
      flex: 1;
      padding: 14px;
      border: none;
      background: transparent;
      color: var(--text-dim);
      font-weight: 800;
      cursor: pointer;
      border-radius: 12px;
      transition: all 0.3s;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .auth-toggle button.active {
      background: var(--primary-gradient);
      color: #0c0c0e;
      box-shadow: 0 10px 20px var(--primary-glow);
    }

    .auth-form { display: flex; flex-direction: column; gap: 25px; }
    .form-group label { display: block; margin-bottom: 10px; color: var(--primary-color); }
    
    .btn-primary-glow {
      height: 60px;
      background: var(--primary-gradient);
      color: #0c0c0e;
      border: none;
      border-radius: 100px;
      font-weight: 900;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      cursor: pointer;
      box-shadow: 0 15px 30px var(--primary-glow);
      transition: all 0.4s;
    }
    .btn-primary-glow:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 20px 40px var(--primary-glow); }
    .btn-primary-glow:disabled { opacity: 0.6; cursor: not-allowed; }

    .divider { display: flex; align-items: center; margin: 40px 0; color: var(--text-dim); font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
    .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid var(--glass-border); }
    .divider span { padding: 0 20px; }

    .social-auth-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .btn-social {
      height: 54px;
      border-radius: 100px;
      border: 1px solid var(--glass-border);
      background: rgba(255,255,255,0.03);
      color: var(--text-main);
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 0.9rem;
    }
    .btn-google-premium:hover:not(:disabled) { background: #fff; color: #1f1f1f; transform: translateY(-3px); }
    .btn-facebook-premium:hover:not(:disabled) { background: #1877F2; border-color: #1877F2; transform: translateY(-3px); }

    .loader-white {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(0,0,0,0.1);
      border-top-color: #0c0c0e;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    @media (max-width: 1024px) {
      .login-container { grid-template-columns: 1fr; }
      .brand-visual { display: none; }
      .auth-box { padding: 60px 30px; box-shadow: none; border: none; align-items: center; }
      .auth-header, .auth-form, .auth-toggle, .divider, .social-auth-grid { width: 100%; max-width: 450px; }
    }

    @media (max-width: 480px) {
      .auth-box { padding: 80px 20px 40px; }
      .auth-header h2 { font-size: 2.2rem; }
      .auth-header { text-align: center; }
      .btn-close { top: 20px; right: 20px; width: 38px; height: 38px; }
      .btn-primary-glow { height: 54px; }
    }
  `]
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  router = inject(Router);
  route = inject(ActivatedRoute);
  ts = inject(TranslationService);
  t = this.ts.t();

  mode = signal<'login' | 'signup'>('login');
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    displayName: ['']
  });

  async ngOnInit() {
    this.loading.set(true);
    try {
      const user = await this.authService.handleRedirectResult();
      if (user) {
        this.redirect();
      }
    } catch (err: any) {
      this.errorMessage.set(this.formatError(err));
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit() {
    if (this.authForm.invalid) return;
    
    this.loading.set(true);
    this.errorMessage.set(null);
    const { email, password, displayName } = this.authForm.value as any;

    try {
      if (this.mode() === 'login') {
        await this.authService.loginWithEmail(email, password);
      } else {
        await this.authService.signUp(email, password, displayName);
      }
      this.redirect();
    } catch (err: any) {
      this.errorMessage.set(this.formatError(err));
    } finally {
      this.loading.set(false);
    }
  }

  async loginWithGoogle() {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const { user, redirected } = await this.authService.loginWithGoogle();
      if (user) {
        this.redirect();
      } else if (redirected) {
        // Browser is redirecting, keep loading state
        return;
      }
    } catch (err: any) {
      this.errorMessage.set(this.formatError(err));
      this.loading.set(false);
    } finally {
      // Only clear loading if we are NOT redirecting
      // (On redirect, the page will reload anyway)
      // Note: result of loginWithGoogle check above handles this
    }
  }

  async loginWithFacebook() {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const { user, redirected } = await this.authService.loginWithFacebook();
      if (user) {
        this.redirect();
      } else if (redirected) {
        return;
      }
    } catch (err: any) {
      this.errorMessage.set(this.formatError(err));
      this.loading.set(false);
    }
  }

  private redirect() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.router.navigateByUrl(returnUrl);
  }

  private formatError(err: any): string {
    const code = err.code;
    const message = err.message;

    // Display custom error messages if they exist
    if (message && message.includes('Authorized Domains')) return message;

    switch (code) {
      case 'auth/user-not-found': return 'Account not found.';
      case 'auth/wrong-password': return 'Invalid password.';
      case 'auth/email-already-in-use': return 'Email already registered.';
      case 'auth/popup-closed-by-user': return 'Login cancelled.';
      case 'auth/cancelled-via-redirect': return 'Authentication was cancelled.';
      case 'auth/unauthorized-domain': return 'This domain is not authorized. Please add your Vercel URL to Authorized Domains in Firebase Console.';
      default: return message || 'Authentication failed. Please try again.';
    }
  }
}
