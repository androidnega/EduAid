import Head from 'next/head'
import Layout from '../components/Layout'
import { db } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { collection, onSnapshot, updateDoc, doc, Timestamp } from 'firebase/firestore'
import ProtectedRoute from '../components/ProtectedRoute'

type Task = {
  id: string
  category: string
  language: string
  status: string
  fileName: string
  userEmail: string
  createdAt: Timestamp
}

// For future admin email restriction:
// const allowedAdminEmail = "youradminemail@example.com"

export default function AdminPanel() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check admin authentication
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/admin-login')
      return
    }
    
    // For future Google Auth integration - admin email check would go here:
    // if (user?.email !== allowedAdminEmail) {
    //   router.push('/')
    //   return
    // }
    
    setIsAuthenticated(true)

    const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[]
      setTasks(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, { status: newStatus })
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Admin Panel - CodeAi</title>
        </Head>

        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-600 mb-6">Admin Task Manager</h1>
          
          <div className="mb-4">
            <button
              onClick={() => {
                localStorage.removeItem('isAdmin')
                localStorage.removeItem('adminUser')
                router.push('/admin-login')
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Admin Logout
            </button>
          </div>

          {!isAuthenticated ? (
            <p className="text-gray-600">Checking authentication...</p>
          ) : loading ? (
            <p className="text-gray-600">Loading all tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-gray-600">No tasks found.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white border-l-4 border-blue-600 p-4 shadow rounded-md">
                  <h2 className="text-lg font-semibold">{task.category}</h2>
                  <p className="text-sm text-gray-500">Language: {task.language}</p>
                  <p className="text-sm text-gray-500">User: {task.userEmail}</p>
                  <p className="text-sm text-gray-500">File: {task.fileName}</p>
                  <p className="text-sm text-blue-600 font-semibold mb-2">Current Status: {task.status}</p>

                  <select
                    className="border p-2 rounded bg-gray-100"
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  >
                    <option value="submitted">Submitted</option>
                    <option value="processing">Processing</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
} 