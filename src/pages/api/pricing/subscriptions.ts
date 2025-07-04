import { NextApiRequest, NextApiResponse } from 'next'
import { PricingController } from '../../../controllers/pricingController'
import { authenticateToken } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGetSubscription(req, res)
      
      case 'POST':
        return handleCreateSubscription(req, res)
      
      case 'PUT':
        return handleUpdateSubscription(req, res)
      
      case 'DELETE':
        return handleCancelSubscription(req, res)
      
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: 'Only GET, POST, PUT, DELETE methods are allowed'
        })
    }
  } catch (error) {
    console.error('Error handling subscription:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}

async function handleGetSubscription(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Mock user subscription data
    const mockSubscription = {
      id: 'sub_123456789',
      userId: 1,
      planId: 'basic',
      planName: 'Basic',
      status: 'active', // active, cancelled, expired, past_due
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      billingCycle: 'monthly',
      price: 9.99,
      currency: 'USD',
      nextBillingDate: '2024-02-01T00:00:00Z',
      features: [
        'Access to 50+ problems',
        'AI-powered hints and explanations',
        'Detailed solution analysis',
        'Progress tracking and analytics',
        'Email support',
        'Learning path recommendations',
        'Practice tests'
      ],
      usage: {
        problemsSolved: 23,
        problemsLimit: 50,
        aiAssessments: 15,
        aiAssessmentsLimit: 100
      }
    }

    res.status(200).json({
      success: true,
      data: mockSubscription
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}

async function handleCreateSubscription(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { planId, paymentMethodId, billingCycle = 'monthly' } = req.body

    if (!planId || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID and payment method are required'
      })
    }

    // Mock subscription creation
    const newSubscription = {
      id: `sub_${Date.now()}`,
      userId: 1,
      planId,
      planName: getPlanName(planId),
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: getNextBillingDate(billingCycle),
      cancelAtPeriodEnd: false,
      billingCycle,
      price: getPlanPrice(planId, billingCycle),
      currency: 'USD',
      nextBillingDate: getNextBillingDate(billingCycle),
      features: getPlanFeatures(planId),
      usage: {
        problemsSolved: 0,
        problemsLimit: getProblemsLimit(planId),
        aiAssessments: 0,
        aiAssessmentsLimit: getAIAssessmentsLimit(planId)
      }
    }

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: newSubscription
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}

async function handleUpdateSubscription(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { planId, billingCycle } = req.body

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      })
    }

    // Mock subscription update
    const updatedSubscription = {
      id: 'sub_123456789',
      userId: 1,
      planId,
      planName: getPlanName(planId),
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: getNextBillingDate(billingCycle || 'monthly'),
      cancelAtPeriodEnd: false,
      billingCycle: billingCycle || 'monthly',
      price: getPlanPrice(planId, billingCycle || 'monthly'),
      currency: 'USD',
      nextBillingDate: getNextBillingDate(billingCycle || 'monthly'),
      features: getPlanFeatures(planId),
      usage: {
        problemsSolved: 23,
        problemsLimit: getProblemsLimit(planId),
        aiAssessments: 15,
        aiAssessmentsLimit: getAIAssessmentsLimit(planId)
      }
    }

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: updatedSubscription
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}

async function handleCancelSubscription(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { cancelAtPeriodEnd = true } = req.body

    // Mock subscription cancellation
    const cancelledSubscription = {
      id: 'sub_123456789',
      userId: 1,
      planId: 'basic',
      planName: 'Basic',
      status: cancelAtPeriodEnd ? 'active' : 'cancelled',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      cancelAtPeriodEnd,
      billingCycle: 'monthly',
      price: 9.99,
      currency: 'USD',
      nextBillingDate: cancelAtPeriodEnd ? '2024-02-01T00:00:00Z' : null,
      features: getPlanFeatures('basic'),
      usage: {
        problemsSolved: 23,
        problemsLimit: 50,
        aiAssessments: 15,
        aiAssessmentsLimit: 100
      }
    }

    res.status(200).json({
      success: true,
      message: cancelAtPeriodEnd 
        ? 'Subscription will be cancelled at the end of the current period'
        : 'Subscription cancelled immediately',
      data: cancelledSubscription
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}

// Helper functions
function getPlanName(planId: string): string {
  const planNames: { [key: string]: string } = {
    'free': 'Free',
    'basic': 'Basic',
    'pro': 'Pro',
    'premium': 'Premium'
  }
  return planNames[planId] || 'Unknown'
}

function getPlanPrice(planId: string, billingCycle: string): number {
  const prices: { [key: string]: { [key: string]: number } } = {
    'free': { monthly: 0, annual: 0 },
    'basic': { monthly: 9.99, annual: 99.90 },
    'pro': { monthly: 19.99, annual: 199.90 },
    'premium': { monthly: 39.99, annual: 399.90 }
  }
  return prices[planId]?.[billingCycle] || 0
}

function getPlanFeatures(planId: string): string[] {
  const features: { [key: string]: string[] } = {
    'free': [
      'Access to 5 basic problems',
      'Basic AI hints',
      'Community support',
      'Progress tracking',
      'Basic analytics'
    ],
    'basic': [
      'Access to 50+ problems',
      'AI-powered hints and explanations',
      'Detailed solution analysis',
      'Progress tracking and analytics',
      'Email support',
      'Learning path recommendations',
      'Practice tests'
    ],
    'pro': [
      'Access to 200+ problems',
      'Advanced AI assessment and feedback',
      'Personalized learning paths',
      'Mock interviews with AI',
      'Detailed performance analytics',
      'Priority email support',
      'Advanced problem categories',
      'Code optimization suggestions',
      'Time complexity analysis',
      'Custom practice sets'
    ],
    'premium': [
      'Access to 500+ problems',
      'All AI features including advanced assessment',
      '1-on-1 human tutoring sessions',
      'Mock interviews with real engineers',
      'Advanced interview prep materials',
      'Company-specific question banks',
      'Resume review and optimization',
      'Career coaching sessions',
      'Priority phone support',
      'Custom learning curriculum',
      'Performance benchmarking',
      'Advanced analytics and insights'
    ]
  }
  return features[planId] || []
}

function getProblemsLimit(planId: string): number {
  const limits: { [key: string]: number } = {
    'free': 5,
    'basic': 50,
    'pro': 200,
    'premium': 500
  }
  return limits[planId] || 5
}

function getAIAssessmentsLimit(planId: string): number {
  const limits: { [key: string]: number } = {
    'free': 10,
    'basic': 100,
    'pro': 500,
    'premium': 1000
  }
  return limits[planId] || 10
}

function getNextBillingDate(billingCycle: string): string {
  const now = new Date()
  if (billingCycle === 'annual') {
    now.setFullYear(now.getFullYear() + 1)
  } else {
    now.setMonth(now.getMonth() + 1)
  }
  return now.toISOString()
} 