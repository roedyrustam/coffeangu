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
   * Generates a poetic "Archetype" name based on the flavor profile.
   */
  predictArchetype(scores: any): { name: string, description: string } {
    const acidity = scores.acidity || 0;
    const body = scores.mouthfeel || 0;
    const flavor = scores.flavor || 0;
    const sweetness = scores.sweetness || 0;

    if (acidity >= 8.5 && flavor >= 8.5) {
      return { 
        name: 'The Radiant Flare', 
        description: 'A brilliant explosion of high-altitude acidity and complex aromatics.' 
      };
    }
    if (profile.body >= 8.5 && profile.sweetness >= 8.5) {
      return { 
        name: 'The Velvet Forge', 
        description: 'Deep, syrupy body with intense caramelized sweetness and a lingering finish.' 
      };
    }
    if (profile.acidity >= 8.0 && profile.sweetness >= 8.5) {
      return { 
        name: 'The Nectarine Stream', 
        description: 'Perfectly balanced fruit-forward profile with honey-like sweetness.' 
      };
    }
    if (profile.acidity < 7.5 && profile.body >= 8.0) {
      return { 
        name: 'The Obsidian Core', 
        description: 'Solid, grounded profile with heavy mouthfeel and chocolatey foundations.' 
      };
    }
    return { 
      name: 'The Balanced Horizon', 
      description: 'A harmonious blend of specialty attributes without a single dominant peak.' 
    };
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
