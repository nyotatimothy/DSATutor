import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../lib/prisma'
import { CodeRunner } from '../services/codeRunner'

export class SubmissionController {
  // Submit code for evaluation
  static async submitCode(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { problemId, code, language } = req.body
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        })
      }

      if (!problemId || !code || !language) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: problemId, code, language'
        })
      }

      if (!['javascript', 'python'].includes(language)) {
        return res.status(400).json({
          success: false,
          error: 'Only JavaScript and Python are supported'
        })
      }

      // Verify problem exists
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        include: { testCases: true }
      })

      if (!problem) {
        return res.status(404).json({
          success: false,
          error: 'Problem not found'
        })
      }

      // Execute the code
      const executionResult = await CodeRunner.executeCode(code, language, problemId)

      // Save submission
      const submission = await prisma.submission.create({
        data: {
          userId,
          problemId,
          code,
          language,
          result: executionResult.result,
          error: executionResult.error,
          durationMs: executionResult.durationMs
        },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true
            }
          }
        }
      })

      // Update progress if successful
      if (executionResult.result === 'pass') {
        await this.updateUserProgress(userId, problemId)
      }

      return res.status(200).json({
        success: true,
        data: {
          submission,
          execution: {
            result: executionResult.result,
            passedCount: executionResult.passedCount,
            totalCount: executionResult.totalCount,
            testResults: executionResult.testResults,
            durationMs: executionResult.durationMs
          }
        }
      })
    } catch (error) {
      console.error('Error submitting code:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to submit code'
      })
    }
  }

  // Get user's submissions for a problem
  static async getUserSubmissions(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { problemId } = req.query as { problemId: string }
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        })
      }

      const submissions = await prisma.submission.findMany({
        where: {
          userId,
          problemId
        },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.status(200).json({
        success: true,
        data: submissions
      })
    } catch (error) {
      console.error('Error fetching submissions:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch submissions'
      })
    }
  }

  // Get all submissions for a problem (admin only)
  static async getProblemSubmissions(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { problemId } = req.query as { problemId: string }
      const { page = '1', limit = '10' } = req.query
      const pageNum = parseInt(page as string)
      const limitNum = parseInt(limit as string)
      const skip = (pageNum - 1) * limitNum

      const submissions = await prisma.submission.findMany({
        where: {
          problemId
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc'
        }
      })

      const total = await prisma.submission.count({
        where: { problemId }
      })

      return res.status(200).json({
        success: true,
        data: submissions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      })
    } catch (error) {
      console.error('Error fetching problem submissions:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch submissions'
      })
    }
  }

  // Get submission statistics
  static async getSubmissionStats(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { problemId } = req.query as { problemId: string }

      const stats = await prisma.submission.groupBy({
        by: ['result'],
        where: {
          problemId
        },
        _count: {
          result: true
        }
      })

      const totalSubmissions = await prisma.submission.count({
        where: { problemId }
      })

      const passCount = stats.find((s: any) => s.result === 'pass')?._count.result || 0
      const failCount = stats.find((s: any) => s.result === 'fail')?._count.result || 0

      return res.status(200).json({
        success: true,
        data: {
          total: totalSubmissions,
          pass: passCount,
          fail: failCount,
          successRate: totalSubmissions > 0 ? (passCount / totalSubmissions) * 100 : 0
        }
      })
    } catch (error) {
      console.error('Error fetching submission stats:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch submission statistics'
      })
    }
  }

  // Update user progress when problem is solved
  private static async updateUserProgress(userId: string, problemId: string) {
    try {
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        include: {
          topic: true
        }
      })

      if (!problem) return

      // Check if this is the first successful submission for this problem
      const previousSuccessfulSubmission = await prisma.submission.findFirst({
        where: {
          userId,
          problemId,
          result: 'pass'
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      // If this is the first successful submission, update progress
      if (previousSuccessfulSubmission?.id === problemId) {
        // Update topic progress
        await prisma.progress.upsert({
          where: {
            userId_topicId: {
              userId,
              topicId: problem.topicId
            }
          },
          update: {
            status: 'complete'
          },
          create: {
            userId,
            topicId: problem.topicId,
            status: 'complete'
          }
        })
      }
    } catch (error) {
      console.error('Error updating user progress:', error)
    }
  }
} 