import { NextApiRequest, NextApiResponse } from 'next'
import { PricingController } from '../../../../controllers/pricingController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return PricingController.getSubscriptionPlan(req, res)
    
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        message: 'Only GET method is allowed'
      })
  }
} 