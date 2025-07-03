import { NextApiRequest, NextApiResponse } from 'next'
import SuperAdminController from '../../../../../controllers/superAdminController'
import { authenticateSuperAdmin } from '../../../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Only POST method is allowed'
    })
  }

  try {
    // Authenticate super admin
    const authResult = await authenticateSuperAdmin(req, res)
    if (!authResult.success) {
      return res.status(401).json(authResult)
    }

    return await SuperAdminController.reactivateCourse(req, res)
  } catch (error) {
    console.error('Error in reactivate course:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to reactivate course'
    })
  }
} 