import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';

const firebaseConfig = {
  projectId: "coffeescore-cupping-2024",
  appId: "1:460876837418:web:0a9bd7f78677249402c953",
  storageBucket: "coffeescore-cupping-2024.firebasestorage.app",
  apiKey: "AIzaSyC2us3lAplvMGptl35GiGjMpE3YnSgxnZI",
  authDomain: "coffeescore-cupping-2024.firebaseapp.com",
  messagingSenderId: "460876837418"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => {
      const app = getApp();
      return initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
    }),
    provideStorage(() => getStorage()),
    provideClientHydration(withEventReplay()), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
};
