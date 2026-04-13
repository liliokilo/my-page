import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyBulH_tpUvEkW9hLkT7amajjqDlVZ91P0Y",
  authDomain: "my-page-9c72f.firebaseapp.com",
  projectId: "my-page-9c72f",
  storageBucket: "my-page-9c72f.firebasestorage.app",
  messagingSenderId: "232342837982",
  appId: "1:232342837982:web:80b0da80291c82126dc04f",
	measurementId: "G-LXT9KQ3WRD"
});

export const db = getFirestore(app);