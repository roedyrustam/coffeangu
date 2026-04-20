import { Injectable, inject, signal } from '@angular/core';
import { 
  Auth, 
  user, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  User
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  
  // Expose user as a signal for the UI
  user$ = user(this.auth);
  currentUser = toSignal(this.user$);

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      return result.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async loginWithEmail(email: string, pass: string) {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, pass);
      return result.user;
    } catch (error) {
      console.error('Email login failed:', error);
      throw error;
    }
  }

  async signUp(email: string, pass: string, displayName: string) {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, pass);
      await updateProfile(result.user, { displayName });
      return result.user;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  }

  async updateDisplayName(name: string) {
    const user = this.auth.currentUser;
    if (!user) return;
    try {
      await updateProfile(user, { displayName: name });
      return true;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  getUserId(): string | null {
    return this.currentUser()?.uid || null;
  }
}
