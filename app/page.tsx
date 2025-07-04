'use client';

import { useAuth } from '../src/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../src/components/ui/card'
import { Button } from '../src/components/ui/button'
import { Progress } from '../src/components/ui/progress'
import Link from 'next/link'
import { Code, BookOpen, Target, TrendingUp, Users, Zap, ArrowRight, Clock, Trophy, Play, CheckCircle, Circle, Star } from 'lucide-react'
import { Badge } from '../src/components/ui/badge'

export default function HomePage() {
  const { user } = useAuth();

  // Mock data for active course
  const activeCourse = {
    id: 1,
    title: "Data Structures Fundamentals",
    description: "Master arrays, linked lists, stacks, and queues",
    progress: 65,
    currentTopic: "Linked Lists",
    nextTopic: "Stacks and Queues",
    timeSpent: "2h 30m",
    totalTopics: 8,
    completedTopics: 5,
    nextProblem: {
      id: 3,
      title: "Reverse a Linked List",
      difficulty: "Medium"
    }
  };

  // Mock course structure
  const courseStructure = [
    { id: 1, title: "Introduction to Arrays", status: "completed", time: "45m" },
    { id: 2, title: "Array Manipulation", status: "completed", time: "1h 15m" },
    { id: 3, title: "Linked Lists Basics", status: "completed", time: "1h 30m" },
    { id: 4, title: "Linked List Operations", status: "in-progress", time: "30m" },
    { id: 5, title: "Stacks and Queues", status: "pending", time: "1h 45m" },
    { id: 6, title: "Trees and Graphs", status: "pending", time: "2h 30m" },
    { id: 7, title: "Advanced Algorithms", status: "pending", time: "3h 15m" },
    { id: 8, title: "Final Project", status: "pending", time: "4h 0m" }
  ];

  // If user is logged in, show dashboard-style content
  if (user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground">Continue your learning journey where you left off.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Course Card */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <span>Active Course</span>
                      </CardTitle>
                      <CardDescription>
                        {activeCourse.title}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {activeCourse.progress}% Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{activeCourse.progress}%</span>
                    </div>
                    <Progress value={activeCourse.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{activeCourse.completedTopics}/{activeCourse.totalTopics}</div>
                      <div className="text-xs text-muted-foreground">Topics Completed</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{activeCourse.timeSpent}</div>
                      <div className="text-xs text-muted-foreground">Time Spent</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{activeCourse.currentTopic}</div>
                      <div className="text-xs text-muted-foreground">Current Topic</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button asChild className="flex-1">
                      <Link href={`/courses/${activeCourse.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        Resume Course
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/problems/${activeCourse.nextProblem.id}/solve`}>
                        <Code className="h-4 w-4 mr-2" />
                        Next Problem
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
                    <Link href="/courses">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Browse All Courses
                    </Link>
                  </Button>
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

          {/* Course Structure */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Course Structure</CardTitle>
              <CardDescription>
                Track your progress through {activeCourse.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {courseStructure.map((topic, index) => (
                  <div 
                    key={topic.id} 
                    className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      // Navigate to topic or problem
                      if (topic.status === 'completed') {
                        // Show completed topic
                        alert(`${topic.title} - Completed`);
                      } else if (topic.status === 'in-progress') {
                        // Navigate to current topic
                        window.location.href = `/problems/${activeCourse.nextProblem.id}/solve`;
                      } else {
                        // Start new topic
                        window.location.href = `/problems/${activeCourse.nextProblem.id}/solve`;
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                        {topic.status === 'completed' ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : topic.status === 'in-progress' ? (
                          <Play className="h-3 w-3 text-primary" />
                        ) : (
                          <Circle className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-xs font-medium">Topic {index + 1}</span>
                    </div>
                    <div className="text-sm font-medium mb-1 line-clamp-2">{topic.title}</div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{topic.time}</span>
                      <Badge 
                        variant={
                          topic.status === 'completed' ? 'default' : 
                          topic.status === 'in-progress' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {topic.status === 'completed' ? 'Done' :
                         topic.status === 'in-progress' ? 'Active' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // For non-logged-in users, show the original landing page
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Master DSA with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your AI-powered platform for mastering Data Structures and Algorithms. 
            Get personalized learning paths, instant feedback, and expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose DSATutor?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get personalized learning paths and instant feedback on your solutions with our advanced AI.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Comprehensive Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  From basic arrays to advanced graph algorithms, we cover everything you need for technical interviews.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Interview Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Practice with real interview questions and get detailed explanations for optimal solutions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monitor your learning journey with detailed analytics and progress tracking.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join a community of learners and get help from peers and experts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Practice Coding</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Write, test, and debug code in our integrated development environment.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your DSA Journey?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers who have improved their problem-solving skills with DSATutor.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8">
              Start Learning Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
