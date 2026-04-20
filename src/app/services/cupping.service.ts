import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, orderBy, limit, doc, getDoc, getDocs, updateDoc, setDoc, where, increment, arrayUnion, arrayRemove, deleteDoc, QueryConstraint } from '@angular/fire/firestore';
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

  private get cuppingCollection() { return collection(this.firestore, 'cuppings'); }
  private get profilesCollection() { return collection(this.firestore, 'profiles'); }
  private get usernamesCollection() { return collection(this.firestore, 'usernames'); }

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
        membership: 'classic',
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

    // Denormalization Logic for Teams & Commerce Gating
    let teamId = undefined;
    let isVerifiedRoastery = false;
    let buyLink = session.buyLink;

    try {
      const profileSnap = await getDoc(doc(this.firestore, 'profiles', userId));
      const profile = profileSnap.data() as UserProfile;
      const isAdmin = profile?.membership === 'roastery';
      const isPro = profile?.membership === 'pro' || isAdmin;

      if (profile?.teamId) {
        teamId = profile.teamId;
        const teamSnap = await getDoc(doc(this.firestore, 'teams', teamId));
        const team = teamSnap.data() as any;
        if (team) {
          isVerifiedRoastery = !!team.isVerified;
          // Only override buyLink if session doesn't have a specific one and team has a default shop
          if (!buyLink && team.shopUrl) {
            buyLink = team.shopUrl;
          }
        }
      }

      // STRICT MONETIZATION GATE: Only Pro/Roastery can use custom buy links
      // Classic users lose the buyLink unless it's a Roastery team default
      if (!isPro && !isVerifiedRoastery) {
        buyLink = undefined;
      }

      // Store isPro status for badges
      (session as any).isPro = isPro;
    } catch (e) {
      console.warn('Roastery denormalization failed:', e);
    }

    const cuppingDoc = await addDoc(this.cuppingCollection, {
      ...session,
      userId,
      teamId,
      isVerifiedRoastery,
      isPro: (session as any).isPro,
      buyLink,
      isPublic: session.isPublic ?? true,
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
    const cuppingsRef = collection(this.firestore, 'cuppings');
    let qConstraints: QueryConstraint[] = [where('isPublic', '==', true), limit(30)];
    
    if (filters.postHarvest) {
      qConstraints.push(where('postHarvest', '==', filters.postHarvest));
    }

    const q = query(cuppingsRef, ...qConstraints);
    const querySnapshot = await getDocs(q);
    
    const flavorCounts: Record<string, number> = {};
    querySnapshot.forEach((docSnapshot: any) => {
      const notes = docSnapshot.data()['flavorNotes'] || [];
      notes.forEach((note: string) => {
        flavorCounts[note] = (flavorCounts[note] || 0) + 1;
      });
    });

    // Sort by frequency and get top 8
    const topNotes = Object.keys(flavorCounts)
      .sort((a, b) => flavorCounts[b] - flavorCounts[a])
      .slice(0, 8);

    // Fallback to defaults if no community data exists yet
    if (topNotes.length === 0) {
      return filters.postHarvest === 'Natural' 
        ? ['Berry', 'Fermented', 'Chocolate', 'Winey', 'Smooth', 'Dried Fruit']
        : ['Citrus', 'Floral', 'Tea', 'Clean', 'Jasmine', 'Green Apple'];
    }
    
    return topNotes;
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

  /**
   * Compresses an image file using Canvas API.
   * Resizes to max 1024px on longest side and outputs as JPEG at 0.8 quality.
   */
  private compressImage(file: File, maxSize = 1024, quality = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          try {
            let { width, height } = img;

            // Scale down proportionally
            if (width > maxSize || height > maxSize) {
              if (width > height) {
                height = Math.round((height / width) * maxSize);
                width = maxSize;
              } else {
                width = Math.round((width / height) * maxSize);
                height = maxSize;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Canvas compression returned null blob'));
                }
              },
              'image/jpeg',
              quality
            );
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async uploadProductImage(file: File): Promise<string> {
    const userId = this.auth.getUserId() || 'anonymous';

    // Sanitize filename: remove special chars, keep extension
    const sanitized = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
    const filePath = `products/${userId}/${Date.now()}_${sanitized}`;
    const storageRef = ref(this.storage, filePath);

    try {
      // Compress the image before uploading
      const compressed = await this.compressImage(file);
      await uploadBytes(storageRef, compressed, {
        contentType: 'image/jpeg'
      });
      return getDownloadURL(storageRef);
    } catch (err: any) {
      // Provide specific error context
      if (err?.code === 'storage/unauthorized') {
        throw new Error('PERMISSION_DENIED: Anda tidak memiliki izin untuk mengunggah gambar.');
      } else if (err?.code === 'storage/canceled') {
        throw new Error('UPLOAD_CANCELED: Unggahan dibatalkan.');
      } else if (err?.code === 'storage/retry-limit-exceeded' || err?.message?.includes('net::')) {
        throw new Error('NETWORK_ERROR: Gagal mengunggah gambar. Periksa koneksi internet Anda.');
      } else {
        throw new Error(`UPLOAD_FAILED: ${err?.message || 'Gagal mengunggah gambar.'}`);
      }
    }
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
