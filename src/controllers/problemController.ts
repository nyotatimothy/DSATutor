import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../lib/prisma'

export class ProblemController {
  // List problems with optional filtering
  static async getProblems(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { topicId, difficulty, page = '1', limit = '10' } = req.query
      const pageNum = parseInt(page as string)
      const limitNum = parseInt(limit as string)
      const skip = (pageNum - 1) * limitNum

      const where: any = {}
      
      if (topicId) {
        where.topicId = topicId
      }
      
      if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty as string)) {
        where.difficulty = difficulty
      }

      const problems = await prisma.problem.findMany({
        where,
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              course: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          },
          _count: {
            select: {
              testCases: true,
              submissions: true
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc'
        }
      })

      const total = await prisma.problem.count({ where })

      return res.status(200).json({
        success: true,
        data: problems,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      })
    } catch (error) {
      console.error('Error fetching problems:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch problems'
      })
    }
  }

  // Get a specific problem with test cases
  static async getProblem(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query as { id: string }

      const problem = await prisma.problem.findUnique({
        where: { id },
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              course: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          },
          testCases: {
            where: {
              hidden: false // Only show visible test cases
            },
            select: {
              id: true,
              input: true,
              expected: true
            }
          },
          _count: {
            select: {
              testCases: true,
              submissions: true
            }
          }
        }
      })

      if (!problem) {
        return res.status(404).json({
          success: false,
          error: 'Problem not found'
        })
      }

      return res.status(200).json({
        success: true,
        data: problem
      })
    } catch (error) {
      console.error('Error fetching problem:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch problem'
      })
    }
  }

  // Create a new problem (admin only)
  static async createProblem(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { title, prompt, difficulty, topicId, testCases } = req.body

      if (!title || !prompt || !difficulty || !topicId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        })
      }

      if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid difficulty level'
        })
      }

      // Verify topic exists
      const topic = await prisma.topic.findUnique({
        where: { id: topicId }
      })

      if (!topic) {
        return res.status(400).json({
          success: false,
          error: 'Topic not found'
        })
      }

      const problem = await prisma.problem.create({
        data: {
          title,
          prompt,
          difficulty,
          topicId,
          testCases: {
            create: testCases || []
          }
        },
        include: {
          topic: {
            select: {
              id: true,
              title: true
            }
          },
          testCases: true
        }
      })

      return res.status(201).json({
        success: true,
        data: problem
      })
    } catch (error) {
      console.error('Error creating problem:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to create problem'
      })
    }
  }

  // Update a problem (admin only)
  static async updateProblem(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query as { id: string }
      const { title, prompt, difficulty, testCases } = req.body

      const problem = await prisma.problem.findUnique({
        where: { id }
      })

      if (!problem) {
        return res.status(404).json({
          success: false,
          error: 'Problem not found'
        })
      }

      const updatedProblem = await prisma.problem.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(prompt && { prompt }),
          ...(difficulty && { difficulty }),
          ...(testCases && {
            testCases: {
              deleteMany: {},
              create: testCases
            }
          })
        },
        include: {
          topic: {
            select: {
              id: true,
              title: true
            }
          },
          testCases: true
        }
      })

      return res.status(200).json({
        success: true,
        data: updatedProblem
      })
    } catch (error) {
      console.error('Error updating problem:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to update problem'
      })
    }
  }

  // Delete a problem (admin only)
  static async deleteProblem(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query as { id: string }

      const problem = await prisma.problem.findUnique({
        where: { id }
      })

      if (!problem) {
        return res.status(404).json({
          success: false,
          error: 'Problem not found'
        })
      }

      await prisma.problem.delete({
        where: { id }
      })

      return res.status(200).json({
        success: true,
        message: 'Problem deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting problem:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to delete problem'
      })
    }
  }
} 