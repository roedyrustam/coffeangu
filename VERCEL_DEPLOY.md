# CuppingNotes Vercel Deployment Guide

To ensure everything works correctly after deploying **CuppingNotes** to Vercel, please follow these steps.

## 1. Firebase Authorized Domains [CRITICAL]
Google Login will fail on Vercel unless you authorize your production URL.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project.
3.  Go to **Authentication** > **Settings** > **Authorized Domains**.
4.  Click **Add Domain**.
5.  Add your custom domain: `cuppingnotes.online`.
6.  Add your Vercel system URL (e.g., `coffeescore-cupping.vercel.app`).

## 2. Facebook Authentication Setup
To enable Facebook Login, you must configure the provider in Firebase:

1.  Go to the [Meta for Developers](https://developers.facebook.com/) dashboard.
2.  Ensure your App ID `1954208565467291` is active.
3.  Add the **Facebook Login** product and set the **Valid OAuth Redirect URIs** to your Firebase Auth redirect URL (usually `https://coffeescore-cupping-2024.firebaseapp.com/__/auth/handler`).
4.  In [Firebase Console](https://console.firebase.google.com/), go to **Authentication** > **Sign-in method**.
5.  Click **Add new provider** > **Facebook**.
6.  Enter your **App ID** and **App Secret** (provided in your records).
7.  Save changes.

## 3. SPA Routing (404 Fix)
The project includes a `vercel.json` file that handles Single Page Application (SPA) routing. This ensures that deep links like `/result/XYZ` work correctly when refreshed. 

**DO NOT remove the `rewrites` section from `vercel.json`.**

## 3. SEO & Open Graph (OG)
For social sharing to work perfectly:
1.  Ensure `siteUrl` in `src/environments/environment.ts` is set to `https://cuppingnotes.online`.
2.  The application automatically generates radar chart images and uploads them to Firebase Storage. 
3.  Ensure your Firestore rules allow `read` access to the `sessions` collection for public viewing.

## 4. Storage CORS
If social images or user avatars do not load on external platforms, you may need to set CORS on your Firebase Storage bucket.

Create a `cors.json` file:
```json
[
  {
    "origin": ["https://cuppingnotes.online", "https://*.vercel.app"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "responseHeader": ["Content-Type", "x-goog-resumable"],
    "maxAgeSeconds": 3600
  }
]
```
Then run:
`gsutil cors set cors.json gs://coffeescore-cupping-2024.firebasestorage.app`

## 5. Environment Config
Ensure your `src/environments/environment.ts` contains the production Firebase credentials and the correct `siteUrl`.

---
*Maintained for CuppingNotes Production Stability.*
