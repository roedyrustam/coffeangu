import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, getDoc, query, where, collectionData, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { CuppingService } from './cupping.service';
import { Team, TeamMemberProfile } from '../models/team.model';
import { UserProfile } from '../models/user-profile.model';
import { CuppingSession } from '../models/cupping.model';
import { Observable, from, map, switchMap, of, combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private cuppingService = inject(CuppingService);

  private teamsCollection = collection(this.firestore, 'teams');

  getMyTeam(): Observable<Team | null> {
    return this.auth.user$.pipe(
      switchMap(user => {
        if (!user) return of(null);
        return this.cuppingService.getUserProfile(user.uid).pipe(
          switchMap(profile => {
            if (!profile?.teamId) return of(null);
            const teamRef = doc(this.firestore, 'teams', profile.teamId);
            return from(getDoc(teamRef)).pipe(
              map(snap => snap.exists() ? { id: snap.id, ...snap.data() } as Team : null)
            );
          })
        );
      })
    );
  }

  getTeamById(teamId: string): Observable<Team | null> {
    const teamRef = doc(this.firestore, 'teams', teamId);
    return from(getDoc(teamRef)).pipe(
      map(snap => snap.exists() ? { id: snap.id, ...snap.data() } as Team : null)
    );
  }

  async createTeam(name: string): Promise<string> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    const teamData: Team = {
      name,
      leadUid: user.uid,
      members: [user.uid],
      createdAt: new Date()
    };

    const docRef = await addDoc(this.teamsCollection, teamData);
    const profileRef = doc(this.firestore, 'profiles', user.uid);
    await updateDoc(profileRef, { teamId: docRef.id });
    
    return docRef.id;
  }

  async addMemberByHandle(teamId: string, handle: string): Promise<void> {
    const profile = await this.cuppingService.getProfileByHandle(handle);
    if (!profile) throw new Error('User not found');
    if (profile.teamId) throw new Error('User already belongs to a team');

    const teamRef = doc(this.firestore, 'teams', teamId);
    const memberProfileRef = doc(this.firestore, 'profiles', profile.uid);

    await updateDoc(teamRef, {
      members: arrayUnion(profile.uid)
    });

    await updateDoc(memberProfileRef, {
      teamId: teamId
    });
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    const teamRef = doc(this.firestore, 'teams', teamId);
    const memberProfileRef = doc(this.firestore, 'profiles', userId);

    await updateDoc(teamRef, {
      members: arrayRemove(userId)
    });

    await updateDoc(memberProfileRef, {
      teamId: null
    });
  }

  getTeamMembers(memberIds: string[]): Observable<TeamMemberProfile[]> {
    if (!memberIds.length) return of([]);
    
    const profileRequests = memberIds.map(id => this.cuppingService.getUserProfile(id));
    return combineLatest(profileRequests).pipe(
      map(profiles => profiles.filter(p => !!p).map(p => ({
        uid: p!.uid,
        displayName: p!.displayName,
        photoURL: p!.photoURL,
        username: p!.username,
        role: 'member' // Logic for lead can be added if needed
      })))
    );
  }

  getTeamSessions(memberIds: string[]): Observable<CuppingSession[]> {
    if (!memberIds.length) return of([]);
    
    const sessionsQuery = query(
      collection(this.firestore, 'cuppings'),
      where('userId', 'in', memberIds)
    );

    return collectionData(sessionsQuery, { idField: 'id' }) as Observable<CuppingSession[]>;
  }
  
  async updateTeamSettings(teamId: string, settings: Partial<Team>): Promise<void> {
    const teamRef = doc(this.firestore, 'teams', teamId);
    await updateDoc(teamRef, settings);
  }

  async verifyTeam(teamId: string): Promise<void> {
    // Simulated verification delay
    const teamRef = doc(this.firestore, 'teams', teamId);
    await updateDoc(teamRef, { 
      isVerified: true,
      verifiedAt: new Date()
    });
  }
}
