import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBOB_GR3cAzj8XD6vBZGpTEcALLE_j9ofM",
  authDomain: "stackblitz-firebase-demo.firebaseapp.com",
  projectId: "stackblitz-firebase-demo",
  storageBucket: "stackblitz-firebase-demo.appspot.com",
  messagingSenderId: "581786424162",
  appId: "1:581786424162:web:c604c41c0e2665f42487e7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);