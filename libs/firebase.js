// firebase.ts

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD5DviJRx802Bdg4_4Piy4HUh7zE5tqoH4",
  authDomain: "auth.aiinterviewagents.com",
  projectId: "interviewly-ai",
  storageBucket: "interviewly-ai.firebasestorage.app",
  messagingSenderId: "611623329833",
  appId: "1:611623329833:android:25570ad66e929e17913c38",
};

const firebaseApp = initializeApp(firebaseConfig);

// ✅ Persistent auth storage (IMPORTANT for React Native)
const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(firebaseApp);
const provider = new GoogleAuthProvider();

export { firebaseApp, auth, provider, db };
