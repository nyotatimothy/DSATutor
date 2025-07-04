import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateToken } from '../../../middlewares/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Apply authentication middleware
  return authenticateToken(req as any, res, async () => {
    try {
      const { planId, email, amount, callbackUrl } = req.body;

      if (!planId || !email || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Plan ID, email, and amount are required'
        });
      }

      // Get plan details
      const planDetails = getPlanDetails(planId);
      if (!planDetails) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan ID'
        });
      }

      // Initialize Paystack payment
      const paystackResponse = await initializePaystackPayment({
        email,
        amount: amount * 100, // Convert to kobo (smallest currency unit)
        callback_url: callbackUrl,
        metadata: {
          planId,
          planName: planDetails.name,
          userId: (req as any).user?.id
        }
      });

      if (paystackResponse.status) {
        return res.status(200).json({
          success: true,
          message: 'Payment initialized successfully',
          data: {
            authorization_url: paystackResponse.data.authorization_url,
            reference: paystackResponse.data.reference,
            access_code: paystackResponse.data.access_code
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: paystackResponse.message || 'Failed to initialize payment'
        });
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });
}

async function initializePaystackPayment(paymentData: {
  email: string;
  amount: number;
  callback_url: string;
  metadata: any;
}) {
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: paymentData.email,
        amount: paymentData.amount,
        callback_url: paymentData.callback_url,
        metadata: paymentData.metadata,
        currency: 'NGN'
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Paystack API error:', error);
    throw error;
  }
}

function getPlanDetails(planId: string) {
  const plans = {
    'free': { name: 'Free', price: 0 },
    'basic': { name: 'Basic', price: 9.99 },
    'pro': { name: 'Pro', price: 19.99 },
    'premium': { name: 'Premium', price: 39.99 }
  };
  
  return plans[planId as keyof typeof plans];
} 