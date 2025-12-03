// Firebase Configuration for NutriPlan Client
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAntjb33qcT3npeTn0nytftfJhv5ONbyQs",
  authDomain: "nutriplan-cce27.firebaseapp.com",
  projectId: "nutriplan-cce27",
  storageBucket: "nutriplan-cce27.firebasestorage.app",
  messagingSenderId: "80744976918",
  appId: "1:80744976918:web:cf5aa2f33d1492a7491b37"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;