import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from './translation.service';

export interface SeoOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  origin?: string;
  isVerified?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  private ts = inject(TranslationService);
  private t = this.ts.t();

  updateMeta(options: SeoOptions = {}) {
    const siteName = this.t('APP_TITLE');
    const baseTitle = options.title || 'Professional Coffee Cupping Platform';
    const baseDesc = options.description || 'Evaluate, score, and share specialty coffee sensory profiles with precision.';
    
    const fullTitle = baseTitle.includes(siteName) ? baseTitle : `${baseTitle} | ${siteName}`;
    
    this.title.setTitle(fullTitle);

    // Standard Meta
    this.meta.updateTag({ name: 'description', content: baseDesc });

    // Open Graph
    this.meta.updateTag({ property: 'og:site_name', content: siteName });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: baseDesc });
    this.meta.updateTag({ property: 'og:type', content: options.type || 'website' });
    this.meta.updateTag({ property: 'og:locale', content: this.ts.currentLang() === 'id' ? 'id_ID' : 'en_US' });
    
    if (options.url) {
      this.meta.updateTag({ property: 'og:url', content: options.url });
    } else if (isPlatformBrowser(this.platformId)) {
      this.meta.updateTag({ property: 'og:url', content: window.location.href });
    }

    if (options.image) {
      this.meta.updateTag({ property: 'og:image', content: options.image });
      this.meta.updateTag({ property: 'og:image:alt', content: fullTitle });
      this.meta.updateTag({ name: 'twitter:image', content: options.image });
      this.meta.updateTag({ name: 'twitter:image:alt', content: fullTitle });
      // Power move: add width/height for instant preview stability
      this.meta.updateTag({ property: 'og:image:width', content: '1200' });
      this.meta.updateTag({ property: 'og:image:height', content: '630' });
    }

    // Twitter
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: baseDesc });
    this.meta.updateTag({ name: 'twitter:site', content: '@cuppingnotes' });
    this.meta.updateTag({ name: 'twitter:creator', content: '@cuppingnotes' });

    // GEO Tags
    if (options.origin) {
      this.meta.updateTag({ name: 'geo.placename', content: options.origin });
    }

    this.setCanonicalUrl(options.url);
  }

  setCanonicalUrl(url?: string) {
    const link: HTMLLinkElement = this.document.querySelector('link[rel="canonical"]') || this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url || (isPlatformBrowser(this.platformId) ? window.location.href : ''));
    if (!this.document.querySelector('link[rel="canonical"]')) {
      this.document.head.appendChild(link);
    }
  }

  /**
   * Adds JSON-LD structured data to the head
   */
  addJsonLd(data: any) {
    if (!isPlatformBrowser(this.platformId)) return;

    let script = this.document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!script) {
      script = this.document.createElement('script');
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.text = JSON.stringify(data);
  }

  /**
   * Clears JSON-LD when leaving a page
   */
  clearJsonLd() {
    const script = this.document.querySelector('script[type="application/ld+json"]');
    if (script) {
      script.remove();
    }
  }
}
