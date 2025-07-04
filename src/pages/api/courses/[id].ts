import { NextApiRequest, NextApiResponse } from 'next'
import { CourseController } from '../../../controllers/courseController'
import { authenticateToken } from '../../../middlewares/auth'

const courseController = new CourseController()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Mock course data
    const mockCourses: { [key: string]: any } = {
      '1': {
        id: '1',
        title: 'Data Structures Fundamentals',
        description: 'Master the basics of arrays, linked lists, stacks, and queues. Learn how to implement and use these fundamental data structures effectively.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        topics: [
          { 
            id: '1', 
            title: 'Introduction to Arrays', 
            description: 'Learn about arrays, their properties, and basic operations.',
            order: 1, 
            courseId: '1', 
            createdAt: '2024-01-01T00:00:00Z', 
            updatedAt: '2024-01-01T00:00:00Z' 
          },
          { 
            id: '2', 
            title: 'Linked Lists', 
            description: 'Understand singly and doubly linked lists, their implementation and use cases.',
            order: 2, 
            courseId: '1', 
            createdAt: '2024-01-01T00:00:00Z', 
            updatedAt: '2024-01-01T00:00:00Z' 
          },
          { 
            id: '3', 
            title: 'Stacks and Queues', 
            description: 'Master LIFO and FIFO data structures and their applications.',
            order: 3, 
            courseId: '1', 
            createdAt: '2024-01-01T00:00:00Z', 
            updatedAt: '2024-01-01T00:00:00Z' 
          }
        ],
        _count: { topics: 3 }
      },
      '2': {
        id: '2',
        title: 'Algorithms & Complexity',
        description: 'Understand algorithm analysis, time complexity, and space complexity. Learn to write efficient algorithms.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        topics: [
          { 
            id: '4', 
            title: 'Big O Notation', 
            description: 'Learn to analyze algorithm efficiency and complexity.',
            order: 1, 
            courseId: '2', 
            createdAt: '2024-01-01T00:00:00Z', 
            updatedAt: '2024-01-01T00:00:00Z' 
          },
          { 
            id: '5', 
            title: 'Sorting Algorithms', 
            description: 'Master bubble sort, merge sort, quick sort, and more.',
            order: 2, 
            courseId: '2', 
            createdAt: '2024-01-01T00:00:00Z', 
            updatedAt: '2024-01-01T00:00:00Z' 
          },
          { 
            id: '6', 
            title: 'Searching Algorithms', 
            description: 'Learn linear search, binary search, and their applications.',
            order: 3, 
            courseId: '2', 
            createdAt: '2024-01-01T00:00:00Z', 
            updatedAt: '2024-01-01T00:00:00Z' 
          }
        ],
        _count: { topics: 3 }
      },
      '3': {
        id: '3',
        title: 'Advanced Problem Solving',
        description: 'Tackle complex problems using advanced techniques like dynamic programming, graph algorithms, and more.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        topics: [
          { 
            id: '7', 
            title: 'Dynamic Programming', 
            description: 'Learn to solve complex problems by breaking them into smaller subproblems.',
            order: 1, 
            courseId: '3', 
            createdAt: '2024-01-01T00:00:00Z', 
            updatedAt: '2024-01-01T00:00:00Z' 
          },
          { 
            id: '8', 
            title: 'Graph Algorithms', 
            description: 'Master BFS, DFS, shortest path algorithms, and more.',
            order: 2, 
            courseId: '3', 
            createdAt: '2024-01-01T00:00:00Z', 
            updatedAt: '2024-01-01T00:00:00Z' 
          },
          { 
            id: '9', 
            title: 'Advanced Data Structures', 
            description: 'Learn about trees, heaps, hash tables, and their applications.',
            order: 3, 
            courseId: '3', 
            createdAt: '2024-01-01T00:00:00Z', 
            updatedAt: '2024-01-01T00:00:00Z' 
          }
        ],
        _count: { topics: 3 }
      },
      '4': {
        id: '4',
        title: 'Interview Preparation',
        description: 'Prepare for technical interviews with mock questions, coding challenges, and best practices.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        topics: [
          { 
            id: '10', 
            title: 'Mock Interviews', 
            description: 'Practice with realistic interview scenarios and feedback.',
            order: 1, 
            courseId: '4', 
            createdAt: '2024-01-01T00:00:00Z', 
            updatedAt: '2024-01-01T00:00:00Z' 
          },
          { 
            id: '11', 
            title: 'Common Patterns', 
            description: 'Learn the most common coding patterns and techniques.',
            order: 2, 
            courseId: '4', 
            createdAt: '2024-01-01T00:00:00Z', 
            updatedAt: '2024-01-01T00:00:00Z' 
          },
          { 
            id: '12', 
            title: 'System Design', 
            description: 'Understand how to design scalable systems and architectures.',
            order: 3, 
            courseId: '4', 
            createdAt: '2024-01-01T00:00:00Z', 
            updatedAt: '2024-01-01T00:00:00Z' 
          }
        ],
        _count: { topics: 3 }
      }
    };

    const course = mockCourses[id];
    if (course) {
      res.status(200).json({
        success: true,
        data: course
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
} 