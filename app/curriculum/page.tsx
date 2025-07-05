'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/card'
import { Button } from '../../src/components/ui/button'
import { Badge } from '../../src/components/ui/badge'
import { Progress } from '../../src/components/ui/progress'
import { 
  Brain, 
  Target, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Loader2,
  BookOpen,
  TrendingUp,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Sparkles,
  Lightbulb,
  Rocket,
  GraduationCap,
  Layers,
  Code,
  Puzzle,
  GitBranch,
  Network,
  Zap,
  Star,
  Crown,
  ArrowUpRight,
  Play,
  ExternalLink
} from 'lucide-react'

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

interface TopicContent {
  title: string
  explanation: string
  realWorldExamples: string[]
  diagrams: string[]
  codeExamples: string[]
  practiceProblems: string[]
}

export default function CurriculumPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const level = searchParams?.get('level') || 'intermediate'
  const score = parseInt(searchParams?.get('score') || '50')
  
  const [curriculumTree, setCurriculumTree] = useState<TreeNode[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [topicContent, setTopicContent] = useState<TopicContent | null>(null)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [userProgress, setUserProgress] = useState<{[topicId: string]: string}>({})
  const [currentActiveTopic, setCurrentActiveTopic] = useState<string | null>(null)
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)

  // Layout positions for nodes (static for now, can be made dynamic later)
  const nodePositions: { [id: string]: { x: number; y: number } } = {
    'arrays-hashing': { x: 400, y: 40 },
    'two-pointers': { x: 250, y: 180 },
    'stack': { x: 550, y: 180 },
    'binary-search': { x: 150, y: 320 },
    'sliding-window': { x: 350, y: 320 },
    'linked-list': { x: 550, y: 320 },
    'trees': { x: 350, y: 480 },
    'tries': { x: 150, y: 640 },
    'heap': { x: 300, y: 800 },
    'backtracking': { x: 550, y: 640 },
    'graphs': { x: 500, y: 800 },
    'dp': { x: 650, y: 800 },
  }

  // Static curriculum structure for demo (can be made dynamic)
  const nodes = [
    { id: 'arrays-hashing', label: 'Arrays & Hashing', children: ['two-pointers', 'stack'] },
    { id: 'two-pointers', label: 'Two Pointers', children: ['binary-search', 'sliding-window', 'linked-list'] },
    { id: 'stack', label: 'Stack', children: ['linked-list'] },
    { id: 'binary-search', label: 'Binary Search', children: ['trees'] },
    { id: 'sliding-window', label: 'Sliding Window', children: ['trees'] },
    { id: 'linked-list', label: 'Linked List', children: ['trees'] },
    { id: 'trees', label: 'Trees', children: ['tries', 'heap', 'backtracking'] },
    { id: 'tries', label: 'Tries', children: [] },
    { id: 'heap', label: 'Heap / P.Queue', children: [] },
    { id: 'backtracking', label: 'Backtracking', children: ['graphs', 'dp'] },
    { id: 'graphs', label: 'Graphs', children: [] },
    { id: 'dp', label: '1-D DP', children: [] },
  ]

  // Edges for SVG lines
  const edges = nodes.flatMap(node => node.children.map(child => ({ from: node.id, to: child })))

  // Sidebar state
  const [selectedNode, setSelectedNode] = useState(nodes[0])

  // Helper to get node by id
  const getNode = (id: string) => nodes.find(n => n.id === id)

  // Helper to get children nodes
  const getChildren = (id: string) => {
    const node = getNode(id)
    return node ? node.children.map(getNode).filter(Boolean) : []
  }

  // Helper to get parent nodes
  const getParents = (id: string) => nodes.filter(n => n.children.includes(id))

  // Node click handler
  const handleNodeClick = (node: any) => setSelectedNode(node)

  // Node color
  const nodeColor = 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white'
  const nodeBorder = 'border-2 border-blue-700 dark:border-blue-400'

  // Example problems for each topic (static for demo)
  const exampleProblems: { [id: string]: string[] } = {
    'arrays-hashing': [
      'Two Sum', 'Group Anagrams', 'Contains Duplicate', 'Valid Sudoku', 'Top K Frequent Elements', 'Product of Array Except Self'
    ],
    'two-pointers': [
      'Valid Palindrome', 'Container With Most Water', 'Trapping Rain Water', '3Sum', 'Remove Duplicates from Sorted Array'
    ],
    'stack': [
      'Valid Parentheses', 'Min Stack', 'Evaluate Reverse Polish Notation', 'Daily Temperatures', 'Largest Rectangle in Histogram'
    ],
    'binary-search': [
      'Binary Search', 'Search in Rotated Sorted Array', 'Find Minimum in Rotated Sorted Array', 'Median of Two Sorted Arrays'
    ],
    'sliding-window': [
      'Best Time to Buy and Sell Stock', 'Longest Substring Without Repeating Characters', 'Minimum Window Substring', 'Permutation in String', 'Longest Repeating Character Replacement'
    ],
    'linked-list': [
      'Reverse Linked List', 'Merge Two Sorted Lists', 'Linked List Cycle', 'Remove Nth Node From End of List', 'Add Two Numbers'
    ],
    'trees': [
      'Maximum Depth of Binary Tree', 'Invert Binary Tree', 'Validate Binary Search Tree', 'Binary Tree Level Order Traversal', 'Serialize and Deserialize Binary Tree'
    ],
    'tries': [
      'Implement Trie', 'Word Search II', 'Design Add and Search Words Data Structure', 'Replace Words'
    ],
    'heap': [
      'Merge K Sorted Lists', 'Top K Frequent Elements', 'Find Median from Data Stream', 'Kth Largest Element in Array'
    ],
    'backtracking': [
      'Subsets', 'Permutations', 'Word Search', 'Combination Sum', 'N-Queens'
    ],
    'graphs': [
      'Number of Islands', 'Clone Graph', 'Course Schedule', 'Pacific Atlantic Water Flow', 'Redundant Connection'
    ],
    'dp': [
      'Climbing Stairs', 'Coin Change', 'Longest Increasing Subsequence', 'House Robber', 'Word Break'
    ]
  };

  // Add learning order numbers to nodes
  const numberedNodes = nodes.map((node, idx) => ({ ...node, order: idx + 1 }));

  // Specific descriptions for each topic
  const topicDescriptions: { [id: string]: string } = {
    'arrays-hashing': 'Arrays & Hashing combines basic array operations with hash table lookups to solve problems efficiently, often achieving O(1) time complexity for element access and manipulation.',
    'two-pointers': 'Two Pointers technique uses two indices to traverse arrays or linked lists simultaneously, enabling efficient solutions for problems involving pairs, subarrays, or linked list manipulation.',
    'stack': 'Stack is a LIFO data structure that excels at tracking state and managing nested operations, commonly used for parentheses matching, function calls, and depth-first traversal.',
    'binary-search': 'Binary Search efficiently finds elements in sorted arrays by repeatedly dividing the search space in half, achieving O(log n) time complexity for search operations.',
    'sliding-window': 'Sliding window is a technique that efficiently processes subarrays or substrings by maintaining a moving range over the data, avoiding redundant calculations.',
    'linked-list': 'Linked Lists are linear data structures where elements are connected via pointers, enabling efficient insertions/deletions and supporting various traversal patterns.',
    'trees': 'Trees are hierarchical data structures that model parent-child relationships, supporting efficient search, insertion, and traversal operations with various algorithms.',
    'tries': 'Tries (prefix trees) are specialized tree structures for storing strings, enabling efficient prefix searches, autocomplete, and string-based operations.',
    'heap': 'Heap / Priority Queue maintains elements in a specific order, allowing efficient access to the maximum or minimum element, commonly used for scheduling and optimization problems.',
    'backtracking': 'Backtracking systematically explores all possible solutions by building candidates incrementally and abandoning partial solutions that cannot lead to valid results.',
    'graphs': 'Graphs model relationships between entities using nodes and edges, supporting algorithms for pathfinding, connectivity analysis, and network optimization.',
    'dp': '1-D Dynamic Programming solves complex problems by breaking them into simpler subproblems and storing results to avoid redundant calculations.'
  };

  useEffect(() => {
    generateCurriculumTree()
    fetchUserProgress()
  }, [level, score])

  const generateCurriculumTree = async () => {
    try {
      // Get user's latest assessment data for personalization
      let userStrengths: string[] = [];
      let userWeaknesses: string[] = [];
      let userCategoryPerformance: any = {};
      
      if (typeof window !== 'undefined') {
        const latestAssessment = localStorage.getItem('dsatutor_latest_assessment');
        if (latestAssessment) {
          try {
            const assessment = JSON.parse(latestAssessment);
            userStrengths = assessment.strengths || [];
            userWeaknesses = assessment.weaknesses || [];
            userCategoryPerformance = assessment.categoryPerformance || {};
          } catch (e) {
            console.error('Error parsing assessment data:', e);
          }
        }
      }

      const response = await fetch('/api/ai/generate-curriculum-tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          level,
          score,
          userId: 'demo-user',
          strengths: userStrengths,
          weaknesses: userWeaknesses,
          categoryPerformance: userCategoryPerformance
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCurriculumTree(data.data.tree)
        // Expand first few nodes by default
        const initialExpanded = new Set<string>(data.data.tree.slice(0, 3).map((node: TreeNode) => node.id))
        setExpandedNodes(initialExpanded)
      } else {
        // Fallback to mock data
        setCurriculumTree(generateMockCurriculumTree())
      }
    } catch (error) {
      console.error('Error generating curriculum tree:', error)
      setCurriculumTree(generateMockCurriculumTree())
    }
  }

  const generateMockCurriculumTree = (): TreeNode[] => {
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

    return baseTopics
  }

  const handleTopicClick = async (topicId: string) => {
    const topic = curriculumTree.find(node => node.id === topicId)
    if (!topic || topic.status === 'locked') return

    setSelectedTopic(topicId)
    setIsGeneratingContent(true)

    // Update progress to mark this topic as in-progress
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dsatutor_token')}`
        },
        body: JSON.stringify({
          topicId: topicId,
          status: 'in_progress'
        })
      });

      if (response.ok) {
        console.log('Progress updated successfully for topic:', topicId);
      } else {
        console.error('Failed to update progress for topic:', topicId);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }

    try {
      const response = await fetch('/api/ai/generate-topic-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topicId,
          topicTitle: topic.title,
          level,
          userId: 'demo-user'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTopicContent(data.content)
      } else {
        // Fallback to mock content
        setTopicContent(generateMockTopicContent(topic))
      }
    } catch (error) {
      console.error('Error generating topic content:', error)
      setTopicContent(generateMockTopicContent(topic))
    } finally {
      setIsGeneratingContent(false)
    }
  }

  const generateMockTopicContent = (topic: TreeNode): TopicContent => {
    return {
      title: topic.title,
      explanation: `The ${topic.title} technique is a fundamental algorithmic pattern that helps solve a wide variety of problems efficiently. It involves maintaining a window of elements and sliding it through the data structure to find optimal solutions.`,
      realWorldExamples: [
        'Finding the longest substring with at most k distinct characters',
        'Calculating the maximum sum of any contiguous subarray of size k',
        'Finding all anagrams of a pattern in a string'
      ],
      diagrams: [
        'A visual representation showing how the window slides through an array',
        'Step-by-step animation of the sliding window process',
        'Comparison of brute force vs sliding window approach'
      ],
      codeExamples: [
        'Basic sliding window template in JavaScript',
        'Advanced sliding window with dynamic sizing',
        'Sliding window with hash map optimization'
      ],
      practiceProblems: [
        'Maximum Sum Subarray of Size K',
        'Longest Substring with K Distinct Characters',
        'Minimum Window Substring'
      ]
    }
  }

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'available': return <Play className="w-5 h-5 text-blue-500" />
      case 'locked': return <XCircle className="w-5 h-5 text-gray-400" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children.length > 0
    const isClickable = node.status !== 'locked'

    return (
      <div key={node.id} className="space-y-2">
        <div 
          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
            isClickable 
              ? 'hover:shadow-md hover:border-blue-300 bg-white' 
              : 'bg-gray-50 border-gray-200'
          } ${selectedTopic === node.id ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => isClickable && handleTopicClick(node)}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNodeExpansion(node.id)
              }}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}

          {/* Status Icon */}
          <div className="flex-shrink-0">
            {getStatusIcon(node.status)}
          </div>

          {/* Topic Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg truncate">{node.title}</h3>
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(node.difficulty)}>
                  {node.difficulty}
                </Badge>
                <span className="text-sm text-gray-500">{node.estimatedTime}m</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{node.description}</p>
            {node.prerequisites.length > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                Prerequisites: {node.prerequisites.join(', ')}
              </p>
            )}
          </div>

          {/* Action Button */}
          {isClickable && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleTopicClick(node)
              }}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Learn
            </Button>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-8 space-y-2 border-l-2 border-gray-200 pl-4">
            {node.children.map(childId => {
              const childNode = curriculumTree.find(n => n.id === childId)
              return childNode ? renderTreeNode(childNode, depth + 1) : null
            })}
          </div>
        )}
      </div>
    )
  }

  const fetchUserProgress = async () => {
    try {
      setIsLoadingProgress(true)
      const response = await fetch('/api/progress', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('dsatutor_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const progressMap: {[topicId: string]: string} = {}
        let activeTopic: string | null = null

        data.data.progress.forEach((item: any) => {
          progressMap[item.topicId] = item.status
          if (item.status === 'in_progress') {
            activeTopic = item.topicId
          }
        })

        setUserProgress(progressMap)
        setCurrentActiveTopic(activeTopic)
      } else {
        console.error('Failed to fetch user progress')
      }
    } catch (error) {
      console.error('Error fetching user progress:', error)
    } finally {
      setIsLoadingProgress(false)
    }
  }

  const getTopicStatus = (topicId: string): 'locked' | 'available' | 'completed' | 'in_progress' => {
    const progress = userProgress[topicId]
    if (progress === 'complete') return 'completed'
    if (progress === 'in_progress') return 'in_progress'
    if (progress === 'not_started') return 'available'
    return 'locked' // Default for topics not in progress
  }

  const getNodeColor = (nodeId: string) => {
    const status = getTopicStatus(nodeId)
    const isActive = currentActiveTopic === nodeId
    
    if (isActive) {
      return 'bg-green-600 text-white dark:bg-green-500 dark:text-white'
    }
    
    switch (status) {
      case 'completed':
        return 'bg-purple-600 text-white dark:bg-purple-500 dark:text-white'
      case 'in_progress':
        return 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white'
      case 'available':
        return 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white'
      case 'locked':
      default:
        return 'bg-gray-400 text-white dark:bg-gray-500 dark:text-white'
    }
  }

  const getNodeBorder = (nodeId: string) => {
    const status = getTopicStatus(nodeId)
    const isActive = currentActiveTopic === nodeId
    
    if (isActive) {
      return 'border-2 border-green-700 dark:border-green-400'
    }
    
    switch (status) {
      case 'completed':
        return 'border-2 border-purple-700 dark:border-purple-400'
      case 'in_progress':
        return 'border-2 border-blue-700 dark:border-blue-400'
      case 'available':
        return 'border-2 border-blue-700 dark:border-blue-400'
      case 'locked':
      default:
        return 'border-2 border-gray-600 dark:border-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-[#181A20] dark:bg-none p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Start Learning Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Learning Path</h1>
            <p className="text-gray-600 dark:text-gray-300">Explore your personalized curriculum and track your progress</p>
          </div>
          <Button 
            onClick={() => {
              // Find the first available topic
              const firstAvailableTopic = curriculumTree.find(topic => topic.status === 'available');
              if (firstAvailableTopic) {
                handleTopicClick(firstAvailableTopic.id);
              } else {
                // Fallback to first topic
                const firstTopic = curriculumTree[0];
                if (firstTopic) {
                  handleTopicClick(firstTopic.id);
                }
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Learning
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SVG Graph */}
          <div className="col-span-2 relative">
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 800, minHeight: 650 }}>
              <svg ref={svgRef} width={800} height={900} className="w-full h-[900px]">
                {/* Edges */}
                {edges.map((edge, i) => {
                  const from = nodePositions[edge.from]
                  const to = nodePositions[edge.to]
                  if (!from || !to) return null
                  // Arrow offset
                  const dx = to.x - from.x
                  const dy = to.y - from.y
                  const angle = Math.atan2(dy, dx)
                  const r = 60
                  const startX = from.x + r * Math.cos(angle)
                  const startY = from.y + r * Math.sin(angle)
                  const endX = to.x - r * Math.cos(angle)
                  const endY = to.y - r * Math.sin(angle)
                  return (
                    <g key={i}>
                      <line
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke="#4f8cff"
                        strokeWidth={3}
                        markerEnd="url(#arrowhead)"
                        opacity={0.7}
                      />
                    </g>
                  )
                })}
                {/* Arrowhead marker */}
                <defs>
                  <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto" markerUnits="strokeWidth">
                    <polygon points="0 0, 6 2, 0 4" fill="#4f8cff" />
                  </marker>
                </defs>
                {/* Nodes */}
                {numberedNodes.map(node => {
                  const pos = nodePositions[node.id]
                  if (!pos) return null
                  const isSelected = selectedNode?.id === node.id
                  return (
                    <g key={node.id} style={{ cursor: 'pointer' }} onClick={() => handleNodeClick(node)}>
                      <rect
                        x={pos.x - 80}
                        y={pos.y - 30}
                        rx={16}
                        ry={16}
                        width={160}
                        height={60}
                        className={
                          `${getNodeColor(node.id)} ${getNodeBorder(node.id)} ${isSelected ? 'ring-4 ring-yellow-400 dark:ring-yellow-300' : ''}`
                        }
                        style={{ filter: isSelected ? 'drop-shadow(0 0 8px #facc15)' : 'drop-shadow(0 2px 8px #0002)' }}
                      />
                      <foreignObject x={pos.x - 75} y={pos.y - 25} width={150} height={50}>
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 8px', maxWidth: 140, wordBreak: 'break-word', fontWeight: 600, fontSize: 16, color: isSelected ? '#fffbe6' : '#fff' }}>
                          <span style={{ marginRight: 8, fontWeight: 700, fontSize: 18 }}>{node.order}.</span>
                          <span style={{ flex: 1 }}>{node.label}</span>
                        </div>
                      </foreignObject>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>
          {/* Sidebar */}
          <div className="col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-[#23243a] rounded-xl shadow-lg p-6 border border-blue-100 dark:border-blue-700">
                <h2 className="text-2xl font-bold mb-2 text-blue-700 dark:text-blue-200">{selectedNode.label}</h2>
                <p className="text-gray-700 dark:text-gray-200 mb-4">
                  {topicDescriptions[selectedNode.id] || `${selectedNode.label} is a key topic in DSA. Mastering this will help you solve many interview problems.`}
                </p>
                {/* Problems - renamed from Example Problems */}
                <div className="mb-4">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-300 mb-2">Problems</h3>
                  <ul className="space-y-2">
                    {(exampleProblems[selectedNode.id] || []).map((prob, i) => (
                      <li key={i}>
                        <button
                          className="w-full text-left px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 font-medium transition border border-blue-100 dark:border-blue-800"
                          onClick={() => {
                            // Navigate to problem solving page
                            const problemId = i + 1; // Simple mapping for demo
                            router.push(`/problems/${problemId}/solve`);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{prob}</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </div>
                        </button>
                      </li>
                    ))}
                    {(exampleProblems[selectedNode.id]?.length || 0) === 0 && (
                      <li className="text-gray-400 dark:text-gray-500 text-sm">No problems available</li>
                    )}
                  </ul>
                </div>
                {/* Subtopics */}
                <div className="mb-4">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-300 mb-2">Subtopics</h3>
                  <ul className="space-y-2">
                    {getChildren(selectedNode.id).map(child => (
                      <li key={child.id}>
                        <button
                          className="w-full text-left px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 font-medium transition border border-blue-100 dark:border-blue-800"
                          onClick={() => handleNodeClick(child)}
                        >
                          {child.label}
                        </button>
                      </li>
                    ))}
                    {getChildren(selectedNode.id).length === 0 && (
                      <li className="text-gray-400 dark:text-gray-500">No subtopics</li>
                    )}
                  </ul>
                </div>
                {/* Prerequisites - now after Example Problems, styled and clickable like Subtopics */}
                <div>
                  <h3 className="font-semibold text-blue-600 dark:text-blue-300 mb-2">Prerequisites</h3>
                  <ul className="space-y-2">
                    {getParents(selectedNode.id).map(parent => (
                      <li key={parent.id}>
                        <button
                          className="w-full text-left px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 font-medium transition border border-blue-100 dark:border-blue-800"
                          onClick={() => handleNodeClick(parent)}
                        >
                          {parent.label}
                        </button>
                      </li>
                    ))}
                    {getParents(selectedNode.id).length === 0 && (
                      <li className="text-gray-400 dark:text-gray-500">None</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 