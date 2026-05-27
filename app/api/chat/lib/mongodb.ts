import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVjaMM8QLE8hwh4Poy_GK4h64lKc9DgHk",
  authDomain: "hustle-tracker-9057f.firebaseapp.com",
  projectId: "hustle-tracker-9057f",
  storageBucket: "hustle-tracker-9057f.firebasestorage.app",
  messagingSenderId: "990994762890",
  appId: "1:990994762890:web:57e9751c283d225af6b173"
};

// Next.js protection: Only initialize once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get the database instance
const db = getFirestore(app);

export { db };