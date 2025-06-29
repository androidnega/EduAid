import type { NextApiRequest, NextApiResponse } from 'next'

// DEPRECATED: This API route is kept for backward compatibility
// New implementations should use the FastAPI backend directly
// This route now acts as a proxy to the FastAPI backend

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

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

  // Proxy request to FastAPI backend
  try {
    const backendPayload = {
      task_title: `${taskDetails.category} Task`,
      task_type: taskDetails.category,
      institution_level: taskDetails.level,
      course_subject: 'Computer Science',
      deadline: taskDetails.urgency,
      description: taskDetails.description || '',
      page_count: taskDetails.pageCount,
      complexity: taskDetails.complexity,
      languages: taskDetails.language ? [taskDetails.language] : [],
      frameworks: [],
      hosting_required: false,
      is_group_project: false,
      file_content: taskDetails.fileContent,
    };

    const response = await fetch(`${BACKEND_URL}/api/price/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      throw new Error(`FastAPI Backend Error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json({ price: data.price || '₵0.00' });
  } catch (error) {
    console.error('FastAPI Backend Error:', error);
    res.status(500).json({ error: 'Failed to generate AI price suggestion' });
  }
} 