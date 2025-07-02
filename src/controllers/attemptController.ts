import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../lib/prisma'

export class AttemptController {
  // Get attempts for a user
  static async getUserAttempts(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { topicId, result } = req.query as { topicId?: string; result?: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const where: any = { userId }
      
      if (topicId) {
        where.topicId = topicId
      }
      
      if (result) {
        where.result = result
      }

      const attempts = await prisma.attempt.findMany({
        where,
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              position: true,
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
          createdAt: 'desc'
        }
      })

      return res.status(200).json({
        success: true,
        data: {
          attempts,
          count: attempts.length
        }
      })
    } catch (error) {
      console.error('Get user attempts error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Get specific attempt
  static async getAttempt(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const attempt = await prisma.attempt.findFirst({
        where: {
          id: id as string,
          userId
        },
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              position: true,
              content: true,
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

      if (!attempt) {
        return res.status(404).json({
          success: false,
          error: 'Attempt not found'
        })
      }

      return res.status(200).json({
        success: true,
        data: { attempt }
      })
    } catch (error) {
      console.error('Get attempt error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Create attempt
  static async createAttempt(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { topicId, code, result, timeTaken } = req.body as {
        topicId: string
        code: string
        result: string
        timeTaken: number
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

      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'Code is required'
        })
      }

      if (!result || !['pass', 'fail'].includes(result)) {
        return res.status(400).json({
          success: false,
          error: 'Result must be pass or fail'
        })
      }

      if (timeTaken === undefined || timeTaken < 0) {
        return res.status(400).json({
          success: false,
          error: 'Time taken must be a positive number'
        })
      }

      // Check if topic exists
      const topic = await prisma.topic.findUnique({
        where: { id: topicId }
      })

      if (!topic) {
        return res.status(404).json({
          success: false,
          error: 'Topic not found'
        })
      }

      const attempt = await prisma.attempt.create({
        data: {
          userId,
          topicId,
          code,
          result,
          timeTaken,
          createdAt: new Date()
        },
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              position: true,
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

      return res.status(201).json({
        success: true,
        data: { attempt }
      })
    } catch (error) {
      console.error('Create attempt error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Update attempt
  static async updateAttempt(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }
      const { code, result, timeTaken } = req.body as {
        code?: string
        result?: string
        timeTaken?: number
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      // Check if attempt exists and belongs to user
      const existingAttempt = await prisma.attempt.findFirst({
        where: {
          id: id as string,
          userId
        }
      })

      if (!existingAttempt) {
        return res.status(404).json({
          success: false,
          error: 'Attempt not found'
        })
      }

      // Validation
      if (result && !['pass', 'fail'].includes(result)) {
        return res.status(400).json({
          success: false,
          error: 'Result must be pass or fail'
        })
      }

      if (timeTaken !== undefined && timeTaken < 0) {
        return res.status(400).json({
          success: false,
          error: 'Time taken must be a positive number'
        })
      }

      const attempt = await prisma.attempt.update({
        where: { id: id as string },
        data: {
          code,
          result,
          timeTaken
        },
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              position: true,
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

      return res.status(200).json({
        success: true,
        data: { attempt }
      })
    } catch (error) {
      console.error('Update attempt error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Delete attempt
  static async deleteAttempt(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      // Check if attempt exists and belongs to user
      const existingAttempt = await prisma.attempt.findFirst({
        where: {
          id: id as string,
          userId
        }
      })

      if (!existingAttempt) {
        return res.status(404).json({
          success: false,
          error: 'Attempt not found'
        })
      }

      await prisma.attempt.delete({
        where: { id: id as string }
      })

      return res.status(200).json({
        success: true,
        message: 'Attempt deleted successfully'
      })
    } catch (error) {
      console.error('Delete attempt error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Get attempt statistics for a user
  static async getAttemptStats(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { topicId } = req.query as { topicId?: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const where: any = { userId }
      
      if (topicId) {
        where.topicId = topicId
      }

      const attempts = await prisma.attempt.findMany({
        where,
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              courseId: true
            }
          }
        }
      })

      const totalAttempts = attempts.length
      const passedAttempts = attempts.filter((a: any) => a.result === 'pass').length
      const failedAttempts = attempts.filter((a: any) => a.result === 'fail').length

      const averageTimeTaken = attempts.length > 0 
        ? attempts.reduce((sum: number, a: any) => sum + a.timeTaken, 0) / attempts.length 
        : 0

      const successRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0

      const stats = {
        totalAttempts,
        passedAttempts,
        failedAttempts,
        successRate: Math.round(successRate * 100) / 100,
        averageTimeTaken: Math.round(averageTimeTaken * 100) / 100
      }

      return res.status(200).json({
        success: true,
        data: { stats }
      })
    } catch (error) {
      console.error('Get attempt stats error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
} 