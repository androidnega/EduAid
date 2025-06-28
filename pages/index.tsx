import Head from 'next/head'
import Layout from '../components/Layout'
import Link from 'next/link'

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>CodeAi – Academic I.T. Project Assistance</title>
      </Head>

      <div className="bg-white text-gray-800">
        {/* Hero */}
        <section className="text-center py-20 px-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">Simplify Your I.T. Assignments</h1>
          <p className="text-lg max-w-2xl mx-auto text-gray-700">
            CodeAi helps Ghanaian university students with their coding tasks, I.T. projects, and research work. Upload your task, we take care of the rest.
          </p>
          <div className="mt-8 space-x-4">
            <Link href="/upload" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Submit Task
            </Link>
            <Link href="/dashboard" className="text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50">
              Go to Dashboard
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-6 max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10 text-blue-700">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-10 text-left">
            <div className="bg-white p-6 shadow rounded">
              <h3 className="text-xl font-semibold text-blue-600">1. Sign In</h3>
              <p className="mt-2 text-gray-600">Log in using your Google account to access your dashboard and submit tasks.</p>
            </div>
            <div className="bg-white p-6 shadow rounded">
              <h3 className="text-xl font-semibold text-blue-600">2. Submit Your Task</h3>
              <p className="mt-2 text-gray-600">Fill the form or upload your file. The system reviews and calculates what's needed.</p>
            </div>
            <div className="bg-white p-6 shadow rounded">
              <h3 className="text-xl font-semibold text-blue-600">3. Track Progress</h3>
              <p className="mt-2 text-gray-600">Once submitted, you can track updates and download the final result when ready.</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-blue-50 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Ready to Start?</h2>
          <p className="text-gray-600 mb-6">Join thousands of students getting help with their tech-related coursework.</p>
          <Link href="/upload" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
            Submit a Task Now
          </Link>
        </section>
      </div>
    </Layout>
  )
} 