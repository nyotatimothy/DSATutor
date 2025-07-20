import { NextApiRequest, NextApiResponse } from 'next'

interface Problem {
  question: string;
  tags: string[];
  realWorldInspired: boolean;
  difficulty: "easy" | "medium" | "hard";
  hints?: string[];
  estimatedTime: string;
}

interface Subtopic {
  title: string;
  description: string;
  problems: Problem[];
}

interface CurriculumTopic {
  id: string;
  title: string;
  level: "easy" | "medium" | "hard";
  timeEstimate: string;
  description: string;
  category: string;
  subtopics: Subtopic[];
  status: 'available' | 'locked' | 'completed';
  prerequisites: string[];
}

interface CurriculumResponse {
  topics: CurriculumTopic[];
  metadata: {
    totalTopics: number;
    estimatedTotalTime: string;
    difficulty: string;
    focusAreas: string[];
    improvementAreas: string[];
    personalizedNotes: string[];
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { level, score, userId, strengths, weaknesses, categoryPerformance } = req.body

    console.log('Generating curriculum for:', { level, score, strengths, weaknesses });

    // Generate curriculum based on user profile
    const curriculum = generatePersonalizedCurriculum(level, score, strengths, weaknesses, categoryPerformance);

    res.status(200).json({
      success: true,
      data: curriculum,
      message: 'Curriculum generated successfully'
    })

  } catch (error) {
    console.error('Curriculum generation error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

function generatePersonalizedCurriculum(
  level: string,
  score: number,
  strengths: string[] = [],
  weaknesses: string[] = [],
  categoryPerformance: any = {}
): CurriculumResponse {

  // Advanced curriculum for proficient users (score >= 90)
  if (level === 'advanced' || score >= 90) {
    return {
      topics: [
        {
          id: 'advanced-graphs',
          title: 'Advanced Graph Algorithms',
          level: 'hard',
          timeEstimate: '3-4 hours',
          description: 'Master complex graph problems including MST, shortest paths, and network flows',
          category: 'Advanced Algorithms',
          status: 'available',
          prerequisites: [],
          subtopics: [
            {
              title: 'Minimum Spanning Trees',
              description: 'Understand Kruskal\'s and Prim\'s algorithms for finding MSTs',
              problems: [
                {
                  question: 'Design a network infrastructure system that connects all offices with minimum cable cost while ensuring redundancy for critical connections.',
                  tags: ['MST', 'Greedy', 'Union-Find'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  hints: ['Think about edge weights representing costs', 'Consider using Union-Find for cycle detection'],
                  estimatedTime: '45 mins'
                },
                {
                  question: 'Given a weighted graph representing flight routes, find the minimum cost to connect all cities such that there\'s at least one path between any two cities.',
                  tags: ['MST', 'Kruskal', 'Graph'],
                  realWorldInspired: true,
                  difficulty: 'medium',
                  estimatedTime: '30 mins'
                },
                {
                  question: 'Minimum Cost to Connect All Points',
                  tags: ['MST', 'Kruskal', 'Prim'],
                  realWorldInspired: false,
                  difficulty: 'medium',
                  estimatedTime: '35 mins'
                },
                {
                  question: 'Optimize Water Distribution in Smart City',
                  tags: ['MST', 'Infrastructure', 'Optimization'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '50 mins'
                },
                {
                  question: 'Find Cheapest Flights with One Stop',
                  tags: ['MST', 'Graph', 'Dynamic Programming'],
                  realWorldInspired: true,
                  difficulty: 'medium',
                  estimatedTime: '40 mins'
                },
                {
                  question: 'Critical Connections in a Network',
                  tags: ['MST', 'Bridges', 'DFS'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '55 mins'
                },
                {
                  question: 'Minimum Spanning Tree with Node Weights',
                  tags: ['MST', 'Modified Algorithm', 'Greedy'],
                  realWorldInspired: false,
                  difficulty: 'hard',
                  estimatedTime: '60 mins'
                },
                {
                  question: 'Design Redundant Internet Backbone',
                  tags: ['MST', 'Network Design', 'Redundancy'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '65 mins'
                }
              ]
            },
            {
              title: 'Network Flow Algorithms',
              description: 'Learn max flow, min cut, and bipartite matching problems',
              problems: [
                {
                  question: 'Design a traffic management system that optimizes vehicle flow through a city network during peak hours.',
                  tags: ['Max Flow', 'Network', 'Optimization'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '60 mins'
                },
                {
                  question: 'Build a load balancer that distributes requests across servers while respecting capacity constraints.',
                  tags: ['Flow Network', 'Capacity', 'Balancing'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '50 mins'
                },
                {
                  question: 'Maximum Flow in Network',
                  tags: ['Ford-Fulkerson', 'Max Flow', 'Graph'],
                  realWorldInspired: false,
                  difficulty: 'hard',
                  estimatedTime: '45 mins'
                },
                {
                  question: 'Minimum Cut in Flow Network',
                  tags: ['Min Cut', 'Max Flow', 'Optimization'],
                  realWorldInspired: false,
                  difficulty: 'hard',
                  estimatedTime: '55 mins'
                },
                {
                  question: 'Maximum Bipartite Matching',
                  tags: ['Bipartite', 'Matching', 'Flow Network'],
                  realWorldInspired: false,
                  difficulty: 'medium',
                  estimatedTime: '40 mins'
                },
                {
                  question: 'Design Water Distribution Network',
                  tags: ['Flow Network', 'Infrastructure', 'Optimization'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '70 mins'
                },
                {
                  question: 'Airline Route Optimization',
                  tags: ['Max Flow', 'Transportation', 'Capacity'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '65 mins'
                },
                {
                  question: 'Hospital Staff Scheduling',
                  tags: ['Bipartite Matching', 'Scheduling', 'Healthcare'],
                  realWorldInspired: true,
                  difficulty: 'medium',
                  estimatedTime: '50 mins'
                },
                {
                  question: 'Network Bandwidth Allocation',
                  tags: ['Flow Network', 'Bandwidth', 'QoS'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '60 mins'
                },
                {
                  question: 'Supply Chain Flow Optimization',
                  tags: ['Max Flow', 'Supply Chain', 'Logistics'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '75 mins'
                }
              ]
            }
          ]
        },
        {
          id: 'system-design',
          title: 'System Design Fundamentals',
          level: 'hard',
          timeEstimate: '4-5 hours',
          description: 'Learn to design scalable systems and architectural patterns',
          category: 'System Architecture',
          status: 'locked',
          prerequisites: ['advanced-graphs'],
          subtopics: [
            {
              title: 'Scalable Web Services',
              description: 'Design distributed systems that handle millions of users',
              problems: [
                {
                  question: 'Design a URL shortening service like bit.ly that handles 100M URLs per day with sub-100ms response time.',
                  tags: ['Distributed Systems', 'Caching', 'Database'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '90 mins'
                },
                {
                  question: 'Design a real-time messaging system that supports group chats for 10M concurrent users.',
                  tags: ['WebSockets', 'Message Queue', 'Scaling'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '75 mins'
                }
              ]
            },
            {
              title: 'Data-Intensive Systems',
              description: 'Handle big data and streaming scenarios',
              problems: [
                {
                  question: 'Design a recommendation engine that processes user behavior in real-time to suggest products.',
                  tags: ['Machine Learning', 'Streaming', 'Big Data'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '80 mins'
                }
              ]
            }
          ]
        },
        {
          id: 'advanced-dp',
          title: 'Advanced Dynamic Programming',
          level: 'hard',
          timeEstimate: '3-4 hours',
          description: 'Master complex DP patterns including digit DP, bitmask DP, and optimization',
          category: 'Advanced Algorithms',
          status: 'locked',
          prerequisites: ['advanced-graphs'],
          subtopics: [
            {
              title: 'Digit DP & Number Theory',
              description: 'Solve problems involving digit constraints and patterns',
              problems: [
                {
                  question: 'Count valid credit card numbers that satisfy specific digit sum and pattern constraints for fraud detection.',
                  tags: ['Digit DP', 'Constraints', 'Pattern'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '60 mins'
                },
                {
                  question: 'Generate optimal pricing strategies where prices follow mathematical constraints based on market analysis.',
                  tags: ['DP', 'Optimization', 'Business Logic'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '55 mins'
                }
              ]
            },
            {
              title: 'Bitmask DP',
              description: 'Efficient state compression using bitwise operations',
              problems: [
                {
                  question: 'Optimize server resource allocation where each server has specific capability flags and tasks have requirement masks.',
                  tags: ['Bitmask', 'Optimization', 'Resource Management'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '50 mins'
                }
              ]
            }
          ]
        },
        {
          id: 'competitive-programming',
          title: 'Competitive Programming Techniques',
          level: 'hard',
          timeEstimate: '3-4 hours',
          description: 'Advanced algorithms and optimization techniques for contests',
          category: 'Competitive Programming',
          status: 'locked',
          prerequisites: ['advanced-dp'],
          subtopics: [
            {
              title: 'Advanced Data Structures',
              description: 'Segment trees, Fenwick trees, and persistent structures',
              problems: [
                {
                  question: 'Build a real-time analytics dashboard that efficiently handles range sum queries and updates on streaming data.',
                  tags: ['Segment Tree', 'Range Query', 'Real-time'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '65 mins'
                }
              ]
            }
          ]
        },
        {
          id: 'bit-manipulation-advanced',
          title: 'Advanced Bit Manipulation',
          level: 'hard',
          timeEstimate: '2-3 hours',
          description: 'Complex bit manipulation techniques and optimizations',
          category: 'Bit Operations',
          status: 'locked',
          prerequisites: ['system-design'],
          subtopics: [
            {
              title: 'Bitwise Optimization',
              description: 'Optimize algorithms using clever bit operations',
              problems: [
                {
                  question: 'Implement a memory-efficient bloom filter for a web crawler to avoid revisiting URLs.',
                  tags: ['Bit Operations', 'Hashing', 'Memory Optimization'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '45 mins'
                },
                {
                  question: 'Design a compression algorithm that uses bitwise operations to reduce data size for network transmission.',
                  tags: ['Compression', 'Bit Manipulation', 'Optimization'],
                  realWorldInspired: true,
                  difficulty: 'hard',
                  estimatedTime: '50 mins'
                }
              ]
            }
          ]
        }
      ],
      metadata: {
        totalTopics: 5,
        estimatedTotalTime: '15-20 hours',
        difficulty: 'Advanced',
        focusAreas: strengths.length > 0 ? strengths : ['Advanced Algorithms', 'System Design'],
        improvementAreas: weaknesses.length > 0 ? weaknesses : ['System Design', 'Bit Manipulation'],
        personalizedNotes: [
          'Curriculum optimized for advanced practitioners',
          'Focus on real-world problem solving and system design',
          'Includes competitive programming elements',
          'Emphasis on optimization and advanced techniques'
        ]
      }
    };
  }

  // Intermediate curriculum for moderate proficiency (score 50-89)
  if (level === 'intermediate' || (score >= 50 && score < 90)) {
    return {
      topics: [
        {
          id: 'sliding-window',
          title: 'Sliding Window Technique',
          level: 'medium',
          timeEstimate: '2-3 hours',
          description: 'Master efficient array and string processing using sliding window',
          category: 'Array Techniques',
          status: 'available',
          prerequisites: [],
          subtopics: [
            {
              title: 'Fixed Window Size',
              description: 'Problems with constant window size',
              problems: [
                {
                  question: 'Design a stock trading algorithm that finds the maximum profit from any k-day trading window.',
                  tags: ['Sliding Window', 'Array', 'Optimization'],
                  realWorldInspired: true,
                  difficulty: 'medium',
                  estimatedTime: '30 mins'
                },
                {
                  question: 'Build a web analytics tool that tracks the maximum number of unique visitors in any 7-day period.',
                  tags: ['Sliding Window', 'Hash Set', 'Analytics'],
                  realWorldInspired: true,
                  difficulty: 'medium',
                  estimatedTime: '35 mins'
                }
              ]
            },
            {
              title: 'Variable Window Size',
              description: 'Dynamic window sizing based on conditions',
              problems: [
                {
                  question: 'Create a content recommendation system that finds the longest sequence of user actions with at most k different action types.',
                  tags: ['Variable Window', 'Hash Map', 'User Behavior'],
                  realWorldInspired: true,
                  difficulty: 'medium',
                  estimatedTime: '40 mins'
                }
              ]
            }
          ]
        },
        {
          id: 'two-pointers',
          title: 'Two Pointers Technique',
          level: 'medium',
          timeEstimate: '2-3 hours',
          description: 'Efficient array traversal and manipulation using two pointers',
          category: 'Array Techniques',
          status: 'locked',
          prerequisites: ['sliding-window'],
          subtopics: [
            {
              title: 'Opposite Direction Pointers',
              description: 'Pointers moving from both ends toward center',
              problems: [
                {
                  question: 'Design a load balancing algorithm that pairs servers optimally based on their capacity constraints.',
                  tags: ['Two Pointers', 'Optimization', 'Pairing'],
                  realWorldInspired: true,
                  difficulty: 'medium',
                  estimatedTime: '35 mins'
                }
              ]
            }
          ]
        },
        {
          id: 'binary-search',
          title: 'Binary Search & Variants',
          level: 'medium',
          timeEstimate: '2-3 hours',
          description: 'Master search algorithms and their applications',
          category: 'Search Algorithms',
          status: 'locked',
          prerequisites: ['two-pointers'],
          subtopics: [
            {
              title: 'Search in Sorted Arrays',
              description: 'Classic binary search applications',
              problems: [
                {
                  question: 'Build a version control system that efficiently finds the commit where a bug was introduced using binary search.',
                  tags: ['Binary Search', 'Version Control', 'Debugging'],
                  realWorldInspired: true,
                  difficulty: 'medium',
                  estimatedTime: '40 mins'
                }
              ]
            }
          ]
        }
      ],
      metadata: {
        totalTopics: 3,
        estimatedTotalTime: '6-9 hours',
        difficulty: 'Intermediate',
        focusAreas: ['Array Techniques', 'Search Algorithms'],
        improvementAreas: ['Advanced Data Structures', 'Dynamic Programming'],
        personalizedNotes: [
          'Focus on mastering fundamental patterns',
          'Build strong foundation before advancing',
          'Practice real-world applications'
        ]
      }
    };
  }

  // Beginner curriculum (score < 50)
  return {
    topics: [
      {
        id: 'arrays-basics',
        title: 'Array Fundamentals',
        level: 'easy',
        timeEstimate: '2-3 hours',
        description: 'Learn basic array operations and simple algorithms',
        category: 'Fundamentals',
        status: 'available',
        prerequisites: [],
        subtopics: [
          {
            title: 'Array Traversal',
            description: 'Basic iteration and element access',
            problems: [
              {
                question: 'Build a simple inventory system that tracks product quantities and finds items that need restocking.',
                tags: ['Arrays', 'Iteration', 'Basic Logic'],
                realWorldInspired: true,
                difficulty: 'easy',
                estimatedTime: '20 mins'
              },
              {
                question: 'Create a grade calculator that finds the average score and identifies students who need extra help.',
                tags: ['Arrays', 'Math', 'Conditions'],
                realWorldInspired: true,
                difficulty: 'easy',
                estimatedTime: '25 mins'
              }
            ]
          }
        ]
      },
      {
        id: 'basic-sorting',
        title: 'Sorting Fundamentals',
        level: 'easy',
        timeEstimate: '2-3 hours',
        description: 'Understand basic sorting algorithms',
        category: 'Sorting',
        status: 'locked',
        prerequisites: ['arrays-basics'],
        subtopics: [
          {
            title: 'Simple Sorting',
            description: 'Bubble sort, selection sort concepts',
            problems: [
              {
                question: 'Sort a list of customer orders by priority to optimize delivery routes.',
                tags: ['Sorting', 'Priority', 'Logistics'],
                realWorldInspired: true,
                difficulty: 'easy',
                estimatedTime: '30 mins'
              }
            ]
          }
        ]
      }
    ],
    metadata: {
      totalTopics: 2,
      estimatedTotalTime: '4-6 hours',
      difficulty: 'Beginner',
      focusAreas: ['Basic Programming', 'Problem Solving'],
      improvementAreas: ['All areas need development'],
      personalizedNotes: [
        'Start with fundamentals',
        'Focus on understanding before optimization',
        'Practice regularly with simple problems'
      ]
    }
  };
}
