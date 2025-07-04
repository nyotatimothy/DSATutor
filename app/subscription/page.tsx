'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Calendar, 
  BarChart3, 
  Settings, 
  Crown, 
  Zap, 
  Star, 
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface Subscription {
  id: string;
  userId: number;
  planId: string;
  planName: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  billingCycle: string;
  price: number;
  currency: string;
  nextBillingDate: string;
  features: string[];
  usage: {
    problemsSolved: number;
    problemsLimit: number;
    aiAssessments: number;
    aiAssessmentsLimit: number;
  };
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchSubscription();
  }, [user, router]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/pricing/subscriptions');
      const data = await response.json();
      
      if (data.success) {
        setSubscription(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setCancelling(true);
    try {
      const response = await fetch('/api/pricing/subscriptions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelAtPeriodEnd: true
        }),
      });

      if (response.ok) {
        await fetchSubscription(); // Refresh subscription data
        alert('Subscription will be cancelled at the end of the current period.');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Users className="h-6 w-6" />;
      case 'basic':
        return <Zap className="h-6 w-6" />;
      case 'pro':
        return <Star className="h-6 w-6" />;
      case 'premium':
        return <Crown className="h-6 w-6" />;
      default:
        return <Users className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading subscription details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Active Subscription</h1>
            <p className="text-gray-600 mb-8">You don't have an active subscription.</p>
            <Button onClick={handleUpgrade} className="bg-blue-600 hover:bg-blue-700">
              View Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const problemsProgress = (subscription.usage.problemsSolved / subscription.usage.problemsLimit) * 100;
  const aiProgress = (subscription.usage.aiAssessments / subscription.usage.aiAssessmentsLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Subscription Management
            </h1>
            <p className="text-xl text-gray-600">
              Manage your subscription and track your usage
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Current Plan Card */}
            <div className="lg:col-span-2">
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-800">
                        {getPlanIcon(subscription.planId)}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{subscription.planName} Plan</CardTitle>
                        <CardDescription>
                          ${subscription.price}/{subscription.billingCycle === 'monthly' ? 'month' : 'year'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Plan Features</h4>
                      <ul className="space-y-2">
                        {subscription.features.slice(0, 5).map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Billing Information</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between">
                          <span>Next billing date:</span>
                          <span>{new Date(subscription.nextBillingDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Billing cycle:</span>
                          <span className="capitalize">{subscription.billingCycle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span>${subscription.price} {subscription.currency}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Usage Statistics
                  </CardTitle>
                  <CardDescription>
                    Track your monthly usage and limits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Problems Solved</span>
                      <span className="text-sm text-gray-500">
                        {subscription.usage.problemsSolved} / {subscription.usage.problemsLimit}
                      </span>
                    </div>
                    <Progress value={problemsProgress} className="h-2" />
                    {problemsProgress >= 80 && (
                      <p className="text-xs text-yellow-600 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Approaching limit
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">AI Assessments</span>
                      <span className="text-sm text-gray-500">
                        {subscription.usage.aiAssessments} / {subscription.usage.aiAssessmentsLimit}
                      </span>
                    </div>
                    <Progress value={aiProgress} className="h-2" />
                    {aiProgress >= 80 && (
                      <p className="text-xs text-yellow-600 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Approaching limit
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleUpgrade}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                  
                  {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                    <Button 
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                      variant="outline"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                    </Button>
                  )}
                  
                  {subscription.cancelAtPeriodEnd && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Your subscription will be cancelled on{' '}
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span className="text-sm text-gray-700">•••• •••• •••• 4242</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Billing History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">January 2024</p>
                        <p className="text-xs text-gray-500">Basic Plan</p>
                      </div>
                      <span className="text-sm font-medium">$9.99</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">December 2023</p>
                        <p className="text-xs text-gray-500">Basic Plan</p>
                      </div>
                      <span className="text-sm font-medium">$9.99</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 