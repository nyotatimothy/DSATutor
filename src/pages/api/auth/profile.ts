import { NextApiRequest, NextApiResponse } from 'next'
import { AuthController } from '../../../controllers/authController'
import { authenticateToken, AuthenticatedRequest } from '../../../middlewares/auth'

const authController = new AuthController()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (req.method === 'GET') {
      // Mock user profile data
      const mockProfileData = {
        id: 1,
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        avatar: '/placeholder-user.jpg',
        bio: 'Passionate about algorithms and data structures. Currently preparing for technical interviews.',
        joinDate: '2023-06-15',
        lastActive: '2024-01-15T10:30:00Z',
        preferences: {
          theme: 'dark',
          notifications: {
            email: true,
            push: true,
            weeklyReport: true
          },
          language: 'en',
          timezone: 'UTC'
        },
        stats: {
          totalProblemsSolved: 87,
          totalStudyTime: 156,
          currentStreak: 12,
          averageScore: 78,
          rank: 'Gold'
        }
      };

      return res.status(200).json(mockProfileData);
    }

    if (req.method === 'PUT') {
      const { firstName, lastName, bio, preferences } = req.body;

      // Mock update response
      const updatedProfile = {
        id: 1,
        email: 'john.doe@example.com',
        firstName: firstName || 'John',
        lastName: lastName || 'Doe',
        username: 'johndoe',
        avatar: '/placeholder-user.jpg',
        bio: bio || 'Passionate about algorithms and data structures. Currently preparing for technical interviews.',
        joinDate: '2023-06-15',
        lastActive: new Date().toISOString(),
        preferences: {
          theme: preferences?.theme || 'dark',
          notifications: {
            email: preferences?.notifications?.email ?? true,
            push: preferences?.notifications?.push ?? true,
            weeklyReport: preferences?.notifications?.weeklyReport ?? true
          },
          language: preferences?.language || 'en',
          timezone: preferences?.timezone || 'UTC'
        },
        stats: {
          totalProblemsSolved: 87,
          totalStudyTime: 156,
          currentStreak: 12,
          averageScore: 78,
          rank: 'Gold'
        }
      };

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
      });
    }
  } catch (error) {
    console.error('Error handling profile request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
} 