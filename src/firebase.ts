import { FirebaseOptions, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';
import { AnalyticsEventType, Store } from './types';

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

type AnalyticsPayload = {
  storeId: string;
  productId?: string;
  slug?: string;
  menuVisibility?: Store['menuVisibility'];
  extra?: Record<string, unknown>;
};

const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' | 'unknown' => {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return 'tablet';
  if (/mobi|android|iphone|ipod|blackberry|phone/.test(ua)) return 'mobile';
  return 'desktop';
};

const getCountryFromLocale = (): string | null => {
  if (typeof navigator === 'undefined') return null;
  const locale = navigator.language || '';
  const parts = locale.split('-');
  return parts.length > 1 ? parts[1].toUpperCase() : null;
};

export async function logEvent(eventName: AnalyticsEventType, payload: AnalyticsPayload): Promise<void> {
  try {
    await addDoc(collection(db, 'analytics'), {
      type: eventName,
      storeId: payload.storeId,
      productId: payload.productId || null,
      slug: payload.slug || null,
      userId: auth.currentUser?.uid || null,
      country: getCountryFromLocale(),
      device: detectDeviceType(),
      menuVisibility: payload.menuVisibility || null,
      extra: payload.extra || {},
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to write analytics event:', error);
  }
}

export default app;
