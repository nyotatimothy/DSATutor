import { NextApiRequest, NextApiResponse } from 'next'
import { PricingController } from '../../../controllers/pricingController'
import { authenticateToken, requireSuperAdmin } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return authenticateToken(req as any, res, () => {
    return requireSuperAdmin(req as any, res, () => {
      switch (req.method) {
        case 'GET':
          return PricingController.getPricingAnalytics(req, res)
        
        default:
          return res.status(405).json({
            success: false,
            error: 'Method not allowed',
            message: 'Only GET method is allowed'
          })
      }
    })
  })
} 