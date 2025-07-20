'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '../../../../src/components/ui/button'
import { Badge } from '../../../../src/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../src/components/ui/card'
import { 
  ArrowLeft,
  Clock,
  Code,
  Lightbulb,
  Play,
  CheckCircle,
  Loader2,
  Brain,
  Target,
  Globe
} from 'lucide-react'

interface GeneratedProblem {
  title: string;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  hints: string[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
  };
  solution: {
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
    code: string;
  };
  testCases: {
    input: string;
    expectedOutput: string;
    hidden: boolean;
  }[];
}

export default function DynamicProblemPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [problemData, setProblemData] = useState<GeneratedProblem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'java'>('javascript')
  const [showHints, setShowHints] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  // Extract problem details from URL params
  const topicId = searchParams?.get('topic') || ''
  const subtopic = searchParams?.get('subtopic') || ''
  const title = searchParams?.get('title') || ''
  const difficulty = searchParams?.get('difficulty') || 'medium'
  const estimatedTime = searchParams?.get('estimatedTime') || '30 mins'
  const tags = searchParams?.get('tags')?.split(',') || []
  const realWorld = searchParams?.get('realWorld') === 'true'

  useEffect(() => {
    generateProblemContent()
  }, [])

  const generateProblemContent = async () => {
    try {
      setIsLoading(true)

      // Generate problem content using AI
      const response = await fetch('/api/ai/generate-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topicId,
          subtopicTitle: subtopic,
          problemTitle: title,
          difficulty,
          userId: 'demo-user'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProblemData(data.data)
      } else {
        console.error('Failed to generate problem content')
        // Fallback to basic problem structure
        setProblemData(generateFallbackProblem())
      }
    } catch (error) {
      console.error('Error generating problem:', error)
      setProblemData(generateFallbackProblem())
    } finally {
      setIsLoading(false)
    }
  }

  const generateFallbackProblem = (): GeneratedProblem => {
    return {
      title,
      description: `
This is a ${difficulty} level problem focusing on ${subtopic}.

Problem Statement:
${title}

You need to implement an efficient solution that demonstrates understanding of the underlying algorithmic concepts.
      `,
      constraints: [
        '1 ≤ n ≤ 1000',
        'All inputs are valid',
        'Optimize for time complexity'
      ],
      examples: [
        {
          input: 'Example input',
          output: 'Example output',
          explanation: 'This is how the algorithm should work'
        }
      ],
      hints: [
        'Think about the optimal approach',
        'Consider edge cases',
        'What data structure would be most efficient?'
      ],
      starterCode: {
        javascript: `function solve(input) {\n    // Your solution here\n    return result;\n}`,
        python: `def solve(input_data):\n    # Your solution here\n    pass`,
        java: `public class Solution {\n    public String solve(String input) {\n        // Your solution here\n        return "";\n    }\n}`
      },
      solution: {
        approach: 'The solution involves analyzing the problem and applying appropriate algorithmic techniques.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        code: '// Solution will be available after you attempt the problem'
      },
      testCases: [
        {
          input: 'test1',
          expectedOutput: 'output1',
          hidden: false
        }
      ]
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="relative">
                <Brain className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-pulse" />
                <div className="absolute -top-2 -right-2">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI is Generating Your Problem</h2>
              <p className="text-gray-600 mb-1">Creating a unique, personalized coding challenge...</p>
              <p className="text-sm text-blue-600 font-medium">Topic: {subtopic} • Difficulty: {difficulty}</p>
              
              <div className="mt-6 space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Analyzing problem requirements</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Code className="h-4 w-4" />
                  <span>Generating test cases and starter code</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>Creating hints and solution approach</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!problemData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Unable to Generate Problem</h2>
              <p className="text-gray-600 mb-4">There was an issue creating this problem. Please try again.</p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Curriculum
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{problemData.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <Badge className={getDifficultyColor(difficulty)}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Badge>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{estimatedTime}</span>
                </div>
                {realWorld && (
                  <div className="flex items-center text-green-600">
                    <Globe className="h-4 w-4 mr-1" />
                    <span className="text-sm">Real-world inspired</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Problem Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-line">{problemData.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Constraints</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {problemData.constraints.map((constraint, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      • {constraint}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {problemData.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-2">
                      <strong>Input:</strong>
                      <pre className="text-sm mt-1 whitespace-pre-wrap">{example.input}</pre>
                    </div>
                    <div className="mb-2">
                      <strong>Output:</strong>
                      <pre className="text-sm mt-1 whitespace-pre-wrap">{example.output}</pre>
                    </div>
                    <div>
                      <strong>Explanation:</strong>
                      <p className="text-sm mt-1">{example.explanation}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Hints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Hints</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowHints(!showHints)}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {showHints ? 'Hide' : 'Show'} Hints
                  </Button>
                </CardTitle>
              </CardHeader>
              {showHints && (
                <CardContent>
                  <ul className="space-y-2">
                    {problemData.hints.map((hint, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {index + 1}. {hint}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Code Editor */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Code Editor</span>
                  <div className="flex items-center space-x-2">
                    <select 
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value as 'javascript' | 'python' | 'java')}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                    </select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{problemData.starterCode[selectedLanguage]}</pre>
                </div>
                <div className="mt-4 space-y-2">
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Run Code
                  </Button>
                  <Button variant="outline" className="w-full">
                    Submit Solution
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Test Cases */}
            <Card>
              <CardHeader>
                <CardTitle>Test Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {problemData.testCases.filter(tc => !tc.hidden).map((testCase, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                      <div><strong>Input:</strong> {testCase.input}</div>
                      <div><strong>Expected:</strong> {testCase.expectedOutput}</div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-2">
                    + {problemData.testCases.filter(tc => tc.hidden).length} hidden test cases
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Solution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Solution</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowSolution(!showSolution)}
                  >
                    {showSolution ? 'Hide' : 'View'} Solution
                  </Button>
                </CardTitle>
              </CardHeader>
              {showSolution && (
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Approach:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{problemData.solution.approach}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm">Time Complexity:</h4>
                      <p className="text-sm text-gray-700">{problemData.solution.timeComplexity}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Space Complexity:</h4>
                      <p className="text-sm text-gray-700">{problemData.solution.spaceComplexity}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Code:</h4>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                      <pre className="whitespace-pre-wrap">{problemData.solution.code}</pre>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
