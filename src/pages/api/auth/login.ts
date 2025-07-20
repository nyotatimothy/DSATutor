import type { NextApiRequest, NextApiResponse } from 'next'
import { FirebaseService } from '@/services/firebase'
import { prisma } from '@/lib/prisma'

// Mock user for demo
const MOCK_USER = {
  email: "nyota@dsatutor.com",
  password: "user",
  name: "Nyota",
  id: "nyota-user-id",
  assessmentData: {
    email: "nyota@dsatutor.com",
    completedAt: new Date().toISOString(),
    level: "advanced",
    score: 92,
    correctAnswers: 7,
    totalQuestions: 8,
    timeSpent: 720,
    date: new Date().toISOString(),
    strengths: [
      "Dynamic Programming",
      "Graph Algorithms", 
      "Tree Traversal",
      "Advanced Data Structures"
    ],
    weaknesses: [
      "System Design",
      "Bit Manipulation"
    ],
    categoryPerformance: {
      "Arrays & Hashing": 95,
      "Two Pointers": 90,
      "Stack": 85,
      "Binary Search": 100,
      "Sliding Window": 90,
      "Linked Lists": 95,
      "Trees": 100,
      "Tries": 85,
      "Heap / Priority Queue": 90,
      "Backtracking": 95,
      "Graphs": 100,
      "Dynamic Programming": 100,
      "Greedy": 85,
      "Intervals": 90,
      "Math & Geometry": 80
    },
    recommendedPath: "advanced_track",
    estimatedCompletionTime: "4-6 weeks"
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Check for nyota user first (special handling for demo)
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      try {
        // Try to get user from database
        const dbUser = await prisma.user.findUnique({
          where: { email: MOCK_USER.email },
          include: {
            skillAssessments: {
              orderBy: { assessmentDate: 'desc' },
              take: 1
            },
            learningPaths: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        })

        if (dbUser) {
          // User exists in database, return with real data
          const latestAssessment = dbUser.skillAssessments[0]
          const learningPath = dbUser.learningPaths[0]
          
          return res.status(200).json({
            success: true,
            data: {
              user: {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                role: dbUser.role,
                assessmentCompleted: true // Force true for nyota user
              },
              token: `mock-token-${dbUser.id}-${Date.now()}`,
              assessmentData: latestAssessment ? {
                email: dbUser.email,
                completedAt: latestAssessment.assessmentDate.toISOString(),
                level: latestAssessment.overallLevel,
                score: latestAssessment.confidenceScore,
                correctAnswers: Math.floor(latestAssessment.confidenceScore * 8 / 100),
                totalQuestions: 8,
                timeSpent: 720,
                date: latestAssessment.assessmentDate.toISOString(),
                strengths: JSON.parse(latestAssessment.strengths),
                weaknesses: JSON.parse(latestAssessment.weaknesses),
                categoryPerformance: MOCK_USER.assessmentData.categoryPerformance, // Use mock for now
                recommendedPath: "advanced_track",
                estimatedCompletionTime: "4-6 weeks"
              } : MOCK_USER.assessmentData
            },
            message: 'Login successful'
          })
        } else {
          // Fallback to mock data if user not in database
          return res.status(200).json({
            success: true,
            data: {
              user: {
                id: MOCK_USER.id,
                email: MOCK_USER.email,
                name: MOCK_USER.name,
                role: "user",
                assessmentCompleted: true
              },
              token: `mock-token-${MOCK_USER.id}-${Date.now()}`,
              assessmentData: MOCK_USER.assessmentData
            },
            message: 'Login successful (mock data)'
          })
        }
      } catch (dbError) {
        console.error('Database error for nyota user, falling back to mock:', dbError)
        // Fallback to mock data if database error
        return res.status(200).json({
          success: true,
          data: {
            user: {
              id: MOCK_USER.id,
              email: MOCK_USER.email,
              name: MOCK_USER.name,
              role: "user",
              assessmentCompleted: true
            },
            token: `mock-token-${MOCK_USER.id}-${Date.now()}`,
            assessmentData: MOCK_USER.assessmentData
          },
          message: 'Login successful (fallback to mock)'
        })
      }
    }

    // Original Firebase/Prisma logic for other users
    const userCredential = await FirebaseService.signIn(email, password)
    const firebaseUid = userCredential.user.uid

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        notifications: {
          where: { status: 'unread' },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      notifications: user.notifications
    })
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    
    res.status(500).json({ error: 'Failed to sign in' })
  }
}
