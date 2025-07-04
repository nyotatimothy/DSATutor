'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Badge } from '../../src/components/ui/badge';
import { Skeleton } from '../../src/components/ui/skeleton';
import { Input } from '../../src/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../src/components/ui/tabs';
import { Code, Clock, Users, Star, Search, Play } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  estimatedTime: number;
  solvedCount: number;
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
    // Mock data for now - replace with actual API call
    setTimeout(() => {
      setProblems([
        // Arrays
        {
          id: '1',
          title: 'Two Sum',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          difficulty: 'easy',
          category: 'Arrays',
          estimatedTime: 15,
          solvedCount: 1250
        },
        {
          id: '2',
          title: 'Maximum Subarray',
          description: 'Find the contiguous subarray with the largest sum.',
          difficulty: 'medium',
          category: 'Arrays',
          estimatedTime: 20,
          solvedCount: 890
        },
        {
          id: '3',
          title: 'Container With Most Water',
          description: 'Find two lines that together with the x-axis forms a container that would hold the greatest amount of water.',
          difficulty: 'medium',
          category: 'Arrays',
          estimatedTime: 25,
          solvedCount: 750
        },
        // Strings
        {
          id: '4',
          title: 'Valid Parentheses',
          description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
          difficulty: 'easy',
          category: 'Strings',
          estimatedTime: 10,
          solvedCount: 980
        },
        {
          id: '5',
          title: 'Longest Substring Without Repeating Characters',
          description: 'Find the length of the longest substring without repeating characters.',
          difficulty: 'medium',
          category: 'Strings',
          estimatedTime: 30,
          solvedCount: 650
        },
        // Linked Lists
        {
          id: '6',
          title: 'Reverse Linked List',
          description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
          difficulty: 'medium',
          category: 'Linked Lists',
          estimatedTime: 20,
          solvedCount: 750
        },
        {
          id: '7',
          title: 'Merge Two Sorted Lists',
          description: 'Merge two sorted linked lists and return it as a sorted list.',
          difficulty: 'easy',
          category: 'Linked Lists',
          estimatedTime: 15,
          solvedCount: 890
        },
        // Stacks & Queues
        {
          id: '8',
          title: 'Implement Stack using Queues',
          description: 'Implement a last-in-first-out (LIFO) stack using only two queues.',
          difficulty: 'medium',
          category: 'Stacks & Queues',
          estimatedTime: 25,
          solvedCount: 420
        },
        // Trees
        {
          id: '9',
          title: 'Binary Tree Inorder Traversal',
          description: 'Given the root of a binary tree, return the inorder traversal of its nodes values.',
          difficulty: 'medium',
          category: 'Trees',
          estimatedTime: 25,
          solvedCount: 620
        },
        {
          id: '10',
          title: 'Maximum Depth of Binary Tree',
          description: 'Given the root of a binary tree, return its maximum depth.',
          difficulty: 'easy',
          category: 'Trees',
          estimatedTime: 15,
          solvedCount: 1100
        },
        // Graphs
        {
          id: '11',
          title: 'Number of Islands',
          description: 'Given an m x n 2D binary grid which represents a map of "1"s (land) and "0"s (water), return the number of islands.',
          difficulty: 'medium',
          category: 'Graphs',
          estimatedTime: 35,
          solvedCount: 380
        },
        // Dynamic Programming
        {
          id: '12',
          title: 'Climbing Stairs',
          description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps.',
          difficulty: 'easy',
          category: 'Dynamic Programming',
          estimatedTime: 20,
          solvedCount: 950
        },
        {
          id: '13',
          title: 'House Robber',
          description: 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed.',
          difficulty: 'medium',
          category: 'Dynamic Programming',
          estimatedTime: 30,
          solvedCount: 520
        },
        // Sorting & Searching
        {
          id: '14',
          title: 'Binary Search',
          description: 'Given an array of integers nums which is sorted in ascending order, and an integer target.',
          difficulty: 'easy',
          category: 'Sorting & Searching',
          estimatedTime: 15,
          solvedCount: 1200
        },
        // Bit Manipulation
        {
          id: '15',
          title: 'Single Number',
          description: 'Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.',
          difficulty: 'easy',
          category: 'Bit Manipulation',
          estimatedTime: 20,
          solvedCount: 680
        }
      ]);
      setIsLoading(false);
    }, 1000);
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
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || problem.category === selectedCategory;
    
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Practice Problems</h1>
          <p className="text-muted-foreground mt-2">Sharpen your DSA skills with our curated problem set</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Problems Grid */}
      {filteredProblems.length === 0 ? (
        <div className="text-center py-12">
          <Code className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No problems found</h2>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms or category filter.' : 'No problems available in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.map((problem) => (
            <Card key={problem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{problem.title}</CardTitle>
                  <Badge className={getDifficultyColor(problem.difficulty)}>
                    {problem.difficulty}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {problem.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="outline" className="text-xs">{problem.category}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Time</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{problem.estimatedTime} min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Solved</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{problem.solvedCount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4 button-gradient"
                    onClick={() => handleStartProblem(problem.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Problem
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 