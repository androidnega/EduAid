import Head from 'next/head'
import AdminLayout from '../components/AdminLayout'
import { db } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { collection, onSnapshot, updateDoc, doc, Timestamp } from 'firebase/firestore'

type Task = {
  id: string
  category: string
  language: string
  status: string
  fileName: string
  userEmail: string
  createdAt: Timestamp
}

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'processing':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'done':
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return '📄'
      case 'processing':
        return '⚙️'
      case 'done':
      case 'completed':
        return '✅'
      default:
        return '❓'
    }
  }

  return (
    <AdminLayout title="Task Management">
      <Head>
        <title>Admin Panel - CodeAi Control Center</title>
        <meta name="description" content="Administrative task management panel" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {!isAuthenticated ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Checking authentication...</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading all tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">No student submissions to manage yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Task Overview</h2>
                <span className="text-sm text-gray-500">{tasks.length} total tasks</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-yellow-800">
                    {tasks.filter(t => t.status.toLowerCase() === 'submitted').length}
                  </div>
                  <div className="text-sm text-yellow-600">Submitted</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-800">
                    {tasks.filter(t => t.status.toLowerCase() === 'processing').length}
                  </div>
                  <div className="text-sm text-blue-600">Processing</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-800">
                    {tasks.filter(t => t.status.toLowerCase() === 'done').length}
                  </div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${getStatusColor(task.status)}`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-xl mr-2">{getStatusIcon(task.status)}</span>
                          <h3 className="text-lg font-semibold text-gray-900">{task.category}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><span className="font-medium">Language:</span> {task.language}</p>
                            <p><span className="font-medium">Student:</span> {task.userEmail}</p>
                          </div>
                          <div>
                            {task.fileName && (
                              <p><span className="font-medium">File:</span> {task.fileName}</p>
                            )}
                            <p><span className="font-medium">Submitted:</span> {task.createdAt?.toDate().toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Update Status
                        </label>
                        <select
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        >
                          <option value="submitted">📄 Submitted</option>
                          <option value="processing">⚙️ Processing</option>
                          <option value="done">✅ Done</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
} 