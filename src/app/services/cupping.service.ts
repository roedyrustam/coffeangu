import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, orderBy, limit, doc, getDoc, updateDoc, setDoc, where, increment, arrayUnion, arrayRemove, deleteDoc, QueryConstraint } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, of } from 'rxjs';
import { CuppingSession, GlobalScore } from '../models/cupping.model';
import { AuthService } from './auth.service';
import { UserProfile, LEVEL_THRESHOLDS, ALL_BADGES, Badge } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class CuppingService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private auth = inject(AuthService);
  private cuppingCollection = collection(this.firestore, 'cuppings');
  private profilesCollection = collection(this.firestore, 'profiles');
  private usernamesCollection = collection(this.firestore, 'usernames');

  getUserProfile(userId: string): Observable<UserProfile | null> {
    const docRef = doc(this.firestore, 'profiles', userId);
    return new Observable(observer => {
      getDoc(docRef).then(snap => {
        if (snap.exists()) {
          observer.next(snap.data() as UserProfile);
        } else {
          observer.next(null);
        }
      }).catch(err => observer.error(err));
    });
  }

  getPublicProfiles(limitCount: number = 10): Observable<UserProfile[]> {
    const q = query(this.profilesCollection, orderBy('xp', 'desc'), limit(limitCount));
    return collectionData(q, { idField: 'uid' }) as Observable<UserProfile[]>;
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const handle = username.toLowerCase().replace('@', '');
    const docRef = doc(this.firestore, 'usernames', handle);
    const snap = await getDoc(docRef);
    return !snap.exists();
  }

  async getProfileByHandle(handle: string): Promise<UserProfile | null> {
    const username = handle.toLowerCase().replace('@', '');
    const userRef = doc(this.firestore, 'usernames', username);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const uid = userSnap.data()['uid'];
      const profileSnap = await getDoc(doc(this.firestore, 'profiles', uid));
      return profileSnap.exists() ? (profileSnap.data() as UserProfile) : null;
    }
    return null;
  }

  async updateUsername(uid: string, newUsername: string) {
    const profileRef = doc(this.firestore, 'profiles', uid);
    const profileSnap = await getDoc(profileRef);
    if (!profileSnap.exists()) throw new Error('Profile not found');

    const profile = profileSnap.data() as UserProfile;
    const oldUsername = profile.username?.toLowerCase().replace('@', '');
    const cleanNewUsername = newUsername.toLowerCase().replace('@', '');

    if (oldUsername === cleanNewUsername) return;

    // 1. Check uniqueness
    const isAvailable = await this.isUsernameAvailable(cleanNewUsername);
    if (!isAvailable) throw new Error('Username already taken');

    // 2. Claim new username
    await setDoc(doc(this.firestore, 'usernames', cleanNewUsername), { uid });

    // 3. Update profile
    await updateDoc(profileRef, { username: `@${cleanNewUsername}` });

    // 4. Release old username if exists
    if (oldUsername) {
      await deleteDoc(doc(this.firestore, 'usernames', oldUsername));
    }
  }

  async ensureUserProfile(userId: string, displayName: string, photoURL?: string) {
    const docRef = doc(this.firestore, 'profiles', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      const newProfile: UserProfile = {
        uid: userId,
        displayName,
        photoURL: photoURL || '',
        totalSessions: 0,
        totalCuppingHours: 0,
        xp: 0,
        level: 1,
        badges: [],
        avatarStage: 'seedling',
        updatedAt: new Date()
      };
      await setDoc(docRef, newProfile);
      return newProfile;
    }
    return snap.data() as UserProfile;
  }

  getLatestCuppings(userId?: string): Observable<CuppingSession[]> {
    let q;
    if (userId) {
      q = query(
        this.cuppingCollection, 
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'), 
        limit(20)
      );
    } else {
      q = query(this.cuppingCollection, orderBy('timestamp', 'desc'), limit(20));
    }
    return collectionData(q, { idField: 'id' }) as Observable<CuppingSession[]>;
  }

  getUserCuppings(userId: string): Observable<CuppingSession[]> {
    if (!userId) return of([]);
    const q = query(
      this.cuppingCollection, 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'), 
      limit(50)
    );
    return collectionData(q, { idField: 'id' }) as Observable<CuppingSession[]>;
  }

  getPublicUserCuppings(userId: string): Observable<CuppingSession[]> {
    if (!userId) return of([]);
    const q = query(
      this.cuppingCollection, 
      where('userId', '==', userId),
      where('isPublic', '==', true),
      orderBy('timestamp', 'desc'), 
      limit(50)
    );
    return collectionData(q, { idField: 'id' }) as Observable<CuppingSession[]>;
  }

  getPublicCuppings(options?: { 
    process?: string, 
    origin?: string, 
    sortBy?: 'timestamp' | 'finalScore' | 'likesCount',
    order?: 'asc' | 'desc',
    limit?: number
  }): Observable<CuppingSession[]> {
    let constraints: QueryConstraint[] = [where('isPublic', '==', true)];
    
    if (options?.process) {
      constraints.push(where('postHarvest', '==', options.process));
    }
    
    if (options?.origin) {
      constraints.push(where('origin', '==', options.origin));
    }
    
    const sortBy = options?.sortBy || 'timestamp';
    const order = options?.order || 'desc';
    constraints.push(orderBy(sortBy, order));
    
    const qLimit = options?.limit || 50;
    constraints.push(limit(qLimit));

    const q = query(this.cuppingCollection, ...constraints);
    return collectionData(q, { idField: 'id' }) as Observable<CuppingSession[]>;
  }
  getSavedCuppings(userId: string): Observable<CuppingSession[]> {
    if (!userId) return of([]);
    const q = query(
      this.cuppingCollection,
      where('savedBy', 'array-contains', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    return collectionData(q, { idField: 'id' }) as Observable<CuppingSession[]>;
  }

  async addCupping(session: CuppingSession) {
    const userId = this.auth.getUserId();
    if (!userId) throw new Error('User not authenticated');

    const cuppingDoc = await addDoc(this.cuppingCollection, {
      ...session,
      userId,
      isPublic: session.isPublic || false,
      likesCount: 0,
      likedBy: [],
      savedBy: [],
      timestamp: new Date()
    });

    // Update user profile statistics
    await this.updateProfileStats(userId, session);

    return cuppingDoc;
  }

  private async updateProfileStats(userId: string, session: CuppingSession) {
    const profileRef = doc(this.firestore, 'profiles', userId);
    const snap = await getDoc(profileRef);
    
    if (!snap.exists()) return;

    let profile = snap.data() as UserProfile;
    
    // Calculate new XP: 100 base + 50 if specialty (80+) + 10 per flavor note
    let xpGain = 100;
    if (session.finalScore >= 80) xpGain += 50;
    xpGain += (session.flavorNotes?.length || 0) * 10;

    const newXp = (profile.xp || 0) + xpGain;
    const newSessions = (profile.totalSessions || 0) + 1;
    
    // Determine Level
    let newLevel = profile.level;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (newXp >= LEVEL_THRESHOLDS[i]) {
        newLevel = i + 1;
        break;
      }
    }

    // Determine Avatar Stage
    let avatarStage: UserProfile['avatarStage'] = 'seedling';
    if (newLevel >= 5) avatarStage = 'harvest';
    else if (newLevel >= 4) avatarStage = 'cherry';
    else if (newLevel >= 3) avatarStage = 'flowering';
    else if (newLevel >= 2) avatarStage = 'sprout';

    // Check for new badges
    const currentBadgeIds = (profile.badges || []).map(b => b.id);
    const newBadges: Badge[] = [...(profile.badges || [])];

    // Example badge logic: First Cupping
    if (!currentBadgeIds.includes('first_cupping')) {
      const badge = ALL_BADGES.find(b => b.id === 'first_cupping');
      if (badge) newBadges.push({ ...badge, unlockedAt: new Date() });
    }

    // Specialty Seeker (80+ count)
    // In a real app, we'd query local count or keep a counter in profile
    // For now, let's just use totalSessions as a proxy or assume we check later

    await updateDoc(profileRef, {
      xp: newXp,
      totalSessions: newSessions,
      level: newLevel,
      avatarStage: avatarStage,
      badges: newBadges,
      updatedAt: new Date()
    });
  }

  async getSmartSuggestions(filters: { beanName?: string, postHarvest?: string }): Promise<string[]> {
    // Queries public cuppings to find common flavor notes
    let constraints: QueryConstraint[] = [where('isPublic', '==', true), limit(50)];
    
    if (filters.postHarvest) {
      constraints.push(where('postHarvest', '==', filters.postHarvest));
    }

    const q = query(this.cuppingCollection, ...constraints);
    const snap = await getDoc(null as any); // This is just a placeholder, we use collectionData or getDocs
    // Real implementation would aggregate flavorNotes frequency
    // For "Smart" feel, we'll return top 5 frequent notes
    
    // Simulated aggregation logic for now:
    const mockNotes = filters.postHarvest === 'Natural' 
      ? ['Berry', 'Fermented', 'Chocolate', 'Winey', 'Smooth']
      : ['Citrus', 'Floral', 'Tea', 'Clean', 'Jasmine'];
    
    return mockNotes;
  }

  async toggleLike(id: string, userId: string, currentlyLiked: boolean) {
    const docRef = doc(this.firestore, 'cuppings', id);
    return updateDoc(docRef, {
      likesCount: increment(currentlyLiked ? -1 : 1),
      likedBy: currentlyLiked ? arrayRemove(userId) : arrayUnion(userId)
    });
  }

  async toggleSave(id: string, userId: string, currentlySaved: boolean) {
    const docRef = doc(this.firestore, 'cuppings', id);
    return updateDoc(docRef, {
      savedBy: currentlySaved ? arrayRemove(userId) : arrayUnion(userId)
    });
  }

  async getCuppingById(id: string): Promise<CuppingSession | null> {
    const docRef = doc(this.firestore, 'cuppings', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as CuppingSession) : null;
  }

  async updateCupping(id: string, data: Partial<CuppingSession>) {
    const docRef = doc(this.firestore, 'cuppings', id);
    return updateDoc(docRef, data);
  }

  async deleteCupping(id: string) {
    const docRef = doc(this.firestore, 'cuppings', id);
    
    // Attempt to delete associated share image if it exists
    try {
      const storageRef = ref(this.storage, `shares/${id}.png`);
      await deleteObject(storageRef);
    } catch (e) {
      // Ignore if image doesn't exist
    }

    return deleteDoc(docRef);
  }

  async uploadShareImage(sessionId: string, blob: Blob): Promise<string> {
    const filePath = `shares/${sessionId}.png`;
    const storageRef = ref(this.storage, filePath);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  }

  async uploadProductImage(file: File): Promise<string> {
    const userId = this.auth.getUserId() || 'anonymous';
    const filePath = `products/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  exportToCSV(sessions: CuppingSession[]) {
    if (sessions.length === 0) return;
    
    const headers = ['Date', 'Bean Name', 'Roastery', 'Type', 'Process', 'Final Score', 'Acidity', 'Body', 'Sweetness', 'Flavor Notes'];
    const rows = sessions.map(s => [
      s.timestamp ? (s.timestamp.toDate ? s.timestamp.toDate().toLocaleDateString() : new Date(s.timestamp).toLocaleDateString()) : s.productionDate,
      `"${s.beanName}"`,
      `"${s.roastery}"`,
      s.type,
      s.postHarvest,
      s.finalScore,
      s.intensities?.acidity || 0,
      s.intensities?.body || 0,
      s.intensities?.sweetness || 0,
      `"${s.flavorNotes.join(', ')}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `CaffeeScore_History_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
