import type { NextApiRequest, NextApiResponse } from 'next'
import { API_CONFIG, getApiUrl } from '../../lib/config'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Test FastAPI backend connectivity
    const healthResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.HEALTH))
    
    if (!healthResponse.ok) {
      throw new Error('Backend not responding')
    }

    const healthData = await healthResponse.json()

    // Test pricing service
    const priceTestResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PRICE_TEST))
    const priceTestData = await priceTestResponse.json()

    res.status(200).json({
      status: 'success',
      message: 'FastAPI backend is connected and working',
      backend_url: API_CONFIG.BACKEND_URL,
      health_check: healthData,
      pricing_service: priceTestData,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to FastAPI backend',
      error: error.message,
      backend_url: API_CONFIG.BACKEND_URL,
      timestamp: new Date().toISOString()
    })
  }
} 