import { NextApiRequest, NextApiResponse } from 'next';

export interface AccessControlConfig {
  requiredPlan?: 'free' | 'basic' | 'pro' | 'premium';
  requiredFeatures?: string[];
  maxProblemsPerMonth?: number;
  maxAIAssessments?: number;
}

export function checkAccessControl(config: AccessControlConfig) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    try {
      // Mock user subscription data - in real app, this would come from database
      const userSubscription = {
        planId: 'basic', // This would be fetched from user's subscription
        planName: 'Basic',
        status: 'active',
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
      };

      // Check if user has required plan
      if (config.requiredPlan) {
        const planHierarchy = ['free', 'basic', 'pro', 'premium'];
        const userPlanIndex = planHierarchy.indexOf(userSubscription.planId);
        const requiredPlanIndex = planHierarchy.indexOf(config.requiredPlan);

        if (userPlanIndex < requiredPlanIndex) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient subscription level',
            message: `This feature requires ${config.requiredPlan} plan or higher`,
            currentPlan: userSubscription.planId,
            requiredPlan: config.requiredPlan,
            upgradeUrl: '/pricing'
          });
        }
      }

      // Check usage limits
      if (config.maxProblemsPerMonth && userSubscription.usage.problemsSolved >= userSubscription.usage.problemsLimit) {
        return res.status(429).json({
          success: false,
          error: 'Usage limit exceeded',
          message: 'You have reached your monthly problem limit',
          currentUsage: userSubscription.usage.problemsSolved,
          limit: userSubscription.usage.problemsLimit,
          upgradeUrl: '/pricing'
        });
      }

      if (config.maxAIAssessments && userSubscription.usage.aiAssessments >= userSubscription.usage.aiAssessmentsLimit) {
        return res.status(429).json({
          success: false,
          error: 'AI assessment limit exceeded',
          message: 'You have reached your monthly AI assessment limit',
          currentUsage: userSubscription.usage.aiAssessments,
          limit: userSubscription.usage.aiAssessmentsLimit,
          upgradeUrl: '/pricing'
        });
      }

      // Check required features
      if (config.requiredFeatures) {
        for (const feature of config.requiredFeatures) {
          if (!userSubscription.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))) {
            return res.status(403).json({
              success: false,
              error: 'Feature not available',
              message: `Feature "${feature}" is not available in your current plan`,
              currentPlan: userSubscription.planId,
              upgradeUrl: '/pricing'
            });
          }
        }
      }

      // Add subscription info to request for use in handlers
      (req as any).userSubscription = userSubscription;
      
      next();
    } catch (error) {
      console.error('Access control error:', error);
      return res.status(500).json({
        success: false,
        error: 'Access control error',
        message: 'Failed to verify access permissions'
      });
    }
  };
}

// Helper functions for common access checks
export const accessControl = {
  // Free tier access
  free: checkAccessControl({ requiredPlan: 'free' }),
  
  // Basic tier access
  basic: checkAccessControl({ requiredPlan: 'basic' }),
  
  // Pro tier access
  pro: checkAccessControl({ requiredPlan: 'pro' }),
  
  // Premium tier access
  premium: checkAccessControl({ requiredPlan: 'premium' }),
  
  // AI assessment with limits
  aiAssessment: checkAccessControl({
    requiredPlan: 'basic',
    maxAIAssessments: 100
  }),
  
  // Advanced problems
  advancedProblems: checkAccessControl({
    requiredPlan: 'pro',
    requiredFeatures: ['Advanced problem categories']
  }),
  
  // Human tutoring
  humanTutoring: checkAccessControl({
    requiredPlan: 'premium',
    requiredFeatures: ['1-on-1 human tutoring sessions']
  }),
  
  // Custom configuration
  custom: (config: AccessControlConfig) => checkAccessControl(config)
};

// Utility function to get user's current plan
export function getUserPlan(req: NextApiRequest): string {
  return (req as any).userSubscription?.planId || 'free';
}

// Utility function to check if user has feature
export function hasFeature(req: NextApiRequest, feature: string): boolean {
  const subscription = (req as any).userSubscription;
  if (!subscription) return false;
  
  return subscription.features.some((f: string) => 
    f.toLowerCase().includes(feature.toLowerCase())
  );
}

// Utility function to get usage stats
export function getUsageStats(req: NextApiRequest) {
  return (req as any).userSubscription?.usage || {
    problemsSolved: 0,
    problemsLimit: 5,
    aiAssessments: 0,
    aiAssessmentsLimit: 10
  };
} 