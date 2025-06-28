import Link from 'next/link'
import { useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import { signOutUser } from '../lib/auth'
import { onAuthStateChanged, User } from 'firebase/auth'
import { useRouter } from 'next/router'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function DashboardLayout({ children, title = "Student Dashboard" }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    })
    return () => unsub()
  }, [router])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    await signOutUser()
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Dashboard Logo */}
            <div className="flex items-center">
              <Link 
                href="/dashboard" 
                className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                onClick={closeMobileMenu}
              >
                📚 Student Portal
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              <Link 
                href="/dashboard" 
                className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-blue-50 ${
                  router.pathname === '/dashboard' ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                My Tasks
              </Link>
              <Link 
                href="/upload" 
                className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-blue-50 ${
                  router.pathname === '/upload' ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                Submit New Task
              </Link>
              <Link 
                href="/" 
                className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-gray-50"
              >
                ← Back to Website
              </Link>
              
              {/* User Section */}
              <div className="ml-4 flex items-center space-x-3">
                <span className="text-sm text-gray-600 hidden lg:block">
                  {user.displayName || user.email}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <span className="sr-only">Open dashboard menu</span>
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
            <Link 
              href="/dashboard" 
              className={`text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-3 text-base font-medium transition-colors rounded-md ${
                router.pathname === '/dashboard' ? 'bg-blue-50 text-blue-600' : ''
              }`}
              onClick={closeMobileMenu}
            >
              My Tasks
            </Link>
            <Link 
              href="/upload" 
              className={`text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-3 text-base font-medium transition-colors rounded-md ${
                router.pathname === '/upload' ? 'bg-blue-50 text-blue-600' : ''
              }`}
              onClick={closeMobileMenu}
            >
              Submit New Task
            </Link>
            <Link 
              href="/" 
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 block px-3 py-3 text-base font-medium transition-colors rounded-md"
              onClick={closeMobileMenu}
            >
              ← Back to Website
            </Link>
            
            {/* Mobile User Section */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="px-3 py-2">
                <p className="text-sm text-gray-600">Signed in as:</p>
                <p className="text-sm font-medium text-gray-900 truncate">{user.displayName || user.email}</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg text-base font-medium transition-colors border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8">
        {children}
      </main>

      {/* Dashboard Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} CodeAi Student Portal
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 