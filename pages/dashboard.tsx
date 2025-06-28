import Head from 'next/head'
import Layout from '../components/Layout'
import { db, auth } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import ProtectedRoute from '../components/ProtectedRoute'

type Task = {
  id: string
  category: string
  language: string
  status: string
  fileName: string
  createdAt: Timestamp
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[]
      setTasks(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Dashboard - CodeAi</title>
        </Head>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-600 mb-6">My Tasks</h1>

          {loading ? (
            <p className="text-gray-600">Loading your submissions...</p>
          ) : tasks.length === 0 ? (
            <p className="text-gray-600">No tasks submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white border-l-4 border-blue-600 p-4 shadow rounded-md">
                  <h2 className="text-lg font-semibold">{task.category}</h2>
                  <p className="text-sm text-gray-500">Language: {task.language}</p>
                  <p className="text-sm text-gray-500">File: {task.fileName}</p>
                  <p className="text-sm text-blue-600 font-medium">Status: {task.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
} 