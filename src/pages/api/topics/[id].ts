import { NextApiRequest, NextApiResponse } from 'next'
import { TopicController } from '../../../controllers/topicController'
import { authenticateToken } from '../../../middlewares/auth'

const topicController = new TopicController()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      return topicController.getTopic(req, res)
    
    case 'PUT':
      return authenticateToken(req, res, () => topicController.updateTopic(req, res))
    
    case 'DELETE':
      return authenticateToken(req, res, () => topicController.deleteTopic(req, res))
    
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        message: `Method ${method} not allowed`
      })
  }
} 