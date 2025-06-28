'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }

      if (requireAdmin && !isAdmin) {
        // Redirect to dashboard if admin access required but user is not admin
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, isAdmin, requireAdmin, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if not authenticated or doesn't have required permissions
  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
} 