import { Component, Input, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-social-share',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="share-links">
      <button (click)="shareWhatsApp()" class="share-btn wa" title="Share to WhatsApp">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>

      <button (click)="shareThreads()" class="share-btn threads" title="Share to Threads">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M15.215 13.063c-.157.03-.314.053-.473.07a5.53 5.53 0 0 1-.505.02c-1.424 0-2.584-.366-3.418-1.077-.847-.723-1.282-1.745-1.282-2.998 0-1.246.438-2.274 1.288-2.992.836-.71 1.996-1.074 3.42-1.074 1.417 0 2.569.362 3.398 1.066.836.716 1.272 1.741 1.272 2.987 0 1.238-.432 2.261-1.266 2.973-.203.174-.424.322-.663.444l.013.01c.214.1.42.215.617.346.906.602 1.547 1.458 1.91 2.532.338.995.42 2.155.234 3.44-.132.91-.43 1.7-.872 2.33-.42.597-.978 1.054-1.637 1.344-1.096.483-2.395.666-3.83.541-1.42-.123-2.65-.544-3.616-1.236-1.243-.889-2.078-2.218-2.457-3.905-.386-1.724-.263-3.498.36-5.205.586-1.605 1.623-3.003 3.033-4.093.585-.452 1.243-.83 1.956-1.127a11.163 11.163 0 0 1 1.343-.45l.178-.046c.162-.042.324-.077.487-.105.158-.027.317-.05.476-.065.152-.014.306-.024.46-.03.16-.005.32-.008.48-.008.484 0 .93.04 1.332.115.39.073.743.193 1.053.356l-.16.326a1.952 1.952 0 0 1-1.57-.468c-.147-.11-.312-.19-.49-.236-.184-.047-.384-.07-.597-.07-.22 0-.442.02-.66.06a5.794 5.794 0 0 0-.616.155c-.19.06-.37.135-.54.225a6.6 6.6 0 0 0-.486.29 8.017 8.017 0 0 0-.416.31c-.55.45-.99 1.005-1.31 1.65-.325.64-.495 1.37-.51 2.18-.01.37.034.722.13 1.05.093.32.227.605.395.855.166.246.363.453.58.62.214.16.444.283.682.368.24.084.484.133.727.147.243.013.483 0 .713-.035.23-.037.45-.102.65-.195.196-.093.375-.214.53-.36l.01-.01c.365-.324.622-.75.76-1.26a4.836 4.836 0 0 0 .153-1.17c0-.773-.243-1.423-.717-1.92-.475-.497-1.144-.755-1.977-.765-.833-.01-1.51.233-2 .725-.497.49-.757 1.155-.77 1.978-.013.82.235 1.488.73 1.986.495.5 1.168.762 2 .776.4.007.76-.05 1.077-.17zm-4.32 8.764c.82.585 1.832.943 3.01 1.063 1.19.123 2.296-.008 3.292-.393.58-.224 1.085-.568 1.493-1.02.408-.453.692-.998.832-1.616.14-.618.156-1.285.045-1.983-.11-.698-.352-1.385-.718-2.04l-.01.008c-.287-.506-.65-.935-1.077-1.272a5.57 5.57 0 0 1-.84-.56c-.11-.08-.23-.16-.345-.23l-.15-.09c-.04-.025-.08-.05-.12-.075l-.23-.135c-.15-.085-.3-.158-.45-.22a4.43 4.43 0 0 0-.435-.16l-.21-.06c-.07-.02-.138-.036-.206-.05l-.19-.04a5.31 5.31 0 0 0-.37-.05l-.18-.016c-.12-.008-.242-.012-.363-.012h-.012l-.02.01c-.122 0-.244.005-.365.013a5.53 5.53 0 0 0-.745.1c-.244.053-.483.13-.71.232l-.008-.008a3.14 3.14 0 0 0-.61.353 3.23 3.23 0 0 0-.512.484c-.155.18-.287.385-.39.61s-.155.485-.155.776c0 .546.168 1.026.495 1.423.327.397.77.602 1.312.602.43 0 .805-.13 1.114-.383.31-.253.513-.59.602-1.003l.008.008c.033.003.064.006.096.006.28 0 .54-.055.77-.16.233-.105.428-.243.584-.41s.27-.358.336-.57c.066-.212.1-.432.102-.656v-.012c0-.525-.157-1.002-.464-1.417-.307-.415-.72-.733-1.222-.94-.28-.115-.59-.186-.92-.213a4.7 4.7 0 0 0-.965.03c-.158.026-.316.06-.47.1l-.17.045c-.135.035-.266.077-.39.127l-.145.06a5.61 5.61 0 0 0-.53.255 5.5 5.5 0 0 0-.486.297l-.01.005a7.35 7.35 0 0 0-.434.31 10.63 10.63 0 0 0-1.06 1 11.23 11.23 0 0 0-.915 1.13c-.27.39-.5.81-.69 1.25-.19.445-.335.91-.43 1.395-.1.49-.15 1.005-.155 1.54 0 .53.047 1.07.135 1.61s.225 1.07.412 1.58c.188.513.42 1 .7 1.455.28.455.6.87.95 1.24.35.37.73.693 1.135.96z"/>
        </svg>
      </button>

      <button (click)="shareTwitter()" class="share-btn tw" title="Share to X">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </button>

      <button (click)="shareFacebook()" class="share-btn fb" title="Share to Facebook">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </button>

      <button (click)="shareLinkedIn()" class="share-btn ln" title="Share to LinkedIn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.204 24 24 23.227 24 22.271V1.729C24 .774 23.204 0 22.225 0z"/>
        </svg>
      </button>

      <button (click)="copyLink()" class="share-btn copy" [class.copied]="copied" [title]="copied ? 'Copied!' : 'Copy Link'">
        <svg *ngIf="!copied" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
        <svg *ngIf="copied" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .share-links {
      display: flex;
      gap: 14px;
      justify-content: center;
      margin: 25px 0;
      flex-wrap: wrap;
    }
    .share-btn {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      border: 1px solid var(--glass-border);
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: var(--text-dim);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      overflow: hidden;
    }
    .share-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .share-btn:hover {
      transform: translateY(-6px) scale(1.08);
      color: var(--text-main);
      border-color: var(--primary-color);
      box-shadow: 0 12px 25px rgba(0,0,0,0.15);
    }
    .share-btn:active {
      transform: translateY(-2px) scale(0.95);
    }
    .share-btn.copied {
      color: #22c55e !important;
      border-color: #22c55e !important;
      background: rgba(34, 197, 94, 0.05) !important;
    }
    .share-btn.wa:hover { color: #25D366; border-color: rgba(37, 211, 102, 0.3); background: rgba(37, 211, 102, 0.05); }
    .share-btn.threads:hover { color: #000000; border-color: rgba(0, 0, 0, 0.3); background: rgba(0, 0, 0, 0.05); }
    .share-btn.tw:hover { color: #1DA1F2; border-color: rgba(29, 161, 242, 0.3); background: rgba(29, 161, 242, 0.05); }
    .share-btn.fb:hover { color: #1877F2; border-color: rgba(24, 119, 242, 0.3); background: rgba(24, 119, 242, 0.05); }
    .share-btn.ln:hover { color: #0A66C2; border-color: rgba(10, 102, 194, 0.3); background: rgba(10, 102, 194, 0.05); }
    .share-btn.copy:hover:not(.copied) { color: var(--primary-color); border-color: var(--primary-color); background: rgba(var(--primary-rgb), 0.05); }
  `]
})
export class SocialShareComponent {
  @Input() url: string = '';
  @Input() text: string = 'Check this out on CuppingNotes!';

  copied = false;
  private platformId = inject(PLATFORM_ID);

  private getUrl(): string {
    if (this.url) return this.url;
    if (isPlatformBrowser(this.platformId)) {
      // Use environment.siteUrl to ensure we always share the production domain
      // and avoid issues with ephemeral Vercel preview domains or local dev.
      const path = window.location.pathname + window.location.search;
      return environment.siteUrl + path;
    }
    return '';
  }

  shareWhatsApp() {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(this.text + ' ' + this.getUrl())}`;
    window.open(waUrl, '_blank');
  }

  shareThreads() {
    const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(this.text + ' ' + this.getUrl())}`;
    window.open(threadsUrl, '_blank');
  }

  shareTwitter() {
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.text)}&url=${encodeURIComponent(this.getUrl())}`;
    window.open(twUrl, '_blank');
  }

  shareFacebook() {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.getUrl())}&quote=${encodeURIComponent(this.text)}`;
    window.open(fbUrl, '_blank');
  }

  shareLinkedIn() {
    const lnUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.getUrl())}`;
    window.open(lnUrl, '_blank');
  }

  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.getUrl());
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  }
}
