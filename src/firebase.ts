import { FirebaseOptions, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// const firebaseConfig = {
//   apiKey: "AIzaSyBcKt2Q6e1us84cVCUcrstDQ8-mYDRLGoM",
//   authDomain: "qr-menu-8e163.firebaseapp.com",
//   projectId: "qr-menu-8e163",
//   storageBucket: "qr-menu-8e163.firebasestorage.app",
//   messagingSenderId: "30298327787",
//   appId: "1:30298327787:web:fe9c5acacebcd050d50cae",
//   measurementId: "G-GGNPLQ2PZN"
// };

type ExtendedFirebaseConfig = FirebaseOptions & {
  firestoreDatabaseId?: string;
};

const fileConfig = firebaseConfig as ExtendedFirebaseConfig;

const envConfig: Partial<ExtendedFirebaseConfig> = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
};

const mergedConfig: ExtendedFirebaseConfig = {
  ...fileConfig,
  ...Object.fromEntries(Object.entries(envConfig).filter(([, value]) => value && String(value).trim() !== '')),
};

const app = initializeApp(mergedConfig);
export const auth = getAuth(app);
const envFirestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID?.trim();
const firestoreDatabaseId = envFirestoreDatabaseId && envFirestoreDatabaseId !== '(default)' ? envFirestoreDatabaseId : undefined;
export const db = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);

const normalizedStorageBucket = mergedConfig.storageBucket?.replace(/^gs:\/\//, '').trim();
const fallbackStorageBucket = normalizedStorageBucket?.endsWith('.firebasestorage.app')
  ? normalizedStorageBucket.replace('.firebasestorage.app', '.appspot.com')
  : undefined;

export const storage = normalizedStorageBucket ? getStorage(app, `gs://${normalizedStorageBucket}`) : getStorage(app);
export const storageFallback = fallbackStorageBucket ? getStorage(app, `gs://${fallbackStorageBucket}`) : null;
export const storageDebugInfo = {
  primaryBucket: normalizedStorageBucket || null,
  fallbackBucket: fallbackStorageBucket || null,
};

export default app;
