import { NextApiRequest, NextApiResponse } from 'next'
import { TopicController } from '../../../controllers/topicController'
import { authenticateToken } from '../../../middlewares/auth'

const topicController = new TopicController()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'POST':
      return authenticateToken(req, res, () => topicController.reorderTopics(req, res))
    
    default:
      res.setHeader('Allow', ['POST'])
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        message: `Method ${method} not allowed`
      })
  }
} 
 
import { TopicController } from '../../../controllers/topicController'
import { authenticateToken } from '../../../middlewares/auth'

const topicController = new TopicController()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'POST':
      return authenticateToken(req, res, () => topicController.reorderTopics(req, res))
    
    default:
      res.setHeader('Allow', ['POST'])
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        message: `Method ${method} not allowed`
      })
  }
} 
 