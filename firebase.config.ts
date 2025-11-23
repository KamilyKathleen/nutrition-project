// Firebase Configuration for NutriPlan Client
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDhGT0bMYDrOnIjSfUgWUwqRgELHhqmMKs",
  authDomain: "nutriplan-cce27.firebaseapp.com",
  projectId: "nutriplan-cce27",
  storageBucket: "nutriplan-cce27.firebasestorage.app",
  messagingSenderId: "588542618900",
  appId: "1:588542618900:web:5a8e88b5a4c8c5b6b7c3c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;