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
   * Enhanced code analysis with detailed breakdown
   */
  async enhancedAnalyzeCode(req: NextApiRequest, res: NextApiResponse) {
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

      // Perform enhanced analysis with AI
      const enhancedAnalysis = await OpenAIService.enhancedCodeAnalysis(
        code,
        problemDescription,
        language
      )

      // Create attempt record with enhanced AI analysis
      const attempt = await prisma.attempt.create({
        data: {
          userId,
          topicId: topicId || null,
          code,
          result: enhancedAnalysis.basicAnalysis.score >= 70 ? 'pass' : 'fail',
          timeTaken: 0, // Will be updated by frontend
          score: enhancedAnalysis.basicAnalysis.score,
          aiAnalysis: JSON.stringify(enhancedAnalysis)
        }
      })

      return res.status(200).json({
        success: true,
        data: {
          attempt,
          analysis: enhancedAnalysis
        }
      })
    } catch (error) {
      console.error('Enhanced AI code analysis error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to perform enhanced code analysis'
      })
    }
  }

  /**
   * Compare multiple solutions to the same problem
   */
  async compareSolutions(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { problemDescription, solutionIds } = req.body
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Access token required',
          message: 'Please provide a valid authentication token'
        })
      }

      if (!problemDescription || !solutionIds || !Array.isArray(solutionIds)) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Problem description and solution IDs array are required'
        })
      }

      // Fetch all solutions to compare
      const attempts = await prisma.attempt.findMany({
        where: {
          id: { in: solutionIds },
          userId // Only compare user's own solutions for privacy
        },
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      })

      if (attempts.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient solutions',
          message: 'Need at least 2 solutions to compare'
        })
      }

      // Prepare solutions for comparison
      const solutions = attempts.map((attempt: any) => ({
        code: attempt.code,
        language: 'javascript', // Default, could be stored in attempt
        approach: attempt.aiAnalysis ? JSON.parse(attempt.aiAnalysis).algorithmAnalysis?.approach || 'Unknown' : 'Unknown',
        userId: attempt.user.name || attempt.user.id
      }))

      // Compare solutions with AI
      const comparison = await OpenAIService.compareSolutions(solutions, problemDescription)

      return res.status(200).json({
        success: true,
        data: {
          comparison,
          solutions: attempts
        }
      })
    } catch (error) {
      console.error('Solution comparison error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to compare solutions'
      })
    }
  }

  /**
   * Optimize user's code with AI suggestions
   */
  async optimizeCode(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { code, problemDescription, language = 'javascript' } = req.body
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

      // Optimize code with AI
      const optimization = await OpenAIService.optimizeCode(code, problemDescription, language)

      return res.status(200).json({
        success: true,
        data: optimization
      })
    } catch (error) {
      console.error('Code optimization error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to optimize code'
      })
    }
  }

  /**
   * Generate personalized learning path
   */
  async generateLearningPath(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { goals } = req.body
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Access token required',
          message: 'Please provide a valid authentication token'
        })
      }

      // Get user's profile and recent attempts
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      const recentAttempts = await prisma.attempt.findMany({
        where: { userId },
        include: { topic: true },
        orderBy: { createdAt: 'desc' },
        take: 20
      })

      const skillAssessments = await prisma.skillAssessment.findMany({
        where: { userId },
        orderBy: { assessmentDate: 'desc' },
        take: 1
      })

      // Get user's progress to determine completed topics
      const progress = await prisma.progress.findMany({
        where: { userId },
        include: { topic: true }
      })

      const completedTopics = progress
        .filter((p: any) => p.completed)
        .map((p: any) => p.topic.title)

      // Determine current level and weaknesses
      const latestAssessment = skillAssessments[0]
      const currentLevel = latestAssessment?.overallLevel || 'beginner'
      const strengths = latestAssessment ? JSON.parse(latestAssessment.strengths) : []
      const weaknesses = latestAssessment ? JSON.parse(latestAssessment.weaknesses) : []

      // Generate learning path
      const learningPath = await OpenAIService.generateLearningPath({
        currentLevel: currentLevel as 'beginner' | 'intermediate' | 'advanced',
        strengths,
        weaknesses,
        completedTopics,
        goals: goals || []
      })

      // Store learning path in database
      const storedLearningPath = await prisma.learningPath.create({
        data: {
          userId,
          currentLevel: learningPath.currentLevel,
          targetLevel: learningPath.targetLevel,
          roadmap: JSON.stringify(learningPath.roadmap),
          immediateNextSteps: JSON.stringify(learningPath.immediateNextSteps),
          longTermGoals: JSON.stringify(learningPath.longTermGoals),
          practiceRecommendations: JSON.stringify(learningPath.practiceRecommendations),
          createdAt: new Date()
        }
      })

      return res.status(200).json({
        success: true,
        data: {
          learningPath,
          storedLearningPath
        }
      })
    } catch (error) {
      console.error('Learning path generation error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to generate learning path'
      })
    }
  }

  /**
   * Get user's learning path history
   */
  async getLearningPathHistory(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Access token required',
          message: 'Please provide a valid authentication token'
        })
      }

      const learningPaths = await prisma.learningPath.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })

      return res.status(200).json({
        success: true,
        data: learningPaths
      })
    } catch (error) {
      console.error('Get learning path history error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get learning path history'
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
      const attemptsFiltered = attempts.filter((a: any) => a.result === 'pass' || a.result === 'fail')
      const submissions = attemptsFiltered.map((attempt: any) => ({
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
   * Store personalized assessment result
   */
  async storeAssessmentResult(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const {
        level,
        score,
        correctAnswers,
        totalQuestions,
        timeSpent,
        categoryPerformance,
        strengths,
        weaknesses,
        confidence,
        estimatedExperience,
        recommendedStartingPoint,
        questionResults,
        personalizedCurriculum
      } = req.body

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Access token required',
          message: 'Please provide a valid authentication token'
        })
      }

      if (!level || score === undefined || !totalQuestions) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Level, score, and total questions are required'
        })
      }

      // Store the assessment result
      const assessment = await prisma.skillAssessment.create({
        data: {
          userId,
          level,
          score,
          correctAnswers: correctAnswers || 0,
          totalQuestions,
          timeSpent: timeSpent || 0,
          categoryPerformance: categoryPerformance ? JSON.stringify(categoryPerformance) : null,
          strengths: strengths ? JSON.stringify(strengths) : null,
          weaknesses: weaknesses ? JSON.stringify(weaknesses) : null,
          confidence: confidence || 0,
          estimatedExperience: estimatedExperience || '',
          recommendedStartingPoint: recommendedStartingPoint || '',
          questionResults: questionResults ? JSON.stringify(questionResults) : null,
          personalizedCurriculum: personalizedCurriculum ? JSON.stringify(personalizedCurriculum) : null,
          assessmentDate: new Date()
        }
      })

      // Update user's current level and assessment status
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentLevel: level,
          assessmentCompleted: true,
          lastAssessmentDate: new Date()
        }
      })

      return res.status(200).json({
        success: true,
        data: assessment
      })
    } catch (error) {
      console.error('Store assessment result error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to store assessment result'
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