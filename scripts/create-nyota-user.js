const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createNyotaUser() {
  try {
    console.log('Creating nyota@dsatutor.com user...')

    // First, check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'nyota@dsatutor.com' }
    })

    if (existingUser) {
      console.log('User already exists, updating...')
      
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { email: 'nyota@dsatutor.com' },
        data: {
          name: 'Nyota',
          role: 'user',
          isActive: true,
          firebaseUid: 'nyota-firebase-uid' // Mock Firebase UID
        }
      })

      console.log('User updated:', updatedUser)
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email: 'nyota@dsatutor.com',
          name: 'Nyota',
          role: 'user',
          isActive: true,
          firebaseUid: 'nyota-firebase-uid' // Mock Firebase UID
        }
      })

      console.log('User created:', newUser)
    }

    // Get the user to get the ID
    const user = await prisma.user.findUnique({
      where: { email: 'nyota@dsatutor.com' }
    })

    if (!user) {
      throw new Error('Failed to create/find user')
    }

    // Create/Update Skill Assessment
    const existingAssessment = await prisma.skillAssessment.findFirst({
      where: { userId: user.id }
    })

    const assessmentData = {
      userId: user.id,
      overallLevel: 'advanced',
      strengths: JSON.stringify([
        'Dynamic Programming',
        'Graph Algorithms',
        'Tree Traversal',
        'Advanced Data Structures'
      ]),
      weaknesses: JSON.stringify([
        'System Design',
        'Bit Manipulation'
      ]),
      recommendations: JSON.stringify([
        'Focus on system design fundamentals',
        'Practice bit manipulation problems',
        'Advanced graph algorithms',
        'Competitive programming techniques'
      ]),
      confidenceScore: 92
    }

    if (existingAssessment) {
      await prisma.skillAssessment.update({
        where: { id: existingAssessment.id },
        data: assessmentData
      })
      console.log('Skill assessment updated')
    } else {
      await prisma.skillAssessment.create({
        data: assessmentData
      })
      console.log('Skill assessment created')
    }

    // Create Learning Path
    const existingLearningPath = await prisma.learningPath.findFirst({
      where: { userId: user.id }
    })

    const learningPathData = {
      userId: user.id,
      currentLevel: 'advanced',
      targetLevel: 'expert',
      roadmap: JSON.stringify([
        'Advanced Graph Algorithms',
        'System Design Fundamentals',
        'Advanced Dynamic Programming',
        'Competitive Programming Techniques',
        'Advanced Tree Algorithms',
        'Mathematical Algorithms'
      ]),
      immediateNextSteps: JSON.stringify([
        'Start with Advanced Graph Algorithms',
        'Review MST and shortest path algorithms',
        'Practice network flow problems'
      ]),
      longTermGoals: JSON.stringify([
        'Master system design principles',
        'Compete in programming contests',
        'Mentor junior developers'
      ]),
      practiceRecommendations: JSON.stringify([
        'Solve 5 hard graph problems per week',
        'Design 2 systems per month',
        'Participate in weekly contests'
      ])
    }

    if (existingLearningPath) {
      await prisma.learningPath.update({
        where: { id: existingLearningPath.id },
        data: learningPathData
      })
      console.log('Learning path updated')
    } else {
      await prisma.learningPath.create({
        data: learningPathData
      })
      console.log('Learning path created')
    }

    console.log('✅ Nyota user setup complete!')
    console.log('Login credentials:')
    console.log('Email: nyota@dsatutor.com')
    console.log('Password: user')
    console.log('Assessment Level: Advanced (92% score)')

  } catch (error) {
    console.error('Error creating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createNyotaUser()
