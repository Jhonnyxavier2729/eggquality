// src/firebase/config.js (o donde tengas tu archivo de configuración de Firebase)

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
// NOTA: Las variables de entorno se acceden usando import.meta.env (para Vite)
// Si usas Vue CLI, sería process.env.VUE_APP_FIREBASE_API_KEY, etc.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configurar la persistencia de autenticación
setPersistence(auth, browserLocalPersistence) // <<-- RECOMENDADO para la mayoría de las apps
  .then(() => {
    console.log("Firebase Auth Persistence configured: browserLocalPersistence");
  })
  .catch((error) => {
    console.error("Error setting Firebase Auth persistence:", error.message);
  });

const db = getFirestore(app);
const functions = getFunctions(app); // <-- Inicializa la instancia 'functions'

export { auth, db, app, functions };