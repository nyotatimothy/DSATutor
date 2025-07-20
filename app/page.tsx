'use client';

import { useAuth } from '../src/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../src/components/ui/card'
import { Button } from '../src/components/ui/button'
import { Progress } from '../src/components/ui/progress'
import Link from 'next/link'
import { 
  Brain, 
  Target, 
  Clock, 
  CheckCircle, 
  Play, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  BookOpen,
  Code,
  Trophy,
  Star,
  Calendar,
  Users,
  Rocket,
  Circle,
  Loader2,
  Terminal,
  Wifi,
  Flame,
  Hash,
  ChevronRight,
  AlertTriangle,
  Gauge
} from 'lucide-react'
import { Badge } from '../src/components/ui/badge'
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState({ completed: 0, total: 0, percent: 0, currentTopic: '' });
  const [latestAssessment, setLatestAssessment] = useState<any>(null);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<any>(null);
  const [isLoadingPosition, setIsLoadingPosition] = useState(true);

  // Mock data for the new dashboard
  const mockData = {
    session: {
      active: true,
      streak: 7,
      onlineStatus: 'online'
    },
    recentProblems: [
      { name: 'Two Sum', topic: 'Arrays', timeAgo: '2h ago', difficulty: 'Easy' },
      { name: 'Valid Parentheses', topic: 'Stack', timeAgo: '5h ago', difficulty: 'Easy' },
      { name: 'Binary Tree Inorder', topic: 'Trees', timeAgo: '1d ago', difficulty: 'Medium' }
    ],
    currentProblem: {
      name: 'Longest Substring Without Repeating Characters',
      topic: 'Sliding Window',
      difficulty: 'Medium',
      estimatedTime: '25 min',
      confidence: 87
    },
    upcomingProblems: [
      { order: 1, name: 'Best Time to Buy Stock', topic: 'Arrays', difficulty: 'Easy' },
      { order: 2, name: 'Contains Duplicate', topic: 'Hash Table', difficulty: 'Easy' },
      { order: 3, name: 'Maximum Subarray', topic: 'Dynamic Programming', difficulty: 'Medium' },
      { order: 4, name: 'Merge Two Sorted Lists', topic: 'Linked Lists', difficulty: 'Easy' }
    ],
    skillProgress: [
      { skill: 'Arrays', progress: 85, status: 'strong' },
      { skill: 'Sliding Window', progress: 45, status: 'weak' },
      { skill: 'Dynamic Programming', progress: 78, status: 'strong' },
      { skill: 'Trees', progress: 32, status: 'weak' },
      { skill: 'Stack & Queue', progress: 90, status: 'strong' }
    ],
    performance: {
      successRate: 78,
      avgTime: '18 min',
      totalSolved: 42
    },
    aiConfidence: 92
  };

  useEffect(() => {
    if (user) {
      // Try to get latest curriculum and progress from localStorage
      const curriculumRaw = typeof window !== 'undefined' ? localStorage.getItem('dsatutor_latest_curriculum') : null;
      const assessmentRaw = typeof window !== 'undefined' ? localStorage.getItem('dsatutor_latest_assessment') : null;
      
      if (curriculumRaw) {
        try {
          const curriculum = JSON.parse(curriculumRaw);
          const total = curriculum.topics?.length || 0;
          setProgress({ completed: 2, total, percent: total > 0 ? Math.round((2/total) * 100) : 0, currentTopic: total > 0 ? curriculum.topics[0].title : '' });
        } catch {}
      }

      if (assessmentRaw) {
        try {
          const assessment = JSON.parse(assessmentRaw);
          setLatestAssessment(assessment);
          setHasAssessment(true);
        } catch {}
      }

      // Simulate loading
      setTimeout(() => setIsLoadingPosition(false), 1000);
    }
  }, [user]);

  const handleContinueLearning = () => {
    window.location.href = '/curriculum';
  };

  // If user is not logged in, show marketing page
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                  <Brain className="h-4 w-4 mr-2" />
                  AI-Powered Learning
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Master DSA with AI
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                  Get a personalized learning path tailored to your skills, goals, and timeline. 
                  No generic courses - just what you need to succeed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild className="text-lg px-8 py-6">
                    <Link href="/auth/signup">
                      <Rocket className="h-5 w-5 mr-2" />
                      Start Your Journey
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                    <Link href="/auth/login">
                      <ArrowRight className="h-5 w-5 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center p-6 border-0 shadow-lg bg-white/80 backdrop-blur">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Assessment</h3>
                <p className="text-muted-foreground">
                  Get evaluated on your current skills and receive a personalized curriculum
                </p>
              </Card>

              <Card className="text-center p-6 border-0 shadow-lg bg-white/80 backdrop-blur">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Adaptive Path</h3>
                <p className="text-muted-foreground">
                  Dynamic learning path that adapts to your progress and performance
                </p>
              </Card>

              <Card className="text-center p-6 border-0 shadow-lg bg-white/80 backdrop-blur">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Time Efficient</h3>
                <p className="text-muted-foreground">
                  Optimized study plans that fit your schedule and timeline
                </p>
              </Card>
            </div>

            {/* How It Works */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-8">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Sign Up</h3>
                  <p className="text-sm text-muted-foreground">Create your account</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Get Assessed</h3>
                  <p className="text-sm text-muted-foreground">Complete AI evaluation</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Receive Plan</h3>
                  <p className="text-sm text-muted-foreground">Get personalized curriculum</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">4</span>
                  </div>
                  <h3 className="font-semibold mb-2">Start Learning</h3>
                  <p className="text-sm text-muted-foreground">Begin your journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For logged-in users, check if they have completed assessment
  const hasCompletedAssessment = hasAssessment || (user as any).assessmentCompleted || false;

  // If user hasn't completed assessment, redirect to evaluation
  if (!hasCompletedAssessment) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Welcome to DSATutor!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Let's create your personalized learning path. First, we need to understand your current skills and goals.
            </p>
          </div>

          <Card className="p-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Initial Assessment</span>
              </CardTitle>
              <CardDescription>
                This will take about 10-15 minutes and will help us create the perfect learning plan for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="font-medium">10-15 min</div>
                  <div className="text-muted-foreground">Assessment time</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Code className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="font-medium">8 Questions</div>
                  <div className="text-muted-foreground">Technical skills</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <div className="font-medium">Goals & Timeline</div>
                  <div className="text-muted-foreground">Your objectives</div>
                </div>
              </div>

              <Button size="lg" className="w-full" asChild>
                <Link href="/evaluation">
                  <Play className="h-5 w-5 mr-2" />
                  Start Assessment
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // For users who have completed assessment, show NEW REDESIGNED dashboard
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Terminal-style Session Status Bar */}
        <div className="mb-6 bg-black/90 text-green-400 p-4 rounded-lg font-mono text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4" />
                <span>session.active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>{mockData.session.onlineStatus}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Flame className="h-4 w-4 text-orange-400" />
                <span>streak: {mockData.session.streak} days</span>
              </div>
            </div>
            <div className="text-xs text-green-400/70">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Two-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Learning Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Learning Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm">
                  {mockData.recentProblems.map((problem, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded border-l-4 border-green-500">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{problem.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {problem.topic}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground text-xs">{problem.timeAgo}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Focus */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-semibold mb-2">{mockData.currentProblem.name}</h3>
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        {mockData.currentProblem.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {mockData.currentProblem.topic}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {mockData.currentProblem.estimatedTime}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">AI Confidence:</span>
                        <span className="font-medium">{mockData.currentProblem.confidence}%</span>
                        <div className="w-16 bg-muted rounded-full h-1.5">
                          <div 
                            className="bg-green-600 h-1.5 rounded-full" 
                            style={{ width: `${mockData.currentProblem.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                      <button 
                        onClick={handleContinueLearning}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center space-x-1 transition-colors"
                      >
                        <Play className="h-3 w-3" />
                        <span>Continue Learning</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Up Next Queue */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Up Next
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockData.upcomingProblems.map((problem, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-primary/10 rounded text-xs flex items-center justify-center font-bold">
                          {problem.order}
                        </div>
                        <span className="font-medium text-sm">{problem.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {problem.topic}
                        </Badge>
                      </div>
                      <Badge className={`text-xs ${
                        problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {problem.difficulty}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Sidebar */}
          <div className="space-y-6">
            
            {/* Learning Path Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Learning Path
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockData.skillProgress.map((skill, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{skill.skill}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">{skill.progress}%</span>
                        {skill.status === 'weak' && (
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={skill.progress} 
                      className={`h-2 ${skill.status === 'weak' ? 'bg-orange-100' : 'bg-muted'}`}
                    />
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Needs Focus:</span>
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Sliding Window
                  </Badge>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall AI Confidence:</span>
                    <span className="text-lg font-bold text-green-600">{mockData.aiConfidence}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-lg font-bold text-green-600">{mockData.performance.successRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Time per Problem</span>
                  <span className="text-lg font-bold text-blue-600">{mockData.performance.avgTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Problems Solved</span>
                  <span className="text-lg font-bold text-purple-600">{mockData.performance.totalSolved}</span>
                </div>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  What's Next
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete 3 more sliding window problems to unlock Dynamic Programming fundamentals.
                  </p>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">3/5 complete</span>
                  </div>
                </div>
                <button 
                  onClick={handleContinueLearning}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center space-x-1 transition-colors"
                >
                  <ChevronRight className="h-3 w-3" />
                  <span>Continue Learning</span>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
