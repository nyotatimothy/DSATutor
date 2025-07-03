import { NextApiRequest, NextApiResponse } from 'next'
import AIController from '../../../controllers/aiController'
import { authMiddleware } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Only POST method is allowed'
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

    // Handle enhanced code analysis
    return await AIController.enhancedAnalyzeCode(req, res)
  } catch (error) {
    console.error('Enhanced analyze API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process enhanced code analysis'
    })
  }
} 