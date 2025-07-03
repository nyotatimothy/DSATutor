import { NextApiRequest, NextApiResponse } from 'next'
import { CourseController } from '../../../controllers/courseController'
import { authenticateToken } from '../../../middlewares/auth'

const courseController = new CourseController()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      return courseController.getCourse(req, res)
    
    case 'PUT':
      return authenticateToken(req, res, () => courseController.updateCourse(req, res))
    
    case 'DELETE':
      return authenticateToken(req, res, () => courseController.deleteCourse(req, res))
    
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        message: `Method ${method} not allowed`
      })
  }
} 