import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../lib/prisma'
import { AuthenticatedRequest } from '../middlewares/auth'

export class PricingController {
  // Subscription Plan Management
  static async createSubscriptionPlan(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { name, description, price, currency, duration, features, maxCourses, maxAssessments } = req.body

      const plan = await prisma.subscriptionPlan.create({
        data: {
          name,
          description,
          price,
          currency: currency || 'NGN',
          duration,
          features: JSON.stringify(features),
          maxCourses,
          maxAssessments,
          isActive: true
        }
      })

      return res.status(201).json({
        success: true,
        data: plan,
        message: 'Subscription plan created successfully'
      })
    } catch (error) {
      console.error('Error creating subscription plan:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to create subscription plan'
      })
    }
  }

  static async getSubscriptionPlans(req: NextApiRequest, res: NextApiResponse) {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
      })

      // Parse features JSON for each plan
      const plansWithFeatures = plans.map((plan: any) => ({
        ...plan,
        features: JSON.parse(plan.features)
      }))

      return res.status(200).json({
        success: true,
        data: plansWithFeatures
      })
    } catch (error) {
      console.error('Error fetching subscription plans:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription plans'
      })
    }
  }

  static async getSubscriptionPlan(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: id as string }
      })

      if (!plan) {
        return res.status(404).json({
          success: false,
          error: 'Subscription plan not found'
        })
      }

      return res.status(200).json({
        success: true,
        data: {
          ...plan,
          features: JSON.parse(plan.features)
        }
      })
    } catch (error) {
      console.error('Error fetching subscription plan:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription plan'
      })
    }
  }

  // User Subscription Management
  static async subscribeUser(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      const { planId } = req.body
      const userId = req.user!.id

      // Check if plan exists
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId }
      })

      if (!plan) {
        return res.status(404).json({
          success: false,
          error: 'Subscription plan not found'
        })
      }

      // Check if user already has an active subscription
      const existingSubscription = await prisma.userSubscription.findFirst({
        where: {
          userId,
          status: 'active'
        }
      })

      if (existingSubscription) {
        return res.status(400).json({
          success: false,
          error: 'User already has an active subscription'
        })
      }

      // Calculate subscription dates
      const startDate = new Date()
      const endDate = new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000)
      const nextBillingDate = new Date(endDate)

      const subscription = await prisma.userSubscription.create({
        data: {
          userId,
          planId,
          startDate,
          endDate,
          nextBillingDate,
          autoRenew: true
        },
        include: {
          plan: true
        }
      })

      return res.status(201).json({
        success: true,
        data: subscription,
        message: 'Subscription created successfully'
      })
    } catch (error) {
      console.error('Error creating user subscription:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to create subscription'
      })
    }
  }

  static async getUserSubscription(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      const userId = req.user!.id

      const subscription = await prisma.userSubscription.findFirst({
        where: {
          userId,
          status: 'active'
        },
        include: {
          plan: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: 'No active subscription found'
        })
      }

      return res.status(200).json({
        success: true,
        data: {
          ...subscription,
          plan: {
            ...subscription.plan,
            features: JSON.parse(subscription.plan.features)
          }
        }
      })
    } catch (error) {
      console.error('Error fetching user subscription:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription'
      })
    }
  }

  static async cancelSubscription(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      const userId = req.user!.id

      const subscription = await prisma.userSubscription.findFirst({
        where: {
          userId,
          status: 'active'
        }
      })

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: 'No active subscription found'
        })
      }

      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'cancelled',
          autoRenew: false
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully'
      })
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to cancel subscription'
      })
    }
  }

  // Course Access Management
  static async grantCourseAccess(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      const { courseId, accessType, expiresAt } = req.body
      const userId = req.user!.id

      // Check if course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      })

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        })
      }

      // Check if user already has access
      const existingAccess = await prisma.courseAccess.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        }
      })

      if (existingAccess) {
        return res.status(400).json({
          success: false,
          error: 'User already has access to this course'
        })
      }

      const courseAccess = await prisma.courseAccess.create({
        data: {
          userId,
          courseId,
          accessType,
          expiresAt: expiresAt ? new Date(expiresAt) : null
        },
        include: {
          course: true
        }
      })

      return res.status(201).json({
        success: true,
        data: courseAccess,
        message: 'Course access granted successfully'
      })
    } catch (error) {
      console.error('Error granting course access:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to grant course access'
      })
    }
  }

  static async checkCourseAccess(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      const { courseId } = req.query
      const userId = req.user!.id

      // Check if course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId as string }
      })

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        })
      }

      // If course is free, grant access
      if (!course.isPremium && !course.price) {
        return res.status(200).json({
          success: true,
          data: {
            hasAccess: true,
            accessType: 'free',
            course
          }
        })
      }

      // Check for course-specific access
      const courseAccess = await prisma.courseAccess.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: courseId as string
          }
        }
      })

      if (courseAccess) {
        const hasExpired = courseAccess.expiresAt && courseAccess.expiresAt < new Date()
        
        if (!hasExpired) {
          return res.status(200).json({
            success: true,
            data: {
              hasAccess: true,
              accessType: courseAccess.accessType,
              expiresAt: courseAccess.expiresAt,
              course
            }
          })
        }
      }

      // Check subscription access
      const subscription = await prisma.userSubscription.findFirst({
        where: {
          userId,
          status: 'active'
        },
        include: {
          plan: true
        }
      })

      if (subscription) {
        const planFeatures = JSON.parse(subscription.plan.features)
        const hasSubscriptionAccess = planFeatures.includes('premium_courses') || 
                                    planFeatures.includes('all_courses')

        if (hasSubscriptionAccess) {
          return res.status(200).json({
            success: true,
            data: {
              hasAccess: true,
              accessType: 'subscription',
              subscription: {
                plan: subscription.plan.name,
                expiresAt: subscription.endDate
              },
              course
            }
          })
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          hasAccess: false,
          course,
          message: 'Access required. Please purchase the course or subscribe to a plan.'
        }
      })
    } catch (error) {
      console.error('Error checking course access:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to check course access'
      })
    }
  }

  static async getUserCourseAccess(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      const userId = req.user!.id

      const courseAccess = await prisma.courseAccess.findMany({
        where: { userId },
        include: {
          course: true
        },
        orderBy: {
          grantedAt: 'desc'
        }
      })

      return res.status(200).json({
        success: true,
        data: courseAccess
      })
    } catch (error) {
      console.error('Error fetching user course access:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch course access'
      })
    }
  }

  // Pricing Analytics
  static async getPricingAnalytics(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      const user = req.user!

      // Only super admins can access pricing analytics
      if (user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Super admin privileges required.'
        })
      }

      const [
        totalSubscriptions,
        activeSubscriptions,
        totalRevenue,
        monthlyRevenue,
        popularPlans,
        courseAccessStats
      ] = await Promise.all([
        prisma.userSubscription.count(),
        prisma.userSubscription.count({
          where: { status: 'active' }
        }),
        prisma.payment.aggregate({
          where: { status: 'successful' },
          _sum: { amount: true }
        }),
        prisma.payment.aggregate({
          where: {
            status: 'successful',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          },
          _sum: { amount: true }
        }),
        prisma.userSubscription.groupBy({
          by: ['planId'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 5
        }),
        prisma.courseAccess.groupBy({
          by: ['accessType'],
          _count: { id: true }
        })
      ])

      return res.status(200).json({
        success: true,
        data: {
          totalSubscriptions,
          activeSubscriptions,
          totalRevenue: totalRevenue._sum.amount || 0,
          monthlyRevenue: monthlyRevenue._sum.amount || 0,
          popularPlans,
          courseAccessStats
        }
      })
    } catch (error) {
      console.error('Error fetching pricing analytics:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch pricing analytics'
      })
    }
  }
} 