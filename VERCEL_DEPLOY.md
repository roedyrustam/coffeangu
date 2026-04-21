# CaffeeScore Vercel Deployment Guide

To ensure everything works correctly after deploying CaffeeScore to Vercel, please follow these steps.

## 1. Firebase Authorized Domains [CRITICAL]
Google Login will fail on Vercel unless you authorize your production URL.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project.
3.  Go to **Authentication** > **Settings** > **Authorized Domains**.
4.  Click **Add Domain**.
5.  Add your Vercel URL (e.g., `coffeescore-cupping.vercel.app`).
6.  *Recommended*: Also add your custom domain if you have one.

## 2. Environment Variables
Ensure your Vercel project has the correct environment variables. These should match your `src/environments/environment.prod.ts` or `environment.ts`.

| Variable | Description |
| :--- | :--- |
| `FIREBASE_API_KEY` | Your Firebase Web API Key |
| `FIREBASE_AUTH_DOMAIN` | e.g., `your-app.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Your project ID |

> [!NOTE]
> In Angular, these are usually baked into the build. Make sure your `environment.prod.ts` is updated before running the build command on Vercel.

## 3. Storage CORS (Optional)
If you encounter issues uploading or viewing avatar images on Vercel, you may need to set CORS on your Firebase Storage bucket.

Create a `cors.json` file:
```json
[
  {
    "origin": ["https://your-app.vercel.app"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "responseHeader": ["Content-Type", "x-goog-resumable"],
    "maxAgeSeconds": 3600
  }
]
```
Then run:
`gsutil cors set cors.json gs://your-app.appspot.com`

## 4. PWA and Service Worker
Vercel handles static assets well, but ensure that:
- `manifest.webmanifest` is accessible.
- `ngsw-worker.js` is correctly served from the root.

## Troubleshooting
If Google Login still redirects you to a blank page:
- Check the **Console** in Chrome DevTools for `auth/unauthorized-domain`.
- Ensure `authDomain` in your Firebase config points to the `*.firebaseapp.com` domain, NOT the Vercel domain.
