export interface SensoryScores {
  fragranceAroma: number;
  flavor: number;
  aftertaste: number;
  acidity: number;
  body: number;
  balance: number;
  uniformity: number;
  cleanCup: number;
  sweetness: number;
  overall: number;
}

export interface CuppingSession {
  id?: string;
  beanName: string;
  type: string; // Arabica, Robusta, etc.
  origin?: string;
  roastery: string;
  productionDate: string;
  postHarvest: string;
  brewMethod: string;
  cupperName: string;
  shareImageUrl?: string;
  intensities?: {
    acidity: number; // 1-10 intensity
    body: number; // 1-10 intensity
    sweetness: number; // 1-10 intensity
  };
  flavorNotes: string[]; // SCA Flavor Wheel categories
  scores: SensoryScores;
  defects: number;
  finalScore: number;
  notes?: string;
  isPublic?: boolean;
  likesCount?: number;
  savedBy?: string[]; // Array of user IDs who bookmarked this
  timestamp: any;
}

export interface GlobalScore {
  type: string;
  averageScore: number;
  entryCount: number;
}
