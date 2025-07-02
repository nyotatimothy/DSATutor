import type { NextApiRequest, NextApiResponse } from 'next'
import { PaystackService } from '@/services/paystack'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { tracking_id } = req.query

    if (!tracking_id || typeof tracking_id !== 'string') {
      return res.status(400).json({ error: 'Tracking ID is required' })
    }

    const status = await PaystackService.getPaymentStatus(tracking_id)

    res.status(200).json({
      success: true,
      trackingId: tracking_id,
      status: status.status,
      details: status.details
    })
  } catch (error: any) {
    console.error('Payment status error:', error)
    res.status(500).json({ error: 'Failed to get payment status' })
  }
} 