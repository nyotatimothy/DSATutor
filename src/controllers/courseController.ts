import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../lib/prisma'
import { AuthenticatedRequest } from '../middlewares/auth'

export class CourseController {
  constructor() {}

  /**
   * Create a new course
   */
  async createCourse(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to create a course'
        })
      }

      // Only admins and super admins can create courses
      if (req.user.role !== 'ADMIN' && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Permission denied',
          message: 'Only administrators can create courses'
        })
      }

      const { title, description } = req.body

      // Validate required fields
      if (!title || !description) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Title and description are required'
        })
      }

      const course = await prisma.course.create({
        data: {
          title,
          description,
          createdBy: req.user.id
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          topics: {
            select: {
              id: true,
              title: true,
              position: true,
              content: true,
              courseId: true,
              createdAt: true,
              updatedAt: true
            },
            orderBy: {
              position: 'asc'
            }
          },
          _count: {
            select: {
              topics: true
            }
          }
        }
      })

      return res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: { course }
      })
    } catch (error) {
      console.error('Create course error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create course'
      })
    }
  }

  /**
   * Get all courses (with optional filtering)
   */
  async getCourses(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { page = 1, limit = 10 } = req.query

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            topics: {
              select: {
                id: true,
                title: true,
                position: true,
                content: true,
                courseId: true,
                createdAt: true,
                updatedAt: true
              },
              orderBy: {
                position: 'asc'
              }
            },
            _count: {
              select: {
                topics: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take
        }),
        prisma.course.count()
      ])

      const totalPages = Math.ceil(total / take)

      return res.status(200).json({
        success: true,
        message: 'Courses retrieved successfully',
        data: {
          courses,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages
          }
        }
      })
    } catch (error) {
      console.error('Get courses error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve courses'
      })
    }
  }

  /**
   * Get a single course by ID
   */
  async getCourse(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid course ID',
          message: 'Course ID is required'
        })
      }

      const course = await prisma.course.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          topics: {
            select: {
              id: true,
              title: true,
              position: true,
              content: true,
              courseId: true,
              createdAt: true,
              updatedAt: true
            },
            orderBy: {
              position: 'asc'
            }
          },
          _count: {
            select: {
              topics: true
            }
          }
        }
      })

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found',
          message: 'Course with this ID does not exist'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Course retrieved successfully',
        data: { course }
      })
    } catch (error) {
      console.error('Get course error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve course'
      })
    }
  }

  /**
   * Update a course
   */
  async updateCourse(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to update a course'
        })
      }

      // Only admins and super admins can update courses
      if (req.user.role !== 'ADMIN' && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Permission denied',
          message: 'Only administrators can update courses'
        })
      }

      const { id } = req.query
      const { title, description } = req.body

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid course ID',
          message: 'Course ID is required'
        })
      }

      // Check if course exists
      const existingCourse = await prisma.course.findUnique({
        where: { id }
      })

      if (!existingCourse) {
        return res.status(404).json({
          success: false,
          error: 'Course not found',
          message: 'Course with this ID does not exist'
        })
      }

      // Build update data
      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description

      const course = await prisma.course.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          topics: {
            select: {
              id: true,
              title: true,
              position: true,
              content: true,
              courseId: true,
              createdAt: true,
              updatedAt: true
            },
            orderBy: {
              position: 'asc'
            }
          },
          _count: {
            select: {
              topics: true
            }
          }
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: { course }
      })
    } catch (error) {
      console.error('Update course error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update course'
      })
    }
  }

  /**
   * Delete a course
   */
  async deleteCourse(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to delete a course'
        })
      }

      // Only admins and super admins can delete courses
      if (req.user.role !== 'ADMIN' && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Permission denied',
          message: 'Only administrators can delete courses'
        })
      }

      const { id } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid course ID',
          message: 'Course ID is required'
        })
      }

      // Check if course exists
      const existingCourse = await prisma.course.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              topics: true
            }
          }
        }
      })

      if (!existingCourse) {
        return res.status(404).json({
          success: false,
          error: 'Course not found',
          message: 'Course with this ID does not exist'
        })
      }

      // Check if course has topics
      if (existingCourse._count.topics > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete course',
          message: 'Course has topics. Please delete topics first.'
        })
      }

      // Optionally, check for related progress records
      const progressCount = await prisma.progress.count({
        where: {
          topic: {
            courseId: id
          }
        }
      })
      if (progressCount > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete course',
          message: 'Course has user progress. Cannot delete course with existing progress.'
        })
      }

      await prisma.course.delete({
        where: { id }
      })

      return res.status(200).json({
        success: true,
        message: 'Course deleted successfully'
      })
    } catch (error) {
      console.error('Delete course error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete course'
      })
    }
  }
} 