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
    const { level, score, userId, strengths, weaknesses, categoryPerformance } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      })
    }

    // Generate personalized curriculum tree based on user's assessment results
    const tree = generatePersonalizedCurriculumTree(level, score, strengths, weaknesses, categoryPerformance)

    res.status(200).json({
      success: true,
      data: {
        tree,
        level,
        score,
        personalizationFactors: {
          strengths,
          weaknesses,
          categoryPerformance
        }
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

function generatePersonalizedCurriculumTree(
  level: string, 
  score: number, 
  strengths: string[] = [], 
  weaknesses: string[] = [], 
  categoryPerformance: any = {}
): TreeNode[] {
  
  // Advanced curriculum for highly proficient users
  if (level === 'advanced' || score >= 90) {
    return [
      {
        id: 'advanced-graphs',
        title: 'Advanced Graph Algorithms',
        description: 'Master complex graph problems including MST, shortest paths, and network flows',
        difficulty: 'Hard',
        estimatedTime: 180,
        prerequisites: [],
        children: ['advanced-dp', 'system-design-fundamentals'],
        parents: [],
        category: 'Advanced Topics',
        status: 'available'
      },
      {
        id: 'advanced-dp',
        title: 'Advanced Dynamic Programming',
        description: 'Complex DP patterns: digit DP, bitmask DP, tree DP, and optimization techniques',
        difficulty: 'Hard',
        estimatedTime: 240,
        prerequisites: ['advanced-graphs'],
        children: ['competitive-programming', 'advanced-trees'],
        parents: ['advanced-graphs'],
        category: 'Advanced Topics',
        status: 'locked'
      },
      {
        id: 'system-design-fundamentals',
        title: 'System Design Fundamentals',
        description: 'Scalability, distributed systems, and architectural patterns for interviews',
        difficulty: 'Hard',
        estimatedTime: 300,
        prerequisites: ['advanced-graphs'],
        children: ['advanced-algorithms'],
        parents: ['advanced-graphs'],
        category: 'System Design',
        status: 'locked'
      },
      {
        id: 'competitive-programming',
        title: 'Competitive Programming Techniques',
        description: 'Advanced algorithms and data structures for competitive programming',
        difficulty: 'Hard',
        estimatedTime: 200,
        prerequisites: ['advanced-dp'],
        children: ['advanced-string-algorithms'],
        parents: ['advanced-dp'],
        category: 'Competitive Programming',
        status: 'locked'
      },
      {
        id: 'advanced-trees',
        title: 'Advanced Tree Algorithms',
        description: 'Heavy-light decomposition, centroid decomposition, and advanced tree DP',
        difficulty: 'Hard',
        estimatedTime: 160,
        prerequisites: ['advanced-dp'],
        children: ['advanced-string-algorithms'],
        parents: ['advanced-dp'],
        category: 'Advanced Data Structures',
        status: 'locked'
      },
      {
        id: 'advanced-algorithms',
        title: 'Advanced Algorithms & Optimization',
        description: 'Linear programming, network flows, and advanced optimization techniques',
        difficulty: 'Hard',
        estimatedTime: 220,
        prerequisites: ['system-design-fundamentals'],
        children: ['bit-manipulation-advanced'],
        parents: ['system-design-fundamentals'],
        category: 'Advanced Algorithms',
        status: 'locked'
      },
      {
        id: 'advanced-string-algorithms',
        title: 'Advanced String Processing',
        description: 'KMP, Z-algorithm, suffix arrays, and advanced string matching',
        difficulty: 'Hard',
        estimatedTime: 140,
        prerequisites: ['competitive-programming', 'advanced-trees'],
        children: ['mathematical-algorithms'],
        parents: ['competitive-programming', 'advanced-trees'],
        category: 'String Algorithms',
        status: 'locked'
      },
      {
        id: 'bit-manipulation-advanced',
        title: 'Advanced Bit Manipulation',
        description: 'Complex bit manipulation techniques and bit-level optimizations',
        difficulty: 'Hard',
        estimatedTime: 100,
        prerequisites: ['advanced-algorithms'],
        children: ['mathematical-algorithms'],
        parents: ['advanced-algorithms'],
        category: 'Bit Manipulation',
        status: 'locked'
      },
      {
        id: 'mathematical-algorithms',
        title: 'Mathematical Algorithms',
        description: 'Number theory, combinatorics, and mathematical problem solving',
        difficulty: 'Hard',
        estimatedTime: 180,
        prerequisites: ['advanced-string-algorithms', 'bit-manipulation-advanced'],
        children: [],
        parents: ['advanced-string-algorithms', 'bit-manipulation-advanced'],
        category: 'Mathematics',
        status: 'locked'
      }
    ]
  }

  const baseTopics = [
    {
      id: 'arrays-hashing',
      title: 'Arrays & Hashing',
      description: 'Arrays & Hashing combines basic array operations with hash table lookups to solve problems efficiently, often achieving O(1) time complexity for element access and manipulation.',
      difficulty: 'Medium' as const,
      estimatedTime: 90,
      prerequisites: [],
      children: ['two-pointers', 'stack'],
      parents: [],
      category: 'Array Techniques',
      status: 'available' as const
    },
    {
      id: 'two-pointers',
      title: 'Two Pointers',
      description: 'Two Pointers technique uses two indices to traverse arrays or linked lists simultaneously, enabling efficient solutions for problems involving pairs, subarrays, or linked list manipulation.',
      difficulty: 'Medium' as const,
      estimatedTime: 75,
      prerequisites: ['arrays-hashing'],
      children: ['binary-search', 'sliding-window', 'linked-list'],
      parents: ['arrays-hashing'],
      category: 'Array Techniques',
      status: 'locked' as const
    },
    {
      id: 'stack',
      title: 'Stack',
      description: 'Stack is a LIFO data structure that excels at tracking state and managing nested operations, commonly used for parentheses matching, function calls, and depth-first traversal.',
      difficulty: 'Medium' as const,
      estimatedTime: 60,
      prerequisites: ['arrays-hashing'],
      children: ['linked-list'],
      parents: ['arrays-hashing'],
      category: 'Data Structures',
      status: 'locked' as const
    },
    {
      id: 'binary-search',
      title: 'Binary Search',
      description: 'Binary Search efficiently finds elements in sorted arrays by repeatedly dividing the search space in half, achieving O(log n) time complexity for search operations.',
      difficulty: 'Medium' as const,
      estimatedTime: 60,
      prerequisites: ['two-pointers'],
      children: ['trees'],
      parents: ['two-pointers'],
      category: 'Search Algorithms',
      status: 'locked' as const
    },
    {
      id: 'sliding-window',
      title: 'Sliding Window',
      description: 'Sliding window is a technique that efficiently processes subarrays or substrings by maintaining a moving range over the data, avoiding redundant calculations.',
      difficulty: 'Medium' as const,
      estimatedTime: 90,
      prerequisites: ['two-pointers'],
      children: ['trees'],
      parents: ['two-pointers'],
      category: 'Array Techniques',
      status: 'locked' as const
    },
    {
      id: 'linked-list',
      title: 'Linked List',
      description: 'Linked Lists are linear data structures where elements are connected via pointers, enabling efficient insertions/deletions and supporting various traversal patterns.',
      difficulty: 'Medium' as const,
      estimatedTime: 75,
      prerequisites: ['two-pointers', 'stack'],
      children: ['trees'],
      parents: ['two-pointers', 'stack'],
      category: 'Data Structures',
      status: 'locked' as const
    },
    {
      id: 'trees',
      title: 'Trees',
      description: 'Trees are hierarchical data structures that model parent-child relationships, supporting efficient search, insertion, and traversal operations with various algorithms.',
      difficulty: 'Medium' as const,
      estimatedTime: 90,
      prerequisites: ['binary-search', 'sliding-window', 'linked-list'],
      children: ['tries', 'heap', 'backtracking'],
      parents: ['binary-search', 'sliding-window', 'linked-list'],
      category: 'Data Structures',
      status: 'locked' as const
    },
    {
      id: 'tries',
      title: 'Tries',
      description: 'Tries (prefix trees) are specialized tree structures for storing strings, enabling efficient prefix searches, autocomplete, and string-based operations.',
      difficulty: 'Hard' as const,
      estimatedTime: 60,
      prerequisites: ['trees'],
      children: [],
      parents: ['trees'],
      category: 'Advanced Data Structures',
      status: 'locked' as const
    },
    {
      id: 'heap',
      title: 'Heap / P.Queue',
      description: 'Heap / Priority Queue maintains elements in a specific order, allowing efficient access to the maximum or minimum element, commonly used for scheduling and optimization problems.',
      difficulty: 'Medium' as const,
      estimatedTime: 75,
      prerequisites: ['trees'],
      children: [],
      parents: ['trees'],
      category: 'Data Structures',
      status: 'locked' as const
    },
    {
      id: 'backtracking',
      title: 'Backtracking',
      description: 'Backtracking systematically explores all possible solutions by building candidates incrementally and abandoning partial solutions that cannot lead to valid results.',
      difficulty: 'Hard' as const,
      estimatedTime: 90,
      prerequisites: ['trees'],
      children: ['graphs', 'dp'],
      parents: ['trees'],
      category: 'Algorithms',
      status: 'locked' as const
    },
    {
      id: 'graphs',
      title: 'Graphs',
      description: 'Graphs model relationships between entities using nodes and edges, supporting algorithms for pathfinding, connectivity analysis, and network optimization.',
      difficulty: 'Hard' as const,
      estimatedTime: 120,
      prerequisites: ['backtracking'],
      children: [],
      parents: ['backtracking'],
      category: 'Advanced Algorithms',
      status: 'locked' as const
    },
    {
      id: 'dp',
      title: '1-D DP',
      description: '1-D Dynamic Programming solves complex problems by breaking them into simpler subproblems and storing results to avoid redundant calculations.',
      difficulty: 'Hard' as const,
      estimatedTime: 120,
      prerequisites: ['backtracking'],
      children: [],
      parents: ['backtracking'],
      category: 'Advanced Algorithms',
      status: 'locked' as const
    }
  ]

  // Personalize tree based on user's assessment results
  const personalizedTree = personalizeTreeForUser(baseTopics, level, score, strengths, weaknesses, categoryPerformance)

  return personalizedTree
}

function personalizeTreeForUser(
  tree: TreeNode[], 
  level: string, 
  score: number, 
  strengths: string[], 
  weaknesses: string[], 
  categoryPerformance: any
): TreeNode[] {
  const personalizedTree = [...tree]

  // Map topic categories to assessment categories
  const categoryMapping: { [key: string]: string[] } = {
    'arrays': ['arrays-hashing', 'two-pointers', 'sliding-window'],
    'data-structures': ['stack', 'linked-list', 'trees', 'tries', 'heap'],
    'algorithms': ['binary-search', 'backtracking', 'graphs', 'dp'],
    'search': ['binary-search'],
    'optimization': ['sliding-window', 'heap', 'dp']
  }

  // Adjust based on user's strengths and weaknesses
  strengths.forEach(strength => {
    const relatedTopics = categoryMapping[strength.toLowerCase()] || []
    relatedTopics.forEach(topicId => {
      const topic = personalizedTree.find(t => t.id === topicId)
      if (topic) {
        // Make strong topics available earlier and reduce time
        topic.status = 'available'
        topic.estimatedTime = Math.round(topic.estimatedTime * 0.8)
        topic.difficulty = topic.difficulty === 'Hard' ? 'Medium' : topic.difficulty
      }
    })
  })

  weaknesses.forEach(weakness => {
    const relatedTopics = categoryMapping[weakness.toLowerCase()] || []
    relatedTopics.forEach(topicId => {
      const topic = personalizedTree.find(t => t.id === topicId)
      if (topic) {
        // Increase time for weak topics and add prerequisites
        topic.estimatedTime = Math.round(topic.estimatedTime * 1.3)
        if (topic.difficulty === 'Medium') {
          topic.difficulty = 'Hard'
        }
      }
    })
  })

  // Adjust based on category performance
  Object.entries(categoryPerformance).forEach(([category, performance]: [string, any]) => {
    const relatedTopics = categoryMapping[category.toLowerCase()] || []
    const performanceScore = typeof performance === 'number' ? performance : 0
    
    relatedTopics.forEach(topicId => {
      const topic = personalizedTree.find(t => t.id === topicId)
      if (topic) {
        if (performanceScore >= 80) {
          // High performance - make available and reduce time
          topic.status = 'available'
          topic.estimatedTime = Math.round(topic.estimatedTime * 0.9)
        } else if (performanceScore < 50) {
          // Low performance - increase time and difficulty
          topic.estimatedTime = Math.round(topic.estimatedTime * 1.4)
          if (topic.difficulty === 'Medium') {
            topic.difficulty = 'Hard'
          }
        }
      }
    })
  })

  // Adjust based on overall level and score
  if (level === 'beginner') {
    // Add more basic topics for beginners
    personalizedTree.unshift({
      id: 'arrays-basics',
      title: 'Arrays Basics',
      description: 'Learn fundamental array operations and manipulation',
      difficulty: 'Easy',
      estimatedTime: 60,
      prerequisites: [],
      children: ['arrays-hashing'],
      parents: [],
      category: 'Fundamentals',
      status: 'available'
    })

    // Update arrays-hashing to depend on arrays basics
    const arraysHashing = personalizedTree.find(node => node.id === 'arrays-hashing')
    if (arraysHashing) {
      arraysHashing.prerequisites = ['arrays-basics']
      arraysHashing.parents = ['arrays-basics']
    }

    // Make some topics easier for beginners
    personalizedTree.forEach(node => {
      if (node.difficulty === 'Hard') {
        node.difficulty = 'Medium'
        node.estimatedTime = Math.round(node.estimatedTime * 1.2)
      }
    })

  } else if (level === 'expert') {
    // Add advanced topics for experts
    personalizedTree.push({
      id: 'advanced-dp',
      title: 'Advanced Dynamic Programming',
      description: 'Master complex DP patterns and optimization techniques',
      difficulty: 'Hard',
      estimatedTime: 150,
      prerequisites: ['dp'],
      children: [],
      parents: ['dp'],
      category: 'Advanced Algorithms',
      status: 'locked'
    })

    // Make topics more challenging
    personalizedTree.forEach(node => {
      if (node.difficulty === 'Medium') {
        node.difficulty = 'Hard'
        node.estimatedTime = Math.round(node.estimatedTime * 0.8)
      }
    })
  }

  // Adjust based on score
  if (score >= 80) {
    // High performers get more topics unlocked initially
    personalizedTree.forEach(node => {
      if (node.status === 'locked' && node.prerequisites.length === 1) {
        node.status = 'available'
      }
    })
  } else if (score < 50) {
    // Lower performers get more basic topics and longer time
    personalizedTree.forEach(node => {
      if (node.difficulty === 'Hard') {
        node.status = 'locked'
        node.estimatedTime = Math.round(node.estimatedTime * 1.5)
      }
    })
  }

  return personalizedTree
}
