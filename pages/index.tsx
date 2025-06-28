import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>CodeAi - Smart Help for IT Projects</title>
      </Head>
      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">CodeAi</h1>
        <p className="text-center max-w-xl text-gray-700">
          Get fast, reliable help for your coding assignments, final year projects, and more.
          Built for Ghanaian university students.
        </p>
        <div className="mt-8 space-x-4">
          <a href="/upload" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">Submit Task</a>
          <a href="/pricing" className="border border-blue-600 text-blue-600 py-2 px-4 rounded-lg">See Pricing</a>
        </div>
      </main>
    </>
  )
} 