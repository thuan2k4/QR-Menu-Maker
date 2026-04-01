<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7b6d6f00-da64-48da-b6bc-9c256287b36c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Firebase Setup (OAuth + Firestore)

1. Copy `.env.example` to `.env` and fill Firebase values.
2. Get Firebase Web config from Firebase Console:
   - Project settings -> General -> Your apps -> Web app -> SDK setup and configuration.
   - Map values to:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_MEASUREMENT_ID`
3. `VITE_FIREBASE_FIRESTORE_DATABASE_ID` is optional:
   - Leave empty if using default Firestore database.
   - Only set it when you really use a named database.
4. Enable Google OAuth:
   - Authentication -> Sign-in method -> Google -> Enable.
5. Add Authorized domains:
   - Authentication -> Settings -> Authorized domains.
   - Add at least: `localhost`, `127.0.0.1`, and your production domain.

If you see `Database ... not found`, usually the configured Firestore database id does not exist in the current project.

## Firebase Storage Setup (Fix upload CORS)

If image upload fails with CORS/preflight error:

1. Open Firebase Console for your project.
2. Go to Build -> Storage.
3. Click Get started and create a default bucket (choose region).
4. After bucket is created, go to Project settings -> General -> Your apps -> Web config and verify `storageBucket`.
5. Update `VITE_FIREBASE_STORAGE_BUCKET` in `.env` with the exact bucket name.

Recommended temporary Storage Rules for local dev:

```
rules_version = '2';
service firebase.storage {
   match /b/{bucket}/o {
      match /{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
      }
   }
}
```

Notes:

- This project auto-falls back between `<project>.firebasestorage.app` and `<project>.appspot.com` when uploading.
- For production, tighten Storage Rules by owner/store path instead of broad write access.

### Storage checklist for this project

1. Verify bucket exists:
   - Open `https://firebasestorage.googleapis.com/v0/b/<your-bucket>/o?maxResults=1`
   - If response is `404 Not Found`, bucket is not created yet.
2. Publish storage rules from `storage.rules`:
   - `firebase login`
   - `firebase use qr-menu-8e163`
   - `firebase deploy --only storage`
3. Ensure authenticated user before upload (this app writes under `products/{uid}` and `restaurants/{uid}`).
4. Restart dev server after changing `.env`.

## Alternative without Firebase Storage upgrade: Cloudinary

If you cannot use Firebase Storage in current plan, use Cloudinary free tier:

1. Create Cloudinary account.
2. In Cloudinary Dashboard, copy `Cloud name`.
3. Go to Settings -> Upload -> Upload presets -> Add upload preset.
4. Set preset to `Unsigned` and save preset name.
5. In `.env`, set:
   - `VITE_MEDIA_PROVIDER="cloudinary"`
   - `VITE_CLOUDINARY_CLOUD_NAME="<your_cloud_name>"`
   - `VITE_CLOUDINARY_UPLOAD_PRESET="<your_unsigned_preset>"`
6. Restart `npm run dev`.

Current upload paths in app:

- Product images: `products/{uid}/...`
- Store logo/cover: `restaurants/{uid}/...`

With this setup, logo/cover/product image uploads will go to Cloudinary and return public URLs for existing business flow.
