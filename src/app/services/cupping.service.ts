import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, orderBy, limit, doc, getDoc, updateDoc, where, increment, arrayUnion, deleteDoc, QueryConstraint } from '@angular/fire/firestore';
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

  getLatestCuppings(): Observable<CuppingSession[]> {
    const q = query(this.cuppingCollection, orderBy('timestamp', 'desc'), limit(20));
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

  async addCupping(session: CuppingSession) {
    const userId = this.auth.getUserId();
    return addDoc(this.cuppingCollection, {
      ...session,
      userId,
      isPublic: session.isPublic || false,
      likesCount: 0,
      savedBy: [],
      timestamp: new Date()
    });
  }

  async likeSession(id: string) {
    const docRef = doc(this.firestore, 'cuppings', id);
    return updateDoc(docRef, {
      likesCount: increment(1)
    });
  }

  async saveSession(id: string, userId: string) {
    const docRef = doc(this.firestore, 'cuppings', id);
    return updateDoc(docRef, {
      savedBy: arrayUnion(userId)
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
}
