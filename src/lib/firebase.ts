import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAHDsEUD87LaNf7aCt-ZHGc0I23MJX_Jk0",
  authDomain: "photo-gallery-3b65d.firebaseapp.com",
  projectId: "photo-gallery-3b65d",
  storageBucket: "photo-gallery-3b65d.firebasestorage.app",
  messagingSenderId: "616284804207",
  appId: "1:616284804207:web:92dc42cc991e0a26e7299a",
  measurementId: "G-2975S92CKN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;