import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { level, score, userId, strengths, weaknesses, categoryPerformance } = await request.json()

    // Advanced curriculum for proficient users (score 90+)
    if (level === 'advanced' || score >= 90) {
      const advancedCurriculum = {
        tree: [
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
        ],
        metadata: {
          totalTopics: 9,
          estimatedTotalTime: 1720, // ~29 hours
          difficulty: 'Advanced',
          focusAreas: strengths?.length > 0 ? strengths : [
            'Advanced Graph Algorithms',
            'Dynamic Programming',
            'System Design'
          ],
          improvementAreas: weaknesses?.length > 0 ? weaknesses : [
            'System Design',
            'Bit Manipulation'
          ],
          personalizedNotes: [
            'Curriculum optimized for advanced practitioners',
            'Focus on interview-level complexity problems',
            'Includes system design and competitive programming elements',
            'Emphasis on optimization and advanced techniques'
          ]
        }
      }

      return NextResponse.json({
        success: true,
        data: advancedCurriculum,
        message: 'Advanced curriculum generated successfully'
      })
    }

    // Fallback for intermediate/beginner users
    const standardCurriculum = {
      tree: [
        {
          id: 'arrays-basics',
          title: 'Arrays & Basic Operations',
          description: 'Foundation array manipulation and basic algorithms',
          difficulty: 'Easy',
          estimatedTime: 60,
          prerequisites: [],
          children: ['sorting-searching'],
          parents: [],
          category: 'Fundamentals',
          status: 'available'
        },
        {
          id: 'sorting-searching',
          title: 'Sorting & Searching',
          description: 'Classic algorithms for sorting and searching',
          difficulty: 'Medium',
          estimatedTime: 90,
          prerequisites: ['arrays-basics'],
          children: ['data-structures'],
          parents: ['arrays-basics'],
          category: 'Algorithms',
          status: 'locked'
        },
        {
          id: 'data-structures',
          title: 'Core Data Structures',
          description: 'Stacks, queues, linked lists, and trees',
          difficulty: 'Medium',
          estimatedTime: 120,
          prerequisites: ['sorting-searching'],
          children: ['dynamic-programming'],
          parents: ['sorting-searching'],
          category: 'Data Structures',
          status: 'locked'
        },
        {
          id: 'dynamic-programming',
          title: 'Dynamic Programming',
          description: 'Introduction to DP concepts and common patterns',
          difficulty: 'Hard',
          estimatedTime: 150,
          prerequisites: ['data-structures'],
          children: [],
          parents: ['data-structures'],
          category: 'Advanced Topics',
          status: 'locked'
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: standardCurriculum,
      message: 'Curriculum generated successfully'
    })

  } catch (error) {
    console.error('Error generating curriculum:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate curriculum' },
      { status: 500 }
    )
  }
}
