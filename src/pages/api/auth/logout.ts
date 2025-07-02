import { NextApiRequest, NextApiResponse } from 'next'
import { AuthController } from '../../../controllers/authController'
import { authenticateToken, AuthenticatedRequest } from '../../../middlewares/auth'

const authController = new AuthController()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Only POST method is allowed'
    })
  }

  // Apply authentication middleware
  return authenticateToken(req as AuthenticatedRequest, res, () => {
    return authController.logout(req as AuthenticatedRequest, res)
  })
} 