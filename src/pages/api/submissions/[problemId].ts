import { NextApiRequest, NextApiResponse } from 'next'
import { SubmissionController } from '../../../controllers/submissionController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await SubmissionController.getUserSubmissions(req, res)
      
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
} 