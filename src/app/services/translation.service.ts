import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private platformId = inject(PLATFORM_ID);
  
  // Current locale signal
  currentLocale = signal<string>('en');
  
  // Translation dictionary signal
  private dictionary = signal<any>({});

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedLocale = localStorage.getItem('locale') || 'en';
      this.setLocale(savedLocale);
    }
  }

  async setLocale(locale: string) {
    try {
      const response = await fetch(`/locales/${locale}.json`);
      const data = await response.json();
      this.dictionary.set(data);
      this.currentLocale.set(locale);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('locale', locale);
        document.documentElement.lang = locale;
      }
    } catch (e) {
      console.error(`Failed to load locale: ${locale}`, e);
    }
  }

  // Reactive translation getter
  translate(key: string): string {
    const dict = this.dictionary();
    return dict[key] || key;
  }

  // Computed signal for direct usage in templates if needed
  t = computed(() => (key: string) => this.translate(key));
}
