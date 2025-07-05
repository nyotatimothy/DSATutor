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
  Circle
} from 'lucide-react'
import { Badge } from '../src/components/ui/badge'

export default function HomePage() {
  const { user } = useAuth();

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

              <Card className="text-center p-6 border-0 shadow-lg bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-green-500" />
              </Card>

              <Card className="text-center p-6 border-0 shadow-lg bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-purple-500" />
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
  const hasCompletedAssessment = (user as any).assessmentCompleted || false; // This would come from user data

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

  // For users who have completed assessment, show personalized dashboard
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Continue your personalized learning journey.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Learning Path */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <span>Your Learning Path</span>
                    </CardTitle>
                    <CardDescription>
                      AI-curated curriculum based on your assessment
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    65% Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">12/20</div>
                    <div className="text-xs text-muted-foreground">Topics Completed</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">2h 30m</div>
                    <div className="text-xs text-muted-foreground">Today's Study Time</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">Arrays</div>
                    <div className="text-xs text-muted-foreground">Current Focus</div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button asChild className="flex-1">
                    <Link href="/problems/3/solve">
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/progress">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Progress
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/problems">
                    <Code className="h-4 w-4 mr-2" />
                    Practice Problems
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/progress">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Progress
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/profile">
                    <Star className="h-4 w-4 mr-2" />
                    Profile & Goals
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Complete 3 problems</p>
                  <div className="flex justify-center space-x-1 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
