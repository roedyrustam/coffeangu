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

        <button (click)="loginWithGoogle()" class="btn-google" [disabled]="loading()">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }
    .login-card {
      width: 100%;
      max-width: 480px;
      padding: 48px;
    }
    header {
      text-align: center;
      margin-bottom: 40px;
    }
    h2 {
      font-size: 2.5rem;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .subtitle {
      color: var(--text-dim);
      font-size: 0.95rem;
    }
    .auth-toggle {
      display: flex;
      background: var(--surface-hover);
      padding: 6px;
      border-radius: 12px;
      margin-bottom: 30px;
      border: 1px solid var(--glass-border);
    }
    .auth-toggle button {
      flex: 1;
      padding: 10px;
      border: none;
      background: transparent;
      color: var(--text-dim);
      font-weight: 700;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .auth-toggle button.active {
      background: var(--surface-color);
      color: var(--primary-color);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .form-group {
      margin-bottom: 24px;
    }
    .form-group label {
      display: block;
      color: var(--text-dim);
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 10px;
    }
    input {
      width: 100%;
      height: 56px;
    }
    .w-full { width: 100%; }
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 30px 0;
      color: var(--text-dim);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--glass-border);
    }
    .divider span {
      padding: 0 15px;
    }
    .btn-google {
      width: 100%;
      background: #ffffff;
      color: #1f1f1f;
      border: none;
      height: 56px;
      border-radius: 100px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 0.95rem;
    }
    .btn-google:hover {
      box-shadow: 0 0 20px rgba(255,255,255,0.2);
      transform: translateY(-2px);
    }
    .error-msg {
      color: var(--danger);
      font-size: 0.85rem;
      margin-bottom: 20px;
      background: rgba(255, 69, 58, 0.1);
      padding: 12px;
      border-radius: 8px;
      border-left: 3px solid var(--danger);
    }
    .loader {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(0,0,0,0.1);
      border-top-color: #000;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 600px) {
      .login-card {
        padding: 30px 24px;
        border-radius: 24px;
      }
      h2 { font-size: 2rem; }
      .login-container { padding: 10px; min-height: 70vh; }
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
    try {
      const user = await this.authService.handleRedirectResult();
      if (user) {
        this.redirect();
      }
    } catch (err: any) {
      this.errorMessage.set(this.formatError(err.code));
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
      this.errorMessage.set(this.formatError(err.code));
    } finally {
      this.loading.set(false);
    }
  }

  async loginWithGoogle() {
    this.loading.set(true);
    try {
      await this.authService.loginWithGoogle();
      this.redirect();
    } catch (err: any) {
      this.errorMessage.set(this.formatError(err.code));
    } finally {
      this.loading.set(false);
    }
  }

  private redirect() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.router.navigateByUrl(returnUrl);
  }

  private formatError(code: string): string {
    switch (code) {
      case 'auth/user-not-found': return 'Account not found.';
      case 'auth/wrong-password': return 'Invalid password.';
      case 'auth/email-already-in-use': return 'Email already registered.';
      default: return 'Authentication failed. Please try again.';
    }
  }
}
