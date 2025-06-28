import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ValidationRequest {
  content: string
  expectedCategory: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { content, expectedCategory }: ValidationRequest = req.body

  if (!content || !expectedCategory) {
    return res.status(400).json({ error: 'Missing content or category' })
  }

  const prompt = `
You are an academic document validator for a Ghanaian university I.T. platform.

Analyze the following document content and determine if it matches the expected task category: "${expectedCategory}"

Document content:
"${content}"

Consider these I.T. task categories:
- Coding Assignment: Contains code, programming concepts, software development tasks
- Web Development Task: HTML, CSS, JavaScript, web frameworks, responsive design
- Database Assignment: SQL, database design, data modeling, queries
- Networking Work: Network protocols, security, infrastructure, routing
- AI/Machine Learning Project: Algorithms, data science, machine learning models
- Mobile App Development: iOS, Android, Flutter, mobile frameworks
- Mini Project (I.T): Small-scale I.T. projects, prototypes
- Final Year Project (I.T): Large-scale capstone projects, research
- Theory/Research Task: Academic papers, literature review, theoretical concepts

IMPORTANT:
- Return ONLY "yes" if the content clearly matches the expected category
- Return ONLY "no" if the content doesn't match or seems unrelated
- Be strict but fair in your validation
- Consider partial matches as valid if core concepts align
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a document validator. Respond with only "yes" or "no" based on whether the content matches the expected category.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 10,
      temperature: 0.1, // Very low temperature for consistent results
    })

    const result = response.choices[0]?.message.content?.trim().toLowerCase()
    const isValid = result === 'yes'

    res.status(200).json({ 
      isValid,
      confidence: isValid ? 'high' : 'low'
    })
  } catch (error) {
    console.error('OpenAI validation error:', error)
    res.status(500).json({ error: 'Failed to validate content' })
  }
} 