import { NextApiRequest, NextApiResponse } from 'next'
import AIController from '../../../controllers/aiController'
import { authenticateToken } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware
  await authenticateToken(req, res, () => {
    // This will be called if authentication succeeds
  })

  // Check if user is attached to request
  if (!(req as any).user) {
    return // Response already sent by middleware
  }

  switch (req.method) {
    case 'POST':
      return AIController.generatePracticeProblem(req, res)
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        message: 'Only POST method is allowed'
      })
  }
} 