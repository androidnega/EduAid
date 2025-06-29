// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// API client for FastAPI backend integration
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export interface TaskDetails {
  task_title: string;
  task_type: string;
  institution_level: string;
  course_subject: string;
  deadline: string;
  description: string;
  page_count?: number;
  complexity: string;
  languages?: string[];
  frameworks?: string[];
  database?: string;
  hosting_required?: boolean;
  is_group_project?: boolean;
  file_content?: string;
}

export interface PriceResponse {
  price: string;
  breakdown: {
    base_price: string;
    modifiers: Record<string, number>;
    multiplier: number;
    ai_suggested: string;
  };
  justification: string;
}

export interface ValidationResponse {
  is_valid: boolean;
  confidence: string;
  extracted_text: string;
  metadata: {
    filename: string;
    size: number;
    type: string;
    pages: number;
    word_count: number;
  };
  analysis: {
    suggested_task_type: string;
    complexity: string;
    keyword_scores: Record<string, number>;
    word_count: number;
    estimated_pages: number;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  private async fetchWithErrorHandling(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      throw error;
    }
  }

  // AI Price Calculation
  async calculatePrice(taskDetails: TaskDetails): Promise<PriceResponse> {
    const response = await this.fetchWithErrorHandling('/api/price/', {
      method: 'POST',
      body: JSON.stringify(taskDetails),
    });

    return response.json();
  }

  // File Upload and Processing
  async uploadFile(file: File): Promise<ValidationResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/file/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Content Validation
  async validateContent(content: string, expectedCategory: string) {
    const response = await this.fetchWithErrorHandling('/api/file/validate-content', {
      method: 'POST',
      body: JSON.stringify({
        content,
        expected_category: expectedCategory,
      }),
    });

    return response.json();
  }

  // Health Check
  async healthCheck() {
    const response = await this.fetchWithErrorHandling('/health');
    return response.json();
  }

  // Test AI Connection
  async testAi() {
    const response = await this.fetchWithErrorHandling('/api/test-ai');
    return response.json();
  }

  // Test Services
  async testPricingService() {
    const response = await this.fetchWithErrorHandling('/api/price/test');
    return response.json();
  }

  async testFileService() {
    const response = await this.fetchWithErrorHandling('/api/file/test');
    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Helper function for error handling in components
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Legacy support for existing code (gradually migrate away from this)
export async function generatePriceFromAI(taskDetails: Partial<TaskDetails>): Promise<string> {
  try {
    const response = await apiClient.calculatePrice({
      task_title: taskDetails.task_title || 'Untitled Task',
      task_type: taskDetails.task_type || 'General',
      institution_level: taskDetails.institution_level || 'Level 100',
      course_subject: taskDetails.course_subject || 'Computer Science',
      deadline: taskDetails.deadline || '1 week',
      description: taskDetails.description || '',
      page_count: taskDetails.page_count || 1,
      complexity: taskDetails.complexity || 'medium',
      languages: taskDetails.languages || [],
      frameworks: taskDetails.frameworks || [],
      database: taskDetails.database,
      hosting_required: taskDetails.hosting_required || false,
      is_group_project: taskDetails.is_group_project || false,
      file_content: taskDetails.file_content,
    });

    return response.price;
  } catch (error) {
    console.error('Price generation error:', error);
    throw error;
  }
} 