import { NextApiRequest, NextApiResponse } from 'next'
import { AuthController } from '../../../controllers/authController'
import { authenticateToken, AuthenticatedRequest } from '../../../middlewares/auth'

const authController = new AuthController()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware
  return authenticateToken(req as AuthenticatedRequest, res, () => {
    switch (req.method) {
      case 'GET':
        return authController.getProfile(req as AuthenticatedRequest, res)
      case 'PUT':
        return authController.updateProfile(req as AuthenticatedRequest, res)
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: 'Only GET and PUT methods are allowed'
        })
    }
  })
} 