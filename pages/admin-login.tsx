import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { getErrorMessage, getSuccessMessage } from '../utils/errorMessages';
import Notification, { useNotification } from '../components/Notification';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      showNotification('Please fill in all fields.', 'error');
      return;
    }

    setIsLoading(true);

    // Admin credentials - hardcoded for security
    const ADMIN_USERNAME = 'eduaid_admin';
    const ADMIN_PASSWORD = 'EduAid2024@Ghana';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Store admin session
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminUser', username);
      
      showNotification('Admin login successful!', 'success');
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    } else {
      showNotification('Invalid admin credentials', 'error');
    }

    setIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>Admin Login - EduAid</title>
      </Head>
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-red-600">🔐 Admin Access</h1>
            <p className="text-gray-600 mt-2">Enter admin credentials</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter admin username"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter admin password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              {isLoading ? 'Signing In...' : 'Admin Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Regular user?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Student login here
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
} 