'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../src/components/ui/button'
import { Badge } from '../../src/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/card'
import PaymentModal from '../../src/components/PaymentModal'
import { 
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  Lock,
  Play,
  Target,
  BookOpen,
  Loader2,
  Star,
  TrendingUp,
  DollarSign
} from 'lucide-react'

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

interface CurriculumData {
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

export default function CurriculumPage() {
  const router = useRouter()
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set())
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    courseTitle: string;
    courseId: string;
    price: number;
  }>({
    isOpen: false,
    courseTitle: '',
    courseId: '',
    price: 0
  })
  const [unlockedCourses, setUnlockedCourses] = useState<Set<string>>(new Set())

  useEffect(() => {
    generateCurriculum()
  }, [])

  const generateCurriculum = async () => {
    try {
      setIsLoading(true)
      
      // Get user's assessment data
      let userStrengths: string[] = []
      let userWeaknesses: string[] = []
      let userLevel = 'intermediate'
      let userScore = 50

      if (typeof window !== 'undefined') {
        const latestAssessment = localStorage.getItem('dsatutor_latest_assessment')
        if (latestAssessment) {
          try {
            const assessment = JSON.parse(latestAssessment)
            userStrengths = assessment.strengths || []
            userWeaknesses = assessment.weaknesses || []
            userLevel = assessment.level || 'intermediate'
            userScore = assessment.score || 50

            console.log('Assessment data found:', {
              level: userLevel,
              score: userScore,
              strengths: userStrengths,
              weaknesses: userWeaknesses
            })
          } catch (e) {
            console.error('Error parsing assessment data:', e)
          }
        }
      }

      console.log('Generating curriculum for:', { userLevel, userScore, userStrengths, userWeaknesses })

      const response = await fetch('/api/ai/generate-curriculum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          level: userLevel,
          score: userScore,
          userId: 'demo-user',
          strengths: userStrengths,
          weaknesses: userWeaknesses,
          categoryPerformance: {}
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Curriculum data:', data)
        setCurriculum(data.data)
        
        // Cache to localStorage
        localStorage.setItem('dsatutor_curriculum', JSON.stringify(data.data))
        
        // Expand first topic by default
        if (data.data.topics.length > 0) {
          setExpandedTopics(new Set([data.data.topics[0].id]))
        }
      } else {
        console.error('Failed to generate curriculum')
        // Try to load from cache
        const cached = localStorage.getItem('dsatutor_curriculum')
        if (cached) {
          setCurriculum(JSON.parse(cached))
        }
      }
    } catch (error) {
      console.error('Error generating curriculum:', error)
      // Try to load from cache
      const cached = localStorage.getItem('dsatutor_curriculum')
      if (cached) {
        setCurriculum(JSON.parse(cached))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTopicExpansion = (topicId: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId)
    } else {
      newExpanded.add(topicId)
    }
    setExpandedTopics(newExpanded)
  }

  const toggleSubtopicExpansion = (subtopicKey: string) => {
    const newExpanded = new Set(expandedSubtopics)
    if (newExpanded.has(subtopicKey)) {
      newExpanded.delete(subtopicKey)
    } else {
      newExpanded.add(subtopicKey)
    }
    setExpandedSubtopics(newExpanded)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'available': return <Play className="w-4 h-4 text-blue-500" />
      case 'locked': return <Lock className="w-4 h-4 text-gray-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const handleProblemClick = (problem: Problem, topicId: string, subtopicTitle: string) => {
    setSelectedProblem(problem)
    
    // Navigate to dynamic problem page
    const problemSlug = encodeURIComponent(problem.question.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    const queryParams = new URLSearchParams({
      topic: topicId,
      subtopic: subtopicTitle,
      title: problem.question,
      difficulty: problem.difficulty,
      estimatedTime: problem.estimatedTime,
      tags: problem.tags.join(','),
      realWorld: problem.realWorldInspired.toString()
    })
    
    router.push(`/problems/dynamic/${problemSlug}?${queryParams.toString()}`)
  }

  const handleUnlockCourse = (courseId: string, courseTitle: string) => {
    // Calculate price based on difficulty level
    const topic = curriculum?.topics.find(t => t.id === courseId)
    let price = 29 // default price
    
    if (topic) {
      switch (topic.level) {
        case 'easy': price = 19; break;
        case 'medium': price = 29; break;
        case 'hard': price = 49; break;
      }
    }

    setPaymentModal({
      isOpen: true,
      courseTitle,
      courseId,
      price
    })
  }

  const handlePaymentSuccess = (courseId: string) => {
    // Update unlocked courses - unlock ALL courses when payment succeeds
    const allCourseIds = curriculum?.topics.map(topic => topic.id) || []
    setUnlockedCourses(new Set(allCourseIds))
    
    // Update curriculum data to mark ALL courses as available
    if (curriculum) {
      const updatedCurriculum = {
        ...curriculum,
        topics: curriculum.topics.map(topic => ({
          ...topic,
          status: 'available' as const
        }))
      }
      setCurriculum(updatedCurriculum)
      
      // Update cached data
      localStorage.setItem('dsatutor_curriculum', JSON.stringify(updatedCurriculum))
      localStorage.setItem('dsatutor_unlocked_courses', JSON.stringify(allCourseIds))
    }
    
    // Close modal
    setPaymentModal({
      isOpen: false,
      courseTitle: '',
      courseId: '',
      price: 0
    })
  }

  // Load unlocked courses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dsatutor_unlocked_courses')
    if (saved) {
      try {
        const unlockedArray = JSON.parse(saved)
        setUnlockedCourses(new Set(unlockedArray))
      } catch (e) {
        console.error('Error loading unlocked courses:', e)
      }
    }
  }, [])

  // Update course status based on unlocked courses
  const getTopicStatus = (topic: CurriculumTopic) => {
    if (unlockedCourses.has(topic.id)) {
      return 'available'
    }
    return topic.status
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Generating Your Personalized Curriculum</h2>
              <p className="text-gray-600">Analyzing your assessment results to create the perfect learning path...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!curriculum) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Unable to Load Curriculum</h2>
              <p className="text-gray-600 mb-4">Please complete your assessment first to generate a personalized learning path.</p>
              <Button onClick={() => router.push('/evaluation')}>
                Take Assessment
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Personalized Learning Path</h1>
          <p className="text-gray-600 text-lg">
            Curriculum tailored to your assessment results • {curriculum.metadata.difficulty} Level
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Curriculum Table of Contents */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span>Learning Curriculum</span>
                    </CardTitle>
                    <CardDescription>
                      {curriculum.metadata.totalTopics} topics • {curriculum.metadata.estimatedTotalTime}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {curriculum.topics.filter(t => t.status === 'available').length} Available
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {curriculum.topics.map((topic, topicIndex) => {
                  const isExpanded = expandedTopics.has(topic.id)
                  const isClickable = topic.status !== 'locked'
                  
                  return (
                    <div key={topic.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Topic Header */}
                      <div 
                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                          isClickable ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-75'
                        }`}
                        onClick={() => isClickable && toggleTopicExpansion(topic.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(topic.status)}
                            {isExpanded ? 
                              <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            }
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">{topic.title}</h3>
                            <p className="text-sm text-gray-600">{topic.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getDifficultyColor(topic.level)}>
                            {topic.level.charAt(0).toUpperCase() + topic.level.slice(1)}
                          </Badge>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {topic.timeEstimate}
                          </span>
                          {topic.status === 'locked' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleUnlockCourse(topic.id, topic.title)
                              }}
                              className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            >
                              <DollarSign className="w-3 h-3 mr-1" />
                              Unlock
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Topic Content */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-white">
                          {topic.prerequisites.length > 0 && (
                            <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
                              <p className="text-sm text-yellow-800">
                                <strong>Prerequisites:</strong> {topic.prerequisites.join(', ')}
                              </p>
                            </div>
                          )}
                          
                          <div className="p-4 space-y-4">
                            {topic.subtopics.map((subtopic, subtopicIndex) => {
                              const subtopicKey = `${topic.id}-${subtopicIndex}`
                              const isSubtopicExpanded = expandedSubtopics.has(subtopicKey)
                              
                              return (
                                <div key={subtopicIndex} className="border border-gray-100 rounded-md">
                                  {/* Subtopic Header */}
                                  <div 
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleSubtopicExpansion(subtopicKey)}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {isSubtopicExpanded ? 
                                        <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                      }
                                      <div>
                                        <h4 className="font-medium text-gray-900">{subtopic.title}</h4>
                                        <p className="text-sm text-gray-600">{subtopic.description}</p>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {subtopic.problems.length} problems
                                    </Badge>
                                  </div>

                                  {/* Subtopic Problems */}
                                  {isSubtopicExpanded && (
                                    <div className="border-t border-gray-100 bg-gray-50 p-3">
                                      <div className="space-y-2">
                                        {subtopic.problems.map((problem, problemIndex) => (
                                          <div 
                                            key={problemIndex}
                                            className="bg-white border border-gray-200 rounded-md p-3 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
                                            onClick={() => handleProblemClick(problem, topic.id, subtopic.title)}
                                          >
                                            <div className="flex items-start justify-between">
                                              <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 mb-1">
                                                  {problem.question}
                                                </p>
                                                <div className="flex items-center space-x-2 mb-2">
                                                  <Badge 
                                                    variant="outline" 
                                                    className={`text-xs ${getDifficultyColor(problem.difficulty)}`}
                                                  >
                                                    {problem.difficulty}
                                                  </Badge>
                                                  <span className="text-xs text-gray-500 flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {problem.estimatedTime}
                                                  </span>
                                                  {problem.realWorldInspired && (
                                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                      Real-world
                                                    </Badge>
                                                  )}
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                  {problem.tags.map((tag, tagIndex) => (
                                                    <span 
                                                      key={tagIndex}
                                                      className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                                                    >
                                                      {tag}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span>Your Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {curriculum.topics.filter(t => t.status === 'completed').length}/{curriculum.topics.length}
                  </div>
                  <p className="text-sm text-gray-600">Topics Completed</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Available</span>
                    <span className="text-blue-600">{curriculum.topics.filter(t => t.status === 'available').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Locked</span>
                    <span className="text-gray-500">{curriculum.topics.filter(t => t.status === 'locked').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personalization Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Personalization</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Focus Areas</h4>
                  <div className="space-y-1">
                    {curriculum.metadata.focusAreas.map((area, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-1 mb-1">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-orange-700 mb-2">Improvement Areas</h4>
                  <div className="space-y-1">
                    {curriculum.metadata.improvementAreas.map((area, index) => (
                      <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 mr-1 mb-1">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {curriculum.metadata.personalizedNotes.map((note, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => {
                    const firstAvailable = curriculum.topics.find(t => t.status === 'available')
                    if (firstAvailable) {
                      toggleTopicExpansion(firstAvailable.id)
                    }
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/progress')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Detailed Progress
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/evaluation')}>
                  Retake Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false, courseTitle: '', courseId: '', price: 0 })}
          courseTitle={paymentModal.courseTitle}
          courseId={paymentModal.courseId}
          price={paymentModal.price}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  )
}
