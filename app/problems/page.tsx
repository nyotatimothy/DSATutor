'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Badge } from '../../src/components/ui/badge';
import { Skeleton } from '../../src/components/ui/skeleton';
import { Input } from '../../src/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../src/components/ui/tabs';
import { Code, Clock, Users, Star, Search, Play, BookOpen } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  status: 'completed' | 'in-progress' | 'not-started';
}

const categories = [
  'All',
  'Arrays',
  'Strings',
  'Linked Lists',
  'Stacks & Queues',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Sorting & Searching',
  'Bit Manipulation'
];

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    // For demo, use static problems and topics from curriculum
    const curriculumRaw = typeof window !== 'undefined' ? localStorage.getItem('dsatutor_latest_curriculum') : null;
    let topics: string[] = [];
    if (curriculumRaw) {
      const curriculum = JSON.parse(curriculumRaw);
      topics = (curriculum.topics || []).map((t: any) => t.title);
    }
    // Demo problems
    const demoProblems: Problem[] = [
      { id: '1', title: 'Two Sum', topic: topics[0] || 'Arrays & Hashing', difficulty: 'Easy', status: 'completed' },
      { id: '2', title: 'Valid Palindrome', topic: topics[1] || 'Two Pointers', difficulty: 'Easy', status: 'completed' },
      { id: '3', title: 'Best Time to Buy and Sell Stock', topic: topics[4] || 'Sliding Window', difficulty: 'Easy', status: 'in-progress' },
      { id: '4', title: 'Reverse Linked List', topic: topics[5] || 'Linked List', difficulty: 'Medium', status: 'not-started' },
      { id: '5', title: 'Binary Search', topic: topics[2] || 'Binary Search', difficulty: 'Medium', status: 'not-started' },
      { id: '6', title: 'Maximum Depth of Binary Tree', topic: topics[6] || 'Trees', difficulty: 'Medium', status: 'not-started' },
      { id: '7', title: 'Word Search', topic: topics[9] || 'Backtracking', difficulty: 'Hard', status: 'not-started' },
      { id: '8', title: 'Climbing Stairs', topic: topics[11] || '1-D DP', difficulty: 'Easy', status: 'not-started' },
    ];
    setProblems(demoProblems);
    setIsLoading(false);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartProblem = (problemId: string) => {
    // Navigate to problem solving page
    window.location.href = `/problems/${problemId}/solve`;
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.topic.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || problem.topic === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Practice Problems</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Problems</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProblems.map((problem, i) => (
            <Card key={problem.id} className="flex flex-col justify-between h-full border-2 border-blue-100">
              <CardHeader className="flex flex-row items-center space-x-4 py-4">
                <BookOpen className="h-6 w-6 text-blue-500" />
                <CardTitle className="text-lg font-semibold truncate max-w-[180px]">{problem.title}</CardTitle>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 ml-auto">{problem.topic}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge className={
                    problem.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                    problem.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    'bg-gray-100 text-gray-800 border-gray-200'
                  }>
                    {problem.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  <Badge className={
                    problem.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-200' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }>
                    {problem.difficulty}
                  </Badge>
                </div>
                <Button asChild className="w-full mt-2">
                  <Link href={`/problems/${problem.id}/solve`}>
                    <Play className="h-4 w-4 mr-2" />
                    Solve
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 