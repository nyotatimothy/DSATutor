import { NextApiRequest, NextApiResponse } from 'next'
import AIController from '../../../controllers/aiController'
import { authMiddleware } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Only GET method is allowed'
    })
  }

  try {
    // Apply authentication middleware
    const authResult = await authMiddleware(req, res)
    if (!authResult.success) {
      return res.status(401).json(authResult)
    }

    // Add user to request
    ;(req as any).user = authResult.user

    // Handle learning path history retrieval
    return await AIController.getLearningPathHistory(req, res)
  } catch (error) {
    console.error('Learning path history API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get learning path history'
    })
  }
} 