import { NextApiRequest, NextApiResponse } from 'next'
import { PricingController } from '../../../controllers/pricingController'
import { authenticateToken } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return authenticateToken(req as any, res, () => {
    switch (req.method) {
      case 'GET':
        return PricingController.getUserCourseAccess(req, res)
      
      case 'POST':
        return PricingController.grantCourseAccess(req, res)
      
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: 'Only GET, POST methods are allowed'
        })
    }
  })
} 