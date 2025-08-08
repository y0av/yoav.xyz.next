// Firebase initialization and Firestore export
// Uses singleton pattern to avoid re-initializing in Fast Refresh

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBd-KG-6V1bFUSgXA85q8gVwepu3UnD600',
  authDomain: 'yoav-site.firebaseapp.com',
  projectId: 'yoav-site',
  storageBucket: 'yoav-site.firebasestorage.app',
  messagingSenderId: '666949858235',
  appId: '1:666949858235:web:10b5727aa719ce9cf0ca9e',
  measurementId: 'G-Y86DJJCLQT',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
