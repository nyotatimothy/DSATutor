'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Badge } from '../../src/components/ui/badge';
import { Skeleton } from '../../src/components/ui/skeleton';
import { Input } from '../../src/components/ui/input';
import { BookOpen, Clock, Users, Star, Search, Filter } from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  order: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  topics: Topic[];
  _count: {
    topics: number;
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    courses: Course[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();

      if (response.ok && data.success) {
        // Handle different response structures
        if (Array.isArray(data.data)) {
          setCourses(data.data);
        } else if (data.data && Array.isArray(data.data.courses)) {
          setCourses(data.data.courses);
        } else {
          setCourses([]);
        }
      } else {
        setError(data.message || 'Failed to fetch courses');
        setCourses([]);
      }
    } catch (err) {
      setError('An error occurred while fetching courses');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = (courses || []).filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-10 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="card-enhanced">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
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
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold gradient-text mb-4">Explore Our Courses</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Master Data Structures and Algorithms with our comprehensive course collection
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Courses Grid */}
      {error ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Error Loading Courses</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchCourses}>Try Again</Button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No courses found</h2>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms.' : 'No courses available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="card-enhanced group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {course._count.topics} Topics
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course._count.topics} Lessons</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Self-paced</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>All levels</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>4.8/5</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link href={`/courses/${course.id}`} className="block">
                    <Button className="w-full button-gradient mt-4">
                      Start Learning
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Call to Action */}
      {filteredCourses.length > 0 && (
        <div className="mt-12 text-center">
          <div className="gradient-bg rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Choose a course and begin your path to mastering Data Structures and Algorithms.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="button-gradient">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 