import { NextApiRequest, NextApiResponse } from 'next'
import { ProgressController } from '../../../controllers/progressController'
import { authenticateToken } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Mock progress data
    const mockProgressData = {
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
    };

    res.status(200).json(mockProgressData);
  } catch (error) {
    console.error('Error fetching progress data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
} 
 