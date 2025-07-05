'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../src/components/ui/card';
import { Button } from '../src/components/ui/button';
import { Badge } from '../src/components/ui/badge';
import { Progress } from '../src/components/ui/progress';
import Link from 'next/link';
import { TrendingUp, Play, Clock, Trophy } from 'lucide-react';

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

export default function AssessmentHistoryPage() {
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);

  useEffect(() => {
    // For demo, read from localStorage
    if (typeof window !== 'undefined') {
      const all = localStorage.getItem('dsatutor_assessment_history');
      const latest = localStorage.getItem('dsatutor_latest_assessment');
      let arr: AssessmentResult[] = [];
      if (all) {
        arr = JSON.parse(all);
      } else if (latest) {
        arr = [JSON.parse(latest)];
      }
      setAssessments(arr.reverse()); // Most recent first
    }
  }, []);

  const handleNewAssessment = () => {
    window.location.href = '/evaluation';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Assessment History</h1>
          <Button onClick={handleNewAssessment} className="flex items-center">
            <Play className="h-4 w-4 mr-2" />
            Take New Assessment
          </Button>
        </div>
        {assessments.length === 0 ? (
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-muted-foreground">No assessments found. Take your first assessment to get started!</p>
              <Button onClick={handleNewAssessment} className="mt-4">
                <Play className="h-4 w-4 mr-2" />
                Take Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Most recent assessment */}
            <Card className="mb-8 border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Most Recent Assessment</span>
                </CardTitle>
                <CardDescription>
                  Completed on {assessments[0].date ? new Date(assessments[0].date).toLocaleString() : 'Unknown'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {assessments[0].level.charAt(0).toUpperCase() + assessments[0].level.slice(1)} Level
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {assessments[0].score}% Score
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    {assessments[0].correctAnswers}/{assessments[0].totalQuestions} Correct
                  </Badge>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{assessments[0].score}%</span>
                  </div>
                  <Progress value={assessments[0].score} className="h-2" />
                </div>
                <div className="flex space-x-3">
                  <Button asChild className="flex-1">
                    <Link href="/curriculum">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Curriculum
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/progress">
                      <Clock className="h-4 w-4 mr-2" />
                      View Progress
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Past assessments */}
            <div className="space-y-6">
              {assessments.slice(1).map((a, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>Assessment {assessments.length - i - 1}</CardTitle>
                    <CardDescription>
                      Completed on {a.date ? new Date(a.date).toLocaleString() : 'Unknown'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {a.level.charAt(0).toUpperCase() + a.level.slice(1)} Level
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {a.score}% Score
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        {a.correctAnswers}/{a.totalQuestions} Correct
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 