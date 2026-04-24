export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  username?: string;
  handle?: string;
  photoURL?: string;
  totalSessions: number;
  totalCuppingHours: number;
  xp: number;
  level: number;
  badges: Badge[];
  avatarStage: AvatarStage;
  membership: 'classic' | 'pro' | 'roastery';
  subscriptionExpiry?: any;
  teamId?: string;
  updatedAt: any;
  shareImageUrl?: string;
}

export type AvatarStage = 'seedling' | 'sprout' | 'flowering' | 'cherry' | 'harvest';

export const LEVEL_THRESHOLDS = [0, 500, 1500, 3500, 7500]; // XP required for Level 1, 2, 3, 4, 5

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_cupping',
    name: 'First Crack',
    description: 'Completed your first cupping session.',
    icon: '🔥'
  },
  {
    id: 'specialty_seeker',
    name: 'Specialty Seeker',
    description: 'Cupped 10 coffees with a score of 80+.',
    icon: '✨'
  },
  {
    id: 'flavor_master',
    name: 'Flavor Alchemist',
    description: 'Identified 50+ unique flavor notes across sessions.',
    icon: '🧪'
  },
  {
    id: 'community_hero',
    name: 'Community Hero',
    description: 'Received 100+ likes on your public cuppings.',
    icon: '🏆'
  }
];
