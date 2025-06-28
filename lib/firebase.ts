import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration for task submission system
const firebaseConfig = {
  apiKey: "AIzaSyCTIoJ3clD2dlYyyOP7YO7HDThZbsRmi4E",
  authDomain: "codeai-4214f.firebaseapp.com",
  projectId: "codeai-4214f",
  storageBucket: "codeai-4214f.firebasestorage.app",
  messagingSenderId: "864173304886",
  appId: "1:864173304886:web:b539ad496afe6a64713c97"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app) 