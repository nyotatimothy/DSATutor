import type { NextApiRequest, NextApiResponse } from 'next'
import { PaystackService } from '@/services/paystack'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId, amount, currency = 'KES', description } = req.body

    if (!userId || !amount || !description) {
      return res.status(400).json({ 
        error: 'User ID, amount, and description are required' 
      })
    }

    const payment = await PaystackService.initiatePayment(
      userId,
      amount,
      currency,
      description
    )

    res.status(200).json({
      success: true,
      trackingId: payment.trackingId,
      redirectUrl: payment.redirectUrl
    })
  } catch (error: any) {
    console.error('Payment initiation error:', error)
    res.status(500).json({ error: 'Failed to initiate payment' })
  }
} 