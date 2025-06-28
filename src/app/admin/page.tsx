'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function AdminContent() {
  const { user, logout } = useAuth();
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
      <nav className="bg-red-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-red-100">
                Admin: {user?.displayName || user?.email}
              </span>
              <Link
                href="/dashboard"
                className="bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-800"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-800"
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
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🔐 Admin Dashboard
              </h2>
              <p className="text-gray-600">
                Advanced administrative controls and system management
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* User Management */}
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <div className="flex items-center mb-4">
                  <div className="bg-red-600 p-2 rounded-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">User Management</h3>
                </div>
                <p className="text-gray-600 mb-4">Manage user accounts, permissions, and access levels</p>
                <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700">
                  Manage Users
                </button>
              </div>

              {/* System Analytics */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 p-2 rounded-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Analytics</h3>
                </div>
                <p className="text-gray-600 mb-4">View system usage, performance metrics, and reports</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  View Analytics
                </button>
              </div>

              {/* System Settings */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center mb-4">
                  <div className="bg-green-600 p-2 rounded-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">System Settings</h3>
                </div>
                <p className="text-gray-600 mb-4">Configure system-wide settings and preferences</p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                  Configure
                </button>
              </div>

              {/* Project Management */}
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-600 p-2 rounded-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Project Management</h3>
                </div>
                <p className="text-gray-600 mb-4">Manage all projects, uploads, and submissions</p>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700">
                  Manage Projects
                </button>
              </div>

              {/* Billing & Payments */}
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-600 p-2 rounded-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Billing & Payments</h3>
                </div>
                <p className="text-gray-600 mb-4">Monitor payments, subscriptions, and financial data</p>
                <button className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700">
                  View Billing
                </button>
              </div>

              {/* System Logs */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-600 p-2 rounded-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">System Logs</h3>
                </div>
                <p className="text-gray-600 mb-4">Review system logs, errors, and activity history</p>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  View Logs
                </button>
              </div>
            </div>

            {/* Warning Message */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Admin Access:</strong> You have administrative privileges. Please use these tools responsibly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminContent />
    </ProtectedRoute>
  );
} 