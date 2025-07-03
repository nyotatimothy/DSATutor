import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class SuperAdminController {
  // User Management
  static async getAllUsers(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { page = 1, limit = 10, role, search } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      const where: any = {}
      if (role) where.role = role
      if (search) {
        where.OR = [
          { email: { contains: String(search), mode: 'insensitive' } },
          { fullName: { contains: String(search), mode: 'insensitive' } }
        ]
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                payments: true,
                progress: true,
                attempts: true,
                courses: true
              }
            }
          }
        }),
        prisma.user.count({ where })
      ])

      return res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Error fetching users:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
        message: 'Internal server error'
      })
    }
  }

  static async getUserDetails(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID',
          message: 'User ID is required'
        })
      }

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          progress: {
            include: {
              topic: {
                include: {
                  course: true
                }
              }
            },
            orderBy: { updatedAt: 'desc' },
            take: 10
          },
          attempts: {
            include: {
              topic: {
                include: {
                  course: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          skillAssessments: {
            orderBy: { assessmentDate: 'desc' },
            take: 5
          },
          courses: {
            include: {
              topics: true
            }
          },
          _count: {
            select: {
              payments: true,
              progress: true,
              attempts: true,
              courses: true,
              skillAssessments: true
            }
          }
        }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User with the specified ID does not exist'
        })
      }

      return res.status(200).json({
        success: true,
        data: user
      })
    } catch (error) {
      console.error('Error fetching user details:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user details',
        message: 'Internal server error'
      })
    }
  }

  static async updateUserRole(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query
      const { role } = req.body

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID',
          message: 'User ID is required'
        })
      }

      if (!role || !['student', 'creator', 'admin', 'super_admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role',
          message: 'Role must be one of: student, creator, admin, super_admin'
        })
      }

      const user = await prisma.user.findUnique({
        where: { id }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User with the specified ID does not exist'
        })
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
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
        data: updatedUser,
        message: 'User role updated successfully'
      })
    } catch (error) {
      console.error('Error updating user role:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to update user role',
        message: 'Internal server error'
      })
    }
  }

  static async deleteUser(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID',
          message: 'User ID is required'
        })
      }

      const user = await prisma.user.findUnique({
        where: { id }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User with the specified ID does not exist'
        })
      }

      if (user.role === 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Cannot delete super admin',
          message: 'Super admin users cannot be deleted'
        })
      }

      // Delete user and all related data
      await prisma.user.delete({
        where: { id }
      })

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to delete user',
        message: 'Internal server error'
      })
    }
  }

  // Admin Management
  static async getAllAdmins(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { page = 1, limit = 10, search } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      const where: any = {
        role: { in: ['admin', 'super_admin'] }
      }

      if (search) {
        where.OR = [
          { email: { contains: String(search), mode: 'insensitive' } },
          { fullName: { contains: String(search), mode: 'insensitive' } }
        ]
      }

      const [admins, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                courses: true
              }
            }
          }
        }),
        prisma.user.count({ where })
      ])

      return res.status(200).json({
        success: true,
        data: admins,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Error fetching admins:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch admins',
        message: 'Internal server error'
      })
    }
  }

  static async promoteToAdmin(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID',
          message: 'User ID is required'
        })
      }

      const user = await prisma.user.findUnique({
        where: { id }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User with the specified ID does not exist'
        })
      }

      if (user.role === 'admin' || user.role === 'super_admin') {
        return res.status(400).json({
          success: false,
          error: 'User is already an admin',
          message: 'User already has admin privileges'
        })
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role: 'admin' },
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
        data: updatedUser,
        message: 'User promoted to admin successfully'
      })
    } catch (error) {
      console.error('Error promoting user to admin:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to promote user to admin',
        message: 'Internal server error'
      })
    }
  }

  static async demoteFromAdmin(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID',
          message: 'User ID is required'
        })
      }

      const user = await prisma.user.findUnique({
        where: { id }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User with the specified ID does not exist'
        })
      }

      if (user.role === 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Cannot demote super admin',
          message: 'Super admin users cannot be demoted'
        })
      }

      if (user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          error: 'User is not an admin',
          message: 'User does not have admin privileges'
        })
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role: 'student' },
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
        data: updatedUser,
        message: 'User demoted from admin successfully'
      })
    } catch (error) {
      console.error('Error demoting user from admin:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to demote user from admin',
        message: 'Internal server error'
      })
    }
  }

  // System Analytics
  static async getSystemAnalytics(req: NextApiRequest, res: NextApiResponse) {
    try {
      const [
        totalUsers,
        totalAdmins,
        totalCourses,
        totalTopics,
        totalPayments,
        totalAttempts,
        totalProgress,
        recentUsers,
        recentPayments,
        userRoleStats,
        paymentStats
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: { in: ['admin', 'super_admin'] } } }),
        prisma.course.count(),
        prisma.topic.count(),
        prisma.payment.count(),
        prisma.attempt.count(),
        prisma.progress.count(),
        prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            createdAt: true
          }
        }),
        prisma.payment.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                email: true,
                fullName: true
              }
            }
          }
        }),
        prisma.user.groupBy({
          by: ['role'],
          _count: {
            role: true
          }
        }),
        prisma.payment.groupBy({
          by: ['status'],
          _count: {
            status: true
          },
          _sum: {
            amount: true
          }
        })
      ])

      // Calculate revenue
      const totalRevenue = paymentStats
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + (p._sum.amount || 0), 0)

      // Calculate success rate
      const successfulPayments = paymentStats.find(p => p.status === 'success')?._count.status || 0
      const totalPaymentCount = paymentStats.reduce((sum, p) => sum + p._count.status, 0)
      const paymentSuccessRate = totalPaymentCount > 0 ? (successfulPayments / totalPaymentCount) * 100 : 0

      return res.status(200).json({
        success: true,
        data: {
          overview: {
            totalUsers,
            totalAdmins,
            totalCourses,
            totalTopics,
            totalPayments,
            totalAttempts,
            totalProgress,
            totalRevenue,
            paymentSuccessRate: Math.round(paymentSuccessRate * 100) / 100
          },
          recentActivity: {
            recentUsers,
            recentPayments
          },
          statistics: {
            userRoleStats,
            paymentStats
          }
        }
      })
    } catch (error) {
      console.error('Error fetching system analytics:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch system analytics',
        message: 'Internal server error'
      })
    }
  }

  // Revenue Analytics
  static async getRevenueAnalytics(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { period = '30' } = req.query // days
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - Number(period))

      const [
        totalRevenue,
        successfulPayments,
        failedPayments,
        pendingPayments,
        revenueByPeriod,
        topPayingUsers
      ] = await Promise.all([
        prisma.payment.aggregate({
          where: { status: 'success' },
          _sum: { amount: true }
        }),
        prisma.payment.count({ where: { status: 'success' } }),
        prisma.payment.count({ where: { status: 'failed' } }),
        prisma.payment.count({ where: { status: 'pending' } }),
        prisma.payment.findMany({
          where: {
            status: 'success',
            createdAt: { gte: daysAgo }
          },
          select: {
            amount: true,
            createdAt: true
          },
          orderBy: { createdAt: 'asc' }
        }),
        prisma.payment.groupBy({
          by: ['userId'],
          where: { status: 'success' },
          _sum: { amount: true },
          _count: { id: true },
          orderBy: { _sum: { amount: 'desc' } },
          take: 10
        })
      ])

      // Get user details for top paying users
      const topPayingUsersWithDetails = await Promise.all(
        topPayingUsers.map(async (payment) => {
          const user = await prisma.user.findUnique({
            where: { id: payment.userId },
            select: { email: true, fullName: true, role: true }
          })
          return {
            ...payment,
            user
          }
        })
      )

      return res.status(200).json({
        success: true,
        data: {
          totalRevenue: totalRevenue._sum.amount || 0,
          paymentCounts: {
            successful: successfulPayments,
            failed: failedPayments,
            pending: pendingPayments
          },
          revenueByPeriod,
          topPayingUsers: topPayingUsersWithDetails
        }
      })
    } catch (error) {
      console.error('Error fetching revenue analytics:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch revenue analytics',
        message: 'Internal server error'
      })
    }
  }

  // System Health Report
  static async getSystemHealthReport(req: NextApiRequest, res: NextApiResponse) {
    try {
      const [
        totalUsers,
        activeUsers,
        totalCourses,
        totalTopics,
        totalAttempts,
        successfulAttempts,
        totalPayments,
        successfulPayments,
        recentErrors
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            OR: [
              { updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
              { attempts: { some: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } } }
            ]
          }
        }),
        prisma.course.count(),
        prisma.topic.count(),
        prisma.attempt.count(),
        prisma.attempt.count({ where: { result: 'pass' } }),
        prisma.payment.count(),
        prisma.payment.count({ where: { status: 'success' } })
      ])

      // Calculate success rates
      const attemptSuccessRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0
      const paymentSuccessRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0

      // Mock recent errors (in a real system, you'd have an error logging system)
      const mockRecentErrors = [
        {
          id: '1',
          type: 'API_ERROR',
          message: 'Payment verification failed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          severity: 'medium'
        },
        {
          id: '2',
          type: 'AUTH_ERROR',
          message: 'Invalid token provided',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          severity: 'low'
        }
      ]

      return res.status(200).json({
        success: true,
        data: {
          systemMetrics: {
            totalUsers,
            activeUsers,
            totalCourses,
            totalTopics,
            totalAttempts,
            successfulAttempts,
            totalPayments,
            successfulPayments
          },
          successRates: {
            attemptSuccessRate: Math.round(attemptSuccessRate * 100) / 100,
            paymentSuccessRate: Math.round(paymentSuccessRate * 100) / 100
          },
          systemHealth: {
            status: 'healthy',
            uptime: '99.9%',
            lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          recentErrors: mockRecentErrors
        }
      })
    } catch (error) {
      console.error('Error fetching system health report:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch system health report',
        message: 'Internal server error'
      })
    }
  }
}

export default SuperAdminController 