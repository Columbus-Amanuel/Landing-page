import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// `vite dev` (DEV) or `vite build --mode staging` (npm run deploy:dev)
const useDevFirebaseApp =
  (import.meta.env.DEV || import.meta.env.MODE === 'staging') &&
  import.meta.env.VITE_FIREBASE_APP_ID_DEV &&
  import.meta.env.VITE_FIREBASE_MEASUREMENT_ID_DEV;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: useDevFirebaseApp
    ? import.meta.env.VITE_FIREBASE_APP_ID_DEV
    : import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: useDevFirebaseApp
    ? import.meta.env.VITE_FIREBASE_MEASUREMENT_ID_DEV
    : import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export default app;
