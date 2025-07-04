import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { currentProblemId, userScore, userPerformance, userCode, language } = req.body

    if (!currentProblemId) {
      return res.status(400).json({
        success: false,
        message: 'Current problem ID is required'
      })
    }

    // AI-powered next problem recommendation
    const nextProblemId = await getNextProblemRecommendation(
      currentProblemId,
      userScore,
      userPerformance,
      userCode,
      language
    )

    res.status(200).json({
      success: true,
      nextProblemId,
      reasoning: getRecommendationReasoning(userScore, userPerformance)
    })

  } catch (error) {
    console.error('Learning path error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

async function getNextProblemRecommendation(
  currentProblemId: string,
  userScore: number,
  userPerformance: any,
  userCode: string,
  language: string
): Promise<number> {
  const currentId = parseInt(currentProblemId)
  
  // Problem difficulty progression map
  const problemProgression = {
    '1': { next: 2, difficulty: 'Easy', category: 'Array' },
    '2': { next: 3, difficulty: 'Easy', category: 'Stack' },
    '3': { next: 4, difficulty: 'Medium', category: 'Dynamic Programming' },
    '4': { next: 5, difficulty: 'Easy', category: 'Linked List' },
    '5': { next: 6, difficulty: 'Easy', category: 'Array' },
    '6': { next: 7, difficulty: 'Easy', category: 'Linked List' },
    '7': { next: 8, difficulty: 'Easy', category: 'Dynamic Programming' },
    '8': { next: 9, difficulty: 'Easy', category: 'String' },
    '9': { next: 10, difficulty: 'Easy', category: 'Tree' },
    '10': { next: 11, difficulty: 'Easy', category: 'Tree' },
    '11': { next: 12, difficulty: 'Easy', category: 'Math' },
    '12': { next: 13, difficulty: 'Easy', category: 'Array' },
    '13': { next: 14, difficulty: 'Easy', category: 'Array' },
    '14': { next: 15, difficulty: 'Easy', category: 'Sorting & Searching' },
    '15': { next: 1, difficulty: 'Easy', category: 'Bit Manipulation' } // Loop back to start
  }

  // Get current problem info
  const currentProblem = problemProgression[currentId as keyof typeof problemProgression]
  
  if (!currentProblem) {
    // Fallback to next sequential problem
    return currentId + 1 > 15 ? 1 : currentId + 1
  }

  // AI logic for next problem selection based on performance
  if (userScore >= 90) {
    // High performer - suggest more challenging problems
    return getChallengingProblem(currentId, currentProblem.category)
  } else if (userScore >= 70) {
    // Good performer - suggest similar difficulty but different category
    return getSimilarDifficultyProblem(currentId, currentProblem.category)
  } else {
    // Struggling - suggest easier problems or similar problems
    return getEasierProblem(currentId, currentProblem.category)
  }
}

function getChallengingProblem(currentId: number, category: string): number {
  // For high performers, suggest harder problems in the same category
  const challengingMap: { [key: string]: number[] } = {
    'Array': [3, 5], // Maximum Subarray, Best Time to Buy and Sell Stock
    'Stack': [2], // Valid Parentheses
    'Dynamic Programming': [3, 7], // Maximum Subarray, Climbing Stairs
    'Linked List': [4, 6], // Merge Two Sorted Lists, Reverse Linked List
    'String': [8], // Valid Anagram
    'Tree': [9, 10], // Binary Tree Inorder Traversal, Maximum Depth
    'Math': [11], // Palindrome Number
    'Sorting & Searching': [14], // Binary Search
    'Bit Manipulation': [15] // Single Number
  }
  
  const challengingProblems = challengingMap[category] || []
  const availableProblems = challengingProblems.filter(id => id !== currentId)
  
  return availableProblems.length > 0 ? availableProblems[0] : (currentId + 1 > 15 ? 1 : currentId + 1)
}

function getSimilarDifficultyProblem(currentId: number, category: string): number {
  // For good performers, suggest problems in different categories but similar difficulty
  const categoryRotation = {
    'Array': ['Stack', 'String', 'Math'],
    'Stack': ['Array', 'Linked List', 'String'],
    'Dynamic Programming': ['Array', 'Linked List', 'Tree'],
    'Linked List': ['Array', 'Stack', 'Tree'],
    'String': ['Array', 'Stack', 'Math'],
    'Tree': ['Linked List', 'Dynamic Programming', 'Array'],
    'Math': ['Array', 'String', 'Bit Manipulation'],
    'Sorting & Searching': ['Array', 'String', 'Math'],
    'Bit Manipulation': ['Math', 'Array', 'String']
  }
  
  const nextCategories = categoryRotation[category as keyof typeof categoryRotation] || ['Array']
  const nextCategory = nextCategories[0]
  
  // Find a problem in the next category
  const categoryProblems = {
    'Array': [1, 5, 12, 13],
    'Stack': [2],
    'Dynamic Programming': [3, 7],
    'Linked List': [4, 6],
    'String': [8],
    'Tree': [9, 10],
    'Math': [11],
    'Sorting & Searching': [14],
    'Bit Manipulation': [15]
  }
  
  const problemsInCategory = categoryProblems[nextCategory as keyof typeof categoryProblems] || [1]
  const availableProblems = problemsInCategory.filter(id => id !== currentId)
  
  return availableProblems.length > 0 ? availableProblems[0] : (currentId + 1 > 15 ? 1 : currentId + 1)
}

function getEasierProblem(currentId: number, category: string): number {
  // For struggling users, suggest easier problems or similar problems for practice
  const easierProblems = [1, 2, 4, 5, 7, 8, 10, 11, 12, 13, 14, 15] // Easy problems
  const availableProblems = easierProblems.filter(id => id !== currentId)
  
  return availableProblems.length > 0 ? availableProblems[0] : (currentId + 1 > 15 ? 1 : currentId + 1)
}

function getRecommendationReasoning(userScore: number, userPerformance: any): string {
  if (userScore >= 90) {
    return "Excellent performance! You're ready for more challenging problems that will push your skills further."
  } else if (userScore >= 70) {
    return "Good work! Let's try a different category to broaden your problem-solving skills."
  } else {
    return "Keep practicing! I've selected an easier problem to help you build confidence and understanding."
  }
} 