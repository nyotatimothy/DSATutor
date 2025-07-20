import { NextRequest, NextResponse } from 'next/server'

// Mock user database
const MOCK_USERS = {
  "nyota@dsatutor.com": {
    id: "nyota-user-id",
    email: "nyota@dsatutor.com",
    password: "user",
    name: "Nyota",
    role: "user" as const,
    assessmentCompleted: true,
    profile: {
      experience: "advanced",
      goals: ["interview_prep", "skill_improvement"],
      timeCommitment: "1-2 hours daily",
      preferredLanguages: ["javascript", "python"]
    }
  },
  "demo@dsatutor.com": {
    id: "demo-user-id",
    email: "demo@dsatutor.com",
    password: "demo",
    name: "Demo User",
    role: "user" as const,
    assessmentCompleted: false
  }
}

const MOCK_ASSESSMENT_DATA = {
  "nyota@dsatutor.com": {
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

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user in mock database
    const user = MOCK_USERS[email as keyof typeof MOCK_USERS]
    
    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate mock token
    const token = `mock-token-${user.id}-${Date.now()}`

    // Store assessment data in localStorage format
    const assessmentData = MOCK_ASSESSMENT_DATA[email as keyof typeof MOCK_ASSESSMENT_DATA]
    if (assessmentData) {
      // We'll return this in the response so the client can store it
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      assessmentCompleted: user.assessmentCompleted
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        token,
        assessmentData: assessmentData || null
      },
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
