// DEPRECATED: This file is kept for backward compatibility
// New implementations should use lib/api.ts instead

import { apiClient } from './api'

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
  // Use the new FastAPI backend for price calculation
  try {
    const response = await apiClient.calculatePrice({
      task_title: `${taskDetails.category} Task`,
      task_type: taskDetails.category,
      institution_level: taskDetails.level,
      course_subject: 'Computer Science', // Default value
      deadline: taskDetails.urgency,
      description: taskDetails.description || '',
      page_count: taskDetails.pageCount,
      complexity: taskDetails.complexity,
      languages: taskDetails.language ? [taskDetails.language] : [],
      frameworks: [],
      hosting_required: false,
      is_group_project: false,
      file_content: taskDetails.fileContent,
    });

    return response.price;
  } catch (error) {
    console.error('FastAPI Backend Error:', error)
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