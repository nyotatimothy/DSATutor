import { NextApiRequest, NextApiResponse } from 'next'
import SuperAdminController from '../../../../controllers/superAdminController'
import { authenticateSuperAdmin } from '../../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Only DELETE method is allowed'
    })
  }

  try {
    // Authenticate super admin
    const authResult = await authenticateSuperAdmin(req, res)
    if (!authResult.success) {
      return res.status(401).json(authResult)
    }

    return await SuperAdminController.bulkDeleteUsers(req, res)
  } catch (error) {
    console.error('Error in bulk delete users:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process bulk delete request'
    })
  }
} 