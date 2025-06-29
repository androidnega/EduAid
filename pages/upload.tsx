import Head from 'next/head'
import { useState, useEffect } from 'react'
import { getErrorMessage, getSuccessMessage, getLoadingMessage } from '../utils/errorMessages'
import Notification, { useNotification } from '../components/Notification'
import { db, auth } from '../lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import DashboardLayout from '../components/DashboardLayout'
import { API_CONFIG, getApiUrl } from '../lib/config'

// Import mammoth for DOCX processing
import mammoth from 'mammoth'

// Types

export default function Upload() {
  // Basic Required Fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [institutionLevel, setInstitutionLevel] = useState('')
  const [institutionType, setInstitutionType] = useState('')
  const [courseName, setCourseName] = useState('')
  const [taskType, setTaskType] = useState('')
  const [deadline, setDeadline] = useState('')
  
  // Optional Basic Fields
  const [numPages, setNumPages] = useState<number | ''>('')
  
  // Coding/Software/App/Web Task Fields
  const [programmingLanguages, setProgrammingLanguages] = useState<string[]>([])
  const [frameworks, setFrameworks] = useState<string[]>([])
  const [databases, setDatabases] = useState<string[]>([])
  const [requiresHosting, setRequiresHosting] = useState(false)
  const [uiDesignRequired, setUiDesignRequired] = useState(false)
  const [deliveryFormat, setDeliveryFormat] = useState('')
  
  // Research/Documentation Task Fields
  const [referenceStyle, setReferenceStyle] = useState('')
  const [plagiarismCheck, setPlagiarismCheck] = useState(false)
  const [chaptersIncluded, setChaptersIncluded] = useState<string[]>([])
  
  // File and content handling
  const [file, setFile] = useState<File | null>(null)
  const [fileText, setFileText] = useState('')
  const [isExtractingText, setIsExtractingText] = useState(false)
  const [isValidatingFile, setIsValidatingFile] = useState(false)
  
  // Pricing and submission
  const [price, setPrice] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // UI state
  const { notification, showNotification, hideNotification } = useNotification()
  
  // Legacy compatibility
  const [urgency, setUrgency] = useState('')
  const [complexity, setComplexity] = useState('medium')

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

  // Auto-detect complexity based on task details
  useEffect(() => {
    if (taskType && programmingLanguages.length > 0) {
      if (taskType.includes('AI') || taskType.includes('ML')) {
        setComplexity('high')
      } else if (frameworks.length > 2 || databases.length > 1) {
        setComplexity('high')
      } else if (frameworks.length > 0 || databases.length > 0) {
        setComplexity('medium')
      } else {
        setComplexity('low')
      }
    }
  }, [taskType, programmingLanguages, frameworks, databases])

  // Input sanitization function
  const sanitizeInput = (text: string): string => {
    return text
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/[{}();$]/g, '') // Remove potentially dangerous characters
      .trim()
  }

  // Check if FastAPI backend is available
  const checkBackendAvailable = async (): Promise<boolean> => {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.HEALTH))
      return response.ok
    } catch {
      return false
    }
  }

  // Process file through FastAPI backend
  const processFileWithBackend = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FILE_UPLOAD), {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to process file with backend')
    }

    const result = await response.json()
    return result.extracted_text || result.full_text || ''
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
      
      // Try to use FastAPI backend first
      const backendAvailable = await checkBackendAvailable()
      
      if (backendAvailable && (uploadedFile.name.toLowerCase().endsWith('.pdf') || uploadedFile.name.toLowerCase().endsWith('.docx'))) {
        try {
          showNotification('Processing file with AI backend...', 'loading')
          extractedText = await processFileWithBackend(uploadedFile)
        } catch (backendError) {
          console.warn('Backend processing failed, falling back to client-side:', backendError)
          // Fall back to client-side processing
          extractedText = await processFileClientSide(uploadedFile)
        }
      } else {
        // Use client-side processing
        extractedText = await processFileClientSide(uploadedFile)
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

  // Client-side file processing (fallback)
  const processFileClientSide = async (uploadedFile: File): Promise<string> => {
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
      throw new Error('Please upload a .txt, .docx, or .pdf file')
    }

    return extractedText
  }

  // AI validation of file content (FastAPI Backend)
  const validateFileContent = async (content: string) => {
    if (!taskType) return // Skip validation if no task type selected yet

    setIsValidatingFile(true)
    showNotification('AI is validating your document...', 'loading')

    try {
      const formData = new FormData()
      const textBlob = new Blob([content], { type: 'text/plain' })
      formData.append('file', textBlob, 'content.txt')

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FILE_VALIDATE), {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        if (!result.is_valid) {
          showNotification(
            `Warning: The uploaded content doesn't seem to match "${taskType}". Please verify your task type.`,
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

  // Calculate price using advanced algorithm
  const calculatePrice = () => {
    if (!institutionLevel) {
      showNotification('Please select academic level first', 'error')
      return
    }

    let basePrice = 0

    // Base pricing by level
    if (institutionLevel === 'Level 100' || institutionLevel === 'Level 200') basePrice = 80
    else if (institutionLevel === 'Level 300' || institutionLevel === 'Level 400') basePrice = 250
    else if (institutionLevel === 'MSc' || institutionLevel === 'PhD') basePrice = 450

    // Task type modifiers
    if (taskType.includes('Final Year Project')) basePrice += 200
    if (taskType.includes('AI') || taskType.includes('Machine Learning')) basePrice += 150
    if (taskType.includes('Web Development')) basePrice += 100
    if (taskType.includes('Database')) basePrice += 75

    // Urgency modifiers
    if (urgency === 'urgent') basePrice += 100
    if (urgency === 'very-urgent') basePrice += 200

    // Complexity modifiers
    if (complexity === 'high') basePrice += 100
    if (complexity === 'medium') basePrice += 50

    // Page count modifiers (for research/documentation tasks)
    if (['Research', 'Assignment', 'Thesis', 'Dissertation'].includes(taskType) && numPages) {
      if (numPages > 10) basePrice += 50
      if (numPages > 20) basePrice += 100
    }

    // Technology stack modifiers (for coding tasks)
    if (['Coding Project', 'App Development', 'Web Development', 'AI/ML Project'].includes(taskType)) {
      basePrice += programmingLanguages.length * 25
      basePrice += frameworks.length * 50
      basePrice += databases.length * 40
    }

    // Special requirements
    if (requiresHosting) basePrice += 50
    if (uiDesignRequired) basePrice += 75
    if (plagiarismCheck) basePrice += 10

    // Discounts
    if (basePrice > 500) basePrice *= 0.97
    if (basePrice > 800) basePrice *= 0.955

    setPrice(Math.round(basePrice))
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
    if (!taskType || !institutionLevel || !title) {
      showNotification('Please fill in all required fields.', 'error')
      return
    }

    if (['Coding Project', 'App Development', 'Web Development', 'AI/ML Project'].includes(taskType) && programmingLanguages.length === 0) {
      showNotification('Please select at least one programming language for coding tasks.', 'error')
      return
    }

    if (['Research', 'Assignment', 'Thesis', 'Dissertation'].includes(taskType) && !numPages) {
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
        title,
        description,
        taskType,
        institutionLevel,
        institutionType,
        courseName,
        urgency,
        complexity,
        deadline,
        numPages: numPages || 0,
        programmingLanguages: programmingLanguages.join(', '),
        frameworks: frameworks.join(', '),
        databases: databases.join(', '),
        requiresHosting,
        uiDesignRequired,
        deliveryFormat,
        referenceStyle,
        plagiarismCheck,
        chaptersIncluded: chaptersIncluded.join(', '),
        estimatedPrice: price || 0,
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
      setTitle('')
      setDescription('')
      setTaskType('')
      setInstitutionLevel('')
      setInstitutionType('')
      setCourseName('')
      setDeadline('')
      setUrgency('')
      setComplexity('medium')
      setNumPages('')
      setProgrammingLanguages([])
      setFrameworks([])
      setDatabases([])
      setRequiresHosting(false)
      setUiDesignRequired(false)
      setDeliveryFormat('')
      setReferenceStyle('')
      setPlagiarismCheck(false)
      setChaptersIncluded([])
      setFile(null)
      setFileText('')
      setPrice(null)

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
                {/* Basic Required Fields Section */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">📋 Basic Information</h3>
                  
                  {/* Task Title */}
                  <div className="mb-4">
                    <label className="block font-semibold text-gray-700 mb-2">Task Title *</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., E-commerce Website with Payment Integration"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Task Description */}
                  <div className="mb-4">
                    <label className="block font-semibold text-gray-700 mb-2">Task Description *</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                      placeholder="Describe what you need to be done..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Task Type */}
                  <div className="mb-4">
                    <label className="block font-semibold text-gray-700 mb-2">Task Type *</label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      value={taskType}
                      onChange={e => setTaskType(e.target.value)}
                    >
                      <option value="">Select Task Type</option>
                      <option value="Assignment">Assignment</option>
                      <option value="Coding Project">Coding Project</option>
                      <option value="Mini Project">Mini Project</option>
                      <option value="Research">Research</option>
                      <option value="App Development">App Development</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Database Assignment">Database Assignment</option>
                      <option value="AI/ML Project">AI/ML Project</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="Desktop Application">Desktop Application</option>
                      <option value="Final Year Project">Final Year Project</option>
                      <option value="Thesis">Thesis</option>
                      <option value="Dissertation">Dissertation</option>
                    </select>
                  </div>

                  {/* Institution Level */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Academic Level *</label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={institutionLevel}
                      onChange={e => setInstitutionLevel(e.target.value)}
                    >
                      <option value="">Select Level</option>
                      <option value="Diploma">Diploma</option>
                      <option value="HND">HND</option>
                      <option value="Level 100">Level 100</option>
                      <option value="Level 200">Level 200</option>
                      <option value="Level 300">Level 300</option>
                      <option value="Level 400">Level 400</option>
                      <option value="MSc">MSc</option>
                      <option value="MPhil">MPhil</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>

                  {/* Institution Type */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Institution Type</label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={institutionType}
                      onChange={e => setInstitutionType(e.target.value)}
                    >
                      <option value="">Select Institution Type</option>
                      <option value="Public University">Public University</option>
                      <option value="Technical University">Technical University</option>
                      <option value="Private University">Private University</option>
                      <option value="Polytechnic">Polytechnic</option>
                      <option value="College">College</option>
                    </select>
                  </div>

                  {/* Course Name */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Course Title</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Computer Science"
                      value={courseName}
                      onChange={e => setCourseName(e.target.value)}
                    />
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Deadline *</label>
                    <input 
                      type="date" 
                      min={getMinDate()}
                      value={deadline} 
                      onChange={e => setDeadline(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Coding/Software/App/Web Task Fields - Conditional Section */}
                {taskType && ['Coding Project', 'App Development', 'Web Development', 'AI/ML Project', 'Mobile App', 'Desktop Application'].includes(taskType) && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">💻 Technical Requirements</h3>
                    
                    {/* Programming Languages */}
                    <div className="mb-4">
                      <label className="block font-semibold text-gray-700 mb-2">Programming Languages *</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'SQL'].map(lang => (
                          <label key={lang} className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={programmingLanguages.includes(lang)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setProgrammingLanguages([...programmingLanguages, lang])
                                } else {
                                  setProgrammingLanguages(programmingLanguages.filter(l => l !== lang))
                                }
                              }}
                            />
                            <span className="text-sm">{lang}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Frameworks */}
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">Frameworks & Libraries</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {['React', 'Vue.js', 'Angular', 'Laravel', 'Django', 'Flask', 'Express.js', 'Spring Boot', 'ASP.NET', 'Flutter', 'React Native'].map(framework => (
                          <label key={framework} className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={frameworks.includes(framework)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setFrameworks([...frameworks, framework])
                                } else {
                                  setFrameworks(frameworks.filter(f => f !== framework))
                                }
                              }}
                            />
                            <span className="text-sm">{framework}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Databases */}
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">Databases</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Firebase', 'Redis', 'Oracle', 'SQL Server'].map(db => (
                          <label key={db} className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={databases.includes(db)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setDatabases([...databases, db])
                                } else {
                                  setDatabases(databases.filter(d => d !== db))
                                }
                              }}
                            />
                            <span className="text-sm">{db}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={requiresHosting}
                            onChange={e => setRequiresHosting(e.target.checked)}
                          />
                          <span className="font-semibold">Requires Hosting/Deployment</span>
                        </label>
                        <p className="text-sm text-gray-600 ml-6">Live deployment needed</p>
                      </div>

                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={uiDesignRequired}
                            onChange={e => setUiDesignRequired(e.target.checked)}
                          />
                          <span className="font-semibold">UI/UX Design Required</span>
                        </label>
                        <p className="text-sm text-gray-600 ml-6">Custom design needed</p>
                      </div>
                    </div>

                    {/* Delivery Format */}
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">Preferred Delivery Format</label>
                      <select 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={deliveryFormat}
                        onChange={e => setDeliveryFormat(e.target.value)}
                      >
                        <option value="">Select Format</option>
                        <option value="Zip File">Zip File Download</option>
                        <option value="GitHub Repository">GitHub Repository</option>
                        <option value="Hosted URL">Hosted URL (Live Site)</option>
                        <option value="Executable">Executable Application</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Research/Documentation Task Fields - Conditional Section */}
                {taskType && ['Research', 'Assignment', 'Thesis', 'Dissertation', 'Final Year Project'].includes(taskType) && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-800 mb-4">📚 Research & Documentation</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Number of Pages */}
                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">Number of Pages</label>
                        <input
                          type="number"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 10"
                          value={numPages}
                          onChange={e => setNumPages(e.target.value ? parseInt(e.target.value) : '')}
                          min="1"
                        />
                      </div>

                      {/* Reference Style */}
                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">Reference Style</label>
                        <select 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={referenceStyle}
                          onChange={e => setReferenceStyle(e.target.value)}
                        >
                          <option value="">Select Style</option>
                          <option value="APA">APA Style</option>
                          <option value="MLA">MLA Style</option>
                          <option value="IEEE">IEEE Style</option>
                          <option value="Harvard">Harvard Style</option>
                          <option value="Chicago">Chicago Style</option>
                        </select>
                      </div>

                      {/* Plagiarism Check */}
                      <div className="flex items-center justify-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={plagiarismCheck}
                            onChange={e => setPlagiarismCheck(e.target.checked)}
                          />
                          <span className="font-semibold">Include Plagiarism Check (+₵10)</span>
                        </label>
                      </div>
                    </div>

                    {/* Chapters/Sections */}
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">Required Chapters/Sections</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {['Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'References', 'Appendices'].map(chapter => (
                          <label key={chapter} className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={chaptersIncluded.includes(chapter)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setChaptersIncluded([...chaptersIncluded, chapter])
                                } else {
                                  setChaptersIncluded(chaptersIncluded.filter(c => c !== chapter))
                                }
                              }}
                            />
                            <span className="text-sm">{chapter}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Urgency Display */}
                {urgency && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <label className="block font-semibold text-gray-700 mb-2">Urgency (Auto-calculated)</label>
                    <div className={`p-3 rounded-lg border-2 ${
                      urgency === 'very-urgent' ? 'bg-red-50 border-red-200 text-red-700' :
                      urgency === 'urgent' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                      urgency === 'standard' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                      'bg-green-50 border-green-200 text-green-700'
                    }`}>
                      <span className="font-medium">
                        {urgency === 'very-urgent' && '🔴 Very Urgent (≤1 day)'}
                        {urgency === 'urgent' && '🟠 Urgent (2-3 days)'}
                        {urgency === 'standard' && '🟡 Standard (4-7 days)'}
                        {urgency === 'flexible' && '🟢 Flexible (7+ days)'}
                      </span>
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
                    <div className="mt-4">
                      <label className="block font-semibold text-gray-700 mb-2">Content Preview</label>
                      <div className="bg-white border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                        <p className="text-sm text-gray-600">{fileText.substring(0, 500)}...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing Section */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    💰 Project Pricing
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <button 
                      type="button" 
                      onClick={calculatePrice} 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Calculate Project Cost
                    </button>
                  </div>

                  {/* Price Display */}
                  {price !== null && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-700">Estimated Price:</span>
                        <span className="text-xl font-bold text-green-600">
                          ₵{price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !taskType || !institutionLevel || !complexity || !deadline || !file}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      <span className="flex items-center justify-center">
                        🚀 Submit Task {price !== null ? ` (₵${price.toFixed(2)})` : ''}
                        <span className="ml-2">→</span>
                      </span>
                    )}
                  </button>
                  
                  {(!taskType || !institutionLevel || !complexity || !deadline || !file) && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Please fill in all required fields to submit your task
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
} 