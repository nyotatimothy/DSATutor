import { NextApiRequest, NextApiResponse } from 'next'
import SuperAdminController from '../../../controllers/superAdminController'
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

  // Check if user is super admin
  if ((req as any).user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'Super admin privileges required'
    })
  }

  switch (req.method) {
    case 'GET':
      return SuperAdminController.getAuditLogs(req, res)
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        message: 'Only GET method is allowed'
      })
  }
} 