import Link from 'next/link'
import { useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import { signIn, signOutUser } from '../lib/auth'
import { onAuthStateChanged, User } from 'firebase/auth'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    
    // Check admin status
    const adminStatus = localStorage.getItem('isAdmin')
    setIsAdmin(adminStatus === 'true')
    
    return () => unsub()
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminUser')
    setIsAdmin(false)
    closeMobileMenu()
    window.location.href = '/admin-login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                onClick={closeMobileMenu}
              >
                CodeAi
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              {/* Guest/Public Navigation */}
              {!user && !isAdmin && (
                <>
                  <Link 
                    href="/" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-blue-50"
                  >
                    Home
                  </Link>
                </>
              )}

              {/* Logged-in User Navigation */}
              {user && !isAdmin && (
                <>
                  <Link 
                    href="/upload" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-blue-50"
                  >
                    Submit Task
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-blue-50"
                  >
                    My Dashboard
                  </Link>
                </>
              )}

              {/* Admin Navigation */}
              {isAdmin && (
                <>
                  <Link 
                    href="/admin" 
                    className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-red-50"
                  >
                    Admin Dashboard
                  </Link>
                </>
              )}
              
              {/* Auth Section */}
              <div className="ml-4">
                {!user && !isAdmin ? (
                  <div className="flex space-x-3">
                    <button 
                      onClick={signIn} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Student Login
                    </button>
                  </div>
                ) : isAdmin ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-red-600 hidden lg:block font-medium">
                      Admin Panel
                    </span>
                    <button 
                      onClick={handleAdminLogout} 
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Admin Logout
                    </button>
                  </div>
                ) : user ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 hidden lg:block">
                      {user.email}
                    </span>
                    <button 
                      onClick={signOutUser} 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!mobileMenuOpen ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 shadow-lg">
            
            {/* Guest/Public Mobile Navigation */}
            {!user && !isAdmin && (
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-3 text-base font-medium transition-colors rounded-md"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
            )}

            {/* Logged-in User Mobile Navigation */}
            {user && !isAdmin && (
              <>
                <Link 
                  href="/upload" 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-3 text-base font-medium transition-colors rounded-md"
                  onClick={closeMobileMenu}
                >
                  Submit Task
                </Link>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-3 text-base font-medium transition-colors rounded-md"
                  onClick={closeMobileMenu}
                >
                  My Dashboard
                </Link>
              </>
            )}

            {/* Admin Mobile Navigation */}
            {isAdmin && (
              <Link 
                href="/admin" 
                className="text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-3 text-base font-medium transition-colors rounded-md"
                onClick={closeMobileMenu}
              >
                Admin Dashboard
              </Link>
            )}
            
            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-200">
              {!user && !isAdmin ? (
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      signIn()
                      closeMobileMenu()
                    }} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Student Login
                  </button>
                </div>
              ) : isAdmin ? (
                <div className="space-y-3">
                  <div className="px-3 py-2">
                    <p className="text-sm text-red-600 font-medium">Admin Panel Access</p>
                  </div>
                  <button 
                    onClick={handleAdminLogout} 
                    className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-4 py-3 rounded-lg text-base font-medium transition-colors border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Admin Logout
                  </button>
                </div>
              ) : user ? (
                <div className="space-y-3">
                  <div className="px-3 py-2">
                    <p className="text-sm text-gray-600">Signed in as:</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => {
                      signOutUser()
                      closeMobileMenu()
                    }} 
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg text-base font-medium transition-colors border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} CodeAi. Built for Ghana students.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Professional I.T. project assistance platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 