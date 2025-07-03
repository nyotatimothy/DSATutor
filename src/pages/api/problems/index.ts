import { NextApiRequest, NextApiResponse } from 'next'
import { ProblemController } from '../../../controllers/problemController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await ProblemController.getProblems(req, res)
      
      case 'POST':
        // For MVP, allow all authenticated users to create problems
        return await ProblemController.createProblem(req, res)
      
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
} 