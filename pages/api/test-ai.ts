import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check if API key is loaded
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenAI API key not found',
        env_check: 'OPENAI_API_KEY is not set in environment variables'
      })
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // Simple test call
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Say "Hello from Ghana!" in exactly 3 words.',
        },
      ],
      max_tokens: 10,
      temperature: 0.1,
    })

    const result = response.choices[0]?.message.content?.trim()

    res.status(200).json({ 
      success: true,
      api_key_loaded: !!apiKey,
      api_key_prefix: apiKey.substring(0, 20) + '...',
      openai_response: result,
      message: 'OpenAI API is working correctly!'
    })

  } catch (error: any) {
    console.error('OpenAI Test Error:', error)
    res.status(500).json({ 
      error: 'OpenAI API test failed',
      details: error.message || 'Unknown error',
      type: error.constructor.name
    })
  }
} 