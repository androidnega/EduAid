import Head from 'next/head'
import { useState } from 'react'
import { getErrorMessage, getSuccessMessage, getLoadingMessage } from '../utils/errorMessages';
import Notification, { useNotification } from '../components/Notification';
import { db, auth } from '../lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import DashboardLayout from '../components/DashboardLayout'

export default function Upload() {
  // Form state
  const [category, setCategory] = useState('')
  const [language, setLanguage] = useState('')
  const [level, setLevel] = useState('')
  const [urgency, setUrgency] = useState('')
  const [pageCount, setPageCount] = useState<number | ''>('')
  const [complexity, setComplexity] = useState('')
  const [refStyle, setRefStyle] = useState('')
  const [workType, setWorkType] = useState('individual')
  const [groupSize, setGroupSize] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [price, setPrice] = useState<number | null>(null)
  const [showPricing, setShowPricing] = useState(false)
  const { notification, showNotification, hideNotification } = useNotification()

  // Ghana-specific pricing calculation
  const calculatePrice = () => {
    if (!level) {
      showNotification('Please select academic level first', 'error');
      return;
    }
    
    let basePrice = 0

    // 🎓 Level base ranges (Ghana Cedis)
    if (level === '100–200') basePrice = 80
    else if (level === '300–400') basePrice = 250
    else if (level === 'Masters' || level === 'PhD') basePrice = 450

    // ⚙️ Category modifiers
    if (category.includes('Final Year Project')) basePrice += 200
    if (category.includes('AI') || category.includes('Machine Learning')) basePrice += 150
    if (category.includes('Web Development')) basePrice += 100

    // 🚨 Urgency modifiers
    if (urgency === 'urgent') basePrice += 100
    if (urgency === 'very-urgent') basePrice += 200

    // 📄 Page/complexity modifiers
    if (pageCount && pageCount > 10) basePrice += 50
    if (pageCount && pageCount > 20) basePrice += 100
    if (complexity === 'complex') basePrice += 100
    if (complexity === 'AI/advanced') basePrice += 150

    // 💸 Volume discounts
    if (basePrice > 500) basePrice *= 0.97
    if (basePrice > 800) basePrice *= 0.955

    setPrice(Math.round(basePrice))
    setShowPricing(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    const user = auth.currentUser
    if (!user) {
      showNotification('Please login first', 'error');
      return;
    }

    // Validation - updated for new fields
    if (!category || !level || !urgency || !complexity) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }
    
    // Language required for coding tasks
    if ((category.includes('Coding') || category.includes('Web') || category.includes('Database')) && !language) {
      showNotification('Please select programming language for this task type.', 'error');
      return;
    }
    
    if (!file) {
      showNotification('Please upload your project file.', 'error');
      return;
    }

    setIsSubmitting(true);
    showNotification(getLoadingMessage('upload'), 'loading');

    try {
      // Save enhanced task to Firestore
      await addDoc(collection(db, 'tasks'), {
        category,
        language: language || 'N/A',
        level,
        urgency,
        pageCount: pageCount || 0,
        complexity,
        referencing: refStyle || 'None',
        group: workType === 'group',
        groupSize: workType === 'group' ? groupSize : 1,
        estimatedPrice: price || 0,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        status: 'submitted',
        userId: user.uid,
        userEmail: user.email,
        createdAt: Timestamp.now(),
      });
      
      // On success
      showNotification(getSuccessMessage('upload'), 'success');
      
      // Reset form
      setCategory('');
      setLanguage('');
      setLevel('');
      setUrgency('');
      setPageCount('');
      setComplexity('');
      setRefStyle('');
      setWorkType('individual');
      setGroupSize(1);
      setFile(null);
      setPrice(null);
      setShowPricing(false);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: unknown) {
      const friendlyMessage = getErrorMessage(error);
      showNotification(friendlyMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Submit New Task">
      <Head>
        <title>Submit Task - CodeAi Student Portal</title>
        <meta name="description" content="Submit your I.T. assignment or project with AI-powered pricing" />
      </Head>
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🇬🇭 Ghana I.T. Project Submission</h2>
            <p className="text-gray-600">Fill out the details below for accurate pricing and professional assistance</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Task Category */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Task Category *</label>
              <select 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={category} 
                onChange={e => setCategory(e.target.value)}
              >
                <option value="">Select Task Type</option>
                <option>Coding Assignment</option>
                <option>Web Development Task</option>
                <option>Database Assignment</option>
                <option>Networking Work</option>
                <option>AI/Machine Learning Project</option>
                <option>Mobile App Development</option>
                <option>Mini Project (I.T)</option>
                <option>Final Year Project (I.T)</option>
                <option>Research Paper (I.T)</option>
              </select>
            </div>

            {/* Academic Level */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Academic Level *</label>
              <select 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={level} 
                onChange={e => setLevel(e.target.value)}
              >
                <option value="">Select Your Level</option>
                <option value="100–200">Level 100–200 (1st & 2nd Year)</option>
                <option value="300–400">Level 300–400 (3rd & 4th Year)</option>
                <option value="Masters">Masters Degree</option>
                <option value="PhD">PhD Level</option>
              </select>
            </div>

            {/* Programming Language - Conditional */}
            {(category.includes('Coding') || category.includes('Web') || category.includes('Database') || category.includes('AI') || category.includes('Mobile')) && (
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Programming Language *</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={language} 
                  onChange={e => setLanguage(e.target.value)}
                >
                  <option value="">Select Language</option>
                  <option>HTML/CSS</option>
                  <option>JavaScript</option>
                  <option>Java</option>
                  <option>Python</option>
                  <option>C/C++</option>
                  <option>PHP</option>
                  <option>MySQL/SQL</option>
                  <option>React</option>
                  <option>Node.js</option>
                  <option>Flutter/Dart</option>
                  <option>Swift (iOS)</option>
                  <option>Kotlin (Android)</option>
                  <option>Other</option>
                </select>
              </div>
            )}

            {/* Deadline Urgency */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Deadline Urgency *</label>
              <select 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={urgency} 
                onChange={e => setUrgency(e.target.value)}
              >
                <option value="">Select Urgency</option>
                <option value="flexible">Flexible (7+ days)</option>
                <option value="standard">Standard (3-7 days)</option>
                <option value="urgent">Urgent (1-2 days) +₵100</option>
                <option value="very-urgent">Very Urgent (Same day) +₵200</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Page Count */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Estimated Pages/Chapters</label>
                <input 
                  type="number" 
                  min="1" 
                  max="100"
                  value={pageCount} 
                  onChange={e => setPageCount(Number(e.target.value) || '')} 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="e.g., 10"
                />
              </div>

              {/* Technical Complexity */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Technical Difficulty *</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={complexity} 
                  onChange={e => setComplexity(e.target.value)}
                >
                  <option value="">Select Difficulty</option>
                  <option value="simple">Simple (Basic concepts)</option>
                  <option value="moderate">Moderate (Intermediate)</option>
                  <option value="complex">Complex (Advanced) +₵100</option>
                  <option value="AI/advanced">AI/Advanced Research +₵150</option>
                </select>
              </div>
            </div>

            {/* Referencing Style - Conditional */}
            {(category.includes('Research') || category.includes('Final Year') || level === 'Masters' || level === 'PhD') && (
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Referencing Style</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={refStyle} 
                  onChange={e => setRefStyle(e.target.value)}
                >
                  <option value="">Select Style</option>
                  <option>APA</option>
                  <option>MLA</option>
                  <option>IEEE</option>
                  <option>Chicago</option>
                  <option>Harvard</option>
                  <option>None</option>
                </select>
              </div>
            )}

            {/* Work Type */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Work Type</label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    value="individual" 
                    checked={workType === 'individual'} 
                    onChange={() => setWorkType('individual')}
                    className="mr-2 text-blue-600"
                  />
                  <span>Individual</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    value="group" 
                    checked={workType === 'group'} 
                    onChange={() => setWorkType('group')}
                    className="mr-2 text-blue-600"
                  />
                  <span>Group Project</span>
                </label>
              </div>
            </div>

            {/* Group Size - Conditional */}
            {workType === 'group' && (
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Number of Group Members</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  min={2} 
                  max={10}
                  value={groupSize} 
                  onChange={e => setGroupSize(Number(e.target.value))} 
                />
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Upload Task File *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.txt,.zip" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-2">Supported: PDF, DOCX, TXT, ZIP (Max 10MB)</p>
              </div>
            </div>

            {/* Check Price Button */}
            <div className="bg-blue-50 rounded-lg p-6">
              <button 
                type="button" 
                onClick={calculatePrice} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mb-4"
              >
                💰 Check Estimated Price
              </button>

              {/* Price Display */}
              {showPricing && price && (
                <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700 mb-2">
                      Estimated Price: ₵{price.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Price calculated based on level, complexity, and urgency
                    </p>
                    <div className="mt-3 text-xs text-gray-500">
                      🎯 Level: {level} | ⚡ Urgency: {urgency} | 🔧 Complexity: {complexity}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-4 rounded-lg font-bold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Submitting Project...
                </div>
              ) : (
                `🚀 Submit Task${price ? ` (₵${price.toFixed(2)})` : ''}`
              )}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
} 