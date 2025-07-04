import { NextApiRequest, NextApiResponse } from 'next'
import { PricingController } from '../../../controllers/pricingController'
import { authenticateToken, requireSuperAdmin } from '../../../middlewares/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Mock pricing plans data
    const pricingPlans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'USD',
        billingCycle: 'monthly',
        description: 'Perfect for getting started with DSA learning',
        features: [
          'Access to 5 basic problems',
          'Basic AI hints',
          'Community support',
          'Progress tracking',
          'Basic analytics'
        ],
        limitations: [
          'Limited to 5 problems per month',
          'No advanced AI features',
          'No priority support',
          'No custom learning paths'
        ],
        popular: false,
        recommended: false
      },
      {
        id: 'basic',
        name: 'Basic',
        price: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        description: 'Great for students and beginners',
        features: [
          'Access to 50+ problems',
          'AI-powered hints and explanations',
          'Detailed solution analysis',
          'Progress tracking and analytics',
          'Email support',
          'Learning path recommendations',
          'Practice tests'
        ],
        limitations: [
          'No advanced problem categories',
          'Limited AI assessment features',
          'No 1-on-1 tutoring'
        ],
        popular: true,
        recommended: false,
        savings: null
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 19.99,
        currency: 'USD',
        billingCycle: 'monthly',
        description: 'Perfect for serious learners and job seekers',
        features: [
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
        limitations: [
          'No 1-on-1 human tutoring',
          'No advanced interview prep'
        ],
        popular: false,
        recommended: true,
        savings: null
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 39.99,
        currency: 'USD',
        billingCycle: 'monthly',
        description: 'Complete preparation for top tech companies',
        features: [
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
        ],
        limitations: [],
        popular: false,
        recommended: false,
        savings: 'Most Popular'
      }
    ];

    // Add annual pricing with discounts
    const annualPlans = pricingPlans.map(plan => ({
      ...plan,
      id: `${plan.id}-annual`,
      billingCycle: 'annual',
      price: plan.price * 10, // 2 months free
      originalPrice: plan.price * 12,
      savings: plan.price > 0 ? `${Math.round(((plan.price * 12 - plan.price * 10) / (plan.price * 12)) * 100)}% off` : null
    }));

    const allPlans = [...pricingPlans, ...annualPlans];

    res.status(200).json({
      success: true,
      data: allPlans,
      currentUserPlan: 'free' // This would come from user's subscription
    });
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
} 