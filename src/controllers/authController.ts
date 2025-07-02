import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { FirebaseService } from '../services/firebase'
import { EmailService } from '../services/email'
import { AuthenticatedRequest } from '../middlewares/auth'

export class AuthController {
  constructor() {
    // Services use static methods, no need to instantiate
  }

  /**
   * Generate JWT token for user
   */
  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )
  }

  /**
   * Sign up a new user
   */
  async signup(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { email, password, fullName } = req.body

      // Validate input
      if (!email || !password || !fullName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Email, password, and full name are required'
        })
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User already exists',
          message: 'A user with this email already exists'
        })
      }

      // Create user in Firebase
      let firebaseUser
      try {
        firebaseUser = await FirebaseService.signUp(email, password)
      } catch (firebaseError: any) {
        console.error('Firebase signup error:', firebaseError)
        
        // Handle specific Firebase errors
        if (firebaseError.code === 'auth/email-already-in-use') {
          return res.status(409).json({
            success: false,
            error: 'User already exists',
            message: 'A user with this email already exists'
          })
        }
        
        return res.status(500).json({
          success: false,
          error: 'Firebase error',
          message: firebaseError.message || 'Failed to create user in authentication service'
        })
      }

      if (!firebaseUser) {
        return res.status(500).json({
          success: false,
          error: 'Firebase error',
          message: 'Failed to create user in authentication service'
        })
      }

      // Create user in database
      const user = await prisma.user.create({
        data: {
          email,
          fullName,
          firebaseUid: firebaseUser.user.uid,
          role: 'student' // Default role
        }
      })

      // Generate JWT token
      const token = this.generateToken(user.id)

      // Send welcome email
      try {
        await EmailService.sendWelcomeEmail(email, fullName)
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
        // Don't fail the signup if email fails
      }

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
          },
          token
        }
      })
    } catch (error: any) {
      console.error('Signup error:', error)
      
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          error: 'User already exists',
          message: 'A user with this email already exists'
        })
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to create user'
      })
    }
  }

  /**
   * Sign in existing user
   */
  async signin(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { email, password } = req.body

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Email and password are required'
        })
      }

      // Authenticate with Firebase
      let firebaseUser
      try {
        firebaseUser = await FirebaseService.signIn(email, password)
      } catch (firebaseError: any) {
        console.error('Firebase signin error:', firebaseError)
        
        // Handle specific Firebase errors
        if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/user-not-found') {
          return res.status(401).json({
            success: false,
            error: 'Invalid credentials',
            message: 'Email or password is incorrect'
          })
        }
        
        return res.status(500).json({
          success: false,
          error: 'Firebase error',
          message: firebaseError.message || 'Failed to authenticate user'
        })
      }

      if (!firebaseUser) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        })
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User account not found in database'
        })
      }

      // Note: isActive field removed from schema, so we skip this check
      // Users are considered active by default

      // Generate JWT token
      const token = this.generateToken(user.id)

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
          },
          token
        }
      })
    } catch (error) {
      console.error('Signin error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to authenticate user'
      })
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { email } = req.body

      // Validate input
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Missing email',
          message: 'Email is required'
        })
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'No user found with this email address'
        })
      }

      // Send password reset email via Firebase
      try {
        await FirebaseService.resetPassword(email)
      } catch (resetError) {
        return res.status(500).json({
          success: false,
          error: 'Reset failed',
          message: 'Failed to send password reset email'
        })
      }

      // Send confirmation email
      try {
        await EmailService.sendPasswordResetEmail(email, 'https://dsatutor.com/reset-password')
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError)
        // Don't fail the reset if email fails
      }

      return res.status(200).json({
        success: true,
        message: 'Password reset email sent',
        data: {
          email
        }
      })
    } catch (error) {
      console.error('Password reset error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to process password reset'
      })
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to access your profile'
        })
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User profile not found'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user }
      })
    } catch (error) {
      console.error('Get profile error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve profile'
      })
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to update your profile'
        })
      }

      const { fullName } = req.body

      // Validate input
      if (!fullName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Full name is required'
        })
      }

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { fullName },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          updatedAt: true
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      })
    } catch (error) {
      console.error('Update profile error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update profile'
      })
    }
  }

  /**
   * Logout (client-side token removal)
   */
  async logout(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      // In a JWT-based system, logout is typically handled client-side
      // by removing the token. However, we can implement server-side
      // token blacklisting if needed in the future.

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      })
    } catch (error) {
      console.error('Logout error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to logout'
      })
    }
  }
} 