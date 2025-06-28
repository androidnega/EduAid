import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface TaskDetails {
  category: string
  level: string
  urgency: string
  pageCount: number
  complexity: string
  language: string
  description?: string
  fileContent?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const taskDetails: TaskDetails = req.body

  if (!taskDetails.category || !taskDetails.level || !taskDetails.urgency || !taskDetails.complexity) {
    return res.status(400).json({ error: 'Missing required task details' })
  }

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
    res.status(200).json({ price: aiPrice || '₵0.00' })
  } catch (error) {
    console.error('OpenAI API Error:', error)
    res.status(500).json({ error: 'Failed to generate AI price suggestion' })
  }
} 