import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVuH1pveJi2WbaWXyqb673RdXEnfliZEw",
  authDomain: "tabs-6f313.firebaseapp.com",
  projectId: "tabs-6f313",
  storageBucket: "tabs-6f313.firebasestorage.app",
  messagingSenderId: "1687586716",
  appId: "1:1687586716:web:74f7a22d5851a7968a6a59",
  measurementId: "G-KCT8P5SX8E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
const analytics = getAnalytics(app);
