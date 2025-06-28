import Head from 'next/head'
import Layout from '../components/Layout'

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>CodeAi - Help for I.T. Projects</title>
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-white">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">CodeAi</h1>
        <p className="text-gray-700 max-w-2xl text-lg">
          Submit your I.T. assignments, coding tasks, mini projects, and final year research easily. 
          Built for Ghanaian university students, both technical and traditional.
        </p>

        <div className="mt-8 flex space-x-4">
          <a href="/upload" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-lg">
            Submit Task
          </a>
          <a href="/dashboard" className="border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-5 rounded-lg">
            My Dashboard
          </a>
        </div>
      </div>
    </Layout>
  )
} 