import { Injectable, inject, signal } from '@angular/core';
import { 
  Auth, 
  user, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  User,
  setPersistence,
  browserLocalPersistence
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private storage = inject(Storage);
  private platformId = inject(PLATFORM_ID);
  private toast = inject(ToastService);
  
  // Expose user as a signal for the UI
  user$ = user(this.auth);
  currentUser = toSignal(this.user$);
  initialized = signal(false);

  async loginWithGoogle(): Promise<{ user: User | null; redirected: boolean }> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      if (this.isMobile()) {
        await signInWithRedirect(this.auth, provider);
        return { user: null, redirected: true };
      } else {
        const result = await signInWithPopup(this.auth, provider);
        return { user: result.user, redirected: false };
      }
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  }

  async loginWithFacebook(): Promise<{ user: User | null; redirected: boolean }> {
    const provider = new FacebookAuthProvider();
    // provider.addScope('email'); // Added by default by Firebase usually
    
    try {
      if (this.isMobile()) {
        await signInWithRedirect(this.auth, provider);
        return { user: null, redirected: true };
      } else {
        const result = await signInWithPopup(this.auth, provider);
        return { user: result.user, redirected: false };
      }
    } catch (error) {
      console.error('Facebook login failed:', error);
      throw error;
    }
  }

  async handleRedirectResult() {
    try {
      if (isPlatformBrowser(this.platformId)) {
        await setPersistence(this.auth, browserLocalPersistence);
      }
      const result = await getRedirectResult(this.auth);
      this.initialized.set(true);
      if (result?.user) {
        console.log('Redirect login successful:', result.user.displayName);
      }
      return result?.user || null;
    } catch (error: any) {
      this.initialized.set(true);
      console.error('Redirect login failed:', error);
      if (error.code === 'auth/unauthorized-domain') {
        this.toast.error('This domain is not authorized in Firebase Console.');
        throw new Error('This domain is not authorized in Firebase Console. Please add your Vercel domain to the Authorized Domains list.');
      }
      throw error;
    }
  }

  private isMobile(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const ua = navigator.userAgent;
    const isUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isSmallScreen = window.innerWidth <= 1024; // Including tablets
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    // Many modern mobile browsers claim to be Macintosh (Desktop Site)
    const isMacTouch = /Macintosh/i.test(ua) && isTouch;
    return isUA || isMacTouch || (isSmallScreen && isTouch);
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

  async updateProfileImage(file: File) {
    const user = this.auth.currentUser;
    if (!user) return;
    try {
      const filePath = `avatars/${user.uid}`;
      const storageRef = ref(this.storage, filePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: url });
      return url;
    } catch (error) {
      console.error('Update avatar failed:', error);
      this.toast.error('Failed to update profile image.');
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
