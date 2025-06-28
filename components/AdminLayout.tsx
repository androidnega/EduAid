import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function AdminLayout({ children, title = "Admin Dashboard" }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin')
    if (adminStatus !== 'true') {
      router.push('/admin-login')
    } else {
      setIsAdmin(true)
    }
  }, [router])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminUser')
    router.push('/admin-login')
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-red-50">
      {/* Admin Header */}
      <header className="bg-red-600 shadow-sm border-b border-red-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Admin Logo */}
            <div className="flex items-center">
              <Link 
                href="/admin" 
                className="text-xl font-bold text-white hover:text-red-100 transition-colors"
                onClick={closeMobileMenu}
              >
                🛡️ Admin Control Panel
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              <Link 
                href="/admin" 
                className={`text-red-100 hover:text-white px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-red-700 ${
                  router.pathname === '/admin' ? 'bg-red-700 text-white' : ''
                }`}
              >
                Task Management
              </Link>
              
              {/* Admin Section */}
              <div className="ml-4 flex items-center space-x-3">
                <span className="text-sm text-red-100 hidden lg:block font-medium">
                  Administrator
                </span>
                <button 
                  onClick={handleLogout} 
                  className="bg-red-100 hover:bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
                >
                  Admin Logout
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-red-100 hover:text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600 transition-colors"
              >
                <span className="sr-only">Open admin menu</span>
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
          <div className="px-2 pt-2 pb-3 space-y-1 bg-red-600 border-t border-red-700 shadow-lg">
            <Link 
              href="/admin" 
              className={`text-red-100 hover:text-white hover:bg-red-700 block px-3 py-3 text-base font-medium transition-colors rounded-md ${
                router.pathname === '/admin' ? 'bg-red-700 text-white' : ''
              }`}
              onClick={closeMobileMenu}
            >
              Task Management
            </Link>
            
            {/* Mobile Admin Section */}
            <div className="pt-4 border-t border-red-500 space-y-3">
              <div className="px-3 py-2">
                <p className="text-sm text-red-100">Signed in as:</p>
                <p className="text-sm font-medium text-white">Administrator</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="w-full bg-red-100 hover:bg-white text-red-600 px-4 py-3 rounded-lg text-base font-medium transition-colors border border-red-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
              >
                Admin Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">Administrative Control Panel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-red-600 border-t border-red-700 mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-red-100">
              &copy; {new Date().getFullYear()} CodeAi Admin Panel - Restricted Access
            </p>
            <p className="text-xs text-red-200 mt-1">
              Authorized Personnel Only
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 