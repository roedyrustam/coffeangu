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
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
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
  authLoading = signal(true); // Track initial load/redirect state

  private redirectResultPromise: Promise<User | null> | null = null;

  async loginWithGoogle(): Promise<{ user: User | null; redirected: boolean }> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    if (this.isInAppBrowser()) {
      this.toast.info('You are using an in-app browser. If login fails, please open this site in Chrome or Safari.', 5000);
    }

    try {
      if (this.isMobile()) {
        console.log('Mobile detected, using signInWithRedirect');
        await signInWithRedirect(this.auth, provider);
        return { user: null, redirected: true };
      } else {
        const result = await signInWithPopup(this.auth, provider);
        return { user: result.user, redirected: false };
      }
    } catch (error: any) {
      console.error('Google login failed:', error);
      if (error.code === 'auth/popup-blocked') {
        this.toast.error('Login popup was blocked. Using redirect instead...');
        await signInWithRedirect(this.auth, provider);
        return { user: null, redirected: true };
      }
      throw error;
    }
  }

  async loginWithFacebook(): Promise<{ user: User | null; redirected: boolean }> {
    const provider = new FacebookAuthProvider();
    
    if (this.isInAppBrowser()) {
      this.toast.info('You are using an in-app browser. If login fails, please open this site in Chrome or Safari.', 5000);
    }

    try {
      if (this.isMobile()) {
        await signInWithRedirect(this.auth, provider);
        return { user: null, redirected: true };
      } else {
        const result = await signInWithPopup(this.auth, provider);
        return { user: result.user, redirected: false };
      }
    } catch (error: any) {
      console.error('Facebook login failed:', error);
      if (error.code === 'auth/popup-blocked') {
        await signInWithRedirect(this.auth, provider);
        return { user: null, redirected: true };
      }
      throw error;
    }
  }

  /**
   * Global handler for redirect results. Ensures getRedirectResult is called only once
   * and can be safely awaited by multiple components (App and Login).
   */
  /**
   * Global handler for redirect results. Ensures getRedirectResult is called only once
   * and can be safely awaited by multiple components (App and Login).
   */
  async handleRedirectResult(): Promise<User | null> {
    if (!isPlatformBrowser(this.platformId)) {
      this.initialized.set(true);
      this.authLoading.set(false);
      return null;
    }

    if (this.redirectResultPromise) {
      return this.redirectResultPromise;
    }

    this.authLoading.set(true);
    this.redirectResultPromise = (async () => {
      try {
        // Ensure persistence is set before checking redirect result
        await setPersistence(this.auth, browserLocalPersistence);
        
        const result = await getRedirectResult(this.auth);
        this.initialized.set(true);
        this.authLoading.set(false);
        
        if (result?.user) {
          console.log('Redirect login successful:', result.user.displayName);
        }
        return result?.user || null;
      } catch (error: any) {
        this.initialized.set(true);
        this.authLoading.set(false);
        console.error('Redirect login failed:', error);
        
        if (error.code === 'auth/unauthorized-domain') {
          const msg = 'This domain is not authorized. Please add your domain to Authorized Domains in Firebase Console.';
          this.toast.error(msg);
          throw new Error(msg);
        }
        
        return null;
      }
    })();

    return this.redirectResultPromise;
  }

  isMobile(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const ua = navigator.userAgent;
    const isUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isSmallScreen = window.innerWidth <= 1024;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isMacTouch = /Macintosh/i.test(ua) && isTouch;
    
    // Check for In-App Browsers (Instagram, FB, LINE, etc)
    const isInApp = /Instagram|FBAN|FBAV|Line/i.test(ua);
    if (isInApp) {
      console.warn('In-app browser detected');
    }

    return isUA || isMacTouch || (isSmallScreen && isTouch) || isInApp;
  }

  isInAppBrowser(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const ua = navigator.userAgent;
    return /Instagram|FBAN|FBAV|Line|WhatsApp/i.test(ua);
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

  async updateUserPassword(newPass: string, oldPass?: string) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No user logged in');

    try {
      // If old password is provided, re-authenticate first (required for password updates)
      if (oldPass && user.email) {
        const credential = EmailAuthProvider.credential(user.email, oldPass);
        await reauthenticateWithCredential(user, credential);
      }
      
      await updatePassword(user, newPass);
      this.toast.success('Password updated successfully!');
      return true;
    } catch (error: any) {
      console.error('Password update failed:', error);
      if (error.code === 'auth/requires-recent-login') {
        this.toast.error('Please logout and login again to change password (Security requirement).');
      } else if (error.code === 'auth/wrong-password') {
        this.toast.error('Current password is incorrect.');
      } else {
        this.toast.error('Failed to update password: ' + error.message);
      }
      throw error;
    }
  }

  isPasswordUser(): boolean {
    const user = this.auth.currentUser;
    if (!user) return false;
    return user.providerData.some(p => p.providerId === 'password');
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
