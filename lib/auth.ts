import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, provider } from './firebase'

export const signIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (err) {
    console.error(err)
  }
}

export const signOutUser = async () => {
  try {
    await signOut(auth)
  } catch (err) {
    console.error(err)
  }
} 