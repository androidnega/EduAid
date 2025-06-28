import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false, // Use server-side only for security
})

export interface TaskDetails {
  category: string
  level: string
  urgency: string
  pageCount: number
  complexity: string
  language: string
  description?: string
  fileContent?: string
}

export async function generatePriceFromAI(taskDetails: TaskDetails): Promise<string> {
  const prompt = `
Please analyze this I.T. academic task and suggest a fair price in Ghana Cedis (₵) for Ghanaian university students:

Task Category: ${taskDetails.category}
Academic Level: ${taskDetails.level}
Urgency: ${taskDetails.urgency}
Page Count: ${taskDetails.pageCount}
Technical Complexity: ${taskDetails.complexity}
Programming Language: ${taskDetails.language}
Description: ${taskDetails.description || 'Not provided'}
${taskDetails.fileContent ? `File Content Preview: ${taskDetails.fileContent.substring(0, 500)}...` : ''}

PRICING GUIDELINES:
- Level 100-200: ₵11.99 - ₵250 (basic assignments)
- Level 300-400: ₵150 - ₵899 (intermediate projects)
- Masters & PhD: ₵350 - ₵1500 (advanced research)

MODIFIERS:
- High Urgency (24-48 hours): +₵100
- Medium Urgency (3-7 days): +₵50
- Page Count > 10: +₵50
- Complex/AI projects: +₵100-300
- Simple projects: -₵50

DISCOUNTS:
- 3% off if price > ₵500
- 4.5% off if exactly ₵899
- No discount for under ₵100

Please provide ONLY the final price in this format: ₵XXX.XX
Consider the student-friendly pricing while ensuring fair compensation for the work complexity.
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using more cost-effective model
      messages: [
        {
          role: 'system',
          content: 'You are a pricing assistant for academic I.T. tasks in Ghana. Provide student-friendly but fair pricing based on task complexity, academic level, and local economic conditions. Always respond with just the price in Ghana Cedis format: ₵XXX.XX',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 50,
      temperature: 0.3, // Lower temperature for more consistent pricing
    })

    const aiPrice = response.choices[0]?.message.content?.trim()
    return aiPrice || '₵0.00'
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw new Error('Failed to generate AI price suggestion')
  }
}

// Helper function to extract text from uploaded files
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type

  try {
    if (fileType === 'application/pdf') {
      // For PDF files, we'd need to implement PDF parsing
      // For now, return file info
      return `PDF file: ${file.name} (${file.size} bytes)`
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For DOCX files
      return `DOCX file: ${file.name} (${file.size} bytes)`
    } else if (fileType === 'text/plain') {
      // For text files
      const text = await file.text()
      return text.substring(0, 1000) // First 1000 characters
    } else {
      return `File: ${file.name} (${file.size} bytes, ${fileType})`
    }
  } catch (error) {
    console.error('File parsing error:', error)
    return `File: ${file.name} (parsing failed)`
  }
} 