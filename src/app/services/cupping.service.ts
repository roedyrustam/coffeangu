import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, orderBy, limit, doc, getDoc, updateDoc, where, increment, arrayUnion } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { CuppingSession } from '../models/cupping.model';

@Injectable({
  providedIn: 'root'
})
export class CuppingService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private cuppingCollection = collection(this.firestore, 'cuppings');

  getLatestCuppings(): Observable<CuppingSession[]> {
    const q = query(this.cuppingCollection, orderBy('timestamp', 'desc'), limit(20));
    return collectionData(q, { idField: 'id' }) as Observable<CuppingSession[]>;
  }

  getPublicCuppings(): Observable<CuppingSession[]> {
    const q = query(
      this.cuppingCollection, 
      where('isPublic', '==', true),
      orderBy('timestamp', 'desc'), 
      limit(50)
    );
    return collectionData(q, { idField: 'id' }) as Observable<CuppingSession[]>;
  }

  async addCupping(session: CuppingSession) {
    return addDoc(this.cuppingCollection, {
      ...session,
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

  async uploadShareImage(sessionId: string, blob: Blob): Promise<string> {
    const filePath = `shares/${sessionId}.png`;
    const storageRef = ref(this.storage, filePath);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  }
}
