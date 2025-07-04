import { NextApiRequest, NextApiResponse } from 'next'
import { TopicController } from '../../../controllers/topicController'
import { authenticateToken } from '../../../middlewares/auth'

const topicController = new TopicController()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { courseId } = req.query;

    // Mock topics data
    const mockTopics = [
      {
        id: 1,
        title: "Introduction to Arrays",
        description: "Learn the fundamentals of arrays and their operations",
        courseId: 1,
        order: 1,
        problemsCount: 5,
        completedProblems: 3,
        isCompleted: false
      },
      {
        id: 2,
        title: "Array Manipulation",
        description: "Advanced array operations and algorithms",
        courseId: 1,
        order: 2,
        problemsCount: 4,
        completedProblems: 2,
        isCompleted: false
      },
      {
        id: 3,
        title: "String Fundamentals",
        description: "Basic string operations and manipulation",
        courseId: 1,
        order: 3,
        problemsCount: 6,
        completedProblems: 4,
        isCompleted: false
      },
      {
        id: 4,
        title: "Linked Lists Basics",
        description: "Introduction to linked list data structure",
        courseId: 1,
        order: 4,
        problemsCount: 3,
        completedProblems: 1,
        isCompleted: false
      },
      {
        id: 5,
        title: "Stack and Queue Operations",
        description: "Understanding stack and queue data structures",
        courseId: 1,
        order: 5,
        problemsCount: 4,
        completedProblems: 0,
        isCompleted: false
      },
      {
        id: 6,
        title: "Tree Data Structures",
        description: "Binary trees and tree traversal algorithms",
        courseId: 1,
        order: 6,
        problemsCount: 5,
        completedProblems: 0,
        isCompleted: false
      },
      {
        id: 7,
        title: "Graph Fundamentals",
        description: "Introduction to graph data structures",
        courseId: 1,
        order: 7,
        problemsCount: 4,
        completedProblems: 0,
        isCompleted: false
      },
      {
        id: 8,
        title: "Dynamic Programming Basics",
        description: "Introduction to dynamic programming concepts",
        courseId: 1,
        order: 8,
        problemsCount: 6,
        completedProblems: 0,
        isCompleted: false
      }
    ];

    // Filter by courseId if provided
    let filteredTopics = mockTopics;
    if (courseId) {
      filteredTopics = mockTopics.filter(topic => topic.courseId === parseInt(courseId as string));
    }

    res.status(200).json({
      success: true,
      data: filteredTopics
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
} 
 