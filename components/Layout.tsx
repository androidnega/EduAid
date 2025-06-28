import Link from 'next/link'
import { useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import { signIn, signOutUser } from '../lib/auth'
import { onAuthStateChanged } from 'firebase/auth'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return () => unsub()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">CodeAi</Link>
        <div className="space-x-4">
          <Link href="/upload" className="hover:text-blue-600 font-medium">Submit Task</Link>
          <Link href="/dashboard" className="hover:text-blue-600 font-medium">Dashboard</Link>
          {!user ? (
            <button onClick={signIn} className="bg-blue-600 text-white py-1 px-4 rounded">Login</button>
          ) : (
            <button onClick={signOutUser} className="bg-gray-100 border px-4 py-1 rounded">Logout</button>
          )}
        </div>
      </nav>

      <main className="p-6">{children}</main>

      <footer className="text-center text-sm py-4 text-gray-500">
        &copy; {new Date().getFullYear()} CodeAi. Built for Ghana students.
      </footer>
    </div>
  )
} 