import { NextApiRequest, NextApiResponse } from 'next'
import { PaymentController } from '../../../controllers/paymentController'
import { authenticateToken } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { reference } = req.body

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Reference is required'
      })
    }

    // Verify payment with Paystack
    const verificationResponse = await verifyPaystackPayment(reference)

    if (verificationResponse.status) {
      const { data } = verificationResponse
      
      // Extract metadata
      const { planId, planName, userId } = data.metadata

      // Create or update subscription
      const subscription = await createOrUpdateSubscription({
        userId: parseInt(userId),
        planId,
        planName,
        paymentReference: reference,
        amount: data.amount / 100, // Convert from kobo
        status: 'active'
      })

      return res.status(200).json({
        success: true,
        message: 'Payment verified and subscription activated',
        data: {
          subscription,
          payment: {
            reference,
            amount: data.amount / 100,
            status: data.status
          }
        }
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      })
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

async function verifyPaystackPayment(reference: string) {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Paystack verification error:', error)
    throw error
  }
}

async function createOrUpdateSubscription(subscriptionData: {
  userId: number;
  planId: string;
  planName: string;
  paymentReference: string;
  amount: number;
  status: string;
}) {
  // Mock subscription creation/update
  // In real app, this would interact with your database
  const subscription = {
    id: `sub_${Date.now()}`,
    userId: subscriptionData.userId,
    planId: subscriptionData.planId,
    planName: subscriptionData.planName,
    status: subscriptionData.status,
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    cancelAtPeriodEnd: false,
    billingCycle: 'monthly',
    price: subscriptionData.amount,
    currency: 'USD',
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    paymentReference: subscriptionData.paymentReference,
    features: getPlanFeatures(subscriptionData.planId),
    usage: {
      problemsSolved: 0,
      problemsLimit: getProblemsLimit(subscriptionData.planId),
      aiAssessments: 0,
      aiAssessmentsLimit: getAIAssessmentsLimit(subscriptionData.planId)
    }
  }

  return subscription
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
 