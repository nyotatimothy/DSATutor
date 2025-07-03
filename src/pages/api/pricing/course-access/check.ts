import { NextApiRequest, NextApiResponse } from 'next'
import { PricingController } from '../../../../controllers/pricingController'
import { authenticateToken } from '../../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return authenticateToken(req as any, res, () => {
    switch (req.method) {
      case 'GET':
        return PricingController.checkCourseAccess(req, res)
      
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: 'Only GET method is allowed'
        })
    }
  })
} 