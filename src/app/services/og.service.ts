import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CuppingService } from './cupping.service';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class OgService {
  private cuppingService = inject(CuppingService);
  private platformId = inject(PLATFORM_ID);

  /**
   * Generates a screenshot of a DOM element and uploads it to storage.
   * @param elementId The ID of the element to capture.
   * @param fileName The name of the file in storage (without extension).
   * @param folder The folder in storage (e.g., 'shares', 'profiles').
   * @returns The download URL of the uploaded image.
   */
  async generateAndUpload(elementId: string, fileName: string, folder: string = 'shares'): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId)) return null;

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        console.error(`Element with ID ${elementId} not found.`);
        return null;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#0c0c0e', // Default dark theme
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (doc) => {
          // Hide elements with 'no-export' class
          const noExport = doc.querySelectorAll('.no-export, .actions');
          noExport.forEach(el => (el as HTMLElement).style.display = 'none');
        }
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return null;

      const filePath = `${folder}/${fileName}.png`;
      // We'll reuse uploadShareImage logic but more generalized if possible
      // For now, I'll just use a direct upload logic if I can, or call cuppingService
      
      // Use the flexible uploadShareImage method
      return await this.cuppingService.uploadShareImage(fileName, blob, folder);
    } catch (e) {
      console.error('OG Generation failed:', e);
      return null;
    }
  }
}
