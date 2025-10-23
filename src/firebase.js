import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAA7_soTMGXWtNr2IBQ93MqZNXJ1S6DUAQ",
    authDomain: "test-calendar-ce74c.firebaseapp.com",
    projectId: "test-calendar-ce74c",
    storageBucket: "test-calendar-ce74c.firebasestorage.app",
    messagingSenderId: "934227889937",
    appId: "1:934227889937:web:8f57df91f64052d001c6b0",
    measurementId: "G-0WY4R3DKF2"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
