import { NextApiRequest, NextApiResponse } from 'next'
import SuperAdminController from '../../../controllers/superAdminController'
import { authenticateToken, requireSuperAdmin } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware
  return authenticateToken(req as any, res, () => {
    // Check if user is super admin
    return requireSuperAdmin(req as any, res, () => {
      switch (req.method) {
        case 'GET':
          return SuperAdminController.getSystemHealthReport(req, res)
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