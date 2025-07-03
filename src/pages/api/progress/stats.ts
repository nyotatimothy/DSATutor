import { NextApiRequest, NextApiResponse } from 'next'
import { ProgressController } from '../../../controllers/progressController'
import { authenticateToken } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware
  authenticateToken(req as any, res, () => {
    // Continue with the request
    switch (req.method) {
      case 'GET':
        return ProgressController.getProgressStats(req, res)
      
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        })
    }
  })
} 
 
import { ProgressController } from '../../../controllers/progressController'
import { authenticateToken } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware
  authenticateToken(req as any, res, () => {
    // Continue with the request
    switch (req.method) {
      case 'GET':
        return ProgressController.getProgressStats(req, res)
      
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        })
    }
  })
} 
 