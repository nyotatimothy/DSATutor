import { NextApiRequest, NextApiResponse } from 'next'
import { CourseController } from '../../../controllers/courseController'
import { authenticateToken } from '../../../middlewares/auth'

const courseController = new CourseController()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Mock courses data
    const mockCourses = [
      {
        id: '1',
        title: 'Data Structures Fundamentals',
        description: 'Master the basics of arrays, linked lists, stacks, and queues. Learn how to implement and use these fundamental data structures effectively.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        topics: [
          { id: '1', title: 'Introduction to Arrays', order: 1, courseId: '1', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
          { id: '2', title: 'Linked Lists', order: 2, courseId: '1', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
          { id: '3', title: 'Stacks and Queues', order: 3, courseId: '1', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }
        ],
        _count: { topics: 3 }
      },
      {
        id: '2',
        title: 'Algorithms & Complexity',
        description: 'Understand algorithm analysis, time complexity, and space complexity. Learn to write efficient algorithms.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        topics: [
          { id: '4', title: 'Big O Notation', order: 1, courseId: '2', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
          { id: '5', title: 'Sorting Algorithms', order: 2, courseId: '2', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
          { id: '6', title: 'Searching Algorithms', order: 3, courseId: '2', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }
        ],
        _count: { topics: 3 }
      },
      {
        id: '3',
        title: 'Advanced Problem Solving',
        description: 'Tackle complex problems using advanced techniques like dynamic programming, graph algorithms, and more.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        topics: [
          { id: '7', title: 'Dynamic Programming', order: 1, courseId: '3', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
          { id: '8', title: 'Graph Algorithms', order: 2, courseId: '3', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
          { id: '9', title: 'Advanced Data Structures', order: 3, courseId: '3', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }
        ],
        _count: { topics: 3 }
      },
      {
        id: '4',
        title: 'Interview Preparation',
        description: 'Prepare for technical interviews with mock questions, coding challenges, and best practices.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        topics: [
          { id: '10', title: 'Mock Interviews', order: 1, courseId: '4', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
          { id: '11', title: 'Common Patterns', order: 2, courseId: '4', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
          { id: '12', title: 'System Design', order: 3, courseId: '4', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }
        ],
        _count: { topics: 3 }
      }
    ];

    res.status(200).json({
      success: true,
      data: mockCourses,
      pagination: {
        page: 1,
        limit: 10,
        total: mockCourses.length,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
} 