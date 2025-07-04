'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import { Button } from '../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Badge } from '../../src/components/ui/badge';
import { Progress } from '../../src/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../src/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Trophy, 
  Calendar,
  BookOpen,
  Code,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface ProgressData {
  totalProblems: number;
  solvedProblems: number;
  totalCourses: number;
  completedCourses: number;
  currentStreak: number;
  totalStudyTime: number;
  averageScore: number;
  weakAreas: string[];
  strongAreas: string[];
  recentActivity: Array<{
    id: number;
    type: 'problem' | 'course' | 'achievement';
    title: string;
    date: string;
    score?: number;
    timeSpent?: number;
  }>;
  monthlyProgress: Array<{
    month: string;
    problemsSolved: number;
    studyTime: number;
    averageScore: number;
  }>;
  courseProgress: Array<{
    id: number;
    title: string;
    progress: number;
    completedTopics: number;
    totalTopics: number;
    lastAccessed: string;
  }>;
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const response = await fetch('/api/progress');
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      } else {
        // Fallback to mock data if API fails
        setProgressData({
          totalProblems: 150,
          solvedProblems: 87,
          totalCourses: 8,
          completedCourses: 3,
          currentStreak: 12,
          totalStudyTime: 156, // hours
          averageScore: 78,
          weakAreas: ['Dynamic Programming', 'Graph Algorithms', 'Advanced Data Structures'],
          strongAreas: ['Arrays', 'Strings', 'Basic Algorithms'],
          recentActivity: [
            {
              id: 1,
              type: 'problem',
              title: 'Reverse Linked List',
              date: '2024-01-15',
              score: 85,
              timeSpent: 25
            },
            {
              id: 2,
              type: 'course',
              title: 'Data Structures Fundamentals',
              date: '2024-01-14',
              timeSpent: 120
            },
            {
              id: 3,
              type: 'achievement',
              title: '7-Day Streak',
              date: '2024-01-13'
            },
            {
              id: 4,
              type: 'problem',
              title: 'Two Sum',
              date: '2024-01-12',
              score: 92,
              timeSpent: 15
            }
          ],
          monthlyProgress: [
            { month: 'Jan', problemsSolved: 25, studyTime: 45, averageScore: 82 },
            { month: 'Feb', problemsSolved: 32, studyTime: 52, averageScore: 78 },
            { month: 'Mar', problemsSolved: 28, studyTime: 48, averageScore: 85 },
            { month: 'Apr', problemsSolved: 35, studyTime: 61, averageScore: 79 },
            { month: 'May', problemsSolved: 42, studyTime: 68, averageScore: 83 },
            { month: 'Jun', problemsSolved: 38, studyTime: 55, averageScore: 81 }
          ],
          courseProgress: [
            {
              id: 1,
              title: 'Data Structures Fundamentals',
              progress: 75,
              completedTopics: 6,
              totalTopics: 8,
              lastAccessed: '2024-01-15'
            },
            {
              id: 2,
              title: 'Algorithms & Complexity',
              progress: 45,
              completedTopics: 4,
              totalTopics: 10,
              lastAccessed: '2024-01-14'
            },
            {
              id: 3,
              title: 'Advanced Problem Solving',
              progress: 20,
              completedTopics: 2,
              totalTopics: 12,
              lastAccessed: '2024-01-10'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading progress data...</div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Failed to load progress data</div>
      </div>
    );
  }

  const overallProgress = Math.round((progressData.solvedProblems / progressData.totalProblems) * 100);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
          <p className="text-muted-foreground">Track your learning journey and achievements</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
              <Code className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.solvedProblems}/{progressData.totalProblems}</div>
              <Progress value={overallProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">{overallProgress}% complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Target className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.currentStreak} days</div>
              <p className="text-xs text-muted-foreground mt-2">Keep it up!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.totalStudyTime}h</div>
              <p className="text-xs text-muted-foreground mt-2">Total time spent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.averageScore}%</div>
              <p className="text-xs text-muted-foreground mt-2">Problem solving accuracy</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strong Areas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>Strong Areas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {progressData.strongAreas.map((area, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{area}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weak Areas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <span>Areas for Improvement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {progressData.weakAreas.map((area, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">{area}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="space-y-4">
              {progressData.courseProgress.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription>
                          {course.completedTopics} of {course.totalTopics} topics completed
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{course.progress}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={course.progress} className="mb-4" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Last accessed: {course.lastAccessed}</span>
                      <Button variant="outline" size="sm">
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                        {activity.type === 'problem' && <Code className="h-5 w-5 text-primary" />}
                        {activity.type === 'course' && <BookOpen className="h-5 w-5 text-blue-500" />}
                        {activity.type === 'achievement' && <Trophy className="h-5 w-5 text-yellow-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-sm text-muted-foreground">{activity.date}</div>
                      </div>
                      <div className="text-right">
                        {activity.score && (
                          <Badge variant="secondary">{activity.score}%</Badge>
                        )}
                        {activity.timeSpent && (
                          <div className="text-sm text-muted-foreground">
                            {activity.timeSpent}m
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progressData.monthlyProgress.map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{month.month}</span>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>{month.problemsSolved} problems</span>
                          <span>{month.studyTime}h</span>
                          <Badge variant="outline">{month.averageScore}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{progressData.averageScore}%</div>
                      <div className="text-sm text-muted-foreground">Average Problem Score</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{Math.round(progressData.totalStudyTime / 30)}h</div>
                      <div className="text-sm text-muted-foreground">Average Daily Study Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 