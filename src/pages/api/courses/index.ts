import { NextApiRequest, NextApiResponse } from 'next'
import { CourseController } from '../../../controllers/courseController'
import { authenticateToken } from '../../../middlewares/auth'

const courseController = new CourseController()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      return courseController.getCourses(req, res)
    
    case 'POST':
      return authenticateToken(req, res, () => courseController.createCourse(req, res))
    
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        message: `Method ${method} not allowed`
      })
  }
} 