'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">CodeAI Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.displayName || user?.email}
              </span>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Welcome to your CodeAI Platform dashboard. Ready to build something amazing?
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {/* Quick Action Cards */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Project</h3>
                  <p className="text-gray-600 mb-4">Upload your code for AI analysis</p>
                  <Link
                    href="/upload"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Upload Now
                  </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">View Pricing</h3>
                  <p className="text-gray-600 mb-4">Check our pricing plans</p>
                  <Link
                    href="/pricing"
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    View Plans
                  </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Account Info</h3>
                  <p className="text-gray-600 mb-4">Manage your account settings</p>
                  <div className="text-sm text-gray-500">
                    <p>Email: {user?.email}</p>
                    <p>Status: {isAdmin ? 'Admin' : 'User'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
} 