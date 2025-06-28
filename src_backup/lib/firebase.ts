// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTIoJ3clD2dlYyyOP7YO7HDThZbsRmi4E",
  authDomain: "codeai-4214f.firebaseapp.com",
  projectId: "codeai-4214f",
  storageBucket: "codeai-4214f.firebasestorage.app",
  messagingSenderId: "864173304886",
  appId: "1:864173304886:web:b539ad496afe6a64713c97"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app; 