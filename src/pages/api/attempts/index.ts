import { NextApiRequest, NextApiResponse } from 'next'
import { AttemptController } from '../../../controllers/attemptController'
import { authenticateToken } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware
  return authenticateToken(req as any, res, () => {
    // Continue with the request
    switch (req.method) {
      case 'GET':
        return AttemptController.getUserAttempts(req, res)
      
      case 'POST':
        return AttemptController.createAttempt(req, res)
      
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        })
    }
  })
} 
 