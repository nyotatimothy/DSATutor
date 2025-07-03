import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../lib/prisma'
import OpenAIService from '../services/openai'

class AIController {
  /**
   * Analyze code submission with AI
   */
  async analyzeCode(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { code, problemDescription, language = 'javascript', topicId } = req.body
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Access token required',
          message: 'Please provide a valid authentication token'
        })
      }

      if (!code || !problemDescription) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Code and problem description are required'
        })
      }

      // Get topic information if topicId is provided
      let topic = null
      if (topicId) {
        topic = await prisma.topic.findUnique({
          where: { id: topicId }
        })
      }

      // Analyze code with AI
      const analysis = await OpenAIService.analyzeCode(
        code,
        problemDescription,
        language
      )

      // Create attempt record with AI analysis
      const attempt = await prisma.attempt.create({
        data: {
          userId,
          topicId: topicId || null,
          code,
          result: analysis.score >= 70 ? 'pass' : 'fail',
          timeTaken: 0, // Will be updated by frontend
          score: analysis.score,
          aiAnalysis: JSON.stringify({
            feedback: analysis.feedback,
            suggestions: analysis.suggestions,
            timeComplexity: analysis.timeComplexity,
            spaceComplexity: analysis.spaceComplexity,
            codeQuality: analysis.codeQuality,
            issues: analysis.issues
          })
        }
      })

      return res.status(200).json({
        success: true,
        data: {
          attempt,
          analysis
        }
      })
    } catch (error) {
      console.error('AI code analysis error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to analyze code'
      })
    }
  }

  /**
   * Assess user's skill level based on their attempts
   */
  async assessSkillLevel(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Access token required',
          message: 'Please provide a valid authentication token'
        })
      }

      // Get user's recent attempts with topic information
      const attempts = await prisma.attempt.findMany({
        where: { userId },
        include: {
          topic: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10 // Analyze last 10 attempts
      })

      if (attempts.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No attempts found',
          message: 'Need at least one code attempt to assess skill level'
        })
      }

      // Prepare submissions for AI analysis
      const attemptsFiltered = attempts.filter(a => a.result === 'pass' || a.result === 'fail')
      const submissions = attemptsFiltered.map(attempt => ({
        code: attempt.code,
        problemDescription: attempt.topic?.title || 'Unknown problem',
        result: attempt.result as 'pass' | 'fail',
        score: attempt.score || undefined
      }))

      // Assess skill level with AI
      const assessment = await OpenAIService.assessSkillLevel(submissions)

      // Store assessment in database
      const skillAssessment = await prisma.skillAssessment.create({
        data: {
          userId,
          overallLevel: assessment.overallLevel,
          strengths: JSON.stringify(assessment.strengths),
          weaknesses: JSON.stringify(assessment.weaknesses),
          recommendations: JSON.stringify(assessment.recommendations),
          confidenceScore: assessment.confidenceScore,
          assessmentDate: new Date()
        }
      })

      return res.status(200).json({
        success: true,
        data: {
          assessment,
          skillAssessment
        }
      })
    } catch (error) {
      console.error('AI skill assessment error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to assess skill level'
      })
    }
  }

  /**
   * Generate personalized hint for a problem
   */
  async generateHint(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { userCode, problemDescription, userStuck = true } = req.body
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Access token required',
          message: 'Please provide a valid authentication token'
        })
      }

      if (!userCode || !problemDescription) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'User code and problem description are required'
        })
      }

      // Generate hint with AI
      const hint = await OpenAIService.generateHint(
        userCode,
        problemDescription,
        userStuck
      )

      return res.status(200).json({
        success: true,
        data: hint
      })
    } catch (error) {
      console.error('AI hint generation error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to generate hint'
      })
    }
  }

  /**
   * Generate personalized practice problem
   */
  async generatePracticeProblem(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { userWeaknesses, currentLevel, topic } = req.body
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Access token required',
          message: 'Please provide a valid authentication token'
        })
      }

      if (!userWeaknesses || !currentLevel || !topic) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'User weaknesses, current level, and topic are required'
        })
      }

      // Generate practice problem with AI
      const problem = await OpenAIService.generatePracticeProblem(
        userWeaknesses,
        currentLevel,
        topic
      )

      return res.status(200).json({
        success: true,
        data: problem
      })
    } catch (error) {
      console.error('AI problem generation error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to generate practice problem'
      })
    }
  }

  /**
   * Get user's AI assessment history
   */
  async getAssessmentHistory(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Access token required',
          message: 'Please provide a valid authentication token'
        })
      }

      const assessments = await prisma.skillAssessment.findMany({
        where: { userId },
        orderBy: { assessmentDate: 'desc' }
      })

      return res.status(200).json({
        success: true,
        data: assessments
      })
    } catch (error) {
      console.error('Get assessment history error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get assessment history'
      })
    }
  }

  /**
   * Get AI-enhanced attempt details
   */
  async getAttemptWithAnalysis(req: NextApiRequest, res: NextApiResponse) {
    try {
      let { attemptId } = req.query
      const userId = (req as any).user?.id

      if (Array.isArray(attemptId)) {
        attemptId = attemptId[0]
      }
      if (!attemptId || typeof attemptId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid attempt ID',
          message: 'Attempt ID is required'
        })
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Access token required',
          message: 'Please provide a valid authentication token'
        })
      }

      const attempt = await prisma.attempt.findFirst({
        where: {
          id: attemptId,
          userId
        },
        include: {
          topic: true
        }
      })

      if (!attempt) {
        return res.status(404).json({
          success: false,
          error: 'Attempt not found',
          message: 'The specified attempt does not exist'
        })
      }

      return res.status(200).json({
        success: true,
        data: attempt
      })
    } catch (error) {
      console.error('Get attempt with analysis error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get attempt details'
      })
    }
  }
}

export default new AIController() 