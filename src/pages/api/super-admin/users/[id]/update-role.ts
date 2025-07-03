import { NextApiRequest, NextApiResponse } from 'next'
import SuperAdminController from '../../../../../controllers/superAdminController'
import { authenticateSuperAdmin } from '../../../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Only PUT method is allowed'
    })
  }

  try {
    // Authenticate super admin
    const authResult = await authenticateSuperAdmin(req, res)
    if (!authResult.success) {
      return res.status(401).json(authResult)
    }

    return await SuperAdminController.updateUserRole(req, res)
  } catch (error) {
    console.error('Error in update user role:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update user role'
    })
  }
} 