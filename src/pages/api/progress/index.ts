import { NextApiRequest, NextApiResponse } from 'next'
import { ProgressController } from '../../../controllers/progressController'
import { authenticateToken } from '../../../middlewares/auth'
import { prisma } from '../../../lib/prisma'

// Topic ID mapping from curriculum to database
const topicIdMapping: { [curriculumId: string]: string } = {
  'arrays-hashing': 'arrays-hashing-topic',
  'two-pointers': 'two-pointers-topic',
  'stack': 'stack-topic',
  'binary-search': 'binary-search-topic',
  'sliding-window': 'sliding-window-topic',
  'linked-list': 'linked-list-topic',
  'trees': 'trees-topic',
  'tries': 'tries-topic',
  'heap': 'heap-topic',
  'backtracking': 'backtracking-topic',
  'graphs': 'graphs-topic',
  'dp': 'dp-topic',
}

// Helper function to get or create topic
async function getOrCreateTopic(curriculumId: string, title: string) {
  // First try to find existing topic with the mapped ID
  let topic = await prisma.topic.findFirst({
    where: {
      OR: [
        { id: topicIdMapping[curriculumId] },
        { title: title }
      ]
    }
  })

  if (!topic) {
    // Create a new topic if it doesn't exist
    // First get or create a default course
    let course = await prisma.course.findFirst({
      where: { title: 'DSA Fundamentals' }
    })

    if (!course) {
      course = await prisma.course.create({
        data: {
          title: 'DSA Fundamentals',
          description: 'Core Data Structures and Algorithms',
          createdBy: 'system', // You might want to use an actual user ID
          isActive: true,
          isPremium: false
        }
      })
    }

    topic = await prisma.topic.create({
      data: {
        id: topicIdMapping[curriculumId] || curriculumId,
        title: title,
        description: `${title} - Core DSA topic`,
        order: 0,
        courseId: course.id
      }
    })
  }

  return topic
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware
  await authenticateToken(req, res, () => {
    // This will be called if authentication succeeds
  })

  // Check if user is attached to request
  if (!(req as any).user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Please provide a valid authentication token'
    })
  }

  switch (req.method) {
    case 'GET':
      return ProgressController.getUserProgress(req, res)
    case 'POST':
      return handleCreateProgress(req, res)
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        message: 'Only GET and POST methods are allowed'
      })
  }
}

async function handleCreateProgress(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = (req as any).user?.id
    const { topicId, status } = req.body as {
      topicId: string
      status: string
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      })
    }

    // Validation
    if (!topicId) {
      return res.status(400).json({
        success: false,
        error: 'Topic ID is required'
      })
    }

    if (!status || !['not_started', 'in_progress', 'complete'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be not_started, in_progress, or complete'
      })
    }

    // Get or create the topic
    const topicTitle = topicId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
    
    const topic = await getOrCreateTopic(topicId, topicTitle)

    // Check if progress already exists
    const existingProgress = await prisma.progress.findFirst({
      where: {
        userId,
        topicId: topic.id
      }
    })

    let progress
    if (existingProgress) {
      // Update existing progress
      progress = await prisma.progress.update({
        where: { id: existingProgress.id },
        data: {
          status,
          updatedAt: new Date()
        },
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              order: true,
              course: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        }
      })
    } else {
      // Create new progress
      progress = await prisma.progress.create({
        data: {
          userId,
          topicId: topic.id,
          status,
          updatedAt: new Date()
        },
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              order: true,
              course: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        }
      })
    }

    return res.status(200).json({
      success: true,
      data: { progress }
    })
  } catch (error) {
    console.error('Create progress error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
} 
 