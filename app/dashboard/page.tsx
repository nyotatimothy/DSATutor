'use client';

import { useAuth } from '../../src/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Progress } from '../../src/components/ui/progress';
import { Badge } from '../../src/components/ui/badge';
import Link from 'next/link';
import { Brain, Target, TrendingUp, Clock, Trophy, Code, Play, CheckCircle, Circle, Star, Calendar, Zap } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  // Mock personalized learning data
  const learningPath = {
    level: 'Intermediate',
    progress: 65,
    currentTopic: 'Dynamic Programming',
    nextTopic: 'Graph Algorithms',
    timeSpent: '28h',
    totalTopics: 20,
    completedTopics: 13,
    nextProblem: {
      id: 7,
      title: 'Climbing Stairs',
      difficulty: 'Medium',
      category: 'Dynamic Programming'
    },
    todayGoal: {
      problems: 3,
      completed: 2,
      timeTarget: '2h',
      timeSpent: '1h 30m'
    },
    strengths: ['Arrays', 'Linked Lists', 'Basic Algorithms'],
    weaknesses: ['Dynamic Programming', 'Graph Algorithms'],
    upcomingMilestones: [
      'Complete Dynamic Programming basics',
      'Master graph traversal algorithms',
      'Practice interview-style problems'
    ]
  };

  const recentActivity = [
    { type: 'completed', title: 'Solved "Two Sum" problem', time: '2 hours ago', score: 95 },
    { type: 'started', title: 'Began "Dynamic Programming" topic', time: '1 day ago' },
    { type: 'milestone', title: 'Completed Arrays section', time: '3 days ago' },
    { type: 'assessment', title: 'Updated skill assessment', time: '1 week ago' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Your Learning Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            {user ? `Hello, ${user.name || user.email}!` : 'Welcome to DSATutor'}
          </p>
        </div>
      </div>

      {/* Current Learning Path */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card className="card-enhanced border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span>Your AI-Curated Learning Path</span>
                  </CardTitle>
                  <CardDescription>
                    Personalized curriculum based on your assessment and performance
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {learningPath.level} Level
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{learningPath.progress}%</span>
                </div>
                <Progress value={learningPath.progress} className="h-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{learningPath.completedTopics}/{learningPath.totalTopics}</div>
                  <div className="text-xs text-muted-foreground">Topics Completed</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{learningPath.timeSpent}</div>
                  <div className="text-xs text-muted-foreground">Total Study Time</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{learningPath.currentTopic}</div>
                  <div className="text-xs text-muted-foreground">Current Focus</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button asChild className="flex-1">
                  <Link href={`/problems/${learningPath.nextProblem.id}/solve`}>
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

        {/* Today's Goals */}
        <div>
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Today's Goals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center space-x-1 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Circle className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {learningPath.todayGoal.completed}/{learningPath.todayGoal.problems} problems completed
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{learningPath.todayGoal.timeSpent} / {learningPath.todayGoal.timeTarget}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/problems">
                  <Code className="h-4 w-4 mr-2" />
                  Practice More
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-green-500" />
              <span>Your Strengths</span>
            </CardTitle>
            <CardDescription>Areas where you excel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {learningPath.strengths.map((strength, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{strength}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <span>Focus Areas</span>
            </CardTitle>
            <CardDescription>Topics to improve</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {learningPath.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">{weakness}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Milestones */}
      <Card className="card-enhanced mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Upcoming Milestones</span>
          </CardTitle>
          <CardDescription>Your learning roadmap</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningPath.upcomingMilestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-medium text-primary">{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{milestone}</p>
                  <p className="text-xs text-muted-foreground">
                    {index === 0 ? 'Next 2-3 days' : index === 1 ? 'Next week' : 'Next 2 weeks'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest learning milestones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'completed' ? 'bg-green-500' :
                  activity.type === 'started' ? 'bg-blue-500' :
                  activity.type === 'milestone' ? 'bg-yellow-500' :
                  'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                {activity.score && (
                  <Badge variant="outline" className="text-xs">
                    {activity.score}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 