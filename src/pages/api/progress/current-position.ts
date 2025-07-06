import { NextApiRequest, NextApiResponse } from 'next'
import { ProgressController } from '../../../controllers/progressController'
import { authenticateToken } from '../../../middlewares/auth'
import { prisma } from '../../../lib/prisma'

// Topic ID mapping from curriculum to database (same as in index.ts)
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

// Helper function to map database topic ID back to curriculum ID
function mapTopicIdToCurriculumId(dbTopicId: string): string {
  for (const [curriculumId, mappedId] of Object.entries(topicIdMapping)) {
    if (mappedId === dbTopicId) {
      return curriculumId
    }
  }
  return dbTopicId // Return as-is if no mapping found
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
      return getCurrentPosition(req, res)
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        message: 'Only GET method is allowed'
      })
  }
}

async function getCurrentPosition(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = (req as any).user?.id

    // Get user's progress ordered by last updated
    const progress = await prisma.progress.findMany({
      where: { userId },
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Find the most recent in-progress or not_started topic
    let currentTopic = null
    let nextTopic = null

    // First, look for in-progress topics
    const inProgressTopic = progress.find((p: any) => p.status === 'in_progress')
    if (inProgressTopic) {
      currentTopic = inProgressTopic
    } else {
      // If no in-progress, look for the first not_started topic
      const notStartedTopic = progress.find((p: any) => p.status === 'not_started')
      if (notStartedTopic) {
        currentTopic = notStartedTopic
      } else {
        // If all topics are completed, get the last completed topic
        const lastCompletedTopic = progress.find((p: any) => p.status === 'complete')
        if (lastCompletedTopic) {
          currentTopic = lastCompletedTopic
        }
      }
    }

    // Get curriculum data for fallback
    let curriculumData = null
    if (typeof window !== 'undefined') {
      const curriculumRaw = localStorage.getItem('dsatutor_latest_curriculum')
      if (curriculumRaw) {
        try {
          curriculumData = JSON.parse(curriculumRaw)
        } catch (e) {
          console.error('Error parsing curriculum data:', e)
        }
      }
    }

    // If no progress exists, return curriculum start
    if (!currentTopic && curriculumData) {
      return res.status(200).json({
        success: true,
        data: {
          currentTopic: null,
          nextTopic: curriculumData.topics?.[0] || null,
          hasProgress: false,
          redirectTo: '/curriculum'
        }
      })
    }

    // Find next topic in sequence
    if (currentTopic) {
      const currentOrder = currentTopic.topic.order
      nextTopic = progress.find((p: any) => p.topic.order === currentOrder + 1)
    }

    return res.status(200).json({
      success: true,
      data: {
        currentTopic,
        nextTopic,
        hasProgress: progress.length > 0,
        redirectTo: currentTopic ? `/problems/${mapTopicIdToCurriculumId(currentTopic.topic.id)}/solve` : '/curriculum'
      }
    })

  } catch (error) {
    console.error('Get current position error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get current learning position'
    })
  }
} 