import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6JujQy0Ks4x7vqTfWpoxNpXQwWLhZ0gw",
  authDomain: "arnav-chat-a050c.firenbaseapp.com",
  projectId: "arnav-chat-a050c",
  storageBucket: "arnav-chat-a050c.firebasestorage.app",
  messagingSenderId: "459194885925",
  appId: "1:459194885925:web:2108bea9c4d3c308b7dccc"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

