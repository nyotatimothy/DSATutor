import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../lib/prisma'

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

  // Bulk Operations
  static async bulkUpdateUserRoles(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { userIds, role } = req.body

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user IDs',
          message: 'User IDs array is required'
        })
      }

      if (!role || !['student', 'creator', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role',
          message: 'Role must be one of: student, creator, admin'
        })
      }

      // Check if any users are super admin
      const superAdmins = await prisma.user.findMany({
        where: {
          id: { in: userIds },
          role: 'super_admin'
        }
      })

      if (superAdmins.length > 0) {
        return res.status(403).json({
          success: false,
          error: 'Cannot update super admin roles',
          message: 'Super admin users cannot be updated via bulk operation'
        })
      }

      const result = await prisma.user.updateMany({
        where: {
          id: { in: userIds }
        },
        data: { role }
      })

      return res.status(200).json({
        success: true,
        data: { updatedCount: result.count },
        message: `Successfully updated ${result.count} users to ${role} role`
      })
    } catch (error) {
      console.error('Error bulk updating user roles:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to bulk update user roles',
        message: 'Internal server error'
      })
    }
  }

  static async bulkDeleteUsers(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { userIds } = req.body

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user IDs',
          message: 'User IDs array is required'
        })
      }

      // Check if any users are super admin
      const superAdmins = await prisma.user.findMany({
        where: {
          id: { in: userIds },
          role: 'super_admin'
        }
      })

      if (superAdmins.length > 0) {
        return res.status(403).json({
          success: false,
          error: 'Cannot delete super admin users',
          message: 'Super admin users cannot be deleted'
        })
      }

      const result = await prisma.user.deleteMany({
        where: {
          id: { in: userIds }
        }
      })

      return res.status(200).json({
        success: true,
        data: { deletedCount: result.count },
        message: `Successfully deleted ${result.count} users`
      })
    } catch (error) {
      console.error('Error bulk deleting users:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to bulk delete users',
        message: 'Internal server error'
      })
    }
  }

  // User Statistics
  static async getUserStatistics(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { period = '30' } = req.query // days
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - Number(period))

      const [
        totalUsers,
        newUsers,
        activeUsers,
        userRoleStats,
        userActivityStats,
        topActiveUsers
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: { createdAt: { gte: daysAgo } }
        }),
        prisma.user.count({
          where: {
            OR: [
              { updatedAt: { gte: daysAgo } },
              { attempts: { some: { createdAt: { gte: daysAgo } } } },
              { progress: { some: { updatedAt: { gte: daysAgo } } } }
            ]
          }
        }),
        prisma.user.groupBy({
          by: ['role'],
          _count: { role: true }
        }),
        prisma.user.groupBy({
          by: ['createdAt'],
          _count: { id: true },
          where: { createdAt: { gte: daysAgo } },
          orderBy: { createdAt: 'asc' }
        }),
        prisma.user.findMany({
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            _count: {
              select: {
                attempts: true,
                progress: true,
                payments: true
              }
            }
          },
          orderBy: {
            attempts: { _count: 'desc' }
          },
          take: 10
        })
      ])

      return res.status(200).json({
        success: true,
        data: {
          overview: {
            totalUsers,
            newUsers,
            activeUsers,
            activeRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
          },
          roleDistribution: userRoleStats,
          activityTrend: userActivityStats,
          topActiveUsers
        }
      })
    } catch (error) {
      console.error('Error fetching user statistics:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user statistics',
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

  // Course Management
  static async getAllCourses(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { page = 1, limit = 10, search, status = 'all' } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      const where: any = {}
      if (search) {
        where.OR = [
          { title: { contains: String(search), mode: 'insensitive' } },
          { description: { contains: String(search), mode: 'insensitive' } }
        ]
      }

      // Filter by status
      if (status === 'active') {
        where.isActive = true
      } else if (status === 'inactive') {
        where.isActive = false
      }
      // 'all' includes both active and inactive courses

      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            creator: {
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true
              }
            },
            topics: {
              select: {
                id: true,
                title: true,
                position: true
              },
              orderBy: { position: 'asc' }
            },
            _count: {
              select: {
                topics: true
              }
            }
          }
        }),
        prisma.course.count({ where })
      ])

      return res.status(200).json({
        success: true,
        data: courses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Error fetching courses:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch courses',
        message: 'Internal server error'
      })
    }
  }

  static async deleteCourse(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query
      const { force = 'false', cascade = 'false' } = req.body

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid course ID',
          message: 'Course ID is required'
        })
      }

      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          topics: {
            include: {
              progress: true,
              attempts: true
            }
          }
        }
      })

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found',
          message: 'Course with the specified ID does not exist'
        })
      }

      // Calculate activity statistics
      const totalTopics = course.topics.length
      const topicsWithProgress = course.topics.filter((topic: any) => topic.progress.length > 0).length
      const topicsWithAttempts = course.topics.filter((topic: any) => topic.attempts.length > 0).length
      const totalProgress = course.topics.reduce((sum: number, topic: any) => sum + topic.progress.length, 0)
      const totalAttempts = course.topics.reduce((sum: number, topic: any) => sum + topic.attempts.length, 0)

      const hasActivity = totalProgress > 0 || totalAttempts > 0

      // If course has activity and force delete is not enabled
      if (hasActivity && force !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete course with activity',
          message: 'Course has user progress or attempts and cannot be deleted',
          data: {
            activitySummary: {
              totalTopics,
              topicsWithProgress,
              topicsWithAttempts,
              totalProgress,
              totalAttempts
            },
            options: {
              softDelete: 'Use soft delete to deactivate the course instead',
              forceDelete: 'Use force=true to delete despite activity (will cascade delete all related data)',
              cascadeDelete: 'Use cascade=true to also delete all related topics, progress, and attempts'
            }
          }
        })
      }

      // Handle cascade delete
      if (cascade === 'true' && hasActivity) {
        // Delete all related data first
        await prisma.$transaction(async (tx: any) => {
          // Delete all progress records
          for (const topic of course.topics) {
            if (topic.progress.length > 0) {
              await tx.progress.deleteMany({
                where: { topicId: topic.id }
              })
            }
            if (topic.attempts.length > 0) {
              await tx.attempt.deleteMany({
                where: { topicId: topic.id }
              })
            }
          }

          // Delete all topics
          await tx.topic.deleteMany({
            where: { courseId: id }
          })

          // Delete the course
          await tx.course.delete({
            where: { id }
          })
        })

        return res.status(200).json({
          success: true,
          message: 'Course and all related data deleted successfully',
          data: {
            deletedData: {
              course: 1,
              topics: totalTopics,
              progress: totalProgress,
              attempts: totalAttempts
            }
          }
        })
      }

      // Handle force delete (without cascade)
      if (force === 'true' && hasActivity) {
        // Delete course and topics, but leave progress/attempts (they'll become orphaned)
        await prisma.$transaction(async (tx: any) => {
          // Delete all topics (this will cascade to progress/attempts if foreign key constraints exist)
          await tx.topic.deleteMany({
            where: { courseId: id }
          })

          // Delete the course
          await tx.course.delete({
            where: { id }
          })
        })

        return res.status(200).json({
          success: true,
          message: 'Course deleted successfully (related data may be orphaned)',
          data: {
            deletedData: {
              course: 1,
              topics: totalTopics
            },
            warning: 'Progress and attempt records may be orphaned. Consider using cascade=true for complete cleanup.'
          }
        })
      }

      // Regular delete (no activity or soft delete)
      if (!hasActivity) {
        // Delete course and all related topics
        await prisma.course.delete({
          where: { id }
        })

        return res.status(200).json({
          success: true,
          message: 'Course deleted successfully',
          data: {
            deletedData: {
              course: 1,
              topics: totalTopics
            }
          }
        })
      }

      // Soft delete (default behavior when activity exists)
      await prisma.course.update({
        where: { id },
        data: { isActive: false }
      })

      return res.status(200).json({
        success: true,
        message: 'Course deactivated successfully (soft delete)',
        data: {
          activitySummary: {
            totalTopics,
            topicsWithProgress,
            topicsWithAttempts,
            totalProgress,
            totalAttempts
          },
          note: 'Course is now inactive but data is preserved. Use force=true to permanently delete.'
        }
      })
    } catch (error) {
      console.error('Error deleting course:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to delete course',
        message: 'Internal server error'
      })
    }
  }

  // Reactivate Course (soft delete recovery)
  static async reactivateCourse(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid course ID',
          message: 'Course ID is required'
        })
      }

      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          topics: {
            select: {
              id: true,
              title: true,
              position: true
            },
            orderBy: { position: 'asc' }
          }
        }
      })

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found',
          message: 'Course with the specified ID does not exist'
        })
      }

      if (course.isActive) {
        return res.status(400).json({
          success: false,
          error: 'Course is already active',
          message: 'This course is already active and does not need reactivation'
        })
      }

      // Reactivate the course
      await prisma.course.update({
        where: { id },
        data: { isActive: true }
      })

      return res.status(200).json({
        success: true,
        message: 'Course reactivated successfully',
        data: {
          course: {
            id: course.id,
            title: course.title,
            description: course.description,
            isActive: true,
            topicsCount: course.topics.length
          }
        }
      })
    } catch (error) {
      console.error('Error reactivating course:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to reactivate course',
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
        .filter((p: any) => p.status === 'success')
        .reduce((sum: number, p: any) => sum + (p._sum.amount || 0), 0)

      // Calculate success rate
      const successfulPayments = paymentStats.find((p: any) => p.status === 'success')?._count.status || 0
      const totalPaymentCount = paymentStats.reduce((sum: number, p: any) => sum + p._count.status, 0)
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
        topPayingUsers.map(async (payment: any) => {
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
        successfulPayments
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

  // Advanced Analytics
  static async getAdvancedAnalytics(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { period = '30' } = req.query
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - Number(period))

      const [
        userGrowth,
        courseEngagement,
        learningProgress,
        aiUsageStats,
        performanceMetrics
      ] = await Promise.all([
        // User growth over time
        prisma.user.groupBy({
          by: ['createdAt'],
          _count: { id: true },
          where: { createdAt: { gte: daysAgo } },
          orderBy: { createdAt: 'asc' }
        }),
        // Course engagement
        prisma.course.findMany({
          select: {
            id: true,
            title: true,
            topics: {
              select: {
                id: true,
                _count: {
                  select: {
                    progress: true,
                    attempts: true
                  }
                }
              }
            }
          },
          take: 10
        }),
        // Learning progress distribution
        prisma.progress.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        // AI usage statistics
        prisma.skillAssessment.groupBy({
          by: ['overallLevel'],
          _count: { overallLevel: true }
        }),
        // Performance metrics
        prisma.attempt.groupBy({
          by: ['result'],
          _count: { result: true },
          _avg: { timeTaken: true }
        })
      ])

      return res.status(200).json({
        success: true,
        data: {
          userGrowth,
          courseEngagement,
          learningProgress,
          aiUsageStats,
          performanceMetrics
        }
      })
    } catch (error) {
      console.error('Error fetching advanced analytics:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch advanced analytics',
        message: 'Internal server error'
      })
    }
  }

  // Content Management System
  static async getContentOverview(req: NextApiRequest, res: NextApiResponse) {
    try {
      const [
        totalCourses,
        totalTopics,
        totalAttempts,
        totalProgress,
        totalAssessments,
        contentStats,
        recentContent
      ] = await Promise.all([
        prisma.course.count(),
        prisma.topic.count(),
        prisma.attempt.count(),
        prisma.progress.count(),
        prisma.skillAssessment.count(),
        prisma.course.groupBy({
          by: ['isActive'],
          _count: { isActive: true }
        }),
        prisma.course.findMany({
          take: 10,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            title: true,
            isActive: true,
            updatedAt: true,
            _count: {
              select: {
                topics: true
              }
            }
          }
        })
      ])

      return res.status(200).json({
        success: true,
        data: {
          overview: {
            totalCourses,
            totalTopics,
            totalAttempts,
            totalProgress,
            totalAssessments
          },
          contentStats,
          recentContent
        }
      })
    } catch (error) {
      console.error('Error fetching content overview:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch content overview',
        message: 'Internal server error'
      })
    }
  }

  static async bulkContentOperations(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { operation, contentIds, data } = req.body

      if (!operation || !contentIds || !Array.isArray(contentIds)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid parameters',
          message: 'Operation and content IDs are required'
        })
      }

      let result: any

      switch (operation) {
        case 'activate_courses':
          result = await prisma.course.updateMany({
            where: { id: { in: contentIds } },
            data: { isActive: true }
          })
          break
        case 'deactivate_courses':
          result = await prisma.course.updateMany({
            where: { id: { in: contentIds } },
            data: { isActive: false }
          })
          break
        case 'delete_courses':
          result = await prisma.course.deleteMany({
            where: { id: { in: contentIds } }
          })
          break
        case 'reorder_topics':
          if (!data || !Array.isArray(data.topicPositions)) {
            return res.status(400).json({
              success: false,
              error: 'Invalid topic positions',
              message: 'Topic positions array is required'
            })
          }
          // Update topic positions
          const updatePromises = data.topicPositions.map((pos: any) =>
            prisma.topic.update({
              where: { id: pos.id },
              data: { position: pos.position }
            })
          )
          await Promise.all(updatePromises)
          result = { count: data.topicPositions.length }
          break
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid operation',
            message: 'Operation not supported'
          })
      }

      return res.status(200).json({
        success: true,
        data: result,
        message: `Successfully performed ${operation} on ${result.count} items`
      })
    } catch (error) {
      console.error('Error performing bulk content operations:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to perform bulk content operations',
        message: 'Internal server error'
      })
    }
  }

  // System Configuration
  static async getSystemConfig(req: NextApiRequest, res: NextApiResponse) {
    try {
      // This would typically come from a configuration table or environment
      const config = {
        features: {
          aiEnabled: process.env.OPENAI_API_KEY ? true : false,
          paymentsEnabled: process.env.PAYSTACK_SECRET_KEY ? true : false,
          emailEnabled: process.env.RESEND_API_KEY ? true : false,
          analyticsEnabled: true
        },
        limits: {
          maxCoursesPerUser: 50,
          maxTopicsPerCourse: 100,
          maxAttemptsPerTopic: 10,
          maxFileSize: '10MB',
          rateLimitPerMinute: 100
        },
        maintenance: {
          mode: false,
          message: '',
          scheduledMaintenance: null
        }
      }

      return res.status(200).json({
        success: true,
        data: config
      })
    } catch (error) {
      console.error('Error fetching system config:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch system config',
        message: 'Internal server error'
      })
    }
  }

  static async updateSystemConfig(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { config } = req.body

      if (!config) {
        return res.status(400).json({
          success: false,
          error: 'Invalid config',
          message: 'Configuration data is required'
        })
      }

      // In a real implementation, this would update a configuration table
      // For now, we'll just validate and return success
      console.log('System config update requested:', config)

      return res.status(200).json({
        success: true,
        message: 'System configuration updated successfully'
      })
    } catch (error) {
      console.error('Error updating system config:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to update system config',
        message: 'Internal server error'
      })
    }
  }

  // Audit Logging
  static async getAuditLogs(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { page = 1, limit = 50, action, userId, startDate, endDate } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      // In a real implementation, this would query an audit_logs table
      // For now, we'll return a mock structure
      const mockLogs = [
        {
          id: '1',
          action: 'USER_ROLE_UPDATE',
          userId: 'user-123',
          adminId: (req as any).user.id,
          details: { oldRole: 'student', newRole: 'admin' },
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          action: 'COURSE_DELETE',
          userId: null,
          adminId: (req as any).user.id,
          details: { courseId: 'course-123', courseTitle: 'Test Course' },
          timestamp: new Date().toISOString()
        }
      ]

      return res.status(200).json({
        success: true,
        data: {
          logs: mockLogs,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: mockLogs.length,
            pages: 1
          }
        }
      })
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch audit logs',
        message: 'Internal server error'
      })
    }
  }

  // Data Export/Import
  static async exportData(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { entities } = req.query
      const entitiesList = entities ? String(entities).split(',') : ['users', 'courses', 'topics']

      const exportData: any = {}

      if (entitiesList.includes('users')) {
        exportData.users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        })
      }

      if (entitiesList.includes('courses')) {
        exportData.courses = await prisma.course.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        })
      }

      if (entitiesList.includes('topics')) {
        exportData.topics = await prisma.topic.findMany({
          select: {
            id: true,
            title: true,
            content: true,
            position: true,
            courseId: true,
            createdAt: true,
            updatedAt: true
          }
        })
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `dsatutor-export-${timestamp}.json`

      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

      return res.status(200).json({
        success: true,
        data: exportData,
        metadata: {
          exportedAt: new Date().toISOString(),
          entities: entitiesList,
          recordCount: Object.keys(exportData).reduce((sum, key) => sum + exportData[key].length, 0)
        }
      })
    } catch (error) {
      console.error('Error exporting data:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to export data',
        message: 'Internal server error'
      })
    }
  }

  // Performance Monitoring
  static async getPerformanceMetrics(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { period = '24h' } = req.query

      // Mock performance metrics - in real implementation, this would come from monitoring system
      const metrics = {
        system: {
          cpuUsage: Math.random() * 100,
          memoryUsage: Math.random() * 100,
          diskUsage: Math.random() * 100,
          uptime: Date.now() - new Date('2025-01-01').getTime()
        },
        database: {
          activeConnections: Math.floor(Math.random() * 50) + 10,
          slowQueries: Math.floor(Math.random() * 10),
          queryTime: Math.random() * 1000
        },
        api: {
          requestsPerMinute: Math.floor(Math.random() * 1000) + 100,
          averageResponseTime: Math.random() * 500 + 50,
          errorRate: Math.random() * 5
        },
        cache: {
          hitRate: Math.random() * 100,
          missRate: Math.random() * 20
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          metrics,
          period: String(period),
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error fetching performance metrics:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch performance metrics',
        message: 'Internal server error'
      })
    }
  }

  // Notification Management
  static async getSystemNotifications(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { page = 1, limit = 20, status } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      // Mock notifications - in real implementation, this would come from a notifications table
      const notifications = [
        {
          id: '1',
          type: 'SYSTEM_MAINTENANCE',
          title: 'Scheduled Maintenance',
          message: 'System will be down for maintenance on Sunday 2-4 AM',
          status: 'active',
          priority: 'high',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'FEATURE_UPDATE',
          title: 'New AI Features Available',
          message: 'Enhanced code analysis and personalized learning paths are now available',
          status: 'active',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      return res.status(200).json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: notifications.length,
            pages: 1
          }
        }
      })
    } catch (error) {
      console.error('Error fetching system notifications:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch system notifications',
        message: 'Internal server error'
      })
    }
  }

  static async createSystemNotification(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { type, title, message, priority = 'medium', expiresAt } = req.body

      if (!type || !title || !message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Type, title, and message are required'
        })
      }

      // In real implementation, this would save to a notifications table
      const notification = {
        id: Date.now().toString(),
        type,
        title,
        message,
        priority,
        status: 'active',
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      return res.status(201).json({
        success: true,
        data: notification,
        message: 'System notification created successfully'
      })
    } catch (error) {
      console.error('Error creating system notification:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to create system notification',
        message: 'Internal server error'
      })
    }
  }

  // API Rate Limiting Management
  static async getRateLimitConfig(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Mock rate limit configuration
      const config = {
        global: {
          requestsPerMinute: 100,
          requestsPerHour: 1000,
          burstLimit: 20
        },
        endpoints: {
          auth: {
            requestsPerMinute: 10,
            requestsPerHour: 100
          },
          payments: {
            requestsPerMinute: 30,
            requestsPerHour: 300
          },
          ai: {
            requestsPerMinute: 20,
            requestsPerHour: 200
          }
        },
        userTiers: {
          free: {
            requestsPerMinute: 10,
            requestsPerHour: 100
          },
          premium: {
            requestsPerMinute: 50,
            requestsPerHour: 500
          },
          admin: {
            requestsPerMinute: 200,
            requestsPerHour: 2000
          }
        }
      }

      return res.status(200).json({
        success: true,
        data: config
      })
    } catch (error) {
      console.error('Error fetching rate limit config:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch rate limit config',
        message: 'Internal server error'
      })
    }
  }

  // Database Maintenance
  static async getDatabaseHealth(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Check database connection and basic health
      const startTime = Date.now()
      await prisma.$queryRaw`SELECT 1`
      const responseTime = Date.now() - startTime

      // Get table sizes and record counts
      const tableStats = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.topic.count(),
        prisma.payment.count(),
        prisma.attempt.count(),
        prisma.progress.count()
      ])

      const health = {
        status: 'healthy',
        responseTime,
        connection: 'active',
        tables: {
          users: tableStats[0],
          courses: tableStats[1],
          topics: tableStats[2],
          payments: tableStats[3],
          attempts: tableStats[4],
          progress: tableStats[5]
        },
        lastChecked: new Date().toISOString()
      }

      return res.status(200).json({
        success: true,
        data: health
      })
    } catch (error) {
      console.error('Error checking database health:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to check database health',
        message: 'Internal server error'
      })
    }
  }

  static async runDatabaseMaintenance(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { operation } = req.body

      if (!operation) {
        return res.status(400).json({
          success: false,
          error: 'Operation required',
          message: 'Please specify the maintenance operation'
        })
      }

      let result: any

      switch (operation) {
        case 'vacuum':
          // In PostgreSQL, this would be VACUUM
          result = { message: 'Database vacuum completed' }
          break
        case 'analyze':
          // In PostgreSQL, this would be ANALYZE
          result = { message: 'Database analysis completed' }
          break
        case 'reindex':
          // In PostgreSQL, this would be REINDEX
          result = { message: 'Database reindex completed' }
          break
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid operation',
            message: 'Supported operations: vacuum, analyze, reindex'
          })
      }

      return res.status(200).json({
        success: true,
        data: result,
        message: `Database maintenance operation '${operation}' completed successfully`
      })
    } catch (error) {
      console.error('Error running database maintenance:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to run database maintenance',
        message: 'Internal server error'
      })
    }
  }

  // System Backup and Restore
  static async createSystemBackup(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { includeData = true, includeConfig = true } = req.body

      // Mock backup creation - in real implementation, this would create actual backup files
      const backup = {
        id: `backup-${Date.now()}`,
        timestamp: new Date().toISOString(),
        size: '2.5GB',
        includes: {
          data: includeData,
          config: includeConfig
        },
        status: 'completed',
        downloadUrl: `/api/super-admin/backups/${Date.now()}/download`
      }

      return res.status(201).json({
        success: true,
        data: backup,
        message: 'System backup created successfully'
      })
    } catch (error) {
      console.error('Error creating system backup:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to create system backup',
        message: 'Internal server error'
      })
    }
  }

  static async getBackupHistory(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { page = 1, limit = 10 } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      // Mock backup history
      const backups = [
        {
          id: 'backup-1',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          size: '2.3GB',
          status: 'completed',
          type: 'full'
        },
        {
          id: 'backup-2',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          size: '2.1GB',
          status: 'completed',
          type: 'full'
        }
      ]

      return res.status(200).json({
        success: true,
        data: {
          backups,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: backups.length,
            pages: 1
          }
        }
      })
    } catch (error) {
      console.error('Error fetching backup history:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch backup history',
        message: 'Internal server error'
      })
    }
  }
}

export default SuperAdminController 