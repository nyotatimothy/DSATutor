import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../lib/prisma'

export class ProgressController {
  // Get progress for a user
  static async getUserProgress(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { courseId, topicId } = req.query as { courseId?: string; topicId?: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const where: any = { userId }
      
      if (courseId) {
        where.topic = { courseId }
      }
      
      if (topicId) {
        where.topicId = topicId
      }

      const progress = await prisma.progress.findMany({
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
          updatedAt: 'desc'
        }
      })

      return res.status(200).json({
        success: true,
        data: {
          progress,
          count: progress.length
        }
      })
    } catch (error) {
      console.error('Get user progress error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Get specific progress entry
  static async getProgress(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const progress = await prisma.progress.findFirst({
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

      if (!progress) {
        return res.status(404).json({
          success: false,
          error: 'Progress not found'
        })
      }

      return res.status(200).json({
        success: true,
        data: { progress }
      })
    } catch (error) {
      console.error('Get progress error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Create or update progress
  static async createProgress(req: NextApiRequest, res: NextApiResponse) {
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

      // Check if progress already exists
      const existingProgress = await prisma.progress.findFirst({
        where: {
          userId,
          topicId
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
      } else {
        // Create new progress
        progress = await prisma.progress.create({
          data: {
            userId,
            topicId,
            status,
            updatedAt: new Date()
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

  // Update progress
  static async updateProgress(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }
      const { status } = req.body as {
        status?: string
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      // Check if progress exists and belongs to user
      const existingProgress = await prisma.progress.findFirst({
        where: {
          id,
          userId
        }
      })

      if (!existingProgress) {
        return res.status(404).json({
          success: false,
          error: 'Progress not found'
        })
      }

      // Validation
      if (status && !['not_started', 'in_progress', 'complete'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status must be not_started, in_progress, or complete'
        })
      }



      const progress = await prisma.progress.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date()
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
        data: { progress }
      })
    } catch (error) {
      console.error('Update progress error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Delete progress
  static async deleteProgress(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      // Check if progress exists and belongs to user
      const existingProgress = await prisma.progress.findFirst({
        where: {
          id: id as string,
          userId
        }
      })

      if (!existingProgress) {
        return res.status(404).json({
          success: false,
          error: 'Progress not found'
        })
      }

      await prisma.progress.delete({
        where: { id: id as string }
      })

      return res.status(200).json({
        success: true,
        message: 'Progress deleted successfully'
      })
    } catch (error) {
      console.error('Delete progress error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Get progress statistics for a user
  static async getProgressStats(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { courseId } = req.query as { courseId?: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const where: any = { userId }
      
      if (courseId) {
        where.topic = { courseId }
      }

      const progress = await prisma.progress.findMany({
        where,
        include: {
          topic: {
            select: {
              id: true,
              courseId: true
            }
          }
        }
      })

      const totalTopics = progress.length
      const completedTopics = progress.filter((p: any) => p.status === 'complete').length
      const inProgressTopics = progress.filter((p: any) => p.status === 'in_progress').length
      const notStartedTopics = progress.filter((p: any) => p.status === 'not_started').length

      const stats = {
        totalTopics,
        completedTopics,
        inProgressTopics,
        notStartedTopics,
        completionRate: totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0
      }

      return res.status(200).json({
        success: true,
        data: { stats }
      })
    } catch (error) {
      console.error('Get progress stats error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
} 
 
import { prisma } from '../lib/prisma'

export class ProgressController {
  // Get progress for a user
  static async getUserProgress(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { courseId, topicId } = req.query as { courseId?: string; topicId?: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const where: any = { userId }
      
      if (courseId) {
        where.topic = { courseId }
      }
      
      if (topicId) {
        where.topicId = topicId
      }

      const progress = await prisma.progress.findMany({
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
          updatedAt: 'desc'
        }
      })

      return res.status(200).json({
        success: true,
        data: {
          progress,
          count: progress.length
        }
      })
    } catch (error) {
      console.error('Get user progress error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Get specific progress entry
  static async getProgress(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const progress = await prisma.progress.findFirst({
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

      if (!progress) {
        return res.status(404).json({
          success: false,
          error: 'Progress not found'
        })
      }

      return res.status(200).json({
        success: true,
        data: { progress }
      })
    } catch (error) {
      console.error('Get progress error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Create or update progress
  static async createProgress(req: NextApiRequest, res: NextApiResponse) {
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

      // Check if progress already exists
      const existingProgress = await prisma.progress.findFirst({
        where: {
          userId,
          topicId
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
      } else {
        // Create new progress
        progress = await prisma.progress.create({
          data: {
            userId,
            topicId,
            status,
            updatedAt: new Date()
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

  // Update progress
  static async updateProgress(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }
      const { status } = req.body as {
        status?: string
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      // Check if progress exists and belongs to user
      const existingProgress = await prisma.progress.findFirst({
        where: {
          id,
          userId
        }
      })

      if (!existingProgress) {
        return res.status(404).json({
          success: false,
          error: 'Progress not found'
        })
      }

      // Validation
      if (status && !['not_started', 'in_progress', 'complete'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status must be not_started, in_progress, or complete'
        })
      }



      const progress = await prisma.progress.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date()
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
        data: { progress }
      })
    } catch (error) {
      console.error('Update progress error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Delete progress
  static async deleteProgress(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      // Check if progress exists and belongs to user
      const existingProgress = await prisma.progress.findFirst({
        where: {
          id: id as string,
          userId
        }
      })

      if (!existingProgress) {
        return res.status(404).json({
          success: false,
          error: 'Progress not found'
        })
      }

      await prisma.progress.delete({
        where: { id: id as string }
      })

      return res.status(200).json({
        success: true,
        message: 'Progress deleted successfully'
      })
    } catch (error) {
      console.error('Delete progress error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Get progress statistics for a user
  static async getProgressStats(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { courseId } = req.query as { courseId?: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const where: any = { userId }
      
      if (courseId) {
        where.topic = { courseId }
      }

      const progress = await prisma.progress.findMany({
        where,
        include: {
          topic: {
            select: {
              id: true,
              courseId: true
            }
          }
        }
      })

      const totalTopics = progress.length
      const completedTopics = progress.filter((p: any) => p.status === 'complete').length
      const inProgressTopics = progress.filter((p: any) => p.status === 'in_progress').length
      const notStartedTopics = progress.filter((p: any) => p.status === 'not_started').length

      const stats = {
        totalTopics,
        completedTopics,
        inProgressTopics,
        notStartedTopics,
        completionRate: totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0
      }

      return res.status(200).json({
        success: true,
        data: { stats }
      })
    } catch (error) {
      console.error('Get progress stats error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
} 
 