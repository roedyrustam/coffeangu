import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, orderBy, limit, doc, getDoc, updateDoc, where, increment, arrayUnion, arrayRemove, deleteDoc, QueryConstraint } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, of } from 'rxjs';
import { CuppingSession } from '../models/cupping.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CuppingService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private auth = inject(AuthService);
  private cuppingCollection = collection(this.firestore, 'cuppings');

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
    return addDoc(this.cuppingCollection, {
      ...session,
      userId,
      isPublic: session.isPublic || false,
      likesCount: 0,
      likedBy: [],
      savedBy: [],
      timestamp: new Date()
    });
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
