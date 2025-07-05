import { NextApiRequest, NextApiResponse } from 'next'
import { ProgressController } from '../../../controllers/progressController'
import { authenticateToken } from '../../../middlewares/auth'
import { prisma } from '../../../lib/prisma'

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
        redirectTo: currentTopic ? `/problems/${currentTopic.topic.id}/solve` : '/curriculum'
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