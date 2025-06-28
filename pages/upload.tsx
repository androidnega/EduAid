import Head from 'next/head'
import { useState, useEffect } from 'react'
import { getErrorMessage, getSuccessMessage, getLoadingMessage } from '../utils/errorMessages'
import Notification, { useNotification } from '../components/Notification'
import { db, auth } from '../lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import DashboardLayout from '../components/DashboardLayout'

// Import mammoth for DOCX processing
import mammoth from 'mammoth'

// Types

export default function Upload() {
  // Core form state
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('')
  const [deadline, setDeadline] = useState('')
  const [urgency, setUrgency] = useState('')
  const [complexity, setComplexity] = useState('')
  const [pageCount, setPageCount] = useState<number | ''>('')
  
  // Multi-select arrays for coding tasks
  const [languages, setLanguages] = useState<string[]>([])
  const [frameworks, setFrameworks] = useState<string[]>([])
  const [databases, setDatabases] = useState<string[]>([])
  
  // File and content handling
  const [file, setFile] = useState<File | null>(null)
  const [fileText, setFileText] = useState('')
  const [isExtractingText, setIsExtractingText] = useState(false)
  const [isValidatingFile, setIsValidatingFile] = useState(false)
  
  // Pricing and submission
  const [price, setPrice] = useState<number | null>(null)
  const [aiPrice, setAiPrice] = useState<string | null>(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // UI state
  const { notification, showNotification, hideNotification } = useNotification()

  // Calculate urgency based on deadline
  useEffect(() => {
    if (deadline) {
      const deadlineDate = new Date(deadline)
      const today = new Date()
      const diffTime = deadlineDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 1) {
        setUrgency('very-urgent')
      } else if (diffDays <= 3) {
        setUrgency('urgent')
      } else if (diffDays <= 7) {
        setUrgency('standard')
      } else {
        setUrgency('flexible')
      }
    }
  }, [deadline])

  // Input sanitization function
  const sanitizeInput = (text: string): string => {
    return text
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/[{}();$]/g, '') // Remove potentially dangerous characters
      .trim()
  }

  // Multi-select handler
  const handleMultiSelect = (setter: (value: string[]) => void, current: string[], value: string) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value))
    } else {
      setter([...current, value])
    }
  }

  // File upload and text extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    // Validate file size (max 10MB)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      showNotification('File size must be less than 10MB', 'error')
      return
    }

    setFile(uploadedFile)
    setIsExtractingText(true)
    showNotification('Extracting text from file...', 'loading')

    try {
      let extractedText = ''
      
      if (uploadedFile.name.toLowerCase().endsWith('.docx')) {
        // Extract text from DOCX
        const arrayBuffer = await uploadedFile.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        extractedText = result.value
      } else if (uploadedFile.name.toLowerCase().endsWith('.txt')) {
        // Extract text from TXT
        extractedText = await uploadedFile.text()
      } else if (uploadedFile.name.toLowerCase().endsWith('.pdf')) {
        // For PDF, we'll show a message (pdf-parse requires server-side processing)
        extractedText = `PDF file: ${uploadedFile.name} (${Math.round(uploadedFile.size / 1024)}KB) - PDF content analysis will be performed during AI pricing.`
      } else {
        showNotification('Please upload a .txt, .docx, or .pdf file', 'error')
        setFile(null)
        setIsExtractingText(false)
        return
      }

      // Sanitize extracted text
      const sanitizedText = sanitizeInput(extractedText)
      setFileText(sanitizedText)

      // Validate content with AI
      if (sanitizedText.length > 50) {
        await validateFileContent(sanitizedText)
      }

      showNotification('File processed successfully!', 'success')
    } catch (error) {
      console.error('File processing error:', error)
      showNotification('Error processing file. Please try again.', 'error')
      setFile(null)
      setFileText('')
    } finally {
      setIsExtractingText(false)
    }
  }

  // AI validation of file content
  const validateFileContent = async (content: string) => {
    if (!category) return // Skip validation if no category selected yet

    setIsValidatingFile(true)
    showNotification('AI is validating your document...', 'loading')

    try {
      const response = await fetch('/api/validate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.substring(0, 2000), // First 2000 chars for validation
          expectedCategory: category
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (!result.isValid) {
          showNotification(
            `Warning: The uploaded content doesn't seem to match "${category}". Please verify your task category.`,
            'error'
          )
        } else {
          showNotification('Document validated successfully!', 'success')
        }
      }
    } catch (error) {
      console.error('Validation error:', error)
      // Don't block submission on validation errors, just warn
      showNotification('Could not validate document, but you can still proceed.', 'info')
    } finally {
      setIsValidatingFile(false)
    }
  }

  // Ghana-specific pricing calculation
  const calculatePrice = () => {
    if (!level) {
      showNotification('Please select academic level first', 'error')
      return
    }

    let basePrice = 0

    // Base pricing by level
    if (level === '100–200') basePrice = 80
    else if (level === '300–400') basePrice = 250
    else if (level === 'Masters' || level === 'PhD') basePrice = 450

    // Category modifiers
    if (category.includes('Final Year Project')) basePrice += 200
    if (category.includes('AI') || category.includes('Machine Learning')) basePrice += 150
    if (category.includes('Web Development')) basePrice += 100
    if (category.includes('Database')) basePrice += 75

    // Urgency modifiers
    if (urgency === 'urgent') basePrice += 100
    if (urgency === 'very-urgent') basePrice += 200

    // Complexity modifiers
    if (complexity === 'complex') basePrice += 100
    if (complexity === 'AI/advanced') basePrice += 150

    // Page count modifiers (for non-coding tasks)
    if (!category.includes('Coding') && pageCount) {
      if (pageCount > 10) basePrice += 50
      if (pageCount > 20) basePrice += 100
    }

    // Technology stack modifiers (for coding tasks)
    if (category.includes('Coding')) {
      basePrice += languages.length * 25
      basePrice += frameworks.length * 50
      basePrice += databases.length * 40
    }

    // Discounts
    if (basePrice > 500) basePrice *= 0.97
    if (basePrice > 800) basePrice *= 0.955

    setPrice(Math.round(basePrice))
    setShowPricing(true)
  }

  // AI-powered price suggestion
  const handleAIPriceCheck = async () => {
    if (!category || !level || !urgency || !complexity) {
      showNotification('Please fill in all required fields first', 'error')
      return
    }

    setIsLoadingAI(true)
    showNotification('AI is analyzing your task for pricing...', 'loading')

    try {
      const taskDetails = {
        category,
        level,
        urgency,
        pageCount: typeof pageCount === 'number' ? pageCount : 0,
        complexity,
        language: languages.join(', ') || 'Not specified',
        frameworks: frameworks.join(', '),
        databases: databases.join(', '),
        deadline,
        description: `${category} project for ${level} level with ${urgency} urgency`,
        fileContent: fileText.substring(0, 1000)
      }

      const response = await fetch('/api/ai-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskDetails),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI price suggestion')
      }

      const result = await response.json()
      setAiPrice(result.price)
      setShowPricing(true)
      showNotification('AI price analysis complete!', 'success')
    } catch (error) {
      console.error('AI Price Error:', error)
      showNotification('Failed to get AI price suggestion. Please try again.', 'error')
    } finally {
      setIsLoadingAI(false)
    }
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const user = auth.currentUser
    if (!user) {
      showNotification('Please login first', 'error')
      return
    }

    // Validation
    if (!category || !level || !urgency || !complexity) {
      showNotification('Please fill in all required fields.', 'error')
      return
    }

    if (category.includes('Coding') && languages.length === 0) {
      showNotification('Please select at least one programming language for coding tasks.', 'error')
      return
    }

    if (!category.includes('Coding') && !pageCount) {
      showNotification('Please specify estimated page count for this task type.', 'error')
      return
    }

    if (!file) {
      showNotification('Please upload your project file.', 'error')
      return
    }

    if (!deadline) {
      showNotification('Please set a deadline for your task.', 'error')
      return
    }

    setIsSubmitting(true)
    showNotification(getLoadingMessage('upload'), 'loading')

    try {
      await addDoc(collection(db, 'tasks'), {
        category,
        level,
        urgency,
        complexity,
        deadline,
        pageCount: pageCount || 0,
        languages: languages.join(', '),
        frameworks: frameworks.join(', '),
        databases: databases.join(', '),
        estimatedPrice: price || 0,
        aiPrice: aiPrice || '',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        extractedText: fileText,
        status: 'submitted',
        userId: user.uid,
        userEmail: user.email,
        createdAt: Timestamp.now(),
      })

      showNotification(getSuccessMessage('upload'), 'success')

      // Reset form
      setCategory('')
      setLevel('')
      setDeadline('')
      setUrgency('')
      setComplexity('')
      setPageCount('')
      setLanguages([])
      setFrameworks([])
      setDatabases([])
      setFile(null)
      setFileText('')
      setPrice(null)
      setAiPrice(null)
      setShowPricing(false)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error: unknown) {
      const friendlyMessage = getErrorMessage(error)
      showNotification(friendlyMessage, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date (today) for deadline picker
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return (
    <DashboardLayout title="Submit New Task">
      <Head>
        <title>Submit Task - EduAid Student Portal</title>
        <meta name="description" content="Submit your I.T. assignment with AI-powered validation and pricing" />
      </Head>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h2 className="text-3xl font-bold text-white mb-2">🇬🇭 Ghana I.T. Project Submission</h2>
            <p className="text-blue-100">Professional academic task submission with AI-powered validation and pricing</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Two-Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN - Task Details */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    📋 Task Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Task Category */}
                    <div className="md:col-span-2">
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
                        <option>Theory/Research Task</option>
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
                        <option value="">Select Level</option>
                        <option value="100–200">Level 100–200 (1st & 2nd Year)</option>
                        <option value="300–400">Level 300–400 (3rd & 4th Year)</option>
                        <option value="Masters">Masters Degree</option>
                        <option value="PhD">PhD Level</option>
                      </select>
                    </div>

                    {/* Deadline */}
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">Submission Deadline *</label>
                      <input 
                        type="date" 
                        min={getMinDate()}
                        value={deadline} 
                        onChange={e => setDeadline(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Auto-calculated Urgency */}
                    {urgency && (
                      <div className="md:col-span-2">
                        <label className="block font-semibold text-gray-700 mb-2">Urgency (Auto-calculated)</label>
                        <div className={`p-3 rounded-lg border-2 ${
                          urgency === 'very-urgent' ? 'bg-red-50 border-red-200 text-red-700' :
                          urgency === 'urgent' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                          urgency === 'standard' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                          'bg-green-50 border-green-200 text-green-700'
                        }`}>
                          <span className="font-medium">
                            {urgency === 'very-urgent' && '🔴 Very Urgent (≤1 day) +₵200'}
                            {urgency === 'urgent' && '🟠 Urgent (2-3 days) +₵100'}
                            {urgency === 'standard' && '🟡 Standard (4-7 days) +₵50'}
                            {urgency === 'flexible' && '🟢 Flexible (7+ days)'}
                          </span>
                        </div>
                      </div>
                    )}

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

                    {/* Page Count - Only for non-coding tasks */}
                    {category && !category.includes('Coding') && (
                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">Estimated Pages/Chapters *</label>
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
                    )}
                  </div>
                </div>

                {/* Technology Stack - Only for coding tasks */}
                {category && category.includes('Coding') && (
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      💻 Technology Stack
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Programming Languages */}
                      <div>
                        <label className="block font-semibold text-gray-700 mb-3">Programming Languages *</label>
                        <div className="space-y-2">
                          {['JavaScript', 'Python', 'Java', 'C/C++', 'PHP', 'MySQL/SQL', 'HTML/CSS', 'Other'].map((lang) => (
                            <label key={lang} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={languages.includes(lang)}
                                onChange={() => handleMultiSelect(setLanguages, languages, lang)}
                                className="mr-2 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm">{lang}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Frameworks */}
                      <div>
                        <label className="block font-semibold text-gray-700 mb-3">Frameworks</label>
                        <div className="space-y-2">
                          {['React', 'Node.js', 'Django', 'Laravel', 'Flutter', 'Bootstrap', 'Other'].map((fw) => (
                            <label key={fw} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={frameworks.includes(fw)}
                                onChange={() => handleMultiSelect(setFrameworks, frameworks, fw)}
                                className="mr-2 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm">{fw}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Databases */}
                      <div>
                        <label className="block font-semibold text-gray-700 mb-3">Databases</label>
                        <div className="space-y-2">
                          {['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Firebase', 'Other'].map((db) => (
                            <label key={db} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={databases.includes(db)}
                                onChange={() => handleMultiSelect(setDatabases, databases, db)}
                                className="mr-2 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm">{db}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN - File Upload & Pricing */}
              <div className="space-y-6">
                {/* File Upload Section */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    📄 Document Upload
                  </h3>
                  
                  <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      disabled={isExtractingText}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Supported: PDF, DOCX, TXT (Max 10MB)
                    </p>
                    {isExtractingText && (
                      <div className="mt-3 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        <span className="text-green-600">Extracting text...</span>
                      </div>
                    )}
                    {isValidatingFile && (
                      <div className="mt-3 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                        <span className="text-purple-600">AI validating content...</span>
                      </div>
                    )}
                  </div>

                  {/* File Text Preview */}
                  {fileText && (
                    <div className="mt-6">
                      <label className="block font-semibold text-gray-700 mb-2">Extracted Content Preview</label>
                      <textarea
                        value={fileText}
                        onChange={(e) => setFileText(sanitizeInput(e.target.value))}
                        className="w-full h-32 border border-gray-300 rounded-lg p-3 resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Extracted text will appear here..."
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        You can edit the extracted text if needed. This content will be used for AI analysis.
                      </p>
                    </div>
                  )}
                </div>

                {/* Pricing Section */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    💰 Pricing Analysis
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <button 
                      type="button" 
                      onClick={calculatePrice} 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      💰 Check Logic Price
                    </button>

                    <button 
                      type="button" 
                      onClick={handleAIPriceCheck}
                      disabled={isLoadingAI || !category || !level || !urgency || !complexity}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      {isLoadingAI ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          AI Analyzing...
                        </div>
                      ) : (
                        '🤖 Get AI Price'
                      )}
                    </button>
                  </div>

                  {/* Price Display */}
                  {showPricing && (price || aiPrice) && (
                    <div className="space-y-4">
                      {price && (
                        <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-700 mb-2">
                              Logic-Based Price: ₵{price.toFixed(2)}
                            </div>
                            <p className="text-sm text-gray-600">
                              Calculated based on level, complexity, urgency, and technology stack
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {aiPrice && (
                        <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-700 mb-2">
                              AI Suggested Price: {aiPrice}
                            </div>
                            <p className="text-sm text-gray-600">
                              AI-powered analysis including file content and task complexity
                            </p>
                            <div className="mt-3 text-xs text-purple-600 font-medium">
                              🤖 Enhanced with OpenAI analysis
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button 
                type="submit" 
                disabled={isSubmitting || !category || !level || !complexity || !deadline || !file}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Submitting Project...
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    🚀 Submit Task{price ? ` (₵${price.toFixed(2)})` : aiPrice ? ` (${aiPrice})` : ''}
                    <span className="ml-2">→</span>
                  </span>
                )}
              </button>
              
              {(!category || !level || !complexity || !deadline || !file) && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Please fill in all required fields to submit your task
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
} 