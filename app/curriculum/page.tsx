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
  const svgRef = useRef<SVGSVGElement>(null)

  // Layout positions for nodes (static for now, can be made dynamic later)
  const nodePositions: { [id: string]: { x: number; y: number } } = {
    'arrays-hashing': { x: 400, y: 40 },
    'two-pointers': { x: 250, y: 140 },
    'stack': { x: 550, y: 140 },
    'binary-search': { x: 150, y: 240 },
    'sliding-window': { x: 350, y: 240 },
    'linked-list': { x: 550, y: 240 },
    'trees': { x: 350, y: 340 },
    'tries': { x: 150, y: 440 },
    'heap': { x: 300, y: 540 },
    'backtracking': { x: 550, y: 440 },
    'graphs': { x: 500, y: 540 },
    'dp': { x: 650, y: 540 },
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
    { id: 'heap', label: 'Heap / Priority Queue', children: [] },
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

  useEffect(() => {
    generateCurriculumTree()
  }, [level, score])

  const generateCurriculumTree = async () => {
    try {
      const response = await fetch('/api/ai/generate-curriculum-tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          level,
          score,
          userId: 'demo-user'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCurriculumTree(data.tree)
        // Expand first few nodes by default
        const initialExpanded = new Set(data.tree.slice(0, 3).map((node: TreeNode) => node.id))
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
          onClick={() => isClickable && handleTopicClick(node.id)}
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
                handleTopicClick(node.id)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-[#181A20] dark:bg-none p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SVG Graph */}
        <div className="col-span-2 relative">
          <div className="overflow-x-auto overflow-y-visible" style={{ minHeight: 650 }}>
            <svg ref={svgRef} width={800} height={650} className="w-full h-[650px]">
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
                        `${nodeColor} ${nodeBorder} ${isSelected ? 'ring-4 ring-yellow-400 dark:ring-yellow-300' : ''}`
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
                {/* Example description, can be made dynamic */}
                {selectedNode.label} is a key topic in DSA. Mastering this will help you solve many interview problems.
              </p>
              <div className="mb-4">
                <h3 className="font-semibold text-blue-600 dark:text-blue-300 mb-2">Subtopics</h3>
                <ul className="space-y-2">
                  {getChildren(selectedNode.id).map(child => (
                    <li key={child.id}>
                      <button
                        className="w-full text-left px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 font-medium transition"
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
              <div>
                <h3 className="font-semibold text-blue-600 dark:text-blue-300 mb-2">Prerequisites</h3>
                <ul className="space-y-2">
                  {getParents(selectedNode.id).map(parent => (
                    <li key={parent.id} className="text-blue-700 dark:text-blue-200">{parent.label}</li>
                  ))}
                  {getParents(selectedNode.id).length === 0 && (
                    <li className="text-gray-400 dark:text-gray-500">None</li>
                  )}
                </ul>
              </div>
              <div className="mt-6">
                <h3 className="font-semibold text-blue-600 dark:text-blue-300 mb-2">Example Problems</h3>
                <ul className="space-y-1">
                  {(exampleProblems[selectedNode.id] || []).slice(0, 5).map((prob, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-200">{prob}</li>
                  ))}
                  {(exampleProblems[selectedNode.id]?.length || 0) > 5 && (
                    <li className="text-gray-400 dark:text-gray-500">...</li>
                  )}
                  {(exampleProblems[selectedNode.id]?.length || 0) === 0 && (
                    <li className="text-gray-400 dark:text-gray-500">No example problems</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 