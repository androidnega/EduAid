import Head from 'next/head'
import { useState } from 'react'

export default function Upload() {
  const [category, setCategory] = useState('')
  const [language, setLanguage] = useState('')
  const [refStyle, setRefStyle] = useState('')
  const [workType, setWorkType] = useState('individual')
  const [groupSize, setGroupSize] = useState(1)
  const [file, setFile] = useState<File | null>(null) // eslint-disable-line @typescript-eslint/no-unused-vars

  return (
    <>
      <Head>
        <title>Submit Task - CodeAi</title>
      </Head>
      <main className="min-h-screen bg-white p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Submit Your Project</h1>
        
        <form className="space-y-6 bg-gray-50 p-6 rounded shadow-md max-w-xl">
          
          {/* Task Type */}
          <div>
            <label className="block font-medium">Task Category</label>
            <select className="w-full border p-2 mt-1" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select</option>
              <option>Coding Assignment</option>
              <option>Web Development Task</option>
              <option>Database Assignment</option>
              <option>Networking Work</option>
              <option>Mini Project (I.T)</option>
              <option>Final Year Project (I.T)</option>
            </select>
          </div>

          {/* Programming Language */}
          <div>
            <label className="block font-medium">Programming Language</label>
            <select className="w-full border p-2 mt-1" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="">Select</option>
              <option>HTML/CSS</option>
              <option>JavaScript</option>
              <option>Java</option>
              <option>Python</option>
              <option>C/C++</option>
              <option>PHP</option>
              <option>MySQL</option>
              <option>React</option>
              <option>Node.js</option>
              <option>Other</option>
            </select>
          </div>

          {/* Referencing Style */}
          <div>
            <label className="block font-medium">Referencing Style</label>
            <select className="w-full border p-2 mt-1" value={refStyle} onChange={e => setRefStyle(e.target.value)}>
              <option value="">Select</option>
              <option>APA</option>
              <option>MLA</option>
              <option>IEEE</option>
              <option>Chicago</option>
              <option>None</option>
            </select>
          </div>

          {/* Work Type */}
          <div>
            <label className="block font-medium mb-1">Is this group work?</label>
            <div className="flex space-x-4">
              <label>
                <input type="radio" value="individual" checked={workType === 'individual'} onChange={() => setWorkType('individual')} />
                <span className="ml-2">Individual</span>
              </label>
              <label>
                <input type="radio" value="group" checked={workType === 'group'} onChange={() => setWorkType('group')} />
                <span className="ml-2">Group</span>
              </label>
            </div>
          </div>

          {/* Group Size */}
          {workType === 'group' && (
            <div>
              <label className="block font-medium">Number of Members</label>
              <input type="number" className="w-full border p-2 mt-1" min={2} value={groupSize} onChange={e => setGroupSize(Number(e.target.value))} />
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block font-medium">Upload Task File (PDF, DOCX, TXT)</label>
            <input type="file" accept=".pdf,.doc,.docx,.txt" className="w-full mt-2" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          {/* Submit */}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold">
            Submit Task
          </button>
        </form>
      </main>
    </>
  )
} 