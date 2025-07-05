'use client'

import { useState, useEffect } from 'react'
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Your Learning Path</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Interactive curriculum designed for {level} level learners
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700">
              {level.charAt(0).toUpperCase() + level.slice(1)} Level
            </Badge>
            <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
              {score}% Assessment Score
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Curriculum Tree */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg dark:bg-[#23243a] dark:text-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-gray-100">
                  <GitBranch className="w-6 h-6 text-green-600" />
                  <span>Learning Path</span>
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Click on available topics to start learning. Topics build upon each other in a logical progression.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {curriculumTree
                    .filter(node => node.parents.length === 0) // Root nodes
                    .map(node => renderTreeNode(node))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Topic Content Panel */}
          <div className="lg:col-span-1">
            {isGeneratingContent ? (
              <Card className="bg-white shadow-lg dark:bg-[#23243a] dark:text-gray-100">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
                      </div>
                      <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-blue-200 dark:border-blue-700 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg dark:text-gray-100">Generating Content</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Our AI is creating personalized learning materials...</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Writing explanations...</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Creating examples...</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Generating diagrams...</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : topicContent ? (
              <Card className="bg-white shadow-lg dark:bg-[#23243a] dark:text-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 dark:text-gray-100">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span>{topicContent.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Explanation */}
                  <div>
                    <h4 className="font-semibold mb-2 dark:text-gray-100">Understanding the Concept</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {topicContent.explanation}
                    </p>
                  </div>

                  {/* Real World Examples */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center dark:text-gray-100">
                      <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                      Real World Examples
                    </h4>
                    <ul className="space-y-1">
                      {topicContent.realWorldExamples.map((example, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Code Examples */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center dark:text-gray-100">
                      <Code className="w-4 h-4 mr-2 text-green-500" />
                      Code Examples
                    </h4>
                    <div className="space-y-2">
                      {topicContent.codeExamples.map((example, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-[#181A20] p-3 rounded text-sm font-mono text-gray-800 dark:text-gray-100">
                          {example}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practice Problems */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center dark:text-gray-100">
                      <Target className="w-4 h-4 mr-2 text-purple-500" />
                      Practice Problems
                    </h4>
                    <div className="space-y-2">
                      {topicContent.practiceProblems.map((problem, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start dark:bg-[#23243a] dark:text-gray-100 dark:border-gray-700"
                          onClick={() => router.push(`/problems?topic=${topicContent?.title}`)}
                        >
                          <Play className="w-3 h-3 mr-2" />
                          {problem}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white shadow-lg dark:bg-[#23243a] dark:text-gray-100">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto" />
                    <div>
                      <h3 className="font-semibold text-lg dark:text-gray-100">Select a Topic</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Click on any available topic in the learning path to start learning
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 