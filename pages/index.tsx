import Head from 'next/head'
import Layout from '../components/Layout'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return (
    <Layout>
      <Head>
        <title>CodeAi – Academic I.T. Project Assistance for Ghana Students</title>
        <meta name="description" content="CodeAi helps Ghanaian university students with coding assignments, I.T. projects, and research work. Professional task submission and tracking platform." />
      </Head>

      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-blue-900 sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="block">Simplify Your</span>
              <span className="block text-blue-600">I.T. Assignments</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-gray-700 sm:text-lg md:text-xl">
              CodeAi helps Ghanaian university students with their coding tasks, I.T. projects, and research work. 
              Upload your task, track progress, and get professional assistance.
            </p>
            
            {!loading && (
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
                {user ? (
                  // Logged in user - show both buttons
                  <>
                    <Link 
                      href="/upload" 
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-8 sm:py-4 sm:text-lg"
                    >
                      Submit Your Task
                    </Link>
                    <Link 
                      href="/dashboard" 
                      className="inline-flex items-center justify-center rounded-lg border-2 border-blue-600 bg-white px-6 py-3 text-base font-semibold text-blue-600 transition-all hover:bg-blue-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-8 sm:py-4 sm:text-lg"
                    >
                      View My Dashboard
                    </Link>
                  </>
                ) : (
                  // Not logged in - only show sign up encouragement
                  <Link 
                    href="/login" 
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-8 sm:py-4 sm:text-lg"
                  >
                    Get Started - Sign In
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-blue-900 sm:text-3xl md:text-4xl">
                How It Works
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
                Get started with CodeAi in three simple steps
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:mt-16 lg:grid-cols-3 lg:gap-12">
              {/* Step 1 */}
              <div className="group relative rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200 transition-all hover:shadow-xl hover:ring-blue-300 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-blue-900">Sign In Securely</h3>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  Log in using your Google account to access your personal dashboard and submit tasks securely.
                </p>
              </div>

              {/* Step 2 */}
              <div className="group relative rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200 transition-all hover:shadow-xl hover:ring-blue-300 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-blue-900">Submit Your Task</h3>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  Fill out the detailed form or upload your files. Our system will review and process your requirements.
                </p>
              </div>

              {/* Step 3 */}
              <div className="group relative rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200 transition-all hover:shadow-xl hover:ring-blue-300 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-blue-900">Track Progress</h3>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  Monitor your submission status in real-time and download completed work when ready.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-blue-900 sm:text-3xl md:text-4xl">
                Built for Ghanaian Students
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
                Designed specifically for the needs of university students across Ghana
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:mt-16 md:grid-cols-2 lg:gap-12">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <span className="text-white font-bold">✓</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-900">All I.T. Disciplines</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Support for coding assignments, web development, databases, networking, and final year projects.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <span className="text-white font-bold">✓</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-900">Secure & Private</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Your submissions and personal information are protected with enterprise-level security.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <span className="text-white font-bold">✓</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-900">Real-time Tracking</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Monitor your task progress with live updates from submission to completion.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <span className="text-white font-bold">✓</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-900">University Focused</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Tailored for both technical and traditional universities across Ghana.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-blue-600 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base text-blue-100 sm:text-lg">
              Join thousands of students who are already using CodeAi to excel in their I.T. coursework.
            </p>
            {!loading && (
              <div className="mt-8">
                {user ? (
                  // Logged in user - can submit task
                  <Link 
                    href="/upload" 
                    className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 sm:text-lg"
                  >
                    Submit Your First Task
                  </Link>
                ) : (
                  // Not logged in - redirect to login
                  <Link 
                    href="/login" 
                    className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 sm:text-lg"
                  >
                    Sign In to Submit Task
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  )
} 