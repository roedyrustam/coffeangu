import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile, LEVEL_THRESHOLDS } from '../../models/user-profile.model';

@Component({
  selector: 'app-sensory-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avatar-container glass-card animate-fade animate-float">
      <div class="avatar-aura" [class]="profile.avatarStage"></div>
      
      <div class="avatar-image-wrapper">
        <img [src]="'/assets/avatars/' + profile.avatarStage + '.png'" 
             [alt]="profile.avatarStage" 
             class="avatar-growth-image">
      </div>
      <div class="avatar-shadow"></div>


      <div class="avatar-stats">
        <div class="level-badge">
          <span class="level-label">Level</span>
          <span class="level-value">{{ profile.level }}</span>
        </div>
        
        <div class="xp-progress-container">
          <div class="xp-info">
            <span class="xp-current">{{ profile.xp }} XP</span>
            <span class="xp-next" *ngIf="nextLevelXp">{{ nextLevelXp }} XP to Level {{ profile.level + 1 }}</span>
            <span class="xp-next" *ngIf="!nextLevelXp">MAX LEVEL</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" [style.width.%]="xpPercentage"></div>
          </div>
        </div>
      </div>

      <div class="avatar-rank">
        <h4 class="rank-name">{{ getRankName() }}</h4>
        <p class="jam-terbang">Jam Terbang: {{ profile.totalSessions }} Sesi Cupping</p>
      </div>
    </div>
  `,
  styles: [`
    .avatar-container {
      padding: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      overflow: hidden;
      border: 1px solid var(--glass-border);
      background: rgba(12, 12, 14, 0.4);
    }
    .avatar-aura {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 250px;
      height: 250px;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.3;
      z-index: 0;
      transition: all 1s ease;
    }
    .avatar-aura.seedling { background: #d4e157; }
    .avatar-aura.sprout { background: #9ccc65; }
    .avatar-aura.flowering { background: #eeeeee; }
    .avatar-aura.cherry { background: #ef5350; }
    .avatar-aura.harvest { background: #ffca28; }

    .avatar-image-wrapper {
      width: 180px;
      height: 180px;
      position: relative;
      z-index: 1;
      margin-bottom: 20px;
      filter: drop-shadow(0 15px 35px rgba(0,0,0,0.5));
    }
    .avatar-growth-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .avatar-shadow {
      width: 60px;
      height: 8px;
      background: rgba(0,0,0,0.4);
      border-radius: 50%;
      filter: blur(8px);
      margin-top: -10px;
      margin-bottom: 30px;
      transform: scale(1);
      transition: all 3s ease-in-out;
    }
    
    .avatar-container.animate-float .avatar-shadow {
      animation: shadowScale 6s ease-in-out infinite;
    }

    @keyframes shadowScale {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(0.7); opacity: 0.2; }
    }

    .avatar-stats {
      width: 100%;
      display: flex;
      gap: 20px;
      align-items: center;
      margin-bottom: 25px;
      position: relative;
      z-index: 1;
    }
    .level-badge {
      background: var(--primary-gradient);
      padding: 12px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      min-width: 70px;
      box-shadow: 0 10px 20px -5px var(--primary-glow);
    }
    .level-label {
      font-size: 0.6rem;
      font-weight: 800;
      text-transform: uppercase;
      color: rgba(12,12,14,0.7);
    }
    .level-value {
      font-size: 1.8rem;
      font-weight: 950;
      color: #0c0c0e;
      line-height: 1;
    }

    .xp-progress-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .xp-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-dim);
    }
    .xp-current { color: var(--primary-color); }

    .progress-bar-bg {
      height: 10px;
      background: rgba(255,255,255,0.05);
      border-radius: 100px;
      overflow: hidden;
      border: 1px solid var(--glass-border);
    }
    .progress-bar-fill {
      height: 100%;
      background: var(--primary-gradient);
      border-radius: 100px;
      box-shadow: 0 0 15px var(--primary-glow);
      transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .avatar-rank .rank-name {
      font-size: 1.5rem;
      font-weight: 900;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .jam-terbang {
      color: var(--text-dim);
      font-size: 0.9rem;
      font-weight: 600;
    }
  `]
})
export class SensoryAvatarComponent {
  @Input({ required: true }) profile!: UserProfile;

  get nextLevelXp(): number | null {
    if (this.profile.level >= LEVEL_THRESHOLDS.length) return null;
    return LEVEL_THRESHOLDS[this.profile.level];
  }

  get xpPercentage(): number {
    const currentThreshold = LEVEL_THRESHOLDS[this.profile.level - 1] || 0;
    const nextThreshold = this.nextLevelXp;
    
    if (!nextThreshold) return 100;
    
    const range = nextThreshold - currentThreshold;
    const progress = this.profile.xp - currentThreshold;
    
    return Math.min(Math.max((progress / range) * 100, 0), 100);
  }

  getRankName(): string {
    switch(this.profile.avatarStage) {
      case 'seedling': return 'Novice Cupper';
      case 'sprout': return 'Enthusiast';
      case 'flowering': return 'Sensory Explorer';
      case 'cherry': return 'Pro Evaluator';
      case 'harvest': return 'Flavor Master';
      default: return 'CVA Candidate';
    }
  }
}
