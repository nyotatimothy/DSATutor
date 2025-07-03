import { NextApiRequest, NextApiResponse } from 'next'
import { PaymentController } from '../../../controllers/paymentController'
import { authenticateToken } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware
  authenticateToken(req as any, res, () => {
    // Continue with the request
    switch (req.method) {
      case 'GET':
        return PaymentController.getPaymentStats(req, res)
      
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        })
    }
  })
} 
 
import { PaymentController } from '../../../controllers/paymentController'
import { authenticateToken } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware
  authenticateToken(req as any, res, () => {
    // Continue with the request
    switch (req.method) {
      case 'GET':
        return PaymentController.getPaymentStats(req, res)
      
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        })
    }
  })
} 
 