import { Injectable, signal } from '@angular/core';

export interface SensoryProfile {
  acidity: number;
  body: number;
  flavor: number;
  sweetness: number;
  aftertaste: number;
}

@Injectable({
  providedIn: 'root'
})
export class SensoryAiService {
  /**
   * Predicts flavor descriptors based on numerical input heuristic.
   * This mimics an expert cupper's intuition.
   */
  predictDescriptors(profile: SensoryProfile): string[] {
    const descriptors: string[] = [];

    // Acidity Logic
    if (profile.acidity >= 9.0) descriptors.push('Effervescent', 'Vibrant');
    else if (profile.acidity >= 8.0) descriptors.push('Bright', 'Crisp');
    else if (profile.acidity < 7.0) descriptors.push('Muted', 'Flat');

    // Body Logic
    if (profile.body >= 9.0) descriptors.push('Syrupy', 'Heavy');
    else if (profile.body >= 8.0) descriptors.push('Creamy', 'Round');
    else if (profile.body < 7.0) descriptors.push('Thin', 'Tea-like');

    // Flavor & Aftertaste Synergy
    if (profile.flavor >= 8.5 && profile.aftertaste >= 8.5) {
      descriptors.push('Complex', 'Evolving');
    }

    // High Sweetness
    if (profile.sweetness >= 9.0) descriptors.push('Jammy', 'Honey-like');

    // Specialized Profiles (Heuristic "Algorithm")
    if (profile.acidity > profile.body + 1) descriptors.push('Citrus-forward');
    if (profile.body > profile.acidity + 1) descriptors.push('Chocolatey/Nutty Foundation');
    
    return descriptors;
  }

  /**
   * Calculates the "Specialty Potential" of a profile.
   */
  calculateSpecialtyGrade(totalScore: number): { grade: string, color: string } {
    if (totalScore >= 90) return { grade: 'Outstanding', color: '#d4e157' };
    if (totalScore >= 85) return { grade: 'Excellent', color: '#bd8e62' };
    if (totalScore >= 80) return { grade: 'Very Good', color: '#86868b' };
    return { grade: 'Commercial/Premium', color: '#ff453a' };
  }
}
