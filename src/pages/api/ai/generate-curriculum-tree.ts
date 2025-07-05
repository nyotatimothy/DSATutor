import { NextApiRequest, NextApiResponse } from 'next'

interface TreeNode {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimatedTime: number
  prerequisites: string[]
  children: string[]
  parents: string[]
  category: string
  status: 'locked' | 'available' | 'completed'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { level, score, userId } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      })
    }

    // Generate curriculum tree based on level and score
    const tree = generateCurriculumTree(level, score)

    res.status(200).json({
      success: true,
      data: {
        tree,
        level,
        score
      }
    })

  } catch (error) {
    console.error('Curriculum tree generation error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

function generateCurriculumTree(level: string, score: number): TreeNode[] {
  const baseTopics = [
    {
      id: 'sliding-window',
      title: 'Sliding Window',
      description: 'Master the sliding window technique for efficient array and string processing',
      difficulty: 'Medium' as const,
      estimatedTime: 90,
      prerequisites: [],
      children: ['two-pointers', 'fast-slow-pointers'],
      parents: [],
      category: 'Array Techniques',
      status: 'available' as const
    },
    {
      id: 'two-pointers',
      title: 'Two Pointers',
      description: 'Learn to use two pointers for efficient array traversal and manipulation',
      difficulty: 'Medium' as const,
      estimatedTime: 75,
      prerequisites: ['sliding-window'],
      children: ['merge-intervals', 'cyclic-sort'],
      parents: ['sliding-window'],
      category: 'Array Techniques',
      status: 'locked' as const
    },
    {
      id: 'fast-slow-pointers',
      title: 'Fast and Slow Pointers',
      description: 'Use two pointers moving at different speeds to detect cycles and find middle elements',
      difficulty: 'Medium' as const,
      estimatedTime: 60,
      prerequisites: ['sliding-window'],
      children: ['linked-list-reversal'],
      parents: ['sliding-window'],
      category: 'Linked List',
      status: 'locked' as const
    },
    {
      id: 'merge-intervals',
      title: 'Merge Intervals',
      description: 'Learn to merge overlapping intervals efficiently',
      difficulty: 'Medium' as const,
      estimatedTime: 45,
      prerequisites: ['two-pointers'],
      children: ['tree-bfs'],
      parents: ['two-pointers'],
      category: 'Intervals',
      status: 'locked' as const
    },
    {
      id: 'cyclic-sort',
      title: 'Cyclic Sort',
      description: 'Master the cyclic sort pattern for arrays with numbers in a given range',
      difficulty: 'Hard' as const,
      estimatedTime: 60,
      prerequisites: ['two-pointers'],
      children: ['tree-dfs'],
      parents: ['two-pointers'],
      category: 'Sorting',
      status: 'locked' as const
    },
    {
      id: 'linked-list-reversal',
      title: 'In-place Reversal of Linked List',
      description: 'Learn to reverse linked lists and detect cycles efficiently',
      difficulty: 'Medium' as const,
      estimatedTime: 75,
      prerequisites: ['fast-slow-pointers'],
      children: ['tree-bfs'],
      parents: ['fast-slow-pointers'],
      category: 'Linked List',
      status: 'locked' as const
    },
    {
      id: 'tree-bfs',
      title: 'Tree Breadth First Search',
      description: 'Master level-order traversal and BFS for tree problems',
      difficulty: 'Medium' as const,
      estimatedTime: 90,
      prerequisites: ['merge-intervals', 'linked-list-reversal'],
      children: ['tree-dfs'],
      parents: ['merge-intervals', 'linked-list-reversal'],
      category: 'Trees',
      status: 'locked' as const
    },
    {
      id: 'tree-dfs',
      title: 'Tree Depth First Search',
      description: 'Learn preorder, inorder, and postorder traversals for tree problems',
      difficulty: 'Medium' as const,
      estimatedTime: 90,
      prerequisites: ['cyclic-sort', 'tree-bfs'],
      children: [],
      parents: ['cyclic-sort', 'tree-bfs'],
      category: 'Trees',
      status: 'locked' as const
    }
  ]

  // Customize tree based on level and score
  const customizedTree = customizeTreeForLevel(baseTopics, level, score)

  return customizedTree
}

function customizeTreeForLevel(tree: TreeNode[], level: string, score: number): TreeNode[] {
  const customizedTree = [...tree]

  // Adjust based on level
  if (level === 'beginner') {
    // Add more basic topics for beginners
    customizedTree.unshift({
      id: 'arrays-basics',
      title: 'Arrays Basics',
      description: 'Learn fundamental array operations and manipulation',
      difficulty: 'Easy',
      estimatedTime: 60,
      prerequisites: [],
      children: ['sliding-window'],
      parents: [],
      category: 'Fundamentals',
      status: 'available'
    })

    // Update sliding window to depend on arrays basics
    const slidingWindow = customizedTree.find(node => node.id === 'sliding-window')
    if (slidingWindow) {
      slidingWindow.prerequisites = ['arrays-basics']
      slidingWindow.parents = ['arrays-basics']
    }

    // Make some topics easier for beginners
    customizedTree.forEach(node => {
      if (node.difficulty === 'Hard') {
        node.difficulty = 'Medium'
        node.estimatedTime = Math.round(node.estimatedTime * 1.2) // More time for beginners
      }
    })

  } else if (level === 'expert') {
    // Add advanced topics for experts
    customizedTree.push({
      id: 'dynamic-programming',
      title: 'Dynamic Programming',
      description: 'Master advanced DP patterns and optimization techniques',
      difficulty: 'Hard',
      estimatedTime: 120,
      prerequisites: ['tree-dfs'],
      children: [],
      parents: ['tree-dfs'],
      category: 'Advanced Algorithms',
      status: 'locked'
    })

    // Make topics more challenging
    customizedTree.forEach(node => {
      if (node.difficulty === 'Medium') {
        node.difficulty = 'Hard'
        node.estimatedTime = Math.round(node.estimatedTime * 0.8) // Less time for experts
      }
    })
  }

  // Adjust based on score
  if (score >= 80) {
    // High performers get more topics unlocked initially
    customizedTree.forEach(node => {
      if (node.status === 'locked' && node.prerequisites.length === 1) {
        node.status = 'available'
      }
    })
  } else if (score < 50) {
    // Lower performers get more basic topics
    customizedTree.forEach(node => {
      if (node.difficulty === 'Hard') {
        node.status = 'locked'
      }
    })
  }

  return customizedTree
} 