// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth,  setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 
import { getFunctions } from 'firebase/functions';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDL-Z21mhyRh04PzkHy9et41upeTpFP_r8",
  authDomain: "huevoscansena.firebaseapp.com",
  projectId: "huevoscansena",
  storageBucket: "huevoscansena.firebasestorage.app",
  messagingSenderId: "941369051164",
  appId: "1:941369051164:web:ca39b82d2ea1bdbddfb7d9"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// --- Obtener la instancia de Firestore ---

setPersistence(auth, browserLocalPersistence) // <<-- RECOMENDADO para la mayoría de las apps
  .then(() => {
    console.log("Firebase Auth Persistence configured: browserLocalPersistence");
  })
  .catch((error) => {
    console.error("Error setting Firebase Auth persistence:", error.message);
  });
// *** FIN CAMBIO ***


const db = getFirestore(app);

const functions = getFunctions(app); // <-- Inicializa la instancia 'functions'



export { auth, db, app, functions };