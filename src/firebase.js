// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// BURAYI KENDİ BİLGİLERİNLE DOLDUR
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: "lojistik-borsa",
  storageBucket: "lojistik-borsa.firebasestorage.app",
  messagingSenderId: "883694447255",
  appId: "1:883694447255:web:c44cd87e05c6cbc09d57d2",
  measurementId: "G-2X6PC3SFF0"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Veritabanı servisini dışarı aktar
export const db = getFirestore(app);

// YENİ: Auth servisini ve Google Sağlayıcısını dışarı aktar
// YENİ: Auth servisini ve Google Sağlayıcısını dışarı aktar
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// YENİ: Storage servisini dışarı aktar (Teslimat İspatı için)
import { getStorage } from "firebase/storage";
export const storage = getStorage(app);