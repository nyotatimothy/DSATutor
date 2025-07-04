'use client';

import { useAuth } from '../../src/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Progress } from '../../src/components/ui/progress';
import { Badge } from '../../src/components/ui/badge';
import Link from 'next/link';
import { BookOpen, Target, TrendingUp, Clock, Trophy, Code, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Welcome back!</h1>
          <p className="text-xl text-muted-foreground">
            {user ? `Hello, ${user.name || user.email}!` : 'Welcome to DSATutor'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Started</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <Progress value={60} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
            <Code className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <Progress value={75} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              +12 this week
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 days</div>
            <Progress value={70} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Best: 12 days
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28h</div>
            <Progress value={45} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Continue your learning journey or start something new
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/courses" className="block">
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Browse Courses</div>
                        <div className="text-sm text-muted-foreground">Explore new topics</div>
                      </div>
                    </div>
                  </Button>
                </Link>
                
                <Link href="/problems" className="block">
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Code className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Practice Problems</div>
                        <div className="text-sm text-muted-foreground">Solve coding challenges</div>
                      </div>
                    </div>
                  </Button>
                </Link>
                
                <Link href="/progress" className="block">
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">View Progress</div>
                        <div className="text-sm text-muted-foreground">Track your learning</div>
                      </div>
                    </div>
                  </Button>
                </Link>
                
                <Link href="/profile" className="block">
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">View Profile</div>
                        <div className="text-sm text-muted-foreground">Manage your account</div>
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Completed "Arrays Basics"</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Solved "Two Sum" problem</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Started "Linked Lists" course</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Achieved 7-day streak</p>
                    <p className="text-xs text-muted-foreground">1 week ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="mt-8">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Getting Started Guide
            </CardTitle>
            <CardDescription>
              New to DSATutor? Follow these steps to begin your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-medium mb-2">Browse Courses</h3>
                <p className="text-sm text-muted-foreground">
                  Explore our curated collection of DSA courses designed for interview preparation.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-green-500">2</span>
                </div>
                <h3 className="font-medium mb-2">Practice Problems</h3>
                <p className="text-sm text-muted-foreground">
                  Solve problems with AI-powered hints and detailed explanations.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-500">3</span>
                </div>
                <h3 className="font-medium mb-2">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your learning progress and identify areas for improvement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 