import { NextApiRequest, NextApiResponse } from 'next'
import { AuthController } from '../../../controllers/authController'

const authController = new AuthController()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Only POST method is allowed'
    })
  }

  return authController.signin(req, res)
} 