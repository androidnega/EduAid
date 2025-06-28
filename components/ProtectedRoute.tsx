import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <p className="text-center mt-20">Checking access...</p>
  }

  return <>{children}</>
} 