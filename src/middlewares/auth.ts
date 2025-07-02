import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string
    email: string
    fullName: string
    role: string
  }
}

/**
 * Middleware to authenticate JWT tokens and attach user to request
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'User not found'
      })
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Token is invalid or expired'
    })
  }
}

/**
 * Middleware to check if user has required role
 */
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Access denied. Required roles: ${roles.join(', ')}`
      })
    }

    next()
  }
}

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(['admin'])

/**
 * Middleware to check if user is creator or admin
 */
export const requireCreator = requireRole(['creator', 'admin'])

/**
 * Middleware to check if user is student
 */
export const requireStudent = requireRole(['student']) 