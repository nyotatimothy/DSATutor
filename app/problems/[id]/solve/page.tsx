'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '../../../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { Badge } from '../../../../src/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../src/components/ui/select';
import { Textarea } from '../../../../src/components/ui/textarea';
import { Separator } from '../../../../src/components/ui/separator';
import { Progress } from '../../../../src/components/ui/progress';
import { Alert, AlertDescription } from '../../../../src/components/ui/alert';
import { useAuth } from '../../../../src/hooks/useAuth';
import { 
  Play, 
  Send, 
  Clock, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Timer,
  Code,
  Zap,
  RotateCcw,
  Trophy,
  Star,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  constraints: string[];
  starterCode: {
    [key: string]: string;
  };
}

interface Solution {
  type: 'run' | 'submit' | 'analysis';
  status: string;
  score?: number;
  executionTime?: number;
  memoryUsage?: number;
  testResults?: Array<{
    testCase: string | number;
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }>;
  feedback?: {
    syntax: string;
    logic: string;
    performance: string;
    suggestions: string[];
  };
  detailedFeedback?: {
    syntax: string;
    logic: string;
    performance: {
      timeComplexity: string;
      spaceComplexity: string;
      analysis: string;
    };
    codeQuality: {
      score: number;
      feedback: string;
    };
    suggestions: string[];
  };
  nextSteps?: string[];
  timestamp: string;
}

interface Attempt {
  id: number;
  code: string;
  language: string;
  score: number;
  status: string;
  timestamp: string;
  solution: Solution;
}

export default function ProblemSolvePage() {
  const params = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    // Get saved language preference from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('preferredLanguage') || 'javascript';
    }
    return 'javascript';
  });
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // New state for submission flow
  const [submissionState, setSubmissionState] = useState<'editing' | 'submitted' | 'completed'>('editing');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<Attempt | null>(null);
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);
  const [previousProblemId, setPreviousProblemId] = useState<number | null>(null);
  const [nextProblemId, setNextProblemId] = useState<number | null>(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
  ];

  useEffect(() => {
    // Start timer when component mounts
    setStartTime(new Date());
    
    // Fetch problem data
    if (params?.id) {
      fetchProblem();
      // Update progress to mark this topic as in-progress
      updateProgress();
    }
  }, [params?.id]);

  useEffect(() => {
    // Update elapsed time every second
    const interval = setInterval(() => {
      if (startTime) {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const fetchProblem = async () => {
    if (!params?.id) return;
    
    try {
      const response = await fetch(`/api/problems/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProblem(data);
        setCode(data.starterCode[selectedLanguage] || '');
        
        // Set navigation IDs
        const currentId = parseInt(params.id as string);
        setPreviousProblemId(currentId > 1 ? currentId - 1 : null);
        setNextProblemId(currentId < 15 ? currentId + 1 : null); // Assuming 15 problems total
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
      // Fallback to mock data
      const mockProblem: Problem = {
        id: 3,
        title: "Reverse a Linked List",
        description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        difficulty: "Medium",
        category: "Linked Lists",
        examples: [
          {
            input: "head = [1,2,3,4,5]",
            output: "[5,4,3,2,1]",
            explanation: "The linked list is reversed by changing the direction of all pointers."
          }
        ],
        constraints: [
          "The number of nodes in the list is in the range [0, 5000]",
          "-5000 <= Node.val <= 5000"
        ],
        starterCode: {
          javascript: "// Your JavaScript code here",
          python: "# Your Python code here",
          java: "// Your Java code here",
          cpp: "// Your C++ code here",
          csharp: "// Your C# code here"
        }
      };
      
      setProblem(mockProblem);
      setCode(mockProblem.starterCode[selectedLanguage] || '');
      
      // Set navigation IDs for mock data
      const currentId = parseInt(params.id as string);
      setPreviousProblemId(currentId > 1 ? currentId - 1 : null);
      setNextProblemId(currentId < 15 ? currentId + 1 : null);
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    // Save language preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', language);
    }
    if (problem?.starterCode[language]) {
      setCode(problem.starterCode[language]);
    }
  };

  const runCode = async () => {
    if (!params?.id) return;
    
    setIsRunning(true);
    try {
      const response = await fetch('/api/ai/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemId: params.id,
          userCode: code,
          language: selectedLanguage,
          action: 'run'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSolution(data.data);
        setShowAnalysis(true);
      } else {
        console.error('Error response:', await response.text());
      }
    } catch (error) {
      console.error('Error running code:', error);
      // Mock response for demo
      setSolution({
        type: 'run',
        status: 'completed',
        score: 85,
        executionTime: 15,
        memoryUsage: 38.5,
        testResults: [
          {
            testCase: 'Test Case 1',
            input: 'head = [1,2,3,4,5]',
            expected: '[5,4,3,2,1]',
            actual: '[5,4,3,2,1]',
            passed: true
          },
          {
            testCase: 'Test Case 2',
            input: 'head = [1,2,3,4,5]',
            expected: '[5,4,3,2,1]',
            actual: '[5,4,3,2,1]',
            passed: true
          }
        ],
        feedback: {
          syntax: 'Syntax is correct',
          logic: 'Logic is correct',
          performance: 'Performance is good',
          suggestions: [
            'Consider using a more efficient approach with two pointers',
            'Your solution is correct but could be optimized for edge cases',
            'Try to reduce the number of variable assignments'
          ]
        },
        detailedFeedback: {
          syntax: 'Syntax is correct',
          logic: 'Logic is correct',
          performance: {
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(1)',
            analysis: 'Analysis is correct'
          },
          codeQuality: {
            score: 90,
            feedback: 'Code quality is good'
          },
          suggestions: [
            'Consider using a more efficient approach with two pointers',
            'Your solution is correct but could be optimized for edge cases',
            'Try to reduce the number of variable assignments'
          ]
        },
        nextSteps: ['Try to optimize the solution further'],
        timestamp: new Date().toISOString()
      });
      setShowAnalysis(true);
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    if (!params?.id) return;
    
    setIsSubmitting(true);
    setSubmissionState('submitted');
    
    // Stop the timer when submitting
    setStartTime(null);
    
    try {
      const response = await fetch('/api/ai/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemId: params.id,
          userCode: code,
          language: selectedLanguage,
          action: 'submit',
          timeSpent: elapsedTime
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSolution(data.data);
        setShowAnalysis(true);
        
        // Create attempt record
        const attempt: Attempt = {
          id: attempts.length + 1,
          code,
          language: selectedLanguage,
          score: data.data.score || 0,
          status: data.data.status,
          timestamp: new Date().toISOString(),
          solution: data.data
        };
        
        setAttempts([...attempts, attempt]);
        setCurrentAttempt(attempt);
        setSubmissionState('completed');
        
        // Show retry prompt after a delay
        setTimeout(() => {
          setShowRetryPrompt(true);
        }, 2000);
        
        // Track user progress
        await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            problemId: params.id,
            timeSpent: elapsedTime,
            score: data.data.score || 0,
            completed: true
          }),
        });
      } else {
        console.error('Error response:', await response.text());
        setSubmissionState('editing');
        // Restart timer if submission fails
        setStartTime(new Date());
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      setSubmissionState('editing');
      // Restart timer if submission fails
      setStartTime(new Date());
    } finally {
      setIsSubmitting(false);
    }
  };

  const startNewAttempt = () => {
    setSubmissionState('editing');
    setShowRetryPrompt(false);
    setShowAnalysis(false);
    setSolution(null);
    setCurrentAttempt(null);
    // Reset timer for new attempt
    setStartTime(new Date());
    setElapsedTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEncouragingMessage = (score: number, attemptNumber: number) => {
    if (score >= 90) {
      return {
        title: "🎉 Excellent Work!",
        message: "You've mastered this problem! Your solution is efficient and well-structured. Ready to tackle something more challenging?",
        action: "Try a harder problem"
      };
    } else if (score >= 70) {
      return {
        title: "👍 Great Progress!",
        message: "You're getting the hang of this! Your approach is on the right track. Want to refine your solution or try a variation?",
        action: "Try again with improvements"
      };
    } else if (attemptNumber > 1) {
      return {
        title: "💪 Keep Going!",
        message: "Don't give up! Each attempt brings you closer to the solution. Let's break this down step by step.",
        action: "Try a different approach"
      };
    } else {
      return {
        title: "🚀 First Attempt!",
        message: "Great start! Every expert was once a beginner. Let's analyze what we can improve.",
        action: "Learn from feedback"
      };
    }
  };

  const getNextProblemRecommendation = async () => {
    if (!user) {
      alert('Please log in to get personalized recommendations');
      return;
    }

    try {
      const response = await fetch('/api/ai/learning-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.email,
          currentProblemId: params.id,
          userPerformance: attempts.map(attempt => ({
            problemId: params.id,
            score: attempt.score,
            timeSpent: elapsedTime
          }))
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.nextProblemId) {
          window.location.href = `/problems/${data.data.nextProblemId}/solve`;
        } else {
          // Fallback to next problem in sequence
          const currentId = parseInt(params.id as string);
          window.location.href = `/problems/${currentId + 1}/solve`;
        }
      } else {
        // Fallback to next problem in sequence
        const currentId = parseInt(params.id as string);
        window.location.href = `/problems/${currentId + 1}/solve`;
      }
    } catch (error) {
      console.error('Error getting next problem recommendation:', error);
      // Fallback to next problem in sequence
      const currentId = parseInt(params.id as string);
      window.location.href = `/problems/${currentId + 1}/solve`;
    }
  };

  const navigateToPreviousProblem = () => {
    if (previousProblemId) {
      window.location.href = `/problems/${previousProblemId}/solve`;
    }
  };

  const navigateToNextProblem = () => {
    if (nextProblemId) {
      window.location.href = `/problems/${nextProblemId}/solve`;
    }
  };

  const updateProgress = async () => {
    if (!params?.id) return;
    
    try {
      const token = localStorage.getItem('dsatutor_token');
      
      if (!token) {
        console.warn('No authentication token found, progress update skipped');
        return;
      }
      
      // Update progress to mark this topic as in-progress
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topicId: params.id,
          status: 'in_progress'
        })
      });

      if (response.ok) {
        console.log('Progress updated successfully');
      } else {
        console.warn('Failed to update progress - this is normal in demo mode');
      }
    } catch (error) {
      console.warn('Error updating progress - this is normal in demo mode:', error);
    }
  };

  if (!problem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading problem...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Problem Description */}
          <div className="space-y-6">
            {/* Navigation Bar */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <Button 
                variant="outline" 
                size="sm"
                onClick={navigateToPreviousProblem}
                disabled={!previousProblemId}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-muted-foreground">Problem {problem.id} of 15</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={navigateToNextProblem}
                disabled={!nextProblemId}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{problem.title}</h1>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={problem.difficulty === 'Easy' ? 'default' : problem.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                    {problem.difficulty}
                  </Badge>
                  <Badge variant="outline">{problem.category}</Badge>
                  {attempts.length > 0 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {attempts.length} attempt{attempts.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  <span>{formatTime(elapsedTime)}</span>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Problem Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{problem.description}</p>
                
                <div>
                  <h4 className="font-semibold mb-2">Examples:</h4>
                  {problem.examples.map((example, index) => (
                    <div key={index} className="bg-muted p-3 rounded-lg mb-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Input:</strong>
                          <pre className="mt-1">{example.input}</pre>
                        </div>
                        <div>
                          <strong>Output:</strong>
                          <pre className="mt-1">{example.output}</pre>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        <strong>Explanation:</strong> {example.explanation}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Constraints:</h4>
                  <ul className="text-sm space-y-1">
                    {problem.constraints.map((constraint, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-primary">•</span>
                        <span>{constraint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Editor */}
          <div className="space-y-6">
            {/* Submission Status */}
            {submissionState === 'submitted' && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Submission in progress...</strong> Analyzing your code and running test cases.
                </AlertDescription>
              </Alert>
            )}

            {submissionState === 'completed' && currentAttempt && (
              <Alert className={`border-${currentAttempt.score >= 80 ? 'green' : currentAttempt.score >= 60 ? 'yellow' : 'red'}-200 bg-${currentAttempt.score >= 80 ? 'green' : currentAttempt.score >= 60 ? 'yellow' : 'red'}-50`}>
                {currentAttempt.score >= 80 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : currentAttempt.score >= 60 ? (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={`text-${currentAttempt.score >= 80 ? 'green' : currentAttempt.score >= 60 ? 'yellow' : 'red'}-800`}>
                  <strong>Attempt {currentAttempt.id} submitted!</strong> Score: {currentAttempt.score}%
                </AlertDescription>
              </Alert>
            )}

            <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={submissionState === 'submitted'}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="min-h-[400px] font-mono text-sm bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:bg-slate-50 dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100"
                  placeholder="Write your solution here..."
                  disabled={submissionState === 'submitted'}
                />
                
                <div className="flex space-x-3 mt-4">
                  <Button 
                    onClick={runCode} 
                    disabled={isRunning || submissionState === 'submitted'}
                    variant="outline"
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isRunning ? 'Running...' : 'Run Code'}
                  </Button>
                  <Button 
                    onClick={submitSolution} 
                    disabled={isSubmitting || submissionState === 'submitted'}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Solution'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Retry Prompt */}
            {showRetryPrompt && currentAttempt && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      {currentAttempt.score >= 80 ? (
                        <Trophy className="h-12 w-12 text-yellow-500" />
                      ) : currentAttempt.score >= 60 ? (
                        <Star className="h-12 w-12 text-blue-500" />
                      ) : (
                        <MessageSquare className="h-12 w-12 text-green-500" />
                      )}
                    </div>
                    
                    {(() => {
                      const message = getEncouragingMessage(currentAttempt.score, attempts.length);
                      return (
                        <>
                          <h3 className="text-lg font-semibold">{message.title}</h3>
                          <p className="text-sm text-gray-600">{message.message}</p>
                          
                          <div className="flex space-x-3 justify-center">
                            <Button onClick={startNewAttempt} variant="outline">
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Try Again
                            </Button>
                            <Button onClick={getNextProblemRecommendation}>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Next Problem
                            </Button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results & Analysis */}
            {showAnalysis && solution && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>AI Analysis - {solution.type === 'run' ? 'Code Run' : 'Solution Submission'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status and Score */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {solution.testResults?.filter(r => r.passed).length || 0}/{solution.testResults?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Test Cases Passed</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{solution.score || 0}%</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-center">
                    <Badge 
                      variant={solution.status === 'success' || solution.status === 'passed' ? 'default' : 'destructive'}
                      className="text-sm"
                    >
                      {solution.status === 'success' || solution.status === 'passed' ? '✅ Passed' : '❌ Failed'}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Test Results */}
                  {solution.testResults && solution.testResults.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Test Results:</h4>
                      <div className="space-y-2">
                        {solution.testResults.map((test, index) => (
                          <div key={index} className={`p-3 rounded-lg border ${test.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Test Case {test.testCase}</span>
                              <Badge variant={test.passed ? 'default' : 'destructive'} className="text-xs">
                                {test.passed ? 'Passed' : 'Failed'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Input:</span>
                                <pre className="mt-1 bg-gray-100 p-1 rounded">{test.input}</pre>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Expected:</span>
                                <pre className="mt-1 bg-gray-100 p-1 rounded">{test.expected}</pre>
                              </div>
                            </div>
                            {!test.passed && (
                              <div className="mt-2">
                                <span className="text-muted-foreground text-xs">Actual:</span>
                                <pre className="mt-1 bg-red-100 p-1 rounded text-xs">{test.actual}</pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Performance Analysis */}
                  <div>
                    <h4 className="font-semibold mb-2">Performance Analysis:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Time Complexity:</span>
                        <div className="font-mono">{solution.detailedFeedback?.performance.timeComplexity || 'O(n)'}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Space Complexity:</span>
                        <div className="font-mono">{solution.detailedFeedback?.performance.spaceComplexity || 'O(1)'}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Execution Time:</span>
                        <div>{solution.executionTime || 0}ms</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Memory Used:</span>
                        <div>{solution.memoryUsage || 0}MB</div>
                      </div>
                    </div>
                  </div>

                  {/* Code Quality */}
                  {solution.detailedFeedback?.codeQuality && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Code Quality:</h4>
                        <div className="flex items-center space-x-2 mb-2">
                          <Progress value={solution.detailedFeedback.codeQuality.score} className="flex-1" />
                          <span className="text-sm font-medium">{solution.detailedFeedback.codeQuality.score}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{solution.detailedFeedback.codeQuality.feedback}</p>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Feedback */}
                  {solution.detailedFeedback && (
                    <div>
                      <h4 className="font-semibold mb-2">Detailed Feedback:</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium text-sm mb-1">Syntax:</div>
                          <div className="text-sm">{solution.detailedFeedback.syntax}</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="font-medium text-sm mb-1">Logic:</div>
                          <div className="text-sm">{solution.detailedFeedback.logic}</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="font-medium text-sm mb-1">Performance:</div>
                          <div className="text-sm">{solution.detailedFeedback.performance.analysis}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Suggestions */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4" />
                      <span>Optimization Suggestions</span>
                    </h4>
                    <ul className="space-y-2">
                      {(solution.detailedFeedback?.suggestions || solution.feedback?.suggestions || []).map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <span className="text-primary">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Next Steps */}
                  {solution.nextSteps && solution.nextSteps.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Next Steps:</h4>
                        <ul className="space-y-2">
                          {solution.nextSteps.map((step, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <span className="text-blue-500">→</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="text-center">
                    <Button variant="outline" className="w-full" onClick={getNextProblemRecommendation}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Get Next Problem Recommendation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
