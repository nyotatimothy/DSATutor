import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../lib/prisma'
import { AuthenticatedRequest } from '../middlewares/auth'

export class TopicController {
  constructor() {}

  /**
   * Create a new topic
   */
  async createTopic(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to create a topic'
        })
      }

      // Only admins can create topics
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Permission denied',
          message: 'Only administrators can create topics'
        })
      }

      const { courseId, title, order, description } = req.body

      // Validate required fields
      if (!courseId || !title || !order || !description) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Course ID, title, order, and description are required'
        })
      }

      // Check if course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      })

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found',
          message: 'Course with this ID does not exist'
        })
      }

      // Validate order
      if (order < 1 || order > 1000) {
        return res.status(400).json({
          success: false,
          error: 'Invalid order',
          message: 'Order must be between 1 and 1000'
        })
      }

      const topic = await prisma.topic.create({
        data: {
          courseId,
          title,
          order,
          description
        },
        select: {
          id: true,
          courseId: true,
          title: true,
          order: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          course: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })

      return res.status(201).json({
        success: true,
        message: 'Topic created successfully',
        data: { topic }
      })
    } catch (error) {
      console.error('Create topic error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create topic'
      })
    }
  }

  /**
   * Get topics for a course
   */
  async getTopics(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { courseId, page = 1, limit = 10 } = req.query

      if (!courseId || typeof courseId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid course ID',
          message: 'Course ID is required'
        })
      }

      // Check if course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      })

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found',
          message: 'Course with this ID does not exist'
        })
      }

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      const [topics, total] = await Promise.all([
        prisma.topic.findMany({
          where: { courseId },
          select: {
            id: true,
            courseId: true,
            title: true,
            order: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          },
          skip,
          take
        }),
        prisma.topic.count({ where: { courseId } })
      ])

      const totalPages = Math.ceil(total / take)

      return res.status(200).json({
        success: true,
        message: 'Topics retrieved successfully',
        data: {
          topics,
          course: {
            id: course.id,
            title: course.title
          },
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages
          }
        }
      })
    } catch (error) {
      console.error('Get topics error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve topics'
      })
    }
  }

  /**
   * Get a single topic by ID
   */
  async getTopic(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid topic ID',
          message: 'Topic ID is required'
        })
      }

      const topic = await prisma.topic.findUnique({
        where: { id },
        select: {
          id: true,
          courseId: true,
          title: true,
          order: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          course: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })

      if (!topic) {
        return res.status(404).json({
          success: false,
          error: 'Topic not found',
          message: 'Topic with this ID does not exist'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Topic retrieved successfully',
        data: { topic }
      })
    } catch (error) {
      console.error('Get topic error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve topic'
      })
    }
  }

  /**
   * Update a topic
   */
  async updateTopic(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to update a topic'
        })
      }

      // Only admins can update topics
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Permission denied',
          message: 'Only administrators can update topics'
        })
      }

      const { id } = req.query
      const { title, order, description } = req.body

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid topic ID',
          message: 'Topic ID is required'
        })
      }

      // Check if topic exists
      const existingTopic = await prisma.topic.findUnique({
        where: { id }
      })

      if (!existingTopic) {
        return res.status(404).json({
          success: false,
          error: 'Topic not found',
          message: 'Topic with this ID does not exist'
        })
      }

      // Validate order if provided
      if (order !== undefined && (order < 1 || order > 1000)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid order',
          message: 'Order must be between 1 and 1000'
        })
      }

      // Build update data
      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (order !== undefined) updateData.order = order
      if (description !== undefined) updateData.description = description

      const topic = await prisma.topic.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          courseId: true,
          title: true,
          order: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          course: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Topic updated successfully',
        data: { topic }
      })
    } catch (error) {
      console.error('Update topic error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update topic'
      })
    }
  }

  /**
   * Delete a topic
   */
  async deleteTopic(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to delete a topic'
        })
      }

      // Only admins can delete topics
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Permission denied',
          message: 'Only administrators can delete topics'
        })
      }

      const { id } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid topic ID',
          message: 'Topic ID is required'
        })
      }

      // Check if topic exists
      const existingTopic = await prisma.topic.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              attempts: true
            }
          }
        }
      })

      if (!existingTopic) {
        return res.status(404).json({
          success: false,
          error: 'Topic not found',
          message: 'Topic with this ID does not exist'
        })
      }

      // Check if topic has attempts
      if (existingTopic._count.attempts > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete topic',
          message: 'Topic has user attempts. Cannot delete topic with existing attempts.'
        })
      }

      await prisma.topic.delete({
        where: { id }
      })

      return res.status(200).json({
        success: true,
        message: 'Topic deleted successfully'
      })
    } catch (error) {
      console.error('Delete topic error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete topic'
      })
    }
  }

  /**
   * Reorder topics within a course
   */
  async reorderTopics(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to reorder topics'
        })
      }

      // Only admins can reorder topics
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Permission denied',
          message: 'Only administrators can reorder topics'
        })
      }

      const { courseId, topicPositions } = req.body

      if (!courseId || !topicPositions || !Array.isArray(topicPositions)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          message: 'Course ID and topic positions array are required'
        })
      }

      // Check if course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      })

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found',
          message: 'Course with this ID does not exist'
        })
      }

      // Validate topic positions
      for (const item of topicPositions) {
        if (!item.id || !item.order || typeof item.order !== 'number' || item.order < 1) {
          return res.status(400).json({
            success: false,
            error: 'Invalid topic position',
            message: 'Each topic must have a valid ID and position number'
          })
        }
      }

      // Update topics in a transaction
      await prisma.$transaction(
        topicPositions.map((item: { id: string; order: number }) =>
          prisma.topic.update({
            where: { id: item.id },
            data: { order: item.order }
          })
        )
      )

      return res.status(200).json({
        success: true,
        message: 'Topics reordered successfully'
      })
    } catch (error) {
      console.error('Reorder topics error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to reorder topics'
      })
    }
  }
} 
 