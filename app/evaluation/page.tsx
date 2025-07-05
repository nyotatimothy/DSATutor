'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Progress } from '../../src/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '../../src/components/ui/radio-group';
import { Label } from '../../src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../src/components/ui/select';
import { Alert, AlertDescription } from '../../src/components/ui/alert';
import { Skeleton } from '../../src/components/ui/skeleton';
import { 
  Brain, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Trophy, 
  Star, 
  Zap, 
  Crown,
  ArrowRight,
  Loader2,
  BookOpen,
  TrendingUp,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lightbulb,
  Rocket,
  GraduationCap,
  Layers,
  Code,
  Puzzle,
  Play
} from 'lucide-react';
import { useAuth } from '../../src/hooks/useAuth';
import { Textarea } from '@/components/ui/textarea';

interface Question {
  id: string;
  question: string;
  options: string[];
}

interface AssessmentResult {
  level: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  categoryPerformance: any;
  strengths: string[];
  weaknesses: string[];
  confidence: number;
  estimatedExperience: string;
  recommendedStartingPoint: string;
  questionResults: any[];
  date?: string;
}

interface Curriculum {
  level: string;
  topics: any[];
  estimatedDuration: string;
  milestones: string[];
  message: string;
  approach: string;
}

export default function EvaluationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for reassessment prompt
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [problemAttempts, setProblemAttempts] = useState('');
  const [previousExperience, setPreviousExperience] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showFullCurriculum, setShowFullCurriculum] = useState(false);
  const [hasPreviousAssessment, setHasPreviousAssessment] = useState(false);
  const [previousAssessment, setPreviousAssessment] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    // Check for previous assessment
    if (typeof window !== 'undefined') {
      const latest = localStorage.getItem('dsatutor_latest_assessment');
      if (latest) {
        try {
          const assessment = JSON.parse(latest);
          setPreviousAssessment(assessment);
          setHasPreviousAssessment(true);
        } catch (e) {
          console.error('Error parsing previous assessment:', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (currentStep === 1 && !startTime) {
      setStartTime(Date.now());
    }
  }, [currentStep, startTime]);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime]);

  useEffect(() => {
    if (currentStep === 1) {
      fetch('/api/ai/assessment-questions?count=8')
        .then(res => res.json())
        .then(data => {
          setQuestions(data.questions);
          setAnswers({}); // Reset answers for new attempt
        });
    }
  }, [currentStep]);

  const handleStartNewAssessment = () => {
    setCurrentStep(1);
  };

  const handleViewPreviousResults = () => {
    if (previousAssessment) {
      setResults(previousAssessment);
      setShowResults(true);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value)
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    setIsProcessing(true);

    try {
      const answersArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer
      }));

      const response = await fetch('/api/ai/evaluate-level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.email,
          answers: answersArray,
          timeSpent,
          problemAttempts: parseInt(problemAttempts) || 0,
          previousExperience,
          preferredLanguage
        })
      });

      if (!response.ok) {
        throw new Error('Assessment failed');
      }

      const data = await response.json();
      
      if (data.success) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 7000));
        
        const evaluation = data.data.evaluation;
        const curriculumData = data.data.curriculum;
        const recommendationsData = data.data.recommendations;
        
        setResults(evaluation);
        setCurriculum(curriculumData);
        setRecommendations(recommendationsData);
        setShowResults(true);

        // Store assessment result using the new API
        try {
          const storeResponse = await fetch('/api/ai/assessments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('dsatutor_token')}`
            },
            body: JSON.stringify({
              level: evaluation.level,
              score: evaluation.score,
              correctAnswers: evaluation.correctAnswers,
              totalQuestions: evaluation.totalQuestions,
              timeSpent: evaluation.timeSpent,
              categoryPerformance: evaluation.categoryPerformance,
              strengths: evaluation.strengths,
              weaknesses: evaluation.weaknesses,
              confidence: evaluation.confidence,
              estimatedExperience: evaluation.estimatedExperience,
              recommendedStartingPoint: evaluation.recommendedStartingPoint,
              questionResults: evaluation.questionResults,
              personalizedCurriculum: curriculumData
            })
          });

          if (storeResponse.ok) {
            console.log('Assessment result stored successfully');
          } else {
            console.error('Failed to store assessment result');
          }
        } catch (storeError) {
          console.error('Error storing assessment result:', storeError);
        }

        // Store assessment and curriculum in localStorage for dashboard
        if (typeof window !== 'undefined') {
          localStorage.setItem('dsatutor_latest_assessment', JSON.stringify({
            ...evaluation,
            date: new Date().toISOString()
          }));
          localStorage.setItem('dsatutor_latest_curriculum', JSON.stringify(curriculumData));
        }
      } else {
        throw new Error(data.message || 'Assessment failed');
      }
    } catch (error) {
      console.error('Assessment error:', error);
      alert('Assessment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsProcessing(false);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'expert':
        return '🏆';
      case 'advanced':
        return '⭐';
      case 'intermediate':
        return '📚';
      case 'beginner':
        return '🌱';
      default:
        return '📊';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'advanced':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCurriculumIcon = (index: number) => {
    const icons = [Layers, Code, Puzzle, Rocket, GraduationCap, Sparkles, Lightbulb, Target];
    return icons[index % icons.length];
  };

  // Reassessment prompt
  if (currentStep === 0 && hasPreviousAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-[#181A20] dark:bg-none flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className="bg-white shadow-lg dark:bg-[#23243a] dark:text-gray-100">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl mb-2">Assessment History Found</CardTitle>
              <CardDescription>
                We found a previous assessment from your account. Would you like to take a new assessment?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Previous Assessment Summary */}
              {previousAssessment && (
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <h4 className="font-semibold mb-3">Your Previous Results:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Level:</span>
                      <Badge className={`ml-2 ${getLevelColor(previousAssessment.level)}`}>
                        {previousAssessment.level.charAt(0).toUpperCase() + previousAssessment.level.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Score:</span>
                      <span className="ml-2 font-semibold">{previousAssessment.score}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Completed:</span>
                      <span className="ml-2">{previousAssessment.date ? new Date(previousAssessment.date).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Questions:</span>
                      <span className="ml-2">{previousAssessment.correctAnswers}/{previousAssessment.totalQuestions}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleStartNewAssessment} 
                  className="flex-1"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Take New Assessment
                </Button>
                <Button 
                  onClick={handleViewPreviousResults} 
                  variant="outline" 
                  className="flex-1"
                  size="lg"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  View Previous Results
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Taking a new assessment will update your personalized curriculum based on your current skills.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-[#181A20] dark:bg-none flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Brain className="w-12 h-12 text-blue-600 animate-pulse" />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analyzing Your Skills</h2>
            <p className="text-gray-600 dark:text-gray-300">Our AI is carefully evaluating your responses and crafting your personalized learning journey...</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing answers...</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing patterns...</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Building curriculum...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && results && curriculum) {
    const visibleTopics = showFullCurriculum ? curriculum.topics : curriculum.topics.slice(0, 4);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-[#181A20] dark:bg-none p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Your Learning Journey</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Personalized curriculum crafted just for you</p>
          </div>

          {/* Score Overview - Now First */}
          <Card className="bg-white shadow-lg dark:bg-[#23243a] dark:text-gray-100">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <span className="text-4xl">{getLevelIcon(results.level)}</span>
                <div>
                  <CardTitle className="text-2xl">{results.level.charAt(0).toUpperCase() + results.level.slice(1)} Level</CardTitle>
                  <Badge className={`mt-2 ${getLevelColor(results.level)}`}>
                    {results.score}% Score
                  </Badge>
                </div>
              </div>
              <CardDescription>
                {results.correctAnswers} out of {results.totalQuestions} questions correct
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-blue-500" />
                  <p className="text-sm text-gray-600">Time Spent</p>
                  <p className="font-semibold">{Math.round(results.timeSpent / 60)} minutes</p>
                </div>
                <div className="space-y-2">
                  <Target className="w-8 h-8 mx-auto text-green-500" />
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="font-semibold">{results.confidence}%</p>
                </div>
                <div className="space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-purple-500" />
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-semibold">{results.estimatedExperience}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Curriculum - Now Second */}
          <Card className="bg-white shadow-lg border-2 border-blue-100 dark:bg-[#23243a] dark:text-gray-100">
            <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <GraduationCap className="w-8 h-8 text-blue-600" />
                <CardTitle className="text-2xl">Your Personalized Curriculum</CardTitle>
                <Badge className={`${getLevelColor(results.level)}`}>
                  {results.level.charAt(0).toUpperCase() + results.level.slice(1)} Level
                </Badge>
              </div>
              <CardDescription className="text-lg max-w-3xl mx-auto">
                {curriculum.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Approach Description */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 dark:bg-[#23243a] dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">Our Approach</h4>
                    <p className="text-green-700">{curriculum.approach}</p>
                  </div>
                </div>
              </div>

              {/* Topics with Visual Flow */}
              <div className="space-y-4">
                {visibleTopics.map((topic, index) => {
                  const IconComponent = getCurriculumIcon(index);
                  const isLast = index === visibleTopics.length - 1;
                  
                  return (
                    <div key={topic.id} className="relative">
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-white to-blue-50 rounded-lg border border-blue-200 dark:bg-[#23243a] dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-lg">{topic.title}</h4>
                            <Badge variant="outline" className="ml-2">{topic.difficulty}</Badge>
                          </div>
                          <p className="text-gray-600 mt-1">{topic.estimatedTime} minutes</p>
                          {topic.prerequisites.length > 0 && (
                            <p className="text-sm text-blue-600 mt-1">
                              Builds on: {topic.prerequisites.map(p => `Topic ${p}`).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                      
                      {/* Connection Line */}
                      {!isLast && (
                        <div className="absolute left-6 top-16 w-0.5 h-8 bg-blue-300"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Show More/Less Button */}
              {curriculum.topics.length > 4 && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowFullCurriculum(!showFullCurriculum)}
                    className="flex items-center space-x-2"
                  >
                    {showFullCurriculum ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Show Less</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>Show Full Curriculum ({curriculum.topics.length} topics)</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Milestones */}
              <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Your Learning Milestones
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {curriculum.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-purple-700">{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  <strong>Estimated Duration:</strong> {curriculum.estimatedDuration}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Performance Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="bg-white shadow-lg dark:bg-[#23243a] dark:text-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span>Your Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {results.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Keep practicing to build your strengths!</p>
                )}
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card className="bg-white shadow-lg dark:bg-[#23243a] dark:text-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span>Areas for Improvement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {results.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Great job! You're well-rounded.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Performance */}
          <Card className="bg-white shadow-lg dark:bg-[#23243a] dark:text-gray-100">
            <CardHeader>
              <CardTitle>Performance by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(results.categoryPerformance).map(([category, data]: [string, any]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category}</span>
                      <span className="text-sm text-gray-600">{data.correct}/{data.total} correct ({data.percentage}%)</span>
                    </div>
                    <Progress value={data.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Question Results */}
          <Card className="bg-white shadow-lg dark:bg-[#23243a] dark:text-gray-100">
            <CardHeader>
              <CardTitle>Question-by-Question Analysis</CardTitle>
              <CardDescription>Review your answers and learn from mistakes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.questionResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold">Question {index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={result.isCorrect ? "default" : "destructive"}>
                          {result.isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                        <Badge variant="outline">{result.category}</Badge>
                        <Badge variant="outline">{result.difficulty}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm">{result.question}</p>
                    
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600">Your Answer:</p>
                        <div className={`p-2 rounded border text-sm ${result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          {result.userAnswerText}
                        </div>
                      </div>
                      
                      {!result.isCorrect && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-600">Correct Answer:</p>
                          <div className="p-2 rounded border bg-green-50 border-green-200 text-sm">
                            {result.correctAnswerText}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs text-blue-800">
                        <strong>Explanation:</strong> {result.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-white shadow-lg dark:bg-[#23243a] dark:text-gray-100">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push(`/curriculum?level=${results.level}&score=${results.score}`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Learning
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowResults(false);
                setCurrentStep(1);
                setResults(null);
                setCurriculum(null);
                setRecommendations([]);
                setAnswers({});
              }}
            >
              Retake Assessment
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-[#181A20] dark:bg-none p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Skill Assessment</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            This will take just a few minutes and will help us create the perfect learning plan for you.
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Step {currentStep} of 3</span>
            <span>{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / 3) * 100} className="h-2" />
        </div>

        {/* Step 1: Quiz */}
        {currentStep === 1 && (
          <Card className="bg-white shadow-lg dark:bg-[#23243a] dark:text-gray-100">
            <CardHeader>
              <CardTitle className="dark:text-gray-100">DSA Knowledge Quiz</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Answer these questions to assess your current understanding. Be honest - this helps us create the best learning path for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-[#23243a] dark:border-gray-700">
                    <h3 className="font-semibold text-lg dark:text-gray-100">
                      Question {index + 1}: {question.question}
                    </h3>
                    <RadioGroup
                      value={answers[question.id]?.toString() || ''}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                    >
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={optionIndex.toString()} id={`${question.id}-${optionIndex}`} />
                          <Label htmlFor={`${question.id}-${optionIndex}`} className="text-sm dark:text-gray-200">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={Object.keys(answers).length < questions.length}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Experience */}
        {currentStep === 2 && (
          <Card className="bg-white shadow-lg dark:bg-[#23243a] dark:text-gray-100">
            <CardHeader>
              <CardTitle className="dark:text-gray-100">Your Experience</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Tell us about your programming background to better personalize your learning experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="experience" className="dark:text-gray-200">Previous DSA Experience</Label>
                <Select value={previousExperience} onValueChange={setPreviousExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No experience</SelectItem>
                    <SelectItem value="beginner">Beginner (0-6 months)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (6 months - 2 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (2+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attempts" className="dark:text-gray-200">How many DSA problems have you attempted?</Label>
                <Textarea
                  id="attempts"
                  placeholder="e.g., 50 problems, mostly easy level"
                  value={problemAttempts}
                  onChange={(e) => setProblemAttempts(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="dark:text-gray-200">Preferred Programming Language</Label>
                <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Previous
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  disabled={!previousExperience || !preferredLanguage}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <Card className="bg-white shadow-lg dark:bg-[#23243a] dark:text-gray-100">
            <CardHeader>
              <CardTitle className="dark:text-gray-100">Review & Submit</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Review your answers and submit your assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold dark:text-gray-100">Quiz Answers:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questions.map((question, index) => (
                    <div key={question.id} className="p-3 border rounded-lg dark:bg-[#23243a] dark:border-gray-700">
                      <p className="text-sm font-medium dark:text-gray-100">Q{index + 1}: {question.question}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Your answer: {answers[question.id] !== undefined ? question.options[answers[question.id]] : 'Not answered'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold dark:text-gray-100">Experience Details:</h3>
                <div className="space-y-2">
                  <p className="dark:text-gray-100"><strong>Experience Level:</strong> {previousExperience}</p>
                  <p className="dark:text-gray-100"><strong>Problem Attempts:</strong> {problemAttempts || 'Not specified'}</p>
                  <p className="dark:text-gray-100"><strong>Preferred Language:</strong> {preferredLanguage}</p>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  This assessment will take about 7 seconds to process. Please don't close this page.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Previous
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Processing...' : 'Submit Assessment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 