import { Injectable, inject } from '@angular/core';
import { Firestore, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { CuppingService } from './cupping.service';
import { UserProfile } from '../models/user-profile.model';
import { Observable, from, map, switchMap, of } from 'rxjs';

export interface TierDetails {
  id: 'classic' | 'pro' | 'roastery';
  name: string;
  price: string;
  features: string[];
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private cuppingService = inject(CuppingService);

  readonly TIERS: TierDetails[] = [
    {
      id: 'classic',
      name: 'Classic',
      price: 'Free',
      features: ['Unlimited Cuppings', 'Discovery Feed', 'Basic Stats'],
      color: 'var(--text-dim)'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9.99/mo',
      features: ['Advanced Sensory Analysis', 'Branded PDF Exports', 'Custom @Handle', 'Batch Comparisons'],
      color: 'var(--primary-color)'
    },
    {
      id: 'roastery',
      name: 'Roastery',
      price: '$49.99/mo',
      features: ['Multi-Cupper Teams', 'Inventory Sync', 'Client QC Reports', 'Priority Support'],
      color: '#d4e157'
    }
  ];

  getCurrentMembership(): Observable<TierDetails | null> {
    return this.auth.user$.pipe(
      switchMap(user => {
        if (!user) return of(null);
        return this.cuppingService.getUserProfile(user.uid).pipe(
          map(profile => {
            if (!profile) return this.TIERS[0];
            return this.TIERS.find(t => t.id === profile.membership) || this.TIERS[0];
          })
        );
      })
    );
  }

  isPro$(): Observable<boolean> {
    return this.getCurrentMembership().pipe(map(m => m ? (m.id === 'pro' || m.id === 'roastery') : false));
  }

  isRoastery$(): Observable<boolean> {
    return this.getCurrentMembership().pipe(map(m => m?.id === 'roastery' || false));
  }

  async upgradeMembership(tierId: 'pro' | 'roastery'): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    const profileRef = doc(this.firestore, 'profiles', user.uid);
    
    // Simulated Payment Delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update with 1 year expiry for simulation
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    await updateDoc(profileRef, {
      membership: tierId,
      subscriptionExpiry: expiry,
      updatedAt: new Date()
    });
  }

  async finalizeUpgrade(tierId: 'pro' | 'roastery', paymentData: any): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    const profileRef = doc(this.firestore, 'profiles', user.uid);
    
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    await updateDoc(profileRef, {
      membership: tierId,
      subscriptionExpiry: expiry,
      lastPaymentId: paymentData.payment_id || paymentData.orderID || 'PAYPAL_HOSTED',
      lastPaymentDate: new Date(),
      updatedAt: new Date()
    });

    // Refresh the user profile cache if necessary
    console.log(`Membership finalized for ${user.uid}: ${tierId}`);
  }

  hasAccess(featureId: string, currentTier: 'classic' | 'pro' | 'roastery'): boolean {
    const proFeatures = ['advanced_stats', 'pdf_export', 'custom_handle'];
    const roasteryFeatures = [...proFeatures, 'team_management', 'inventory_sync'];

    if (currentTier === 'roastery') return true;
    if (currentTier === 'pro' && proFeatures.includes(featureId)) return true;
    if (currentTier === 'classic' && !proFeatures.includes(featureId) && !roasteryFeatures.includes(featureId)) return true;
    
    return false;
  }
}
