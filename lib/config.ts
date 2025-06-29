// API Configuration for EduAid Platform
export const API_CONFIG = {
  // FastAPI Backend URL
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8001',
  
  // API Endpoints
  ENDPOINTS: {
    HEALTH: '/health',
    PRICE: '/api/price/',
    PRICE_TEST: '/api/price/test',
    FILE_UPLOAD: '/api/file/upload',
    FILE_VALIDATE: '/api/file/validate',
  },
  
  // Request timeouts
  TIMEOUT: {
    HEALTH_CHECK: 3000,
    API_REQUEST: 30000,
    FILE_UPLOAD: 60000,
  }
}

// Helper function to build full API URLs
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`
}

// Helper function to check if we're using the local development backend
export const isLocalBackend = (): boolean => {
  return API_CONFIG.BACKEND_URL.includes('localhost') || API_CONFIG.BACKEND_URL.includes('127.0.0.1')
} 