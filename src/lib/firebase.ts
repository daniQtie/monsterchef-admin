import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB8XKWMxAAWbRXkzvlLukcUwUaMwKwrJhA",
  authDomain: "monsterchef-admin.firebaseapp.com",
  databaseURL: "https://monsterchef-admin-default-rtdb.firebaseio.com",
  projectId: "monsterchef-admin",
  storageBucket: "monsterchef-admin.firebasestorage.app",
  messagingSenderId: "415230344843",
  appId: "1:415230344843:web:2d3a2ffb611e7f4ea29e8e",
};

// Avoid re-initializing on hot reload
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const rtdb = getDatabase(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
