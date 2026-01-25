import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase web config (safe to be public in client apps).
const firebaseConfig = {
  apiKey: "AIzaSyAt5rf5hhMxGHInxlmER5H4z0BujEc51-M",
  authDomain: "peacepilot-ai.firebaseapp.com",
  databaseURL: "https://peacepilot-ai-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "peacepilot-ai",
  storageBucket: "peacepilot-ai.firebasestorage.app",
  messagingSenderId: "578382884690",
  appId: "1:578382884690:web:ca050b04dac53331ff948b",
  measurementId: "G-38TXD2RJ6S",
};

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseDatabase() {
  return getDatabase(getFirebaseApp());
}

