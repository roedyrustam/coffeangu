import { Component, Input, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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
        <svg viewBox="0 0 192 192" width="20" height="20" fill="currentColor">
          <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.679-1.14-23.82 1.371-39.134 15.326-38.092 34.702.528 9.818 5.235 18.28 13.258 23.828 6.776 4.688 15.505 7.004 24.574 6.512 11.982-.649 21.378-5.263 27.929-13.726 4.98-6.434 8.088-14.699 9.37-24.958 5.608 3.382 9.792 7.832 12.276 13.348 4.14 9.193 4.386 24.29-3.411 32.086-6.854 6.854-15.088 9.818-27.57 9.918-13.834-.111-24.297-4.542-31.105-13.177-6.363-8.074-9.674-19.645-9.845-34.395.171-14.75 3.482-26.321 9.845-34.395 6.808-8.635 17.271-13.066 31.105-13.177 13.924.112 24.583 4.59 31.668 13.303 3.455 4.25 6.083 9.657 7.905 16.057l14.603-3.485c-2.342-8.25-5.918-15.318-10.744-21.16-9.705-12.675-24.076-19.27-42.73-19.42h-.404c-18.584.15-32.837 6.747-42.349 19.609-8.178 11.048-12.394 25.776-12.59 43.843.196 18.067 4.412 32.795 12.59 43.843 9.512 12.862 23.765 19.459 42.349 19.609h.404c15.592-.112 27.318-4.233 36.978-13.003 12.79-12.79 13.097-33.27 7.444-45.804-3.836-8.507-10.636-15.307-19.885-19.72zM89.739 129.658c-10.063.553-20.501-3.97-21.105-15.213-.449-8.378 5.857-17.736 24.517-18.81a82.3 82.3 0 0 1 12.299-.075c3.962.281 7.649.815 11.014 1.59-1.254 22.572-14.258 31.967-26.725 32.508z"/>
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

      <button (click)="copyLink()" class="share-btn copy" title="Copy Link">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .share-links {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin: 20px 0;
    }
    .share-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1px solid var(--glass-border);
      background: var(--surface-color);
      color: var(--text-dim);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .share-btn:hover {
      transform: translateY(-5px) scale(1.1);
      color: var(--text-main);
      border-color: var(--primary-color);
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    .share-btn.wa:hover { color: #25D366; border-color: #25D366; }
    .share-btn.threads:hover { color: #000000; border-color: #000000; }
    .share-btn.tw:hover { color: #1DA1F2; border-color: #1DA1F2; }
    .share-btn.fb:hover { color: #1877F2; border-color: #1877F2; }
    .share-btn.ln:hover { color: #0A66C2; border-color: #0A66C2; }
    .share-btn.copy:hover { color: var(--primary-color); border-color: var(--primary-color); }
  `]
})
export class SocialShareComponent {
  @Input() url: string = '';
  @Input() text: string = 'Check this out on CuppingNotes!';

  private platformId = inject(PLATFORM_ID);

  private getUrl(): string {
    if (this.url) return this.url;
    return isPlatformBrowser(this.platformId) ? window.location.href : '';
  }

  shareWhatsApp() {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(this.text + ' ' + this.getUrl())}`;
    window.open(waUrl, '_blank');
  }

  shareThreads() {
    // Threads uses intent URL which pre-fills text + link
    const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(this.text + ' ' + this.getUrl())}`;
    window.open(threadsUrl, '_blank');
  }

  shareTwitter() {
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.text)}&url=${encodeURIComponent(this.getUrl())}`;
    window.open(twUrl, '_blank');
  }

  shareFacebook() {
    // Facebook sharer with quote for richer preview text
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
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  }
}
